"use strict";
import { logVerbose } from "../../bundler/context.js";
import {
  deploymentNameFromAdminKeyOrCrash,
  deploymentTypeFromAdminKey,
  getConfiguredDeploymentFromEnvVar,
  getTeamAndProjectFromPreviewAdminKey,
  isPreviewDeployKey
} from "./deployment.js";
import { buildEnvironment } from "./envvars.js";
import { checkAuthorization, performLogin } from "./login.js";
import {
  CONVEX_DEPLOY_KEY_ENV_VAR_NAME,
  bigBrainAPI,
  bigBrainAPIMaybeThrows,
  getAuthHeaderForBigBrain,
  getConfiguredDeploymentName,
  getConfiguredDeploymentOrCrash,
  readAdminKeyFromEnvVar
} from "./utils/utils.js";
export async function createProject(ctx, {
  teamSlug: selectedTeamSlug,
  projectName
}) {
  const provisioningArgs = {
    team: selectedTeamSlug,
    projectName,
    // TODO: Consider allowing projects with no deployments, or consider switching
    // to provisioning prod on creation.
    deploymentType: "dev",
    backendVersionOverride: process.env.CONVEX_BACKEND_VERSION_OVERRIDE
  };
  const data = await bigBrainAPI({
    ctx,
    method: "POST",
    url: "create_project",
    data: provisioningArgs
  });
  const { projectSlug, teamSlug, projectsRemaining } = data;
  if (projectSlug === void 0 || teamSlug === void 0 || projectsRemaining === void 0) {
    const error = "Unexpected response during provisioning: " + JSON.stringify(data);
    return await ctx.crash({
      exitCode: 1,
      errorType: "transient",
      errForSentry: error,
      printedMessage: error
    });
  }
  return {
    projectSlug,
    teamSlug,
    projectsRemaining
  };
}
export async function createProjectProvisioningDevOrProd(ctx, {
  teamSlug: selectedTeamSlug,
  projectName
}, firstDeploymentType) {
  const provisioningArgs = {
    team: selectedTeamSlug,
    projectName,
    deploymentType: firstDeploymentType,
    backendVersionOverride: process.env.CONVEX_BACKEND_VERSION_OVERRIDE
  };
  const data = await bigBrainAPI({
    ctx,
    method: "POST",
    url: "create_project",
    data: provisioningArgs
  });
  const {
    projectSlug,
    teamSlug,
    deploymentName,
    adminKey,
    projectsRemaining,
    prodUrl: url
  } = data;
  if (projectSlug === void 0 || teamSlug === void 0 || deploymentName === void 0 || url === void 0 || adminKey === void 0 || projectsRemaining === void 0) {
    const error = "Unexpected response during provisioning: " + JSON.stringify(data);
    return await ctx.crash({
      exitCode: 1,
      errorType: "transient",
      errForSentry: error,
      printedMessage: error
    });
  }
  return {
    projectSlug,
    teamSlug,
    deploymentName,
    url,
    adminKey,
    projectsRemaining
  };
}
export async function fetchDeploymentCredentialsForName(ctx, deploymentName, deploymentType) {
  let data;
  try {
    data = await bigBrainAPIMaybeThrows({
      ctx,
      method: "POST",
      url: "deployment/authorize_for_name",
      data: {
        deploymentName,
        deploymentType
      }
    });
  } catch (error) {
    return { error };
  }
  const adminKey = data.adminKey;
  const url = data.url;
  const resultDeploymentType = data.deploymentType;
  if (adminKey === void 0 || url === void 0) {
    const msg = "Unknown error during authorization: " + JSON.stringify(data);
    return await ctx.crash({
      exitCode: 1,
      errorType: "transient",
      errForSentry: new Error(msg),
      printedMessage: msg
    });
  }
  return {
    deploymentName,
    adminKey,
    url,
    deploymentType: resultDeploymentType
  };
}
export function storeAdminKeyEnvVar(adminKeyOption) {
  if (adminKeyOption) {
    process.env[CONVEX_DEPLOY_KEY_ENV_VAR_NAME] = adminKeyOption;
  }
}
export function deploymentSelectionFromOptions(options) {
  storeAdminKeyEnvVar(options.adminKey);
  const adminKey = readAdminKeyFromEnvVar();
  if (options.url !== void 0) {
    if (adminKey) {
      return { kind: "urlWithAdminKey", url: options.url, adminKey };
    }
    return { kind: "urlWithLogin", url: options.url };
  }
  if (options.previewName !== void 0) {
    return { kind: "previewName", previewName: options.previewName };
  }
  if (options.deploymentName !== void 0) {
    return { kind: "deploymentName", deploymentName: options.deploymentName };
  }
  if (adminKey !== void 0) {
    return { kind: "deployKey" };
  }
  return { kind: options.prod === true ? "ownProd" : "ownDev" };
}
export async function fetchDeploymentCredentialsWithinCurrentProject(ctx, deploymentSelection) {
  if (deploymentSelection.kind === "urlWithAdminKey") {
    return {
      adminKey: deploymentSelection.adminKey,
      url: deploymentSelection.url
    };
  }
  const configuredAdminKey = readAdminKeyFromEnvVar();
  if (configuredAdminKey === void 0) {
    const buildEnvironmentExpectsConvexDeployKey = buildEnvironment();
    if (buildEnvironmentExpectsConvexDeployKey) {
      return await ctx.crash({
        exitCode: 1,
        errorType: "fatal",
        printedMessage: `${buildEnvironmentExpectsConvexDeployKey} build environment detected but ${CONVEX_DEPLOY_KEY_ENV_VAR_NAME} is not set. Set this environment variable to deploy from this environment. See https://docs.convex.dev/production/hosting`
      });
    }
    const header = await getAuthHeaderForBigBrain(ctx);
    if (!header) {
      return await ctx.crash({
        exitCode: 1,
        errorType: "fatal",
        printedMessage: `Error: You are not logged in. Log in with \`npx convex dev\` or set the ${CONVEX_DEPLOY_KEY_ENV_VAR_NAME} environment variable. See https://docs.convex.dev/production/hosting`
      });
    }
    const configuredDeployment = await getConfiguredDeploymentName(ctx);
    if (configuredDeployment === null) {
      return await ctx.crash({
        exitCode: 1,
        errorType: "fatal",
        printedMessage: "No CONVEX_DEPLOYMENT set, run `npx convex dev` to configure a Convex project"
      });
    }
  }
  const data = await fetchDeploymentCredentialsWithinCurrentProjectInner(
    ctx,
    deploymentSelection,
    configuredAdminKey
  );
  const { deploymentName, adminKey, deploymentType, url } = data;
  if (adminKey === void 0 || url === void 0 || deploymentName === void 0) {
    const msg = "Unknown error during authorization: " + JSON.stringify(data);
    return await ctx.crash({
      exitCode: 1,
      errorType: "transient",
      errForSentry: new Error(msg),
      printedMessage: msg
    });
  }
  return {
    deploymentName,
    adminKey,
    url,
    deploymentType
  };
}
export async function projectSelection(ctx, configuredDeployment, configuredAdminKey) {
  if (configuredAdminKey !== void 0 && isPreviewDeployKey(configuredAdminKey)) {
    const { teamSlug, projectSlug } = await getTeamAndProjectFromPreviewAdminKey(ctx, configuredAdminKey);
    return {
      kind: "teamAndProjectSlugs",
      teamSlug,
      projectSlug
    };
  }
  if (configuredAdminKey !== void 0) {
    return {
      kind: "deploymentName",
      deploymentName: await deploymentNameFromAdminKeyOrCrash(
        ctx,
        configuredAdminKey
      )
    };
  }
  if (configuredDeployment) {
    return {
      kind: "deploymentName",
      deploymentName: configuredDeployment
    };
  }
  return await ctx.crash({
    exitCode: 1,
    errorType: "fatal",
    printedMessage: "Select project by setting `CONVEX_DEPLOYMENT` with `npx convex dev` or `CONVEX_DEPLOY_KEY` from the Convex dashboard."
  });
}
async function fetchDeploymentCredentialsWithinCurrentProjectInner(ctx, deploymentSelection, configuredAdminKey) {
  const configuredDeployment = getConfiguredDeploymentFromEnvVar().name;
  switch (deploymentSelection.kind) {
    case "ownDev": {
      return {
        ...await fetchExistingDevDeploymentCredentialsOrCrash(
          ctx,
          configuredDeployment
        ),
        deploymentName: configuredDeployment
      };
    }
    case "ownProd":
      return await bigBrainAPI({
        ctx,
        method: "POST",
        url: "deployment/authorize_prod",
        data: {
          deploymentName: configuredDeployment
        }
      });
    case "previewName":
      return await bigBrainAPI({
        ctx,
        method: "POST",
        url: "deployment/authorize_preview",
        data: {
          previewName: deploymentSelection.previewName,
          projectSelection: await projectSelection(
            ctx,
            configuredDeployment,
            configuredAdminKey
          )
        }
      });
    case "deploymentName":
      return await bigBrainAPI({
        ctx,
        method: "POST",
        url: "deployment/authorize_within_current_project",
        data: {
          selectedDeploymentName: deploymentSelection.deploymentName,
          projectSelection: await projectSelection(
            ctx,
            configuredDeployment,
            configuredAdminKey
          )
        }
      });
    case "deployKey": {
      const deploymentName = await deploymentNameFromAdminKeyOrCrash(
        ctx,
        configuredAdminKey
      );
      let url = await deriveUrlFromAdminKey(ctx, configuredAdminKey);
      if (process.env.CONVEX_PROVISION_HOST !== void 0) {
        url = await bigBrainAPI({
          ctx,
          method: "POST",
          url: "deployment/url_for_key",
          data: {
            deployKey: configuredAdminKey
          }
        });
      }
      const deploymentType = deploymentTypeFromAdminKey(configuredAdminKey);
      return {
        adminKey: configuredAdminKey,
        url,
        deploymentName,
        deploymentType
      };
    }
    case "urlWithLogin":
      return {
        ...await bigBrainAPI({
          ctx,
          method: "POST",
          url: "deployment/authorize_within_current_project",
          data: {
            selectedDeploymentName: configuredDeployment,
            projectSelection: await projectSelection(
              ctx,
              configuredDeployment,
              configuredAdminKey
            )
          }
        }),
        url: deploymentSelection.url
      };
    default: {
      const _exhaustivenessCheck = deploymentSelection;
      return ctx.crash({
        exitCode: 1,
        errorType: "fatal",
        // This should be unreachable, so don't bother with a printed message.
        printedMessage: null,
        errForSentry: `Unexpected deployment selection: ${deploymentSelection}`
      });
    }
  }
}
export async function fetchDeploymentCredentialsProvisionProd(ctx, deploymentSelection) {
  if (deploymentSelection.kind === "ownDev" && !await checkAuthorization(ctx, false)) {
    await performLogin(ctx);
  }
  if (deploymentSelection.kind !== "ownDev") {
    const result2 = await fetchDeploymentCredentialsWithinCurrentProject(
      ctx,
      deploymentSelection
    );
    logVerbose(
      ctx,
      `Deployment URL: ${result2.url}, Deployment Name: ${result2.deploymentName}, Deployment Type: ${result2.deploymentType}`
    );
    return {
      url: result2.url,
      adminKey: result2.adminKey,
      deploymentName: result2.deploymentName,
      deploymentType: result2.deploymentType
    };
  }
  const configuredDeployment = await getConfiguredDeploymentOrCrash(ctx);
  const result = await fetchExistingDevDeploymentCredentialsOrCrash(
    ctx,
    configuredDeployment
  );
  logVerbose(
    ctx,
    `Deployment URL: ${result.url}, Deployment Name: ${configuredDeployment}, Deployment Type: ${result.deploymentType}`
  );
  return {
    url: result.url,
    adminKey: result.adminKey,
    deploymentType: result.deploymentType,
    deploymentName: configuredDeployment
  };
}
export async function fetchTeamAndProject(ctx, deploymentName) {
  const data = await bigBrainAPI({
    ctx,
    method: "GET",
    url: `deployment/${deploymentName}/team_and_project`
  });
  const { team, project } = data;
  if (team === void 0 || project === void 0) {
    const msg = "Unknown error when fetching team and project: " + JSON.stringify(data);
    return await ctx.crash({
      exitCode: 1,
      errorType: "transient",
      errForSentry: new Error(msg),
      printedMessage: msg
    });
  }
  return data;
}
export async function fetchDeploymentCredentialsProvisioningDevOrProdMaybeThrows(ctx, { teamSlug, projectSlug }, deploymentType) {
  const data = await bigBrainAPIMaybeThrows({
    ctx,
    method: "POST",
    url: "deployment/provision_and_authorize",
    data: {
      teamSlug,
      projectSlug,
      deploymentType
    }
  });
  const deploymentName = data.deploymentName;
  const adminKey = data.adminKey;
  const url = data.url;
  if (adminKey === void 0 || url === void 0) {
    const msg = "Unknown error during authorization: " + JSON.stringify(data);
    return await ctx.crash({
      exitCode: 1,
      errorType: "transient",
      errForSentry: new Error(msg),
      printedMessage: msg
    });
  }
  return { adminKey, deploymentUrl: url, deploymentName };
}
function credentialsAsDevCredentials(cred) {
  if (cred.deploymentType === "dev") {
    return cred;
  }
  throw new Error("Credentials are not for a dev deployment.");
}
async function fetchExistingDevDeploymentCredentialsOrCrash(ctx, deploymentName) {
  const credentials = await fetchDeploymentCredentialsForName(
    ctx,
    deploymentName,
    "dev"
  );
  if ("error" in credentials) {
    return await ctx.crash({
      exitCode: 1,
      errorType: "invalid filesystem data",
      errForSentry: credentials.error,
      printedMessage: `Failed to authorize "${deploymentName}" configured in CONVEX_DEPLOYMENT, run \`npx convex dev\` to configure a Convex project`
    });
  }
  if (credentials.deploymentType !== "dev") {
    return await ctx.crash({
      exitCode: 1,
      errorType: "invalid filesystem data",
      printedMessage: `Deployment "${deploymentName}" is not a dev deployment`
    });
  }
  return credentialsAsDevCredentials(credentials);
}
async function deriveUrlFromAdminKey(ctx, adminKey) {
  const deploymentName = await deploymentNameFromAdminKeyOrCrash(ctx, adminKey);
  return `https://${deploymentName}.convex.cloud`;
}
//# sourceMappingURL=api.js.map

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var run_exports = {};
__export(run_exports, {
  ensureBackendBinaryDownloaded: () => ensureBackendBinaryDownloaded,
  ensureBackendRunning: () => ensureBackendRunning,
  ensureBackendStopped: () => ensureBackendStopped,
  localDeploymentUrl: () => localDeploymentUrl,
  runLocalBackend: () => runLocalBackend
});
module.exports = __toCommonJS(run_exports);
var import_adm_zip = __toESM(require("adm-zip"), 1);
var import_context = require("../../../bundler/context.js");
var import_filePaths = require("./filePaths.js");
var import_path = __toESM(require("path"), 1);
var import_child_process = __toESM(require("child_process"), 1);
var import_util = require("util");
var import_stream = require("stream");
var import_fs = require("../../../bundler/fs.js");
var import_detect_port = __toESM(require("detect-port"), 1);
const LOCAL_BACKEND_INSTANCE_SECRET = "4361726e697461732c206c69746572616c6c79206d65616e696e6720226c6974";
async function ensureBackendBinaryDownloaded(ctx, version) {
  if (version.kind === "version") {
    (0, import_context.logVerbose)(
      ctx,
      `Ensuring backend binary downloaded for version ${version.version}`
    );
    const existingDownload = await checkForExistingDownload(
      ctx,
      version.version
    );
    if (existingDownload !== null) {
      (0, import_context.logVerbose)(ctx, `Using existing download at ${existingDownload}`);
      return {
        binaryPath: existingDownload,
        version: version.version
      };
    }
    const binaryPath = await downloadBinary(ctx, version.version);
    return { version: version.version, binaryPath };
  }
  (0, import_context.logVerbose)(ctx, `Ensuring latest backend binary downloaded`);
  const latest = await fetch(
    "https://github.com/get-convex/convex-backend/releases/latest",
    { redirect: "manual" }
  );
  if (latest.status !== 302) {
    return await ctx.crash({
      exitCode: 1,
      errorType: "fatal",
      printedMessage: "Failed to get latest convex backend release",
      errForSentry: "Failed to get latest convex backend release"
    });
  }
  const latestUrl = latest.headers.get("location");
  const latestVersion = latestUrl.split("/").pop();
  (0, import_context.logVerbose)(ctx, `Latest version is ${latestVersion}`);
  return ensureBackendBinaryDownloaded(ctx, {
    kind: "version",
    version: latestVersion
  });
}
async function checkForExistingDownload(ctx, version) {
  const destDir = (0, import_filePaths.versionedBinaryDir)(version);
  if (!ctx.fs.exists(destDir)) {
    return null;
  }
  const p = (0, import_filePaths.executablePath)(version);
  if (!ctx.fs.exists(p)) {
    ctx.fs.rmdir(destDir);
    return null;
  }
  await (0, import_util.promisify)(import_child_process.default.exec)(`chmod +x ${p}`);
  return p;
}
async function downloadBinary(ctx, version) {
  const downloadPath = getDownloadPath();
  if (downloadPath === null) {
    return await ctx.crash({
      exitCode: 1,
      errorType: "fatal",
      printedMessage: `Unsupported platform ${process.platform} and architecture ${process.arch} for local deployment.`
    });
  }
  const response = await fetch(
    `https://github.com/get-convex/convex-backend/releases/download/${version}/${downloadPath}`
  );
  (0, import_context.logMessage)(ctx, "Downloading convex backend");
  if (!ctx.fs.exists((0, import_filePaths.binariesDir)())) {
    ctx.fs.mkdir((0, import_filePaths.binariesDir)(), { recursive: true });
  }
  const zipLocation = (0, import_filePaths.binaryZip)();
  if (ctx.fs.exists(zipLocation)) {
    ctx.fs.unlink(zipLocation);
  }
  const readable = import_stream.Readable.fromWeb(response.body);
  await import_fs.nodeFs.writeFileStream(zipLocation, readable);
  (0, import_context.logVerbose)(ctx, "Downloaded zip file");
  const zip = new import_adm_zip.default(zipLocation);
  const versionDir = (0, import_filePaths.versionedBinaryDir)(version);
  zip.extractAllTo(versionDir, true);
  (0, import_context.logVerbose)(ctx, "Extracted from zip file");
  const p = (0, import_filePaths.executablePath)(version);
  await (0, import_util.promisify)(import_child_process.default.exec)(`chmod +x ${p}`);
  (0, import_context.logVerbose)(ctx, "Marked as executable");
  return p;
}
async function runLocalBackend(ctx, args) {
  const { ports } = args;
  const deploymentDir = (0, import_filePaths.deploymentStateDir)(args.deploymentName);
  ctx.fs.mkdir(deploymentDir, { recursive: true });
  const commandArgs = [
    "--port",
    ports.cloud.toString(),
    "--site-proxy-port",
    ports.site.toString(),
    "--instance-name",
    args.deploymentName,
    "--instance-secret",
    LOCAL_BACKEND_INSTANCE_SECRET,
    "--local-storage",
    import_path.default.join(deploymentDir, "convex_local_storage"),
    import_path.default.join(deploymentDir, "convex_local_backend.sqlite3")
  ];
  const commandStr = `${args.binaryPath} ${commandArgs.join(" ")}`;
  (0, import_context.logVerbose)(ctx, `Starting local backend: \`${commandStr}\``);
  const p = import_child_process.default.spawn(args.binaryPath, commandArgs, { stdio: "ignore" }).on("exit", (code) => {
    (0, import_context.logVerbose)(
      ctx,
      `Local backend exited with code ${code}, full command \`${commandStr}\``
    );
  });
  const cleanupHandle = ctx.registerCleanup(async () => {
    (0, import_context.logVerbose)(ctx, `Stopping local backend on port ${ports.cloud}`);
    p.kill("SIGTERM");
  });
  await ensureBackendRunning(ctx, {
    cloudPort: ports.cloud,
    deploymentName: args.deploymentName,
    maxTimeSecs: 10
  });
  return {
    cleanupHandle
  };
}
async function ensureBackendRunning(ctx, args) {
  (0, import_context.logVerbose)(
    ctx,
    `Ensuring backend running on port ${args.cloudPort} is running`
  );
  const deploymentUrl = localDeploymentUrl(args.cloudPort);
  let timeElapsedSecs = 0;
  while (timeElapsedSecs < args.maxTimeSecs) {
    try {
      const resp = await fetch(`${deploymentUrl}/instance_name`);
      if (resp.status === 200) {
        const text = await resp.text();
        if (text !== args.deploymentName) {
          return await ctx.crash({
            exitCode: 1,
            errorType: "fatal",
            printedMessage: `A different local backend ${text} is running on selected port ${args.cloudPort}`
          });
        }
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        timeElapsedSecs += 0.5;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
      timeElapsedSecs += 0.5;
    }
  }
}
async function ensureBackendStopped(ctx, args) {
  (0, import_context.logVerbose)(
    ctx,
    `Ensuring backend running on port ${args.ports.cloud} is stopped`
  );
  let timeElapsedSecs = 0;
  while (timeElapsedSecs < args.maxTimeSecs) {
    const cloudPort = await (0, import_detect_port.default)(args.ports.cloud);
    const sitePort = args.ports.site === void 0 ? void 0 : await (0, import_detect_port.default)(args.ports.site);
    if (cloudPort === args.ports.cloud && sitePort === args.ports.site) {
      return;
    }
    try {
      const instanceNameResp = await fetch(
        `${localDeploymentUrl(args.ports.cloud)}/instance_name`
      );
      if (instanceNameResp.ok) {
        const instanceName = await instanceNameResp.text();
        if (instanceName !== args.deploymentName) {
          if (args.allowOtherDeployments) {
            return;
          }
          return await ctx.crash({
            exitCode: 1,
            errorType: "fatal",
            printedMessage: `A different local backend ${instanceName} is running on selected port ${args.ports.cloud}`
          });
        }
      }
    } catch (error) {
      (0, import_context.logVerbose)(ctx, `Error checking if backend is running: ${error.message}`);
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    timeElapsedSecs += 0.5;
  }
  return ctx.crash({
    exitCode: 1,
    errorType: "fatal",
    printedMessage: `A local backend is still running on port ${args.ports.cloud}. Please stop it and run this command again.`
  });
}
function localDeploymentUrl(cloudPort) {
  return `http://127.0.0.1:${cloudPort}`;
}
function getDownloadPath() {
  switch (process.platform) {
    case "darwin":
      if (process.arch === "arm64") {
        return "convex-local-backend-aarch64-apple-darwin.zip";
      } else if (process.arch === "x64") {
        return "convex-local-backend-x86_64-apple-darwin.zip";
      }
      break;
    case "linux":
      if (process.arch === "arm64") {
        return "convex-local-backend-aarch64-unknown-linux-gnu.zip";
      } else if (process.arch === "x64") {
        return "convex-local-backend-x86_64-unknown-linux-gnu.zip";
      }
      break;
    case "win32":
      return "convex-local-backend-x86_64-pc-windows-msvc.zip";
  }
  return null;
}
//# sourceMappingURL=run.js.map

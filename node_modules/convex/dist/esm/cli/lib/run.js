"use strict";
import chalk from "chalk";
import util from "util";
import ws from "ws";
import { ConvexHttpClient } from "../../browser/http_client.js";
import { BaseConvexClient } from "../../browser/index.js";
import { makeFunctionReference } from "../../server/index.js";
import { convexToJson } from "../../values/value.js";
import {
  logFinishedStep,
  logMessage,
  logOutput
} from "../../bundler/context.js";
import { waitForever, waitUntilCalled } from "./utils/utils.js";
export async function runFunctionAndLog(ctx, deploymentUrl, adminKey, functionName, args, componentPath, callbacks) {
  const client = new ConvexHttpClient(deploymentUrl);
  client.setAdminAuth(adminKey);
  let result;
  try {
    result = await client.function(
      makeFunctionReference(functionName),
      componentPath,
      args
    );
  } catch (err) {
    return await ctx.crash({
      exitCode: 1,
      errorType: "invalid filesystem or env vars",
      printedMessage: `Failed to run function "${functionName}":
${chalk.red(err.toString().trim())}`
    });
  }
  callbacks?.onSuccess?.();
  if (result !== null) {
    logOutput(ctx, formatValue(result));
  }
}
export async function runPaginatedQuery(ctx, deploymentUrl, adminKey, functionName, componentPath, args, limit) {
  const results = [];
  let cursor = null;
  let isDone = false;
  while (!isDone && (limit === void 0 || results.length < limit)) {
    const paginationResult = await runQuery(
      ctx,
      deploymentUrl,
      adminKey,
      functionName,
      componentPath,
      {
        ...args,
        // The pagination is limited on the backend, so the 10000
        // means "give me as many as possible".
        paginationOpts: {
          cursor,
          numItems: limit === void 0 ? 1e4 : limit - results.length
        }
      }
    );
    isDone = paginationResult.isDone;
    cursor = paginationResult.continueCursor;
    results.push(...paginationResult.page);
  }
  return results;
}
export async function runQuery(ctx, deploymentUrl, adminKey, functionName, componentPath, args) {
  let onResult;
  const resultPromise = new Promise((resolve) => {
    onResult = resolve;
  });
  const [donePromise, onDone] = waitUntilCalled();
  await subscribe(
    ctx,
    deploymentUrl,
    adminKey,
    functionName,
    args,
    componentPath,
    donePromise,
    {
      onChange: (result) => {
        onDone();
        onResult(result);
      }
    }
  );
  return resultPromise;
}
export function formatValue(value) {
  const json = convexToJson(value);
  if (process.stdout.isTTY) {
    return util.inspect(value, { colors: true, depth: null });
  } else {
    return JSON.stringify(json, null, 2);
  }
}
export async function subscribeAndLog(ctx, deploymentUrl, adminKey, functionName, args, componentPath) {
  return subscribe(
    ctx,
    deploymentUrl,
    adminKey,
    functionName,
    args,
    componentPath,
    waitForever(),
    {
      onStart() {
        logFinishedStep(
          ctx,
          `Watching query ${functionName} on ${deploymentUrl}...`
        );
      },
      onChange(result) {
        logOutput(ctx, formatValue(result));
      },
      onStop() {
        logMessage(ctx, `Closing connection to ${deploymentUrl}...`);
      }
    }
  );
}
export async function subscribe(ctx, deploymentUrl, adminKey, functionName, args, componentPath, until, callbacks) {
  const client = new BaseConvexClient(
    deploymentUrl,
    (updatedQueries) => {
      for (const queryToken of updatedQueries) {
        callbacks?.onChange?.(client.localQueryResultByToken(queryToken));
      }
    },
    {
      // pretend that a Node.js 'ws' library WebSocket is a browser WebSocket
      webSocketConstructor: ws,
      unsavedChangesWarning: false
    }
  );
  client.setAdminAuth(adminKey);
  const { unsubscribe } = client.subscribe(functionName, args, {
    componentPath
  });
  callbacks?.onStart?.();
  let done = false;
  const [donePromise, onDone] = waitUntilCalled();
  const stopWatching = () => {
    if (done) {
      return;
    }
    done = true;
    unsubscribe();
    void client.close();
    process.off("SIGINT", sigintListener);
    onDone();
    callbacks?.onStop?.();
  };
  function sigintListener() {
    stopWatching();
  }
  process.on("SIGINT", sigintListener);
  void until.finally(stopWatching);
  while (!done) {
    const oneDay = 24 * 60 * 60 * 1e3;
    await Promise.race([
      donePromise,
      new Promise((resolve) => setTimeout(resolve, oneDay))
    ]);
  }
}
//# sourceMappingURL=run.js.map

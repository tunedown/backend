"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var bigBrain_exports = {};
__export(bigBrain_exports, {
  bigBrainPause: () => bigBrainPause,
  bigBrainRecordActivity: () => bigBrainRecordActivity,
  bigBrainStart: () => bigBrainStart
});
module.exports = __toCommonJS(bigBrain_exports);
var import_context = require("../../../bundler/context.js");
var import_utils = require("../utils/utils.js");
async function bigBrainStart(ctx, data) {
  return (0, import_utils.bigBrainAPI)({
    ctx,
    method: "POST",
    url: "/api/local_deployment/start",
    data
  });
}
async function bigBrainPause(ctx, data) {
  const fetch = await (0, import_utils.bigBrainFetch)(ctx);
  try {
    const resp = await fetch("/api/local_deployment/pause", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      (0, import_context.logVerbose)(ctx, "Failed to pause local deployment");
    }
  } catch (e) {
    return (0, import_utils.logAndHandleFetchError)(ctx, e);
  }
}
async function bigBrainRecordActivity(ctx, data) {
  return (0, import_utils.bigBrainAPI)({
    ctx,
    method: "POST",
    url: "/api/local_deployment/record_activity",
    data
  });
}
//# sourceMappingURL=bigBrain.js.map

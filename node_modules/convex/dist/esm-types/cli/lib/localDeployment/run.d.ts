import { Context } from "../../../bundler/context.js";
export declare function ensureBackendBinaryDownloaded(ctx: Context, version: {
    kind: "latest";
} | {
    kind: "version";
    version: string;
}): Promise<{
    binaryPath: string;
    version: string;
}>;
export declare function runLocalBackend(ctx: Context, args: {
    ports: {
        cloud: number;
        site: number;
    };
    deploymentName: string;
    binaryPath: string;
}): Promise<{
    cleanupHandle: string;
}>;
export declare function ensureBackendRunning(ctx: Context, args: {
    cloudPort: number;
    deploymentName: string;
    maxTimeSecs: number;
}): Promise<void>;
export declare function ensureBackendStopped(ctx: Context, args: {
    ports: {
        cloud: number;
        site?: number;
    };
    maxTimeSecs: number;
    deploymentName: string;
    allowOtherDeployments: boolean;
}): Promise<undefined>;
export declare function localDeploymentUrl(cloudPort: number): string;
//# sourceMappingURL=run.d.ts.map
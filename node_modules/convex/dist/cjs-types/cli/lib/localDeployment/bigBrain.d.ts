import { Context } from "../../../bundler/context.js";
export declare function bigBrainStart(ctx: Context, data: {
    port: number;
    projectSlug: string;
    teamSlug: string;
    instanceName: string | null;
}): Promise<{
    deploymentName: string;
    adminKey: string;
}>;
export declare function bigBrainPause(ctx: Context, data: {
    projectSlug: string;
    teamSlug: string;
}): Promise<void>;
export declare function bigBrainRecordActivity(ctx: Context, data: {
    instanceName: string;
}): Promise<any>;
//# sourceMappingURL=bigBrain.d.ts.map
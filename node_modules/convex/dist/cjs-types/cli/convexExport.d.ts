import { Command } from "@commander-js/extra-typings";
import { Context } from "../bundler/context.js";
export declare const convexExport: Command<[], {
    path: string;
    includeFileStorage?: true | undefined;
} & {
    url?: string | undefined;
    adminKey?: string | undefined;
    prod?: boolean | undefined;
    previewName?: string | undefined;
    deploymentName?: string | undefined;
}>;
type SnapshotExportState = {
    state: "requested";
} | {
    state: "in_progress";
} | {
    state: "completed";
    complete_ts: bigint;
    start_ts: bigint;
    zip_object_key: string;
};
export declare function startSnapshotExport(ctx: Context, args: {
    includeStorage: boolean;
    inputPath: string;
    adminKey: string;
    deploymentUrl: string;
    deploymentName: string | null;
}): Promise<SnapshotExportState>;
export declare function downloadSnapshotExport(ctx: Context, args: {
    snapshotExportTs: bigint;
    inputPath: string;
    adminKey: string;
    deploymentUrl: string;
}): Promise<{
    filePath: string;
}>;
export {};
//# sourceMappingURL=convexExport.d.ts.map
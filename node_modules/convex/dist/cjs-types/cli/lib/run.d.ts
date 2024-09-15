import { Value } from "../../values/value.js";
import { Context } from "../../bundler/context.js";
export declare function runFunctionAndLog(ctx: Context, deploymentUrl: string, adminKey: string, functionName: string, args: Value, componentPath?: string, callbacks?: {
    onSuccess?: () => void;
}): Promise<undefined>;
export declare function runPaginatedQuery(ctx: Context, deploymentUrl: string, adminKey: string, functionName: string, componentPath: string | undefined, args: Record<string, Value>, limit?: number): Promise<Record<string, Value>[]>;
export declare function runQuery(ctx: Context, deploymentUrl: string, adminKey: string, functionName: string, componentPath: string | undefined, args: Record<string, Value>): Promise<Value>;
export declare function formatValue(value: Value): string;
export declare function subscribeAndLog(ctx: Context, deploymentUrl: string, adminKey: string, functionName: string, args: Record<string, Value>, componentPath: string | undefined): Promise<void>;
export declare function subscribe(ctx: Context, deploymentUrl: string, adminKey: string, functionName: string, args: Record<string, Value>, componentPath: string | undefined, until: Promise<unknown>, callbacks?: {
    onStart?: () => void;
    onChange?: (result: Value) => void;
    onStop?: () => void;
}): Promise<void>;
//# sourceMappingURL=run.d.ts.map
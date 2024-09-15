import { Context } from "../bundler/context.js";
import { DeploymentName } from "./lib/api.js";
type DeploymentCredentials = {
    url: string;
    adminKey: string;
};
/**
 * As of writing, this is used by:
 * - `npx convex dev`
 * - `npx convex codegen`
 *
 * But is not used by `npx convex deploy` or other commands.
 */
export declare function deploymentCredentialsOrConfigure(ctx: Context, chosenConfiguration: "new" | "existing" | "ask" | null, cmdOptions: {
    prod: boolean;
    local: boolean;
    localOptions: {
        ports?: {
            cloud: number;
            site: number;
        };
        backendVersion?: string | undefined;
        forceUpgrade: boolean;
    };
    team?: string | undefined;
    project?: string | undefined;
    url?: string | undefined;
    adminKey?: string | undefined;
}): Promise<DeploymentCredentials & {
    deploymentName?: DeploymentName;
}>;
export {};
//# sourceMappingURL=configure.d.ts.map
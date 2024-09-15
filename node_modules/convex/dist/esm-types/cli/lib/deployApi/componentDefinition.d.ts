import { z } from "zod";
import { Identifier, Reference } from "./types.js";
export declare const componentArgumentValidator: z.ZodObject<{
    type: z.ZodLiteral<"value">;
    value: z.ZodString;
}, "passthrough", z.ZodTypeAny, {
    type: "value";
    value: string;
}, {
    type: "value";
    value: string;
}>;
export declare const componentDefinitionType: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"app">;
}, "passthrough", z.ZodTypeAny, {
    type: "app";
}, {
    type: "app";
}>, z.ZodObject<{
    type: z.ZodLiteral<"childComponent">;
    name: z.ZodString;
    args: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodObject<{
        type: z.ZodLiteral<"value">;
        value: z.ZodString;
    }, "passthrough", z.ZodTypeAny, {
        type: "value";
        value: string;
    }, {
        type: "value";
        value: string;
    }>], null>, "many">;
}, "passthrough", z.ZodTypeAny, {
    type: "childComponent";
    name: string;
    args: [string, {
        type: "value";
        value: string;
    }][];
}, {
    type: "childComponent";
    name: string;
    args: [string, {
        type: "value";
        value: string;
    }][];
}>]>;
export declare const componentArgument: z.ZodObject<{
    type: z.ZodLiteral<"value">;
    value: z.ZodString;
}, "passthrough", z.ZodTypeAny, {
    type: "value";
    value: string;
}, {
    type: "value";
    value: string;
}>;
export declare const componentInstantiation: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    args: z.ZodNullable<z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodObject<{
        type: z.ZodLiteral<"value">;
        value: z.ZodString;
    }, "passthrough", z.ZodTypeAny, {
        type: "value";
        value: string;
    }, {
        type: "value";
        value: string;
    }>], null>, "many">>;
}, "passthrough", z.ZodTypeAny, {
    name: string;
    args: [string, {
        type: "value";
        value: string;
    }][] | null;
    path: string;
}, {
    name: string;
    args: [string, {
        type: "value";
        value: string;
    }][] | null;
    path: string;
}>;
export type ComponentExports = {
    type: "leaf";
    leaf: Reference;
} | {
    type: "branch";
    branch: [Identifier, ComponentExports][];
};
export declare const componentExports: z.ZodType<ComponentExports>;
export declare const componentDefinitionMetadata: z.ZodObject<{
    path: z.ZodString;
    definitionType: z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"app">;
    }, "passthrough", z.ZodTypeAny, {
        type: "app";
    }, {
        type: "app";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"childComponent">;
        name: z.ZodString;
        args: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodObject<{
            type: z.ZodLiteral<"value">;
            value: z.ZodString;
        }, "passthrough", z.ZodTypeAny, {
            type: "value";
            value: string;
        }, {
            type: "value";
            value: string;
        }>], null>, "many">;
    }, "passthrough", z.ZodTypeAny, {
        type: "childComponent";
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][];
    }, {
        type: "childComponent";
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][];
    }>]>;
    childComponents: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        args: z.ZodNullable<z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodObject<{
            type: z.ZodLiteral<"value">;
            value: z.ZodString;
        }, "passthrough", z.ZodTypeAny, {
            type: "value";
            value: string;
        }, {
            type: "value";
            value: string;
        }>], null>, "many">>;
    }, "passthrough", z.ZodTypeAny, {
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][] | null;
        path: string;
    }, {
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][] | null;
        path: string;
    }>, "many">;
    httpMounts: z.ZodRecord<z.ZodString, z.ZodString>;
    exports: z.ZodObject<{
        type: z.ZodLiteral<"branch">;
        branch: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodType<ComponentExports, z.ZodTypeDef, ComponentExports>], null>, "many">;
    }, "passthrough", z.ZodTypeAny, {
        type: "branch";
        branch: [string, ComponentExports][];
    }, {
        type: "branch";
        branch: [string, ComponentExports][];
    }>;
}, "passthrough", z.ZodTypeAny, {
    path: string;
    childComponents: {
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][] | null;
        path: string;
    }[];
    exports: {
        type: "branch";
        branch: [string, ComponentExports][];
    };
    definitionType: {
        type: "app";
    } | {
        type: "childComponent";
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][];
    };
    httpMounts: Record<string, string>;
}, {
    path: string;
    childComponents: {
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][] | null;
        path: string;
    }[];
    exports: {
        type: "branch";
        branch: [string, ComponentExports][];
    };
    definitionType: {
        type: "app";
    } | {
        type: "childComponent";
        name: string;
        args: [string, {
            type: "value";
            value: string;
        }][];
    };
    httpMounts: Record<string, string>;
}>;
export declare const evaluatedComponentDefinition: z.ZodObject<{
    definition: z.ZodObject<{
        path: z.ZodString;
        definitionType: z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"app">;
        }, "passthrough", z.ZodTypeAny, {
            type: "app";
        }, {
            type: "app";
        }>, z.ZodObject<{
            type: z.ZodLiteral<"childComponent">;
            name: z.ZodString;
            args: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodObject<{
                type: z.ZodLiteral<"value">;
                value: z.ZodString;
            }, "passthrough", z.ZodTypeAny, {
                type: "value";
                value: string;
            }, {
                type: "value";
                value: string;
            }>], null>, "many">;
        }, "passthrough", z.ZodTypeAny, {
            type: "childComponent";
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][];
        }, {
            type: "childComponent";
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][];
        }>]>;
        childComponents: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            args: z.ZodNullable<z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodObject<{
                type: z.ZodLiteral<"value">;
                value: z.ZodString;
            }, "passthrough", z.ZodTypeAny, {
                type: "value";
                value: string;
            }, {
                type: "value";
                value: string;
            }>], null>, "many">>;
        }, "passthrough", z.ZodTypeAny, {
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][] | null;
            path: string;
        }, {
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][] | null;
            path: string;
        }>, "many">;
        httpMounts: z.ZodRecord<z.ZodString, z.ZodString>;
        exports: z.ZodObject<{
            type: z.ZodLiteral<"branch">;
            branch: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodType<ComponentExports, z.ZodTypeDef, ComponentExports>], null>, "many">;
        }, "passthrough", z.ZodTypeAny, {
            type: "branch";
            branch: [string, ComponentExports][];
        }, {
            type: "branch";
            branch: [string, ComponentExports][];
        }>;
    }, "passthrough", z.ZodTypeAny, {
        path: string;
        childComponents: {
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][] | null;
            path: string;
        }[];
        exports: {
            type: "branch";
            branch: [string, ComponentExports][];
        };
        definitionType: {
            type: "app";
        } | {
            type: "childComponent";
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][];
        };
        httpMounts: Record<string, string>;
    }, {
        path: string;
        childComponents: {
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][] | null;
            path: string;
        }[];
        exports: {
            type: "branch";
            branch: [string, ComponentExports][];
        };
        definitionType: {
            type: "app";
        } | {
            type: "childComponent";
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][];
        };
        httpMounts: Record<string, string>;
    }>;
    schema: z.ZodAny;
    functions: z.ZodRecord<z.ZodString, z.ZodObject<{
        functions: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            pos: z.ZodAny;
            udfType: z.ZodUnion<[z.ZodLiteral<"Query">, z.ZodLiteral<"Mutation">, z.ZodLiteral<"Action">]>;
            visibility: z.ZodNullable<z.ZodUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"public">;
            }, "passthrough", z.ZodTypeAny, {
                kind: "public";
            }, {
                kind: "public";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"internal">;
            }, "passthrough", z.ZodTypeAny, {
                kind: "internal";
            }, {
                kind: "internal";
            }>]>>;
            args: z.ZodNullable<z.ZodString>;
            returns: z.ZodNullable<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, {
            name: string;
            args: string | null;
            returns: string | null;
            udfType: "Mutation" | "Action" | "Query";
            visibility: {
                kind: "public";
            } | {
                kind: "internal";
            } | null;
            pos?: any;
        }, {
            name: string;
            args: string | null;
            returns: string | null;
            udfType: "Mutation" | "Action" | "Query";
            visibility: {
                kind: "public";
            } | {
                kind: "internal";
            } | null;
            pos?: any;
        }>, "many">;
        httpRoutes: z.ZodAny;
        cronSpecs: z.ZodAny;
        sourceMapped: z.ZodAny;
    }, "passthrough", z.ZodTypeAny, {
        functions: {
            name: string;
            args: string | null;
            returns: string | null;
            udfType: "Mutation" | "Action" | "Query";
            visibility: {
                kind: "public";
            } | {
                kind: "internal";
            } | null;
            pos?: any;
        }[];
        httpRoutes?: any;
        cronSpecs?: any;
        sourceMapped?: any;
    }, {
        functions: {
            name: string;
            args: string | null;
            returns: string | null;
            udfType: "Mutation" | "Action" | "Query";
            visibility: {
                kind: "public";
            } | {
                kind: "internal";
            } | null;
            pos?: any;
        }[];
        httpRoutes?: any;
        cronSpecs?: any;
        sourceMapped?: any;
    }>>;
    udfConfig: z.ZodObject<{
        serverVersion: z.ZodString;
        importPhaseRngSeed: z.ZodAny;
        importPhaseUnixTimestamp: z.ZodAny;
    }, "passthrough", z.ZodTypeAny, {
        serverVersion: string;
        importPhaseRngSeed?: any;
        importPhaseUnixTimestamp?: any;
    }, {
        serverVersion: string;
        importPhaseRngSeed?: any;
        importPhaseUnixTimestamp?: any;
    }>;
}, "passthrough", z.ZodTypeAny, {
    definition: {
        path: string;
        childComponents: {
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][] | null;
            path: string;
        }[];
        exports: {
            type: "branch";
            branch: [string, ComponentExports][];
        };
        definitionType: {
            type: "app";
        } | {
            type: "childComponent";
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][];
        };
        httpMounts: Record<string, string>;
    };
    functions: Record<string, {
        functions: {
            name: string;
            args: string | null;
            returns: string | null;
            udfType: "Mutation" | "Action" | "Query";
            visibility: {
                kind: "public";
            } | {
                kind: "internal";
            } | null;
            pos?: any;
        }[];
        httpRoutes?: any;
        cronSpecs?: any;
        sourceMapped?: any;
    }>;
    udfConfig: {
        serverVersion: string;
        importPhaseRngSeed?: any;
        importPhaseUnixTimestamp?: any;
    };
    schema?: any;
}, {
    definition: {
        path: string;
        childComponents: {
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][] | null;
            path: string;
        }[];
        exports: {
            type: "branch";
            branch: [string, ComponentExports][];
        };
        definitionType: {
            type: "app";
        } | {
            type: "childComponent";
            name: string;
            args: [string, {
                type: "value";
                value: string;
            }][];
        };
        httpMounts: Record<string, string>;
    };
    functions: Record<string, {
        functions: {
            name: string;
            args: string | null;
            returns: string | null;
            udfType: "Mutation" | "Action" | "Query";
            visibility: {
                kind: "public";
            } | {
                kind: "internal";
            } | null;
            pos?: any;
        }[];
        httpRoutes?: any;
        cronSpecs?: any;
        sourceMapped?: any;
    }>;
    udfConfig: {
        serverVersion: string;
        importPhaseRngSeed?: any;
        importPhaseUnixTimestamp?: any;
    };
    schema?: any;
}>;
export type EvaluatedComponentDefinition = z.infer<typeof evaluatedComponentDefinition>;
//# sourceMappingURL=componentDefinition.d.ts.map
"use strict";
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { ConvexProvider } from "./client.js";
const ConvexAuthContext = createContext(void 0);
export function useConvexAuth() {
  const authContext = useContext(ConvexAuthContext);
  if (authContext === void 0) {
    throw new Error(
      "Could not find `ConvexProviderWithAuth` (or `ConvexProviderWithClerk` or `ConvexProviderWithAuth0`) as an ancestor component. This component may be missing, or you might have two instances of the `convex/react` module loaded in your project."
    );
  }
  return authContext;
}
export function ConvexProviderWithAuth({
  children,
  client,
  useAuth
}) {
  const { isLoading, isAuthenticated, fetchAccessToken } = useAuth();
  const [isConvexAuthenticated, setIsConvexAuthenticated] = useState(null);
  if (isLoading && isConvexAuthenticated !== null) {
    setIsConvexAuthenticated(null);
  }
  if (!isLoading && !isAuthenticated && isConvexAuthenticated !== false) {
    setIsConvexAuthenticated(false);
  }
  return /* @__PURE__ */ React.createElement(
    ConvexAuthContext.Provider,
    {
      value: {
        isLoading: isConvexAuthenticated === null,
        isAuthenticated: isAuthenticated && (isConvexAuthenticated ?? false)
      }
    },
    /* @__PURE__ */ React.createElement(
      ConvexAuthStateFirstEffect,
      {
        isAuthenticated,
        fetchAccessToken,
        isLoading,
        client,
        setIsConvexAuthenticated
      }
    ),
    /* @__PURE__ */ React.createElement(ConvexProvider, { client }, children),
    /* @__PURE__ */ React.createElement(
      ConvexAuthStateLastEffect,
      {
        isAuthenticated,
        fetchAccessToken,
        isLoading,
        client
      }
    )
  );
}
function ConvexAuthStateFirstEffect({
  isAuthenticated,
  fetchAccessToken,
  isLoading,
  client,
  setIsConvexAuthenticated
}) {
  useEffect(() => {
    let isThisEffectRelevant = true;
    if (isAuthenticated) {
      client.setAuth(fetchAccessToken, (isAuthenticated2) => {
        if (isThisEffectRelevant) {
          setIsConvexAuthenticated(isAuthenticated2);
        }
      });
      return () => {
        isThisEffectRelevant = false;
        setIsConvexAuthenticated(
          (isConvexAuthenticated) => isConvexAuthenticated ? false : null
        );
      };
    }
  }, [
    isAuthenticated,
    fetchAccessToken,
    isLoading,
    client,
    setIsConvexAuthenticated
  ]);
  return null;
}
function ConvexAuthStateLastEffect({
  isAuthenticated,
  fetchAccessToken,
  isLoading,
  client
}) {
  useEffect(() => {
    if (isAuthenticated) {
      return () => {
        client.clearAuth();
      };
    }
  }, [isAuthenticated, fetchAccessToken, isLoading, client]);
  return null;
}
//# sourceMappingURL=ConvexAuthState.js.map

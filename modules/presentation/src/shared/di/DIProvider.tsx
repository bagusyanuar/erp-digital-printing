import React from "react";
import type { ReactNode } from "react";
import { DIContext, type AppContainer } from "./DIContext";

interface DIProviderProps {
  children: ReactNode;
  container: AppContainer;
}

/**
 * DIProvider
 *
 * Satu-satunya Provider untuk seluruh dependency injection.
 * Tidak perlu nesting — cukup satu wrapper ini.
 */
export const DIProvider: React.FC<DIProviderProps> = ({
  children,
  container,
}) => {
  return (
    <DIContext.Provider value={container}>{children}</DIContext.Provider>
  );
};

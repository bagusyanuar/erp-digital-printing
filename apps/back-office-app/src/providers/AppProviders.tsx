import type { ReactNode } from "react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DIProvider } from "@presentation/shared/di/DIProvider";
import type { AppContainer } from "@presentation/shared/di/DIContext";

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
  container: AppContainer;
}

/**
 * AppProviders
 *
 * Wrapper terpusat untuk seluruh Provider aplikasi.
 * Cukup satu DIProvider — tidak perlu nesting per modul.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  container,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DIProvider container={container}>{children}</DIProvider>
    </QueryClientProvider>
  );
};

import * as React from "react";
import { cn } from "../../lib/utils";
import { AppLayoutProps } from "./AppLayout.types";

export const AppLayout = ({ sidebar, children, className }: AppLayoutProps) => {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background text-foreground", className)}>
      {/* Sidebar Area */}
      {sidebar}

      {/* Main Container */}
      <main className="flex flex-1 flex-col overflow-hidden bg-muted/50">
        {children}
      </main>
    </div>
  );
};

AppLayout.displayName = "AppLayout";

import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarProps } from "./Sidebar.types";

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ children, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-dvh max-h-dvh w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-border overflow-hidden",
          className
        )}
      >
        {children}
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

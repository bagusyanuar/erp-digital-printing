import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarProps } from "./Sidebar.types";

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ children, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-screen w-72 flex-col bg-sidebar text-sidebar-foreground border-r border-border",
          className
        )}
      >
        {children}
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

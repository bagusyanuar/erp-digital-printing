import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarHeaderProps } from "./Sidebar.types";

export const SidebarHeader = ({ children, className }: SidebarHeaderProps) => (
  <div className={cn("px-6 py-5 border-b border-border", className)}>
    {children}
  </div>
);

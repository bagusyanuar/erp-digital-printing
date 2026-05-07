import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarContentProps } from "./Sidebar.types";

export const SidebarContent = ({ children, className }: SidebarContentProps) => (
  <nav className={cn("flex-1 overflow-y-auto px-4 py-2 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", className)}>
    {children}
  </nav>
);

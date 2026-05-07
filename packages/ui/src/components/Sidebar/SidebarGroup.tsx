import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarGroupProps } from "./Sidebar.types";

export const SidebarGroup = ({ label, children, className }: SidebarGroupProps) => (
  <div className={cn("space-y-1.5", className)}>
      {label && (
        <h4 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </h4>
      )}
    <div className="space-y-1">{children}</div>
  </div>
);

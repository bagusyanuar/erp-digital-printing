import * as React from "react";
import { cn } from "../../lib/utils";
import { AppLayoutContentProps } from "./AppLayout.types";

export const AppLayoutContent = ({ children, className }: AppLayoutContentProps) => {
  return (
    <div className={cn("flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", className)}>
      {children}
    </div>
  );
};

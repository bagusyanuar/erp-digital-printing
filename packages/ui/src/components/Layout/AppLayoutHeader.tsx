import * as React from "react";
import { cn } from "../../lib/utils";
import { AppLayoutHeaderProps } from "./AppLayout.types";

export const AppLayoutHeader = ({ children, title, className }: AppLayoutHeaderProps) => {
  return (
    <header className={cn(
      "flex h-16 shrink-0 items-center justify-between border-b border-border px-6 bg-background/80 backdrop-blur-md",
      className
    )}>
      {title && <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>}
      {children}
    </header>
  );
};

import { ReactNode } from "react";

export interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface AppLayoutHeaderProps {
  children?: ReactNode;
  title?: string;
  className?: string;
}

export interface AppLayoutContentProps {
  children: ReactNode;
  className?: string;
}

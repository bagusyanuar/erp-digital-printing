import { ReactNode } from "react";

export interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export interface SidebarItemProps extends React.HTMLAttributes<HTMLElement> {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  badge?: string | number;
  hasArrow?: boolean;
  asChild?: boolean;
}

export interface SidebarAppSwitcherProps {
  currentApp: {
    name: string;
    description: string;
    icon: ReactNode;
  };
  className?: string;
}

export interface SidebarFooterProps {
  user: {
    name: string;
    role: string;
    avatar?: ReactNode;
  };
  onLogout?: () => void;
  className?: string;
}

export interface SidebarItemTreeProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

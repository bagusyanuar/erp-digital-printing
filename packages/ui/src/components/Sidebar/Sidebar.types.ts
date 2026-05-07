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

export interface SidebarItemProps extends React.ComponentPropsWithoutRef<"div"> {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  badge?: string | number;
  hasArrow?: boolean;
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
  className?: string;
}

export interface SidebarItemTreeProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

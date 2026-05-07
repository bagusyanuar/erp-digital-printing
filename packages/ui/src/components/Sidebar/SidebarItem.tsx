import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { SidebarItemProps } from "./Sidebar.types";
import { LuChevronRight } from "react-icons/lu";

const sidebarItemVariants = cva(
  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
  {
    variants: {
      status: {
        default: "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
        active: "bg-primary/10 text-primary shadow-[0_0_20px_rgba(79,70,229,0.1)]",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
);

export const SidebarItem = React.forwardRef<
  HTMLDivElement,
  SidebarItemProps & VariantProps<typeof sidebarItemVariants>
>(({ icon, label, active, badge, hasArrow, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(sidebarItemVariants({ status: active ? "active" : "default" }), className)}
      {...props}
    >
      {icon && <span className={cn("text-xl", active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")}>{icon}</span>}
      <span className="flex-1">{label}</span>
      
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}

      {hasArrow && (
        <LuChevronRight className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200", active && "rotate-90 text-primary")} />
      )}
    </div>
  );
});

SidebarItem.displayName = "SidebarItem";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Dropdown = (props: PopoverPrimitive.PopoverProps) => {
  return <PopoverPrimitive.Root {...props} />;
};

export const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverPrimitive.PopoverTriggerProps
>((props, ref) => {
  return <PopoverPrimitive.Trigger ref={ref} {...props} />;
});
DropdownTrigger.displayName = "DropdownTrigger";

export interface DropdownContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const DropdownContent = React.forwardRef<
  HTMLDivElement,
  DropdownContentProps
>(({ className, children, align = "end", sideOffset = 8, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/50 bg-background/80 backdrop-blur-md p-1.5 text-popover-foreground shadow-lg outline-none focus:outline-none",
            className
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
DropdownContent.displayName = "DropdownContent";

export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger";
}

export const DropdownItem = React.forwardRef<
  HTMLButtonElement,
  DropdownItemProps
>(({ className, variant = "default", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold outline-none transition-colors duration-150 active:scale-[0.98] focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "text-foreground hover:bg-muted/70 hover:text-foreground",
        variant === "danger" && "text-rose-600 hover:bg-rose-500/10 hover:text-rose-700",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownItem.displayName = "DropdownItem";

import * as React from "react";
import { cn } from "../../lib/utils";
import { SidebarItemTreeProps } from "./Sidebar.types";
import { SidebarItem } from "./SidebarItem";
import { LuChevronDown } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

export const SidebarItemTree = ({
  icon,
  label,
  children,
  defaultOpen = false,
  className,
}: SidebarItemTreeProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const treeId = React.useId();

  return (
    <div className={cn("space-y-1", className)}>
      <SidebarItem
        icon={icon}
        label={label}
        onClick={() => setIsOpen(!isOpen)}
        className="select-none cursor-pointer"
        active={isOpen}
        hasArrow
      />
      <div className="relative">
        {/* Tree Line */}
        <div className="absolute left-[22px] top-0 bottom-2 w-[1px] bg-border" />
        
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key={treeId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pl-6 space-y-1 pt-1">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

SidebarItemTree.displayName = "SidebarItemTree";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ProgressBarProps {
  isLoading?: boolean;
  className?: string;
}

export const ProgressBar = ({ isLoading = false, className }: ProgressBarProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          animate={{ 
            width: ["0%", "30%", "70%", "90%"],
            opacity: 1 
          }}
          exit={{ 
            width: "100%",
            opacity: 0,
            transition: { duration: 0.3 }
          }}
          transition={{ 
            width: { duration: 15, ease: "linear" },
            opacity: { duration: 0.2 }
          }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-primary shadow-[0_0_8px_rgba(225,29,72,0.4)]",
            className
          )}
        />
      )}
    </AnimatePresence>
  );
};

ProgressBar.displayName = "ProgressBar";

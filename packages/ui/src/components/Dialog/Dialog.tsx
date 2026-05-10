import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { LuX } from "react-icons/lu";
import { Card } from "../Card";
import { dialogVariants } from "./Dialog.variants";
import { type VariantProps } from "class-variance-authority";

export interface DialogProps extends VariantProps<typeof dialogVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const contentAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { type: "spring", duration: 0.35, bounce: 0.2 },
} as const;

export const Dialog = ({
  isOpen,
  onClose,
  children,
  size,
  className,
  showCloseButton = true,
}: DialogProps) => {
  const [mounted, setMounted] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll — only when open
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Handle ESC key — only when open
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" key="dialog-overlay-container">
          {/* Overlay */}
          <motion.div
            key="dialog-backdrop"
            {...overlayAnimation}
            onClick={onCloseRef.current}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Content */}
          <motion.div
            key="dialog-content-wrapper"
            {...contentAnimation}
            className={cn(
              "relative w-full z-10",
              dialogVariants({ size }),
              className
            )}
          >
            <Card className="rounded-lg border-border shadow-2xl w-full overflow-hidden">
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 z-20 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-90"
                >
                  <LuX className="h-5 w-5" />
                </button>
              )}
              {children}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

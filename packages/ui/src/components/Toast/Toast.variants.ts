import { cva } from "class-variance-authority";

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-6 shadow-xl backdrop-blur-md transition-all",
  {
    variants: {
      variant: {
        default: "bg-card/95 border-border text-foreground",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        error: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

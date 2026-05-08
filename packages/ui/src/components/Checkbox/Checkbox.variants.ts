import { cva } from "class-variance-authority"

export const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        error: "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white",
      },
      size: {
        default: "h-4 w-4",
        sm: "h-3.5 w-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

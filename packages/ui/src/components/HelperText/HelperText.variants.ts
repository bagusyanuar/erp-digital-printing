import { cva } from "class-variance-authority"

export const helperTextVariants = cva(
  "text-xs transition-all duration-200",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        error: "text-red-500 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

import { cva } from "class-variance-authority";

export const dialogVariants = cva(
  "",
  {
    variants: {
      size: {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] h-[90vh]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

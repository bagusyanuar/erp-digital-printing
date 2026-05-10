import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-card",
        outline: "bg-transparent border-2",
        secondary: "bg-muted/50 border-none shadow-none",
        glass: "bg-card/50 backdrop-blur-xl border-white/10",
      },
      hover: {
        none: "",
        subtle: "hover:shadow-md hover:border-primary/20",
        lift: "hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
);

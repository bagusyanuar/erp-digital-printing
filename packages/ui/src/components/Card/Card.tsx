import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { cardVariants } from "./Card.variants";
import { Typography } from "../Typography";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Typography>
>(({ className, variant = "h3", weight = "black", ...props }, ref) => (
  <Typography
    ref={ref}
    variant={variant}
    weight={weight}
    className={cn("tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Typography>
>(({ className, variant = "small", ...props }, ref) => (
  <Typography
    ref={ref}
    variant={variant}
    className={cn("text-muted-foreground font-medium", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

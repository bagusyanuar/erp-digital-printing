import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { typographyVariants } from "./Typography.variants";
import { Slot } from "@radix-ui/react-slot";

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
}

const variantElementMap: Record<string, string> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  blockquote: "blockquote",
  ul: "ul",
  inlineCode: "code",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, weight, align, asChild = false, ...props }, ref) => {
    const Comp = (asChild ? Slot : variantElementMap[variant || "p"] || "p") as React.ElementType;

    return (
      <Comp
        className={cn(typographyVariants({ variant, weight, align, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Typography.displayName = "Typography";

export { Typography };

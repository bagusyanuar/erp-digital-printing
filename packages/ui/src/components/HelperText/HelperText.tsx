"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { helperTextVariants } from "./HelperText.variants"

export interface HelperTextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof helperTextVariants> {}

const HelperText = React.forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(helperTextVariants({ variant, className }))}
        {...props}
      />
    )
  }
)

HelperText.displayName = "HelperText"

export { HelperText }

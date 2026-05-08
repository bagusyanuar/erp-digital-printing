"use client"

import * as React from "react"
import { type IconType } from "react-icons"
import { type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { textFieldVariants } from "./TextField.variants"

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof textFieldVariants> {
  prefixIcon?: IconType;
  suffixIcon?: IconType;
}

const iconSizes = {
  default: 18,
  sm: 16,
  lg: 22,
} as const;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, variant, inputSize, prefixIcon: PrefixIcon, suffixIcon: SuffixIcon, ...props }, ref) => {
    const sizeKey = inputSize || "default";
    const iconSize = iconSizes[sizeKey as keyof typeof iconSizes];

    return (
      <div className="relative flex items-center w-full">
        {PrefixIcon && (
          <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            <PrefixIcon size={iconSize} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            textFieldVariants({ variant, inputSize, className }),
            PrefixIcon && "pl-10",
            SuffixIcon && "pr-10"
          )}
          {...props}
        />
        {SuffixIcon && (
          <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            <SuffixIcon size={iconSize} />
          </div>
        )}
      </div>
    )
  }
)

TextField.displayName = "TextField"

export { TextField }

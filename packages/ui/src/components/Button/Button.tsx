"use client"

import * as React from "react"
import { type IconType } from "react-icons"
import { LuLoader } from "../../icons"
import { type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./Button.variants"

const iconSizes = {
  default: 18,
  sm: 16,
  lg: 22,
  icon: 20,
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  prefixIcon?: IconType;
  suffixIcon?: IconType;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, prefixIcon: PrefixIcon, suffixIcon: SuffixIcon, loading, children, ...props }, ref) => {
    const sizeKey = size || "default";
    const iconSize = iconSizes[sizeKey as keyof typeof iconSizes];

    return (
      <button
        ref={ref}
        disabled={props.disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <LuLoader className="animate-spin" size={iconSize} />
        ) : (
          PrefixIcon && <PrefixIcon size={iconSize} />
        )}
        {children}
        {!loading && SuffixIcon && <SuffixIcon size={iconSize} />}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }

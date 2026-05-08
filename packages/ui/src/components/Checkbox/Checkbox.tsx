"use client"

import * as React from "react"
import { LuCheck } from "../../icons"
import { type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { checkboxVariants } from "./Checkbox.variants"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
  VariantProps<typeof checkboxVariants> { }

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div className="relative flex items-center justify-center w-fit">
        <input
          type="checkbox"
          ref={ref}
          className="peer absolute h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          {...props}
        />
        <div
          className={cn(
            checkboxVariants({ variant, size, className }),
            "flex items-center justify-center transition-all duration-200",
            // Manual state handling using peer selectors
            "peer-checked:bg-primary peer-checked:border-primary peer-checked:[&_svg]:scale-100",
            variant === "error" && "peer-checked:bg-red-500 peer-checked:border-red-500"
          )}
        >
          <LuCheck
            className="h-3.5 w-3.5 scale-0 text-primary-foreground transition-transform duration-200 stroke-3"
          />
        </div>
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }

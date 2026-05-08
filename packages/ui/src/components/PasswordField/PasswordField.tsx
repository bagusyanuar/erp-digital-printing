"use client"

import * as React from "react"
import { type IconType } from "react-icons"
import { LuEye, LuEyeOff } from "../../icons"
import { type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { textFieldVariants } from "../TextField/TextField.variants"

const iconSizes = {
  default: 18,
  sm: 16,
  lg: 22,
} as const;

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof textFieldVariants> {
  prefixIcon?: IconType;
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, variant, inputSize, prefixIcon: PrefixIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const sizeKey = inputSize || "default";
    const iconSize = iconSizes[sizeKey as keyof typeof iconSizes];

    const togglePassword = () => setShowPassword((prev) => !prev)
    const Icon = showPassword ? LuEyeOff : LuEye

    return (
      <div className="relative flex items-center w-full">
        {PrefixIcon && (
          <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            <PrefixIcon size={iconSize} />
          </div>
        )}
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn(
            textFieldVariants({ variant, inputSize, className }),
            PrefixIcon && "pl-10",
            "pr-10"
          )}
          {...props}
        />
        <button
          type="button"
          onClick={togglePassword}
          tabIndex={-1}
          className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
        >
          <Icon size={iconSize} />
        </button>
      </div>
    )
  }
)

PasswordField.displayName = "PasswordField"

export { PasswordField }

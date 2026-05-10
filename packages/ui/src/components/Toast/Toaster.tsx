"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toastStore } from "./ToastStore"
import { ToastProps } from "./Toast.types"
import { cn } from "../../lib/utils"
import { toastVariants } from "./Toast.variants"
import { LuX, LuCircleCheck, LuCircleAlert, LuTriangleAlert, LuInfo } from "react-icons/lu"
import { Typography } from "../Typography"
import { type IconType } from "react-icons"

// Stabilized animation constants — prevent re-creation per render
const MOTION_INITIAL = { opacity: 0, x: 40, scale: 0.95 } as const
const MOTION_ANIMATE = { opacity: 1, x: 0, scale: 1 } as const
const MOTION_EXIT = { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.15 } } as const

const ICON_MAP: Record<string, IconType | null> = {
  success: LuCircleCheck,
  error: LuCircleAlert,
  warning: LuTriangleAlert,
  info: LuInfo,
  default: null,
}

// Memoized individual toast item — prevents re-render when sibling toasts change
const ToastItem = React.memo(({ id, title, description, variant = "default" }: ToastProps) => {
  const Icon = ICON_MAP[variant]
  const handleRemove = React.useCallback(() => toastStore.remove(id), [id])

  return (
    <motion.div
      layout="position"
      initial={MOTION_INITIAL}
      animate={MOTION_ANIMATE}
      exit={MOTION_EXIT}
      className="pointer-events-auto"
    >
      <div className={cn(toastVariants({ variant }))}>
        <div className="flex gap-3 items-start">
          {Icon && (
            <div className="mt-0.5 shrink-0">
              <Icon size={18} />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {title && (
              <Typography variant="small" weight="bold" className="text-[13px] leading-tight text-inherit">
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="small" className="text-[12px] opacity-80 leading-normal text-inherit">
                {description}
              </Typography>
            )}
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="absolute right-2 top-2 rounded-md p-1 text-inherit opacity-0 transition-opacity hover:bg-black/5 dark:hover:bg-white/5 group-hover:opacity-100"
        >
          <LuX size={14} />
        </button>
      </div>
    </motion.div>
  )
})

ToastItem.displayName = "ToastItem"

export const Toaster = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  React.useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex max-h-screen w-full flex-col gap-3 md:max-w-[380px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  )
}

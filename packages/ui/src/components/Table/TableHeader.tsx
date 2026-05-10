import * as React from "react"
import { cn } from "../../lib/utils"

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b border-border/30 bg-muted/10", className)} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../Button"
import { Typography } from "../Typography"
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu"

export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalEntries: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: readonly number[]
  className?: string
}

// Stabilized default — prevents new array allocation per render
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export const TablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalEntries,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: TablePaginationProps) => {
  const from = Math.min((currentPage - 1) * pageSize + 1, totalEntries)
  const to = Math.min(currentPage * pageSize, totalEntries)

  // Memoize pagination range — only recalculate when page or totalPages changes
  const paginationRange = React.useMemo(() => {
    const delta = 1
    const range: number[] = []
    const result: (number | string)[] = []
    let prev: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (prev !== undefined) {
        if (i - prev === 2) {
          result.push(prev + 1)
        } else if (i - prev !== 1) {
          result.push("...")
        }
      }
      result.push(i)
      prev = i
    }

    return result
  }, [currentPage, totalPages])

  // Stabilized handlers
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages || totalPages === 0

  const goFirst = React.useCallback(() => onPageChange(1), [onPageChange])
  const goPrev = React.useCallback(() => onPageChange(currentPage - 1), [onPageChange, currentPage])
  const goNext = React.useCallback(() => onPageChange(currentPage + 1), [onPageChange, currentPage])
  const goLast = React.useCallback(() => onPageChange(totalPages), [onPageChange, totalPages])

  const handlePageSizeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onPageSizeChange?.(Number(e.target.value))
    },
    [onPageSizeChange]
  )

  return (
    <div className={cn("flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card", className)}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Typography variant="small" className="text-[12px] text-muted-foreground font-medium">Baris per halaman</Typography>
          <select 
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-muted/50 border border-border/50 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-muted"
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <Typography variant="small" className="text-[12px] text-muted-foreground font-medium border-l border-border/50 pl-6">
          Menampilkan <span className="font-bold text-foreground">{from}</span> - <span className="font-bold text-foreground">{to}</span> dari <span className="font-bold text-foreground">{totalEntries}</span> data
        </Typography>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          {/* First & Prev */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg border-border/50 hover:bg-muted"
            onClick={goFirst}
            disabled={isFirstPage}
          >
            <LuChevronsLeft size={14} />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg border-border/50 hover:bg-muted"
            onClick={goPrev}
            disabled={isFirstPage}
          >
            <LuChevronLeft size={14} />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 px-2">
            {paginationRange.map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="px-2 text-muted-foreground text-xs font-bold">
                    ...
                  </span>
                )
              }

              const isCurrent = page === currentPage
              return (
                <Button
                  key={`page-${page}`}
                  variant={isCurrent ? "default" : "outline"}
                  className={cn(
                    "h-8 w-8 p-0 text-[11px] font-black rounded-lg transition-all",
                    isCurrent 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                      : "border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          {/* Next & Last */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg border-border/50 hover:bg-muted"
            onClick={goNext}
            disabled={isLastPage}
          >
            <LuChevronRight size={14} />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg border-border/50 hover:bg-muted"
            onClick={goLast}
            disabled={isLastPage}
          >
            <LuChevronsRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

TablePagination.displayName = "TablePagination"


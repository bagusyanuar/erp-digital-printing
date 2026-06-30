import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addYears, subYears } from "date-fns";
import { motion } from "framer-motion";
import { DayPicker, type DateRange } from "react-day-picker";
import { LuCalendar, LuChevronLeft, LuChevronRight, LuX } from "../../icons";
import { cn } from "../../lib/utils";

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range?: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "error";
  isClearable?: boolean;
  mode?: "day" | "week" | "month" | "year";
}

export const DateRangePicker = ({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  className,
  disabled = false,
  variant = "default",
  isClearable = false,
  mode = "day",
}: DateRangePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(() => value?.from?.getFullYear() || new Date().getFullYear());

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  const displayText = React.useMemo(() => {
    if (!value?.from) return placeholder;
    if (mode === "month") {
      const fromStr = format(value.from, "MMM yyyy");
      if (!value.to) return fromStr;
      return `${fromStr} - ${format(value.to, "MMM yyyy")}`;
    }
    if (mode === "year") {
      const fromStr = format(value.from, "yyyy");
      if (!value.to) return fromStr;
      return `${fromStr} - ${format(value.to, "yyyy")}`;
    }
    if (!value.to) return format(value.from, "dd MMM yyyy");
    return `${format(value.from, "dd MMM yyyy")} - ${format(value.to, "dd MMM yyyy")}`;
  }, [value, placeholder, mode]);

  // Handle select for week/day mode (supports standard range selection)
  const handleSelectDay = (range: DateRange | undefined) => {
    if (!range) {
      onChange?.(undefined);
      return;
    }

    onChange?.(range);
    if (range.from && range.to) {
      setOpen(false);
    }
  };

  // Month select handler (handles range selection of months)
  const handleSelectMonth = (monthIndex: number) => {
    const selectedDate = new Date(currentYear, monthIndex, 1);
    
    // If no start date exists or both start and end date exist, set a new start date
    if (!value?.from || (value.from && value.to)) {
      onChange?.({ from: startOfMonth(selectedDate), to: undefined });
    } else {
      // If start date exists, check if selected date is before start date
      if (selectedDate < value.from) {
        onChange?.({ from: startOfMonth(selectedDate), to: undefined });
      } else {
        onChange?.({ from: value.from, to: endOfMonth(selectedDate) });
        setOpen(false);
      }
    }
  };

  // Year select handler (handles range selection of years)
  const handleSelectYear = (year: number) => {
    const selectedDate = new Date(year, 0, 1);
    
    // If no start date exists or both start and end date exist, set a new start date
    if (!value?.from || (value.from && value.to)) {
      onChange?.({ from: startOfYear(selectedDate), to: undefined });
    } else {
      // If start date exists, check if selected year is before start year
      if (selectedDate < value.from) {
        onChange?.({ from: startOfYear(selectedDate), to: undefined });
      } else {
        onChange?.({ from: value.from, to: endOfYear(selectedDate) });
        setOpen(false);
      }
    }
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  // Generate 12 years grid centered around currentYear
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 6; i++) {
      list.push(i);
    }
    return list;
  }, [currentYear]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left",
            variant === "default"
              ? "border-border focus:ring-primary"
              : "border-red-500 focus:ring-red-500",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <LuCalendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{displayText}</span>
          {isClearable && value?.from && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange?.(undefined);
                }
              }}
              className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LuX className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="z-50 overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-lg outline-none"
          >
            {mode === "day" || mode === "week" ? (
              <DayPicker
                mode="range"
                selected={value}
                onSelect={handleSelectDay}
                numberOfMonths={2}
                classNames={{
                  months: "flex flex-col sm:flex-row gap-4",
                  month: "space-y-4",
                  month_caption: "flex justify-center pt-1 relative items-center h-9",
                  caption_label: "text-sm font-semibold text-foreground",
                  nav: "flex items-center gap-1 absolute right-2 top-2 z-10",
                  button_previous: cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:bg-muted"
                  ),
                  button_next: cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:bg-muted"
                  ),
                  month_grid: "w-full border-collapse space-y-1",
                  weekdays: "flex",
                  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                  week: "flex w-full mt-2",
                  day: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md h-9 w-9"
                  ),
                  day_button: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-muted cursor-pointer transition-colors flex items-center justify-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  ),
                  selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  range_start: "day-range-start bg-primary text-primary-foreground rounded-l-md",
                  range_end: "day-range-end bg-primary text-primary-foreground rounded-r-md",
                  range_middle: "day-range-middle bg-accent text-accent-foreground rounded-none hover:bg-accent/80",
                  today: "bg-accent text-accent-foreground font-semibold",
                  outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  disabled: "text-muted-foreground opacity-30",
                  hidden: "invisible",
                }}
                components={{
                  Chevron: ({ ...props }) => {
                    if (props.orientation === "left") {
                      return <LuChevronLeft className="h-4 w-4" />;
                    }
                    return <LuChevronRight className="h-4 w-4" />;
                  },
                }}
              />
            ) : mode === "month" ? (
              <div className="w-[280px]">
                {/* Year Header Control */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/30">
                  <button
                    onClick={() => setCurrentYear(prev => prev - 1)}
                    className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <LuChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-black text-foreground">{currentYear}</span>
                  <button
                    onClick={() => setCurrentYear(prev => prev + 1)}
                    className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <LuChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Month Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {months.map((m, idx) => {
                    const checkDate = new Date(currentYear, idx, 1);
                    const isStart = value?.from && value.from.getFullYear() === currentYear && value.from.getMonth() === idx;
                    const isEnd = value?.to && value.to.getFullYear() === currentYear && value.to.getMonth() === idx;
                    const isInRange = value?.from && value.to && checkDate >= value.from && checkDate <= value.to;

                    return (
                      <button
                        key={m}
                        onClick={() => handleSelectMonth(idx)}
                        className={cn(
                          "py-3 text-xs font-bold rounded-lg border transition-all text-center",
                          isStart || isEnd
                            ? "bg-primary text-primary-foreground border-primary"
                            : isInRange
                              ? "bg-accent text-accent-foreground border-accent-foreground/20"
                              : "bg-card border-border hover:bg-muted hover:border-border/80"
                        )}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-[280px]">
                {/* Year Header Control */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/30">
                  <button
                    onClick={() => setCurrentYear(prev => prev - 10)}
                    className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <LuChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-black text-foreground">Pilih Tahun</span>
                  <button
                    onClick={() => setCurrentYear(prev => prev + 10)}
                    className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <LuChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Years Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => {
                    const checkDate = new Date(y, 0, 1);
                    const isStart = value?.from && value.from.getFullYear() === y;
                    const isEnd = value?.to && value.to.getFullYear() === y;
                    const isInRange = value?.from && value.to && checkDate >= value.from && checkDate <= value.to;

                    return (
                      <button
                        key={y}
                        onClick={() => handleSelectYear(y)}
                        className={cn(
                          "py-3 text-xs font-bold rounded-lg border transition-all text-center",
                          isStart || isEnd
                            ? "bg-primary text-primary-foreground border-primary"
                            : isInRange
                              ? "bg-accent text-accent-foreground border-accent-foreground/20"
                              : "bg-card border-border hover:bg-muted hover:border-border/80"
                        )}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

DateRangePicker.displayName = "DateRangePicker";
export type { DateRange };

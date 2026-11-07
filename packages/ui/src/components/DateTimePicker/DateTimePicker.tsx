"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { DayPicker, type Matcher } from "react-day-picker";
import {
  LuCalendar,
  LuClock,
  LuChevronLeft,
  LuChevronRight,
  LuX,
  LuCheck,
} from "../../icons";
import { cn } from "../../lib/utils";

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "error";
  isClearable?: boolean;
  minuteStep?: number;
  minDate?: Date;
  maxDate?: Date;
  formatStr?: string;
  defaultToNowOnOpen?: boolean;
}

export const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Pilih tanggal & waktu",
  className,
  disabled = false,
  variant = "default",
  isClearable = false,
  minuteStep = 5,
  minDate,
  maxDate,
  formatStr = "dd MMMM yyyy, HH:mm",
  defaultToNowOnOpen = true,
}: DateTimePickerProps) => {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !value && defaultToNowOnOpen) {
      onChange?.(new Date());
    }
  };

  const currentHour = value ? value.getHours() : new Date().getHours();
  const currentMinute = value ? value.getMinutes() : new Date().getMinutes();

  const minuteOptions = React.useMemo(() => {
    const step = Math.max(1, Math.min(60, minuteStep));
    const set = new Set<number>();
    for (let m = 0; m < 60; m += step) {
      set.add(m);
    }
    set.add(currentMinute);
    return Array.from(set).sort((a, b) => a - b);
  }, [minuteStep, currentMinute]);

  const disabledDays = React.useMemo<Matcher[] | undefined>(() => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange?.(undefined);
  };

  const handleSelectDate = (date?: Date) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }
    const updated = new Date(date);
    updated.setHours(currentHour, currentMinute, 0, 0);
    onChange?.(updated);
  };

  const handleHourChange = (newHour: number) => {
    const baseDate = value ? new Date(value) : new Date();
    baseDate.setHours(newHour, currentMinute, 0, 0);
    onChange?.(baseDate);
  };

  const handleMinuteChange = (newMinute: number) => {
    const baseDate = value ? new Date(value) : new Date();
    baseDate.setHours(currentHour, newMinute, 0, 0);
    onChange?.(baseDate);
  };

  const handleSetNow = () => {
    onChange?.(new Date());
  };

  const handlePresetTime = (h: number, m: number) => {
    const baseDate = value ? new Date(value) : new Date();
    baseDate.setHours(h, m, 0, 0);
    onChange?.(baseDate);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left",
            variant === "default"
              ? "border-border focus:ring-primary"
              : "border-red-500 focus:ring-red-500",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <LuCalendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">
            {value ? format(value, formatStr) : placeholder}
          </span>
          {isClearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LuX className="h-3.5 w-3.5" />
            </button>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={8} asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="z-[10000] overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-lg outline-none max-w-sm"
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleSelectDate}
              disabled={disabledDays}
              classNames={{
                months: "flex flex-col sm:flex-row gap-4",
                month: "space-y-4",
                month_caption:
                  "flex justify-center pt-1 relative items-center h-9",
                caption_label: "text-sm font-semibold text-foreground",
                nav: "flex items-center gap-1 absolute right-2 top-2 z-10",
                button_previous: cn(
                  "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:bg-muted",
                ),
                button_next: cn(
                  "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:bg-muted",
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                week: "flex w-full mt-2",
                day: "group relative p-0 text-center text-sm focus-within:relative focus-within:z-20 h-9 w-9",
                day_button: cn(
                  "h-9 w-9 p-0 font-normal rounded-md group-[.selected]:bg-primary group-[.selected]:text-primary-foreground group-[.selected]:hover:bg-primary/90 group-[:not(.selected)]:hover:bg-muted cursor-pointer transition-colors flex items-center justify-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary",
                ),
                selected: "selected",
                today:
                  "bg-accent text-accent-foreground font-semibold rounded-md",
                outside:
                  "day-outside text-muted-foreground opacity-50 group-[.selected]:bg-primary/30 aria-selected:text-muted-foreground aria-selected:opacity-30",
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

            {/* Time Picker Section */}
            <div className="border-t border-border/50 my-2 pt-2.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <LuClock className="h-4 w-4 text-primary" />
                  <span>Waktu:</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={currentHour}
                    onChange={(e) => handleHourChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-border/70 bg-card px-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors"
                    aria-label="Pilih Jam"
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      const hStr = i.toString().padStart(2, "0");
                      return (
                        <option
                          key={hStr}
                          value={i}
                          className="bg-background text-foreground"
                        >
                          {hStr}
                        </option>
                      );
                    })}
                  </select>

                  <span className="font-bold text-muted-foreground">:</span>

                  <select
                    value={currentMinute}
                    onChange={(e) => handleMinuteChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-border/70 bg-card px-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors"
                    aria-label="Pilih Menit"
                  >
                    {minuteOptions.map((m) => {
                      const mStr = m.toString().padStart(2, "0");
                      return (
                        <option
                          key={mStr}
                          value={m}
                          className="bg-background text-foreground"
                        >
                          {mStr}
                        </option>
                      );
                    })}
                  </select>

                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                    WIB
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 px-1 pt-0.5 overflow-x-auto">
                <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                  Preset:
                </span>
                <button
                  type="button"
                  onClick={handleSetNow}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
                >
                  Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetTime(12, 0)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
                >
                  12:00
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetTime(17, 0)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
                >
                  17:00
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetTime(21, 0)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
                >
                  21:00
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 px-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
                >
                  <LuCheck className="h-3.5 w-3.5" />
                  Selesai
                </button>
              </div>
            </div>
          </motion.div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

DateTimePicker.displayName = "DateTimePicker";

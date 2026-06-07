"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { LuCalendar, LuChevronLeft, LuChevronRight, LuX } from "../../icons";
import { cn } from "../../lib/utils";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "error";
  isClearable?: boolean;
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled = false,
  variant = "default",
  isClearable = false,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

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
            !value && "text-muted-foreground",
            className
          )}
        >
          <LuCalendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">
            {value ? format(value, "dd MMMM yyyy") : placeholder}
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
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange?.(date);
                setOpen(false);
              }}
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
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:rounded-md h-9 w-9"
                ),
                day_button: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-muted cursor-pointer transition-colors flex items-center justify-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                ),
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
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
          </motion.div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

DatePicker.displayName = "DatePicker";

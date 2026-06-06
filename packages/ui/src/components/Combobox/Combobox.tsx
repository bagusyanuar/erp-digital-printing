"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { LuCheck, LuChevronsUpDown, LuSearch } from "../../icons";
import { cn } from "../../lib/utils";

interface ComboboxContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  registerItem: (id: string, matches: boolean) => void;
  unregisterItem: (id: string) => void;
  matchingCount: number;
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useCombobox() {
  const context = React.useContext(ComboboxContext);
  if (!context) {
    throw new Error("Combobox components must be wrapped in <Combobox />");
  }
  return context;
}

export interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Combobox = ({
  value: controlledValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  children,
}: ComboboxProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState("");
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [matchingItems, setMatchingItems] = React.useState<Record<string, boolean>>({});

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
      if (!nextOpen) {
        setSearchQuery(""); // Reset search query when closing
      }
    },
    [controlledOpen, onOpenChange]
  );

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
      setOpen(false);
    },
    [controlledValue, onValueChange, setOpen]
  );

  const registerItem = React.useCallback((id: string, matches: boolean) => {
    setMatchingItems((prev) => {
      if (prev[id] === matches) return prev;
      return { ...prev, [id]: matches };
    });
  }, []);

  const unregisterItem = React.useCallback((id: string) => {
    setMatchingItems((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const matchingCount = React.useMemo(
    () => Object.values(matchingItems).filter(Boolean).length,
    [matchingItems]
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      open,
      setOpen,
      searchQuery,
      setSearchQuery,
      registerItem,
      unregisterItem,
      matchingCount,
    }),
    [value, handleValueChange, open, setOpen, searchQuery, registerItem, unregisterItem, matchingCount]
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </ComboboxContext.Provider>
  );
};

export const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverPrimitive.PopoverTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <PopoverPrimitive.Trigger asChild>
      <button
        ref={ref}
        type="button"
        role="combobox"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-left transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
        <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>
    </PopoverPrimitive.Trigger>
  );
});
ComboboxTrigger.displayName = "ComboboxTrigger";

export interface ComboboxContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  ComboboxContentProps
>(({ className, children, align = "start", sideOffset = 8, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={cn(
            "z-50 min-w-[200px] overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-1 shadow-lg outline-none",
            className
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
ComboboxContent.displayName = "ComboboxContent";

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const { searchQuery, setSearchQuery } = useCombobox();

  return (
    <div className="flex items-center border-b border-border/50 px-2.5 py-1.5">
      <LuSearch className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      <input
        ref={ref}
        className={cn(
          "flex h-7 w-full rounded-md bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        {...props}
      />
    </div>
  );
});
ComboboxInput.displayName = "ComboboxInput";

export const ComboboxList = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("max-h-[200px] overflow-y-auto overflow-x-hidden p-1", className)}
      {...props}
    >
      {children}
    </div>
  );
};
ComboboxList.displayName = "ComboboxList";

export interface ComboboxItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  keywords?: string[];
}

export const ComboboxItem = React.forwardRef<
  HTMLButtonElement,
  ComboboxItemProps
>(({ className, children, value, keywords, ...props }, ref) => {
  const { value: selectedValue, onValueChange, searchQuery, registerItem, unregisterItem } = useCombobox();

  const isSelected = selectedValue === value;

  const textContent = React.useMemo(() => {
    if (typeof children === "string") return children;
    return value;
  }, [children, value]);

  const matches = React.useMemo(() => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (textContent.toLowerCase().includes(query)) return true;
    if (value.toLowerCase().includes(query)) return true;
    if (keywords?.some((k) => k.toLowerCase().includes(query))) return true;
    return false;
  }, [searchQuery, textContent, value, keywords]);

  const id = React.useId();
  React.useEffect(() => {
    registerItem(id, matches);
    return () => unregisterItem(id);
  }, [id, matches, registerItem, unregisterItem]);

  if (!matches) return null;

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-xs font-semibold outline-none transition-colors duration-150 active:scale-[0.98] hover:bg-muted/70 hover:text-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 text-left",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <LuCheck className="h-3.5 w-3.5 text-foreground" />}
      </span>
      {children}
    </button>
  );
});
ComboboxItem.displayName = "ComboboxItem";

export const ComboboxEmpty = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { matchingCount } = useCombobox();

  if (matchingCount > 0) return null;

  return (
    <div
      className={cn("py-6 text-center text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
};
ComboboxEmpty.displayName = "ComboboxEmpty";

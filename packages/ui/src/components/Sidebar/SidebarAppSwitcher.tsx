import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";
import { SidebarAppSwitcherProps } from "./Sidebar.types";
import { LuChevronsUpDown, LuPrinter, LuLayers, LuCheck, LuSettings } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

const apps = [
  {
    id: "digital-printing",
    name: "Digital Printing",
    description: "Production & Sales",
    icon: <LuPrinter className="h-5 w-5" />,
  },
  {
    id: "flex-app",
    name: "Flex App",
    description: "Management System",
    icon: <LuLayers className="h-5 w-5" />,
  },
];

export const SidebarAppSwitcher = ({ currentApp, className }: SidebarAppSwitcherProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("px-4 py-3", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className={cn(
            "flex w-full items-center gap-3 rounded-xl bg-sidebar-accent border border-border p-3 text-left transition-all hover:bg-sidebar-accent/80 focus:outline-none",
            open && "bg-sidebar-accent"
          )}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              {currentApp.icon}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-sidebar-foreground leading-tight">{currentApp.name}</span>
              <span className="truncate text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{currentApp.description}</span>
            </div>
            <LuChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="right"
            align="start"
            sideOffset={12}
            className="z-50"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-64 rounded-xl border border-border bg-card p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              <div className="px-3 py-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pilih Aplikasi</span>
              </div>
              
              <div className="space-y-1 mt-1">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all hover:bg-sidebar-accent group",
                      currentApp.name === app.name && "bg-sidebar-accent/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border transition-colors",
                      currentApp.name === app.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-sidebar-foreground"
                    )}>
                      {app.icon}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className={cn(
                        "truncate text-sm font-semibold leading-tight",
                        currentApp.name === app.name ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                      )}>
                        {app.name}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">{app.description}</span>
                    </div>
                    {currentApp.name === app.name && (
                      <LuCheck className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-2 border-t border-border pt-2 px-1">
                <button className="flex w-full items-center gap-2 rounded-lg p-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
                  <LuSettings className="h-3.5 w-3.5" />
                  Manajemen Aplikasi
                </button>
              </div>
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

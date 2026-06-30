import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";
import { SidebarFooterProps } from "./Sidebar.types";
import { LuChevronsUpDown, LuUser, LuLogOut, LuSettings, LuShield } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

export const SidebarFooter = ({ user, onLogout, className }: SidebarFooterProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("mt-auto p-4 border-t border-border", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-border bg-sidebar-accent/50 p-3 text-left transition-all hover:bg-sidebar-accent focus:outline-none",
            open && "bg-sidebar-accent"
          )}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground leading-tight">{user.name}</span>
              <span className="truncate text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{user.role}</span>
            </div>
            <LuChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="right"
            align="end"
            sideOffset={12}
            className="z-50"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-56 rounded-xl border border-border bg-card p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-sidebar-foreground">{user.name}</span>
                  <span className="text-[10px] font-medium text-muted-foreground truncate">{user.role}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all group">
                  <LuUser className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  Profil Saya
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all group">
                  <LuSettings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  Pengaturan Akun
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all group">
                  <LuShield className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  Keamanan
                </button>
              </div>

              <div className="mt-1 border-t border-border pt-1">
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <LuLogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

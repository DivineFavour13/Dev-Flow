"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  GitBranch,
  Search,
  ChevronLeft,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import type { SessionUser } from "@/types";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/dashboard/repos", icon: GitBranch, label: "Repositories" },
  { href: "/dashboard/search", icon: Search, label: "Search" },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col border-r border-border bg-card overflow-hidden shrink-0"
    >
      <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-background" />
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-sm text-foreground whitespace-nowrap"
              >
                DevFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 h-9 px-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-foreground/10 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence initial={false}>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <div
          className={cn(
            "flex items-center gap-2.5 px-2 py-2 rounded-md",
            "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
            "transition-colors cursor-pointer"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
          role="button"
          tabIndex={0}
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
          )}
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <LogOut className="w-3 h-3" /> Sign out
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-4 -right-3 w-6 h-6 rounded-full",
          "border border-border bg-card",
          "flex items-center justify-center",
          "hover:bg-muted transition-colors z-10"
        )}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        </motion.div>
      </button>
    </motion.aside>
  );
}

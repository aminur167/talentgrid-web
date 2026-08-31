"use client";

import { useState } from "react";
import {
  House,
  Briefcase,
  Factory,
  Persons,
  Gear,
  ArrowRightFromSquare as SignOutIcon,
  Bars,
  Xmark,
  Moon,
  Sun,
  ShieldCheck,
} from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { icon: House, href: "/dashboard/admin", label: "Control Center", exact: true },
  { icon: Persons, href: "/dashboard/admin/users", label: "User Directory" },
  { icon: Factory, href: "/dashboard/admin/companies", label: "Company Approvals" },
  { icon: Briefcase, href: "/dashboard/admin/jobs", label: "Job Moderation" },
  { icon: Gear, href: "/dashboard/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const sidebarNav = (
    <div className="flex flex-col h-full justify-between bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] text-[var(--text-primary)] select-none">
      {/* Top Header / Brand */}
      <div className="flex flex-col">
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.07]">
          <Link href="/dashboard/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <span className="text-black font-extrabold text-sm tracking-wider">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-tight group-hover:text-amber-300 transition-colors">TalentGrid</span>
              <span className="text-[9px] font-mono font-semibold text-amber-400 -mt-0.5">ADMIN ROOT</span>
            </div>
          </Link>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-neutral-400 hover:text-white p-1">
              <Xmark className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 px-3 py-4">
          <span className="px-3 text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase mb-1">
            PLATFORM OVERSIGHT
          </span>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/25"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-black" : "text-neutral-500"}`} />
                <span>{item.label}</span>
                {active && <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Theme / Sign Out Footer */}
      <div className="p-3 border-t border-white/[0.07] flex flex-col gap-2">
        {session?.user && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{session.user.name || "Administrator"}</p>
                <p className="text-[10px] text-neutral-400 truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              title="Switch theme"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              {theme === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full cursor-pointer"
        >
          <SignOutIcon className="w-4 h-4 text-neutral-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0 z-40 flex-col">
        {sidebarNav}
      </aside>

      <div className="lg:hidden sticky top-0 z-40 bg-[var(--bg-sidebar)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold text-xs">
            T
          </div>
          <span className="text-white font-bold text-sm">TalentGrid</span>
          <span className="text-[9px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full font-bold">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-neutral-300 hover:text-white p-1.5 rounded-lg bg-white/5 border border-white/10"
        >
          <Bars className="w-5 h-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full z-10 animate-in slide-in-from-left">
            {sidebarNav}
          </div>
        </div>
      )}
    </>
  );
}

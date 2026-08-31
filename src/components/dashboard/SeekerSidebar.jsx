"use client";

import { useState } from "react";
import {
  House,
  Magnifier,
  FileText,
  CrownDiamond,
  Person,
  Gear,
  ArrowRightFromSquare as SignOutIcon,
  Bars,
  Xmark,
  Moon,
  Sun,
  Pencil,
} from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { icon: House, href: "/dashboard/seeker", label: "Overview", exact: true },
  { icon: Person, href: "/dashboard/seeker/settings", label: "My Profile" },
  { icon: Magnifier, href: "/jobs", label: "Browse Roles" },
  { icon: FileText, href: "/dashboard/seeker/applications", label: "My Applications" },
  { icon: CrownDiamond, href: "/plans", label: "Subscription Plans" },
];

export function SeekerSidebar() {
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
        <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--border-color)]">
          <Link href="/dashboard/seeker" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#6254f5] to-[#8277ff] flex items-center justify-center shadow-lg shadow-[#6254f5]/30">
              <span className="text-white font-extrabold text-sm tracking-wider">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight group-hover:text-[#6254f5] transition-colors" style={{ color: "var(--text-primary)" }}>TalentGrid</span>
              <span className="text-[9px] font-mono font-semibold text-emerald-500 -mt-0.5">CANDIDATE SUITE</span>
            </div>
          </Link>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1" style={{ color: "var(--text-muted)" }}>
              <Xmark className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 px-3 py-4">
          <span className="px-3 text-[10px] font-mono font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
            WORKSPACE
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
                    ? "bg-[#6254f5] text-white shadow-lg shadow-[#6254f5]/25 font-bold"
                    : "hover:bg-white/[0.06]"
                }`}
                style={{
                  color: active ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                <item.icon className="w-4 h-4 shrink-0" style={{ color: active ? "#ffffff" : "var(--text-muted)" }} />
                <span>{item.label}</span>
                {active && <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Theme / Sign Out Footer */}
      <div className="p-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        {/* Clickable User Card */}
        {session?.user && (
          <Link
            href="/dashboard/seeker/settings"
            title="Click to edit your profile"
            className="border rounded-xl p-2.5 flex items-center justify-between gap-2 group transition-all"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">
                {(session.user.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-[#6254f5] transition-colors" style={{ color: "var(--text-primary)" }}>
                  {session.user.name || "Candidate"}
                </p>
                <p className="text-[10px] truncate flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  <Pencil className="w-2.5 h-2.5" /> Edit Profile
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              title="Switch theme"
              className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              {theme === "light" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </Link>
        )}

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all w-full cursor-pointer"
        >
          <SignOutIcon className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0 z-40 flex-col">
        {sidebarNav}
      </aside>

      {/* Mobile Header & Slide-over Drawer */}
      <div className="lg:hidden sticky top-0 z-40 bg-[var(--bg-sidebar)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard/seeker" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6254f5] flex items-center justify-center text-white font-bold text-xs">
            T
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>TalentGrid</span>
          <span className="text-[9px] text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">Seeker</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg border"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
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

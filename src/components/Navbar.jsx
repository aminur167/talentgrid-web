"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowRightFromSquare,
  LayoutSideContentLeft,
  Moon,
  Sun,
  Person,
  Pencil,
  FileText,
  CrownDiamond,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  Bell,
  BellDot,
  Bookmark,
  Check,
  TrashBin,
  Bars,
  Xmark,
} from "@gravity-ui/icons";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "@/context/ThemeContext";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const { data: session, isPending } = useSession();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live notifications
  const fetchNotifications = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`${BASE_URL}/api/notifications?email=${encodeURIComponent(session.user.email)}&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.email]);

  const handleMarkAllRead = async () => {
    if (!session?.user?.email) return;
    try {
      await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await fetch(`${BASE_URL}/api/notifications/${notif._id}/read`, { method: "PATCH" });
        setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    setIsNotificationOpen(false);
    if (notif.link) router.push(notif.link);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsSigningOut(false);
            setIsMenuOpen(false);
            setIsProfileOpen(false);
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Sign out error:", err);
      setIsSigningOut(false);
    }
  };

  const userRole = session?.user?.role || "job_seeker";
  const userInitial = (session?.user?.name || session?.user?.email || "U")[0].toUpperCase();

  const dashboardRoute =
    userRole === "admin"
      ? "/dashboard/admin"
      : userRole === "recruiter"
      ? "/dashboard/recruiter"
      : "/dashboard/seeker";

  const settingsRoute =
    userRole === "admin"
      ? "/dashboard/admin/settings"
      : userRole === "recruiter"
      ? "/dashboard/recruiter/settings"
      : "/dashboard/seeker/settings";

  const applicationsRoute =
    userRole === "recruiter"
      ? "/dashboard/recruiter/jobs"
      : userRole === "admin"
      ? "/dashboard/admin/jobs"
      : "/dashboard/seeker/applications";

  const navLinks = [
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Companies", href: "/company" },
    { label: "Pricing & Plans", href: "/plans" },
    ...(session?.user ? [{ label: "Dashboard", href: dashboardRoute, isDashboard: true }] : []),
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
        color: "var(--text-primary)",
      }}
    >
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90 group" aria-label="TalentGrid Home">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#6254f5] via-[#7b6eff] to-[#a198ff] flex items-center justify-center shadow-lg shadow-[#6254f5]/30">
              <span className="text-white font-extrabold text-base tracking-wider">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight group-hover:text-[#6254f5] transition-colors leading-none" style={{ color: "var(--text-primary)" }}>
                TalentGrid
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-widest mt-0.5" style={{ color: "var(--accent)" }}>
                PLATFORM
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.isDashboard && pathname.startsWith("/dashboard"));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm transition-all duration-150 flex items-center gap-1.5 ${
                    link.isDashboard
                      ? "px-3.5 py-1.5 rounded-xl border shadow-xs"
                      : ""
                  }`}
                  style={{
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? 700 : 500,
                    borderBottom: !link.isDashboard && isActive ? "2px solid var(--accent)" : "none",
                    paddingBottom: !link.isDashboard && isActive ? "4px" : "0",
                    backgroundColor: link.isDashboard
                      ? isActive
                        ? "var(--accent-light)"
                        : "var(--bg-card)"
                      : "transparent",
                    borderColor: link.isDashboard
                      ? isActive
                        ? "var(--accent-border)"
                        : "var(--border-color)"
                      : "transparent",
                  }}
                >
                  {link.isDashboard && (
                    <LayoutSideContentLeft className="w-4 h-4 text-[#6254f5]" />
                  )}
                  <span>{link.label}</span>
                  {link.isDashboard && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Action Icons: Notifications, Theme Switcher, and Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={`Toggle theme (Warm Cream / Dark / Midnight)`}
            className="p-2 rounded-xl border transition-all cursor-pointer hover:scale-105"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {theme === "light" ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === "dark" ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* Logged-In User Actions: Notifications + Profile */}
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg" style={{ backgroundColor: "var(--border-color)" }} />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              {/* 🔔 Notification Bell Icon & Popover */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 rounded-xl border transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: isNotificationOpen ? "var(--accent-light)" : "var(--bg-card)",
                    borderColor: isNotificationOpen ? "var(--accent-border)" : "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  title="Notifications"
                >
                  {unreadCount > 0 ? (
                    <BellDot className="w-4 h-4 text-[#ff7a00]" />
                  ) : (
                    <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Flyout */}
                {isNotificationOpen && (
                  <div
                    className="absolute right-0 top-12 mt-2 w-80 sm:w-96 rounded-2xl border p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    <div className="flex items-center justify-between border-b pb-2.5 px-2" style={{ borderColor: "var(--border-color)" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#6254f5] hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="py-2 max-h-80 overflow-y-auto flex flex-col gap-1.5 divide-y divide-[var(--border-color)]">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                          No notifications yet. You're all caught up! ✨
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className="pt-2 px-2 pb-2 rounded-xl transition-colors cursor-pointer flex items-start gap-3"
                            style={{
                              backgroundColor: n.isRead ? "transparent" : "var(--accent-light)",
                            }}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                              n.type === 'interview_scheduled' ? 'bg-purple-500/20 text-purple-500' :
                              n.type === 'status_updated' ? 'bg-emerald-500/20 text-emerald-500' :
                              'bg-amber-500/20 text-amber-500'
                            }`}>
                              {n.type === 'interview_scheduled' ? '📅' : n.type === 'status_updated' ? '✨' : '🔔'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                                {n.title}
                              </p>
                              <p className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                                {n.message}
                              </p>
                              <span className="text-[9px] mt-1 block" style={{ color: "var(--text-muted)" }}>
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                              </span>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#6254f5] shrink-0 mt-1" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Trigger Button */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full border pl-2 pr-3 py-1.5 text-xs transition-all cursor-pointer group"
                  style={{
                    backgroundColor: isProfileOpen ? "var(--accent-light)" : "var(--bg-card)",
                    borderColor: isProfileOpen ? "var(--accent-border)" : "var(--border-color)",
                    color: "var(--text-primary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-tr from-[#6254f5] to-[#8277ff] text-[10px] font-bold text-white shadow-sm shrink-0">
                    {userInitial}
                  </span>
                  <span className="max-w-[110px] truncate font-medium">
                    {session.user.name || session.user.email}
                  </span>
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    userRole === "admin"
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-500"
                      : userRole === "recruiter"
                      ? "border-[#ff7a00]/40 bg-[#ff7a00]/15 text-[#ff7a00]"
                      : "border-[#6254f5]/40 bg-[#6254f5]/15 text-[#6254f5]"
                  }`}>
                    {userRole === "admin" ? "Admin" : userRole === "recruiter" ? "Recruiter" : "Seeker"}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Profile Popup Dropdown */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 top-12 mt-2 w-72 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    <div className="p-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border-color)" }}>
                      <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#6254f5] to-[#8277ff] flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                          {session.user.name || "User"}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="py-2 flex flex-col gap-1">
                      <Link
                        href={settingsRoute}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                        <span>Edit My Profile</span>
                      </Link>

                      <Link
                        href={dashboardRoute}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <LayoutSideContentLeft className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                        <span>My Workspace Dashboard</span>
                      </Link>

                      {userRole === "job_seeker" && (
                        <Link
                          href="/dashboard/seeker/saved-jobs"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                          <span>Saved Bookmarks</span>
                        </Link>
                      )}

                      <Link
                        href={applicationsRoute}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {userRole === "recruiter" ? (
                          <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <span>
                          {userRole === "recruiter" ? "My Job Postings" : userRole === "admin" ? "All Jobs" : "My Applications"}
                        </span>
                      </Link>

                      <Link
                        href="/plans"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <CrownDiamond className="w-3.5 h-3.5 text-amber-400" />
                        <span>Subscription &amp; Plans</span>
                      </Link>
                    </div>

                    <div className="border-t pt-2" style={{ borderColor: "var(--border-color)" }}>
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <ArrowRightFromSquare className="h-3.5 w-3.5" />
                        {isSigningOut ? "Signing Out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="rounded-xl px-4 py-2 text-xs font-bold transition-all border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition-all"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Icons: Theme + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border cursor-pointer"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {theme === "light" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl border cursor-pointer"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {isMenuOpen ? <Xmark className="w-5 h-5" /> : <Bars className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Drawer Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-3 duration-200"
          style={{
            backgroundColor: "var(--bg-sidebar)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.isDashboard && pathname.startsWith("/dashboard"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                    isActive ? "font-bold shadow-xs" : ""
                  }`}
                  style={{
                    backgroundColor: isActive ? "var(--accent-light)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-primary)",
                    border: isActive ? "1px solid var(--accent-border)" : "none",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {link.isDashboard && <LayoutSideContentLeft className="w-4 h-4 text-[#6254f5]" />}
                    {link.label}
                  </span>
                  {link.isDashboard && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      Workspace
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {session?.user ? (
            <div className="border-t pt-4 flex flex-col gap-2" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#6254f5] to-[#8277ff] text-white flex items-center justify-center font-bold text-xs">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{session.user.name || "User"}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{session.user.email}</p>
                </div>
              </div>

              <Link
                href={settingsRoute}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </Link>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 flex items-center gap-2 hover:bg-red-500/10 cursor-pointer"
              >
                <ArrowRightFromSquare className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t pt-4 flex items-center gap-3" style={{ borderColor: "var(--border-color)" }}>
              <Link
                href="/auth/signin"
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border text-xs font-bold"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

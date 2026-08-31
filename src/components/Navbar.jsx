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
} from "@gravity-ui/icons";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "@/context/ThemeContext";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileDropdownRef = useRef(null);

  const { data: session, isPending } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const navLinks = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "Companies", href: "/company" },
    { name: "Pricing & Plans", href: "/plans" },
  ];

  const getDashboardRoute = () => {
    const role = session?.user?.role;
    if (role === "admin") return "/dashboard/admin";
    if (role === "recruiter") return "/dashboard/recruiter";
    return "/dashboard/seeker";
  };

  const getSettingsRoute = () => {
    const role = session?.user?.role;
    if (role === "admin") return "/dashboard/admin/settings";
    if (role === "recruiter") return "/dashboard/recruiter/settings";
    return "/dashboard/seeker/settings";
  };

  const getApplicationsRoute = () => {
    const role = session?.user?.role;
    if (role === "admin") return "/dashboard/admin/jobs";
    if (role === "recruiter") return "/dashboard/recruiter/jobs";
    return "/dashboard/seeker/applications";
  };

  const dashboardRoute = getDashboardRoute();
  const settingsRoute = getSettingsRoute();
  const applicationsRoute = getApplicationsRoute();

  const userRole = session?.user?.role || "job_seeker";
  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "U";

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
        
        {/* ==================== LOGO ==================== */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
            aria-label="TalentGrid Home"
          >
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

        {/* ==================== DESKTOP NAVIGATION ==================== */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  prefetch={true}
                  className="text-sm transition-all duration-150"
                  style={{
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? "700" : "500",
                    borderBottom: isActive ? "2px solid var(--accent)" : "none",
                    paddingBottom: isActive ? "4px" : "0",
                  }}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ==================== DESKTOP ACTIONS ==================== */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme (Warm Cream / Dark / Midnight)"
            className="p-2 rounded-xl border transition-all cursor-pointer"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {theme === "light" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg" style={{ backgroundColor: "var(--border-color)" }} />
          ) : session?.user ? (
            /* Logged In State with Interactive Profile Dropdown */
            <div className="flex items-center gap-3 relative" ref={profileDropdownRef}>
              
              <Link
                href={dashboardRoute}
                className="flex items-center gap-2 rounded-xl text-white px-4 py-2 text-xs font-bold shadow-lg transition-all cursor-pointer"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <LayoutSideContentLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>

              {/* Interactive User Profile Trigger Button */}
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

              {/* ==================== PROFILE POPUP DROPDOWN ==================== */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 top-12 mt-2 w-72 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {/* User Profile Header */}
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

                  {/* Dropdown Navigation Links */}
                  <div className="py-2 flex flex-col gap-1">
                    <Link
                      href={settingsRoute}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <Pencil className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                      <span>Edit My Profile</span>
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                        New
                      </span>
                    </Link>

                    <Link
                      href={dashboardRoute}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <LayoutSideContentLeft className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                      <span>My Workspace Dashboard</span>
                    </Link>

                    <Link
                      href={applicationsRoute}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      {userRole === "recruiter" ? (
                        <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span>{userRole === "recruiter" ? "My Job Postings" : "My Applications"}</span>
                    </Link>

                    <Link
                      href="/plans"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <CrownDiamond className="w-3.5 h-3.5 text-pink-500" />
                      <span>Subscription &amp; Plans</span>
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t pt-1" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <ArrowRightFromSquare className="w-3.5 h-3.5" />
                      <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-500 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
              >
                <ArrowRightFromSquare className="h-3.5 w-3.5" />
                {isSigningOut ? "..." : "Sign Out"}
              </button>
            </div>
          ) : (
            /* Logged Out State */
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "var(--accent)" }}
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Get Started →
              </Link>
            </div>
          )}
        </div>

        {/* ==================== MOBILE MENU BUTTON ==================== */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          >
            {theme === "light" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </header>

      {/* ==================== MOBILE NAVIGATION ==================== */}
      {isMenuOpen && (
        <div className="border-t md:hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="mx-auto max-w-7xl px-6 py-5">
            <ul className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}

              <li className="my-2 border-t" style={{ borderColor: "var(--border-color)" }} />

              {session?.user ? (
                <>
                  <li>
                    <Link
                      href={dashboardRoute}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold text-white shadow-lg"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <LayoutSideContentLeft className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={settingsRoute}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-center text-xs font-bold border mt-1"
                      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    >
                      <Pencil className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                      Edit My Profile
                    </Link>
                  </li>
                  <li className="px-3 py-2 text-xs font-semibold flex items-center justify-between" style={{ color: "var(--text-muted)" }}>
                    <span>{session.user.name || session.user.email}</span>
                    <span className="text-[10px] uppercase font-bold" style={{ color: "var(--accent)" }}>
                      {userRole}
                    </span>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-5 py-2.5 text-center text-sm font-semibold text-red-500 cursor-pointer"
                    >
                      <ArrowRightFromSquare className="h-4 w-4" />
                      {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-1 block rounded-lg px-5 py-3 text-center text-sm font-semibold text-white shadow-lg"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

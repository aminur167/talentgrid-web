"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowRightFromSquare, LayoutSideContentLeft, Moon, Sun } from "@gravity-ui/icons";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "@/context/ThemeContext";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsSigningOut(false);
            setIsMenuOpen(false);
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
    {
      name: "Browse Jobs",
      href: "/jobs",
    },
    {
      name: "Companies",
      href: "/company",
    },
    {
      name: "Pricing & Plans",
      href: "/plans",
    },
  ];

  const getDashboardRoute = () => {
    const role = session?.user?.role;
    if (role === "admin") return "/dashboard/admin";
    if (role === "recruiter") return "/dashboard/recruiter";
    return "/dashboard/seeker";
  };

  const dashboardRoute = getDashboardRoute();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0c0c0e]/90 backdrop-blur-xl transition-all">
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
              <span className="text-white font-extrabold text-lg tracking-tight group-hover:text-[#a198ff] transition-colors leading-none">
                TalentGrid
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-widest text-[#a198ff] mt-0.5">
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
                  className={`text-sm transition-all duration-150 ${
                    isActive
                      ? "text-white font-bold border-b-2 border-[#6254f5] pb-1"
                      : "text-neutral-400 font-medium hover:text-white"
                  }`}
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
            title="Toggle theme (Dark / Midnight / Light)"
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
          ) : session?.user ? (
            /* Logged In State */
            <div className="flex items-center gap-3">
              <Link
                href={dashboardRoute}
                className="flex items-center gap-2 rounded-xl bg-[#6254f5] hover:bg-[#7164ff] text-white px-4 py-2 text-xs font-bold shadow-lg shadow-[#6254f5]/25 transition-all cursor-pointer"
              >
                <LayoutSideContentLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-2 pr-3.5 py-1.5 text-xs text-gray-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-tr from-[#6254f5] to-[#8277ff] text-[10px] font-bold text-white shadow-sm">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="max-w-[120px] truncate font-medium text-white">
                  {session.user.name || session.user.email}
                </span>
                {session.user.role && (
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    session.user.role === "admin"
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                      : session.user.role === "recruiter"
                      ? "border-[#ff7a00]/40 bg-[#ff7a00]/15 text-[#ff9838]"
                      : "border-[#6254f5]/40 bg-[#6254f5]/15 text-[#a198ff]"
                  }`}>
                    {session.user.role === "admin" ? "Admin" : session.user.role === "recruiter" ? "Recruiter" : "Seeker"}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 cursor-pointer"
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
                className="text-sm font-medium text-[#8277ff] transition-colors duration-200 hover:text-[#a198ff]"
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-xl bg-[#6254f5] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6254f5]/20 transition-all duration-200 hover:bg-[#7164ff] hover:shadow-[#6254f5]/30 cursor-pointer"
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
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-neutral-300"
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
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
        <div className="border-t border-white/10 bg-[#121214] md:hidden">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <ul className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}

              <li className="my-2 border-t border-white/10" />

              {session?.user ? (
                <>
                  <li>
                    <Link
                      href={dashboardRoute}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#6254f5] px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#6254f5]/25"
                    >
                      <LayoutSideContentLeft className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </li>
                  <li className="px-3 py-2 text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span>{session.user.name || session.user.email}</span>
                    <span className="text-[10px] uppercase font-bold text-[#a198ff]">
                      {session.user.role || "Seeker"}
                    </span>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-5 py-2.5 text-center text-sm font-semibold text-red-400"
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
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-[#8277ff] hover:bg-white/5 hover:text-[#a198ff]"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-1 block rounded-lg bg-[#6254f5] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#6254f5]/20 hover:bg-[#7164ff]"
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

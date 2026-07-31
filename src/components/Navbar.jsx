"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ArrowRightFromSquare, LayoutSideContentLeft } from "@gravity-ui/icons";
import { authClient, useSession } from "@/lib/auth-client";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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
      name: "Company",
      href: "/company",
    },
    {
      name: "Pricing",
      href: "/pricing",
    },
  ];

  // Resolve user dashboard route based on role
  const getDashboardRoute = () => {
    const role = session?.user?.role;
    if (role === "admin") return "/dashboard/admin";
    if (role === "recruiter") return "/dashboard/recruiter";
    return "/dashboard/seeker";
  };

  const dashboardRoute = getDashboardRoute();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#141416]/90 backdrop-blur-xl transition-all">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* ==================== LOGO ==================== */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90"
            aria-label="Hireloop Home"
          >
            <Image
              src="/images/logo.png"
              alt="Hireloop"
              width={140}
              height={38}
              className="h-8 w-auto object-contain"
              priority
            />
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
        <div className="hidden items-center gap-4 md:flex">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
          ) : session?.user ? (
            /* Logged In State */
            <div className="flex items-center gap-3">
              {/* Direct Role-based Dashboard Button */}
              <Link
                href={dashboardRoute}
                className="flex items-center gap-2 rounded-xl bg-[#6254f5] hover:bg-[#7164ff] text-white px-4 py-2 text-xs font-bold shadow-lg shadow-[#6254f5]/25 transition-all"
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
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-[#8277ff] transition-colors duration-200 hover:text-[#a198ff]"
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-lg bg-[#6254f5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6254f5]/20 transition-all duration-200 hover:bg-[#7164ff] hover:shadow-[#6254f5]/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* ==================== MOBILE MENU BUTTON ==================== */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">
            {isMenuOpen ? "Close menu" : "Open menu"}
          </span>

          {isMenuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* ==================== MOBILE NAVIGATION ==================== */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#1f1f21] md:hidden">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-300 transition-colors duration-200 hover:bg-white/5 hover:text-white"
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
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-5 py-2.5 text-center text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/20"
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
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-[#8277ff] transition-colors duration-200 hover:bg-white/5 hover:text-[#a198ff]"
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

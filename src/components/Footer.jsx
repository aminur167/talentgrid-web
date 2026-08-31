"use client";

import { ArrowUpRight } from "@gravity-ui/icons";
import Link from "next/link";

function Footer() {
  const productLinks = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "Companies", href: "/company" },
    { name: "Pricing & Plans", href: "/plans" },
    { name: "For Recruiters", href: "/dashboard/recruiter" },
  ];

  const candidateLinks = [
    { name: "Candidate Suite", href: "/dashboard/seeker" },
    { name: "My Applications", href: "/dashboard/seeker/applications" },
    { name: "Profile Settings", href: "/dashboard/seeker/settings" },
    { name: "Free Quota", href: "/plans" },
  ];

  const companyLinks = [
    { name: "About TalentGrid", href: "/" },
    { name: "Employer ATS", href: "/dashboard/recruiter" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="w-full border-t transition-colors duration-200" style={{ backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
        {/* ==================== MAIN FOOTER ==================== */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-14">

          {/* ==================== BRAND ==================== */}
          <div className="lg:pr-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="TalentGrid Home"
            >
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#6254f5] to-[#8277ff] flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-sm">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
                  TalentGrid
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: "var(--accent)" }}>
                  PLATFORM
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The next-generation talent marketplace and SaaS recruitment platform connecting elite engineers, designers, and high-growth companies.
            </p>
          </div>

          {/* ==================== PRODUCT ==================== */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              Platform
            </h3>

            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-xs transition-colors duration-200"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================== CANDIDATES ==================== */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              Job Seekers
            </h3>

            <ul className="mt-4 space-y-3">
              {candidateLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-xs transition-colors duration-200"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================== COMPANY ==================== */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              Company
            </h3>

            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-xs transition-colors duration-200"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ==================== BOTTOM BAR ==================== */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          <p>© {new Date().getFullYear()} TalentGrid Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
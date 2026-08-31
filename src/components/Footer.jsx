"use client";

import { ArrowUpRight, Globe, GithubLogo } from "@gravity-ui/icons";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

function Footer() {
  const { theme } = useTheme();

  const productLinks = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "Companies", href: "/company" },
    { name: "Pricing & Plans", href: "/plans" },
    { name: "For Recruiters", href: "/dashboard/recruiter" },
    { name: "Job Seeker Suite", href: "/dashboard/seeker" },
  ];

  const candidateLinks = [
    { name: "My Applications", href: "/dashboard/seeker/applications" },
    { name: "Saved Bookmarks", href: "/dashboard/seeker/saved-jobs" },
    { name: "Profile Settings", href: "/dashboard/seeker/settings" },
    { name: "Subscription Plans", href: "/plans" },
  ];

  const companyLinks = [
    { name: "Post a Job", href: "/dashboard/recruiter/jobs/new" },
    { name: "Employer ATS", href: "/dashboard/recruiter/applicants" },
    { name: "Company Brand", href: "/dashboard/recruiter/company" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  return (
    <footer
      className="w-full border-t transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-14">

          {/* ── BRAND COL ── */}
          <div className="lg:pr-6">
            <Link href="/" className="inline-flex items-center gap-3 group" aria-label="TalentGrid Home">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#6254f5] to-[#8277ff] flex items-center justify-center shadow-lg shadow-[#6254f5]/20">
                <span className="text-white font-extrabold text-base">T</span>
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
              The next-generation talent marketplace connecting elite engineers, designers, and AI specialists with high-growth companies worldwide.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { label: "GitHub", href: "https://github.com", icon: "GH" },
                { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
                { label: "Twitter / X", href: "https://twitter.com", icon: "𝕏" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Live Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* ── PLATFORM ── */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-xs transition-all duration-200 hover:gap-1.5"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CANDIDATES ── */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Job Seekers
            </h3>
            <ul className="mt-4 space-y-3">
              {candidateLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-xs transition-all hover:gap-1.5"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COMPANY ── */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Employers
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-xs transition-all hover:gap-1.5"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA Box */}
            <div
              className="mt-6 border rounded-xl p-4 flex flex-col gap-2"
              style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)" }}
            >
              <p className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                Ready to hire elite engineers?
              </p>
              <Link href="/auth/signup">
                <button
                  className="text-[11px] font-black text-white px-3 py-1.5 rounded-lg w-full cursor-pointer transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  Get Started Free →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 text-xs"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <p>© {new Date().getFullYear()} TalentGrid Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:underline transition-colors" style={{ color: "var(--text-muted)" }}>Privacy Policy</Link>
            <Link href="#" className="hover:underline transition-colors" style={{ color: "var(--text-muted)" }}>Terms of Service</Link>
            <Link href="#" className="hover:underline transition-colors" style={{ color: "var(--text-muted)" }}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
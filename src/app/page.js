"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Magnifier, ArrowRight, Briefcase, CircleCheck, ShieldCheck,
  CrownDiamond, Persons, CircleDollar, Factory, Check,
  Bookmark, BookmarkFill,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

const POPULAR_TAGS = ["React", "Next.js", "Node.js", "AI / ML", "Product Design", "DevOps", "Fullstack", "Remote"];

const STATS = [
  { value: "50,000+", label: "Active Tech Jobs", icon: Briefcase },
  { value: "1,200+", label: "Verified Employers", icon: Factory },
  { value: "98.4%", label: "Placement Rate", icon: CircleCheck },
  { value: "$145k", label: "Avg. Salary Band", icon: CircleDollar },
];

const TRUSTED = [
  { name: "Vercel", role: "Cloud Infrastructure", jobs: 14, logo: "▲", color: "#000" },
  { name: "Stripe", role: "Financial APIs", jobs: 28, logo: "S", color: "#635bff" },
  { name: "Linear", role: "Product Tools", jobs: 8, logo: "L", color: "#5e6ad2" },
  { name: "Figma", role: "Design Platform", jobs: 19, logo: "F", color: "#f24e1e" },
  { name: "OpenAI", role: "Artificial Intelligence", jobs: 32, logo: "O", color: "#10a37f" },
  { name: "Notion", role: "Productivity SaaS", jobs: 11, logo: "N", color: "#191919" },
];

const FEATURES_SEEKER = [
  "Verified salary transparency on every listing",
  "3 free applications with live quota tracking",
  "1-click submissions with cover letter assistant",
  "Direct recruiter messaging & priority access",
];

const FEATURES_RECRUITER = [
  "Post unlimited tech roles & manage pipeline",
  "Automated company verification & trust badges",
  "ATS-grade applicant tracking & status engine",
  "Access to pre-vetted engineers & designers",
];

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [togglingBookmark, setTogglingBookmark] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/jobs?limit=6`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.jobs || [];
        setFeaturedJobs(list.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoadingJobs(false));
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`${BASE_URL}/api/saved-jobs?email=${encodeURIComponent(session.user.email)}&_t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (data?.savedJobIds) setSavedJobIds(new Set(data.savedJobIds)); })
      .catch(() => {});
  }, [session?.user?.email]);

  const handleToggleBookmark = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.email) { router.push("/auth/signin?callbackUrl=/"); return; }
    setTogglingBookmark(jobId);
    try {
      const res = await fetch(`${BASE_URL}/api/saved-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, jobId }),
      });
      const data = await res.json();
      if (data?.success) {
        setSavedJobIds(prev => {
          const next = new Set(prev);
          if (data.isSaved) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
      }
    } catch {} finally { setTogglingBookmark(null); }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    router.push(searchTerm.trim() ? `/jobs?search=${encodeURIComponent(searchTerm.trim())}` : "/jobs");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-24 pb-28 px-6 lg:px-12 overflow-hidden" style={{ borderBottom: "1px solid var(--border-color)" }}>

        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(98,84,245,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-7 relative z-10">

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest border" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: "var(--accent)" }} />
            TALENTGRID v2.4 · NEXT-GEN HIRING INFRASTRUCTURE
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl" style={{ color: "var(--text-primary)" }}>
            Where Elite Tech Talent Meets{" "}
            <span style={{ color: "var(--accent)" }}>High-Growth Companies</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Direct access to verified engineers, designers, and AI pioneers. Filter by salary, remote status, and apply in one click.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mt-2 flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl shadow-lg" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-md)" }}>
            <div className="flex-1 flex items-center gap-3 px-3">
              <Magnifier className="w-5 h-5 shrink-0" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Role, tech stack, or keyword..."
                className="w-full bg-transparent text-sm focus:outline-none py-2"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 font-bold px-7 py-3 rounded-xl text-sm transition-all whitespace-nowrap cursor-pointer"
              style={{ backgroundColor: "var(--accent)", color: "#fff", boxShadow: `0 4px 16px ${" var(--accent-light)"}` }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--accent)"}
            >
              Find Roles <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(tag === "Remote" ? "/jobs?isRemote=true" : `/jobs?search=${encodeURIComponent(tag)}`)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          {!session && (
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/auth/signup"
                className="font-bold px-8 py-3.5 rounded-xl text-sm transition-all"
                style={{ backgroundColor: "var(--accent)", color: "#fff", boxShadow: "0 4px 20px rgba(98,84,245,0.25)" }}
              >
                Get Started Free →
              </Link>
              <Link
                href="/jobs"
                className="font-semibold px-8 py-3.5 rounded-xl text-sm border transition-all"
                style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)", backgroundColor: "var(--bg-card)" }}
              >
                Browse All Jobs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="py-16 px-6 lg:px-12" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-light)" }}>
                <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <span className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TRUSTED COMPANIES ══════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--text-muted)" }}>Trusted By World-Class Teams</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Top companies hire through TalentGrid
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUSTED.map(({ name, role, jobs, logo, color }) => (
              <div key={name} className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all group" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: color }}>
                  {logo}
                </div>
                <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>{name}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{jobs} open roles</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURED JOBS ══════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>Featured Opportunities</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Curated roles from top-tier engineering teams</p>
            </div>
            <Link href="/jobs" className="text-sm font-bold flex items-center gap-1.5 transition-all" style={{ color: "var(--accent)" }}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ backgroundColor: "var(--bg-card)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="flex flex-col gap-3 p-5 rounded-2xl transition-all group relative"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                >
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleBookmark(e, job._id)}
                    disabled={togglingBookmark === job._id}
                    className="absolute top-4 right-4 p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-110"
                    style={{
                      backgroundColor: savedJobIds.has(job._id) ? "rgba(245,158,11,0.15)" : "var(--bg-secondary)",
                      borderColor: savedJobIds.has(job._id) ? "rgba(245,158,11,0.3)" : "var(--border-color)",
                      color: savedJobIds.has(job._id) ? "#f59e0b" : "var(--text-muted)",
                    }}
                    title={savedJobIds.has(job._id) ? "Saved" : "Save Job"}
                  >
                    {savedJobIds.has(job._id) ? <BookmarkFill className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-3 pr-8">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                      {(job.companyName || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{job.title}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{job.companyName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                      {job.jobType || job.category || "Full-time"}
                    </span>
                    {job.isRemote && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">Remote</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {job.location || "Global"}
                    </span>
                    {job.minSalary && (
                      <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                        ${(job.minSalary / 1000).toFixed(0)}k–${(job.maxSalary / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════ SEEKER vs RECRUITER ══════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>Built for Every Side of Hiring</h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>Whether you're seeking your next role or building a dream team</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seeker Card */}
            <div className="flex flex-col gap-5 p-8 rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "var(--accent-light)" }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>For Job Seekers</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Your next great role is one application away</p>
              </div>
              <ul className="flex flex-col gap-3">
                {FEATURES_SEEKER.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-2 font-bold px-6 py-3 rounded-xl text-sm text-center transition-all"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Create Seeker Account →
              </Link>
            </div>

            {/* Recruiter Card */}
            <div className="flex flex-col gap-5 p-8 rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(255,122,0,0.10)" }}>
                  <CrownDiamond className="w-5 h-5" style={{ color: "#ff7a00" }} />
                </div>
                <h3 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>For Recruiters</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Hire faster with intelligent talent matching</p>
              </div>
              <ul className="flex flex-col gap-3">
                {FEATURES_RECRUITER.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#ff7a00" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-2 font-bold px-6 py-3 rounded-xl text-sm text-center transition-all"
                style={{ backgroundColor: "#ff7a00", color: "#fff" }}
              >
                Start Hiring Today →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6 p-12 rounded-3xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-light)" }}>
            <Persons className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Ready to transform your career?
          </h2>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Join 50,000+ professionals and 1,200+ companies already growing with TalentGrid.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signup"
              className="font-bold px-8 py-3.5 rounded-xl text-sm transition-all"
              style={{ backgroundColor: "var(--accent)", color: "#fff", boxShadow: "0 4px 20px rgba(98,84,245,0.25)" }}
            >
              Get Started — It's Free
            </Link>
            <Link
              href="/jobs"
              className="font-semibold px-8 py-3.5 rounded-xl text-sm border transition-all"
              style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)", backgroundColor: "var(--bg-secondary)" }}
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

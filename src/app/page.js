"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Magnifier,
  ArrowRight,
  Briefcase,
  Globe,
  CircleCheck,
  ShieldCheck,
  CrownDiamond,
  LocationArrow,
  Persons,
  CircleDollar,
  Factory,
  Check,
} from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const POPULAR_TAGS = [
  "React",
  "Next.js",
  "Node.js",
  "AI / ML",
  "Product Design",
  "DevOps",
  "Fullstack",
  "Remote",
];

const STATS = [
  { value: "50,000+", label: "Active Tech Jobs", icon: Briefcase },
  { value: "1,200+", label: "Verified Employers", icon: Factory },
  { value: "98.4%", label: "Placement Success Rate", icon: CircleCheck },
  { value: "$145k", label: "Average Salary Band", icon: CircleDollar },
];

const TRUSTED_COMPANIES = [
  { name: "Vercel", industry: "Cloud Infrastructure", activeJobs: 14, logoText: "▲" },
  { name: "Stripe", industry: "Financial Infrastructure", activeJobs: 28, logoText: "S" },
  { name: "Linear", industry: "Issue Tracking", activeJobs: 8, logoText: "L" },
  { name: "Figma", industry: "Collaborative Design", activeJobs: 19, logoText: "F" },
  { name: "OpenAI", industry: "Artificial Intelligence", activeJobs: 32, logoText: "O" },
  { name: "Supabase", industry: "Open Source Backend", activeJobs: 11, logoText: "⚡" },
];

const FEATURES_SEEKER = [
  "Verified salary transparency on 100% of listings",
  "3 Free applications with live quota tracking",
  "1-click instant candidate submissions with pitch",
  "Direct recruiter messaging & priority slot access",
];

const FEATURES_RECRUITER = [
  "Post unlimited technical roles and screen pipeline",
  "Automated company verification & trust badges",
  "Rich applicant management tracking system (ATS)",
  "Access to active, pre-vetted engineers & designers",
];

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

  const handleTagClick = (tag) => {
    if (tag === "Remote") {
      router.push("/jobs?isRemote=true");
    } else {
      router.push(`/jobs?search=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col overflow-hidden">

      {/* ─── Hero Section ─── */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 overflow-hidden border-b border-white/[0.08]">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#6254f5]/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-[300px] h-[300px] bg-[#8277ff]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10 gap-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#6254f5]/15 border border-[#6254f5]/35 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider text-[#a198ff] shadow-lg shadow-[#6254f5]/10 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#6254f5] animate-ping" />
            TALENTGRID v2.4 • NEXT-GEN HIRING INFRASTRUCTURE
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl">
            Where Elite Tech Talent Meets <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-neutral-200 to-[#a198ff]">High-Growth Companies</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Direct access to verified engineers, product designers, and AI pioneers. Filter by verified salary bands, remote status, and 1-click applications.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl mt-4 flex flex-col sm:flex-row items-center gap-2 p-2 bg-[#141416]/90 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <Magnifier className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title, tech stack (e.g. React, Python, UI/UX)..."
                className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#6254f5]/30 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Find Roles <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-500 mr-1">Trending:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 px-3 py-1 rounded-lg transition-all cursor-pointer text-xs"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Metrics Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-12 pt-8 border-t border-white/[0.08]">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#141416]/60 border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center gap-1 hover:border-white/20 transition-all shadow-lg"
              >
                <stat.icon className="w-5 h-5 text-[#a198ff] mb-1" />
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
                <span className="text-xs text-neutral-400 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Top Companies Section ─── */}
      <section className="py-16 px-6 lg:px-12 bg-[#09090b] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                VERIFIED EMPLOYERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Top Companies Hiring on TalentGrid
              </h2>
            </div>
            <Link
              href="/company"
              className="text-xs font-semibold text-[#a198ff] hover:text-white flex items-center gap-1 transition-colors"
            >
              View All Employers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUSTED_COMPANIES.map((comp) => (
              <Link
                key={comp.name}
                href={`/jobs?search=${encodeURIComponent(comp.name)}`}
                className="group bg-[#141416] border border-white/[0.08] hover:border-white/20 p-5 rounded-2xl flex flex-col items-center text-center gap-2.5 transition-all duration-200 hover:-translate-y-1 shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-base font-bold text-white group-hover:scale-105 transition-transform">
                  {comp.logoText}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#a198ff] transition-colors">{comp.name}</h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">{comp.industry}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                  {comp.activeJobs} Roles
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Live Roles Section ─── */}
      <section className="py-20 px-6 lg:px-12 bg-[#0d0d0f] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#a198ff] uppercase">
                FEATURED OPPORTUNITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Latest High-Impact Roles
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-[#a198ff] hover:text-white flex items-center gap-1 transition-colors"
            >
              Browse All Jobs ({featuredJobs.length > 0 ? "50,000+" : "Open"}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#141416] border border-white/[0.08] p-6 rounded-2xl animate-pulse h-48" />
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <p>Explore all available positions in the jobs directory.</p>
              <Link href="/jobs" className="mt-3 inline-block text-xs font-bold text-[#a198ff] hover:underline">
                Explore Directory →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredJobs.map((job) => {
                const jid = job._id?.$oid || job._id || job.id;
                return (
                  <div
                    key={jid}
                    className="group bg-[#141416] border border-white/[0.08] hover:border-white/20 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 shadow-xl"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300">
                            {(job.companyName || "C")[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-[#a198ff] transition-colors line-clamp-1">
                              <Link href={`/jobs/${jid}`}>{job.title || job.jobTitle}</Link>
                            </h3>
                            <p className="text-xs text-neutral-400 line-clamp-1">{job.companyName || "Company"}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-neutral-300 capitalize">
                          {job.jobType || "Full-Time"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <LocationArrow className="w-3.5 h-3.5 text-neutral-500" />
                          {job.location || "Remote"}
                        </span>
                        {job.isRemote && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            @remote
                          </span>
                        )}
                      </div>

                      {(job.minSalary || job.maxSalary) && (
                        <div className="text-xs font-bold text-emerald-400">
                          ${Number(job.minSalary || 0).toLocaleString()} – ${Number(job.maxSalary || 0).toLocaleString()} / yr
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/[0.07] pt-3 flex items-center justify-between">
                      <Link href={`/jobs/${jid}`} className="text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                        View Role <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link href={`/jobs/${jid}/apply`}>
                        <button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-[#6254f5]/25 cursor-pointer">
                          Apply Now
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── For Candidates vs For Recruiters Section ─── */}
      <section className="py-20 px-6 lg:px-12 bg-[#09090b] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Candidate Card */}
          <div className="bg-[#141416] border border-white/[0.08] p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6254f5]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold tracking-wider text-[#a198ff] uppercase">FOR JOB SEEKERS</span>
              <h3 className="text-2xl font-extrabold text-white">Accelerate Your Engineering Career</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Take full control of your job search with transparent salary bands and instant candidate submissions.
              </p>
              <div className="flex flex-col gap-2.5 mt-2">
                {FEATURES_SEEKER.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/jobs">
              <button className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-5 rounded-xl text-xs border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all">
                Browse Open Positions <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Recruiter Card */}
          <div className="bg-[#141416] border border-[#6254f5]/30 p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a198ff]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">FOR EMPLOYERS</span>
              <h3 className="text-2xl font-extrabold text-white">Hire Verified Top 1% Tech Talent</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Post high-visibility engineering roles, manage candidates in a clean ATS, and accelerate time-to-hire.
              </p>
              <div className="flex flex-col gap-2.5 mt-2">
                {FEATURES_RECRUITER.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/auth/signup">
              <button className="w-full bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold py-3 px-5 rounded-xl text-xs shadow-lg shadow-[#6254f5]/30 flex items-center justify-center gap-2 cursor-pointer transition-all">
                Post a Job &amp; Hire Talent <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* ─── Call to Action Banner ─── */}
      <section className="py-20 px-6 lg:px-12 bg-linear-to-b from-[#0d0d0f] to-[#09090b]">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#6254f5]/25 via-[#8277ff]/15 to-[#6254f5]/25 border border-[#6254f5]/40 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#6254f5] flex items-center justify-center text-white shadow-xl shadow-[#6254f5]/40">
            <CrownDiamond className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Hiring or Career?
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Join thousands of engineers and high-velocity engineering teams building the future on TalentGrid.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/jobs">
              <button className="bg-white text-black hover:bg-neutral-200 font-bold px-7 py-3 rounded-xl text-xs shadow-lg cursor-pointer transition-all">
                Explore All Jobs
              </button>
            </Link>
            <Link href="/plans">
              <button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-7 py-3 rounded-xl text-xs border border-white/10 shadow-lg shadow-[#6254f5]/30 cursor-pointer transition-all">
                View Pricing Plans
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

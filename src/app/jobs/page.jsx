"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  LocationArrow,
  Magnifier,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Globe,
  Sliders,
  Xmark,
  CrownDiamond,
  Bookmark,
  BookmarkFill,
  Clock,
  CircleDollar,
} from "@gravity-ui/icons";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";
const CACHE_KEY = "hl_browse_jobs_cache";
const CACHE_TTL = 60_000;
const ITEMS_PER_PAGE = 6;

const CATEGORIES = [
  "All",
  "Software Engineering",
  "Product Design",
  "Data & AI",
  "DevOps & Cloud",
  "Product Management",
];

const JOB_TYPES = [
  { id: "All", label: "All Types" },
  { id: "full-time", label: "Full-Time" },
  { id: "part-time", label: "Part-Time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

export default function JobsBrowsePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [locationQuery, setLocationQuery] = useState("");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Seeker application quota state
  const [applicantCount, setApplicantCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // Saved Jobs Bookmarks State
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [togglingBookmark, setTogglingBookmark] = useState(null);

  // Salary Calculator Widget State
  const [calcRole, setCalcRole] = useState("Frontend Engineer");
  const [calcLevel, setCalcLevel] = useState("Senior");

  // Jobs data
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeCounts, setTypeCounts] = useState({
    all: 0,
    "full-time": 0,
    "part-time": 0,
    contract: 0,
    internship: 0,
    remote: 0,
  });

  // Candidate Skills for AI Match Calculator
  const candidateSkills = useMemo(() => {
    if (typeof window === "undefined" || !session?.user?.id) {
      return ["React", "JavaScript", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "Git"];
    }
    try {
      const saved = localStorage.getItem(`tg_profile_${session.user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.skills) && parsed.skills.length > 0) return parsed.skills;
      }
    } catch {}
    return ["React", "JavaScript", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "Git"];
  }, [session?.user?.id]);

  // Compute AI Match Score for each job
  const getMatchScore = (job) => {
    const text = `${job.title} ${job.category || ""} ${job.requirements || ""} ${job.responsibilities || ""}`.toLowerCase();
    let matches = 0;
    candidateSkills.forEach((skill) => {
      if (text.includes(skill.toLowerCase())) matches++;
    });
    const base = candidateSkills.length > 0 ? (matches / candidateSkills.length) * 100 : 80;
    const score = Math.min(98, Math.max(68, Math.round(base + (job.isRemote ? 10 : 5))));
    return score;
  };

  // Fetch applicant application count if logged in (live no-cache)
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(session.user.email)}&_t=${Date.now()}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        const count = data?.total || data?.applications?.length || 0;
        setApplicantCount(count);
        setHasReachedLimit(count >= 3);
      })
      .catch(() => {});
  }, [session?.user?.email]);

  // Fetch saved jobs for logged in user
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`${BASE_URL}/api/saved-jobs?email=${encodeURIComponent(session.user.email)}&_t=${Date.now()}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.savedJobIds) {
          setSavedJobIds(new Set(data.savedJobIds));
        }
      })
      .catch(() => {});
  }, [session?.user?.email]);

  // Toggle Bookmark
  const handleToggleBookmark = async (jobId) => {
    if (!session?.user?.email) {
      router.push(`/auth/signin?callbackUrl=/jobs`);
      return;
    }
    setTogglingBookmark(jobId);
    try {
      const res = await fetch(`${BASE_URL}/api/saved-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, jobId }),
      });
      const data = await res.json();
      if (data?.success) {
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (data.isSaved) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    } finally {
      setTogglingBookmark(null);
    }
  };

  // Read URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("search");
      const remote = params.get("isRemote");
      if (s) setSearch(s);
      if (remote === "true") setIsRemoteOnly(true);
    }
  }, []);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (selectedCategory && selectedCategory !== "All") queryParams.set("category", selectedCategory);
        if (selectedType && selectedType !== "All") queryParams.set("jobType", selectedType);
        if (isRemoteOnly || locationQuery === "@remote") queryParams.set("isRemote", "true");
        if (locationQuery && locationQuery !== "@remote") queryParams.set("location", locationQuery);

        const res = await fetch(`${BASE_URL}/api/jobs?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const json = await res.json();
        const jobsList = Array.isArray(json) ? json : json.jobs || [];

        setAllJobs(jobsList);
        if (json.typeCounts) setTypeCounts(json.typeCounts);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchJobs, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, selectedType, locationQuery, isRemoteOnly]);

  const totalPages = Math.ceil(allJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [allJobs, currentPage]);

  // Salary Calculator Matrix
  const calculatedSalary = useMemo(() => {
    const baseRates = {
      "Frontend Engineer": { Junior: "$70,000 – $95,000", Mid: "$105,000 – $135,000", Senior: "$145,000 – $185,000", Lead: "$190,000 – $240,000" },
      "Backend Engineer": { Junior: "$75,000 – $100,000", Mid: "$110,000 – $145,000", Senior: "$150,000 – $195,000", Lead: "$200,000 – $260,000" },
      "Full-Stack Engineer": { Junior: "$75,000 – $105,000", Mid: "$115,000 – $150,000", Senior: "$155,000 – $205,000", Lead: "$210,000 – $275,000" },
      "AI / ML Specialist": { Junior: "$90,000 – $120,000", Mid: "$130,000 – $170,000", Senior: "$175,000 – $230,000", Lead: "$240,000 – $320,000" },
      "DevOps / Cloud": { Junior: "$80,000 – $105,000", Mid: "$120,000 – $155,000", Senior: "$160,000 – $210,000", Lead: "$215,000 – $280,000" },
      "Product Designer": { Junior: "$65,000 – $90,000", Mid: "$95,000 – $130,000", Senior: "$135,000 – $175,000", Lead: "$180,000 – $230,000" },
    };
    return baseRates[calcRole]?.[calcLevel] || "$120,000 – $160,000";
  }, [calcRole, calcLevel]);

  return (
    <div
      className="min-h-screen py-10 transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
              Live Tech Market
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>• Verified Listings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Explore Elite Technical Roles
          </h1>
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Discover verified software engineering, AI, product design, and cloud infrastructure opportunities with upfront salaries and remote flexibility.
          </p>
        </div>

        {/* 📊 INTERACTIVE SALARY CALCULATOR WIDGET BANNER */}
        <div className="border rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="flex flex-col gap-2 max-w-md">
            <div className="flex items-center gap-2">
              <CircleDollar className="w-5 h-5" style={{ color: "var(--accent)" }} />
              <h2 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                Global Tech Salary Benchmark
              </h2>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Calculate compensation bands based on 2026 remote hiring market data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Target Role</label>
              <select
                value={calcRole}
                onChange={(e) => setCalcRole(e.target.value)}
                className="border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                {["Frontend Engineer", "Backend Engineer", "Full-Stack Engineer", "AI / ML Specialist", "DevOps / Cloud", "Product Designer"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Seniority</label>
              <select
                value={calcLevel}
                onChange={(e) => setCalcLevel(e.target.value)}
                className="border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                {["Junior", "Mid", "Senior", "Lead"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="border rounded-2xl px-5 py-2.5 flex flex-col justify-center shrink-0" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6254f5]">Est. Salary Band</span>
              <span className="text-sm font-extrabold text-[#6254f5]">{calculatedSalary}</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Filter Bar ─── */}
        <div
          className="rounded-3xl p-4 sm:p-5 flex flex-col gap-4 border shadow-xl"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Title / Keywords Search */}
            <div className="md:col-span-6 relative flex items-center">
              <Magnifier className="w-4 h-4 absolute left-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by title, role, tech stack (e.g. Next.js, AI)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all focus:outline-none"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Location / Remote Filter */}
            <div className="md:col-span-4 relative flex items-center">
              <LocationArrow className="w-4 h-4 absolute left-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => { setLocationQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Location (e.g. San Francisco or @remote)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all focus:outline-none"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Remote Only Toggle */}
            <div className="md:col-span-2 flex items-center">
              <button
                type="button"
                onClick={() => { setIsRemoteOnly(!isRemoteOnly); setCurrentPage(1); }}
                className="w-full py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer"
                style={{
                  backgroundColor: isRemoteOnly ? "var(--accent)" : "var(--bg-secondary)",
                  borderColor: isRemoteOnly ? "var(--accent)" : "var(--border-color)",
                  color: isRemoteOnly ? "#ffffff" : "var(--text-primary)",
                }}
              >
                <Globe className="w-4 h-4" />
                {isRemoteOnly ? "Remote Only ✓" : "Remote Jobs"}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: selectedCategory === cat ? "var(--accent)" : "var(--bg-secondary)",
                  borderColor: selectedCategory === cat ? "var(--accent)" : "var(--border-color)",
                  color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Job Type Pills with Live Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t pt-3" style={{ borderColor: "var(--border-color)" }}>
            {JOB_TYPES.map((type) => {
              const count = type.id === "All" ? typeCounts.all : typeCounts[type.id] || 0;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id); setCurrentPage(1); }}
                  className="px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: isSelected ? "var(--accent-light)" : "transparent",
                    borderColor: isSelected ? "var(--accent-border)" : "var(--border-color)",
                    color: isSelected ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  <span>{type.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Quota Warning Banner for Candidates ─── */}
        {session?.user && hasReachedLimit && (
          <div className="border rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in" style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)" }}>
            <div className="flex items-center gap-3">
              <CrownDiamond className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-500">Free Application Quota Reached (3/3 used)</p>
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  You have utilized all 3 free applications. Upgrade your candidate subscription to unlock unlimited applications.
                </p>
              </div>
            </div>
            <Link href="/plans">
              <button className="text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap cursor-pointer shadow-lg" style={{ backgroundColor: "var(--accent)" }}>
                Upgrade Now →
              </button>
            </Link>
          </div>
        )}

        {/* ─── Jobs Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl animate-pulse flex flex-col gap-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: "var(--border-color)" }} />
                  <div className="w-16 h-4 rounded-full" style={{ backgroundColor: "var(--border-color)" }} />
                </div>
                <div className="w-3/4 h-4 rounded" style={{ backgroundColor: "var(--border-color)" }} />
                <div className="w-1/2 h-3 rounded" style={{ backgroundColor: "var(--border-color)" }} />
              </div>
            ))}
          </div>
        ) : allJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl border flex items-center justify-center" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <Briefcase className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Open Roles Found</h3>
              <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
                Try adjusting your search keywords, location (@remote), or category filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setLocationQuery("");
                setSelectedCategory("All");
                setSelectedType("All");
                setIsRemoteOnly(false);
              }}
              className="text-sm font-semibold hover:underline cursor-pointer"
              style={{ color: "var(--accent)" }}
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedJobs.map((job) => {
              const jobId = job._id?.$oid || job._id || job.id;
              const salaryFormatted = job.minSalary && job.maxSalary
                ? `$${(job.minSalary / 1000).toFixed(0)}k – $${(job.maxSalary / 1000).toFixed(0)}k`
                : job.salary || "Competitive";

              const categoryBadge = job.category || job.jobType || "Full-Time";
              const isSaved = savedJobIds.has(jobId);
              const matchScore = getMatchScore(job);

              return (
                <div
                  key={jobId}
                  className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 border transition-all duration-200 group relative"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    boxShadow: "var(--shadow-sm)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-border)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                >
                  {/* Top: Company Logo + Badges + Bookmark Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                        {(job.companyName || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold block truncate" style={{ color: "var(--text-secondary)" }}>
                          {job.companyName || "Verified Company"}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold truncate group-hover:text-[#6254f5] transition-colors" style={{ color: "var(--text-primary)" }}>
                          {job.title}
                        </h2>
                      </div>
                    </div>

                    {/* Bookmark Toggle Button */}
                    <button
                      onClick={() => handleToggleBookmark(jobId)}
                      disabled={togglingBookmark === jobId}
                      className="p-2 rounded-xl border transition-all cursor-pointer hover:scale-110"
                      style={{
                        backgroundColor: isSaved ? "rgba(245,158,11,0.15)" : "var(--bg-secondary)",
                        borderColor: isSaved ? "rgba(245,158,11,0.3)" : "var(--border-color)",
                        color: isSaved ? "#f59e0b" : "var(--text-muted)",
                      }}
                      title={isSaved ? "Saved to Bookmarks" : "Save Job"}
                    >
                      {isSaved ? <BookmarkFill className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* 🔍 AI Skill Match & Type Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* AI Match Badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <span>✨</span> {matchScore}% Skill Match
                    </span>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                      {categoryBadge}
                    </span>
                  </div>

                  {/* Middle: Details & Location */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      <LocationArrow className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                      {job.location || (job.isRemote ? "Remote" : "Global")}
                    </span>

                    {job.isRemote && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <Globe className="w-3.5 h-3.5" /> 100% Remote
                      </span>
                    )}

                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                      {salaryFormatted}
                    </span>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="flex items-center justify-between border-t pt-4 mt-auto" style={{ borderColor: "var(--border-color)" }}>
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                      {job.deadline ? `Deadline: ${job.deadline.split("T")[0]}` : "Active Opening"}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link href={`/jobs/${jobId}`}>
                        <button
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer hover:underline"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-primary)",
                          }}
                        >
                          Details
                        </button>
                      </Link>

                      <Link href={`/jobs/${jobId}/apply`}>
                        <button
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:opacity-90 hover:scale-105"
                          style={{ backgroundColor: "var(--accent)" }}
                        >
                          Apply →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Pagination Bar ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-10 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isCurrent ? "var(--accent)" : "var(--bg-card)",
                    borderColor: isCurrent ? "var(--accent)" : "var(--border-color)",
                    color: isCurrent ? "#ffffff" : "var(--text-secondary)",
                    boxShadow: isCurrent ? "var(--shadow-md)" : "none",
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

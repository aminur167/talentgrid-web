"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Magnifier,
  LocationArrow,
  Person,
  Briefcase,
  Globe,
  CircleCheck,
  CircleExclamation,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  CircleDollar,
  Xmark,
  ArrowRight,
  CrownDiamond,
} from "@gravity-ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
const CACHE_KEY = "hl_browse_jobs_cache";
const CACHE_TTL = 60_000;
const ITEMS_PER_PAGE = 6;

const CATEGORIES = ["All", "Software Engineering", "Design", "Product", "Data & AI", "Marketing", "Sales", "Customer Success"];
const JOB_TYPES = [
  { id: "All", label: "All Types" },
  { id: "full-time", label: "Full-Time" },
  { id: "part-time", label: "Part-Time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

export default function PublicJobsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [allJobs, setAllJobs] = useState([]);
  const [typeCounts, setTypeCounts] = useState({ 'all': 0, 'full-time': 0, 'part-time': 0, 'contract': 0, 'internship': 0, 'remote': 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Seeker application quota state
  const [applicantCount, setApplicantCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // Fetch applicant application count if logged in
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(session.user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        const count = data?.total || data?.applications?.length || 0;
        setApplicantCount(count);
        setHasReachedLimit(count >= 3);
      })
      .catch(() => {});
  }, [session?.user?.email]);

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

  // Fetch jobs with instant sessionStorage cache hydration
  useEffect(() => {
    let isMounted = true;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, counts, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setAllJobs(data);
          if (counts) setTypeCounts(counts);
          setLoading(false);
        }
      }
    } catch {}

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

        if (isMounted) {
          setAllJobs(jobsList);
          if (json.typeCounts) {
            setTypeCounts(json.typeCounts);
          }
          setLoading(false);

          if (!search && selectedCategory === "All" && selectedType === "All" && !isRemoteOnly && !locationQuery) {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: jobsList, counts: json.typeCounts, timestamp: Date.now() })
            );
          }
        }
      } catch (err) {
        console.error("Jobs fetch error:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchJobs();
    return () => { isMounted = false; };
  }, [search, selectedCategory, selectedType, isRemoteOnly, locationQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedType, isRemoteOnly, locationQuery]);

  // Paginated jobs slice
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [allJobs, currentPage]);

  const totalPages = Math.ceil(allJobs.length / ITEMS_PER_PAGE) || 1;

  const handleRemoteToggle = () => {
    if (isRemoteOnly || locationQuery === "@remote") {
      setIsRemoteOnly(false);
      setLocationQuery("");
    } else {
      setIsRemoteOnly(true);
      setLocationQuery("@remote");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      
      {/* ─── Hero Header ─── */}
      <section className="py-12 px-6 lg:px-12 border-b" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider border mb-3" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent)" }} />
              {loading ? "Searching..." : `${allJobs.length} Open Roles Available`}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Browse Verified Tech Positions
            </h1>
            <p className="text-sm mt-1.5 max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Explore hand-screened engineering, design, and product roles at top tech companies.
            </p>
          </div>

          {/* Seeker Quota Badge */}
          {session?.user && (
            <div className="p-4 sm:p-5 rounded-2xl flex flex-col gap-2.5 max-w-sm w-full border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Free Application Limit:</span>
                <span className={`font-bold ${applicantCount >= 3 ? "text-red-500" : applicantCount === 2 ? "text-amber-500" : "text-emerald-500"}`}>
                  {applicantCount} / 3 Free
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    applicantCount >= 3 ? "bg-red-500 w-full" : applicantCount === 2 ? "bg-amber-400 w-2/3" : applicantCount === 1 ? "bg-emerald-400 w-1/3" : "bg-emerald-500 w-0"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span style={{ color: "var(--text-muted)" }}>
                  {applicantCount >= 3 ? "Quota exhausted" : `${3 - applicantCount} free left`}
                </span>
                <Link href="/plans" className="font-bold hover:underline flex items-center gap-1" style={{ color: "var(--accent)" }}>
                  <CrownDiamond className="w-3 h-3" />
                  Upgrade Plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Search + Job Type Badges ─── */}
      <section className="border-b py-4 sticky top-20 z-30 backdrop-blur-md" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-4">
          
          {/* Search Inputs Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Title / Keyword Search */}
            <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-2.5 border" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-color)" }}>
              <Magnifier className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search job title, skills, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-xs shrink-0 cursor-pointer" style={{ color: "var(--text-muted)" }}>✕</button>
              )}
            </div>

            {/* Location or @remote Input */}
            <div className="w-full sm:w-60 flex items-center gap-2 rounded-xl px-4 py-2.5 border" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-color)" }}>
              <LocationArrow className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Location (or @remote)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-pointer border"
              style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>

            {/* Remote Only Quick Toggle Pill */}
            <button
              onClick={handleRemoteToggle}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isRemoteOnly || locationQuery === "@remote"
                  ? "text-white shadow-md"
                  : ""
              }`}
              style={{
                backgroundColor: isRemoteOnly || locationQuery === "@remote" ? "var(--accent)" : "var(--bg-card)",
                borderColor: isRemoteOnly || locationQuery === "@remote" ? "var(--accent)" : "var(--border-color)",
                color: isRemoteOnly || locationQuery === "@remote" ? "#ffffff" : "var(--text-secondary)"
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              Remote {typeCounts.remote > 0 ? `(${typeCounts.remote})` : ""}
            </button>
          </div>

          {/* Job Type Count Badges (Dynamic Count per type) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-medium shrink-0 mr-1" style={{ color: "var(--text-muted)" }}>Job Type:</span>
            {JOB_TYPES.map((t) => {
              const countKey = t.id.toLowerCase();
              const count = countKey === "all" ? typeCounts.all || allJobs.length : typeCounts[countKey] || 0;
              const isSelected = selectedType === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0"
                  style={{
                    backgroundColor: isSelected ? "var(--accent)" : "var(--bg-card)",
                    borderColor: isSelected ? "var(--accent)" : "var(--border-color)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    boxShadow: isSelected ? "0 2px 8px rgba(98,84,245,0.3)" : "none"
                  }}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full" style={{
                    backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--border-color)",
                    color: isSelected ? "#ffffff" : "var(--text-muted)"
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Jobs Grid + Pagination ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-8 flex-1">
        
        {/* Limit reached warning alert */}
        {hasReachedLimit && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-700 dark:text-amber-300 text-xs">
            <div className="flex items-center gap-3">
              <CircleExclamation className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold block" style={{ color: "var(--text-primary)" }}>You have reached your 3 Free Job Applications Limit!</span>
                Upgrade to Growth or Premium to apply for unlimited jobs.
              </div>
            </div>
            <Link href="/plans">
              <button className="text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap cursor-pointer shadow-lg" style={{ backgroundColor: "var(--accent)" }}>
                Upgrade Now →
              </button>
            </Link>
          </div>
        )}

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
              const salaryFormatted = job.minSalary && job.maxSalary
                ? `$${(job.minSalary / 1000).toFixed(0)}k – $${(job.maxSalary / 1000).toFixed(0)}k`
                : job.salary || "Competitive";

              const categoryBadge = job.category || job.jobType || "Full-Time";

              return (
                <div
                  key={job._id}
                  className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 border transition-all duration-200 group"
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
                  {/* Top: Company Logo + Badges */}
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

                    {/* Remote / Type Badge */}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                      {categoryBadge}
                    </span>
                  </div>

                  {/* Middle: Details & Requirements snippet */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      <LocationArrow className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                      {job.location || (job.isRemote ? "Remote" : "Global")}
                    </span>

                    {job.isRemote && (
                      <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        <Globe className="w-3 h-3" />
                        Remote
                      </span>
                    )}

                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      <CircleDollar className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                      {salaryFormatted}
                    </span>
                  </div>

                  {/* Bottom Action */}
                  <div className="border-t pt-4 flex items-center justify-between gap-3 mt-auto" style={{ borderColor: "var(--border-color)" }}>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : "Open until filled"}
                    </span>

                    <Link href={`/jobs/${job._id}`}>
                      <button
                        className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                        style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--accent)";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--accent-light)";
                          e.currentTarget.style.color = "var(--accent)";
                        }}
                      >
                        View & Apply <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Pagination Bar ─── */}
        {allJobs.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--border-color)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, allJobs.length)} of {allJobs.length} roles
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}

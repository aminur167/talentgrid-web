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
import { Button, Spinner } from "@heroui/react";
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
    const activePlan = typeof window !== "undefined" ? localStorage.getItem("hl_user_plan") : null;
    if (activePlan === "growth" || activePlan === "premium") {
      setHasReachedLimit(false);
      return;
    }

    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(session.user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        const count = data?.total || data?.applications?.length || 0;
        setApplicantCount(count);
        if (count >= 3) {
          setHasReachedLimit(true);
        }
      })
      .catch(console.error);
  }, [session]);

  // Fetch jobs from server with real-time query params
  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (selectedCategory !== "All") params.append("category", selectedCategory);
    if (selectedType !== "All") params.append("jobType", selectedType);
    if (isRemoteOnly) params.append("isRemote", "true");
    if (locationQuery.trim()) params.append("location", locationQuery.trim());

    fetch(`${BASE_URL}/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.jobs || [];
        setAllJobs(list);
        if (data?.typeCounts) {
          setTypeCounts(data.typeCounts);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedType, isRemoteOnly, locationQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(allJobs.length / ITEMS_PER_PAGE));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [allJobs, currentPage]);

  const handleRemoteToggle = () => {
    setIsRemoteOnly((prev) => !prev);
  };

  const handleApplyClick = (jobId) => {
    if (!session?.user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/jobs/${jobId}/apply`)}`);
      return;
    }

    const activePlan = typeof window !== "undefined" ? localStorage.getItem("hl_user_plan") : null;
    const isPro = activePlan === "growth" || activePlan === "premium";

    if (!isPro && applicantCount >= 3) {
      router.push("/plans");
      return;
    }

    router.push(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* ─── Hero Section ─── */}
      <section className="border-b border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#a198ff] uppercase bg-[#6254f5]/15 border border-[#6254f5]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#a198ff] rounded-sm" />
                HIRELOOP CAREERS
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
              Explore Open Roles
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Find verified developer, design, and tech opportunities. 1-click instant application.
            </p>
          </div>

          {/* Seeker Quota Indicator Card */}
          {session?.user && (
            <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 max-w-sm w-full shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Free Application Limit:</span>
                <span className={`font-bold ${applicantCount >= 3 ? "text-red-400" : applicantCount === 2 ? "text-amber-400" : "text-emerald-400"}`}>
                  {applicantCount} / 3 Free
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    applicantCount >= 3 ? "bg-red-500 w-full" : applicantCount === 2 ? "bg-amber-400 w-2/3" : applicantCount === 1 ? "bg-emerald-400 w-1/3" : "bg-emerald-500 w-0"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-neutral-400">
                  {applicantCount >= 3 ? "Quota exhausted" : `${3 - applicantCount} free left`}
                </span>
                <Link href="/plans" className="text-[#a198ff] font-bold hover:underline flex items-center gap-1">
                  <CrownDiamond className="w-3 h-3" />
                  Upgrade Plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Search + Job Type Badges ─── */}
      <section className="bg-[#09090b] border-b border-white/[0.07] py-4 sticky top-[80px] z-30 backdrop-blur-md bg-[#09090b]/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-4">
          
          {/* Search Inputs Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Title / Keyword Search */}
            <div className="flex-1 flex items-center gap-3 bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5">
              <Magnifier className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                type="text"
                placeholder="Search job title, skills, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-neutral-500 hover:text-white text-xs shrink-0 cursor-pointer">✕</button>
              )}
            </div>

            {/* Location or @remote Input */}
            <div className="w-full sm:w-60 flex items-center gap-2 bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5">
              <LocationArrow className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                type="text"
                placeholder="Location (or @remote)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none cursor-pointer"
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
                  ? "bg-[#6254f5] border-[#6254f5] text-white shadow-md shadow-[#6254f5]/30"
                  : "bg-[#141416] border-white/[0.08] text-neutral-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Remote {typeCounts.remote > 0 ? `(${typeCounts.remote})` : ""}
            </button>
          </div>

          {/* Job Type Count Badges (Dynamic Count per type) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-neutral-500 font-medium shrink-0 mr-1">Job Type:</span>
            {JOB_TYPES.map((t) => {
              const countKey = t.id.toLowerCase();
              const count = countKey === "all" ? typeCounts.all || allJobs.length : typeCounts[countKey] || 0;
              const isSelected = selectedType === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#6254f5] border-[#6254f5] text-white shadow-md shadow-[#6254f5]/30"
                      : "bg-[#141416] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Jobs Grid + Pagination ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-8">
        
        {/* Limit reached warning alert on top if user has used 3 applications */}
        {hasReachedLimit && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-300 text-xs">
            <div className="flex items-center gap-3">
              <CircleExclamation className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">You have reached your 3 Free Job Applications Limit!</span>
                Upgrade to Growth or Premium to apply for unlimited jobs.
              </div>
            </div>
            <Link href="/plans">
              <button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap cursor-pointer shadow-lg shadow-[#6254f5]/25">
                Upgrade Now →
              </button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#141416] border border-white/[0.07] rounded-2xl p-5 animate-pulse flex flex-col gap-4">
                <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="w-16 h-4 rounded-full bg-white/5" />
                </div>
                <div className="w-3/4 h-4 bg-white/5 rounded" />
                <div className="w-1/2 h-3 bg-white/5 rounded" />
                <div className="border-t border-white/[0.07] pt-4 flex justify-between">
                  <div className="w-24 h-3 bg-white/5 rounded" />
                  <div className="w-20 h-3 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : allJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-1">No Open Roles Found</h3>
              <p className="text-neutral-500 text-sm max-w-sm">
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
              className="text-sm text-[#a198ff] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-xs sm:text-sm">
                Showing <span className="text-white font-semibold">{paginatedJobs.length}</span> of{" "}
                <span className="text-white font-semibold">{allJobs.length}</span> open roles
              </p>
              {totalPages > 1 && (
                <p className="text-neutral-500 text-xs">
                  Page <span className="text-neutral-300 font-semibold">{currentPage}</span> of {totalPages}
                </p>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job._id || job.title}
                  job={job}
                  onApply={() => handleApplyClick(job._id || job.id)}
                />
              ))}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 280, behavior: "smooth" });
                  }}
                  className="p-2.5 rounded-xl border border-white/10 bg-[#141416] text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 280, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#6254f5] border-[#6254f5] text-white shadow-md shadow-[#6254f5]/30"
                          : "bg-[#141416] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 280, behavior: "smooth" });
                  }}
                  className="p-2.5 rounded-xl border border-white/10 bg-[#141416] text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </section>

    </div>
  );
}

/* ════════════════════════════════════════════════
   Job Card Component
════════════════════════════════════════════════ */
function JobCard({ job, onApply }) {
  const router = useRouter();
  const [imgErr, setImgErr] = useState(false);

  const jobId = job._id?.$oid || job._id || job.id;
  const title = job.title || job.jobTitle || "Open Role";
  const companyName = job.companyName || "Company";
  const initials = companyName.slice(0, 2).toUpperCase();
  const hasLogo = job.companyLogo && !imgErr;

  return (
    <div
      onMouseEnter={() => {
        if (jobId) router.prefetch(`/jobs/${jobId}`);
      }}
      className="group bg-[#141416] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
    >
      <div className="flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {hasLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                onError={() => setImgErr(true)}
                className="w-10 h-10 rounded-xl object-cover bg-[#1e1e22] border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-200 shrink-0">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-[#a198ff] transition-colors line-clamp-1">
                <Link href={`/jobs/${jobId}`}>{title}</Link>
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-1">{companyName}</p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-neutral-300 shrink-0 capitalize">
            {job.jobType || "Full-Time"}
          </span>
        </div>

        {/* Location & Remote Pill */}
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
          {job.category && (
            <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full">
              {job.category}
            </span>
          )}
        </div>

        {/* Salary */}
        {(job.minSalary || job.maxSalary) && (
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <CircleDollar className="w-3.5 h-3.5" />
            ${Number(job.minSalary || 0).toLocaleString()} – ${Number(job.maxSalary || 0).toLocaleString()} / yr
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-white/[0.07] pt-3.5 flex items-center justify-between gap-2">
        <Link
          href={`/jobs/${jobId}`}
          className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ArrowRight className="w-3 h-3" />
        </Link>

        <button
          onClick={onApply}
          className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-[#6254f5]/25 cursor-pointer flex items-center gap-1"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

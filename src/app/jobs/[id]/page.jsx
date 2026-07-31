"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  LocationArrow,
  Globe,
  Clock,
  CircleDollar,
  ArrowLeft,
  ShieldCheck,
  ArrowRight,
  Person,
  Check,
  Globe as GlobeIcon
} from "@gravity-ui/icons";
import { Button, Spinner } from "@heroui/react";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function JobDetailsPage({ params: paramsPromise }) {
  const params = paramsPromise ? use(paramsPromise) : useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: session } = useSession();

  // Instant 0ms Cache Hydration
  const getInitialJob = () => {
    if (typeof window === "undefined" || !id) return null;
    try {
      const keys = ["hl_browse_jobs_cache", "hireloop_jobs_cache"];
      for (const k of keys) {
        const raw = sessionStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed) ? parsed : parsed?.data || parsed?.jobs || [];
          const found = list.find((j) => (j._id?.$oid || j._id || j.id) === id);
          if (found) return found;
        }
      }
    } catch {}
    return null;
  };

  const [job, setJob] = useState(getInitialJob);
  const [loading, setLoading] = useState(() => !getInitialJob());
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  const handleApplyClick = async () => {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(`/jobs/${id}/apply`);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    // Check plan upgrade or free applications count limit (max 3)
    const activePlan = typeof window !== "undefined" ? localStorage.getItem("hl_user_plan") : null;
    if (activePlan === "growth" || activePlan === "premium") {
      router.push(`/jobs/${id}/apply`);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(session.user.email)}`);
      const data = await res.json();
      const count = data?.total || data?.applications?.length || 0;
      if (count >= 3) {
        router.push("/plans");
        return;
      }
    } catch (e) {
      console.error("Check applications count error:", e);
    }

    router.push(`/jobs/${id}/apply`);
  };

  useEffect(() => {
    if (!id) return;

    if (!job) setLoading(true);
    fetch(`${BASE_URL}/api/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Job post not found");
        return r.json();
      })
      .then((data) => {
        const item = data?.job || data;
        setJob(item);
      })
      .catch((err) => {
        console.error("Fetch job error:", err);
        if (!job) setError("Unable to load job details. The posting may have expired or been removed.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="secondary" />
        <p className="text-sm text-neutral-400 font-medium">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <Briefcase className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Job Posting Not Found</h2>
          <p className="text-sm text-neutral-400 max-w-md">{error || "This job listing does not exist."}</p>
        </div>
        <Link href="/jobs">
          <Button className="bg-[#6254f5] text-white font-semibold rounded-xl px-5 py-2.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Back to All Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const title = job.jobTitle || job.title || "Software Engineer";
  const companyName = job.companyName || "HireLoop Partner";
  const category = job.jobCategory || job.category || "Engineering";
  const jobType = job.jobType || "Full-Time";
  const hasLogo = job.companyLogo && job.companyLogo.startsWith("http") && !imgError;

  const initials = companyName
    ? companyName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

  const currencySymbol = job.currency === "BDT" ? "৳" : job.currency === "EUR" ? "€" : job.currency === "GBP" ? "£" : "$";
  const formattedSalary =
    job.minSalary || job.maxSalary
      ? `${currencySymbol}${job.minSalary ? job.minSalary.toLocaleString() : "0"} – ${currencySymbol}${
          job.maxSalary ? job.maxSalary.toLocaleString() : "0"
        }`
      : "Competitive Salary";

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-20">
      
      {/* ─── Top Header Navigation ─── */}
      <div className="border-b border-white/[0.08] bg-[#141416]/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Jobs
          </Link>
          <span className="text-xs text-neutral-500 font-medium">Job Ref ID: #{id?.slice(-6)}</span>
        </div>
      </div>

      {/* ─── Hero Banner Card ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-[#141416] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#6254f5]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start sm:items-center gap-5">
            {hasLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                onError={() => setImgError(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-[#1e1e22] border border-white/10 shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xl font-bold text-neutral-200 shrink-0 shadow-lg">
                {initials}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#a198ff] uppercase tracking-wider bg-[#6254f5]/15 border border-[#6254f5]/30 px-2.5 py-0.5 rounded-full">
                  {category}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Employer
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {title}
              </h1>

              <p className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                {companyName}
                {job.location && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-400 font-normal flex items-center gap-1">
                      <LocationArrow className="w-3.5 h-3.5 text-neutral-500" /> {job.location}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            <Button
              onClick={handleApplyClick}
              className="bg-[#6254f5] hover:bg-[#7164ff] active:scale-95 text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-xl shadow-[#6254f5]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Apply for this Position
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Content Grid ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Details & Responsibilities */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Salary & Key Stats Box */}
          <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Offered Salary</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CircleDollar className="w-4 h-4 text-emerald-400" />
                {formattedSalary}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Job Type</span>
              <span className="text-sm font-semibold text-white capitalize flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                {jobType}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Workplace</span>
              <span className="text-sm font-semibold text-white flex items-center gap-1">
                {job.isRemote ? (
                  <span className="text-[#a198ff] flex items-center gap-1"><GlobeIcon className="w-4 h-4" /> 100% Remote</span>
                ) : (
                  job.location || "On-site"
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Deadline</span>
              <span className="text-sm font-semibold text-amber-300 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" />
                {job.deadline || "Open"}
              </span>
            </div>
          </div>

          {/* Key Responsibilities */}
          <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Briefcase className="w-5 h-5 text-[#6254f5]" />
              Key Responsibilities
            </h2>
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {job.responsibilities || "No specific responsibilities listed for this role."}
            </div>
          </div>

          {/* Requirements & Qualifications */}
          <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Check className="w-5 h-5 text-emerald-400" />
              Requirements & Qualifications
            </h2>
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {job.requirements || "No specific requirements listed for this role."}
            </div>
          </div>

          {/* Benefits & Perks */}
          {job.benefits && (
            <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <CircleDollar className="w-5 h-5 text-amber-400" />
                Perks & Benefits
              </h2>
              <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {job.benefits}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar: Summary & Quick Apply */}
        <div className="flex flex-col gap-6">

          {/* Apply Box */}
          <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 sticky top-24 shadow-xl">
            <h3 className="text-base font-bold text-white">Interested in this role?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Submit your profile, resume, and cover letter directly to the hiring manager at <span className="text-white font-semibold">{companyName}</span>.
            </p>

            <Button
              onClick={handleApplyClick}
              className="bg-[#6254f5] hover:bg-[#7164ff] active:scale-95 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-[#6254f5]/25 flex items-center justify-center gap-2 transition-all cursor-pointer w-full"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Person className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-white font-bold">{job.applications || 0}</span> candidates applied
              </span>
              <span className="text-emerald-400 font-medium">Actively Hiring</span>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.08] pb-3">
              About Employer
            </h3>
            <div className="flex items-center gap-3">
              {hasLogo ? (
                <img
                  src={job.companyLogo}
                  alt={companyName}
                  onError={() => setImgError(true)}
                  className="w-10 h-10 rounded-xl object-cover bg-[#1e1e22] border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300">
                  {initials}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{companyName}</span>
                <span className="text-xs text-neutral-400">{category}</span>
              </div>
            </div>
            {job.companyLocation && (
              <div className="flex items-center justify-between text-xs py-1 border-t border-white/5 pt-3">
                <span className="text-neutral-400">Headquarters</span>
                <span className="text-white font-medium">{job.companyLocation}</span>
              </div>
            )}
          </div>

        </div>

      </section>
    </div>
  );
}
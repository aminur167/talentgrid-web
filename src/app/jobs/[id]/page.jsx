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
  CrownDiamond,
} from "@gravity-ui/icons";
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
  const [checkingQuota, setCheckingQuota] = useState(false);

  const handleApplyClick = async () => {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(`/jobs/${id}/apply`);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    setCheckingQuota(true);
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
    } finally {
      setCheckingQuota(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Loading position details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <Briefcase className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Position Not Found</h2>
          <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>{error || "This job listing does not exist."}</p>
        </div>
        <Link href="/jobs">
          <button className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer" style={{ backgroundColor: "var(--accent)" }}>
            Back to Browse Jobs
          </button>
        </Link>
      </div>
    );
  }

  const title = job.jobTitle || job.title || "Software Engineer";
  const companyName = job.companyName || "Verified Partner";
  const salary = job.minSalary && job.maxSalary
    ? `$${(job.minSalary / 1000).toFixed(0)}k – $${(job.maxSalary / 1000).toFixed(0)}k / year`
    : job.salary || "Competitive Compensation";
  const initials = companyName
    ? companyName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";
  const hasLogo = job.companyLogo && job.companyLogo.startsWith("http") && !imgError;

  return (
    <div className="min-h-screen pb-20 relative" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ─── Top Header Breadcrumb ─── */}
      <div className="border-b py-4 px-6 lg:px-12" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-xs font-semibold hover:underline transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Job ID: #{id?.slice(-6)}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8 flex flex-col gap-8">

        {/* ─── Main Job Header Card ─── */}
        <div className="border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-start gap-4 sm:gap-5">
            {hasLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                onError={() => setImgError(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border shrink-0 shadow-md"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 shadow-md" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                {initials}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                  {companyName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                  <ShieldCheck className="w-3 h-3" /> Verified Role
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{title}</h1>
              <p className="text-xs flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <span>{job.location || (job.isRemote ? "Remote" : "Global")}</span>
                <span>•</span>
                <span className="capitalize">{job.jobType || "Full-Time"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleApplyClick}
              disabled={checkingQuota}
              className="flex items-center justify-center gap-2 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-lg transition-all cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {checkingQuota ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking Quota…
                </>
              ) : (
                <>
                  Apply for this Role <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Highlights Row ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Compensation Band", value: salary, icon: CircleDollar, color: "text-emerald-500" },
            { label: "Workplace Type", value: job.isRemote ? "100% Remote" : job.location || "On-site", icon: Globe, color: "text-[#6254f5]" },
            { label: "Employment Type", value: job.jobType || "Full-Time", icon: Briefcase, color: "text-amber-500" },
            { label: "Application Deadline", value: job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open until filled", icon: Clock, color: "text-pink-500" },
          ].map((stat) => (
            <div key={stat.label} className="border rounded-2xl p-4 flex flex-col gap-1.5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p className="text-sm font-bold truncate capitalize" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ─── Details Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Overview */}
            {job.responsibilities && (
              <div className="border rounded-3xl p-6 sm:p-8 flex flex-col gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Role Overview &amp; Responsibilities</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="border rounded-3xl p-6 sm:p-8 flex flex-col gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Requirements &amp; Qualifications</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="border rounded-3xl p-6 sm:p-8 flex flex-col gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Benefits &amp; Perks</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                  {job.benefits}
                </p>
              </div>
            )}

          </div>

          {/* Sidebar Info */}
          <div className="flex flex-col gap-6">
            <div className="border rounded-3xl p-6 flex flex-col gap-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>About the Hiring Company</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{companyName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{job.companyIndustry || "Technology"}</p>
                </div>
              </div>

              <div className="border-t pt-4 flex flex-col gap-3 text-xs" style={{ borderColor: "var(--border-color)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Company Location</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{job.companyLocation || job.location || "Global"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Open Technical Roles</span>
                  <span className="font-bold" style={{ color: "var(--accent)" }}>1 Active</span>
                </div>
              </div>

              <button
                onClick={handleApplyClick}
                className="w-full text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all cursor-pointer mt-2"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Apply for {title} →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
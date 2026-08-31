"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  CircleCheck,
  CircleExclamation,
  ShieldCheck,
  Globe,
  Check,
  ArrowRight,
  Xmark,
  CrownDiamond,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

export default function JobApplyPage({ params: paramsPromise }) {
  const params = paramsPromise ? use(paramsPromise) : useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  // Auth guard: redirect to sign in if not logged in
  useEffect(() => {
    if (!isSessionPending && !session) {
      const callbackUrl = encodeURIComponent(`/jobs/${id}/apply`);
      router.replace(`/auth/signin?callbackUrl=${callbackUrl}`);
    }
  }, [session, isSessionPending, id, router]);

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
  const [loadingJob, setLoadingJob] = useState(() => !getInitialJob());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantLocation: "",
    resumeUrl: "",
    expectedSalary: "",
    availability: "Immediate",
    coverLetter: "",
  });

  // Free limit check state
  const [appliedCount, setAppliedCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Check 3 free applications limit
  useEffect(() => {
    if (!session?.user?.email) return;
    const activePlan = typeof window !== "undefined" ? localStorage.getItem("hl_user_plan") : null;
    if (activePlan === "growth" || activePlan === "premium") {
      setIsLimitReached(false);
      return;
    }
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(session.user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        const count = data?.total || data?.applications?.length || 0;
        setAppliedCount(count);
        if (count >= 3) {
          setIsLimitReached(true);
        }
      })
      .catch(console.error);
  }, [session]);

  // Pre-fill user details from session / profile storage
  useEffect(() => {
    if (session?.user) {
      const saved = localStorage.getItem(`tg_profile_${session.user.id}`);
      let savedData = {};
      if (saved) {
        try { savedData = JSON.parse(saved); } catch {}
      }

      setForm((p) => ({
        ...p,
        applicantName: savedData.name || session.user.name || "",
        applicantEmail: session.user.email || "",
        applicantPhone: savedData.phone || "",
        applicantLocation: savedData.location || "",
        resumeUrl: savedData.resumeUrl || "",
      }));
    }
  }, [session]);

  useEffect(() => {
    if (!id) return;
    if (!job) setLoadingJob(true);

    fetch(`${BASE_URL}/api/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Job not found");
        return r.json();
      })
      .then((data) => {
        const item = data?.job || data;
        setJob(item);
      })
      .catch((err) => {
        console.error("Job fetch error:", err);
      })
      .finally(() => setLoadingJob(false));
  }, [id]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.applicantName || !form.applicantEmail || !form.resumeUrl) {
      setError("Please fill out all required fields marked with *.");
      return;
    }
    setError("");
    setShowConfirmModal(true);
  };

  const executeFinalSubmit = async () => {
    setSubmitting(true);
    setError("");

    const cleanEmail = (form.applicantEmail || session?.user?.email || "").trim().toLowerCase();

    const payload = {
      jobId: id,
      companyId: job?.companyId || "",
      companyName: job?.companyName || "TalentGrid Employer",
      jobTitle: job?.jobTitle || job?.title || "Position",
      applicantName: (form.applicantName || "").trim(),
      applicantEmail: cleanEmail,
      applicantPhone: form.applicantPhone || "",
      applicantLocation: form.applicantLocation || "",
      resumeUrl: form.resumeUrl || "",
      expectedSalary: form.expectedSalary || "",
      availability: form.availability || "Immediate",
      coverLetter: form.coverLetter || "",
      status: "pending",
      appliedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit job application.");

      // Invalidate cache and update local state
      sessionStorage.removeItem("hl_browse_jobs_cache");
      sessionStorage.removeItem("hireloop_jobs_cache");
      setAppliedCount((prev) => prev + 1);
      setShowConfirmModal(false);
      setSuccess(true);
    } catch (err) {
      console.error("Submit application error:", err);
      setError(err?.message || "Something went wrong while submitting your application.");
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Preparing application form...</p>
      </div>
    );
  }

  const title = job?.jobTitle || job?.title || "Position";
  const companyName = job?.companyName || "Employer";
  const hasLogo = job?.companyLogo && job?.companyLogo.startsWith("http") && !imgError;
  const initials = companyName
    ? companyName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6254f5] transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div className="min-h-screen pb-20 relative" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ─── Top Header Navigation ─── */}
      <div className="border-b py-4 px-6 lg:px-12" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/jobs/${id}`}
            className="flex items-center gap-2 text-xs font-semibold hover:underline transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Details
          </Link>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Applying for Position</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 flex flex-col gap-8">

        {/* ─── Job Context Header Card ─── */}
        <div className="border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center gap-4">
            {hasLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                onError={() => setImgError(true)}
                className="w-14 h-14 rounded-2xl object-cover border shrink-0 shadow-md"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl border flex items-center justify-center text-base font-bold shrink-0 shadow-md" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                {initials}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: "var(--accent)" }}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Application
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{title}</h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{companyName}</span> • {job?.location || "Remote"}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shrink-0">
            ● Accepting Applications
          </span>
        </div>

        {/* ─── Limit Reached View Screen ─── */}
        {isLimitReached ? (
          <div className="border rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl animate-in fade-in" style={{ backgroundColor: "var(--bg-card)", borderColor: "rgba(245,158,11,0.4)" }}>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <CircleExclamation className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>Application Quota Reached (3/3)</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                You have used all 3 free job applications. To apply for <span className="font-bold" style={{ color: "var(--text-primary)" }}>{title}</span> and unlimited other roles, please upgrade your plan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/plans">
                <button className="text-white font-bold px-7 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer" style={{ backgroundColor: "var(--accent)" }}>
                  <CrownDiamond className="w-4 h-4" /> Upgrade Plan for Unlimited Jobs <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/jobs">
                <button className="border font-semibold px-5 py-3 rounded-xl text-xs cursor-pointer" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                  Back to All Jobs
                </button>
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="border rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl animate-in fade-in" style={{ backgroundColor: "var(--bg-card)", borderColor: "rgba(16,185,129,0.3)" }}>
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl">
              <Check className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>Application Submitted! 🎉</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Your application for <span className="font-bold" style={{ color: "var(--text-primary)" }}>{title}</span> has been securely delivered to <span className="font-bold" style={{ color: "var(--text-primary)" }}>{companyName}</span>.
              </p>
            </div>

            <div className="border rounded-2xl p-5 w-full max-w-md text-left text-xs flex flex-col gap-2.5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Applicant Name</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{form.applicantName}</span>
              </div>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Email Address</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{form.applicantEmail}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Status</span>
                <span className="text-amber-500 font-bold uppercase">Pending Review</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/dashboard/seeker/applications">
                <button className="text-white font-bold px-6 py-3 rounded-xl text-xs cursor-pointer shadow-lg" style={{ backgroundColor: "var(--accent)" }}>
                  View in My Applications →
                </button>
              </Link>
              <Link href="/jobs">
                <button className="border font-semibold px-5 py-3 rounded-xl text-xs cursor-pointer" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                  Browse More Jobs
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleFormSubmit} className="border rounded-3xl p-6 sm:p-10 flex flex-col gap-6 shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                <CircleExclamation className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.applicantName}
                  onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.applicantEmail}
                  onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })}
                  placeholder="your.email@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  type="tel"
                  value={form.applicantPhone}
                  onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Current Location</label>
                <input
                  type="text"
                  value={form.applicantLocation}
                  onChange={(e) => setForm({ ...form, applicantLocation: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Resume / CV Link (Google Drive, Dropbox, Notion, etc.) *</label>
                <input
                  type="url"
                  required
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/your-resume-link"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Expected Salary (Annual USD)</label>
                <input
                  type="text"
                  value={form.expectedSalary}
                  onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                  placeholder="e.g. $120,000"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Availability</label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className={inputCls}
                >
                  <option value="Immediate">Immediate Start</option>
                  <option value="2 Weeks">2 Weeks Notice</option>
                  <option value="1 Month">1 Month Notice</option>
                  <option value="Flexible">Flexible / Open</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Short Cover Note / Pitch to Hiring Team</label>
                <textarea
                  rows={4}
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  placeholder="Tell the hiring manager why you are a great fit for this position..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
              <Link href={`/jobs/${id}`}>
                <button type="button" className="text-xs font-semibold hover:underline" style={{ color: "var(--text-secondary)" }}>
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                className="text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Submit Application <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="border rounded-3xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: "var(--accent)" }} />
                <h3 className="text-base font-bold">Confirm Job Submission</h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="p-1 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <Xmark className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to submit your application for <strong style={{ color: "var(--text-primary)" }}>{title}</strong> at <strong style={{ color: "var(--text-primary)" }}>{companyName}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={executeFinalSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {submitting ? "Submitting..." : "Yes, Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

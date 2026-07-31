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
  CircleQuestion
} from "@gravity-ui/icons";
import { Button, Spinner } from "@heroui/react";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

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
  
  // Confirmation Modal State
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

  // Pre-fill session user details if logged in
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        applicantName: session.user.name || prev.applicantName,
        applicantEmail: session.user.email || prev.applicantEmail,
      }));
    }
  }, [session]);

  // Fetch job details to display company header
  useEffect(() => {
    if (!id) return;

    if (!job) setLoadingJob(true);
    fetch(`${BASE_URL}/api/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Job not found");
        return r.json();
      })
      .then((data) => {
        setJob(data?.job || data);
      })
      .catch((err) => {
        console.error("Fetch job error:", err);
        if (!job) setError("Unable to fetch job details for application.");
      })
      .finally(() => setLoadingJob(false));
  }, [id]);

  // 1. Trigger confirmation popup when user clicks Submit Application
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.applicantName || !form.applicantEmail || !form.resumeUrl) {
      setError("Please fill out all required fields marked with *.");
      return;
    }
    setError("");
    setShowConfirmModal(true); // Open confirmation dialog
  };

  // 2. Only executed when user clicks "OK / Confirm & Submit" inside the modal
  const executeFinalSubmit = async () => {
    setSubmitting(true);
    setError("");

    const payload = {
      jobId: id,
      companyId: job?.companyId || "",
      companyName: job?.companyName || "HireLoop Partner",
      jobTitle: job?.jobTitle || job?.title || "Software Engineer",
      applicantName: form.applicantName,
      applicantEmail: form.applicantEmail,
      applicantPhone: form.applicantPhone,
      applicantLocation: form.applicantLocation,
      resumeUrl: form.resumeUrl,
      expectedSalary: form.expectedSalary,
      availability: form.availability,
      coverLetter: form.coverLetter,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit job application.");

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
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="secondary" />
        <p className="text-sm text-neutral-400 font-medium">Preparing application form...</p>
      </div>
    );
  }

  const title = job?.jobTitle || job?.title || "Position";
  const companyName = job?.companyName || "Employer";
  const hasLogo = job?.companyLogo && job?.companyLogo.startsWith("http") && !imgError;
  const initials = companyName
    ? companyName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-20 relative">

      {/* ─── Top Header Navigation ─── */}
      <div className="border-b border-white/[0.08] bg-[#141416]/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/jobs/${id}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Details
          </Link>
          <span className="text-xs text-neutral-500 font-medium">Applying for Position</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 flex flex-col gap-8">

        {/* ─── Job Context Header Card ─── */}
        <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {hasLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                onError={() => setImgError(true)}
                className="w-14 h-14 rounded-2xl object-cover bg-[#1e1e22] border border-white/10 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-base font-bold text-neutral-200 shrink-0 shadow-md">
                {initials}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#a198ff] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Application
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h1>
              <p className="text-xs text-neutral-400">
                <span className="text-neutral-200 font-semibold">{companyName}</span> • {job?.location || "Remote"}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shrink-0">
            ● Actively Accepting Applications
          </span>
        </div>

        {/* ─── Limit Reached View Screen ─── */}
        {isLimitReached ? (
          <div className="bg-[#141416] border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CircleExclamation className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Application Limit Reached (3/3)</h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                You have used all 3 free job applications included in the Starter plan. To apply for <span className="text-white font-semibold">{title}</span> and unlimited other roles, please upgrade your plan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/plans">
                <Button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-7 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#6254f5]/30">
                  Upgrade Plan for Unlimited Applications <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button className="bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white font-semibold px-5 py-3 rounded-xl text-xs">
                  Back to All Jobs
                </Button>
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="bg-[#141416] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <Check className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-2xl font-extrabold text-white">Application Submitted!</h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Your application for <span className="text-white font-semibold">{title}</span> has been securely delivered to <span className="text-white font-semibold">{companyName}</span>.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-md text-left text-xs flex flex-col gap-2.5">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Applicant Name</span>
                <span className="text-white font-semibold">{form.applicantName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Email Address</span>
                <span className="text-white font-semibold">{form.applicantEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Resume Link</span>
                <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="text-[#a198ff] hover:underline font-semibold max-w-[180px] truncate">
                  {form.resumeUrl}
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/jobs">
                <Button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#6254f5]/25">
                  Browse More Jobs <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-xs">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* ─── Application Form ─── */
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">

            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 font-medium">
                <CircleExclamation className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Section 1: Personal Details */}
            <div className="bg-[#141416] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
                <span className="w-6 h-6 rounded-full bg-[#6254f5]/20 text-[#a198ff] text-xs font-bold flex items-center justify-center border border-[#6254f5]/30">1</span>
                <h2 className="text-base font-bold text-white">Personal Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Aminur Islam"
                    value={form.applicantName}
                    onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={form.applicantEmail}
                    onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Phone Number <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 1700 000000"
                    value={form.applicantPhone}
                    onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Current Location <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Bangladesh"
                    value={form.applicantLocation}
                    onChange={(e) => setForm({ ...form, applicantLocation: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Profile & Resume */}
            <div className="bg-[#141416] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
                <span className="w-6 h-6 rounded-full bg-[#6254f5]/20 text-[#a198ff] text-xs font-bold flex items-center justify-center border border-[#6254f5]/30">2</span>
                <h2 className="text-base font-bold text-white">Professional Profile & Links</h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Resume / Portfolio Link <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://drive.google.com/your-resume or https://github.com/yourusername"
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-neutral-500">Provide a shareable Google Drive, Dropbox, LinkedIn, or personal website URL.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Expected Salary / Beton
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $60,000 / yr or ৳80,000 / month"
                    value={form.expectedSalary}
                    onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Notice Period / Availability
                  </label>
                  <select
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#1e1e22] py-3 px-4 text-sm text-white focus:border-[#6254f5] focus:outline-none cursor-pointer"
                  >
                    <option value="Immediate" className="bg-[#1e1e22]">Immediate Joiner</option>
                    <option value="1 Week" className="bg-[#1e1e22]">1 Week</option>
                    <option value="2 Weeks" className="bg-[#1e1e22]">2 Weeks</option>
                    <option value="1 Month" className="bg-[#1e1e22]">1 Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Cover Letter & Pitch */}
            <div className="bg-[#141416] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
                <span className="w-6 h-6 rounded-full bg-[#6254f5]/20 text-[#a198ff] text-xs font-bold flex items-center justify-center border border-[#6254f5]/30">3</span>
                <h2 className="text-base font-bold text-white">Cover Letter & Pitch</h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Why are you a great fit for this role? <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Share a brief overview of your background, technical achievements, and why you want to join this company..."
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#6254f5] focus:outline-none resize-y transition-colors"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <Link href={`/jobs/${id}`}>
                <Button className="bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white font-medium rounded-xl px-5 py-3 text-xs">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#6254f5] hover:bg-[#7164ff] active:scale-95 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-xl shadow-[#6254f5]/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                Submit Application
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ─── CONFIRMATION ALERT MODAL (OK / CANCEL DIALOG) ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141416] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-7 text-white flex flex-col gap-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6254f5]/20 border border-[#6254f5]/40 flex items-center justify-center text-[#a198ff]">
                  <CircleQuestion className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirm Application</h3>
                  <p className="text-xs text-neutral-400">Please confirm before sending</p>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Xmark className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Text */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-200 font-medium leading-relaxed">
                আপনি কি নিশ্চিত যে আপনি <span className="text-[#a198ff] font-bold">{title}</span> পজিশনে <span className="text-white font-bold">{companyName}</span> কোম্পানিতে আপনার আবেদনটি জমা দিতে চান?
              </p>

              {/* Summary Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">আবেদনকারীর নাম:</span>
                  <span className="text-white font-semibold">{form.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">ইমেইল:</span>
                  <span className="text-white font-semibold">{form.applicantEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">রেজুমে লিংক:</span>
                  <span className="text-[#a198ff] font-semibold max-w-[150px] truncate">{form.resumeUrl}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions: Cancel vs OK (Confirm) */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel / পরিবর্তন করুন
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={executeFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#6254f5] hover:bg-[#7164ff] active:scale-95 text-white text-xs font-bold shadow-lg shadow-[#6254f5]/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" color="white" />
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    OK / হ্যাঁ, জমা দিন
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import {
  Briefcase,
  ShieldCheck,
  CircleExclamation,
  ArrowLeft,
  CircleCheck,
  Globe,
  LocationArrow,
  Pencil
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function PostJobPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <Spinner size="md" color="secondary" />
      </div>
    }>
      <JobFormContent />
    </Suspense>
  );
}

function JobFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get("edit");

  const { data: session, isPending } = useSession();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(!!editJobId);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    jobType: "full-time",
    deadline: "",
    minSalary: "",
    maxSalary: "",
    currency: "USD",
    location: "",
    isRemote: false,
    responsibilities: "",
    requirements: "",
    benefits: "",
  });

  // ── Role guard: only recruiters can access ──
  useEffect(() => {
    if (!isPending && session) {
      const role = session?.user?.role;
      if (role && role !== "recruiter") {
        router.replace("/dashboard");
      }
    }
    if (!isPending && !session) {
      router.replace("/auth/signin");
    }
  }, [session, isPending, router]);

  // ── If editing an existing job, fetch its data ──
  useEffect(() => {
    if (!editJobId) return;

    setLoadingJob(true);
    fetch(`${BASE_URL}/api/jobs/${editJobId}`)
      .then((r) => r.json())
      .then((data) => {
        const job = data?.job;
        if (job) {
          setFormData({
            title: job.jobTitle || job.title || "",
            category: job.jobCategory || job.category || "",
            jobType: job.jobType || "full-time",
            deadline: job.deadline || "",
            minSalary: job.minSalary || "",
            maxSalary: job.maxSalary || "",
            currency: job.currency || "USD",
            location: job.location || "",
            isRemote: job.isRemote || false,
            responsibilities: job.responsibilities || "",
            requirements: job.requirements || "",
            benefits: job.benefits || "",
          });
        }
      })
      .catch((err) => console.error("Failed to load job for edit:", err))
      .finally(() => setLoadingJob(false));
  }, [editJobId]);

  // ── Fetch companies (sessionStorage cache → instant 0ms load) ──
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;

    try {
      const cached = sessionStorage.getItem("hireloop_companies_cache");
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) {
          setCompanies(list);
          setSelectedCompany(list[0]);
          setLoadingCompanies(false);
          return;
        }
      }
    } catch {}

    fetch(`${BASE_URL}/api/companies?recruiterEmail=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.companies || [];
        setCompanies(list);
        if (list.length > 0) setSelectedCompany(list[0]);
        try { sessionStorage.setItem("hireloop_companies_cache", JSON.stringify(list)); } catch {}
      })
      .catch(console.error)
      .finally(() => setLoadingCompanies(false));
  }, [session?.user?.email]);

  // ── Form submit (Create or Edit) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany && !editJobId) {
      setError("Please create a company first before posting a job.");
      return;
    }

    setError("");
    setLoading(true);

    const payload = {
      title: formData.title,
      jobTitle: formData.title,
      category: formData.category,
      jobCategory: formData.category,
      jobType: formData.jobType,
      deadline: formData.deadline,
      minSalary: Number(formData.minSalary) || 0,
      maxSalary: Number(formData.maxSalary) || 0,
      currency: formData.currency,
      location: formData.location,
      isRemote: formData.isRemote,
      responsibilities: formData.responsibilities,
      requirements: formData.requirements,
      benefits: formData.benefits,
      ...(selectedCompany
        ? {
            companyId: selectedCompany._id,
            companyName: selectedCompany.name,
            companyLogo: selectedCompany.logo || "",
            companyIndustry: selectedCompany.industry || "",
            companyLocation: selectedCompany.location || "",
          }
        : {}),
      recruiterEmail: session?.user?.email,
      status: "active",
      updatedAt: new Date().toISOString(),
    };

    try {
      let res;
      if (editJobId) {
        // Edit existing job
        res = await fetch(`${BASE_URL}/api/jobs/${editJobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new job
        res = await fetch(`${BASE_URL}/api/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            applications: 0,
            createdAt: new Date().toISOString(),
          }),
        });
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to save job");

      // Invalidate cache so jobs list gets latest data
      sessionStorage.removeItem("hireloop_jobs_cache");

      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/recruiter/jobs"), 1200);
    } catch (err) {
      console.error("Job submit error:", err);
      setLoading(false);
      setError(err?.message || "Failed to save job post.");
    }
  };

  if (isPending || loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-neutral-400 gap-3">
        <Spinner size="md" color="secondary" />
        <p className="text-sm">Loading job data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-[#09090b] min-h-screen text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Back Link & Header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/recruiter/jobs"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Jobs List
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              {editJobId ? (
                <>
                  <Pencil className="w-6 h-6 text-[#6254f5]" /> Edit Job Posting
                </>
              ) : (
                "Post a New Job"
              )}
            </h1>
            <p className="text-sm text-neutral-400">
              {editJobId
                ? "Update your existing job post details and requirements."
                : "Create a listing to find top talent for your organization."}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 font-medium">
            <CircleCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">
                {editJobId ? "Job updated successfully!" : "Job posted successfully!"}
              </p>
              <p className="text-xs text-emerald-400/80">Redirecting to jobs list...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">
            <CircleExclamation className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Error</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Company Selection Banner */}
        {!editJobId && (
          loadingCompanies ? (
            <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <Spinner size="sm" color="secondary" />
              <p className="text-sm text-neutral-400">Loading your companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-400">
              <CircleExclamation className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">No company registered yet</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  You need to{" "}
                  <Link href="/dashboard/recruiter/company" className="underline font-semibold">
                    create a company
                  </Link>{" "}
                  before posting a job.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Posting as Company
              </p>
              <div className="flex flex-wrap gap-3">
                {companies.map((c) => {
                  const isSelected = selectedCompany?._id === c._id;
                  const initials = c.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "CO";
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setSelectedCompany(c)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm transition-all ${
                        isSelected
                          ? "border-[#6254f5] bg-[#6254f5]/10 text-white"
                          : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {c.logo && c.logo.startsWith("http") ? (
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-7 h-7 rounded-lg object-cover border border-white/10"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#222226] border border-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-300">
                          {initials}
                        </div>
                      )}
                      <span className="font-medium">{c.name}</span>
                      {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-[#a198ff]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Job Creation/Edit Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Section 1: Job Info */}
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Briefcase className="w-5 h-5 text-[#6254f5]" />
              <h2 className="text-base font-semibold text-white">Job Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Job Category <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Software Engineering, Design"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Employment Type <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#1e1e22] py-2.5 px-3.5 text-sm text-white transition-colors focus:border-[#6254f5] focus:outline-none cursor-pointer"
                >
                  <option value="full-time" className="bg-[#1e1e22]">Full-time</option>
                  <option value="part-time" className="bg-[#1e1e22]">Part-time</option>
                  <option value="contract" className="bg-[#1e1e22]">Contract</option>
                  <option value="internship" className="bg-[#1e1e22]">Internship</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Application Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">Min Salary</label>
                <input
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  placeholder="50000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">Max Salary</label>
                <input
                  type="number"
                  value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                  placeholder="80000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#1e1e22] py-2.5 px-3.5 text-sm text-white transition-colors focus:border-[#6254f5] focus:outline-none cursor-pointer"
                >
                  <option value="USD" className="bg-[#1e1e22]">USD ($)</option>
                  <option value="EUR" className="bg-[#1e1e22]">EUR (€)</option>
                  <option value="GBP" className="bg-[#1e1e22]">GBP (£)</option>
                  <option value="BDT" className="bg-[#1e1e22]">BDT (৳)</option>
                </select>
              </div>
            </div>

            {/* Location & Remote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA / Dhaka, BD"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="relative flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isRemote}
                    onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#6254f5] focus:ring-[#6254f5] focus:ring-offset-0 cursor-pointer accent-[#6254f5]"
                  />
                  <span className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#8277ff]" />
                    100% Remote Position
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Description */}
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="text-base font-semibold text-white">Description & Requirements</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Key Responsibilities <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="Outline daily duties, project scopes, and key deliverables..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none resize-y"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Requirements & Qualifications <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List required technical skills, years of experience, and degrees..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none resize-y"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Perks & Benefits (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Health insurance, remote work stipend, equity, annual retreats..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none resize-y"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              className="bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white rounded-xl px-5 py-2.5"
              type="button"
              onClick={() => router.push("/dashboard/recruiter/jobs")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              isDisabled={!editJobId && (companies.length === 0 || loadingCompanies)}
              className="bg-[#6254f5] text-white hover:bg-[#7164ff] shadow-lg shadow-[#6254f5]/25 font-semibold rounded-xl px-6 py-2.5 disabled:opacity-50"
            >
              {loading ? "Saving..." : editJobId ? "Save Changes" : "Publish Job Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  ShieldCheck,
  CircleExclamation,
  ArrowLeft,
  CircleCheck,
  Globe,
  LocationArrow,
  Pencil,
  Plus
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

export default function PostJobPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#ff7a00" }} />
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

  const { data: session } = useSession();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "Software Engineering",
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

  const recruiterEmail = session?.user?.email;

  useEffect(() => {
    if (!recruiterEmail) return;

    fetch(`${BASE_URL}/api/companies?recruiterEmail=${encodeURIComponent(recruiterEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.companies || [];
        setCompanies(list);
        if (list.length > 0) setSelectedCompany(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingCompanies(false));
  }, [recruiterEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Job title is required.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      companyId: selectedCompany?._id || "",
      companyName: selectedCompany?.name || "TalentGrid Partner",
      companyLogo: selectedCompany?.logo || "",
      companyLocation: selectedCompany?.location || "",
      recruiterEmail,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/recruiter/jobs"), 1500);
      } else {
        setError(data?.message || "Failed to post job listing.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#ff7a00] transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/recruiter/jobs" className="flex items-center gap-2 text-xs font-semibold hover:underline" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to My Jobs
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          Post a New Technical Role
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Publish a verified listing to receive candidate applications across the TalentGrid ecosystem.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <CircleCheck className="w-4 h-4" /> Position published successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
          <CircleExclamation className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Company Selection */}
      <div className="border rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <p className={labelCls}>Select Hiring Company Brand</p>
        {loadingCompanies ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading registered companies...</p>
        ) : companies.length === 0 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-500">No company registered yet. Register your company brand first.</p>
            <Link href="/dashboard/recruiter/company">
              <button className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#ff7a00" }}>
                + Register Company
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => {
              const isSelected = selectedCompany?._id === c._id;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedCompany(c)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "rgba(255,122,0,0.15)" : "var(--bg-secondary)",
                    borderColor: isSelected ? "#ff7a00" : "var(--border-color)",
                    color: isSelected ? "#ff7a00" : "var(--text-secondary)",
                  }}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{c.name}</span>
                  {isSelected && <ShieldCheck className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Form */}
      <form onSubmit={handleSubmit} className="border rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div>
          <label className={labelCls}>Job Title / Role *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Senior Full-Stack Engineer (React / Node.js)"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={inputCls}
            >
              {["Software Engineering", "Product Design", "Data & AI", "DevOps & Cloud", "Product Management", "Marketing", "Other"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Employment Type</label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              className={inputCls}
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Primary Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. San Francisco, CA or Remote"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Application Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Minimum Annual Salary (USD $)</label>
            <input
              type="number"
              value={formData.minSalary}
              onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
              placeholder="80000"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Maximum Annual Salary (USD $)</label>
            <input
              type="number"
              value={formData.maxSalary}
              onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
              placeholder="140000"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remoteCheck"
            checked={formData.isRemote}
            onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="remoteCheck" className="text-xs font-semibold cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            This position is open to 100% remote candidates worldwide
          </label>
        </div>

        <div>
          <label className={labelCls}>Key Responsibilities</label>
          <textarea
            rows={3}
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            placeholder="Describe what the candidate will be doing daily..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className={labelCls}>Requirements &amp; Technical Skills</label>
          <textarea
            rows={3}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="List required skills (e.g. 3+ years with React, TypeScript, Docker)..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="border-t pt-4 flex justify-end gap-3" style={{ borderColor: "var(--border-color)" }}>
          <Link href="/dashboard/recruiter/jobs">
            <button type="button" className="px-5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
            style={{ backgroundColor: "#ff7a00" }}
          >
            {loading ? "Publishing..." : "Publish Job Role →"}
          </button>
        </div>
      </form>
    </div>
  );
}
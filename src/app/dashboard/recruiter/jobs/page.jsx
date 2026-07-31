"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button, Spinner } from "@heroui/react";
import { useSession } from "@/lib/auth-client";
import { 
  Eye, 
  Pencil, 
  TrashBin, 
  Plus, 
  Xmark, 
  Briefcase, 
  LocationArrow, 
  Globe,
  CircleCheck,
  CircleExclamation,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Person,
  Clock,
  CircleDollar
} from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
const JOBS_PER_PAGE = 6;

export default function RecruiterJobsPage() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;

  const [jobsList, setJobsList] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("hireloop_jobs_cache");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(() => jobsList.length === 0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit form state
  const [editForm, setEditForm] = useState({
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

  // Fetch jobs
  const fetchJobs = async (showLoading = true) => {
    if (showLoading && jobsList.length === 0) setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/jobs`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.jobs || [];
      setJobsList(list);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hireloop_jobs_cache", JSON.stringify(list));
      }
    } catch (err) {
      console.error("Failed to load posted jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(jobsList.length === 0);
  }, []);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(jobsList.length / JOBS_PER_PAGE));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    return jobsList.slice(start, start + JOBS_PER_PAGE);
  }, [jobsList, currentPage]);

  // Open Edit Modal with pre-filled existing data
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditSuccess(false);
    setEditError("");
    setEditForm({
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
  };

  // Submit Edit Form (PATCH to MongoDB)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    const jobId = editingJob._id?.$oid || editingJob._id || editingJob.id;
    setSavingEdit(true);
    setEditError("");
    setEditSuccess(false);

    const payload = {
      title: editForm.title,
      jobTitle: editForm.title,
      category: editForm.category,
      jobCategory: editForm.category,
      jobType: editForm.jobType,
      deadline: editForm.deadline,
      minSalary: Number(editForm.minSalary) || 0,
      maxSalary: Number(editForm.maxSalary) || 0,
      currency: editForm.currency,
      location: editForm.location,
      isRemote: editForm.isRemote,
      responsibilities: editForm.responsibilities,
      requirements: editForm.requirements,
      benefits: editForm.benefits,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update job");

      const updatedList = jobsList.map((j) => {
        const id = j._id?.$oid || j._id || j.id;
        return id === jobId ? { ...j, ...payload } : j;
      });

      setJobsList(updatedList);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hireloop_jobs_cache", JSON.stringify(updatedList));
      }

      setEditSuccess(true);
      setTimeout(() => {
        setEditingJob(null);
        setEditSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Edit job error:", err);
      setEditError(err?.message || "Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Job Handler
  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete/close this job posting?")) return;
    setDeletingId(jobId);
    try {
      const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job.");
      const updated = jobsList.filter((j) => (j._id?.$oid || j._id || j.id) !== jobId);
      setJobsList(updated);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hireloop_jobs_cache", JSON.stringify(updated));
      }
    } catch (err) {
      alert(err.message || "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#09090b] min-h-screen text-white flex flex-col gap-6 relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">All Posted Jobs</h1>
          <p className="text-sm text-neutral-400">
            Real-time management of active job listings, candidate requests, and status.
          </p>
        </div>
        <Link href="/dashboard/recruiter/jobs/new">
          <Button
            className="bg-[#6254f5] text-white hover:bg-[#7164ff] active:scale-95 shadow-lg shadow-[#6254f5]/25 font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 animate-pulse flex flex-col gap-4">
                <div className="flex justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/5" />
                  <div className="w-16 h-5 rounded-full bg-white/5" />
                </div>
                <div className="w-3/4 h-5 bg-white/5 rounded" />
                <div className="w-1/2 h-3 bg-white/5 rounded" />
                <div className="flex gap-2">
                  <div className="w-24 h-6 rounded-full bg-white/5" />
                  <div className="w-16 h-6 rounded-full bg-white/5" />
                </div>
                <div className="border-t border-white/[0.07] pt-4 flex justify-between">
                  <div className="w-24 h-3 bg-white/5 rounded" />
                  <div className="w-20 h-3 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : jobsList.length === 0 ? (
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-16 text-center text-neutral-400 flex flex-col items-center gap-3">
            <Briefcase className="w-10 h-10 text-neutral-600" />
            <div>
              <p className="text-base font-semibold text-neutral-300">No posted jobs found</p>
              <p className="text-xs text-neutral-500 mt-1">Create your first job listing to start receiving applications.</p>
            </div>
            <Link href="/dashboard/recruiter/jobs/new" className="mt-2">
              <Button className="bg-[#6254f5] text-white rounded-xl px-5 py-2.5 text-xs font-semibold">
                Post A Job Now
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-neutral-400 text-xs">
                Showing <span className="text-white font-semibold">{paginatedJobs.length}</span> of{" "}
                <span className="text-white font-semibold">{jobsList.length}</span> posted jobs
              </p>
              {totalPages > 1 && (
                <p className="text-neutral-400 text-xs">
                  Page <span className="text-white font-semibold">{currentPage}</span> of {totalPages}
                </p>
              )}
            </div>

            {/* ─── Ultra-Professional 3-Column Grid of Job Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedJobs.map((job) => {
                const jobId = job._id?.$oid || job._id || job.id;
                const isDeleting = deletingId === jobId;
                return (
                  <UltraJobCard
                    key={jobId}
                    job={job}
                    currentUserEmail={currentUserEmail}
                    isDeleting={isDeleting}
                    onView={() => setSelectedJob(job)}
                    onEdit={() => handleOpenEdit(job)}
                    onDelete={() => handleDelete(jobId)}
                  />
                );
              })}
            </div>

            {/* ─── Pagination Bar ─── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  className="w-9 h-9 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-black border border-white shadow-md shadow-white/10 scale-105"
                          : "bg-[#141416] border border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
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
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  className="w-9 h-9 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-xl w-full p-6 text-white flex flex-col gap-5 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedJob.jobTitle || selectedJob.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 capitalize">
                  {selectedJob.companyName || "Acme Corp"} • {selectedJob.jobCategory || selectedJob.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Xmark className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-400 block">Type</span>
                  <span className="font-semibold text-white capitalize">{selectedJob.jobType}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Location</span>
                  <span className="font-semibold text-white">{selectedJob.isRemote ? "Remote" : selectedJob.location || "N/A"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-semibold">Salary / beton</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedJob.currency || "USD"} {selectedJob.minSalary?.toLocaleString()} - {selectedJob.maxSalary?.toLocaleString()}
                  </span>
                </div>
                {selectedJob.deadline && (
                  <div>
                    <span className="text-neutral-400 block">Deadline</span>
                    <span className="font-semibold text-amber-300">{selectedJob.deadline}</span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-400 block">Status</span>
                  <span className="font-semibold text-emerald-400 capitalize">{selectedJob.status || "active"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Applications</span>
                  <span className="font-semibold text-[#a198ff]">{selectedJob.applications || 0} candidates</span>
                </div>
              </div>

              {selectedJob.responsibilities && (
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Key Responsibilities</h4>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {selectedJob.responsibilities}
                  </p>
                </div>
              )}

              {selectedJob.requirements && (
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Requirements</h4>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              {selectedJob.benefits && (
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Benefits & Perks</h4>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {selectedJob.benefits}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <Button
                onClick={() => setSelectedJob(null)}
                className="bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs px-5 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto py-8">
          <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-2xl w-full p-6 text-white flex flex-col gap-5 shadow-2xl relative my-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-[#6254f5]" />
                  Edit Job Posting
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Update details for <span className="text-white font-semibold">{editingJob.jobTitle || editingJob.title}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Xmark className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-medium">
                <CircleCheck className="w-4 h-4 shrink-0" />
                Job post updated successfully! Closing...
              </div>
            )}
            {editError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
                <CircleExclamation className="w-4 h-4 shrink-0" />
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Employment Type
                  </label>
                  <select
                    value={editForm.jobType}
                    onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#1e1e22] py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none cursor-pointer"
                  >
                    <option value="full-time" className="bg-[#1e1e22]">Full-time</option>
                    <option value="part-time" className="bg-[#1e1e22]">Part-time</option>
                    <option value="contract" className="bg-[#1e1e22]">Contract</option>
                    <option value="internship" className="bg-[#1e1e22]">Internship</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Min Salary / Beton</label>
                  <input
                    type="number"
                    value={editForm.minSalary}
                    onChange={(e) => setEditForm({ ...editForm, minSalary: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Max Salary / Beton</label>
                  <input
                    type="number"
                    value={editForm.maxSalary}
                    onChange={(e) => setEditForm({ ...editForm, maxSalary: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Currency</label>
                  <select
                    value={editForm.currency}
                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#1e1e22] py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none cursor-pointer"
                  >
                    <option value="USD" className="bg-[#1e1e22]">USD ($)</option>
                    <option value="EUR" className="bg-[#1e1e22]">EUR (€)</option>
                    <option value="GBP" className="bg-[#1e1e22]">GBP (£)</option>
                    <option value="BDT" className="bg-[#1e1e22]">BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-[#6254f5] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300 select-none">
                    <input
                      type="checkbox"
                      checked={editForm.isRemote}
                      onChange={(e) => setEditForm({ ...editForm, isRemote: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#6254f5] accent-[#6254f5]"
                    />
                    <Globe className="w-4 h-4 text-[#a198ff]" /> 100% Remote Position
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Key Responsibilities</label>
                <textarea
                  rows={3}
                  value={editForm.responsibilities}
                  onChange={(e) => setEditForm({ ...editForm, responsibilities: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-[#6254f5] focus:outline-none resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Requirements</label>
                <textarea
                  rows={3}
                  value={editForm.requirements}
                  onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-[#6254f5] focus:outline-none resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Perks & Benefits</label>
                <textarea
                  rows={2}
                  value={editForm.benefits}
                  onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-[#6254f5] focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
                <Button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="bg-white/10 text-neutral-300 hover:bg-white/15 hover:text-white rounded-xl text-xs px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={savingEdit}
                  className="bg-[#6254f5] text-white hover:bg-[#7164ff] font-semibold rounded-xl text-xs px-5 py-2 shadow-lg shadow-[#6254f5]/25"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ULTRA-PROFESSIONAL ENTERPRISE SAAS JOB CARD COMPONENT
════════════════════════════════════════════════════════════════════════ */
function UltraJobCard({ job, currentUserEmail, isDeleting, onView, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);

  const title = job.jobTitle || job.title || "Software Engineer";
  const companyName = job.companyName || "HireLoop Employer";
  const category = job.jobCategory || job.category || "Engineering";
  const jobType = job.jobType || "Full-Time";
  const hasLogo = job.companyLogo && job.companyLogo.startsWith("http") && !imgError;

  const initials = companyName
    ? companyName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

  // Ownership Guard: Only job creator can edit/delete
  const isOwner = !job.recruiterEmail || !currentUserEmail || job.recruiterEmail === currentUserEmail;

  // Formatted Salary (beton)
  const currencySymbol = job.currency === "BDT" ? "৳" : job.currency === "EUR" ? "€" : job.currency === "GBP" ? "£" : "$";
  const formattedSalary =
    job.minSalary || job.maxSalary
      ? `${currencySymbol}${job.minSalary ? job.minSalary.toLocaleString() : "0"} – ${currencySymbol}${
          job.maxSalary ? job.maxSalary.toLocaleString() : "0"
        }`
      : "Competitive Salary";

  const isVerified = job.isApproved !== false;

  return (
    <div className="group relative flex flex-col bg-[#141416] border border-white/[0.08] hover:border-[#6254f5]/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#6254f5]/10 cursor-pointer overflow-hidden">
      
      {/* Top Accent Gradient Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6254f5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* ─── Header: Company Logo + Status & Verified Badge ─── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {hasLogo ? (
            <img
              src={job.companyLogo}
              alt={companyName}
              onError={() => setImgError(true)}
              className="w-12 h-12 rounded-xl object-cover bg-[#1e1e22] border border-white/10 shrink-0 shadow-inner"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-sm font-bold text-neutral-200 shrink-0 shadow-inner">
              {initials}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 line-clamp-1">
              {companyName}
              {isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium capitalize flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-neutral-500" />
              {category}
            </span>
          </div>
        </div>

        {/* Status Tag */}
        {job.status === "active" || !job.status ? (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {job.status}
          </span>
        )}
      </div>

      {/* ─── Job Title ─── */}
      <h3 className="text-base font-extrabold text-white mb-3 line-clamp-1 group-hover:text-[#a198ff] transition-colors leading-snug">
        {title}
      </h3>

      {/* ─── Salary / Beton Highlight Pill ─── */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 bg-[#6254f5]/10 border border-[#6254f5]/25 px-3 py-1.5 rounded-xl text-xs font-bold text-[#a198ff]">
          <CircleDollar className="w-3.5 h-3.5 text-[#a198ff]" />
          <span>{formattedSalary}</span>
          <span className="text-[10px] font-normal text-neutral-400">/ yr</span>
        </div>
      </div>

      {/* ─── Badges Row (Employment Type + Location / Remote + Deadline) ─── */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {/* Employment Type */}
        <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-white/[0.04] border border-white/[0.07] rounded-full px-2.5 py-1 capitalize">
          {jobType}
        </span>

        {/* Remote vs Location */}
        {job.isRemote ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#a198ff] bg-[#6254f5]/15 border border-[#6254f5]/30 rounded-full px-2.5 py-1">
            <Globe className="w-3 h-3" /> Remote
          </span>
        ) : (
          job.location && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-white/[0.04] border border-white/[0.07] rounded-full px-2.5 py-1">
              <LocationArrow className="w-3 h-3 text-neutral-500" /> {job.location}
            </span>
          )
        )}

        {/* Deadline Tag */}
        {job.deadline && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3 text-amber-400" /> {job.deadline}
          </span>
        )}
      </div>

      {/* ─── Footer: Applicants Counter + Action Buttons ─── */}
      <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
          <Person className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-white font-bold">{job.applications || 0}</span> Candidates
        </div>

        {/* Action Icon Group (Only render Edit/Delete if isOwner is true) */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onClick={onView}
            className="w-8 h-8 min-w-8 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {isOwner && (
            <>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onClick={onEdit}
                className="w-8 h-8 min-w-8 bg-white/5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
                title="Edit Job"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>

              <Button
                isIconOnly
                size="sm"
                variant="flat"
                isLoading={isDeleting}
                onClick={onDelete}
                className="w-8 h-8 min-w-8 bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                title="Delete Job"
              >
                <TrashBin className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

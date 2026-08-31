"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";
const JOBS_PER_PAGE = 6;

export default function RecruiterJobsPage() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;

  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const fetchJobs = async () => {
    if (!currentUserEmail) { setLoading(false); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/jobs?recruiterEmail=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.jobs || [];
      setJobsList(list);
    } catch (err) {
      console.error("Error loading recruiter jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserEmail) {
      fetchJobs();
    }
  }, [currentUserEmail]);

  const totalPages = Math.ceil(jobsList.length / JOBS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    return jobsList.slice(start, start + JOBS_PER_PAGE);
  }, [jobsList, currentPage]);

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditSuccess(false);
    setEditError("");
    setEditForm({
      title: job.title || job.jobTitle || "",
      category: job.category || "Software Engineering",
      jobType: job.jobType || "full-time",
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
      minSalary: job.minSalary || "",
      maxSalary: job.maxSalary || "",
      currency: job.currency || "USD",
      location: job.location || "",
      isRemote: Boolean(job.isRemote),
      responsibilities: job.responsibilities || "",
      requirements: job.requirements || "",
      benefits: job.benefits || "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    setSavingEdit(true);
    setEditError("");
    setEditSuccess(false);

    try {
      const jobId = editingJob._id?.$oid || editingJob._id || editingJob.id;
      const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setEditSuccess(true);
        fetchJobs();
        setTimeout(() => setEditingJob(null), 1200);
      } else {
        setEditError(data?.message || "Failed to update job post.");
      }
    } catch (err) {
      console.error("Save edit error:", err);
      setEditError("Something went wrong while saving changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;
    setDeletingId(jobId);

    try {
      const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setJobsList((prev) => prev.filter((j) => (j._id?.$oid || j._id || j.id) !== jobId));
      } else {
        alert(data?.message || "Failed to delete job.");
      }
    } catch (err) {
      console.error("Delete job error:", err);
      alert("Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportJobsCSV = () => {
    if (jobsList.length === 0) return;
    const headers = ["Job Title", "Company", "Category", "Job Type", "Min Salary", "Max Salary", "Location", "Is Remote", "Deadline", "Candidates Count"];
    const rows = jobsList.map((j) => [
      `"${j.title || ''}"`,
      `"${j.companyName || ''}"`,
      `"${j.category || ''}"`,
      `"${j.jobType || ''}"`,
      `"${j.minSalary || ''}"`,
      `"${j.maxSalary || ''}"`,
      `"${j.location || ''}"`,
      `"${j.isRemote ? 'Yes' : 'No'}"`,
      `"${j.deadline ? j.deadline.split('T')[0] : ''}"`,
      `"${j.applications || 0}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `talentgrid_jobs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#ff7a00]";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1";

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            My Technical Job Postings
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Create, manage, and monitor applicant pipelines for all your active technical roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportJobsCSV}
            disabled={jobsList.length === 0}
            className="flex items-center gap-2 border px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-[var(--bg-secondary)] shadow-sm disabled:opacity-50"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <span>📥</span> Export Jobs CSV ({jobsList.length})
          </button>
          <Link href="/dashboard/recruiter/jobs/new">
            <button className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer" style={{ backgroundColor: "#ff7a00" }}>
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl animate-pulse border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }} />
          ))}
        </div>
      ) : jobsList.length === 0 ? (
        <div className="border rounded-2xl p-16 text-center flex flex-col items-center gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Briefcase className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
          <div>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No posted jobs found</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Create your first job listing to start receiving applications.</p>
          </div>
          <Link href="/dashboard/recruiter/jobs/new" className="mt-2">
            <button className="text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md cursor-pointer" style={{ backgroundColor: "#ff7a00" }}>
              Post A Job Now
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedJobs.map((job) => {
              const jobId = job._id?.$oid || job._id || job.id;
              const isDeleting = deletingId === jobId;
              const salary = job.minSalary && job.maxSalary
                ? `$${(job.minSalary / 1000).toFixed(0)}k–$${(job.maxSalary / 1000).toFixed(0)}k`
                : job.salary || "Competitive";

              return (
                <div
                  key={jobId}
                  className="border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                        {job.companyName || "Company"}
                      </span>
                      <h3 className="text-base font-bold truncate mt-0.5" style={{ color: "var(--text-primary)" }}>
                        {job.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                      Active
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2.5 py-1 rounded-lg capitalize" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      {job.jobType || "Full-time"}
                    </span>
                    {job.isRemote && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                        Remote
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "var(--bg-secondary)", color: "#ff7a00" }}>
                      {salary}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between mt-auto" style={{ borderColor: "var(--border-color)" }}>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {job.location || "Global"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/jobs/${jobId}`}>
                        <button className="border text-xs px-2.5 py-1.5 rounded-lg hover:underline cursor-pointer" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                          View
                        </button>
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(job)}
                        className="border text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
                        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#ff7a00" }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(jobId)}
                        disabled={isDeleting}
                        className="border border-red-500/20 bg-red-500/10 text-red-500 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        <TrashBin className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-30"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-30"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="border rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <h3 className="text-base font-bold">Edit Job Listing</h3>
              <button onClick={() => setEditingJob(null)} className="p-1 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <Xmark className="w-4 h-4" />
              </button>
            </div>

            {editSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold p-3 rounded-xl">
                Changes saved successfully!
              </div>
            )}
            {editError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-3 rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Job Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Employment Type</label>
                  <select
                    value={editForm.jobType}
                    onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                    className={inputCls}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Min Salary ($)</label>
                  <input
                    type="number"
                    value={editForm.minSalary}
                    onChange={(e) => setEditForm({ ...editForm, minSalary: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Salary ($)</label>
                  <input
                    type="number"
                    value={editForm.maxSalary}
                    onChange={(e) => setEditForm({ ...editForm, maxSalary: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isRemote"
                  checked={editForm.isRemote}
                  onChange={(e) => setEditForm({ ...editForm, isRemote: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isRemote" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                  This is a 100% Remote Position
                </label>
              </div>

              <div className="border-t pt-4 flex justify-end gap-2" style={{ borderColor: "var(--border-color)" }}>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: "#ff7a00" }}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

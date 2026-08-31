"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, CircleCheck, CircleExclamation, TrashBin, Globe } from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchJobs = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/jobs`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.jobs || [];
        setJobs(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    setDeletingId(jobId);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        setMessage("Job deleted successfully.");
        fetchJobs();
      } else {
        setMessage(data?.message || "Failed to delete job.");
      }
    } catch {
      setMessage("Network error deleting job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          Global Job Moderation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage, verify, and moderate technical job listings across the TalentGrid platform.
        </p>
      </div>

      {message && (
        <div className={`text-xs font-semibold px-4 py-3 rounded-xl border ${
          message.includes("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          {message}
        </div>
      )}

      {/* Jobs Table */}
      <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Briefcase className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No job listings available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                  {["Job Title", "Company", "Type", "Location", "Salary Band", "Actions"].map((h) => (
                    <th key={h} className="text-[11px] font-bold uppercase tracking-wider px-6 py-4" style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {jobs.map((job) => {
                  const jobId = job._id?.$oid || job._id || job.id;
                  const salary = job.minSalary && job.maxSalary
                    ? `$${(job.minSalary / 1000).toFixed(0)}k–$${(job.maxSalary / 1000).toFixed(0)}k`
                    : job.salary || "Competitive";

                  return (
                    <tr key={jobId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${jobId}`} className="text-sm font-bold hover:underline block" style={{ color: "var(--text-primary)" }}>
                          {job.title}
                        </Link>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>ID: #{jobId.slice(-6)}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                          {job.companyName || "Employer"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
                          {job.jobType || "Full-time"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {job.location || (job.isRemote ? "Remote" : "Global")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                          {salary}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/jobs/${jobId}`}>
                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:underline" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                              View
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(jobId)}
                            disabled={deletingId === jobId}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <TrashBin className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

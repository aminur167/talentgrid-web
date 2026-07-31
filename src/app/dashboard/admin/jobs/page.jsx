"use client";

import { useState, useEffect } from "react";
import { Briefcase, CircleCheck, CircleExclamation, TrashBin, Globe } from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchJobs = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/jobs?status=all`)
      .then((r) => r.json())
      .then((data) => setJobs(data?.jobs || []))
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
        <h1 className="text-2xl font-extrabold text-white">All Job Postings</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage and moderate all job postings across HireLoop.</p>
      </div>

      {message && (
        <div className={`text-xs font-medium px-4 py-3 rounded-xl border ${
          message.includes("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No jobs posted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Job Title", "Company", "Type", "Applications", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {jobs.map((job) => {
                  const jid = job._id?.$oid || job._id?.toString() || job.id;
                  return (
                    <tr key={jid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-white">{job.title || job.jobTitle}</p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            {job.location || "Remote"} {job.isRemote && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">Remote</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-neutral-300">{job.companyName || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-neutral-400 capitalize">{job.jobType || "Full-Time"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-[#a198ff]">{job.applications || 0}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          {job.status || "active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleDeleteJob(jid)}
                          disabled={deletingId === jid}
                          className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <TrashBin className="w-3.5 h-3.5" />
                          Delete
                        </button>
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

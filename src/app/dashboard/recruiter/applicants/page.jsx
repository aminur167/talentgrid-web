"use client";

import { useState, useEffect } from "react";
import {
  Persons,
  CircleCheck,
  CircleExclamation,
  Clock,
  Briefcase,
  Envelope,
  LocationArrow,
  FileText,
  Xmark,
  CircleDollar,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const STATUS_FILTERS = [
  { id: "all", label: "All Applicants" },
  { id: "pending", label: "Pending" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interviewing", label: "Interviewing" },
  { id: "rejected", label: "Rejected" },
  { id: "hired", label: "Hired" },
];

const STATUS_BADGES = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  shortlisted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  interviewing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  hired: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function RecruiterApplicantsPage() {
  const { data: session } = useSession();
  const recruiterEmail = session?.user?.email;

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchApplicants = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/applications`)
      .then((r) => r.json())
      .then((data) => {
        setApplicants(data?.applications || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    setFeedbackMsg("");

    try {
      const res = await fetch(`${BASE_URL}/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data?.success) {
        setFeedbackMsg(`Candidate status updated to "${newStatus}".`);
        fetchApplicants();
        if (selectedApplicant && (selectedApplicant._id?.$oid || selectedApplicant._id || selectedApplicant.id) === appId) {
          setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        setFeedbackMsg(data?.message || "Failed to update status.");
      }
    } catch {
      setFeedbackMsg("Network error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (activeFilter === "all") return true;
    return (app.status || "pending").toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Candidate Applicants</h1>
        <p className="text-sm text-neutral-400 mt-1">Review candidate profiles, cover letters, and manage hiring pipeline status.</p>
      </div>

      {feedbackMsg && (
        <div className={`text-xs font-medium px-4 py-3 rounded-xl border ${
          feedbackMsg.includes("updated") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {feedbackMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        {STATUS_FILTERS.map((f) => {
          const count = f.id === "all" ? applicants.length : applicants.filter((a) => (a.status || "pending") === f.id).length;
          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#6254f5] border-[#6254f5] text-white shadow-md shadow-[#6254f5]/30"
                  : "bg-[#141416] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isSelected ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applicants Table */}
      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Persons className="w-10 h-10 text-neutral-600" />
            <p className="text-sm text-neutral-400 font-semibold">No candidates found in this stage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Candidate", "Details & Location", "Applied Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredApplicants.map((app) => {
                  const aid = app._id?.$oid || app._id?.toString() || app.id;
                  const currentStatus = app.status || "pending";
                  return (
                    <tr key={aid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-200 shrink-0">
                            {(app.applicantName || app.applicantEmail || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{app.applicantName || "Applicant"}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1">
                              <Envelope className="w-3 h-3 text-neutral-500" />
                              {app.applicantEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs flex flex-col gap-0.5">
                          <span className="text-neutral-300 flex items-center gap-1">
                            <LocationArrow className="w-3 h-3 text-neutral-500" />
                            {app.applicantLocation || "Remote"}
                          </span>
                          {app.expectedSalary && (
                            <span className="text-emerald-400 font-semibold">
                              Exp: ${Number(app.expectedSalary).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-neutral-500">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          STATUS_BADGES[currentStatus] || STATUS_BADGES.pending
                        }`}>
                          {currentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApplicant(app)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                          >
                            View Pitch
                          </button>

                          <select
                            value={currentStatus}
                            disabled={updatingId === aid}
                            onChange={(e) => handleUpdateStatus(aid, e.target.value)}
                            className="bg-[#1e1e22] border border-white/10 text-xs font-semibold text-neutral-300 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlist</option>
                            <option value="interviewing">Interview</option>
                            <option value="hired">Hire</option>
                            <option value="rejected">Reject</option>
                          </select>
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

      {/* Applicant Cover Letter & Pitch Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141416] border border-white/15 rounded-3xl max-w-lg w-full p-6 text-white flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedApplicant.applicantName}</h3>
                <p className="text-xs text-neutral-400">{selectedApplicant.applicantEmail}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <Xmark className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-1.5">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">Candidate Details</span>
                <div className="grid grid-cols-2 gap-2 text-neutral-300">
                  <div>Location: <span className="text-white font-semibold">{selectedApplicant.applicantLocation || "N/A"}</span></div>
                  <div>Phone: <span className="text-white font-semibold">{selectedApplicant.applicantPhone || "N/A"}</span></div>
                  <div>Availability: <span className="text-white font-semibold">{selectedApplicant.availability || "Immediate"}</span></div>
                  <div>Expected Salary: <span className="text-emerald-400 font-semibold">${Number(selectedApplicant.expectedSalary || 0).toLocaleString()}</span></div>
                </div>
              </div>

              {selectedApplicant.resumeUrl && (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="text-neutral-400">Resume / Portfolio:</span>
                  <a
                    href={selectedApplicant.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#a198ff] font-bold hover:underline"
                  >
                    Open Resume URL ↗
                  </a>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">Cover Letter &amp; Pitch</span>
                <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl text-neutral-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedApplicant.coverLetter || "No cover letter provided."}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-neutral-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

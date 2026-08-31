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
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  shortlisted: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  interviewing: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  rejected: "bg-red-500/15 text-red-500 border-red-500/30",
  hired: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
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
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          Applicant Pipeline (ATS)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Review candidate profiles, cover letters, and manage hiring pipeline status.
        </p>
      </div>

      {feedbackMsg && (
        <div className={`text-xs font-medium px-4 py-3 rounded-xl border ${
          feedbackMsg.includes("updated") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? "#ff7a00" : "var(--bg-card)",
                borderColor: isSelected ? "#ff7a00" : "var(--border-color)",
                color: isSelected ? "#ffffff" : "var(--text-secondary)",
                boxShadow: isSelected ? "0 4px 12px rgba(255,122,0,0.25)" : "none",
              }}
            >
              <span>{f.label}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full" style={{
                backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--bg-secondary)",
                color: isSelected ? "#ffffff" : "var(--text-muted)",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applicants Table */}
      <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
            ))}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Persons className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No candidates found in this stage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                  {["Candidate", "Position Applied", "Availability", "Applied Date", "Stage", "Actions"].map((h) => (
                    <th key={h} className="text-[11px] font-bold uppercase tracking-wider px-6 py-4" style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {filteredApplicants.map((app) => {
                  const appId = app._id?.$oid || app._id || app.id;
                  const initials = (app.applicantName || "C")[0].toUpperCase();
                  const badgeCls = STATUS_BADGES[app.status?.toLowerCase()] || STATUS_BADGES.pending;

                  return (
                    <tr key={appId} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{app.applicantName}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{app.applicantEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {app.jobTitle || "Technical Position"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {app.availability || "Immediate"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeCls}`}>
                          {app.status || "pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedApplicant(app)}
                          className="text-xs font-bold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-primary)",
                          }}
                        >
                          Review →
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

      {/* Review Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="border rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <div>
                <h3 className="text-base font-bold">{selectedApplicant.applicantName}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedApplicant.jobTitle}</p>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="p-1 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <Xmark className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Email</span>
                <span className="font-semibold">{selectedApplicant.applicantEmail}</span>
              </div>
              {selectedApplicant.applicantPhone && (
                <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Phone</span>
                  <span className="font-semibold">{selectedApplicant.applicantPhone}</span>
                </div>
              )}
              {selectedApplicant.resumeUrl && (
                <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Resume Link</span>
                  <a href={selectedApplicant.resumeUrl} target="_blank" rel="noreferrer" className="text-[#6254f5] font-bold hover:underline">
                    Open Resume URL ↗
                  </a>
                </div>
              )}
              {selectedApplicant.coverLetter && (
                <div className="flex flex-col gap-1 pt-1">
                  <span style={{ color: "var(--text-muted)" }}>Cover Pitch</span>
                  <p className="border p-3 rounded-xl leading-relaxed whitespace-pre-line" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                    {selectedApplicant.coverLetter}
                  </p>
                </div>
              )}
            </div>

            {/* Stage Actions */}
            <div className="border-t pt-3 flex flex-wrap items-center justify-end gap-2" style={{ borderColor: "var(--border-color)" }}>
              <span className="text-xs mr-auto font-semibold" style={{ color: "var(--text-muted)" }}>Update Stage:</span>
              {["shortlisted", "interviewing", "hired", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(selectedApplicant._id?.$oid || selectedApplicant._id || selectedApplicant.id, st)}
                  disabled={updatingId !== null}
                  className="px-3 py-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: selectedApplicant.status === st ? "#ff7a00" : "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: selectedApplicant.status === st ? "#ffffff" : "var(--text-primary)",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

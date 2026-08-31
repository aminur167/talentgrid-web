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
  Calendar,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

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

  // Interview Scheduler State
  const [schedulingApplicant, setSchedulingApplicant] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/new");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [sendingInterview, setSendingInterview] = useState(false);
  const [interviewSuccess, setInterviewSuccess] = useState(false);

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
      setFeedbackMsg("Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 📥 1-Click CSV Export Handler
  const exportToCSV = () => {
    if (applicants.length === 0) return;
    const headers = [
      "Candidate Name",
      "Email",
      "Phone",
      "Location",
      "Position",
      "Company",
      "Status",
      "Expected Salary",
      "Availability",
      "Applied Date",
      "Resume Link"
    ];
    const rows = applicants.map((a) => [
      `"${a.applicantName || ''}"`,
      `"${a.applicantEmail || ''}"`,
      `"${a.applicantPhone || ''}"`,
      `"${a.applicantLocation || ''}"`,
      `"${a.jobTitle || ''}"`,
      `"${a.companyName || ''}"`,
      `"${a.status || 'pending'}"`,
      `"${a.expectedSalary || ''}"`,
      `"${a.availability || ''}"`,
      `"${a.appliedAt ? new Date(a.appliedAt).toISOString().split('T')[0] : ''}"`,
      `"${a.resumeUrl || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `talentgrid_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📅 Schedule Interview Submission
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!schedulingApplicant || !interviewDate || !interviewTime) return;

    setSendingInterview(true);
    try {
      const res = await fetch(`${BASE_URL}/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantEmail: schedulingApplicant.applicantEmail,
          recruiterEmail,
          candidateName: schedulingApplicant.applicantName,
          jobTitle: schedulingApplicant.jobTitle,
          companyName: schedulingApplicant.companyName,
          date: interviewDate,
          time: interviewTime,
          meetingLink,
          notes: interviewNotes,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setInterviewSuccess(true);
        // Also auto-update status to interviewing
        const appId = schedulingApplicant._id?.$oid || schedulingApplicant._id;
        if (appId) handleUpdateStatus(appId, "interviewing");

        setTimeout(() => {
          setSchedulingApplicant(null);
          setInterviewSuccess(false);
        }, 1500);
      } else {
        alert(data?.message || "Failed to schedule interview.");
      }
    } catch {
      alert("Network error scheduling interview.");
    } finally {
      setSendingInterview(false);
    }
  };

  const filteredApplicants = activeFilter === "all"
    ? applicants
    : applicants.filter((a) => (a.status || "pending").toLowerCase() === activeFilter);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Top Header with CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Applicant Tracking Pipeline (ATS)
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Review, shortlist, and manage candidate applications across your open roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={applicants.length === 0}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-[var(--bg-secondary)] shadow-sm disabled:opacity-50"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <span>📥</span> Export CSV ({applicants.length})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl border text-xs font-semibold bg-emerald-500/10 border-emerald-500/20 text-emerald-600 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg("")} className="cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => {
          const count = f.id === "all"
            ? applicants.length
            : applicants.filter((a) => (a.status || "pending").toLowerCase() === f.id).length;

          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: isSelected ? "#ff7a00" : "var(--bg-card)",
                borderColor: isSelected ? "#ff7a00" : "var(--border-color)",
                color: isSelected ? "#ffffff" : "var(--text-secondary)",
                boxShadow: isSelected ? "0 4px 12px rgba(255,122,0,0.25)" : "none",
              }}
            >
              <span>{f.label}</span>
              <span
                className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                style={{
                  backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--bg-secondary)",
                  color: isSelected ? "#ffffff" : "var(--text-muted)",
                }}
              >
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
            ))}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Persons className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No applicants found</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {activeFilter === "all"
                ? "No one has applied to your job postings yet."
                : `No candidates currently in the "${activeFilter}" stage.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                  {["Candidate", "Applied For", "Expected Salary", "Applied On", "Stage", "Actions"].map((h) => (
                    <th key={h} className="text-[11px] font-bold uppercase tracking-wider px-6 py-4" style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {filteredApplicants.map((app) => {
                  const appId = app._id?.$oid || app._id || app.id;
                  const currentStatus = (app.status || "pending").toLowerCase();

                  return (
                    <tr key={appId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#ff7a00" }}>
                            {(app.applicantName || app.applicantEmail || "C")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                              {app.applicantName || "Candidate"}
                            </p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                              {app.applicantEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {app.jobTitle || "Technical Position"}
                        </span>
                        <span className="text-[10px] block" style={{ color: "var(--text-muted)" }}>
                          {app.companyName || "Employer"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold" style={{ color: "#ff7a00" }}>
                          {app.expectedSalary || "Flexible"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          STATUS_BADGES[currentStatus] || STATUS_BADGES.pending
                        }`}>
                          {currentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApplicant(app)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:underline cursor-pointer"
                            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                          >
                            Review
                          </button>

                          {/* 📅 Schedule Interview Button */}
                          <button
                            onClick={() => {
                              setSchedulingApplicant(app);
                              setInterviewDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                              setInterviewTime("14:00");
                            }}
                            className="p-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-all cursor-pointer"
                            title="Schedule Interview"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {currentStatus !== "shortlisted" && currentStatus !== "hired" && (
                            <button
                              onClick={() => handleUpdateStatus(appId, "shortlisted")}
                              disabled={updatingId === appId}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50"
                            >
                              Shortlist
                            </button>
                          )}

                          {currentStatus === "shortlisted" && (
                            <button
                              onClick={() => handleUpdateStatus(appId, "hired")}
                              disabled={updatingId === appId}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50"
                            >
                              Hire
                            </button>
                          )}
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

      {/* Review Candidate Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="border rounded-3xl max-w-xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff7a00]">Candidate Dossier</span>
                <h3 className="text-xl font-extrabold">{selectedApplicant.applicantName || "Candidate Details"}</h3>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="p-1 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <Xmark className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Target Role</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedApplicant.jobTitle}</span>
              </div>
              <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Email</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedApplicant.applicantEmail}</span>
              </div>
              <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Phone</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedApplicant.applicantPhone || "Not provided"}</span>
              </div>
              <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Location</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedApplicant.applicantLocation || "Global"}</span>
              </div>
            </div>

            {/* Resume Link */}
            {selectedApplicant.resumeUrl && (
              <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#ff7a00]" />
                  <div>
                    <p className="text-xs font-bold">Resume / Portfolio Document</p>
                    <p className="text-[11px] truncate max-w-[280px]" style={{ color: "var(--text-muted)" }}>{selectedApplicant.resumeUrl}</p>
                  </div>
                </div>
                <a href={selectedApplicant.resumeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-white px-3.5 py-1.5 rounded-lg" style={{ backgroundColor: "#ff7a00" }}>
                  Open Resume ↗
                </a>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApplicant.coverLetter && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Cover Letter</label>
                <div className="p-4 rounded-xl border text-xs leading-relaxed max-h-36 overflow-y-auto" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                  {selectedApplicant.coverLetter}
                </div>
              </div>
            )}

            {/* ATS Status Action Buttons */}
            <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-2" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Change Stage:</span>
                {["pending", "shortlisted", "interviewing", "rejected", "hired"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedApplicant._id?.$oid || selectedApplicant._id, st)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      (selectedApplicant.status || "pending") === st ? "bg-[#ff7a00] text-white border-[#ff7a00]" : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-xs font-semibold px-4 py-2 rounded-xl border"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📅 Schedule Interview Modal */}
      {schedulingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="border rounded-3xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-5 shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Live Interview Setup</span>
                <h3 className="text-base font-bold">Invite {schedulingApplicant.applicantName}</h3>
              </div>
              <button onClick={() => setSchedulingApplicant(null)} className="p-1 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <Xmark className="w-4 h-4" />
              </button>
            </div>

            {interviewSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
                ✓ Interview invitation dispatched to candidate's notifications!
              </div>
            )}

            <form onSubmit={handleScheduleInterview} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-def-ghi"
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Invitation Notes / Agenda</label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="e.g. 45-min technical architecture deep dive with Engineering Lead..."
                  className="w-full border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="border-t pt-3 flex justify-end gap-2" style={{ borderColor: "var(--border-color)" }}>
                <button
                  type="button"
                  onClick={() => setSchedulingApplicant(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInterview}
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: "#7b6eff" }}
                >
                  {sendingInterview ? "Dispatching..." : "Send Invitation →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

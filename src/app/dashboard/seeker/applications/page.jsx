"use client";

import { useState, useEffect } from "react";
import { Clock, CircleCheck, Briefcase } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    shortlisted: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    interviewing: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    rejected: "bg-red-500/15 text-red-500 border-red-500/30",
    hired: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  };
  const cls = map[status?.toLowerCase()] || map.pending;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cls}`}>
      {status || "pending"}
    </span>
  );
}

export default function SeekerApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = session?.user;

  useEffect(() => {
    if (!user?.email) return;
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => setApplications(data?.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.email]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          My Applications
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Track and manage your submitted candidate applications in real-time.
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Total", count: applications.length, color: "text-[#6254f5]" },
          { label: "Pending", count: applications.filter(a=>a.status==='pending').length, color: "text-amber-500" },
          { label: "Shortlisted", count: applications.filter(a=>a.status==='shortlisted').length, color: "text-blue-500" },
          { label: "Rejected", count: applications.filter(a=>a.status==='rejected').length, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="border rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <span className={`text-lg font-extrabold ${s.color}`}>{loading ? '—' : s.count}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Briefcase className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No applications yet. Start applying to jobs!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                  {["Company", "Position", "Job Type", "Applied On", "Status"].map(h => (
                    <th key={h} className="text-[11px] font-bold uppercase tracking-wider px-6 py-4" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {applications.map((app, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                          {(app.companyName || 'C')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{app.companyName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{app.jobTitle || 'Position'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{app.jobType || 'Full-time'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : 'Recent'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
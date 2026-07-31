"use client";
import { useState, useEffect } from "react";
import { Clock, CircleCheck, Briefcase } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    shortlisted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    interviewing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    hired: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
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
        <h1 className="text-2xl font-extrabold text-white">My Applications</h1>
        <p className="text-sm text-neutral-400 mt-1">Track all your job applications in one place.</p>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Total", count: applications.length, color: "text-white" },
          { label: "Pending", count: applications.filter(a=>a.status==='pending').length, color: "text-amber-400" },
          { label: "Shortlisted", count: applications.filter(a=>a.status==='shortlisted').length, color: "text-blue-400" },
          { label: "Rejected", count: applications.filter(a=>a.status==='rejected').length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className={`text-lg font-extrabold ${s.color}`}>{loading ? '—' : s.count}</span>
            <span className="text-xs text-neutral-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Briefcase className="w-10 h-10 text-neutral-600" />
            <p className="text-sm text-neutral-400">No applications yet. Start applying to jobs!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Company", "Position", "Job Type", "Applied On", "Status"].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {applications.map((app, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                          {(app.companyName || 'C')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{app.companyName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-neutral-200">{app.jobTitle || 'Position'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-neutral-400 capitalize">{app.jobType || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-neutral-500">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
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
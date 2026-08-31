"use client";

import { useState, useEffect } from "react";
import { Persons, ShieldCheck, Briefcase } from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

const ROLE_STYLES = {
  admin: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  recruiter: "bg-[#ff7a00]/15 text-[#ff7a00] border-[#ff7a00]/30",
  job_seeker: "bg-[#6254f5]/15 text-[#6254f5] border-[#6254f5]/30",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/hl_token=([^;]+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    const token = getToken();
    fetch(`${BASE_URL}/api/admin/users`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      credentials: 'include',
    })
    .then(r => r.json())
    .then(data => {
      if (data?.success) {
        setUsers(data.users || []);
      } else {
        setError(data?.message || 'Failed to load users. Are you logged in as admin?');
      }
    })
    .catch(() => setError('Network error loading users.'))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          User Directory
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          View and monitor all registered candidates, recruiters, and platform administrators.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-500">{error}</div>
      )}

      <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Persons className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No registered users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                  {["User", "Email", "Role", "Joined Date"].map(h => (
                    <th key={h} className="text-[11px] font-bold uppercase tracking-wider px-6 py-4" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {users.map((u, i) => (
                  <tr key={u._id || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                          {(u.name || u.email || 'U')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{u.name || 'Unnamed User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        ROLE_STYLES[u.role] || ROLE_STYLES.job_seeker
                      }`}>
                        {u.role ? u.role.replace('_', ' ') : 'Job Seeker'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                      </span>
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

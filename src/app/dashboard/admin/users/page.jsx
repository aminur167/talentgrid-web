"use client";
import { useState, useEffect } from "react";
import { Persons, ShieldCheck, Briefcase } from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const ROLE_STYLES = {
  admin: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  recruiter: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  job_seeker: "bg-[#6254f5]/15 text-[#a198ff] border-[#6254f5]/30",
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
        <h1 className="text-2xl font-extrabold text-white">All Users</h1>
        <p className="text-sm text-neutral-400 mt-1">View all registered users on HireLoop.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">{error}</div>
      )}

      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Persons className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['User', 'Email', 'Role', 'Joined'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300">
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-neutral-400">{user.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        ROLE_STYLES[user.role] || ROLE_STYLES.job_seeker
                      }`}>
                        {user.role?.replace('_', ' ') || 'job seeker'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-neutral-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'}
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

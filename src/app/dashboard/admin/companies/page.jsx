"use client";

import { useState, useEffect } from "react";
import { CircleCheck, CircleExclamation, Clock, Factory } from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");

  const getToken = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/hl_token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchCompanies = () => {
    setLoading(true);
    const url = filter === 'all'
      ? `${BASE_URL}/api/companies`
      : `${BASE_URL}/api/companies?status=${filter}`;
    fetch(url)
      .then(r => r.json())
      .then(data => setCompanies(data?.companies || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, [filter]);

  const handleAction = async (companyId, status) => {
    setActionLoading(companyId + status);
    setMessage("");
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/companies/${companyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage(`Company ${status} successfully.`);
        fetchCompanies();
      } else {
        setMessage(data?.message || 'Action failed. Make sure you are logged in as admin.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          Company Approvals &amp; Brands
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Review, approve, or suspend hiring companies on the TalentGrid platform.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${
          message.includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All Companies" },
          { key: "pending", label: "Pending Review" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
            style={{
              backgroundColor: filter === f.key ? "var(--accent)" : "var(--bg-card)",
              borderColor: filter === f.key ? "var(--accent)" : "var(--border-color)",
              color: filter === f.key ? "#ffffff" : "var(--text-secondary)",
              boxShadow: filter === f.key ? "0 4px 12px rgba(98,84,245,0.25)" : "none",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Companies List */}
      <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center">
            <Factory className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No companies in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                  {["Company", "Recruiter Lead", "Industry", "Location", "Status", "Actions"].map(h => (
                    <th key={h} className="text-[11px] font-bold uppercase tracking-wider px-6 py-4" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                          {(c.name || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                          {c.website && (
                            <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="text-xs text-[#6254f5] hover:underline truncate block max-w-[150px]">
                              {c.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.recruiterEmail || c.email || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.industry || 'Technology'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{c.location || 'Global'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        c.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : c.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {c.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {c.status !== 'approved' && (
                          <button
                            onClick={() => handleAction(c._id, 'approved')}
                            disabled={actionLoading === c._id + 'approved'}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {c.status !== 'rejected' && (
                          <button
                            onClick={() => handleAction(c._id, 'rejected')}
                            disabled={actionLoading === c._id + 'rejected'}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
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
"use client";
import { useState, useEffect } from "react";
import { CircleCheck, CircleExclamation, Clock, Factory } from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState("all"); // all | pending | approved | rejected
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch hl_token from cookie or localStorage for admin auth
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

  const statusColors = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    suspended: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Company Management</h1>
        <p className="text-sm text-neutral-400 mt-1">Approve or reject company profiles submitted by recruiters.</p>
      </div>

      {message && (
        <div className={`text-xs font-medium px-4 py-3 rounded-xl border ${
          message.includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer capitalize ${
              filter === f
                ? 'bg-[#6254f5] text-white border-[#6254f5]'
                : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Companies Table */}
      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No companies found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['Company', 'Recruiter', 'Submitted', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {companies.map((company) => {
                  const cid = company._id?.$oid || company._id?.toString();
                  return (
                    <tr key={cid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300">
                            {(company.name || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{company.name}</p>
                            <p className="text-xs text-neutral-500">{company.website || company.industry || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-neutral-400">{company.recruiterEmail || company.email || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-neutral-500">
                          {company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          statusColors[company.status] || statusColors.pending
                        }`}>
                          {company.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          {company.status !== 'approved' && (
                            <button
                              onClick={() => handleAction(cid, 'approved')}
                              disabled={actionLoading === cid + 'approved'}
                              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <CircleCheck className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}
                          {company.status !== 'rejected' && (
                            <button
                              onClick={() => handleAction(cid, 'rejected')}
                              disabled={actionLoading === cid + 'rejected'}
                              className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <CircleExclamation className="w-3.5 h-3.5" /> Reject
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
    </div>
  );
}
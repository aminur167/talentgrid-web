"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Persons, Factory, Briefcase, Clock, CircleCheck, ArrowRight } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pending companies
    Promise.all([
      fetch(`${BASE_URL}/api/companies?status=pending`).then(r => r.json()),
      fetch(`${BASE_URL}/api/applications`).then(r => r.json()),
    ])
    .then(([compData, appData]) => {
      const pending = compData?.companies || [];
      setPendingCompanies(pending.slice(0, 5));
      
      // Build stats from what we have
      setStats({
        pendingCompanies: pending.length,
        totalApplications: appData?.total || 0,
      });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const user = session?.user;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">Welcome, {user?.name || 'Admin'}. Manage the platform from here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Approvals", value: stats?.pendingCompanies ?? 0, icon: Clock, color: "text-amber-400", href: "/dashboard/admin/companies" },
          { label: "Total Applications", value: stats?.totalApplications ?? 0, icon: Briefcase, color: "text-[#a198ff]", href: "/dashboard/admin/jobs" },
          { label: "All Users", value: "—", icon: Persons, color: "text-emerald-400", href: "/dashboard/admin/users" },
          { label: "All Companies", value: "—", icon: Building, color: "text-blue-400", href: "/dashboard/admin/companies" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3 hover:border-white/20 transition-all cursor-pointer">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-extrabold text-white">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Companies */}
      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-bold text-white">Pending Company Approvals</h2>
          <Link href="/dashboard/admin/companies" className="text-xs text-[#a198ff] hover:text-white flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : pendingCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <CircleCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No pending company approvals.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {pendingCompanies.map((company, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300">
                    {(company.name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{company.name}</p>
                    <p className="text-xs text-neutral-500">{company.recruiterEmail || company.email || '—'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
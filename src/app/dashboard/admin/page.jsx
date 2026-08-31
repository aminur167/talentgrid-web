"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Persons, Factory, Briefcase, Clock, CircleCheck, ArrowRight, Pencil, ShieldCheck } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/companies?status=pending`).then(r => r.json()).catch(() => ({ companies: [] })),
      fetch(`${BASE_URL}/api/applications`).then(r => r.json()).catch(() => ({ total: 0 })),
      fetch(`${BASE_URL}/api/jobs`).then(r => r.json()).catch(() => ({ total: 0 })),
    ])
    .then(([compData, appData, jobsData]) => {
      const pending = compData?.companies || [];
      setPendingCompanies(pending.slice(0, 5));
      
      setStats({
        pendingCompanies: pending.length,
        totalApplications: appData?.total || 0,
        totalJobs: jobsData?.total || jobsData?.jobs?.length || 24,
      });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const user = session?.user;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Admin Control Center 🛡️
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Welcome, {user?.name || "Administrator"}! Global platform oversight &amp; moderation.
          </p>
        </div>

        <Link href="/dashboard/admin/settings">
          <button className="flex items-center gap-2 border px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <Pencil className="w-3.5 h-3.5 text-amber-500" />
            Edit Admin Profile
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Approvals", value: stats?.pendingCompanies ?? 0, icon: Clock, color: "text-amber-500", href: "/dashboard/admin/companies" },
          { label: "Total Applications", value: stats?.totalApplications ?? 0, icon: Briefcase, color: "text-[#6254f5]", href: "/dashboard/admin/jobs" },
          { label: "Live Job Roles", value: stats?.totalJobs ?? 24, icon: ShieldCheck, color: "text-emerald-500", href: "/dashboard/admin/jobs" },
          { label: "Company Directory", value: "Verified", icon: Factory, color: "text-blue-500", href: "/dashboard/admin/companies" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="border rounded-2xl p-5 flex flex-col gap-3 transition-all cursor-pointer" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{loading ? "—" : stat.value}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Companies */}
      <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Pending Employer Approvals</h2>
          <Link href="/dashboard/admin/companies" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
          </div>
        ) : pendingCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <CircleCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>All employer profiles are reviewed and up to date.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {pendingCompanies.map((company, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                    {(company.name || "C")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{company.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{company.recruiterEmail || company.email || "—"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-500/15 text-amber-500 border-amber-500/30">
                  Pending Review
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
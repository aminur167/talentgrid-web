"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  CircleCheck,
  CircleExclamation,
  ArrowRight,
  CrownDiamond,
  Person,
  Pencil,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

function AppLimitBar({ used, total }) {
  const pct = Math.min((used / total) * 100, 100);
  const color =
    used === 0 ? "bg-emerald-500"
    : used === 1 ? "bg-emerald-500"
    : used === 2 ? "bg-amber-400"
    : "bg-red-500";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "var(--text-secondary)" }}>Free applications used</span>
        <span className={`font-bold ${
          used >= total ? "text-red-500" : used >= 2 ? "text-amber-500" : "text-emerald-500"
        }`}>
          {used} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {used === 0 && "You have 3 free applications. Start applying!"}
        {used === 1 && "Good start! 2 free applications remaining."}
        {used === 2 && "⚠️ Only 1 free application left. Use it wisely!"}
        {used >= 3 && "🔴 Free limit reached. Upgrade to apply to more jobs."}
      </p>
    </div>
  );
}

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
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
      {status || "pending"}
    </span>
  );
}

export default function SeekerDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user;

  useEffect(() => {
    if (!user?.email) return;

    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(user.email)}&_t=${Date.now()}`, {
      cache: "no-store",
    })
      .then(r => r.json())
      .then(data => {
        const apps = data?.applications || [];
        setRecentApps(apps.slice(0, 5));
        setStats({
          totalApplied: apps.length,
          pendingCount: apps.filter(a => a.status === 'pending').length,
          shortlistedCount: apps.filter(a => a.status === 'shortlisted').length,
          rejectedCount: apps.filter(a => a.status === 'rejected').length,
          freeLimit: 3,
          plan: 'starter',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.email]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Welcome & Profile Quick Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Here's an overview of your job search progress.
          </p>
        </div>
        <Link href="/dashboard/seeker/settings">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <Pencil className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            Edit My Profile
          </button>
        </Link>
      </div>

      {/* Application Limit Card */}
      <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Free Application Quota</h2>
          {stats?.totalApplied >= 3 && (
            <Link href="/plans">
              <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
                <CrownDiamond className="w-3.5 h-3.5" /> Upgrade Plan
              </button>
            </Link>
          )}
        </div>
        {loading ? (
          <div className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
        ) : (
          <AppLimitBar used={stats?.totalApplied || 0} total={3} />
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Applied", value: stats?.totalApplied ?? 0, icon: Briefcase, color: "text-[#6254f5]" },
          { label: "Pending", value: stats?.pendingCount ?? 0, icon: Clock, color: "text-amber-500" },
          { label: "Shortlisted", value: stats?.shortlistedCount ?? 0, icon: CircleCheck, color: "text-emerald-500" },
          { label: "Rejected", value: stats?.rejectedCount ?? 0, icon: CircleExclamation, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="border rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{loading ? '—' : stat.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="border rounded-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Recent Applications</h2>
          <Link href="/dashboard/seeker/applications" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: "var(--accent)" }}>
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
          </div>
        ) : recentApps.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No applications yet.</p>
            <Link href="/jobs">
              <button className="mt-3 text-xs font-bold cursor-pointer hover:underline" style={{ color: "var(--accent)" }}>Browse Jobs →</button>
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {recentApps.map((app, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--accent)" }}>
                  {(app.companyName || app.applicantName || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{app.jobTitle || 'Position'}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{app.companyName || 'Company'}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA to browse jobs */}
      <div className="border rounded-2xl p-5 flex items-center justify-between gap-4" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Find your next opportunity</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Hundreds of verified jobs waiting for you.</p>
        </div>
        <Link href="/jobs">
          <button className="flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all whitespace-nowrap" style={{ backgroundColor: "var(--accent)" }}>
            Browse Jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
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
        <span className="text-neutral-400">Free applications used</span>
        <span className={`font-bold ${
          used >= total ? "text-red-400" : used >= 2 ? "text-amber-400" : "text-emerald-400"
        }`}>
          {used} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-neutral-500">
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
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    shortlisted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    interviewing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    hired: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
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

    // Fetch applications for display
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        const apps = data?.applications || [];
        setRecentApps(apps.slice(0, 5));
        // Build stats from apps
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
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
        <p className="text-sm text-neutral-400 mt-1">Here's an overview of your job search progress.</p>
      </div>

      {/* Application Limit Card */}
      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Free Application Quota</h2>
          {stats?.totalApplied >= 3 && (
            <Link href="/plans">
              <button className="flex items-center gap-1.5 text-xs font-bold text-[#a198ff] bg-[#6254f5]/15 border border-[#6254f5]/30 px-3 py-1.5 rounded-lg hover:bg-[#6254f5]/25 transition-all cursor-pointer">
                <CrownDiamond className="w-3.5 h-3.5" /> Upgrade Plan
              </button>
            </Link>
          )}
        </div>
        {loading ? (
          <div className="h-8 bg-white/5 animate-pulse rounded-lg" />
        ) : (
          <AppLimitBar used={stats?.totalApplied || 0} total={3} />
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Applied", value: stats?.totalApplied ?? 0, icon: Briefcase, color: "text-[#a198ff]" },
          { label: "Pending", value: stats?.pendingCount ?? 0, icon: Clock, color: "text-amber-400" },
          { label: "Shortlisted", value: stats?.shortlistedCount ?? 0, icon: CircleCheck, color: "text-emerald-400" },
          { label: "Rejected", value: stats?.rejectedCount ?? 0, icon: CircleExclamation, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141416] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-extrabold text-white">{loading ? '—' : stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-[#141416] border border-white/[0.08] rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-bold text-white">Recent Applications</h2>
          <Link href="/dashboard/seeker/applications" className="text-xs text-[#a198ff] hover:text-white flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : recentApps.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No applications yet.</p>
            <Link href="/jobs">
              <button className="mt-3 text-xs font-semibold text-[#a198ff] hover:text-white cursor-pointer">Browse Jobs →</button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {recentApps.map((app, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#1e1e22] border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                  {(app.companyName || app.applicantName || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{app.jobTitle || 'Position'}</p>
                  <p className="text-xs text-neutral-500 truncate">{app.companyName || 'Company'}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA to browse jobs */}
      <div className="bg-gradient-to-r from-[#6254f5]/20 to-[#a198ff]/10 border border-[#6254f5]/30 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Find your next opportunity</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Hundreds of verified jobs waiting for you.</p>
        </div>
        <Link href="/jobs">
          <button className="flex items-center gap-2 bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-[#6254f5]/30 cursor-pointer transition-all whitespace-nowrap">
            Browse Jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
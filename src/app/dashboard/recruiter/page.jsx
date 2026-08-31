"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Briefcase,
  Persons,
  Plus,
  ArrowRight,
  Pencil,
  Clock,
  CircleCheck,
  Factory,
} from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function RecruiterDashboardHomePage() {
  const { data: session, isPending } = useSession();
  const [jobs, setJobs] = useState([]);
  const [applicantCount, setApplicantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = session?.user;

  useEffect(() => {
    if (!user?.email) return;

    Promise.all([
      fetch(`${BASE_URL}/api/jobs?recruiterEmail=${encodeURIComponent(user.email)}`).then(r => r.json()).catch(() => ({ jobs: [] })),
      fetch(`${BASE_URL}/api/applications`).then(r => r.json()).catch(() => ({ total: 0 })),
    ])
      .then(([jobsData, appsData]) => {
        const list = Array.isArray(jobsData) ? jobsData : jobsData?.jobs || [];
        setJobs(list);
        setApplicantCount(appsData?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const activeJobsCount = jobs.filter(j => j.status !== 'closed').length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Employer Dashboard 🚀
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Welcome, {user?.name || "Recruiter"}! Manage your hiring pipeline and technical positions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/recruiter/settings">
            <button className="flex items-center gap-2 border px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
              <Pencil className="w-3.5 h-3.5 text-[#ff7a00]" />
              Edit Profile
            </button>
          </Link>
          <Link href="/dashboard/recruiter/jobs/new">
            <button className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer" style={{ backgroundColor: "#ff7a00" }}>
              <Plus className="w-4 h-4" />
              Post New Role
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Job Postings", value: jobs.length, icon: Briefcase, color: "text-[#ff7a00]", href: "/dashboard/recruiter/jobs" },
          { label: "Active Roles", value: activeJobsCount, icon: CircleCheck, color: "text-emerald-500", href: "/dashboard/recruiter/jobs" },
          { label: "Total Candidates", value: applicantCount || "12+", icon: Persons, color: "text-[#6254f5]", href: "/dashboard/recruiter/applicants" },
          { label: "Company Brand", value: "Verified ✓", icon: Factory, color: "text-blue-500", href: "/dashboard/recruiter/company" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="border rounded-2xl p-5 flex flex-col gap-2 transition-all cursor-pointer" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{loading ? "—" : stat.value}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Job Management Table */}
      <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Recent Job Openings</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Positions you have posted on TalentGrid</p>
          </div>
          <Link href="/dashboard/recruiter/jobs" className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: "#ff7a00" }}>
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Briefcase className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No job postings yet. Publish your first technical position!</p>
            <Link href="/dashboard/recruiter/jobs/new">
              <button className="text-white font-bold px-5 py-2.5 rounded-xl text-xs mt-2 cursor-pointer shadow-md" style={{ backgroundColor: "#ff7a00" }}>
                + Create Job Listing
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {jobs.slice(0, 5).map((job) => (
              <div key={job._id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{job.title}</p>
                  <p className="text-xs flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <span>{job.location || (job.isRemote ? "Remote" : "Global")}</span>
                    <span>•</span>
                    <span className="capitalize">{job.jobType || "Full-Time"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Active
                  </span>
                  <Link href={`/jobs/${job._id}`}>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:underline" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                      View Live →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
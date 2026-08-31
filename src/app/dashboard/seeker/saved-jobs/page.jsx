"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, BookmarkFill, Briefcase, TrashBin, Globe, ArrowRight } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

export default function SeekerSavedJobsPage() {
  const { data: session, isPending } = useSession();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const user = session?.user;

  const fetchSavedJobs = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/saved-jobs?email=${encodeURIComponent(user.email)}&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        setSavedList(data.savedJobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }
    fetchSavedJobs();
  }, [user?.email, isPending]);

  const handleRemove = async (jobId) => {
    if (!user?.email) return;
    setRemovingId(jobId);
    try {
      const res = await fetch(`${BASE_URL}/api/saved-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, jobId }),
      });
      const data = await res.json();
      if (data?.success) {
        setSavedList((prev) => prev.filter((item) => item.jobId !== jobId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Saved Jobs &amp; Bookmarks
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Review, organize, and apply to technical roles you've bookmarked for later.
          </p>
        </div>
        <Link href="/jobs">
          <button className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all" style={{ backgroundColor: "var(--accent)" }}>
            Browse More Roles <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Summary Tag */}
      <div className="flex items-center gap-3">
        <div className="border rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <BookmarkFill className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{loading ? "—" : savedList.length}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Saved Bookmarks</span>
        </div>
      </div>

      {/* Saved Jobs List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }} />
          ))}
        </div>
      ) : savedList.length === 0 ? (
        <div className="border rounded-3xl p-16 text-center flex flex-col items-center gap-4 shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No saved jobs yet</h3>
            <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
              Click the bookmark icon on any job posting while browsing to keep track of roles you're interested in.
            </p>
          </div>
          <Link href="/jobs">
            <button className="text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer mt-2" style={{ backgroundColor: "var(--accent)" }}>
              Explore Job Listings →
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedList.map((item) => {
            const job = item.job;
            if (!job) return null;
            const jobId = job._id?.$oid || job._id || item.jobId;
            const isRemoving = removingId === jobId;
            const salary = job.minSalary && job.maxSalary
              ? `$${(job.minSalary / 1000).toFixed(0)}k–$${(job.maxSalary / 1000).toFixed(0)}k`
              : job.salary || "Competitive";

            return (
              <div
                key={item._id || jobId}
                className="border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                      {job.companyName || "Partner"}
                    </span>
                    <h3 className="text-base font-bold truncate mt-0.5" style={{ color: "var(--text-primary)" }}>
                      {job.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleRemove(jobId)}
                    disabled={isRemoving}
                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                    title="Remove from saved"
                  >
                    <TrashBin className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg capitalize" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                    {job.jobType || "Full-time"}
                  </span>
                  {job.isRemote && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Remote
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--accent)" }}>
                    {salary}
                  </span>
                </div>

                <div className="border-t pt-3 flex items-center justify-between mt-auto" style={{ borderColor: "var(--border-color)" }}>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {job.location || "Global"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/jobs/${jobId}`}>
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:underline cursor-pointer" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                        Details
                      </button>
                    </Link>
                    <Link href={`/jobs/${jobId}/apply`}>
                      <button className="text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer" style={{ backgroundColor: "var(--accent)" }}>
                        Apply Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

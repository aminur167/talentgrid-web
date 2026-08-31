"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Magnifier,
  LocationArrow,
  Person,
  Briefcase,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Factory,
  ShieldCheck,
  Globe,
  ArrowUpRight,
} from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";
const CACHE_KEY = "tg_browse_companies";
const CACHE_TTL = 60_000;
const ITEMS_PER_PAGE = 6;

const INDUSTRIES = ["All", "Technology", "Fintech", "Healthcare", "E-commerce", "Design", "Artificial Intelligence"];
const SIZES = ["All", "1-10 employees", "11-50 employees", "51-200 employees", "500+ employees", "10,000+ employees"];

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export default function BrowseCompaniesPage() {
  const [allCompanies, setAllCompanies] = useState(() => readCache() || []);
  const [loading, setLoading] = useState(() => !readCache());
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setAllCompanies(cached);
      setLoading(false);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch(`${BASE_URL}/api/companies`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.companies || [];
        setAllCompanies(list);
        writeCache(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = useMemo(() => {
    let list = allCompanies;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    if (selectedIndustry !== "All") {
      list = list.filter((c) => c.industry?.toLowerCase().includes(selectedIndustry.toLowerCase()));
    }
    if (selectedSize !== "All") {
      list = list.filter((c) =>
        (c.employCount || c.size || "").toLowerCase().includes(selectedSize.toLowerCase())
      );
    }
    return list;
  }, [allCompanies, search, selectedIndustry, selectedSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedIndustry, selectedSize]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE));
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const handleRefresh = () => {
    sessionStorage.removeItem(CACHE_KEY);
    fetchedRef.current = false;
    setLoading(true);
    fetch(`${BASE_URL}/api/companies`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.companies || [];
        setAllCompanies(list);
        writeCache(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* ─── Hero Section ─── */}
      <section
        className="relative py-16 px-6 lg:px-12 border-b overflow-hidden"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Subtle Ambient Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(98,84,245,0.08) 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto flex flex-col gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border w-fit"
            style={{
              backgroundColor: "var(--accent-light)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <Factory className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Employer Directory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Browse Leading Tech Companies
          </h1>
          <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Discover world-class engineering teams, startups, and high-growth organizations hiring top talent across the globe.
          </p>
        </div>
      </section>

      {/* ─── Search & Filters Bar ─── */}
      <section
        className="border-b py-4 sticky top-16 z-30 backdrop-blur-md transition-colors"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Box */}
          <div
            className="flex-1 flex items-center gap-3 border rounded-xl px-4 py-2.5 shadow-xs transition-colors"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <Magnifier className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by company name, industry, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs px-1.5 py-0.5 rounded cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-pointer shadow-xs"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i} style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
                {i === "All" ? "All Industries" : i}
              </option>
            ))}
          </select>

          {/* Size Filter */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-pointer shadow-xs"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {SIZES.map((s) => (
              <option key={s} value={s} style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
                {s === "All" ? "All Sizes" : s}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-[#6254f5]/20 hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Refresh
          </button>
        </div>
      </section>

      {/* ─── Main Content Grid ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex-1 flex flex-col gap-8 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="border rounded-2xl p-6 animate-pulse flex flex-col gap-4"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: "var(--border-color)" }} />
                  <div className="w-20 h-5 rounded-full" style={{ backgroundColor: "var(--border-color)" }} />
                </div>
                <div className="w-2/3 h-5 rounded" style={{ backgroundColor: "var(--border-color)" }} />
                <div className="w-full h-10 rounded" style={{ backgroundColor: "var(--border-color)" }} />
                <div className="flex gap-2">
                  <div className="w-16 h-6 rounded-full" style={{ backgroundColor: "var(--border-color)" }} />
                  <div className="w-20 h-6 rounded-full" style={{ backgroundColor: "var(--border-color)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div
              className="w-16 h-16 rounded-2xl border flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}
            >
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>No Companies Found</h3>
              <p className="text-sm max-w-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {search || selectedIndustry !== "All" || selectedSize !== "All"
                  ? "Try broadening your search keywords or resetting filters."
                  : "No companies are currently registered."}
              </p>
            </div>
            {(search || selectedIndustry !== "All" || selectedSize !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedIndustry("All");
                  setSelectedSize("All");
                }}
                className="text-xs font-bold underline cursor-pointer"
                style={{ color: "var(--accent)" }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header count */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Showing <strong style={{ color: "var(--text-primary)" }}>{paginatedCompanies.length}</strong> of{" "}
                <strong style={{ color: "var(--text-primary)" }}>{filteredCompanies.length}</strong> registered employers
              </p>
              {totalPages > 1 && (
                <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedCompanies.map((company) => (
                <CompanyCard key={company._id || company.name} company={company} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold px-4" style={{ color: "var(--text-secondary)" }}>
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function CompanyCard({ company }) {
  const [imgError, setImgError] = useState(false);

  const initials = company.name
    ? company.name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CO";

  const hasLogo = company.logo && company.logo.startsWith("http") && !imgError;

  return (
    <div
      className="group flex flex-col border rounded-2xl p-6 transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-1"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Row 1: Logo + Verification Status */}
      <div className="flex items-start justify-between mb-4">
        {hasLogo ? (
          <img
            src={company.logo}
            alt={company.name}
            onError={() => setImgError(true)}
            className="w-12 h-12 rounded-xl object-cover border shrink-0"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-extrabold shrink-0 shadow-xs"
            style={{
              backgroundColor: "var(--accent-light)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            {initials}
          </div>
        )}

        {company.isApproved !== false ? (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
          </span>
        )}
      </div>

      {/* Row 2: Company Name */}
      <h3
        className="text-base font-extrabold mb-1.5 line-clamp-1 group-hover:text-[#6254f5] transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        {company.name}
      </h3>

      {/* Row 3: Description */}
      <p
        className="text-xs leading-relaxed line-clamp-2 mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        {company.description ||
          `A forward-thinking ${company.industry || "technology"} organization${
            company.location ? ` headquartered in ${company.location}` : ""
          }.`}
      </p>

      {/* Row 4: Industry & Location Badges */}
      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
        {company.industry && (
          <span
            className="flex items-center gap-1 text-[11px] font-medium border rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <Briefcase className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            {company.industry}
          </span>
        )}
        {company.location && (
          <span
            className="flex items-center gap-1 text-[11px] font-medium border rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <LocationArrow className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            {company.location}
          </span>
        )}
        {(company.employCount || company.size) && (
          <span
            className="flex items-center gap-1 text-[11px] font-medium border rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <Person className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            {company.employCount || company.size}
          </span>
        )}
      </div>

      {/* Row 5: Action Footer */}
      <div
        className="flex items-center justify-between border-t pt-4"
        style={{ borderColor: "var(--border-color)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-primary)" }}>{company.activeJobsCount || "2+"}</strong> open roles
        </span>

        <Link
          href={`/jobs?search=${encodeURIComponent(company.name)}`}
          className="inline-flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
          style={{ color: "var(--accent)" }}
        >
          View Roles <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

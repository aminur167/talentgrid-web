"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Magnifier,
  LocationArrow,
  Person,
  Briefcase,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
const CACHE_KEY = "hl_browse_companies";
const CACHE_TTL = 60_000;
const ITEMS_PER_PAGE = 6;

const INDUSTRIES = ["All", "Technology", "Fintech", "Healthcare", "E-commerce", "Design"];
const SIZES = ["All", "1-10 employees", "11-50 employees", "51-200 employees", "500+ employees"];

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function writeCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
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
    if (cached) { setAllCompanies(cached); setLoading(false); return; }
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
        (c.employCount || c.size)?.toLowerCase().includes(selectedSize.toLowerCase())
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
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* ─── Hero Section ─── */}
      <section className="border-b border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            Browse Companies
          </h1>
          <p className="text-neutral-400 text-base max-w-2xl leading-relaxed">
            Discover the world's leading technology and creative organizations. Filter by industry, size, and values to find your next professional home.
          </p>
        </div>
      </section>

      {/* ─── Search + Filters Bar ─── */}
      <section className="bg-[#09090b] border-b border-white/[0.07] py-4 sticky top-[80px] z-30 backdrop-blur-md bg-[#09090b]/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 flex items-center gap-3 bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5">
            <Magnifier className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, industry, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-neutral-500 hover:text-white text-xs shrink-0">✕</button>
            )}
          </div>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none cursor-pointer"
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i === "All" ? "All Industries" : i}</option>
            ))}
          </select>

          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none cursor-pointer"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Sizes" : s}</option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            className="bg-[#6254f5] hover:bg-[#7164ff] active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shrink-0"
          >
            Refresh
          </button>
        </div>
      </section>

      {/* ─── Companies Grid + Pagination ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#141416] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5" />
                  <div className="w-16 h-4 rounded-full bg-white/5" />
                </div>
                <div className="w-2/3 h-4 bg-white/5 rounded mb-2" />
                <div className="w-full h-3 bg-white/5 rounded mb-1" />
                <div className="w-4/5 h-3 bg-white/5 rounded mb-5" />
                <div className="flex gap-2 mb-5">
                  <div className="w-16 h-5 rounded-full bg-white/5" />
                  <div className="w-20 h-5 rounded-full bg-white/5" />
                </div>
                <div className="border-t border-white/[0.07] pt-4 flex justify-between">
                  <div className="w-24 h-3 bg-white/5 rounded" />
                  <div className="w-20 h-3 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-1">No Companies Found</h3>
              <p className="text-neutral-500 text-sm max-w-sm">
                {search || selectedIndustry !== "All" || selectedSize !== "All"
                  ? "Try adjusting your search or filters."
                  : "No companies registered yet."}
              </p>
            </div>
            {(search || selectedIndustry !== "All" || selectedSize !== "All") && (
              <button
                onClick={() => { setSearch(""); setSelectedIndustry("All"); setSelectedSize("All"); }}
                className="text-sm text-[#a198ff] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-sm">
                Showing <span className="text-white font-semibold">{paginatedCompanies.length}</span> of{" "}
                <span className="text-white font-semibold">{filteredCompanies.length}</span> companies
              </p>
              {totalPages > 1 && (
                <p className="text-neutral-500 text-xs">
                  Page <span className="text-neutral-300 font-semibold">{currentPage}</span> of {totalPages}
                </p>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedCompanies.map((company) => (
                <CompanyCard key={company._id || company.name} company={company} />
              ))}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 280, behavior: "smooth" });
                  }}
                  className="w-9 h-9 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 280, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-black border border-white shadow-lg shadow-white/10 scale-105"
                          : "bg-[#141416] border border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 280, behavior: "smooth" });
                  }}
                  className="w-9 h-9 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-neutral-400 transition-all cursor-pointer"
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
    ? company.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

  const hasLogo = company.logo && company.logo.startsWith("http") && !imgError;

  return (
    <div className="group flex flex-col bg-[#141416] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 transition-all duration-150 cursor-pointer hover:-translate-y-px">

      {/* Row 1: Logo + Verified Badge */}
      <div className="flex items-start justify-between mb-4">
        {hasLogo ? (
          <img
            src={company.logo}
            alt={company.name}
            onError={() => setImgError(true)}
            className="w-11 h-11 rounded-xl object-cover bg-[#1e1e22] border border-white/[0.08] shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-[#1e1e22] border border-white/[0.08] flex items-center justify-center text-[13px] font-bold text-neutral-300 shrink-0">
            {initials}
          </div>
        )}

        {company.isApproved !== false ? (
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> VERIFIED
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> PENDING
          </span>
        )}
      </div>

      {/* Row 2: Company Name */}
      <h3 className="text-[15px] font-bold text-white mb-1.5 line-clamp-1 group-hover:text-[#c4bfff] transition-colors leading-snug">
        {company.name}
      </h3>

      {/* Row 3: Description */}
      <p className="text-[12.5px] text-neutral-500 leading-relaxed line-clamp-2 mb-4">
        {company.description ||
          `A ${company.industry || "technology"} company${
            company.location ? ` based in ${company.location}` : ""
          }.`}
      </p>

      {/* Row 4: Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {company.industry && (
          <span className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-white/[0.04] border border-white/[0.07] rounded-full px-2.5 py-[3px]">
            <Briefcase className="w-[11px] h-[11px] text-neutral-600" />
            {company.industry}
          </span>
        )}
        {company.location && (
          <span className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-white/[0.04] border border-white/[0.07] rounded-full px-2.5 py-[3px]">
            <LocationArrow className="w-[11px] h-[11px] text-neutral-600" />
            {company.location}
          </span>
        )}
        {(company.employCount || company.size) && (
          <span className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-white/[0.04] border border-white/[0.07] rounded-full px-2.5 py-[3px]">
            <Person className="w-[11px] h-[11px] text-neutral-600" />
            {company.employCount || company.size}
          </span>
        )}
      </div>

      {/* Row 5: Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 mt-auto">
        <span className="text-[12px] text-neutral-500">
          <span className="text-neutral-200 font-semibold">
            {company.activeJobsCount || 0}
          </span>{" "}
          Active Jobs
        </span>

        {(company.websiteUrl || company.website) ? (
          <a
            href={
              (company.websiteUrl || company.website).startsWith("http")
                ? company.websiteUrl || company.website
                : `https://${company.websiteUrl || company.website}`
            }
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] text-neutral-400 hover:text-white transition-colors font-medium group/link"
          >
            View Openings
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <span className="flex items-center gap-1 text-[12px] text-neutral-600">
            View Openings
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}

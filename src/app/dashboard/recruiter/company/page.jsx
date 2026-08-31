"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Globe, 
  LocationArrow, 
  Person, 
  ArrowUpFromLine, 
  Pencil, 
  ShieldCheck, 
  Clock, 
  Xmark,
  Plus,
  TrashBin
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";
import { getMyCompanies, createCompany, updateCompany, deleteCompany } from "@/lib/actions/companies";

export default function CompanyPage() {
  const { data: session } = useSession();
  const recruiterEmail = session?.user?.email;

  const [companies, setCompanies] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("hireloop_companies_cache");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => companies.length === 0);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    logo: "",
    industry: "Technology",
    location: "",
    size: "11-50 employees",
    description: "",
  });

  const loadCompanies = async (showLoading = true) => {
    if (!recruiterEmail) { setLoading(false); return; }
    if (companies.length > 0) { setLoading(false); }

    try {
      const data = await getMyCompanies(recruiterEmail);
      const list = Array.isArray(data) ? data : data?.companies || [];
      setCompanies(list);
      try {
        sessionStorage.setItem("hireloop_companies_cache", JSON.stringify(list));
      } catch (e) {}
    } catch (err) {
      console.error("Error loading companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recruiterEmail) {
      loadCompanies();
    }
  }, [recruiterEmail]);

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      website: "",
      logo: "",
      industry: "Technology",
      location: "",
      size: "11-50 employees",
      description: "",
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      website: company.website || "",
      logo: company.logo || "",
      industry: company.industry || "Technology",
      location: company.location || "",
      size: company.size || "11-50 employees",
      description: company.description || "",
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const form = new FormData();
      form.append("image", file);
      const apiKey = process.env.NEXT_PUBLIC_IMAGE_API;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, logo: data.data.url }));
      } else {
        setErrorMsg("Image upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (editingCompany) {
        const res = await updateCompany(editingCompany._id, formData);
        if (res.success) {
          setSuccessMsg("Company profile updated successfully!");
          setIsOpen(false);
          loadCompanies(false);
        } else {
          setErrorMsg(res.message || "Failed to update company.");
        }
      } else {
        const payload = {
          ...formData,
          recruiterEmail,
          status: "pending",
          isApproved: false,
        };
        const res = await createCompany(payload);
        if (res.success) {
          setSuccessMsg("Company registered successfully! Submitted for admin approval.");
          setIsOpen(false);
          loadCompanies(false);
        } else {
          setErrorMsg(res.message || "Failed to create company.");
        }
      }
    } catch (err) {
      console.error("Form submit error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company profile?")) return;
    setDeletingId(companyId);
    try {
      const res = await deleteCompany(companyId);
      if (res.success) {
        setSuccessMsg("Company deleted.");
        loadCompanies(false);
      } else {
        setErrorMsg(res.message || "Could not delete company.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("Failed to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status, isApproved) => {
    if (status === "approved" || isApproved) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified Brand
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
          <Xmark className="w-3.5 h-3.5" /> Needs Attention
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" /> Pending Review
      </span>
    );
  };

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#ff7a00] transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Company Brand &amp; Profiles
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage all your registered business profiles and employer brand identity.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all"
          style={{ backgroundColor: "#ff7a00" }}
        >
          <Plus className="w-4 h-4" /> Register New Company
        </button>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="border p-16 rounded-2xl flex flex-col items-center justify-center text-center gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#ff7a00" }} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading company profiles...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="border p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No Company Profiles Yet</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Add your hiring organization to establish credibility and begin posting verified positions.
            </p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="mt-2 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
            style={{ backgroundColor: "#ff7a00" }}
          >
            Register Company Profile
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {companies.map((comp) => (
            <div key={comp._id || comp.name} className="border p-6 rounded-2xl flex flex-col gap-5 transition-all" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5" style={{ borderColor: "var(--border-color)" }}>
                <div className="flex items-center gap-4">
                  {comp.logo && comp.logo.trim() ? (
                    <img
                      src={comp.logo}
                      alt={comp.name || "Company Logo"}
                      className="w-14 h-14 rounded-2xl object-cover border"
                      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl border flex items-center justify-center text-base font-bold" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#ff7a00" }}>
                      {comp.name ? comp.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "CO"}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{comp.name}</h2>
                    {comp.website && (
                      <a href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`} target="_blank" rel="noreferrer" className="text-xs text-[#6254f5] hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {comp.website}
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(comp.status, comp.isApproved)}
                  <button 
                    onClick={() => handleOpenEditModal(comp)}
                    className="border text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCompany(comp._id)}
                    disabled={deletingId === comp._id}
                    className="border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <TrashBin className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="border rounded-xl p-3" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                  <span className="block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Industry</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{comp.industry || "Technology"}</span>
                </div>
                <div className="border rounded-xl p-3" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                  <span className="block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Company Size</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{comp.size || "11-50 employees"}</span>
                </div>
                <div className="border rounded-xl p-3" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                  <span className="block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Location</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{comp.location || "Global"}</span>
                </div>
                <div className="border rounded-xl p-3" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                  <span className="block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Recruiter Lead</span>
                  <span className="font-semibold truncate block" style={{ color: "var(--text-primary)" }}>{recruiterEmail}</span>
                </div>
              </div>

              {comp.description && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {comp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="border rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <h3 className="text-base font-bold">
                {editingCompany ? "Edit Company Profile" : "Register New Company"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <Xmark className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Innovations Inc."
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Headquarters Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className={inputCls}
                  >
                    {["Technology", "Finance", "Healthcare", "E-Commerce", "Artificial Intelligence", "SaaS", "Media", "Other"].map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Company Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className={inputCls}
                  >
                    {["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "501-1000 employees", "1000+ employees"].map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Company Logo (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://..."
                    className={inputCls}
                  />
                  <label className="px-4 py-2.5 rounded-xl border text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                    <ArrowUpFromLine className="w-3.5 h-3.5" />
                    {uploading ? "..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>About the Company</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Share mission, culture, and what you look for in candidates..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="border-t pt-4 flex justify-end gap-2" style={{ borderColor: "var(--border-color)" }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: "#ff7a00" }}
                >
                  {submitting ? "Saving..." : editingCompany ? "Save Changes" : "Submit Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

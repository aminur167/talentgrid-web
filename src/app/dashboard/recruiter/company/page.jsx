"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Spinner } from "@heroui/react";
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

  // ── Load companies (cache-first → instant, then background sync) ──
  const loadCompanies = async (showLoading = true) => {
    if (!recruiterEmail) { setLoading(false); return; }

    // Instant cache hit
    if (companies.length > 0) { setLoading(false); }

    try {
      if (showLoading && companies.length === 0) setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const res = await fetch(
        `${baseUrl}/api/companies?recruiterEmail=${encodeURIComponent(recruiterEmail)}`
      );
      const data = await res.json();
      const list = data?.companies || [];
      setCompanies(list);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hireloop_companies_cache", JSON.stringify(list));
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies(companies.length === 0);
  }, [recruiterEmail]);

  // Open modal for new company
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
    setIsOpen(true);
  };

  // Open modal for editing existing company
  const handleOpenEditModal = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name || "",
      website: comp.website || "",
      logo: comp.logo || "",
      industry: comp.industry || "Technology",
      location: comp.location || "",
      size: comp.size || "11-50 employees",
      description: comp.description || "",
    });
    setErrorMsg("");
    setIsOpen(true);
  };

  // Handle Logo Upload via ImgBB
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview for 0ms visual feedback
    const localPreview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, logo: localPreview }));
    setUploading(true);
    setErrorMsg("");

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const apiKey = process.env.NEXT_PUBLIC_IMAGE_API || "0f8d43d741ecdaaad95444214e9a6b49";
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();
      if (data?.success && (data.data?.url || data.data?.display_url)) {
        const hostedUrl = data.data.display_url || data.data.url;
        setFormData((prev) => ({ ...prev, logo: hostedUrl }));
      }
    } catch (error) {
      console.error("ImgBB upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Delete company from MongoDB Atlas
  const handleDeleteCompany = async (id) => {
    if (!confirm("Are you sure you want to delete this company profile?")) return;
    setDeletingId(id);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await deleteCompany(id);
      const updated = companies.filter((c) => c._id !== id);
      setCompanies(updated);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hireloop_companies_cache", JSON.stringify(updated));
      }
      setSuccessMsg("Company deleted successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  // Submit Handler to Save/Create Company to MongoDB Atlas
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg("Company Name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const userEmail = recruiterEmail || session?.user?.email || "recruiter@hireloop.com";
    const recruiterIdVal = session?.user?.id || userEmail;

    const payload = {
      name: formData.name,
      websiteUrl: formData.website,
      website: formData.website,
      industry: formData.industry,
      location: formData.location,
      employCount: formData.size,
      size: formData.size,
      description: formData.description,
      logo: formData.logo, // ImgBB URL
      recruiterId: recruiterIdVal,
      recruiterEmail: userEmail,
      recruiterName: session?.user?.name || "Recruiter",
    };

    try {
      if (editingCompany?._id) {
        // Update existing company
        const res = await updateCompany(editingCompany._id, payload);
        const updatedComp = res?.company || { ...editingCompany, ...payload };
        const newArr = companies.map((c) => (c._id === editingCompany._id ? updatedComp : c));
        setCompanies(newArr);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hireloop_companies_cache", JSON.stringify(newArr));
        }
        setSuccessMsg("Company profile updated successfully!");
      } else {
        // Create new company profile
        const result = await createCompany(payload);
        const newComp = result?.company || { ...payload, _id: result?.companyId };
        const newArr = [newComp, ...companies];
        setCompanies(newArr);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hireloop_companies_cache", JSON.stringify(newArr));
        }
        setSuccessMsg("New company profile created successfully!");
      }

      setIsOpen(false);
    } catch (err) {
      console.error("Save company profile error:", err);
      setErrorMsg(err.message || "Failed to save company profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, isApproved) => {
    if (isApproved === true || status === "Approved") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" /> Pending Review
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-[#09090b] min-h-screen text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Company Profiles</h1>
            <p className="text-sm text-neutral-400">Manage all your registered business profiles and hiring brands.</p>
          </div>
          <Button 
            onClick={handleOpenAddModal}
            className="bg-[#6254f5] text-white hover:bg-[#7164ff] font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#6254f5]/20"
          >
            <Plus className="w-4 h-4" /> Register New Company
          </Button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <Card className="bg-[#141416] border border-white/10 p-16 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
            <Spinner size="md" color="secondary" />
            <p className="text-sm text-neutral-400">Loading company profiles...</p>
          </Card>
        ) : companies.length === 0 ? (
          /* Empty State: No Companies Registered */
          <Card className="bg-[#141416] border border-white/10 p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 border border-white/10">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h2 className="text-lg font-semibold text-white">No Companies Registered Yet</h2>
              <p className="text-sm text-neutral-400">
                You haven't added any company profiles yet. Click below to register your first business profile.
              </p>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="mt-2 bg-[#6254f5] text-white hover:bg-[#7164ff] font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-[#6254f5]/20"
            >
              Register Company Profile
            </Button>
          </Card>
        ) : (
          /* Registered Companies List */
          <div className="flex flex-col gap-6">
            {companies.map((comp) => (
              <Card key={comp._id || comp.name} className="bg-[#141416] border border-white/10 p-6 md:p-8 rounded-2xl flex flex-col gap-6 transition-all hover:border-white/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    {comp.logo && comp.logo.trim() ? (
                      <img
                        src={comp.logo}
                        alt={comp.name || "Company Logo"}
                        className="w-16 h-16 rounded-2xl object-cover bg-[#222226] border border-white/10"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#222226] border border-white/10 flex items-center justify-center text-lg font-bold text-neutral-300">
                        {comp.name ? comp.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "CO"}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold text-white">{comp.name}</h2>
                      {comp.website && (
                        <a href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`} target="_blank" rel="noreferrer" className="text-sm text-[#a198ff] hover:underline flex items-center gap-1.5 transition-colors">
                          <Globe className="w-3.5 h-3.5" /> {comp.website}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(comp.status, comp.isApproved)}
                    <Button 
                      onClick={() => handleOpenEditModal(comp)}
                      className="bg-[#222226] text-white hover:bg-[#2a2a2f] border border-[#27272a] font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button 
                      onClick={() => handleDeleteCompany(comp._id)}
                      isLoading={deletingId === comp._id}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <TrashBin className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
                  <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Industry</span>
                    <span className="text-sm font-semibold text-neutral-200">{comp.industry || "Technology"}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Location</span>
                    <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
                      <LocationArrow className="w-3.5 h-3.5 text-neutral-400" /> {comp.location || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Company Size</span>
                    <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
                      <Person className="w-3.5 h-3.5 text-neutral-400" /> {comp.size || "11-50 employees"}
                    </span>
                  </div>
                </div>

                {comp.description && (
                  <div className="flex flex-col gap-1.5 border-t border-white/10 pt-4">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">About Company</span>
                    <p className="text-sm text-neutral-300 leading-relaxed">{comp.description}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Register / Edit Modal Matching Screenshot Design */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-xl w-full text-white flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/10">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {editingCompany ? "Edit Company Profile" : "Register New Company"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Enter your business details to start hiring on HireLoop.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
                >
                  <Xmark className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form id="company-form" onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                {/* Row 1: Company Name & Industry / Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-200">Company Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Acme Corp" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-[#242427] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-200">Industry / Category</label>
                    <select 
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-[#242427] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Website URL & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-200">Website URL</label>
                    <div className="flex items-center bg-[#242427] border border-white/5 rounded-xl overflow-hidden focus-within:border-neutral-400 transition-colors">
                      <span className="px-3 text-xs text-neutral-400 bg-white/5 border-r border-white/5 py-3">https://</span>
                      <input 
                        type="text"
                        placeholder="www.company.com" 
                        value={formData.website?.replace(/^https?:\/\//, '') || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value ? `https://${e.target.value.replace(/^https?:\/\//, '')}` : '' })}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-200">Location</label>
                    <div className="flex items-center bg-[#242427] border border-white/5 rounded-xl px-3 py-3 gap-2 focus-within:border-neutral-400 transition-colors">
                      <LocationArrow className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input 
                        type="text"
                        placeholder="City, Country" 
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Employee Count Range & Company Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-200">Employee Count Range</label>
                    <select 
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-[#242427] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-200">Company Logo</label>
                    <div className="flex items-center gap-3">
                      <label className="border border-dashed border-white/20 bg-[#242427] hover:border-neutral-400 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors w-full">
                        {formData.logo ? (
                          <img 
                            src={formData.logo} 
                            alt="Logo" 
                            className="w-8 h-8 rounded-lg object-cover bg-[#18181b] border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#18181b] flex items-center justify-center text-neutral-300 shrink-0">
                            <ArrowUpFromLine className="w-4 h-4" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate">
                            {uploading ? "Uploading logo..." : formData.logo ? "Logo Uploaded ✓" : "Upload image"}
                          </p>
                          <p className="text-[10px] text-neutral-400">PNG, JPG up to 5MB</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 4: Brief Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-200">Brief Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your company's mission and culture..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#242427] border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 resize-none transition-colors"
                  />
                </div>
              </form>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#141416]">
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="bg-[#242427] text-white hover:bg-neutral-700 font-medium rounded-xl text-sm px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="company-form"
                  isLoading={submitting}
                  className="bg-white text-black hover:bg-neutral-200 font-bold rounded-xl text-sm px-6 py-2.5 shadow-lg"
                >
                  {editingCompany ? "Save Changes" : "Register Company"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

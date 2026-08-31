"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Person, Envelope, Smartphone, MapPin,
  Link as LinkIcon, Factory, CircleCheck, Pencil,
  Globe
} from "@gravity-ui/icons";
import ProfileImageUpload from "@/components/shared/ProfileImageUpload";

export default function RecruiterSettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    website: "",
    linkedin: "",
    twitter: "",
    avatar: "",
    companyName: "",
    companySize: "",
    companyIndustry: "",
    hiringFor: "",
  });

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || "",
      }));
      const saved = localStorage.getItem(`tg_recruiter_profile_${session.user.id}`);
      if (saved) {
        try { setForm(JSON.parse(saved)); } catch {}
      }
    }
  }, [session]);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem(`tg_recruiter_profile_${session?.user?.id}`, JSON.stringify(form));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: Person },
    { id: "company", label: "Company Info", icon: Factory },
    { id: "social", label: "Social Links", icon: LinkIcon },
  ];

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#ff7a00] transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Profile</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Build a compelling recruiter profile to attract the best candidates.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl">
            <CircleCheck className="w-4 h-4" /> Saved successfully!
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <ProfileImageUpload
          currentImage={form.avatar}
          name={form.name}
          accentColor="#ff7a00"
          onUpload={(url) => set("avatar", url)}
        />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div>
            <p className={labelCls}>Display Name</p>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <p className={labelCls}>Job Title / Role</p>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Talent Acquisition Lead" />
          </div>
          <div className="flex items-center gap-2">
            <span className={labelCls + " mb-0"}>Role:</span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#ff7a00]/15 text-[#ff9838] border border-[#ff7a00]/25">
              Recruiter
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === t.id
                ? "bg-[#ff7a00] text-white shadow-lg shadow-[#ff7a00]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Person className="w-4 h-4 text-[#ff7a00]" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input className={`${inputCls} pl-10 opacity-60 cursor-not-allowed`} value={form.email} disabled />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input className={`${inputCls} pl-10`} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input className={`${inputCls} pl-10`} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>About You</label>
                <textarea className={`${inputCls} min-h-[100px] resize-none leading-relaxed`} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Share your recruiting philosophy and areas of expertise..." />
              </div>
            </div>
          </div>
        )}

        {/* COMPANY TAB */}
        {activeTab === "company" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Factory className="w-4 h-4 text-[#ff7a00]" /> Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Company Name</label>
                <input className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input className={inputCls} value={form.companyIndustry} onChange={(e) => set("companyIndustry", e.target.value)} placeholder="e.g. Technology, Finance, Healthcare" />
              </div>
              <div>
                <label className={labelCls}>Company Size</label>
                <select className={inputCls} value={form.companySize} onChange={(e) => set("companySize", e.target.value)}>
                  <option value="">Select size...</option>
                  {["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,001–5,000", "5,001–10,000", "10,001+"].map((s) => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Currently Hiring For</label>
                <input className={inputCls} value={form.hiringFor} onChange={(e) => set("hiringFor", e.target.value)} placeholder="e.g. Frontend Engineers, Product Managers" />
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === "social" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#ff7a00]" /> Online Presence
            </h3>
            {[
              { label: "Company Website", key: "website", placeholder: "https://company.com", emoji: "🌐" },
              { label: "LinkedIn Profile", key: "linkedin", placeholder: "https://linkedin.com/in/username", emoji: "💼" },
              { label: "Twitter / X", key: "twitter", placeholder: "https://twitter.com/username", emoji: "🐦" },
            ].map(({ label, key, placeholder, emoji }) => (
              <div key={key}>
                <label className={labelCls}>{emoji} {label}</label>
                <input className={inputCls} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#ff7a00] hover:bg-[#ff9030] text-white font-bold px-8 py-3 rounded-xl text-sm shadow-lg shadow-[#ff7a00]/25 cursor-pointer transition-all disabled:opacity-60"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Pencil className="w-4 h-4" /> Save Profile</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

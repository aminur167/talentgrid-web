"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Person, Envelope, Smartphone, ShieldCheck,
  CircleCheck, Pencil, Globe, Lock, TrashBin
} from "@gravity-ui/icons";
import ProfileImageUpload from "@/components/shared/ProfileImageUpload";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    adminTitle: "",
    bio: "",
    avatar: "",
    twoFactor: false,
    sessionTimeout: "24h",
    emailNotifications: true,
    activityLog: true,
  });

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || "",
      }));
      const saved = localStorage.getItem(`tg_admin_profile_${session.user.id}`);
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
    localStorage.setItem(`tg_admin_profile_${session?.user?.id}`, JSON.stringify(form));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: Person },
    { id: "security", label: "Security", icon: Lock },
    { id: "platform", label: "Platform", icon: Globe },
  ];

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500 transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Admin Profile</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your super-admin identity, security, and platform settings.
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
          accentColor="#f59e0b"
          onUpload={(url) => set("avatar", url)}
        />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div>
            <p className={labelCls}>Display Name</p>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Administrator name" />
          </div>
          <div>
            <p className={labelCls}>Admin Title</p>
            <input className={inputCls} value={form.adminTitle} onChange={(e) => set("adminTitle", e.target.value)} placeholder="e.g. Platform Administrator, CTO" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> Super Admin
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Full Access
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
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
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
              <Person className="w-4 h-4 text-amber-400" /> Personal Details
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
                <label className={labelCls}>Internal Notes / Bio</label>
                <textarea className={`${inputCls} min-h-[90px] resize-none`} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Notes about your admin role and responsibilities..." />
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="flex flex-col gap-5">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Security Settings
              </h3>

              <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Two-Factor Authentication</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Add an extra layer of security to your admin account</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("twoFactor", !form.twoFactor)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.twoFactor ? "bg-amber-500" : "bg-neutral-600"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.twoFactor ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>

              <div>
                <label className={labelCls}>Session Timeout</label>
                <select className={inputCls} value={form.sessionTimeout} onChange={(e) => set("sessionTimeout", e.target.value)}>
                  {["1h", "4h", "8h", "24h", "7d"].map((v) => (
                    <option key={v} value={v}>{v === "7d" ? "7 days" : v}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Activity Log</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Track all admin actions and platform events</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("activityLog", !form.activityLog)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.activityLog ? "bg-amber-500" : "bg-neutral-600"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activityLog ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM TAB */}
        {activeTab === "platform" && (
          <div className="flex flex-col gap-5">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> Platform Notifications
              </h3>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Email Notifications</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Receive alerts for new sign-ups, company approvals, flagged content</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("emailNotifications", !form.emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.emailNotifications ? "bg-amber-500" : "bg-neutral-600"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.emailNotifications ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-red-400 flex items-center gap-2">
                <TrashBin className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                These actions are irreversible. Proceed with extreme caution.
              </p>
              <button
                type="button"
                className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <TrashBin className="w-3.5 h-3.5" /> Reset Platform Cache
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-xl text-sm shadow-lg shadow-amber-500/25 cursor-pointer transition-all disabled:opacity-60"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Pencil className="w-4 h-4" /> Save Profile</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Person, Envelope, Smartphone, MapPin,
  Link as LinkIcon, Briefcase, CircleCheck,
  Pencil, Star, GraduationCap, FileText
} from "@gravity-ui/icons";
import ProfileImageUpload from "@/components/shared/ProfileImageUpload";

const SKILLS_SUGGESTIONS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js",
  "Python", "Tailwind CSS", "MongoDB", "PostgreSQL", "Docker",
  "AWS", "Git", "GraphQL", "REST APIs", "Figma", "UI/UX",
];

export default function SeekerSettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
    website: "",
    linkedin: "",
    github: "",
    avatar: "",
    skills: [],
    education: "",
    experience: "",
    resumeUrl: "",
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    const email = session.user.email;
    const id = session.user.id;

    // Try loading from MongoDB first, fallback to localStorage
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app"}/api/seeker/profile?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        if (data?.success && data?.profile) {
          const p = data.profile;
          setForm(prev => ({
            ...prev,
            name: p.name || session.user.name || "",
            email: p.email || email,
            avatar: p.avatar || p.image || session.user.image || "",
            phone: p.phone || "",
            location: p.location || "",
            headline: p.headline || "",
            bio: p.bio || "",
            website: p.website || "",
            linkedin: p.linkedin || "",
            github: p.github || "",
            skills: p.skills || [],
            education: p.education || "",
            experience: p.experience || "",
            resumeUrl: p.resumeUrl || "",
          }));
          // Update localStorage cache
          localStorage.setItem(`tg_profile_${id}`, JSON.stringify(data.profile));
        } else {
          // Fallback to localStorage
          const cached = localStorage.getItem(`tg_profile_${id}`);
          if (cached) {
            try { setForm(JSON.parse(cached)); } catch {}
          } else {
            setForm(prev => ({ ...prev, name: session.user.name || "", email, avatar: session.user.image || "" }));
          }
        }
      })
      .catch(() => {
        // Network error — use localStorage
        const cached = localStorage.getItem(`tg_profile_${id}`);
        if (cached) try { setForm(JSON.parse(cached)); } catch {}
      });
  }, [session?.user?.email]);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 20) {
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, email: session?.user?.email };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app"}/api/seeker/profile`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      // Also cache in localStorage as backup
      localStorage.setItem(`tg_profile_${session?.user?.id}`, JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
      // Fallback: save to localStorage only
      localStorage.setItem(`tg_profile_${session?.user?.id}`, JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: Person },
    { id: "career", label: "Career", icon: Briefcase },
    { id: "social", label: "Social Links", icon: LinkIcon },
  ];

  const inputCls = "w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6254f5] transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Profile</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Complete your profile to stand out to top recruiters.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl">
            <CircleCheck className="w-4 h-4" />
            Saved successfully!
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <ProfileImageUpload
          currentImage={form.avatar}
          name={form.name}
          accentColor="#6254f5"
          onUpload={(url) => set("avatar", url)}
        />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Display Name</p>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Professional Headline</p>
            <input
              className={inputCls}
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="e.g. Full-Stack Developer · React · Node.js"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Role:</span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#6254f5]/15 text-[#a198ff] border border-[#6254f5]/25">
              Job Seeker
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
                ? "bg-[#6254f5] text-white shadow-lg shadow-[#6254f5]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* ─── PROFILE TAB ─── */}
        {activeTab === "profile" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Person className="w-4 h-4 text-[#6254f5]" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    className={`${inputCls} pl-10 opacity-60 cursor-not-allowed`}
                    value={form.email}
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    className={`${inputCls} pl-10`}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    className={`${inputCls} pl-10`}
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Professional Bio</label>
                <textarea
                  className={`${inputCls} min-h-[100px] resize-none leading-relaxed`}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Write a brief summary about yourself, your experience, and what you're looking for..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── CAREER TAB ─── */}
        {activeTab === "career" && (
          <div className="flex flex-col gap-5">
            {/* Skills */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Star className="w-4 h-4 text-[#6254f5]" /> Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 bg-[#6254f5]/10 border border-[#6254f5]/25 text-[#a198ff] text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-[#6254f5] hover:text-red-400 font-bold leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {form.skills.length === 0 && (
                  <span className="text-xs text-[var(--text-muted)]">No skills added yet.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                  placeholder="Type a skill and press Enter..."
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="px-4 py-2.5 rounded-xl bg-[#6254f5] text-white text-xs font-bold hover:bg-[#7164ff] transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILLS_SUGGESTIONS.filter((s) => !form.skills.includes(s)).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[#a198ff] hover:border-[#6254f5]/30 cursor-pointer transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Education & Experience */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#6254f5]" /> Education & Experience
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Education</label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-none`}
                    value={form.education}
                    onChange={(e) => set("education", e.target.value)}
                    placeholder="e.g. BSc in Computer Science, MIT 2023"
                  />
                </div>
                <div>
                  <label className={labelCls}>Work Experience</label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-none`}
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    placeholder="e.g. 2 years as a Frontend Developer at XYZ Corp"
                  />
                </div>
                <div>
                  <label className={labelCls}>Resume / CV URL</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      className={`${inputCls} pl-10`}
                      value={form.resumeUrl}
                      onChange={(e) => set("resumeUrl", e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SOCIAL TAB ─── */}
        {activeTab === "social" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#6254f5]" /> Social & Portfolio Links
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Portfolio Website", key: "website", placeholder: "https://yourportfolio.com", emoji: "🌐" },
                { label: "LinkedIn Profile", key: "linkedin", placeholder: "https://linkedin.com/in/username", emoji: "💼" },
                { label: "GitHub Profile", key: "github", placeholder: "https://github.com/username", emoji: "🐙" },
              ].map(({ label, key, placeholder, emoji }) => (
                <div key={key}>
                  <label className={labelCls}>{emoji} {label}</label>
                  <input
                    className={inputCls}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-8 py-3 rounded-xl text-sm shadow-lg shadow-[#6254f5]/25 cursor-pointer transition-all disabled:opacity-60"
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

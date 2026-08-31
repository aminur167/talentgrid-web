"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Person, Envelope, Lock, ShieldCheck, CircleCheck } from "@gravity-ui/icons";

export default function SeekerSettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email] = useState(session?.user?.email || "");

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Account Settings</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage your job seeker profile preferences and credentials.</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <CircleCheck className="w-4 h-4" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Full Name</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
            <Person className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Email Address</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 opacity-70">
            <Envelope className="w-4 h-4 text-neutral-500" />
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-transparent text-sm text-neutral-400 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Role &amp; Plan</label>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-semibold">Job Seeker</span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
              Active
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-[#6254f5]/25 cursor-pointer transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

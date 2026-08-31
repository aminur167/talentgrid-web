"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Person, Envelope, ShieldCheck, CircleCheck } from "@gravity-ui/icons";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(session?.user?.name || "Admin");
  const [email] = useState(session?.user?.email || "admin@talentgrid.app");

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
        <p className="text-sm text-neutral-400 mt-1">Configure administrative control parameters and security.</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <CircleCheck className="w-4 h-4" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Admin Name</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
            <Person className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Admin Email</label>
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
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Permission Level</label>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Super Administrator
            </span>
            <span className="text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
              Root Access
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-[#6254f5]/25 cursor-pointer transition-all"
          >
            Save Admin Settings
          </button>
        </div>
      </form>
    </div>
  );
}

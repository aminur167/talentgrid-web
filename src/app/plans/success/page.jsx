"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`${BASE_URL}/api/verify-checkout-session?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.isPaid) {
          setEmail(data.userEmail || "");
          setPlanId(data.planId || "growth");
          if (typeof window !== "undefined") {
            localStorage.setItem("hl_user_plan", data.planId || "growth");
          }
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="w-10 h-10 border-2 border-[#6254f5] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#141416] border border-emerald-500/30 rounded-3xl p-10 flex flex-col items-center gap-6 text-center shadow-2xl">
          <div className="text-5xl">🎉</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-white">Payment Successful!</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Your <span className="text-white font-semibold capitalize">{planId}</span> Plan is now active.
              {email && <><br /><span className="text-neutral-400 text-xs">Confirmation sent to {email}</span></>}
            </p>
          </div>
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
            ✓ Unlimited job applications unlocked
          </p>
          <Link href="/jobs">
            <button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-7 py-3 rounded-xl text-xs shadow-lg shadow-[#6254f5]/30 cursor-pointer transition-all">
              Start Applying → Browse All Jobs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#141416] border border-red-500/30 rounded-3xl p-10 flex flex-col items-center gap-6 text-center">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-extrabold text-white">Could not verify payment</h2>
        <p className="text-sm text-neutral-300">
          If you were charged, please contact us and we will resolve it immediately.
        </p>
        <Link href="/plans">
          <button className="bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-2.5 rounded-xl text-xs border border-white/10 cursor-pointer">
            Back to Plans
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function PlansSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#6254f5] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
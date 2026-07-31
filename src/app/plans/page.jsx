"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  CrownDiamond,
  Briefcase,
  ArrowLeft,
  CircleCheck,
  Xmark,
  TriangleExclamation,
} from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { useSession } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

/* ─────────────────────────────────────────────
   Plan Definitions
───────────────────────────────────────────── */
const PLANS = {
  monthly: [
    {
      id: "starter",
      name: "Starter",
      price: "$0",
      numericPrice: 0,
      period: "/month",
      description: "Get started, zero cost:",
      icon: <CrownDiamond className="w-5 h-5 text-pink-400" />,
      features: [
        "3 free job applications",
        "Daily AI job match brief",
        "Verified salary bands",
        "Company insight dashboards",
        "1-click apply (limited)",
      ],
      buttonText: "Continue for Free",
      buttonVariant: "default",
      isRecommended: false,
    },
    {
      id: "growth",
      name: "Growth",
      price: "$17",
      numericPrice: 17,
      period: "/month",
      description: "For serious job seekers:",
      icon: <ShieldCheck className="w-5 h-5 text-[#a198ff]" />,
      features: [
        "Unlimited job applications",
        "Daily AI job match brief",
        "Verified salary bands",
        "Company insight dashboards",
        "1-click apply (unlimited)",
        "Verified candidate badge",
        "Priority application processing",
      ],
      buttonText: "Upgrade to Growth",
      buttonVariant: "white",
      isRecommended: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$99",
      numericPrice: 99,
      period: "/month",
      description: "Enterprise-grade career tools:",
      icon: <Briefcase className="w-5 h-5 text-purple-400" />,
      features: [
        "Everything in Growth",
        "Multi-profile career portfolios",
        "Recruiter view (read-only)",
        "Direct recruiter messaging",
        "1-on-1 resume & portfolio review",
        "Priority application slot",
      ],
      buttonText: "Go Premium",
      buttonVariant: "default",
      isRecommended: false,
    },
  ],
  yearly: [
    {
      id: "starter",
      name: "Starter",
      price: "$0",
      numericPrice: 0,
      period: "/month",
      description: "Get started, zero cost:",
      icon: <CrownDiamond className="w-5 h-5 text-pink-400" />,
      features: [
        "3 free job applications",
        "Daily AI job match brief",
        "Verified salary bands",
        "Company insight dashboards",
        "1-click apply (limited)",
      ],
      buttonText: "Continue for Free",
      buttonVariant: "default",
      isRecommended: false,
    },
    {
      id: "growth",
      name: "Growth",
      price: "$12",
      numericPrice: 12,
      period: "/month",
      description: "For serious job seekers:",
      icon: <ShieldCheck className="w-5 h-5 text-[#a198ff]" />,
      features: [
        "Unlimited job applications",
        "Daily AI job match brief",
        "Verified salary bands",
        "Company insight dashboards",
        "1-click apply (unlimited)",
        "Verified candidate badge",
        "Priority application processing",
      ],
      buttonText: "Upgrade to Growth",
      buttonVariant: "white",
      isRecommended: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$74",
      numericPrice: 74,
      period: "/month",
      description: "Enterprise-grade career tools:",
      icon: <Briefcase className="w-5 h-5 text-purple-400" />,
      features: [
        "Everything in Growth",
        "Multi-profile career portfolios",
        "Recruiter view (read-only)",
        "Direct recruiter messaging",
        "1-on-1 resume & portfolio review",
        "Priority application slot",
      ],
      buttonText: "Go Premium",
      buttonVariant: "default",
      isRecommended: false,
    },
  ],
};

/* ─────────────────────────────────────────────
   Inner Page (uses useSearchParams — must be inside Suspense)
───────────────────────────────────────────── */
function PlansPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [appliedCount, setAppliedCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Payment result states from Stripe redirect
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState("");

  const userEmail = session?.user?.email;

  // ── Fetch application count ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userEmail) return;
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) setAppliedCount(data.total || data.applications?.length || 0);
      })
      .catch(console.error);
  }, [userEmail]);

  // ── Handle Stripe redirect back to /plans ────────────────────────────────────
  useEffect(() => {
    const isSuccess = searchParams.get("payment_success") === "true";
    const isCanceled = searchParams.get("payment_canceled") === "true";
    const sessionId = searchParams.get("session_id");
    const planFromUrl = searchParams.get("plan");

    if (isCanceled) {
      setPaymentCanceled(true);
      return;
    }

    if (isSuccess && sessionId) {
      setPaymentSuccess(true);
      setVerifying(true);

      // Verify payment server-side and activate plan in MongoDB
      fetch(`${BASE_URL}/api/verify-checkout-session?sessionId=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.isPaid) {
            const plan = data.planId || planFromUrl || "growth";
            setActivatedPlan(plan);
            if (typeof window !== "undefined") {
              localStorage.setItem("hl_user_plan", plan);
            }
          }
        })
        .catch(console.error)
        .finally(() => setVerifying(false));
    }
  }, [searchParams]);

  // ── Handle plan selection ────────────────────────────────────────────────────
  const handleSelectPlan = (plan) => {
    if (plan.id === "starter") {
      router.push("/jobs");
      return;
    }
    setSelectedPlan(plan);
    setCheckoutError("");
  };

  // ── Launch real Stripe Checkout ──────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!session?.user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/plans")}`);
      return;
    }

    setCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch(`${BASE_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          priceAmount: selectedPlan.numericPrice,
          billingCycle,
          userEmail: session.user.email,
          userId: session.user.id || "",
        }),
      });

      const data = await res.json();

      if (data?.success && data?.url) {
        // Redirect user to Stripe-hosted checkout page
        window.location.href = data.url;
      } else {
        setCheckoutError(data?.message || "Could not start checkout. Please try again.");
        setCheckingOut(false);
      }
    } catch (err) {
      setCheckoutError("Network error. Please check your connection and try again.");
      setCheckingOut(false);
    }
  };

  const plans = PLANS[billingCycle];

  // ── Payment Success Screen ───────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#141416] border border-emerald-500/30 rounded-3xl p-10 flex flex-col items-center gap-6 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            {verifying ? (
              <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CircleCheck className="w-10 h-10 text-emerald-400" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-white">
              {verifying ? "Activating your plan…" : "Payment Successful! 🎉"}
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {verifying
                ? "Verifying your payment and activating your account…"
                : `Your ${activatedPlan ? activatedPlan.charAt(0).toUpperCase() + activatedPlan.slice(1) : "Growth"} Plan is now active. You now have unlimited job applications!`}
            </p>
          </div>
          {!verifying && (
            <Link href="/jobs">
              <Button className="bg-[#6254f5] hover:bg-[#7164ff] text-white font-bold px-7 py-3 rounded-xl text-xs shadow-lg shadow-[#6254f5]/30">
                Start Applying → Unlimited Jobs
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#6254f5]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col items-center gap-10 relative z-10">

        {/* ─── Top Nav ─── */}
        <div className="w-full flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Jobs
          </Link>
          {userEmail && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-neutral-300">
              <span>Applications used:</span>
              <span className={`font-bold ${appliedCount >= 3 ? "text-amber-400" : "text-emerald-400"}`}>
                {appliedCount} / 3 Free
              </span>
            </div>
          )}
        </div>

        {/* ─── Payment Canceled Banner ─── */}
        {paymentCanceled && (
          <div className="w-full max-w-2xl bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-center gap-3">
            <TriangleExclamation className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-white block">Payment was canceled.</span>
              You can try again anytime. Your free applications are still active.
            </div>
          </div>
        )}

        {/* ─── Hero Header ─── */}
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#a198ff] uppercase bg-[#6254f5]/15 border border-[#6254f5]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#a198ff] rounded-sm" />
            PRICING
            <span className="w-1.5 h-1.5 bg-[#a198ff] rounded-sm" />
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Pay for the leverage, <br />
            not the listings
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-lg mt-1">
            Apply to up to 3 jobs free. Upgrade for unlimited applications, priority processing, and recruiter visibility.
          </p>

          {appliedCount >= 3 && (
            <div className="w-full mt-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-center gap-3 text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
              <div>
                <span className="font-bold text-white block">You have used all 3 free applications!</span>
                Upgrade below to unlock unlimited job applications immediately.
              </div>
            </div>
          )}
        </div>

        {/* ─── Monthly / Yearly Toggle ─── */}
        <div className="flex items-center justify-center gap-1 bg-[#141416] border border-white/10 p-1.5 rounded-full shadow-inner">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "yearly" ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
              25% OFF
            </span>
          </button>
        </div>

        {/* ─── Pricing Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              {...plan}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>

        {/* ─── Trust Row ─── */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-4 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe</span>
          <span className="flex items-center gap-1.5"><CircleCheck className="w-3.5 h-3.5" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><CircleCheck className="w-3.5 h-3.5" /> 256-bit SSL encryption</span>
          <span className="flex items-center gap-1.5"><CircleCheck className="w-3.5 h-3.5" /> No hidden fees</span>
        </div>

      </div>

      {/* ─── Checkout Confirmation Modal ─── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141416] border border-white/15 rounded-3xl max-w-md w-full p-6 text-white flex flex-col gap-5 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-[#a198ff]" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Upgrade to {selectedPlan.name} Plan
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Powered by Stripe — fully secure checkout
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedPlan(null); setCheckoutError(""); }}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <Xmark className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs flex flex-col gap-3">
              <div className="flex justify-between text-neutral-400">
                <span>Plan</span>
                <span className="text-white font-bold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Billing</span>
                <span className="text-white font-bold capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Price</span>
                <span className="text-white font-bold">{selectedPlan.price}/mo</span>
              </div>
              <div className="flex justify-between text-neutral-400 border-t border-white/10 pt-2 mt-1">
                <span>Applications</span>
                <span className="text-emerald-400 font-bold">Unlimited ✓</span>
              </div>
            </div>

            {/* What you get */}
            <div className="text-xs text-neutral-300 leading-relaxed bg-[#6254f5]/10 border border-[#6254f5]/20 rounded-xl p-3.5">
              ✦ You'll be redirected to <span className="text-white font-semibold">Stripe's secure checkout</span>. After payment, your plan activates instantly and you can apply to <span className="text-white font-semibold">unlimited jobs</span>.
            </div>

            {/* Error message */}
            {checkoutError && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {checkoutError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => { setSelectedPlan(null); setCheckoutError(""); }}
                disabled={checkingOut}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6254f5] hover:bg-[#7164ff] text-white text-xs font-bold shadow-lg shadow-[#6254f5]/30 cursor-pointer disabled:opacity-60 transition-all"
              >
                {checkingOut ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting to Stripe…
                  </>
                ) : (
                  <>
                    Pay {selectedPlan.price} &amp; Activate
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pricing Card Component
───────────────────────────────────────────── */
function PricingCard({ isRecommended, icon, name, price, period, description, features, buttonText, buttonVariant, onSelect }) {
  return (
    <div
      className={`group relative flex flex-col bg-[#141416] border rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 shadow-xl ${
        isRecommended
          ? "border-[#6254f5] shadow-[#6254f5]/20 ring-1 ring-[#6254f5]"
          : "border-white/[0.08] hover:border-white/20"
      }`}
    >
      {isRecommended && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6254f5] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md">
          Most Popular
        </span>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white">{name}</h3>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl font-extrabold text-white">{price}</span>
          <span className="text-xs text-neutral-400 font-normal">{period}</span>
        </div>
      </div>

      <p className="text-xs text-neutral-400 font-medium mb-5">{description}</p>

      <div className="flex flex-col gap-3 mb-8 flex-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
            <span className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-neutral-400 text-[10px]">
              +
            </span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSelect}
        className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          buttonVariant === "white"
            ? "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10"
            : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
        }`}
      >
        {buttonText}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Default Export — wrapped in Suspense for useSearchParams
───────────────────────────────────────────── */
export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#6254f5] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlansPageInner />
    </Suspense>
  );
}
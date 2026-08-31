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
      buttonVariant: "primary",
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
      buttonVariant: "primary",
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

function PlansPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [appliedCount, setAppliedCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState("");

  const userEmail = session?.user?.email;

  // Handle URL query flags (after Stripe redirect)
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId) {
      setPaymentSuccess(true);
      setVerifying(true);

      fetch(`${BASE_URL}/api/verify-checkout-session?session_id=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.success) {
            setActivatedPlan(data?.subscription?.plan || "growth");
          }
        })
        .catch(console.error)
        .finally(() => setVerifying(false));
    }

    if (canceled === "true") {
      setPaymentCanceled(true);
    }
  }, [searchParams]);

  // Fetch applicant's current application count
  useEffect(() => {
    if (!userEmail) return;
    fetch(`${BASE_URL}/api/applications?applicantEmail=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        const count = data?.total || data?.applications?.length || 0;
        setAppliedCount(count);
      })
      .catch(() => {});
  }, [userEmail]);

  const handleSelectPlan = (plan) => {
    if (plan.numericPrice === 0) {
      router.push("/jobs");
      return;
    }

    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/plans")}`);
      return;
    }

    setSelectedPlan(plan);
    setCheckoutError("");
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !session?.user?.email) return;

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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-md w-full border rounded-3xl p-10 flex flex-col items-center gap-6 text-center shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--accent-border)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent-light)" }}>
            {verifying ? (
              <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
            ) : (
              <CircleCheck className="w-10 h-10 text-emerald-500" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {verifying ? "Activating your plan…" : "Payment Successful! 🎉"}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {verifying
                ? "Verifying your payment and activating your account…"
                : `Your ${activatedPlan ? activatedPlan.charAt(0).toUpperCase() + activatedPlan.slice(1) : "Growth"} Plan is now active. You now have unlimited job applications!`}
            </p>
          </div>
          {!verifying && (
            <Link href="/jobs">
              <button className="font-bold px-7 py-3 rounded-xl text-xs text-white shadow-lg cursor-pointer" style={{ backgroundColor: "var(--accent)" }}>
                Start Applying → Unlimited Jobs
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <div className="max-w-6xl mx-auto flex flex-col items-center gap-10 relative z-10">

        {/* ─── Top Nav ─── */}
        <div className="w-full flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 text-xs font-semibold hover:underline transition-colors" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Jobs
          </Link>
          {userEmail && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
              <span>Applications used:</span>
              <span className={`font-bold ${appliedCount >= 3 ? "text-amber-500" : "text-emerald-500"}`}>
                {appliedCount} / 3 Free
              </span>
            </div>
          )}
        </div>

        {/* ─── Payment Canceled Banner ─── */}
        {paymentCanceled && (
          <div className="w-full max-w-2xl bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-600 flex items-center gap-3">
            <TriangleExclamation className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <span className="font-bold block" style={{ color: "var(--text-primary)" }}>Payment was canceled.</span>
              You can try again anytime. Your free applications are still active.
            </div>
          </div>
        )}

        {/* ─── Hero Header ─── */}
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase border px-3 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
            <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: "var(--accent)" }} />
            PRICING
            <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: "var(--accent)" }} />
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
            Pay for the leverage, <br />
            not the listings
          </h1>
          <p className="text-sm sm:text-base max-w-lg mt-1" style={{ color: "var(--text-secondary)" }}>
            Apply to up to 3 jobs free. Upgrade for unlimited applications, priority processing, and recruiter visibility.
          </p>

          {appliedCount >= 3 && (
            <div className="w-full mt-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-600 flex items-center gap-3 text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 text-amber-500" />
              <div>
                <span className="font-bold block" style={{ color: "var(--text-primary)" }}>You have used all 3 free applications!</span>
                Upgrade below to unlock unlimited job applications immediately.
              </div>
            </div>
          )}
        </div>

        {/* ─── Monthly / Yearly Toggle ─── */}
        <div className="flex items-center justify-center gap-1 border p-1.5 rounded-full shadow-xs" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <button
            onClick={() => setBillingCycle("monthly")}
            className="px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: billingCycle === "monthly" ? "var(--accent)" : "transparent",
              color: billingCycle === "monthly" ? "#ffffff" : "var(--text-secondary)"
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: billingCycle === "yearly" ? "var(--accent)" : "transparent",
              color: billingCycle === "yearly" ? "#ffffff" : "var(--text-secondary)"
            }}
          >
            Yearly
            <span className="bg-pink-500/20 text-pink-500 border border-pink-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
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
        <div className="flex flex-wrap items-center justify-center gap-5 pt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe</span>
          <span className="flex items-center gap-1.5"><CircleCheck className="w-3.5 h-3.5" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><CircleCheck className="w-3.5 h-3.5" /> 256-bit SSL encryption</span>
          <span className="flex items-center gap-1.5"><CircleCheck className="w-3.5 h-3.5" /> No hidden fees</span>
        </div>

      </div>

      {/* ─── Checkout Confirmation Modal ─── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="border rounded-3xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6" style={{ color: "var(--accent)" }} />
                <div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    Upgrade to {selectedPlan.name} Plan
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Powered by Stripe — fully secure checkout
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedPlan(null); setCheckoutError(""); }}
                className="p-1 rounded-lg cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                <Xmark className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="border rounded-xl p-4 text-xs flex flex-col gap-3" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                <span>Plan</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                <span>Billing</span>
                <span className="font-bold capitalize" style={{ color: "var(--text-primary)" }}>{billingCycle}</span>
              </div>
              <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                <span>Price</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedPlan.price}/mo</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-1" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                <span>Applications</span>
                <span className="text-emerald-500 font-bold">Unlimited ✓</span>
              </div>
            </div>

            {/* Error message if any */}
            {checkoutError && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {checkoutError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => { setSelectedPlan(null); setCheckoutError(""); }}
                disabled={checkingOut}
                className="px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer disabled:opacity-40"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-60 transition-all"
                style={{ backgroundColor: "var(--accent)" }}
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
      className="group relative flex flex-col border rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: isRecommended ? "var(--accent)" : "var(--border-color)",
        boxShadow: isRecommended ? "var(--shadow-md)" : "var(--shadow-sm)"
      }}
    >
      {isRecommended && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md" style={{ backgroundColor: "var(--accent)" }}>
          Most Popular
        </span>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            {icon}
          </div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{name}</h3>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{price}</span>
          <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{period}</span>
        </div>
      </div>

      <p className="text-xs font-medium mb-5" style={{ color: "var(--text-secondary)" }}>{description}</p>

      <div className="flex flex-col gap-3 mb-8 flex-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px]" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
              +
            </span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSelect}
        className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        style={{
          backgroundColor: buttonVariant === "primary" ? "var(--accent)" : "var(--bg-secondary)",
          color: buttonVariant === "primary" ? "#ffffff" : "var(--text-primary)",
          border: buttonVariant === "primary" ? "none" : "1px solid var(--border-color)",
          boxShadow: buttonVariant === "primary" ? "0 4px 12px rgba(98,84,245,0.25)" : "none"
        }}
      >
        {buttonText}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
        </div>
      }
    >
      <PlansPageInner />
    </Suspense>
  );
}
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Spinner } from "@heroui/react";
import { 
  Envelope, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeSlash,
  CircleCheck,
  CircleExclamation
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[85vh] items-center justify-center">
        <Spinner size="lg" color="secondary" />
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const { data, error: authError } = await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: async (ctx) => {
            setLoading(false);
            const userObj = ctx?.data?.user;
            const userName = userObj?.name || "back";
            const userRole = userObj?.role || "job_seeker";

            // Issue HttpOnly JWT Token from Express Backend
            try {
              await fetch(`${BASE_URL}/api/auth/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  email: userObj?.email || email,
                  role: userRole,
                  name: userName,
                  id: userObj?.id || "",
                }),
              });
            } catch (jwtErr) {
              console.error("JWT token issuance error:", jwtErr);
            }

            setSuccess(`Logged in successfully! Welcome ${userName}. Redirecting...`);
            
            // Resolve target destination
            let dest = callbackUrl;
            if (!callbackUrl || callbackUrl === "/" || callbackUrl === "") {
              if (userRole === "admin") dest = "/dashboard/admin";
              else if (userRole === "recruiter") dest = "/dashboard/recruiter";
              else dest = "/dashboard/seeker";
            }

            setTimeout(() => {
              router.push(dest);
              router.refresh();
            }, 900);
          },
          onError: (ctx) => {
            setLoading(false);
            setError(
              ctx.error?.message ||
                "Invalid email or password. Please check your credentials."
            );
          },
        }
      );

      if (authError) {
        setLoading(false);
        setError(authError.message || "Failed to sign in. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-2xl bg-[#141416]/95 border border-white/10 rounded-2xl backdrop-blur-xl">

        {/* ==================== HEADER ==================== */}
        <Card.Header className="flex flex-col items-start gap-1 pb-4 px-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to your Hireloop account to continue</p>
        </Card.Header>

        {/* ==================== FORM ==================== */}
        <form onSubmit={handleSignIn} className="flex flex-col gap-4 mt-2">
          
          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
              <CircleExclamation className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-medium">
              <CircleCheck className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Envelope className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Password <span className="text-red-400">*</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input
                required
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-3.5 text-gray-500 hover:text-gray-300 focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {isVisible ? (
                  <EyeSlash className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={loading}
            className="mt-2 w-full bg-[#6254f5] text-white hover:bg-[#7164ff] font-semibold rounded-xl py-3 shadow-lg shadow-[#6254f5]/25 transition-all text-sm cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          {/* Footer Navigation */}
          <div className="mt-4 text-center text-xs text-gray-400">
            Don't have an account yet?{" "}
            <Link
              href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-semibold text-[#8277ff] hover:text-[#a198ff] hover:underline"
            >
              Sign Up Free
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Spinner } from "@heroui/react";
import { 
  Envelope, 
  Lock, 
  Person, 
  ArrowLeft,
  Eye,
  EyeSlash,
  Briefcase,
  Factory,
  CircleCheck,
  CircleExclamation
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[85vh] items-center justify-center">
        <Spinner size="lg" color="secondary" />
      </div>
    }>
      <SignUpFormContent />
    </Suspense>
  );
}

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/";

  const [role, setRole] = useState("job_seeker"); // 'job_seeker' | 'recruiter'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await authClient.signUp.email(
        {
          email,
          password,
          name,
          role,
        },
        {
          onSuccess: () => {
            setLoading(false);
            const roleLabel = role === "recruiter" ? "Recruiter" : "Job Seeker";
            setSuccess(`Account created successfully as ${roleLabel}! Redirecting to Sign In...`);
            setTimeout(() => {
              router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            }, 1200);
          },
          onError: (ctx) => {
            setLoading(false);
            setError(
              ctx.error?.message ||
                "Failed to create account. Email may already be in use."
            );
          },
        }
      );

      if (authError) {
        setLoading(false);
        setError(authError.message || "Failed to create account.");
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-sm text-gray-400">Join Hireloop to connect with top tech roles & employers</p>
        </Card.Header>

        {/* ==================== FORM ==================== */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4 mt-2">
          
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

          {/* Role Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              I want to <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("job_seeker")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  role === "job_seeker"
                    ? "border-[#6254f5] bg-[#6254f5]/15 text-[#a198ff] shadow-md shadow-[#6254f5]/20"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Find a Job
              </button>

              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  role === "recruiter"
                    ? "border-[#ff7a00] bg-[#ff7a00]/15 text-[#ff9838] shadow-md shadow-[#ff7a00]/20"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <Factory className="w-4 h-4" />
                Hire Talent
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  role === "admin"
                    ? "border-amber-500 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/20"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <Person className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Person className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input
                required
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Footer Navigation */}
          <div className="mt-4 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-semibold text-[#8277ff] hover:text-[#a198ff] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
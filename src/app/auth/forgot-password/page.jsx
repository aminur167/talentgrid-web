"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Spinner } from "@heroui/react";
import {
  Envelope,
  Lock,
  ArrowLeft,
  Eye,
  EyeSlash,
  CircleCheck,
  CircleExclamation,
  ShieldCheck,
  Clock,
  Pencil,
} from "@gravity-ui/icons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://talentgrid-api.vercel.app";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: 'email', Step 2: 'code_and_password', Step 3: 'success'
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [demoCode, setDemoCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer for OTP validity (15 mins = 900s)
  const [timeLeft, setTimeLeft] = useState(900);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === "code_and_password" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Send OTP Code
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.trim()) {
      setError("Please enter your account email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send reset code. Please check your email.");
        setLoading(false);
        return;
      }

      setDemoCode(data.code || "");
      setSuccess("A 6-digit verification code has been dispatched!");
      setStep("code_and_password");
      setTimeLeft(900);
      setResendCooldown(60);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      otpInputs.current[5]?.focus();
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setStep("success");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-[90vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Card
        className="w-full max-w-md border p-6 sm:p-8 backdrop-blur-md transition-all shadow-2xl rounded-3xl"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      >
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col gap-2 text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#6254f5] to-[#8277ff] flex items-center justify-center shadow-lg shadow-[#6254f5]/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {step === "email" && "Password Recovery"}
            {step === "code_and_password" && "Enter Verification Code"}
            {step === "success" && "Password Reset Complete"}
          </h1>
          <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {step === "email" && "Enter your registered email address to receive a secure 6-digit verification code."}
            {step === "code_and_password" && `A 6-digit code was sent to ${email}. Enter it below along with your new password.`}
            {step === "success" && "Your password has been successfully updated. You can now access your account."}
          </p>
        </div>

        {/* Demo Code Helper Banner (For testing convenience) */}
        {demoCode && step === "code_and_password" && (
          <div
            className="mb-4 p-3 rounded-2xl border flex items-center justify-between text-xs"
            style={{
              backgroundColor: "rgba(98,84,245,0.08)",
              borderColor: "rgba(98,84,245,0.25)",
              color: "var(--accent)",
            }}
          >
            <span>Verification Code: <strong className="font-mono text-sm tracking-widest">{demoCode}</strong></span>
            <button
              type="button"
              onClick={() => {
                setOtp(demoCode.split(""));
              }}
              className="text-[10px] font-bold underline cursor-pointer hover:opacity-80"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
            <CircleExclamation className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && step !== "success" && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-medium">
            <CircleCheck className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ==================== STEP 1: ENTER EMAIL ==================== */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Registered Email <span className="text-red-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Envelope className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="mt-2 w-full bg-[#6254f5] text-white hover:bg-[#7164ff] font-bold rounded-xl py-3 shadow-lg shadow-[#6254f5]/25 transition-all text-sm cursor-pointer"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </Button>

            <div className="mt-4 text-center text-xs text-gray-400">
              <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* ==================== STEP 2: CODE & NEW PASSWORD ==================== */}
        {step === "code_and_password" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            
            {/* OTP 6-Box Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  6-Digit OTP Code <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] font-mono flex items-center gap-1 text-amber-400">
                  <Clock className="w-3 h-3" /> Expires in {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex justify-between gap-2 on-paste" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-white/10 bg-white/5 text-white transition-all focus:border-[#6254f5] focus:scale-105 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  required
                  type={isVisible ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-3.5 text-gray-500 hover:text-gray-300 focus:outline-none cursor-pointer"
                >
                  {isVisible ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  required
                  type={isVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#6254f5] focus:bg-black/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="mt-2 w-full bg-[#6254f5] text-white hover:bg-[#7164ff] font-bold rounded-xl py-3 shadow-lg shadow-[#6254f5]/25 transition-all text-sm cursor-pointer"
            >
              {loading ? "Updating Password..." : "Set New Password"}
            </Button>

            {/* Resend & Change Email */}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ← Change Email
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleSendCode}
                className="text-[#8277ff] hover:text-[#a198ff] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {/* ==================== STEP 3: SUCCESS ==================== */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CircleCheck className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-white">Your Password Has Been Reset!</h2>
              <p className="text-xs text-gray-400 max-w-xs">
                You can now log in securely using your updated password.
              </p>
            </div>

            <Link href="/auth/signin" className="w-full">
              <Button className="w-full bg-[#6254f5] text-white hover:bg-[#7164ff] font-bold rounded-xl py-3 shadow-lg shadow-[#6254f5]/25 transition-all text-sm cursor-pointer">
                Proceed to Sign In →
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

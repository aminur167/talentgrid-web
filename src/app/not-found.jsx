import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Gradient Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(98,84,245,0.1) 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group relative z-10">
        <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#6254f5] to-[#8277ff] flex items-center justify-center shadow-lg shadow-[#6254f5]/30">
          <span className="text-white font-extrabold text-lg">T</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
            TalentGrid
          </span>
          <span className="text-[10px] font-mono font-semibold tracking-widest" style={{ color: "var(--accent)" }}>
            PLATFORM
          </span>
        </div>
      </Link>

      {/* 404 Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 max-w-lg">
        <div
          className="text-[120px] font-black leading-none tracking-tighter"
          style={{
            background: "linear-gradient(135deg, #6254f5, #8277ff, #a198ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          Page Not Found
        </h1>

        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track to finding your next opportunity.
        </p>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full border"
            style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-border)", color: "var(--accent)" }}
          >
            24 Active Jobs
          </span>
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
          >
            12 Verified Companies
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <Link href="/">
          <button
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl transition-all hover:opacity-90 hover:scale-105 cursor-pointer"
            style={{ backgroundColor: "var(--accent)" }}
          >
            ← Back to Home
          </button>
        </Link>
        <Link href="/jobs">
          <button
            className="px-6 py-3 rounded-2xl text-sm font-bold border transition-all hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            Browse Jobs →
          </button>
        </Link>
        <Link href="/auth/signin">
          <button
            className="px-6 py-3 rounded-2xl text-sm font-bold border transition-all hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            Sign In
          </button>
        </Link>
      </div>

      {/* Bottom help text */}
      <p className="text-xs relative z-10" style={{ color: "var(--text-muted)" }}>
        Lost? Try{" "}
        <Link href="/jobs" className="underline hover:text-[#6254f5]">
          browsing all jobs
        </Link>{" "}
        or{" "}
        <Link href="/auth/signup" className="underline hover:text-[#6254f5]">
          creating a free account
        </Link>
        .
      </p>
    </div>
  );
}

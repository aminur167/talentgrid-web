"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { RecruiterSidebar } from "@/components/dashboard/RecruiterSidebar";

export default function RecruiterDashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin?callbackUrl=/dashboard/recruiter");
    }
    if (!isPending && session && session.user?.role !== "recruiter") {
      router.push("/404");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen bg-[#09090b] items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.user?.role !== "recruiter") return null;

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <main className="p-5 sm:p-8 lg:p-10 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { SeekerSidebar } from "@/components/dashboard/SeekerSidebar";

export default function SeekerDashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin?callbackUrl=/dashboard/seeker");
    }
    if (!isPending && session && session.user?.role !== "job_seeker") {
      router.push("/404");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen bg-[#09090b] items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#6254f5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.user?.role !== "job_seeker") return null;

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      <SeekerSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

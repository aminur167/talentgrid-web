"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

export default function AdminDashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
    if (!isPending && session && session.user?.role !== "admin") {
      router.push("/404");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen bg-[#09090b] items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") return null;

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-white overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <main className="p-5 sm:p-8 lg:p-10 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

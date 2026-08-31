"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <ThemeProvider>
      {!isDashboard && <Navbar />}
      <main className="min-h-screen flex flex-col">{children}</main>
      {!isDashboard && <Footer />}
    </ThemeProvider>
  );
}

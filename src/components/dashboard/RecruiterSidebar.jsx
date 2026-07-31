"use client";
import {
  House,
  Briefcase,
  Plus,
  Factory,
  Persons,
  Gear,
  ArrowRightFromSquare as SignOutIcon
} from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { icon: House,    href: "/dashboard/recruiter",            label: "Dashboard",       exact: true },
  { icon: Briefcase, href: "/dashboard/recruiter/jobs",      label: "My Job Posts" },
  { icon: Plus,     href: "/dashboard/recruiter/jobs/new",  label: "Post a Job" },
  { icon: Factory,  href: "/dashboard/recruiter/company",   label: "Company Profile" },
  { icon: Persons,  href: "/dashboard/recruiter/applicants",label: "Applicants" },
  { icon: Gear,     href: "/dashboard/recruiter/settings",  label: "Settings" },
];

export function RecruiterSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => { router.push("/"); router.refresh(); } }
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.07]">
        <Link href="/dashboard/recruiter" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6254f5] flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-white font-bold text-base tracking-tight">HireLoop</span>
          <span className="text-[10px] font-semibold text-[#a198ff] bg-[#6254f5]/15 px-2 py-0.5 rounded-full border border-[#6254f5]/30">Recruiter</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[#6254f5] text-white shadow-md shadow-[#6254f5]/30"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-white" : "text-neutral-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 pb-4 border-t border-white/[0.07] pt-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all w-full cursor-pointer"
        >
          <SignOutIcon className="w-4.5 h-4.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/[0.07] bg-[#0d0d0f] lg:flex flex-col min-h-screen sticky top-0">
      {sidebarContent}
    </aside>
  );
}

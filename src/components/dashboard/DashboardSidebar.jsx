"use client";
import {
  LayoutSideContentLeft,
  Bell,
  Envelope,
  Briefcase,
  Gear,
  House,
  Magnifier,
  Person,
} from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: House, href: "/dashboard/recruiter", label: "Home" },
    { icon: Magnifier, href: "/dashboard/recruiter/jobs", label: "Jobs" },
    { icon: Bell, href: "/dashboard/recruiter/jobs/new", label: "Post A Job" },
    { icon: Briefcase, href: "/dashboard/recruiter/company", label: "Company Profile" },
    { icon: Envelope, href: "/messages", label: "Messages" },
    { icon: Person, href: "/profile", label: "Profile" },
    { icon: Gear, href: "/settings", label: "Settings" },
  ];

  const checkIsActive = (href) => {
    if (href === "/dashboard/recruiter") {
      return pathname === "/dashboard/recruiter";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navContent = (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const isActive = checkIsActive(item.href);
        return (
          <Link 
            key={item.label}
            href={item.href}
            prefetch={true}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-[#6254f5] text-white font-semibold shadow-md shadow-[#6254f5]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className={`size-5 transition-colors ${isActive ? "text-white" : "text-neutral-400"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#09090b] p-4 lg:block">
        {navContent}
      </aside>
      <Drawer>
        <Button className="lg:hidden bg-white/5 text-neutral-300 border border-white/10" variant="secondary">
          <LayoutSideContentLeft />
          Sidebar
        </Button>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Navigation</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                {navContent}
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}

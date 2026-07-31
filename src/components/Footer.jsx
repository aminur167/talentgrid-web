"use client";

import { ArrowUpRight } from "@gravity-ui/icons";
import Link from "next/link";
import Image from "next/image";

function Footer() {
  const productLinks = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "AI Career Assistant", href: "/ai-career-assistant" },
    { name: "Companies", href: "/companies" },
    { name: "Salary Data", href: "/salary-data" },
  ];

  const navigationLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Career Resources", href: "/career-resources" },
    { name: "Contact Us", href: "/contact" },
  ];

  const resourceLinks = [
    { name: "Brand Guidelines", href: "/brand-guidelines" },
    { name: "Newsroom", href: "/newsroom" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <footer className="w-full border-t border-white/10 bg-[#0c0c0e] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
        {/* ==================== MAIN FOOTER ==================== */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-16">

          {/* ==================== BRAND ==================== */}
          <div className="lg:pr-10">
            <Link
              href="/"
              className="inline-flex items-center transition-opacity hover:opacity-90"
              aria-label="Hireloop Home"
            >
              <Image
                src="/images/logo.png"
                alt="Hireloop"
                width={150}
                height={42}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-6 text-gray-500">
              The AI-native career platform. Built for people who take their
              work seriously.
            </p>
          </div>

          {/* ==================== PRODUCT ==================== */}
          <div>
            <h3 className="text-sm font-semibold text-[#6f62ff]">
              Product
            </h3>

            <ul className="mt-6 space-y-4">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.name}

                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================== NAVIGATIONS ==================== */}
          <div>
            <h3 className="text-sm font-semibold text-[#6f62ff]">
              Navigations
            </h3>

            <ul className="mt-6 space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.name}

                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================== RESOURCES ==================== */}
          <div>
            <h3 className="text-sm font-semibold text-[#6f62ff]">
              Resources
            </h3>

            <ul className="mt-6 space-y-4">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.name}

                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ==================== BOTTOM FOOTER ==================== */}
        <div className="mt-14 border-t border-white/10 pt-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            {/* ==================== SOCIAL ICONS ==================== */}
            <div className="flex items-center gap-2">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-gray-500 transition-all duration-200 hover:bg-[#1877F2] hover:text-white"
              >
                <span className="text-sm font-bold">f</span>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-gray-500 transition-all duration-200 hover:bg-[#0A66C2] hover:text-white"
              >
                <span className="text-sm font-bold">in</span>
              </a>

              {/* X */}
              <a
                href="#"
                aria-label="X"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-gray-500 transition-all duration-200 hover:bg-white hover:text-black"
              >
                <span className="text-sm font-medium">𝕏</span>
              </a>
            </div>

            {/* ==================== COPYRIGHT + LEGAL ==================== */}
            <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-6">
              <p>
                Copyright {new Date().getFullYear()} — Hireloop
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="/terms"
                  className="transition-colors hover:text-gray-300"
                >
                  Terms &amp; Conditions
                </a>

                <span className="text-gray-800">•</span>

                <a
                  href="/privacy"
                  className="transition-colors hover:text-gray-300"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Blog", href: "/blog" },
  { label: "Apply to Work", href: "/apply" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  // Dev-only guard to detect accidental double mounts
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[SiteHeader] Duplicate header mounted!");
    }
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <header
      id="site-header"
      data-site-header="true"
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-blue-600" />
          <span className="text-lg font-semibold tracking-tight">Shalean</span>
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href} className="whitespace-nowrap">
                  <Link
                    href={item.href}
                    className={[
                      "inline-flex items-center rounded-md px-1.5 py-1 text-sm font-medium transition-colors",
                      active ? "text-blue-700" : "text-slate-700 hover:text-blue-700",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTAs (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/quote"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Get a Free Quote
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-blue-700">
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile placeholder (menu can be added later) */}
        <div className="lg:hidden" />
      </div>
    </header>
  );
}

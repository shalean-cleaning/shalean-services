"use client";

import LinkSafe from "@/components/LinkSafe";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Calculator } from "lucide-react";

import { UserAvatar } from '@/components/auth/UserAvatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useAuth';

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
  const [open, setOpen] = useState(false);
  const { user, profile } = useUser();

  // Dev-only guard to detect accidental double mounts
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current && process.env.NODE_ENV !== "production") {
      console.warn("[SiteHeader] Duplicate header mounted!");
    }
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const shouldShowLink = (item: typeof NAV[0]) => {
    // Apply auth filtering similar to original
    if (item.href === '/apply') return !user; // Only show for non-authenticated users
    return true;
  };

  const filteredNav = NAV.filter(shouldShowLink);


  return (
    <header
      id="site-header"
      data-site-header="true"
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <LinkSafe href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-blue-600" />
          <span className="text-lg font-semibold tracking-tight">Shalean</span>
        </LinkSafe>

        {/* Nav (desktop) */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {filteredNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href} className="whitespace-nowrap">
                  <LinkSafe
                    href={item.href}
                    className={[
                      "inline-flex items-center rounded-md px-1.5 py-1 text-sm font-medium transition-colors",
                      active ? "text-blue-700" : "text-slate-700 hover:text-blue-700",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </LinkSafe>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTAs (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <LinkSafe href="/quote">
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Get Quote
            </Button>
          </LinkSafe>
          <LinkSafe
            href="/booking"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Book a Service
          </LinkSafe>
          {user && profile ? (
            <UserAvatar profile={profile} />
          ) : (
            <>
              <LinkSafe href="/auth/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm font-medium hover:text-blue-700"
                >
                  Log In
                </Button>
              </LinkSafe>
              <LinkSafe href="/auth/signup">
                <Button
                  className="inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Sign Up
                </Button>
              </LinkSafe>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-6">
            {/* Mobile Navigation */}
            <nav className="mb-6">
              <ul className="space-y-4">
                {filteredNav.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href} className="whitespace-nowrap">
                      <LinkSafe
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={[
                          "inline-flex items-center rounded-md px-1.5 py-1 text-sm font-medium transition-colors",
                          active ? "text-blue-700" : "text-slate-700 hover:text-blue-700",
                        ].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </LinkSafe>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile CTAs */}
            <div className="space-y-3">
              <LinkSafe href="/quote">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Get Quote
                </Button>
              </LinkSafe>
              <LinkSafe
                href="/booking"
                className="block w-full rounded-md border px-3 py-2 text-sm font-medium text-center hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Book a Service
              </LinkSafe>
              
              {user && profile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar profile={profile} />
                    <div>
                      <p className="font-medium">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {profile.role?.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <LinkSafe href="/auth/login">
                    <Button 
                      className="w-full"
                      onClick={() => setOpen(false)}
                    >
                      Log In
                    </Button>
                  </LinkSafe>
                  <LinkSafe href="/auth/signup">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Button>
                  </LinkSafe>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

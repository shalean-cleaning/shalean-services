"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

import { LogoutButton } from '@/components/auth/LogoutButton';
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

function NavLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <li className="whitespace-nowrap">
      <Link
        href={href}
        onClick={onClick}
        className={[
          "inline-flex items-center rounded-md px-1.5 py-1 text-sm font-medium transition-colors",
          isActive ? "text-blue-700" : "text-slate-700 hover:text-blue-700",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
        ].join(" ")}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    </li>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, profile } = useUser();

  const shouldShowLink = (item: typeof NAV[0]) => {
    // Apply auth filtering similar to original
    if (item.href === '/apply') return !user; // Only show for non-authenticated users
    return true;
  };

  const filteredNav = NAV.filter(shouldShowLink);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
            </div>
          <span className="text-lg font-semibold tracking-tight">Shalean</span>
          </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {filteredNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                pathname={pathname}
              />
            ))}
          </ul>
          </nav>

        {/* Right: CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/quote"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Get a Free Quote
          </Link>
            {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {profile?.first_name || user.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/account">Dashboard</Link>
                </Button>
                <LogoutButton variant="ghost" size="sm" />
              </div>
            ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-blue-700">
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Sign Up
              </Link>
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
                {filteredNav.map((item) => (
                  <NavLink
                      key={item.href}
                      href={item.href}
                    label={item.label}
                    pathname={pathname}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </ul>
                </nav>

            {/* Mobile CTAs */}
            <div className="space-y-3">
              <Link
                href="/quote"
                className="block w-full rounded-md border px-3 py-2 text-sm font-medium text-center hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Get a Free Quote
              </Link>
              
                  {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {profile?.first_name || user.email}
                          </p>
                      <p className="text-sm text-gray-500">
                            {profile?.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/account" onClick={() => setOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <LogoutButton variant="outline" className="w-full" />
                    </div>
                  ) : (
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      Log In
                        </Link>
                      </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/signup" onClick={() => setOpen(false)}>
                      Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
        </div>
      )}
    </header>
  );
}
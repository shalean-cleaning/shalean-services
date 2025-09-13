'use client'

import { Menu, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { LogoutButton } from '@/components/auth/LogoutButton'
import QuickQuote from '@/components/landing/quick-quote'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useUser } from '@/hooks/useAuth'
import { NAV_ITEMS } from '@/types/nav'

export function Header() {
  const { user, profile, loading } = useUser()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Shalean Services
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md ${
                  isActiveLink(item.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:text-primary hover:border-b-2 hover:border-primary'
                }`}
                aria-current={isActiveLink(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            <QuickQuote isModal={true} />
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-sm">
                      {profile?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span>{profile?.first_name || user.email}</span>
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50" role="menu">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Bookings
                    </Link>
                    {profile?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {profile?.role === 'CLEANER' && (
                      <Link
                        href="/cleaner"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Cleaner Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-4 py-2">
                      <LogoutButton size="sm" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  aria-expanded="false"
                  aria-label="Open main menu"
                >
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">S</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        Shalean Services
                      </span>
                    </div>
                  </div>
                  
                  <nav className="flex-1" role="navigation" aria-label="Mobile navigation">
                    <div className="space-y-1">
                      {NAV_ITEMS.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                            isActiveLink(item.href)
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={isActiveLink(item.href) ? 'page' : undefined}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Mobile Auth Section */}
                    <div className="pt-6 border-t border-gray-200 mt-6">
                      <div className="px-3 py-2 mb-4">
                        <QuickQuote isModal={true} />
                      </div>
                      {loading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                      ) : user ? (
                        <div className="space-y-2">
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Hello, {profile?.first_name || user.email}
                          </div>
                          <Link
                            href="/account"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/bookings"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Bookings
                          </Link>
                          {profile?.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          {profile?.role === 'CLEANER' && (
                            <Link
                              href="/cleaner"
                              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Cleaner Dashboard
                            </Link>
                          )}
                          <div className="px-3 py-2">
                            <LogoutButton size="sm" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 px-3">
                          <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full">
                              Log in
                            </Button>
                          </Link>
                          <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button size="sm" className="w-full">
                              Sign up
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  )
}

'use client'

import { Menu, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { LogoutButton } from '@/components/auth/LogoutButton'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useUser } from '@/hooks/useAuth'
import { NAV_ITEMS } from '@/types/nav'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile } = useUser()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const shouldShowLink = (item: typeof NAV_ITEMS[0]) => {
    if (!item.auth) return true
    if (item.auth === 'any') return true
    if (item.auth === 'in') return !!user
    if (item.auth === 'out') return !user
    return true
  }

  const filteredNavItems = NAV_ITEMS.filter(shouldShowLink)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">Shalean</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">
                    {profile?.first_name || user.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/account">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bookings">Bookings</Link>
                </Button>
                <LogoutButton variant="ghost" size="sm" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-6 mt-6">
                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth */}
                <div className="border-t pt-6">
                  {user ? (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {profile?.first_name || user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {profile?.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/account" onClick={() => setIsOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/bookings" onClick={() => setIsOpen(false)}>
                          Bookings
                        </Link>
                      </Button>
                      <LogoutButton variant="outline" className="w-full" />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button asChild>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          Log in
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

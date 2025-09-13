import Link from 'next/link'

export function SkipLink() {
  return (
    <Link
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all"
    >
      Skip to main content
    </Link>
  )
}
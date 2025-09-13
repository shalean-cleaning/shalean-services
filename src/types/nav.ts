export interface NavItem {
  href: string
  label: string
  auth?: 'any' | 'in' | 'out'
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', auth: 'any' },
  { href: '/services', label: 'Services', auth: 'any' },
  { href: '/blog', label: 'Blog', auth: 'any' },
  { href: '/apply', label: 'Apply to Work', auth: 'out' },
  { href: '/quote', label: 'Get a Free Quote', auth: 'any' },
]

export const FOOTER_SECTIONS = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/our-team', label: 'Our Team' },
    { href: '/why-choose-shalean', label: 'Why Choose Shalean' },
    { href: '/contact', label: 'Contact' },
  ],
  resources: [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/services', label: 'Services' },
    { href: '/blog', label: 'Blog' },
    { href: '/quote', label: 'Get Quote' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
  contact: [
    { href: 'tel:+27123456789', label: '+27 12 345 6789' },
    { href: 'mailto:hello@shalean.co.za', label: 'hello@shalean.co.za' },
    { href: '/contact', label: 'Contact Form' },
  ],
}
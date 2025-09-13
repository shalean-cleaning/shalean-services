import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Apple, Play } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/our-team' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Why Choose Shalean', href: '/why-choose-shalean' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Cleaning Tips', href: '/blog/cleaning-tips' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Help Center', href: '/help' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
  contact: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Get a Quote', href: '/quote' },
    { name: 'Apply to Work', href: '/apply' },
    { name: 'Partner With Us', href: '/partners' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/shalean-services', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/shalean-services', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/shalean-services', icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">Shalean Services</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Professional cleaning services for homes and businesses. Trusted, reliable, and thorough cleaning solutions tailored to your needs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>+1 (555) CLEAN-UP</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>info@shalean-services.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>123 Cleaning Street, Your City, ST 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* App Badges Placeholder */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <Apple className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm">Download on the App Store</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Play className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm">Get it on Google Play</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Shalean Cleaning Services. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

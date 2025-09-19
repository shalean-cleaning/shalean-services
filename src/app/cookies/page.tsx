import { Metadata } from 'next';
import { Shield, Eye, Settings, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy - Shalean Cleaning Services',
  description: 'Learn about how Shalean Cleaning Services uses cookies and similar technologies to enhance your browsing experience and provide personalized services.',
  keywords: ['cookie policy', 'privacy', 'data protection', 'cookies', 'tracking'],
};

const cookieTypes = [
  {
    icon: Settings,
    title: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and remembering your preferences.',
    examples: ['Session management', 'Security tokens', 'User authentication', 'Shopping cart contents'],
    required: true
  },
  {
    icon: Eye,
    title: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    examples: ['Page views', 'Time spent on site', 'Popular pages', 'User journey tracking'],
    required: false
  },
  {
    icon: Shield,
    title: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization, such as remembering your language preference or region.',
    examples: ['Language settings', 'Location preferences', 'User interface customization', 'Remembered form data'],
    required: false
  },
  {
    icon: Lock,
    title: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites to display relevant and engaging advertisements.',
    examples: ['Ad targeting', 'Campaign tracking', 'Social media integration', 'Retargeting'],
    required: false
  }
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600">
            How we use cookies and similar technologies to enhance your experience
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
              <p className="text-gray-600 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p className="text-gray-600">
                At Shalean Cleaning Services, we use cookies and similar technologies to improve your browsing experience, 
                analyze website traffic, and provide personalized content and advertisements.
              </p>
            </div>

            {/* Cookie Types */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Types of Cookies We Use</h2>
              <div className="space-y-8">
                {cookieTypes.map((cookie, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <cookie.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{cookie.title}</h3>
                          {cookie.required && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{cookie.description}</p>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {cookie.examples.map((example, idx) => (
                              <li key={idx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Third Party Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
              <p className="text-gray-600 mb-4">
                We may also use third-party services that set cookies on our website. These include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
                <li><strong>Google Maps:</strong> To display interactive maps and location services</li>
                <li><strong>Social Media Platforms:</strong> For social sharing and integration features</li>
                <li><strong>Payment Processors:</strong> To securely process payments and transactions</li>
              </ul>
              <p className="text-gray-600">
                These third-party services have their own privacy policies and cookie practices. 
                We recommend reviewing their policies for more information.
              </p>
            </div>

            {/* Managing Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
              <p className="text-gray-600 mb-4">
                You have several options for managing cookies:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser Settings</h3>
                <p className="text-gray-600 mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete existing cookies</li>
                  <li>Set preferences for specific websites</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie Consent</h3>
                <p className="text-gray-600 mb-4">
                  When you first visit our website, you'll see a cookie consent banner. You can:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Accept all cookies</li>
                  <li>Reject non-essential cookies</li>
                  <li>Customize your preferences</li>
                  <li>Change your preferences at any time</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Note</h3>
                <p className="text-gray-600">
                  <strong>Please note:</strong> Disabling certain cookies may affect the functionality of our website 
                  and your ability to access certain features or services.
                </p>
              </div>
            </div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
              <p className="text-gray-600">
                We will notify you of any material changes by posting the updated policy on our website 
                and updating the "Last updated" date at the top of this page.
              </p>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="text-gray-600 space-y-2">
                  <li><strong>Email:</strong> privacy@shalean.co.za</li>
                  <li><strong>Phone:</strong> +27 12 345 6789</li>
                  <li><strong>Address:</strong> Shalean Cleaning Services, Cape Town, South Africa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

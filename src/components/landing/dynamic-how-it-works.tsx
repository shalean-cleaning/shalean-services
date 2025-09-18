"use client";

import { motion } from "framer-motion";

import { useHowItWorksContent } from "@/hooks/useHomepageData";

export default function DynamicHowItWorks() {
  const { data: content, isLoading, isError, error } = useHowItWorksContent();

  if (isLoading) {
    return (
      <section aria-labelledby="how-heading" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    console.error('How it works error:', error)
    return (
      <section aria-labelledby="how-heading" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="py-8 text-destructive">
              We&apos;re having trouble loading this section.
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!content) return null

  // Fallback content if no data
  const fallbackContent = [
    {
      id: '1',
      section_key: 'how-it-works',
      title: 'Getting your home in order has never been easier.',
      description: 'Three quick steps: choose a service, book online, and manage everything in one place.',
      order_index: 0,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '2',
      section_key: 'how-it-works',
      title: 'Choose',
      description: 'Pick the service and extras you need.',
      icon_name: 'check-circle',
      order_index: 1,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '3',
      section_key: 'how-it-works',
      title: 'Book',
      description: 'Secure your date & time in minutes.',
      icon_name: 'calendar',
      order_index: 2,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '4',
      section_key: 'how-it-works',
      title: 'Manage',
      description: 'Track and reschedule from your dashboard.',
      icon_name: 'settings',
      order_index: 3,
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  ];

  const displayContent = content && content.length > 0 ? content : fallbackContent;
  const headerContent = displayContent.find(c => c.order_index === 0);
  const steps = displayContent.filter(c => c.order_index > 0).sort((a, b) => a.order_index - b.order_index);

  return (
    <section aria-labelledby="how-heading" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            id="how-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {headerContent?.title || 'Getting your home in order has never been easier.'}
          </motion.h2>
          <motion.p
            className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {headerContent?.description || 'Three quick steps: choose a service, book online, and manage everything in one place.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            // Use default icon since icon_name field doesn't exist in content_blocks
            const IconComponent = null;

            return (
              <motion.div
                key={step.id}
                className="rounded-xl border p-6"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="text-sm uppercase tracking-wide text-primary/80">Step {i + 1}</div>
                <h3 className="mt-2 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                {IconComponent && (
                  <div className="mt-4 flex justify-center">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

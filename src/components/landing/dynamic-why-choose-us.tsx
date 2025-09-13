"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Calendar, Heart, Leaf, DollarSign, Phone } from "lucide-react";
import { useWhyChooseUsContent } from "@/hooks/useHomepageData";

const iconMap = {
  'shield-check': ShieldCheck,
  'calendar': Calendar,
  'heart': Heart,
  'leaf': Leaf,
  'dollar-sign': DollarSign,
  'phone': Phone,
} as const;

type IconName = keyof typeof iconMap;

export default function DynamicWhyChooseUs() {
  const { data: content, isLoading } = useWhyChooseUsContent();

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback content if no data
  const fallbackContent = [
    {
      id: '1',
      section_key: 'why-choose-us',
      title: 'Why Choose Shalean Services?',
      description: 'We provide reliable, professional cleaning services with a focus on quality and customer satisfaction.',
      order_index: 0,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '2',
      section_key: 'why-choose-us',
      title: 'Professional Cleaners',
      description: 'All our cleaners are vetted, insured, and trained to deliver exceptional results.',
      icon_name: 'shield-check',
      order_index: 1,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '3',
      section_key: 'why-choose-us',
      title: 'Flexible Scheduling',
      description: 'Book cleaning services that fit your schedule, from one-time cleans to regular maintenance.',
      icon_name: 'calendar',
      order_index: 2,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '4',
      section_key: 'why-choose-us',
      title: '100% Satisfaction',
      description: 'We guarantee your satisfaction with every cleaning service we provide.',
      icon_name: 'heart',
      order_index: 3,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '5',
      section_key: 'why-choose-us',
      title: 'Eco-Friendly Products',
      description: 'We use environmentally safe cleaning products that are safe for your family and pets.',
      icon_name: 'leaf',
      order_index: 4,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '6',
      section_key: 'why-choose-us',
      title: 'Transparent Pricing',
      description: 'No hidden fees. Get upfront pricing for all our cleaning services.',
      icon_name: 'dollar-sign',
      order_index: 5,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '7',
      section_key: 'why-choose-us',
      title: '24/7 Support',
      description: 'Our customer support team is available around the clock to help with any questions.',
      icon_name: 'phone',
      order_index: 6,
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  ];

  const displayContent = content && content.length > 0 ? content : fallbackContent;
  const headerContent = displayContent.find(c => c.order_index === 0);
  const features = displayContent.filter(c => c.order_index > 0).sort((a, b) => a.order_index - b.order_index);

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {headerContent?.title || 'Why Choose Shalean Services?'}
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {headerContent?.description || 'We provide reliable, professional cleaning services with a focus on quality and customer satisfaction.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const IconComponent = feature.icon_name && feature.icon_name in iconMap 
              ? iconMap[feature.icon_name as IconName] 
              : null;

            return (
              <motion.div
                key={feature.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
              >
                {IconComponent && (
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
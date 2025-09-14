"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { useTeamMembers } from "@/hooks/useHomepageData";

export default function DynamicTeamGrid() {
  const { data: teamMembers, isLoading } = useTeamMembers();

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-32 w-32 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback team data
  const fallbackTeamMembers = [
    {
      id: '1',
      email: 'sarah.johnson@shalean.com',
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'ADMIN',
      avatar_url: '/images/placeholder.png',
      created_at: '',
      updated_at: ''
    },
    {
      id: '2',
      email: 'mike.chen@shalean.com',
      first_name: 'Mike',
      last_name: 'Chen',
      role: 'ADMIN',
      avatar_url: '/images/placeholder.png',
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '3',
      email: 'emma.davis@shalean.com',
      first_name: 'Emma',
      last_name: 'Davis',
      role: 'ADMIN',
      avatar_url: '/images/placeholder.png',
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '4',
      email: 'david.wilson@shalean.com',
      first_name: 'David',
      last_name: 'Wilson',
      role: 'ADMIN',
      avatar_url: '/images/placeholder.png',
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  ];

  const displayTeamMembers = teamMembers && teamMembers.length > 0 ? teamMembers : fallbackTeamMembers;

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Meet Our Team
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Our dedicated team of professionals is committed to providing exceptional cleaning services and customer support.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayTeamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={member.avatar_url || '/images/placeholder.png'}
                  alt={`${member.first_name} ${member.last_name}`}
                  fill
                  className="rounded-full object-cover"
                  sizes="(max-width: 768px) 128px, 128px"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-gray-600 capitalize">
                {member.role.toLowerCase()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


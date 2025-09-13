"use client";

import { motion } from 'framer-motion'
import { Calendar, User } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateYMD } from '@/lib/dates'

const blogPosts = [
  {
    title: 'A quick guide on removing red wine stains',
    excerpt: 'Learn the best techniques to remove stubborn red wine stains from carpets, upholstery, and clothing.',
    date: '2024-01-15',
    author: 'Sarah Johnson',
    image: 'Wine',
    category: 'Cleaning Tips',
  },
  {
    title: 'Best pet-friendly cleaner experiences in Johannesburg',
    excerpt: 'Discover the top-rated cleaning services that specialize in pet-friendly homes and pet hair removal.',
    date: '2024-01-10',
    author: 'Maria Santos',
    image: 'Pet',
    category: 'Local Guide',
  },
  {
    title: 'Best of Cape Town hiking trails',
    excerpt: 'Explore Cape Town&apos;s most beautiful hiking trails and outdoor adventures for nature lovers.',
    date: '2024-01-05',
    author: 'Grace Mthembu',
    image: 'Hike',
    category: 'Lifestyle',
  },
]

export default function ExploreBlog() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore our blog
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and insights to help you maintain a clean, organized home.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-600">{post.image}</span>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    <Link href="/blog">{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateYMD(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all articles
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
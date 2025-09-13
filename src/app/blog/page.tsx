import { ChevronRight, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Blog',
  description: 'Tips, guides, and insights for maintaining a clean, comfortable home from the Shalean Cleaning Services team.',
}

export default function BlogPage() {
  const blogPosts = [
    {
      title: 'A quick guide on removing red wine stains',
      excerpt: 'Learn the most effective methods for removing red wine stains from various fabrics and surfaces.',
      date: '2024-01-15',
      category: 'Cleaning Tips',
      image: 'Image',
    },
    {
      title: 'Best pet-friendly cleaner experiences in Johannesburg',
      excerpt: 'Discover the top-rated cleaning services in Johannesburg that specialize in pet-friendly solutions.',
      date: '2024-01-10',
      category: 'Local Services',
      image: 'Image',
    },
    {
      title: 'Best of Cape Town hiking trails',
      excerpt: 'Explore the most beautiful hiking trails in Cape Town and how to keep your gear clean after outdoor adventures.',
      date: '2024-01-05',
      category: 'Lifestyle',
      image: 'Image',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Blog</span>
      </nav>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Blog</h1>
        
        <div className="text-xl text-gray-600 mb-12">
          Tips, guides, and insights for maintaining a clean, comfortable home.
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">{post.image}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <Tag className="h-4 w-4 ml-2" />
                  <span>{post.category}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <Link 
                  href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Get the latest cleaning tips and home care insights delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
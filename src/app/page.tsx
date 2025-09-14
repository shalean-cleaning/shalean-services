import { format } from "date-fns";
import { 
  Sparkles, 
  Home as HomeIcon, 
  Shirt, 
  Baby, 
  Heart, 
  Truck, 
  Calendar,
  Shield,
  Leaf,
  ArrowRight,
  Star
} from 'lucide-react'
import Image from "next/image";
import Link from "next/link";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hero, services, features, safety, partners, team, serviceIconMap } from '@/content/home'
import Reveal from '@/components/anim/Reveal'
import { fadeUp, pop, stagger } from '@/components/anim/variants'
import ServiceIconTile from '@/components/ui/ServiceIconTile'
import * as L from 'lucide-react'

export const dynamic = "force-static";

// Icon mapping for features
const featureIconMap = {
  'Bookings': Calendar,
  'Placements': Shield,
  'MyHome Hub': HomeIcon,
};

// Blog card images fallback
const blogCardImages = ['/images/card1.svg', '/images/card2.svg', '/images/card3.svg'];

export default async function Home() {
  // ISR fetch for Blog only
  const base = (process.env.NEXT_PUBLIC_CONTENT_ORIGIN ?? "").replace(/\/+$/, "");
  const res = await fetch(`${base}/api/blog/recent?limit=3`, { next: { revalidate: 600 } });
  const blog = res.ok ? await res.json() : { posts: [] };

  return (
    <main id="main" className="flex flex-col">
      {/* Hero Section */}
      <Reveal variants={fadeUp}>
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {hero.title}
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                {hero.subtitle}
              </p>

              {/* Service Icons Grid */}
              <Reveal variants={stagger}>
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {services.map((service) => {
                    const map = serviceIconMap[service.label as keyof typeof serviceIconMap];
                    const Icon = (map && (L as any)[map.icon]) || L.Square; // safe fallback
                    return (
                      <Reveal key={service.label} variants={pop}>
                        <ServiceIconTile
                          icon={Icon}
                          label={service.label}
                          href={service.href}
                          fg={map?.fg}
                          bg={map?.bg}
                          ring={map?.ring}
                        />
                      </Reveal>
                    );
                  })}
                </div>
              </Reveal>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {hero.ctas.map((cta) => (
                  <Reveal key={cta.label} variants={pop}>
                    <Button size="lg" asChild className="text-lg px-8 py-3" variant={cta.variant as "default" | "ghost" | "link" | "outline" | "destructive" | "secondary"}>
                      <Link href={cta.href}>
                        {cta.label}
                      </Link>
                    </Button>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Features Section */}
      <Reveal variants={fadeUp}>
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Us
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide comprehensive home services with trusted professionals and reliable support.
              </p>
            </div>

            <Reveal variants={stagger}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature) => {
                  const IconComponent = featureIconMap[feature.title as keyof typeof featureIconMap] || Calendar;
                  
                  return (
                    <Reveal key={feature.title} variants={pop}>
                      <Card className="h-full hover:shadow-lg transition-shadow will-change-transform">
                        <CardHeader className="text-center">
                          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <IconComponent className="h-8 w-8 text-blue-600" />
                          </div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-center text-base">
                            {feature.text}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>

      {/* Team Section */}
      <Reveal variants={fadeUp}>
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our dedicated team of professionals is committed to providing exceptional cleaning services and customer support.
              </p>
            </div>

            <Reveal variants={stagger}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((member) => (
                  <Reveal key={member.name} variants={pop}>
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <Image
                          src={member.img}
                          alt={member.name}
                          fill
                          className="rounded-full object-cover will-change-transform"
                          sizes="(max-width: 768px) 128px, 128px"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-gray-600 capitalize">
                        {member.role.toLowerCase()}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>

      {/* Partners Section */}
      <Reveal variants={fadeUp}>
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">
              Trusted by leading platforms
            </h2>
            <Reveal variants={stagger}>
              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
                {partners.map((partner, index) => (
                  <Reveal key={index} variants={fadeUp}>
                    <span className="text-gray-500 text-2xl font-semibold">
                      {partner}
                    </span>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>

      {/* Blog Section - Only render if posts exist */}
      {Array.isArray(blog.posts) && blog.posts.length > 0 && (
        <Reveal variants={fadeUp}>
          <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Latest from Our Blog
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                  Stay updated with cleaning tips, industry insights, and home maintenance advice from our experts.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Posts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <Reveal variants={stagger}>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {blog.posts.map((post: { id: string; title: string; slug: string; excerpt: string; featured_image?: string; published_at: string }, i: number) => (
                    <Reveal key={post.id} variants={pop}>
                      <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow will-change-transform">
                        {/* Featured Image */}
                        <div className="relative h-48 w-full">
                          <Image
                            src={post.featured_image || blogCardImages[i % blogCardImages.length]}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                            </div>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              Read More
                            </Link>
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        </Reveal>
      )}

      {/* Safety & Trust Section */}
      <Reveal variants={fadeUp}>
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Your safety and trust matter
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We take security seriously. Every cleaner in our network is thoroughly vetted and verified.
              </p>
            </div>

            <Reveal variants={stagger}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {safety.map((feature) => (
                  <Reveal key={feature.title} variants={pop}>
                    <div className="text-center">
                      <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Shield className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
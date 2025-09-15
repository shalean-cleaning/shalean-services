import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

type ServiceCardProps = {
  name: string
  slug: string
  description: string
  icon?: React.ReactNode
  price?: string
}

export function ServiceCard({ name, slug, description, icon, price }: ServiceCardProps) {
  return (
    <Link
      href={`/booking/service/${slug}`}
      aria-label={`Book ${name}`}
      className={cn(
        "group rounded-2xl border p-4 hover:shadow-md transition",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2 bg-primary/5">{icon ?? <Sparkles />}</div>
        <div>
          <div className="font-medium">{name}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {price && <p className="text-xs text-green-600 font-medium">{price}</p>}
        </div>
      </div>
    </Link>
  )
}

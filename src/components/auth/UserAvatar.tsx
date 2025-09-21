'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { User, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase-client'
import { UserProfile } from '@/hooks/useAuth'

interface UserAvatarProps {
  profile: UserProfile
}

export function UserAvatar({ profile }: UserAvatarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      // Preserve current page context - don't break booking flow
      // If user is on a booking page, stay on current page
      // Otherwise redirect to homepage
      if (pathname.startsWith('/booking/')) {
        router.refresh()
        // Stay on current page - user will see login/signup buttons
      } else {
        router.push('/')
        router.refresh()
      }
    }
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    switch (profile.role) {
      case 'CLEANER':
        return '/dashboard/cleaner'
      case 'ADMIN':
        return '/admin'
      case 'CUSTOMER':
      default:
        return '/account'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={fullName}
            />
            <AvatarFallback className="bg-blue-600 text-white font-medium">
              {getInitials(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getDashboardRoute()} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

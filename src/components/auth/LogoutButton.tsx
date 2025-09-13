'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-client'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function LogoutButton({ variant = 'outline', size = 'default', className }: LogoutButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button 
      onClick={handleLogout} 
      variant={variant} 
      size={size}
      className={className}
    >
      Sign Out
    </Button>
  )
}

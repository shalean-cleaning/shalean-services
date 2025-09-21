import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateReturnTo } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const returnTo = searchParams.get('returnTo')
  
  // Validate returnTo to prevent open redirects
  const validatedReturnTo = validateReturnTo(returnTo)

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the validated return URL with booking context check header
      const response = NextResponse.redirect(`${origin}${validatedReturnTo}`)
      response.headers.set('X-Booking-Context-Check', 'true')
      return response
    }
  }

  // If there's an error or no code, redirect to login with returnTo
  return NextResponse.redirect(`${origin}/auth/login?returnTo=${encodeURIComponent(validatedReturnTo)}`)
}

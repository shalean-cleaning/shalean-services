import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateReturnTo, getAndClearBookingContext } from '@/lib/utils'

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
      // Check for booking context first
      const bookingContext = getAndClearBookingContext()
      const redirectTo = bookingContext ? bookingContext.returnPath : validatedReturnTo
      
      // Create a response with the redirect
      const response = NextResponse.redirect(`${origin}${redirectTo}`)
      
      // Add a script to check for booking context on the client side
      // This handles the case where we need to restore booking context after auth
      response.headers.set('X-Booking-Context-Check', 'true')
      
      return response
    }
  }

  // If there's an error or no code, redirect to login with returnTo
  return NextResponse.redirect(`${origin}/auth/login?returnTo=${encodeURIComponent(validatedReturnTo)}`)
}

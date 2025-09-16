import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { buildReturnToUrl } from '@/lib/utils'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      const returnTo = buildReturnToUrl(request.nextUrl.pathname, request.nextUrl.searchParams)
      url.searchParams.set('returnTo', returnTo)
      return NextResponse.redirect(url)
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      // Redirect to unauthorized page if not admin
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Protect booking routes (except initial service selection)
  if (request.nextUrl.pathname.startsWith('/booking/') && 
      !request.nextUrl.pathname.startsWith('/booking/service/') &&
      request.nextUrl.pathname !== '/booking') {
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      const returnTo = buildReturnToUrl(request.nextUrl.pathname, request.nextUrl.searchParams)
      url.searchParams.set('returnTo', returnTo)
      return NextResponse.redirect(url)
    }
  }

  // Protect cleaner routes
  if (request.nextUrl.pathname.startsWith('/cleaner')) {
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      const returnTo = buildReturnToUrl(request.nextUrl.pathname, request.nextUrl.searchParams)
      url.searchParams.set('returnTo', returnTo)
      return NextResponse.redirect(url)
    }

    // Check if user is cleaner or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'CLEANER' && profile?.role !== 'ADMIN') {
      // Redirect to unauthorized page if not cleaner or admin
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

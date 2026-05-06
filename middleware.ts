import { NextRequest, NextResponse } from 'next/server'
import { getCookieFromRequest, verifySession } from '@/lib/auth'

// Routes that do NOT require auth
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Verify session
  const token = getCookieFromRequest(req)
  const session = token ? await verifySession(token) : null

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based route guards
  if (pathname.startsWith('/super-admin') && session.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/admin') && session.role !== 'center_admin') {
    if (session.role === 'super_admin') {
      return NextResponse.redirect(new URL('/super-admin', req.url))
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/member') && session.role !== 'member') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect cron routes — only Vercel internal calls
  if (pathname.startsWith('/api/cron')) {
    const cronSecret = req.headers.get('authorization')
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

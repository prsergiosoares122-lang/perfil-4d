import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = request.nextUrl.clone()

  // Redireciona /admin para /dashboard/admin
  if (url.pathname === '/admin') {
    url.pathname = '/dashboard/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/dashboard/:path*'],
}

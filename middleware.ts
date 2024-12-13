import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.get('auth')
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)']
} 
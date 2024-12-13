import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  console.log('Middleware called for:', req.nextUrl.pathname)
  console.log('Auth cookie:', req.cookies.get('auth'))
  
  const auth = req.cookies.get('auth')
  const isLoginPage = req.nextUrl.pathname === '/login'
  
  if (!auth && !isLoginPage) {
    console.log('Redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  if (auth && isLoginPage) {
    console.log('Redirecting to home')
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login'
  ]
} 

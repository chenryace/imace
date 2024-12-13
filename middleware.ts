import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.cookies.get('auth')
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')
  
  // 不拦截 API 路由
  if (isApiRoute) {
    return NextResponse.next()
  }

  // 未登录且不是登录页面，重定向到登录页
  if (!auth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // 已登录且在登录页面，重定向到首页
  if (auth && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * /api (API routes)
     * /_next (Next.js files)
     * /static (public files)
     * /favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

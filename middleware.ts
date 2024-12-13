import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // 调试日志
  console.log('Middleware path:', req.nextUrl.pathname)
  
  const auth = req.cookies.get('auth')
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')
  
  // API 路由直接放行
  if (isApiRoute) {
    console.log('API route detected, passing through')
    return NextResponse.next()
  }

  // 未登录且不是登录页面，重定向到登录页
  if (!auth && !isLoginPage) {
    console.log('Unauthorized, redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // 已登录且在登录页面，重定向到首页
  if (auth && isLoginPage) {
    console.log('Already logged in, redirecting to home')
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // 排除静态资源和 _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 

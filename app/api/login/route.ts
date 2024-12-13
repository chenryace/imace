import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    if (password === process.env.ACCESS_PASSWORD) {
      // 设置登录 cookie
      cookies().set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24小时
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { message: '密码错误' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    )
  }
} 
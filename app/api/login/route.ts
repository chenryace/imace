import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    if (data.password === process.env.ACCESS_PASSWORD) {
      cookies().set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json(
      { success: false, message: '密码错误' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

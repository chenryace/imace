import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  console.log('API route hit: /api/login')
  
  try {
    const data = await req.json()
    console.log('Request data:', data)
    
    if (!process.env.ACCESS_PASSWORD) {
      console.error('ACCESS_PASSWORD not set')
      return NextResponse.json(
        { success: false, message: '服务器配置错误' },
        { status: 500 }
      )
    }
    
    if (data.password === process.env.ACCESS_PASSWORD) {
      console.log('Password matched')
      cookies().set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })
      
      return NextResponse.json({ success: true })
    }
    
    console.log('Password mismatch')
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

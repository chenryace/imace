import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    console.log('Received password attempt')
    
    if (!process.env.ACCESS_PASSWORD) {
      console.error('ACCESS_PASSWORD not set')
      return NextResponse.json({ 
        success: false,
        error: '服务器配置错误' 
      }, { status: 500 })
    }

    if (password === process.env.ACCESS_PASSWORD) {
      console.log('Login successful')
      
      // 设置认证 cookie
      cookies().set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24小时
      })
      
      return NextResponse.json({ 
        success: true,
        redirect: '/' 
      })
    }

    console.log('Invalid password')
    return NextResponse.json({ 
      success: false,
      error: '密码错误' 
    }, { status: 401 })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      success: false,
      error: '服务器错误' 
    }, { status: 500 })
  }
}

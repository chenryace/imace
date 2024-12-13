import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  console.log('Login API called')
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    ACCESS_PASSWORD_EXISTS: !!process.env.ACCESS_PASSWORD,
  })
  
  try {
    const data = await req.json()
    const receivedPassword = data.password
    const expectedPassword = process.env.ACCESS_PASSWORD || '123321'
    
    console.log('Password verification:', {
      receivedLength: receivedPassword?.length,
      expectedLength: expectedPassword?.length,
      isMatch: receivedPassword === expectedPassword
    })
    
    if (receivedPassword === expectedPassword) {
      console.log('Password correct, setting cookie')
      
      // 创建响应对象
      const response = NextResponse.json({ 
        success: true,
        message: '登录成功'
      })
      
      // 在响应对象上设置 cookie
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      })
      
      console.log('Cookie set successfully')
      return response
    }
    
    console.log('Password incorrect')
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

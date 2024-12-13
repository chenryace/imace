import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  console.log('Login API called')
  
  try {
    const data = await req.json()
    console.log('Received password:', data.password)
    console.log('Expected password:', process.env.ACCESS_PASSWORD)
    console.log('Password match:', data.password === process.env.ACCESS_PASSWORD)
    
    if (data.password === process.env.ACCESS_PASSWORD) {
      console.log('Setting auth cookie')
      cookies().set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
      })
      
      return NextResponse.json({ 
        success: true,
        debug: process.env.NODE_ENV === 'development' ? {
          cookieSet: true
        } : undefined
      })
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

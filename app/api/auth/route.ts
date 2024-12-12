import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === process.env.ACCESS_PASSWORD) {
      // 登录成功
      return NextResponse.json({ 
        success: true,
        redirect: '/' 
      })
    }

    // 密码错误
    return NextResponse.json({ 
      success: false,
      error: '密码错误' 
    }, { status: 401 })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: '服务器错误' 
    }, { status: 500 })
  }
} 

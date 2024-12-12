import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    console.log('Received password attempt') // 调试日志
    
    // 检查环境变量是否存在
    if (!process.env.ACCESS_PASSWORD) {
      console.error('ACCESS_PASSWORD not set') // 调试日志
      return NextResponse.json({ 
        success: false,
        error: '服务器配置错误' 
      }, { status: 500 })
    }

    if (password === process.env.ACCESS_PASSWORD) {
      console.log('Login successful') // 调试日志
      return NextResponse.json({ 
        success: true,
        redirect: '/' 
      })
    }

    console.log('Invalid password') // 调试日志
    return NextResponse.json({ 
      success: false,
      error: '密码错误' 
    }, { status: 401 })

  } catch (error) {
    console.error('Server error:', error) // 调试日志
    return NextResponse.json({ 
      success: false,
      error: '服务器错误' 
    }, { status: 500 })
  }
}

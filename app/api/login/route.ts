import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const data = await req.json()
  
  if (data.password === process.env.ACCESS_PASSWORD) {
    cookies().set('auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    })
    
    return new NextResponse('OK')
  }
  
  return new NextResponse('Unauthorized', { status: 401 })
}

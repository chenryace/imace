'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 背景图片 URL，可以通过环境变量配置
  const bgImage = process.env.NEXT_PUBLIC_LOGIN_BG || '/default-bg.jpg'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    console.log('Login attempt started')
    
    if (!password) {
      setError('请输入密码')
      return
    }

    setError('')
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok && data?.success) {
        window.location.href = '/home'
        return
      } else {
        setError(data?.message || '密码错误')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登录失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* 背景图片 */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* 暗色遮罩 */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 登录框 */}
      <div className="relative z-10 bg-gray-900/80 backdrop-blur-sm p-8 rounded-lg shadow-xl w-96 border border-gray-700">
        <h1 className="text-3xl font-bold text-yellow-500 mb-8 text-center">图床登录</h1>
        {error && (
          <div className="mb-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
            className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 
                     focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                     placeholder-gray-500 transition-all"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button 
            type="submit" 
            className={`w-full p-3 rounded font-medium transition-colors
              ${isLoading 
                ? 'bg-yellow-600 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600'
              }`}
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 默认壁纸 URL，你可以替换为自己的默认壁纸
const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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

  // 使用环境变量中的壁纸 URL，如果没有则使用默认壁纸
  const wallpaperUrl = process.env.NEXT_PUBLIC_LOGIN_WALLPAPER || DEFAULT_WALLPAPER

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${wallpaperUrl})` 
      }}
    >
      <div className="w-full max-w-md p-8 backdrop-blur-sm bg-black/30 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">图床登录</h1>
          {error && (
            <p className="mt-4 text-red-400">{error}</p>
          )}
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-yellow-500 focus:border-transparent transition-all"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-3 rounded-lg font-medium transition-colors
              ${isLoading 
                ? 'bg-yellow-600 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-600'
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

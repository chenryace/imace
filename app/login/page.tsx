'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 背景图片URL，可以在这里修改
const BG_IMAGE = '/default-bg.jpg'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      {/* 背景图片 */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BG_IMAGE}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* 登录卡片 */}
      <div className="relative z-10 w-[22rem] space-y-6">
        {/* Logo/标题区域 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">图床登录</h1>
        </div>

        {/* 登录表单卡片 */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-2 rounded text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400 text-sm"
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium
                       ${isLoading 
                         ? 'bg-blue-400 cursor-not-allowed' 
                         : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                       } transition-colors duration-200`}
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

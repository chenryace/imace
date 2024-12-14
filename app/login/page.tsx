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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative">
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
      
      {/* 外层半透明框 */}
      <div className="relative z-10 bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        {/* 登录模块 */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
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
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 
                       focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                       placeholder-gray-400"
              disabled={isLoading}
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
    </div>
  )
}

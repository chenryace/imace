'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
      
      {/* 主容器 */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* 登录卡片 */}
        <div className="w-full max-w-md">
          <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl overflow-hidden">
            {/* 卡片顶部装饰 */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="p-8">
              {/* 标题区域 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  图床服务
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  安全可靠的图片存储与分享服务
                </p>
              </div>

              {/* 登录表单 */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入访问密码"
                    required
                    autoComplete="new-password"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-lg
                             text-white placeholder-gray-500
                             focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50
                             transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`relative w-full h-11 rounded-lg font-medium transition-all duration-200 
                    ${isLoading
                      ? 'bg-blue-500/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 active:from-blue-700 active:to-emerald-700'
                    }
                    text-white shadow-lg shadow-blue-500/25 overflow-hidden group`}
                >
                  <div className="relative z-10">
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        登录中...
                      </span>
                    ) : '登录'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </form>
            </div>
          </div>

          {/* 页脚信息 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 图床服务. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

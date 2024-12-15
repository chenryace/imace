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
    <div className="fixed inset-0 bg-blue-500 flex items-center justify-center">
      {/* 主容器 - 添加边框以便调试 */}
      <div className="w-full max-w-md mx-auto px-6 flex flex-col items-center justify-center border-2 border-white">
        {/* 登录卡片 */}
        <div className="w-full backdrop-blur-2xl bg-white/[0.05] rounded-2xl p-8 shadow-2xl border border-white/[0.05]">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              图床服务
            </h1>
            <p className="text-gray-200 mt-2 text-sm">
              安全可靠的图片存储与分享服务
            </p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入访问密码"
                required
                className="w-full px-4 h-11 bg-white/[0.1] border border-white/[0.2] rounded-lg
                         text-white placeholder-gray-300
                         focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent
                         transition-all duration-200"
                disabled={isLoading}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 rounded-lg font-medium transition-all duration-200
                ${isLoading
                  ? 'bg-white/30 cursor-not-allowed'
                  : 'bg-white hover:bg-white/90 active:bg-white/75 text-blue-500'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </span>
              ) : '登录'}
            </button>
          </form>
        </div>

        {/* 页脚信息 */}
        <div className="mt-8 text-center text-sm text-white/70">
          <p>© 2024 图床服务. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

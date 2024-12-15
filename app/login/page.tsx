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
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
      `}</style>
      
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
      }}>
        {/* 主容器 */}
        <div className="w-full max-w-md mx-auto px-6 text-left">
          {/* 外层半透明卡片 */}
          <div className="bg-white bg-opacity-10 rounded-3xl p-8 shadow-2xl backdrop-blur-lg">
            {/* 内层白色卡片 */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 shadow-inner border border-white border-opacity-10 backdrop-blur-lg">
              {/* 标题区域 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white">
                  图床服务
                </h1>
                <p className="text-white text-opacity-80 mt-2 text-sm">
                  安全可靠的图片存储与分享服务
                </p>
              </div>

              {/* 登录表单 */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white text-opacity-90 mb-1.5">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入访问密码"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 h-11 bg-black bg-opacity-10 border border-white border-opacity-10 rounded-lg
                             text-white placeholder-white placeholder-opacity-40
                             focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-25 focus:border-transparent
                             transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-lg">
                    <p className="text-red-200 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-11 rounded-lg font-medium transition-all duration-200
                    ${isLoading
                      ? 'bg-white bg-opacity-30 cursor-not-allowed'
                      : 'bg-white hover:bg-opacity-90 active:bg-opacity-75 text-blue-600'
                    }
                    shadow-lg shadow-blue-500/20`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      登录中...
                    </span>
                  ) : '登录'}
                </button>
              </form>
            </div>
          </div>

          {/* 页脚信息 */}
          <div className="mt-8 text-center text-sm text-white text-opacity-80">
            <p>© 2024 图床服务. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
} 

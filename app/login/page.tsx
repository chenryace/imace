'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      // 修改 API 路径从 /api/auth 到 /api/login
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('密码错误')
      }
    } catch {
      setError('登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl text-white mb-6 text-center">图床登录</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={login}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

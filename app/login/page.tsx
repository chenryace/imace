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
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        router.push('/')
      } else {
        setError('密码错误')
      }
    } catch {
      setError('登录失败')
    }
  }

  return (
    <form onSubmit={login} className="p-4">
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="ml-2 p-2 bg-blue-500 text-white">
        登录
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}

export default LoginPage

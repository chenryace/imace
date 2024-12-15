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
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          padding: 1.5rem;
        }
        .card {
          width: 100%;
          max-width: 28rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border-radius: 1rem;
          padding: 2rem;
        }
        .title {
          text-align: center;
          color: white;
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }
        .label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .input {
          width: 100%;
          height: 2.75rem;
          padding: 0 1rem;
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          margin-bottom: 1rem;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        .error-text {
          color: rgb(254, 202, 202);
          font-size: 0.875rem;
          text-align: center;
        }
        .button {
          width: 100%;
          height: 2.75rem;
          border-radius: 0.5rem;
          font-weight: 500;
          background: white;
          color: #2563EB;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .button:hover {
          opacity: 0.9;
        }
        .button:disabled {
          background: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }
        .footer {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          margin-top: 2rem;
        }
      `}</style>

      <div className="container">
        <div>
          <div className="card">
            <h1 className="title">图床服务</h1>
            <p className="subtitle">安全可靠的图片存储与分享服务</p>

            <form onSubmit={handleLogin}>
              <label className="label">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入访问密码"
                required
                className="input"
                disabled={isLoading}
              />

              {error && (
                <div className="error">
                  <p className="error-text">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="button"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>
          </div>

          <div className="footer">
            © 2024 图床服务. All rights reserved.
          </div>
        </div>
      </div>
    </>
  )
} 

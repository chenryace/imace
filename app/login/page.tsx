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
          background-size: cover;
          background-position: center;
          padding: 1.5rem;
        }
        .card {
          width: 100%;
          max-width: 24rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
        }
        .title {
          color: #000;
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #000;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          opacity: 0.8;
        }
        .label {
          display: block;
          color: #000;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .input {
          width: 100%;
          max-width: 16rem;
          height: 2.75rem;
          padding: 0 1rem;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          color: #000;
          margin: 0 auto 1rem;
        }
        .input::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }
        .input:focus {
          outline: none;
          border-color: rgba(0, 0, 0, 0.2);
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 0 auto 1rem;
          max-width: 16rem;
        }
        .error-text {
          color: rgb(239, 68, 68);
          font-size: 0.875rem;
        }
        .button {
          width: 100%;
          max-width: 16rem;
          height: 2.75rem;
          border-radius: 0.5rem;
          font-weight: 500;
          background: white;
          color: #2563EB;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          margin: 0 auto;
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
          color: #000;
          font-size: 0.875rem;
          margin-top: 2rem;
          opacity: 0.8;
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

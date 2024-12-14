// ... existing code ...
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
    <div className="min-h-screen flex items-center justify-center relative">
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
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="bg-white/[0.7] backdrop-blur-lg rounded-xl p-6 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">图床登录</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-600"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="mt-2 text-center">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-white
                ${isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
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

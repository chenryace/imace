const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const password = formData.get('password')

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        router.push(data.redirect)
      } else {
        setError(data.error || '登录失败')
        console.error('Login failed:', data)  // 添加错误日志
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登录过程出错，请重试')
    } finally {
      setIsLoading(false)
    }
  }

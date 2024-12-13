async function login(e: React.FormEvent) {
  e.preventDefault()
  console.log('Form submitted') // 添加这行来确认表单提交
  
  try {
    console.log('Sending request with password:', password.length + ' characters')
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('Response received:', {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText
    })

    const data = await res.json()
    console.log('Response data:', data)

    if (res.ok && data?.success) {
      console.log('Login successful, redirecting...')
      router.push('/')
      router.refresh()
    } else {
      console.log('Login failed:', data)
      setError(data?.message || '密码错误')
    }
  } catch (err) {
    console.error('Login error:', err)
    setError('登录失败')
  }
}

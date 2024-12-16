'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 可自定义的标题
const SITE_TITLE = '图床服务'

interface PreviewFile extends File {
  preview: string;
  url?: string;
  markdown?: string;
}

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([])
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 从 localStorage 读取主题设置
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      return saved === 'dark'
    }
    return false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 监听主题变化并保存到 localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 9) {
      alert('一次最多上传9张图片')
      return
    }
    await handleFiles(files)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 9) {
      alert('一次最多上传9张图片')
      return
    }
    await handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const previewFiles = imageFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))
    setSelectedFiles(previewFiles)
    
    // 自动上传
    await handleUpload(previewFiles)
  }

  const handleUpload = async (files: PreviewFile[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('上传失败')
      }

      const data = await res.json()
      
      // 更新预览文件的URL信息
      const updatedFiles = files.map((file, index) => ({
        ...file,
        url: data.files[index].url,
        markdown: data.files[index].markdown
      }))
      
      setSelectedFiles(updatedFiles)
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
      `}</style>
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          padding: 1rem;
        }
        .header {
          background: ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
          padding: 1rem;
          margin-bottom: 2rem;
          border-radius: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(8px);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: ${isDarkMode ? '#FFD700' : '#3B82F6'};
          margin: 0;
        }
        .header-buttons {
          display: flex;
          gap: 1rem;
        }
        .header-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          font-weight: bold;
          cursor: pointer;
          background: transparent;
          color: ${isDarkMode ? '#fff' : '#000'};
          transition: all 0.2s;
        }
        .header-button:hover {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }
        .active-button {
          color: ${isDarkMode ? '#FFD700' : '#3B82F6'};
        }
        .theme-switch {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          background: ${isDarkMode ? '#374151' : '#E5E7EB'};
          color: inherit;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1rem;
          transition: all 0.2s;
        }
        .theme-switch:hover {
          background: ${isDarkMode ? '#4B5563' : '#D1D5DB'};
        }
        .main {
          max-width: 48rem;
          margin: 0 auto;
        }
        .upload-area {
          background: ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          backdrop-filter: blur(8px);
        }
        .drop-zone {
          border: 2px dashed ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 0.5rem;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .drop-zone.active {
          border-color: ${isDarkMode ? '#FFD700' : '#3B82F6'};
          background: ${isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
        }
        .preview-area {
          background: ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
          border-radius: 1rem;
          padding: 2rem;
          min-height: 24rem;
          backdrop-filter: blur(8px);
        }
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .preview-item {
          aspect-ratio: 1;
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          background: ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
        }
        .preview-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.5rem;
          background: ${isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
          font-size: 0.75rem;
          color: ${isDarkMode ? '#fff' : '#000'};
        }
        .preview-url {
          word-break: break-all;
          margin-bottom: 0.25rem;
        }
        .text {
          color: ${isDarkMode ? '#fff' : '#000'};
          margin: 0;
        }
      `}</style>

      <div className="container">
        <header className="header">
          <div className="header-left">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
            />
            <h1 className="header-title">{SITE_TITLE}</h1>
          </div>
          
          <div className="header-buttons">
            <button className="header-button active-button">
              上传图片
            </button>
            <button 
              className="header-button"
              onClick={() => router.push('/manage')}
            >
              图片管理
            </button>
            <button
              className="header-button"
              onClick={() => {
                fetch('/api/logout', { method: 'POST' })
                  .then(() => window.location.href = '/login')
              }}
            >
              退出登录
            </button>
            <button 
              className="theme-switch"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="切换主题"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        <main className="main">
          <div className="upload-area">
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text">
                {isUploading ? '上传中...' : '点击或拖拽图片到这里上传'}
              </p>
              <p className="text" style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                支持 JPG、PNG、GIF 等图片格式，单次最多9张
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="preview-area">
            <div className="preview-grid">
              {selectedFiles.map((file, index) => (
                <div key={index} className="preview-item">
                  <Image
                    src={file.preview}
                    alt={file.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {file.url && (
                    <div className="preview-info">
                      <div className="preview-url">直链：{file.url}</div>
                      <div className="preview-url">Markdown：{file.markdown}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

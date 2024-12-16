'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 定义上传文件的类型
interface UploadFile extends File {
  preview: string
}

// 定义上传响应的类型
interface UploadResponse {
  success: boolean
  files?: Array<{
    url: string
    markdown: string
    originalName: string
  }>
  message?: string
}

export default function HomePage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理拖拽事件
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  // 处理文件拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  // 处理文件处理
  const processFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))
    const processedFiles = imageFiles.map(file => {
      const preview = URL.createObjectURL(file)
      return Object.assign(file, { preview })
    })
    setFiles(prev => [...prev, ...processedFiles])
  }

  // 移除文件
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // 处理文件上传
  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result: UploadResponse = await response.json()

      if (result.success && result.files) {
        // 上传成功，清空文件列表
        files.forEach(file => URL.revokeObjectURL(file.preview))
        setFiles([])
        alert('上传成功！')
      } else {
        throw new Error(result.message || '上传失败')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })
      window.location.href = '/login'
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-yellow-500">图床</h1>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/manage')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              图片管理
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              退出登录
            </button>
          </div>
        </header>

        <main className="space-y-8">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl mb-6 text-yellow-500">上传图片</h2>
            
            {/* 拖放区域 */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${dragActive
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-gray-600 hover:border-gray-500'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                className="hidden"
              />
              <p className="text-gray-400 mb-2">
                {isUploading ? '上传中...' : '点击或拖拽图片到这里'}
              </p>
              <p className="text-gray-500 text-sm">
                支持 JPG、PNG、GIF 等图片格式
              </p>
            </div>

            {/* 预览区域 */}
            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg mb-4 text-yellow-500">
                  已选择 {files.length} 张图片
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-700">
                        <Image
                          src={file.preview}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* 上传按钮 */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors
                      ${isUploading
                        ? 'bg-yellow-600 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600'
                      }`}
                  >
                    {isUploading ? '上传中...' : '确认上传'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 

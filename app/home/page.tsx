'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './home.module.css'

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
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>图床</h1>
          <div className={styles.buttonGroup}>
            <button
              onClick={() => router.push('/manage')}
              className={styles.manageButton}
            >
              图片管理
            </button>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              退出登录
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>上传图片</h2>
            
            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
              />
              <p className={styles.dropzoneText}>
                {isUploading ? '上传中...' : '点击或拖拽图片到这里'}
              </p>
              <p className={styles.dropzoneSubtext}>
                支持 JPG、PNG、GIF 等图片格式
              </p>
            </div>

            {files.length > 0 && (
              <div className={styles.previewSection}>
                <h3 className={styles.previewTitle}>
                  已选择 {files.length} 张图片
                </h3>
                <div className={styles.previewGrid}>
                  {files.map((file, index) => (
                    <div key={index} className={styles.previewItem}>
                      <div className={styles.previewImageWrapper}>
                        <Image
                          src={file.preview}
                          alt={file.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className={styles.deleteButton}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className={styles.uploadButtonWrapper}>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={styles.uploadButton}
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

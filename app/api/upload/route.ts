import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'

// 创建 S3 客户端
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true // 强制使用路径样式访问
})

// 生成公共访问 URL
function getPublicUrl(fileName: string) {
  const domain = process.env.R2_CUSTOM_DOMAIN || process.env.S3_DOMAIN
  if (!domain) {
    throw new Error('未配置访问域名 (R2_CUSTOM_DOMAIN 或 S3_DOMAIN)')
  }
  return `${domain.replace(/\/$/, '')}/${fileName}`
}

export async function POST(req: Request) {
  console.log('Upload request received')
  
  // 验证登录状态
  const cookieStore = cookies()
  const auth = cookieStore.get('auth')
  if (!auth) {
    console.log('Authentication failed')
    return NextResponse.json(
      { success: false, message: '未登录' },
      { status: 401 }
    )
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files')
    
    console.log('Files received:', files.length)
    
    if (!files || files.length === 0) {
      console.log('No files in request')
      return NextResponse.json(
        { success: false, message: '没有上传文件' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      if (!(file instanceof File)) {
        console.error('Invalid file object:', file)
        continue
      }

      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })

      try {
        // 生成文件名
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const ext = file.name.split('.').pop()
        const fileName = `${timestamp}-${randomStr}.${ext}`

        // 读取文件内容
        const arrayBuffer = await file.arrayBuffer()
        console.log('File content read:', {
          size: arrayBuffer.byteLength,
          fileName
        })

        // 上传到 S3/R2
        const uploadResult = await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: Buffer.from(arrayBuffer),
            ContentType: file.type,
            CacheControl: 'public, max-age=31536000',
            ACL: 'public-read'
          })
        )

        console.log('Upload result:', {
          fileName,
          status: uploadResult.$metadata.httpStatusCode
        })

        // 生成访问 URL
        const url = getPublicUrl(fileName)
        console.log('Generated URL:', url)
        
        // 添加到结果列表
        uploadedFiles.push({
          originalName: file.name,
          fileName,
          url,
          markdown: `![${file.name}](${url})`,
          bbcode: `[img]${url}[/img]`,
          html: `<img src="${url}" alt="${file.name}" />`,
          size: file.size,
          type: file.type,
          uploadTime: new Date().toISOString()
        })
      } catch (uploadError) {
        console.error('Error uploading file:', {
          fileName: file.name,
          error: uploadError instanceof Error ? uploadError.message : uploadError
        })
        continue
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: '所有文件上传失败' },
        { status: 500 }
      )
    }

    console.log('Upload completed successfully:', {
      totalFiles: uploadedFiles.length
    })

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error instanceof Error ? {
      message: error.message,
      name: error.name
    } : error)
    
    return NextResponse.json(
      { success: false, message: '上传失败' },
      { status: 500 }
    )
  }
} 

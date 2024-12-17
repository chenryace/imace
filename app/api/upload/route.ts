import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'

// 检查必要的环境变量
const requiredEnvVars = [
  'S3_REGION',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET_NAME',
  'PUBLIC_DOMAIN',
  'S3_ENDPOINT'
]

// 验证环境变量
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

// 添加详细的配置日志
console.log('Storage Configuration:', {
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET_NAME,
  publicDomain: process.env.PUBLIC_DOMAIN,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
})

// 创建 S3 客户端
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // 某些 S3 兼容服务需要此设置
  // 可选：添加自定义用户代理
  customUserAgent: 'ImageHosting/1.0'
})

// 生成公共访问 URL
function getPublicUrl(fileName: string) {
  // 使用自定义域名
  if (process.env.PUBLIC_DOMAIN) {
    const domain = process.env.PUBLIC_DOMAIN.replace(/\/$/, '')
    return `${domain}/${fileName}`
  }
  
  // 使用标准 S3 URL
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '')
  const bucket = process.env.S3_BUCKET_NAME
  
  // 使用虚拟主机样式 URL（默认）
  if (process.env.S3_FORCE_PATH_STYLE !== 'true') {
    return `https://${bucket}.${endpoint}/${fileName}`
  }
  
  // 使用路径样式 URL
  return `${endpoint}/${bucket}/${fileName}`
}

export async function POST(req: Request) {
  console.log('Upload request received')
  
  try {
    const cookieStore = cookies()
    const auth = cookieStore.get('auth')
    if (!auth) {
      console.log('Authentication failed')
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

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

        // 上传到存储服务
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
          CacheControl: 'public, max-age=31536000',
          ACL: 'public-read',
          // 添加元数据
          Metadata: {
            'original-name': encodeURIComponent(file.name),
            'upload-time': new Date().toISOString()
          }
        })

        console.log('Uploading to storage:', {
          bucket: process.env.S3_BUCKET_NAME,
          key: fileName,
          contentType: file.type,
          fileSize: arrayBuffer.byteLength
        })

        const uploadResult = await s3Client.send(command)
        console.log('Upload result:', uploadResult)

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
          size: arrayBuffer.byteLength,
          type: file.type,
          uploadTime: new Date().toISOString()
        })
      } catch (uploadError) {
        console.error('Error uploading file:', {
          fileName: file.name,
          error: uploadError instanceof Error ? {
            message: uploadError.message,
            stack: uploadError.stack,
            name: uploadError.name
          } : uploadError
        })
        // 不要抛出错误，继续处理其他文件
        continue
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: '所有文件上传失败' },
        { status: 500 }
      )
    }

    console.log('Files uploaded successfully:', uploadedFiles)
    return NextResponse.json({
      success: true,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: '上传失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

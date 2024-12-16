import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'

// 添加详细的配置日志
console.log('S3 Configuration:', {
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET_NAME,
  publicDomain: process.env.PUBLIC_DOMAIN
})

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
})

// 生成公共访问 URL
function getPublicUrl(fileName: string) {
  const publicDomain = (process.env.PUBLIC_DOMAIN || '').replace(/\/$/, '')
  const cleanFileName = fileName.replace(/^\//, '')
  return `${publicDomain}/${cleanFileName}`
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
        console.log('Invalid file object:', file)
        continue
      }

      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })

      // 生成文件名
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const ext = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomStr}.${ext}`

      try {
        // 上传到 S3/R2
        const buffer = Buffer.from(await file.arrayBuffer())
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          CacheControl: 'public, max-age=31536000',
          ACL: 'public-read'
        })

        console.log('Uploading to S3:', {
          bucket: process.env.S3_BUCKET_NAME,
          key: fileName,
          contentType: file.type
        })

        await s3Client.send(command)
        console.log('Upload successful')

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
        console.error('Error uploading file:', fileName, uploadError)
        throw uploadError
      }
    }

    console.log('All files processed successfully')
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

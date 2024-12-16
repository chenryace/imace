import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
})

// 通用的 URL 生成函数，支持自定义域名或默认 S3 端点
function getPublicUrl(fileName: string) {
  if (process.env.PUBLIC_DOMAIN) {
    // 如果配置了自定义域名，直接使用
    return `${process.env.PUBLIC_DOMAIN.replace(/\/$/, '')}/${fileName}`
  } else {
    // 否则使用标准的 S3 URL 格式
    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '')
    const bucket = process.env.S3_BUCKET_NAME
    return `${endpoint}/${bucket}/${fileName}`
  }
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const auth = cookieStore.get('auth')
  if (!auth) {
    return NextResponse.json(
      { success: false, message: '未登录' },
      { status: 401 }
    )
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files')
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有上传文件' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      if (!(file instanceof File)) {
        continue
      }

      // 生成文件名
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const ext = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomStr}.${ext}`

      // 上传到 S3 兼容存储
      const buffer = Buffer.from(await file.arrayBuffer())
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          // 设置缓存控制
          CacheControl: 'public, max-age=31536000',
          // 设置公共读取权限
          ACL: 'public-read',
          // 设置额外的元数据
          Metadata: {
            'original-name': file.name,
            'upload-time': new Date().toISOString()
          }
        })
      )

      // 生成访问 URL
      const url = getPublicUrl(fileName)
      
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
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: '上传失败' },
      { status: 500 }
    )
  }
}

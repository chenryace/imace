import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { cookies } from 'next/headers'

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  // 某些 S3 兼容服务需要强制设置路径样式
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
});

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

export async function GET() {
  // 验证登录状态
  const cookieStore = cookies()
  const auth = cookieStore.get('auth')
  if (!auth) {
    return NextResponse.json(
      { success: false, message: '未登录' },
      { status: 401 }
    )
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    const response = await s3.send(command);
    
    const images = response.Contents?.map(item => {
      const url = getPublicUrl(item.Key!)
      return {
        originalName: item.Key?.split('-').slice(2).join('-') || item.Key || '',
        fileName: item.Key || '',
        url,
        markdown: `![${item.Key}](${url})`,
        bbcode: `[img]${url}[/img]`,
        html: `<img src="${url}" alt="${item.Key}" />`,
        size: item.Size || 0,
        type: 'image/*',
        uploadTime: item.LastModified?.toISOString() || new Date().toISOString()
      }
    }) || [];

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to list images:", error);
    return NextResponse.json(
      { error: "获取图片列表失败" },
      { status: 500 }
    );
  }
}

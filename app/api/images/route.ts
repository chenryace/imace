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
});

// 生成公共访问 URL
function getPublicUrl(fileName: string) {
  // 使用配置的公共访问域名
  const publicDomain = process.env.PUBLIC_DOMAIN || process.env.S3_ENDPOINT
  // 确保不重复添加 bucket 名称（如果域名已经包含了）
  const bucketPath = publicDomain?.includes(process.env.S3_BUCKET_NAME!)
    ? ''
    : `/${process.env.S3_BUCKET_NAME}`
  return `${publicDomain}${bucketPath}/${fileName}`
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

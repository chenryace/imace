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
      const url = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${item.Key}`
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

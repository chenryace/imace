import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
});

export async function GET() {
  // 检查认证状态
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get('auth');
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    
    const images = response.Contents?.map(object => ({
      key: object.Key,
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${object.Key}`,
      lastModified: object.LastModified,
    })) || [];

    return NextResponse.json({ images });
  } catch (error) {
    console.error("获取图片列表错误:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

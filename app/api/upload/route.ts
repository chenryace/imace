import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers'

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
});

export async function POST(request: Request) {
  // 检查认证状态
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.get('auth')
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "没有文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${Date.now()}-${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return NextResponse.json({ 
      success: true,
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`
    });
  } catch (error) {
    console.error("上传错误:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

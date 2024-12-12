import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
});

export async function GET() {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    
    const images = response.Contents?.map(object => ({
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${object.Key}`,
      name: object.Key,
      size: object.Size,
      lastModified: object.LastModified,
      dimensions: {
        width: 0,  // 这些信息需要从图片元数据中获取
        height: 0
      }
    })) || [];

    return NextResponse.json(images);
  } catch (error) {
    console.error("获取图片列表错误:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
} 
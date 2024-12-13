/// <reference types="next" />
/// <reference types="next/image-types/global" />

// 为 next/server 添加类型定义
declare module 'next/server' {
  import { NextResponse as OriginalNextResponse } from 'next'
  export const NextResponse: typeof OriginalNextResponse
}

// 为 @aws-sdk/client-s3 添加类型定义
declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: any)
    send(command: any): Promise<any>
  }

  export class PutObjectCommand {
    constructor(input: any)
  }

  export class ListObjectsV2Command {
    constructor(input: any)
  }
}

// 确保 React 组件类型正确
declare module '*.tsx' {
  const content: React.FC<any> | React.ComponentType<any>
  export default content
}

import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <title>图床应用</title>
        <meta name="description" content="基于Next.js和对象存储的现代图床应用" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

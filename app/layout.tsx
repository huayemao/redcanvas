import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RedCanvas - 小红书风格封面生成器',
  description: '一键生成小红书风格的高质量封面图片，支持多种模板和自定义样式。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="dns-prefetch" href="https://fonts.loli.net" />
        <link rel="preconnect" href="https://fonts.loli.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://gstatic.loli.net" crossOrigin="anonymous" />
        <link href="https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@400;700;900&family=Noto+Serif+SC:wght@700;900&family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&family=Zhi+Mang+Xing&family=ZCOOL+KuaiLe&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

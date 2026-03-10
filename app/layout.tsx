import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
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
        <nav className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-200">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">RedCanvas</span>
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">XHS Creative Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
            >
              主页
            </Link>
            <Link 
              href="/blog" 
              className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
            >
              博客
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
            >
              关于
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

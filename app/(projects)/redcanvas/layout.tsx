import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import './globals.css';
import { APP_CONFIG, SEO_CONFIG } from './config';

export function generateMetadata(): Metadata {
  return {
    title: {
      default: APP_CONFIG.siteName,
      template: `%s - ${APP_CONFIG.appName}`,
    },
    description: APP_CONFIG.appDescription,
    keywords: APP_CONFIG.keywords,
    authors: [{ name: APP_CONFIG.author }],
    creator: APP_CONFIG.author,
    openGraph: SEO_CONFIG.openGraph,
    twitter: SEO_CONFIG.twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    viewport: 'width=device-width, initial-scale=1',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="canonical" href={APP_CONFIG.baseUrl} />
        <link rel="dns-prefetch" href="https://fonts.loli.net" />
        <link rel="preconnect" href="https://fonts.loli.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://gstatic.loli.net" crossOrigin="anonymous" />
        <link href="https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@400;700;900&family=Noto+Serif+SC:wght@700;900&family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&family=Zhi+Mang+Xing&family=ZCOOL+KuaiLe&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={APP_CONFIG.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <nav className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-6 flex items-center justify-between z-50">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-200">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">RedCanvas</span>
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">XHS Creative Suite</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
            >
              主页
            </Link>
            <Link 
              href="/store" 
              className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
            >
              模板商店
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

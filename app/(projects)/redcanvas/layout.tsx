import type { Metadata } from 'next';
import './globals.css';
import { APP_CONFIG, SEO_CONFIG } from './config';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

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
        <link href="https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@400;700;900&family=Noto+Serif+SC:wght@700;900&family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&family=Zhi+Mang+Xing&family=ZCOOL+KuaiLe&family=LXGW+WenKai+Mono+SC&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fontsapi.zeoseven.com/237/main/result.css" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={APP_CONFIG.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

import type { ReactNode } from 'react';
import { APP_CONFIG } from '@/app/(projects)/redcanvas/config';

interface BlogLayoutProps {
  children: ReactNode;
}

const blogDescription = 'RedCanvas 博客，分享RedCanvas产品更新动态和小红书封面设计技巧 。';

export function generateMetadata() {
  return {
    title: '小红书爆款封面制作工具 RedCanvas 产品博客',
    description: blogDescription,
    openGraph: {
      title: 'RedCanvas 博客',
      description: blogDescription,
      url: `${APP_CONFIG.baseUrl}/blog`,
      type: 'website',
    },
  };
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <article className="max-w-4xl mx-auto my-6">
      {children}
    </article>
  );
}

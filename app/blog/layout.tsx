import type { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/app/config';

interface BlogLayoutProps {
  children: ReactNode;
}

export function generateMetadata() {
  return {
    title: '博客 - RedCanvas',
    description: 'RedCanvas 博客，分享小红书风格设计技巧、内容创作经验和产品更新动态。',
    openGraph: {
      title: 'RedCanvas 博客',
      description: APP_CONFIG.appDescription,
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

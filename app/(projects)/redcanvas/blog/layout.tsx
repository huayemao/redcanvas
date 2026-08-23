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
  // 深色主题锁定：统一使用 bg-[#0a0a0a]，不混入浅色内容容器
  // 详情页的实际内容包裹在 [slug]/page.tsx 中做更深一层的玻璃卡片壳
  return <div className="bg-[#0a0a0a]">{children}</div>;
}

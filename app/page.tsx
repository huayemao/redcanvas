import { Analytics } from "@vercel/analytics/react"
import { APP_CONFIG } from './config';
import HomeClient from './HomeClient';

export const metadata = {
  title: '爆款封面工厂 - 小红书风格封面生成器',
  description: '一键生成小红书风格的高质量封面图片，支持多种模板和自定义样式，打造爆款内容必备工具。',
  openGraph: {
    title: '爆款封面工厂 - 小红书风格封面生成器',
    description: APP_CONFIG.appDescription,
    url: APP_CONFIG.baseUrl,
    type: 'website',
  },
};

const Home = () => {
  return (
    <>
      <Analytics />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: APP_CONFIG.appName,
            description: APP_CONFIG.appDescription,
            url: APP_CONFIG.baseUrl,
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'All',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CNY',
              availability: 'https://schema.org/InStock'
            },
            featuredImage: {
              '@type': 'ImageObject',
              url: `${APP_CONFIG.baseUrl}/og-image.png`,
              width: 1200,
              height: 630
            }
          })
        }}
      />
      <HomeClient />
    </>
  );
};

export default Home;

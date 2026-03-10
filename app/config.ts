export const APP_CONFIG = {
  baseUrl: 'https://red.utities.online',
  appName: 'RedCanvas',
  appDescription: '一键生成小红书风格的高质量封面图片，支持多种模板和自定义样式。',
  keywords: '小红书封面,封面生成器,爆款封面,小红书风格,图片设计,内容创作',
  author: 'RedCanvas Team',
  publisher: 'RedCanvas',
  themeColor: '#ff2442',
};

export const SEO_CONFIG = {
  openGraph: {
    title: 'RedCanvas - 小红书风格封面生成器',
    description: APP_CONFIG.appDescription,
    url: APP_CONFIG.baseUrl,
    type: 'website',
    images: [
      {
        url: `${APP_CONFIG.baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'RedCanvas - 小红书风格封面生成器',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RedCanvas - 小红书风格封面生成器',
    description: APP_CONFIG.appDescription,
    images: [`${APP_CONFIG.baseUrl}/og-image.png`],
  },
};

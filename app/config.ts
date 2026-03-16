export const APP_CONFIG = {
  baseUrl: 'https://red.utities.online',
  appName: 'RedCanvas',
  siteName: '爆款封面工厂 - 免费可商用的社交媒体封面图片生成器。无痛快速制作高级感封面',
  appDescription: '免费一键生成小红书等社交媒体内容的高质量封面图片的工具，按照大字标题、主体突出、统一风格三大爆款法则，一键生成干净有质感的封面，省时又出片，让你的内容被更多人看见。支持多种模板和自定义样式。让你无痛做出高点击封面，。',
  keywords: '小红书封面,封面生成器,爆款封面,小红书风格,图片设计,内容创作,社交媒体,封面制作,点击率,流量提升',
  author: '花野猫',
  // publisher: 'RedCanvas',
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
        url: `${APP_CONFIG.baseUrl}/screenshot.png`,
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
    images: [`${APP_CONFIG.baseUrl}/screenshot.png`],
  },
};

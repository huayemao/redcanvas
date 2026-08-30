export const APP_CONFIG = {
  baseUrl: 'https://red.utities.online',
  appName: 'RedCanvas',
  siteName: '花野猫的 Plog 生成器',
  appDescription: 'RedCanvas 是由花野猫打造的极简高效 Plog 排版与封面设计工具。围绕主图智能算法自动提取和谐配色，提供默认好看的背景纹理、文字组件、时间戳与 LaTeX 公式渲染。专为产品宣传、日常记录、社交媒体图文与学习笔记打造，无需设计经验即可一键导出无水印高清海报。',
  keywords: 'Plog排版工具,Plog制作器,小红书封面 generator,爆款封面生成器,自动配色设计工具,图文学习笔记,LaTeX公式海报,产品宣传海报制作,社交媒体封面,新媒体排版引擎,花野猫,RedCanvas',
  author: '花野猫',
  themeColor: '#ff2442',
};

export const SEO_CONFIG = {
  openGraph: {
    title: '花野猫的 Plog 生成器',
    description: APP_CONFIG.appDescription,
    url: APP_CONFIG.baseUrl,
    type: 'website',
    images: [
      {
        url: `${APP_CONFIG.baseUrl}/screenshot.png`,
        width: 1200,
        height: 630,
        alt: '花野猫的 Plog 排版工具',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RedCanvas - 花野猫的 Plog 生成器',
    description: APP_CONFIG.appDescription,
    images: [`${APP_CONFIG.baseUrl}/screenshot.png`],
  },
};


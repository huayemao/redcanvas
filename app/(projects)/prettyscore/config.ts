export const APP_CONFIG = {
  baseUrl: 'https://prettyscore.utities.online',
  appName: 'PrettyScore',
  siteName: 'PrettyScore - One-Click Sheet Music Beautifier',
  appDescription: 'Tired of plain black and white sheet music? PrettyScore is a free online tool that lets you easily add beautiful colors and styles to your music sheets. Import SVG/PDF scores, choose from preset color themes, customize paper texture, ink color, and background, add decorative borders or fine-tune vignetting and warm tones for a more atmospheric look. Export high-quality images or PDF for sharing, printing, or framing.',
  keywords: 'sheet music, music notation, colorize sheet music, music beautifier, sheet music editor, music score, PDF to image, SVG editor, music aesthetics',
  author: '花野猫',
  themeColor: '#4a90e2',
};

export const SEO_CONFIG = {
  openGraph: {
    title: 'PrettyScore - One-Click Sheet Music Beautifier',
    description: APP_CONFIG.appDescription,
    url: APP_CONFIG.baseUrl,
    type: 'website',
    images: [
      {
        url: `${APP_CONFIG.baseUrl}/screenshot.png`,
        width: 1200,
        height: 630,
        alt: 'PrettyScore - One-Click Sheet Music Beautifier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrettyScore - One-Click Sheet Music Beautifier',
    description: APP_CONFIG.appDescription,
    images: [`${APP_CONFIG.baseUrl}/screenshot.png`],
  },
};

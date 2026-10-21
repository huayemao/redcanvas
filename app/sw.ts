import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, Serwist } from 'serwist';

// 声明 Service Worker 全局上下文与 Serwist 配置
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. jsDelivr 切片中文字体（@chinese-fonts，小赖字体、悠哉体、汇文明朝体等）
    {
      matcher: /^https:\/\/cdn\.jsdelivr\.net\/.*(?:\.woff2?|\.ttf|\.otf|result.*\.css)$/i,
      handler: new CacheFirst({
        cacheName: 'jsdelivr-chinese-fonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1000,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存 1 年
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },

    // 2. Google / Loli Fonts 镜像分发（霞鹜文楷、Noto 系列、快乐体、书法体）
    {
      matcher: /^https:\/\/(?:fonts|gstatic)\.(?:loli\.net|googleapis\.com|gstatic\.com)\/.*/i,
      handler: new CacheFirst({
        cacheName: 'external-webfonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存 1 年
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },

    // 3. 通用字体切片与静态字体扩展名
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2)$/i,
      handler: new CacheFirst({
        cacheName: 'static-font-assets',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存 1 年
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },

    // 4. 其余 Next.js 默认资源缓存策略（JS、CSS chunks、图片等）
    ...defaultCache,
  ],
});

serwist.addEventListeners();

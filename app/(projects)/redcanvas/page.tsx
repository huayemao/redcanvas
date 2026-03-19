'use client';

import { Analytics } from "@vercel/analytics/react"
import { APP_CONFIG, SEO_CONFIG } from './config';
import { TemplateCarousel } from './components/TemplateCarousel';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Palette, Download, ChevronRight } from 'lucide-react';

const Home = () => {
  const handleSelectTemplate = (templateId: string, orientation: string, exportSize: string) => {
    window.location.href = `/redcanvas/app?template=${templateId}&orientation=${orientation}&exportSize=${exportSize}`;
  };

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-blue-50 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                免费使用
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-neutral-900 leading-tight mb-6"
            >
              爆款封面
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-500">
                一键生成
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl"
            >
              专业社交媒体平台封面设计工具，无需PS，1分钟搞定高质量封面
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <a
                href="/redcanvas/app"
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:bg-neutral-900 hover:shadow-2xl shadow-xl shadow-red-200/50"
              >
                立即开始创作
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/redcanvas/store"
                className="px-8 py-4 bg-white text-neutral-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:bg-neutral-100 border border-neutral-200 shadow-lg"
              >
                浏览模板
                <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>
            <TemplateCarousel onSelectTemplate={handleSelectTemplate} />
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 bg-white">

        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">强大功能，简单操作</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              专为内容创作者打造的封面设计工具，让你的作品在众多内容中脱颖而出
            </p>
          </motion.div>


        </div>
      </section>

      <section className="mx-auto max-w-[320px] text-center my-12 p-8 bg-gradient-to-br from-red-50 to-white rounded-3xl shadow-sm">
        <h2 className="text-xl font-black text-neutral-900 mb-4">为什么选择 RedCanvas？</h2>
        <ul className="text-sm text-neutral-600 space-y-3">
          <li className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>专业小红书爆款风格模板</span>
          </li>
          <li className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>高清无水印导出</span>
          </li>
          <li className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>支持多种社交平台尺寸</span>
          </li>
          <li className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>免费使用，无广告</span>
          </li>
        </ul>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-rose-600/75 to-red-700/70 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6">准备好创建你的爆款封面了吗？</h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto text-red-100">
              立即开始使用 RedCanvas，让你的内容在社交媒体上脱颖而出
            </p>
            <a
              href="/redcanvas/app"
              className="inline-flex items-center gap-2 bg-white text-red-500 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-neutral-100 shadow-2xl"
            >
              开始创作
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
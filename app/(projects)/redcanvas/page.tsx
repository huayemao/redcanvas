'use client';

import { Analytics } from "@vercel/analytics/react"
import { APP_CONFIG, SEO_CONFIG } from './config';
import { TemplateCarousel } from './components/TemplateCarousel';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

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
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center selection:bg-red-500/40">
        {/* Ambient glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            {/* Brand chip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-red-400 px-4 py-1.5 rounded-full text-xs font-black tracking-[0.15em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                免费使用 · FREE
              </div>
            </motion.div>

            {/* Brand mark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                RedCanvas Studio
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white text-center mb-6"
            >
              爆款封面
              <span className="text-red-500">.</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-400">
                一键生成
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm md:text-base text-white/50 mb-10 max-w-2xl text-center font-medium leading-relaxed"
            >
              专业社交媒体平台封面设计工具 · 无需 PS · 1 分钟搞定高质量封面
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <a
                href="/redcanvas/app"
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:bg-red-400 shadow-2xl shadow-red-500/30"
              >
                立即开始创作
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/redcanvas/store"
                className="px-8 py-4 bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:bg-white/[0.08]"
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
      <section className="relative py-24 bg-[#0a0a0a] text-white overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                Features
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
              强大功能，简单操作
            </h2>
            <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              专为内容创作者打造的封面设计工具，让你的作品在众多内容中脱颖而出
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                tag: '01 · Templates',
                title: '专业小红书爆款风格模板',
                desc: '精选高点击率样式，套用即出片',
              },
              {
                tag: '02 · Export',
                title: '高清无水印导出',
                desc: '一键下载，画质纯净可直接发布',
              },
              {
                tag: '03 · Sizes',
                title: '支持多种社交平台尺寸',
                desc: '小红书 / 视频号 / 公众号全覆盖',
              },
            ].map((f, i) => (
              <motion.div
                key={f.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
              >
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500/40 rounded-tl-lg pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500/40 rounded-br-lg pointer-events-none" />
                <div className="text-[10px] font-black text-red-400 uppercase tracking-[0.15em] mb-4">
                  {f.tag}
                </div>
                <h3 className="text-lg font-black text-white mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-xs text-white/50 font-medium leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RedCanvas Section */}
      <section className="py-20 bg-[#0a0a0a] text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto relative bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-8 shadow-2xl shadow-black/50"
          >
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500/60 rounded-tl-lg pointer-events-none" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-red-500/60 rounded-tr-lg pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-red-500/60 rounded-bl-lg pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500/60 rounded-br-lg pointer-events-none" />

            <div className="text-center mb-6">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
                Why RedCanvas
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                为什么选择 RedCanvas？
              </h2>
            </div>
            <ul className="text-sm text-white/70 space-y-3">
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
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#0a0a0a] text-white overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-500/[0.08] rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                Get Started
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
              准备好创建你的爆款封面了吗？
            </h2>
            <p className="text-sm md:text-base mb-10 max-w-2xl mx-auto text-white/50 font-medium leading-relaxed">
              立即开始使用 RedCanvas，让你的内容在社交媒体上脱颖而出
            </p>
            <a
              href="/redcanvas/app"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:bg-red-400 shadow-2xl shadow-red-500/30"
            >
              开始创作
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Bottom status bar */}
            <div className="flex items-center justify-center gap-4 mt-16 text-[10px] text-white/20 font-medium">
              <span>REDCANVAS · STUDIO v1.0</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;

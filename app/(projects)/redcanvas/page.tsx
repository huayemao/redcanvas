'use client';

import { Analytics } from "@vercel/analytics/react";
import { APP_CONFIG } from './config';
import { TemplateCarousel } from './components/TemplateCarousel';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  Palette,
  Layers,
  Calculator,
  LayoutGrid,
  Download,
  BookOpen,
  Camera,
  CheckCircle2,
  Sparkle
} from 'lucide-react';

const Home = () => {
  const handleSelectTemplate = (templateId: string, orientation: string, exportSize: string) => {
    window.location.href = `/redcanvas/app?template=${templateId}&orientation=${orientation}&exportSize=${exportSize}`;
  };

  return (
    <>
      <Analytics />

      {/* Structured Data: WebApplication + FAQ Page for Rich Google Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: APP_CONFIG.appName,
              description: APP_CONFIG.appDescription,
              url: APP_CONFIG.baseUrl,
              applicationCategory: 'DesignApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'CNY',
                availability: 'https://schema.org/InStock'
              },
              author: {
                '@type': 'Person',
                name: '花野猫',
                url: 'https://huayemao.run'
              },
              featuredImage: {
                '@type': 'ImageObject',
                url: `${APP_CONFIG.baseUrl}/og-image.png`,
                width: 1200,
                height: 630
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'RedCanvas 是什么？有哪些特色功能？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'RedCanvas 是由花野猫打造的 Plog 生成器。围绕图片自动提取配色方案，提供默认好看的背景纹理、文字组件与 LaTeX 数学公式渲染，支持一键无水印导出。'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'RedCanvas 支持哪些使用场景？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '包含四大核心场景：产品宣传海报（步骤注记）、日常生活记录（抓拍画册）、社交媒体图文（小红书/视频号/公众号爆款封面）、图文学习笔记（支持 LaTeX 公式排版）。'
                  }
                },
                {
                  '@type': 'Question',
                  name: '是否需要设计经验或手动调色？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '完全不需要。工具采用配色提取算法，确保文字、背景与主图色调天然协调，零门槛打造高质感排版。'
                  }
                }
              ]
            }
          ])
        }}
      />

      {/* Hero Section: Desktop 2-column split, compact desktop carousel height */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white pt-10 pb-16 md:py-20 flex items-center justify-center selection:bg-red-500/40 min-h-[90vh]">
        {/* Ambient background glows */}
        <div className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] bg-red-500/[0.08] rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-blue-500/[0.05] rounded-full blur-[110px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Brand chip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-red-400 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  花野猫的 Plog 排版工具 · 免费使用
                </div>
              </motion.div>

              {/* H1 Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white mb-5 max-w-2xl"
              >
                {APP_CONFIG.siteName}
                <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-red-300">
                  {APP_CONFIG.appName}
                </span>
              </motion.h1>

              {/* Concise Subtext (Max 20 words constraint) */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-sm md:text-base text-white/60 mb-8 max-w-xl font-medium leading-relaxed"
              >
                智能算法识别主图颜色，提供默认好看的背景纹理、文字组件与 LaTeX 公式，1 分钟生成优质图文与社交封面。
              </motion.p>

              {/* Action Buttons (1 primary CTA label, fit on one line) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto"
              >
                <a
                  href="/redcanvas/app"
                  className="px-7 py-3.5 bg-red-500 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:bg-red-400 shadow-xl shadow-red-500/25 active:scale-[0.98]"
                >
                  立即开始创作
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="/redcanvas/store"
                  className="px-7 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  浏览模板
                  <ChevronRight className="w-5 h-5" />
                </a>
              </motion.div>

              {/* Key Spec Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-white/40 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  智能提取色彩
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  支持 LaTeX 公式
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  高清无水印导出
                </span>
              </motion.div>
            </div>

            {/* Right Carousel Preview Column (Constrained desktop height) */}
            <div className="lg:col-span-5 w-full">
              <TemplateCarousel
                onSelectTemplate={handleSelectTemplate}
                compact={true}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Platform & Capability Wall Section */}
      <section className="border-y border-white/[0.06] bg-black/80 py-6 text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-6 opacity-70 hover:opacity-100 transition-opacity">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
              COVER & PLOG FOR
            </span>
            <div className="flex flex-wrap items-center gap-6 md:gap-10 text-xs font-semibold text-white/50">
              <span className="hover:text-white transition-colors">小红书 Plog</span>
              <span className="text-white/20">·</span>
              <span className="hover:text-white transition-colors">微信视频号</span>
              <span className="text-white/20">·</span>
              <span className="hover:text-white transition-colors">公众号封面图</span>
              <span className="text-white/20">·</span>
              <span className="hover:text-white transition-colors">学习笔记 & 公式</span>
              <span className="text-white/20">·</span>
              <span className="hover:text-white transition-colors">产品说明海报</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 4 Core Plog Use Scenarios (Bento Grid) */}
      <section className="relative py-20 md:py-28 bg-[#0a0a0a] text-white overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-red-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              四大 Plog 排版应用场景
            </h2>
            <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              传统的图片编辑器需要手动繁琐微调，RedCanvas 提供默认好看的元素组合，轻松应对多样化表达。
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* 01 · 产品宣传 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-[24px] p-7 hover:border-red-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-black text-red-400 uppercase tracking-[0.15em] mb-2">
                SCENARIO 01
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                产品宣传与操作指南
              </h3>
              <p className="text-xs md:text-sm text-white/60 font-medium leading-relaxed">
                用于产品使用过程截图配图注解、功能介绍海报与逐页流程说明，呈现极具品质的视觉展示。
              </p>
            </motion.div>

            {/* 02 · 日常记录 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-[24px] p-7 hover:border-red-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.15em] mb-2">
                SCENARIO 02
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                日常记录与生活画册
              </h3>
              <p className="text-xs md:text-sm text-white/60 font-medium leading-relaxed">
                记录日常抓拍、风景速写与旅行画报。支持照片底图与质感纹理，捕捉真挚的黑卡明信片体验。
              </p>
            </motion.div>

            {/* 03 · 社交媒体图文 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-[24px] p-7 hover:border-red-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Sparkle className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-2">
                SCENARIO 03
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                社交媒体高点击图文
              </h3>
              <p className="text-xs md:text-sm text-white/60 font-medium leading-relaxed">
                涵盖大字标题、爆款金句、多维卡片与极简暗黑样式，专为小红书与公众号打造吸睛排版。
              </p>
            </motion.div>

            {/* 04 · 图文学习笔记 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-[24px] p-7 hover:border-red-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-black text-sky-400 uppercase tracking-[0.15em] mb-2">
                SCENARIO 04
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                图文学习笔记 & LaTeX 公式
              </h3>
              <p className="text-xs md:text-sm text-white/60 font-medium leading-relaxed">
                内置 LaTeX 数学公式渲染与 Markdown 富文本支持，将高深的干货知识转化为精美的学术卡片。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Design Engine Core Philosophy (智能算法与排版引擎) */}
      <section className="py-20 md:py-28 bg-[#0a0a0a] text-white border-t border-white/[0.06]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
              解决繁琐配色的排版引擎
            </h2>
            <p className="text-sm md:text-base text-white/50 font-medium leading-relaxed">
              无需设计经验，围绕核心主图采用算法自动推荐浅色与深色色彩方案，保持字图环境天然调和。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-red-400 mb-4">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                主图智能配色提取
              </h3>
              <p className="text-xs text-white/50 font-medium leading-relaxed">
                自动提取导入图片的核心色彩，生成调和的文字与背景对比色，无需人工干预配色细节。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-red-400 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                默认好看的模块元素
              </h3>
              <p className="text-xs text-white/50 font-medium leading-relaxed">
                内置布纹背景、照片底图、文本框、时间戳、小赖字体与霞鹜文楷，元素组合即刻呈现设计感。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-red-400 mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                自由排版与无水印导出
              </h3>
              <p className="text-xs text-white/50 font-medium leading-relaxed">
                支持拖拽微调位置、圆角阴影配置与图像全宽自适应，一键导出超高清无水印图片与配置。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Final Call to Action */}
      <section className="relative py-24 bg-[#0a0a0a] text-white overflow-hidden border-t border-white/[0.06]">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-red-500/[0.08] rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5 text-white">
              准备好排版你的下一张 Plog 吗？
            </h2>
            <p className="text-sm md:text-base mb-10 max-w-xl mx-auto text-white/50 font-medium leading-relaxed">
              无需下载安装，即刻体验智能提取配色与高质感社交媒体排版
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/redcanvas/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-base transition-all hover:bg-red-400 shadow-xl shadow-red-500/30 active:scale-[0.98]"
              >
                立即开始创作
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/redcanvas/store"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white px-8 py-4 rounded-2xl font-black text-base transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                探索模版库
                <BookOpen className="w-5 h-5" />
              </a>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-center gap-3 mt-16 text-[11px] text-white/30 font-medium">
              <span>RedCanvas Plog Engine v2.0</span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                系统在线
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;


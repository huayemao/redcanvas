"use client"
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PenTool, Mail, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-stone-50">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/paper/1920/1080?blur=10')] opacity-10 bg-cover bg-center mix-blend-multiply" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 tracking-tight mb-6">
              每周给你爱的人<br />
              <span className="italic text-stone-500 font-light">写一封精美的信</span>
            </h1>
            <p className="mt-6 text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
              信纸计划是一个优雅的 Markdown 排版工具。将你平淡的文字，转化为充满温度的信笺。支持一键复制到邮件客户端，或导出为精美的图片。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/letter/editor"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-stone-900 hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <PenTool className="mr-2" size={20} />
                开始写信
              </Link>
              <Link
                href="/letter/about"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 transition-all"
              >
                了解更多
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-medium text-stone-900">为什么选择信纸计划？</h2>
            <div className="w-12 h-1 bg-stone-200 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={Mail}
              title="邮件完美适配"
              description="所有样式均采用内联 HTML 渲染，确保在各种邮件客户端中都能完美呈现，所见即所得。"
              delay={0.1}
            />
            <FeatureCard
              icon={Sparkles}
              title="优雅的信纸主题"
              description="提供牛皮纸、纯白信笺、复古网格等多种主题，针对中文字体进行深度优化，排版赏心悦目。"
              delay={0.2}
            />
            <FeatureCard
              icon={ImageIcon}
              title="一键导出图片"
              description="支持将排版好的信件一键导出为高清长图，方便在社交媒体上分享你的心意。"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <footer className="bg-stone-900 py-12 text-center">
        <p className="text-stone-400 font-serif italic text-lg">
          "见字如面，纸短情长。"
        </p>
        <p className="text-stone-500 text-sm mt-4">
          &copy; {new Date().getFullYear()} 信纸计划 (Letter Paper Project). All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors"
    >
      <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-stone-800">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

"use client";
import { motion } from 'framer-motion';
import { Mail, Heart, PenTool } from 'lucide-react';

export default function About() {
  return (
    <div className="flex-1 bg-stone-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-sm p-8 md:p-16 border border-stone-100"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-medium text-stone-900 mb-4">关于信纸计划</h1>
            <p className="text-stone-500 italic font-light">"每周给你爱的人写一封精美的信"</p>
          </div>

          <div className="space-y-8 text-stone-700 leading-loose font-light">
            <p>
              在这个快节奏的数字时代，我们习惯了用简短的消息和表情包来交流。然而，有些情感，需要用更深沉、更细腻的方式来表达。
            </p>
            <p>
              <strong>信纸计划 (Letter Paper Project)</strong> 诞生于一个简单的愿望：让写信重新成为一种充满仪式感的美好体验。
            </p>
            
            <div className="my-12 p-8 bg-stone-50 rounded-2xl border border-stone-100">
              <h3 className="text-xl font-medium text-stone-900 mb-4 flex items-center gap-2">
                <PenTool size={20} className="text-stone-500" />
                我们的理念
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                  <span><strong>专注内容：</strong>使用 Markdown 写作，让你专注于文字本身，而不是繁杂的排版操作。</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                  <span><strong>优雅呈现：</strong>精心设计的信纸主题，对中文字体进行深度优化，让每一封信都像艺术品。</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                  <span><strong>无缝传递：</strong>支持一键复制内联 HTML，完美适配各大邮件客户端；或导出为图片，方便在社交平台分享。</span>
                </li>
              </ul>
            </div>

            <p>
              无论是一封家书、一封情书，还是给远方朋友的问候，信纸计划都能帮你把心意包装得更加精美。
            </p>
            
            <div className="mt-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 text-stone-400 mb-6">
                <Heart size={24} />
              </div>
              <p className="text-stone-500 text-sm">
                开始你的第一封信吧，让文字的温度，跨越屏幕的冰冷。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

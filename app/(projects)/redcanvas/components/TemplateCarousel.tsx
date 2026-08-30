'use client';

import React, { useState, useEffect } from 'react';
import { TemplateId, Orientation, ExportSize } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface SampleSlide {
  // 图片 URL（本地或远程均可）
  image: string;
  // 对应模板 ID，点击使用该模板进入编辑器
  templateId: TemplateId;
  // 封面图替代文字（无障碍 & SEO）
  alt: string;
  // 左下角角标文字（如模板名/推荐标签）
  label?: string;
}

// 安利轮播图：使用实际成品图片
const SAMPLE_SLIDES: SampleSlide[] = [
  {
    image: '/redcanvas/花野猫的Plog制作工具-物理空间与专注力.png',
    templateId: 'classic',
    alt: '花野猫的Plog制作工具 成品示例 - 物理空间与专注力',
    label: '推荐 · 简笔画金句',
  },
  {
    image: '/redcanvas/花野猫的Plog制作工具-黑客与画家-深色.webp',
    templateId: 'bold',
    alt: '花野猫的Plog制作工具 成品示例 - 黑客与画家 (深色卡片)',
    label: '暗黑金句',
  },
  {
    image: '/redcanvas/花野猫的Plog制作工具-黑客与画家-浅色.webp',
    templateId: 'minimal',
    alt: '花野猫的Plog制作工具 成品示例 - 黑客与画家 (浅色卡片)',
    label: '极简金句',
  },
  {
    image: '/redcanvas/花野猫的Plog制作工具-基本初等函数的导数公式.webp',
    templateId: 'magazine',
    alt: '花野猫的Plog制作工具 成品示例 - 基本初等函数的导数公式',
    label: '知识干货',
  },
  {
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=xiaohongshu%20cover%20modern%20layered%20floating%20cards%20overlap%20depth%20purple%20gradient%20aesthetic%20portrait%20poster%20chinese%20typography%20trendy&image_size=portrait_4_3',
    templateId: 'floating',
    alt: 'RedCanvas 成品示例 - 现代重叠风格封面',
    label: '现代重叠',
  },
  {
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laptop%20mockup%20desk%20setup%20cozy%20workspace%20programming%20code%20screen%20soft%20lighting%20realistic%20product%20showcase%20cover%20poster%20portrait&image_size=portrait_4_3',
    templateId: 'mockup',
    alt: 'RedCanvas 成品示例 - 电脑场景风格封面',
    label: '电脑场景',
  },
  {
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=xiaohongshu%20cover%20warm%20sunset%20gradient%20orange%20pink%20soft%20dreamy%20aesthetic%20portrait%20poster%20chinese%20typography%20clean%20elegant%20social%20media&image_size=portrait_4_3',
    templateId: 'gradient',
    alt: 'RedCanvas 成品示例 - 渐变背景风格封面',
    label: '渐变背景',
  },
];

interface TemplateCarouselProps {
  onSelectTemplate: (templateId: TemplateId, orientation: Orientation, exportSize: ExportSize) => void;
}

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({ onSelectTemplate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      skipSnaps: false,
    },
    [Autoplay({ delay: 4500 })]
  );

  const handleSelectSlide = (templateId: TemplateId) => {
    // 默认使用竖版 3:4 导出（小红书最常用）
    const orientation: Orientation = 'portrait';
    const exportSize: ExportSize = '3:4';
    onSelectTemplate(templateId, orientation, exportSize);
  };

  const nextSlide = () => emblaApi?.scrollNext();
  const prevSlide = () => emblaApi?.scrollPrev();
  const scrollToIndex = (index: number) => emblaApi?.scrollTo(index);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-red-500/10 ring-1 ring-white/10 bg-black/40">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {SAMPLE_SLIDES.map((slide) => (
                <div key={slide.image} className="min-w-full shrink-0 grow-0 basis-full">
                  {/* 3:4 竖版封面容器，position:relative 保证子元素尺寸锚定 */}
                  <button
                    type="button"
                    onClick={() => handleSelectSlide(slide.templateId)}
                    className="group relative block w-full aspect-[3/4] overflow-hidden bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`使用模板：${slide.label ?? slide.templateId}`}
                  >
                    {/* 实际封面图 —— object-cover 保证不同比例图片都能铺满且不变形 */}
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      draggable={false}
                    />

                    {/* 顶/底渐变遮罩：增强文字可读性 + 承接指示点/按钮 */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* 左上角推荐角标 */}
                    {slide.label && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[11px] font-black tracking-wider text-white/90 uppercase">
                          {slide.label}
                        </span>
                      </div>
                    )}

                    {/* 右下角 CTA 角标 */}
                    <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3.5 py-1.5 text-white font-black text-xs shadow-lg shadow-red-500/30 transition-colors group-hover:bg-red-400">
                      使用此模板
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 左右切换按钮 */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="上一张"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="下一张"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 底部指示点 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {SAMPLE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`跳到第 ${idx + 1} 张`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateCarousel;

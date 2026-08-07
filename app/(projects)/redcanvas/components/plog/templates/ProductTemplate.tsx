'use client';

import React from 'react';
import { PlogImage } from '../../../types';
import { ImageWithFrame } from '../../preview/ImageWithFrame';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProductTemplateProps {
  images: PlogImage[];
  title: string;
  subtitle: string;
  fontClassName: string;
  templateVariant?: string;
  accentColor?: string;
}

export const ProductTemplate: React.FC<ProductTemplateProps> = ({
  images,
  title,
  subtitle,
  fontClassName,
  templateVariant = 'product-tutorial',
  accentColor = '#ff2442',
}) => {
  const mainImage = images[0]?.url || '/screenshot.png';

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative z-0">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-black tracking-wide shadow-sm border border-black/5" style={{ color: accentColor }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>产品操作指南 & 功能图解</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-black text-neutral-900 leading-tight tracking-tight whitespace-pre-line ${fontClassName}`}>
          {title}
        </h2>
        <p className="text-xs text-neutral-600 font-medium leading-relaxed max-w-sm">
          {subtitle}
        </p>
      </div>

      {/* Main Showcase Screenshot Area */}
      <div className="flex-1 my-4 flex items-center justify-center relative min-h-0">
        <div className="w-full h-full max-h-[360px] flex items-center justify-center relative">
          <ImageWithFrame
            imageUrl={mainImage}
            showDeviceFrame={true}
            deviceType="browser"
            imageAspectRatio={null}
          />
        </div>
      </div>

      {/* Product Feature Checklist / Steps Footer */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-black/5 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          <span>Key Highlights</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-800">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>自动颜色匹配</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>自由拖拽排版</span>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { PlogImage } from '../../../types';
import { Quote, Sparkles, LayoutGrid } from 'lucide-react';

interface SocialTemplateProps {
  images: PlogImage[];
  title: string;
  subtitle: string;
  fontClassName: string;
  templateVariant?: string;
  accentColor?: string;
}

export const SocialTemplate: React.FC<SocialTemplateProps> = ({
  images,
  title,
  subtitle,
  fontClassName,
  accentColor = '#ff2442',
}) => {
  const displayImages = images.length > 0 ? images : [{ id: '1', url: '/screenshot.png' }];

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative z-0">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-md">
          <Sparkles className="w-3 h-3 text-red-500" />
          <span>RED CANVAS SOCIAL</span>
        </div>
        <div className="text-[10px] font-bold text-neutral-400">
          #PLOG #DESIGN
        </div>
      </div>

      {/* Title & Quote Block */}
      <div className="my-3 space-y-2 bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-xl">
        <Quote className="w-6 h-6 text-neutral-300" />
        <h2 className={`text-2xl sm:text-3xl font-black text-neutral-900 leading-tight ${fontClassName}`}>
          {title}
        </h2>
        <p className="text-xs text-neutral-600 font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Grid Collages */}
      <div className="flex-1 my-2 rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative min-h-[180px]">
        {displayImages.length === 1 ? (
          <img
            src={displayImages[0].url}
            alt="Social Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="grid grid-cols-2 h-full gap-1 bg-white p-1">
            {displayImages.slice(0, 4).map((img, idx) => (
              <div key={img.id || idx} className="relative h-full overflow-hidden rounded-lg">
                <img
                  src={img.url}
                  alt={`Collage ${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Footer */}
      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 pt-2 border-t border-black/5">
        <span>RED CANVAS GRAPHICS STUDIO</span>
        <span>SWIPE RIGHT FOR MORE 👉</span>
      </div>
    </div>
  );
};

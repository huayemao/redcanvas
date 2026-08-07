'use client';

import React from 'react';
import { PlogImage } from '../../../types';
import { Camera, MapPin, Calendar, Heart } from 'lucide-react';

interface DailyTemplateProps {
  images: PlogImage[];
  title: string;
  subtitle: string;
  fontClassName: string;
  templateVariant?: string;
  accentColor?: string;
}

export const DailyTemplate: React.FC<DailyTemplateProps> = ({
  images,
  title,
  subtitle,
  fontClassName,
  accentColor = '#ff601a',
}) => {
  const mainImage = images[0]?.url || '/screenshot.png';
  const currentDate = new Date().toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative z-0">
      {/* Tape decoration accent at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-amber-100/70 border-t border-b border-amber-200/50 shadow-sm rotate-[-2deg] z-20 pointer-events-none" />

      {/* Polaroid Card Wrapper */}
      <div className="w-full flex-1 bg-white rounded-3xl p-5 shadow-2xl border border-neutral-100 flex flex-col justify-between my-2">
        {/* Photo Container */}
        <div className="w-full flex-1 bg-neutral-100 rounded-2xl overflow-hidden relative shadow-inner min-h-[220px]">
          <img
            src={mainImage}
            alt="Daily Memory"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-black/50 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <Camera className="w-3 h-3" />
            <span>DAILY VLOG</span>
          </div>
        </div>

        {/* Polaroid Note Content */}
        <div className="pt-4 space-y-2">
          <h2 className={`text-xl sm:text-2xl font-black text-neutral-900 leading-snug ${fontClassName}`}>
            {title}
          </h2>
          <p className="text-xs text-neutral-500 font-medium line-clamp-2">
            {subtitle}
          </p>

          <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-neutral-400 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-red-400" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Heart className="w-3 h-3 fill-amber-500" />
              <span>Good Mood</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

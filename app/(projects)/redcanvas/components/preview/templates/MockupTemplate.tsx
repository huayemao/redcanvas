'use client';

import React from "react";
import { TitleRenderer } from "../TitleRenderer";
import { Highlight } from "../../../types";

interface TemplatePropsSimple {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  imageAspectRatio: number | null;
  fontClassName: string;
  isLandscape?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
}

export const MockupTemplate = ({
  title,
  highlights,
  seriesNumber,
  imageUrl,
  fontClassName,
  gradientStartColor,
  gradientEndColor,
}: TemplatePropsSimple) => {
  return (
    <div className="relative w-full h-full">
      {/* Background mockup image */}
      <div className="absolute inset-0">
        <img
          src="/mockup_scene.webp"
          alt="Mockup scene"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text content with gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="relative px-8 pb-8 pt-16">
          {seriesNumber && (
            <span className="text-[12px] font-black tracking-[0.3em] mb-4 text-white/80 uppercase block">
              {seriesNumber}
            </span>
          )}
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-white inline text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg"
            fontClassName={fontClassName}
          />
        </div>
      </div>  
      <div className="perspective-[1200px] w-[80.5%] mx-auto relative rounded-top rounded-lg top-[14.3%] left-[4.5%]">
        <div className="w-full bg-white shadow-xl    overflow-hidden  rounded-t rounded-t-[5px]
              transform 
              aspect-[16/10.5]
              -rotate-x-14
              rotate-y-10
              rotate-[0.89deg]
              origin-center"
              >
          <img
            src={imageUrl || '/mockup_screen.webp'}
            alt="MacBook Screen"
            className="w-full  object-cover"
          />
        </div>
      </div>
    </div>
  );
};

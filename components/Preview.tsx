
import React, { forwardRef } from 'react';
import { EditorState } from '../types';
import { FONTS } from '../constants';

interface PreviewProps {
  state: EditorState;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ state }, ref) => {
  const { title, highlights, seriesNumber, imageUrl, templateId, fontFamily, showDeviceFrame, imageAspectRatio } = state;

  const fontConfig = FONTS.find(f => f.id === fontFamily) || FONTS[0];

  const renderTitle = (sizeClass = "text-4xl") => {
    let content: React.ReactNode[] = [title];

    highlights.forEach((h) => {
      if (!h.text) return;
      const newContent: React.ReactNode[] = [];
      content.forEach((segment) => {
        if (typeof segment === 'string') {
          const parts = segment.split(new RegExp(`(${h.text})`, 'gi'));
          parts.forEach((part, i) => {
            if (part.toLowerCase() === h.text.toLowerCase()) {
              newContent.push(
                <span key={`${h.id}-${i}`} className="relative inline-block mx-0.5">
                  <span className="relative z-10">{part}</span>
                  {/* Thick Marker Underline - as requested in the image */}
                  <span 
                    className="absolute -bottom-1 left-0 w-full h-[14px] -rotate-[1.5deg] z-0 opacity-100 rounded-[10px_2px_12px_3px]" 
                    style={{ backgroundColor: h.color }}
                  />
                </span>
              );
            } else {
              newContent.push(part);
            }
          });
        } else {
          newContent.push(segment);
        }
      });
      content = newContent;
    });

    return (
      <h1 className={`${sizeClass} leading-[1.3] font-black whitespace-pre-wrap break-words ${fontConfig.className}`}>
        {content}
      </h1>
    );
  };

  const ImageWithFrame = () => {
    if (!imageUrl) return <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300 font-bold">待上传图片</div>;

    if (!showDeviceFrame) {
      return <img src={imageUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt="cover" />;
    }

    const isLandscape = imageAspectRatio >= 1;

    if (isLandscape) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full aspect-video bg-neutral-800 rounded-[1.2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-[8px] border-neutral-700 flex flex-col overflow-hidden">
            {/* Browser Header Bar */}
            <div className="h-6 flex items-center gap-1.5 px-3 bg-[#e5e7eb] border-b border-neutral-300">
               <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
               <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
               <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
               <div className="ml-4 flex-1 h-3 bg-white/60 rounded-full border border-neutral-300/50" />
            </div>
            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-white">
              <img src={imageUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt="cover" />
            </div>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center p-2">
          <div className="relative w-[75%] aspect-[9/19] bg-[#0c0c0c] p-[4%] rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] ring-[10px] ring-neutral-800 border-[2px] border-neutral-700 flex flex-col overflow-hidden">
            {/* Smartphone Speaker/Sensor */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[35%] h-5 bg-[#0c0c0c] rounded-full z-30 shadow-inner flex items-center justify-center">
               <div className="w-10 h-1 bg-neutral-800 rounded-full" />
            </div>
            {/* Screen Area */}
            <div className="flex-1 rounded-[2.2rem] overflow-hidden bg-white shadow-inner">
              <img src={imageUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt="cover" />
            </div>
            {/* Reflection */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
          </div>
        </div>
      );
    }
  };

  const templates = {
    classic: (
      <div className="relative w-full h-full bg-white flex flex-col pt-24 px-10 overflow-hidden">
        <div className="absolute top-10 left-10 text-3xl font-playfair italic text-neutral-200">
          {seriesNumber}
        </div>
        <div className="z-10 mb-8 text-neutral-900">
          {renderTitle("text-4xl")}
        </div>
        <div className="flex-1 flex items-center justify-center pb-16">
          <div className="w-full aspect-square rounded-[32px] shadow-2xl overflow-hidden ring-[10px] ring-neutral-50 -rotate-1 transform-gpu">
             <ImageWithFrame />
          </div>
        </div>
      </div>
    ),
    magazine: (
      <div className="relative w-full h-full bg-neutral-50 flex flex-col p-6 overflow-hidden">
        <div className="flex-1 rounded-[24px] overflow-hidden relative shadow-inner bg-neutral-200">
          <ImageWithFrame />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
        </div>
        <div className="absolute top-14 left-0 w-full px-10 z-20 text-white drop-shadow-2xl">
          <div className="text-[10px] font-black tracking-[0.5em] mb-3 opacity-90 uppercase">{seriesNumber}</div>
          {renderTitle("text-5xl")}
        </div>
        <div className="h-20 flex items-center justify-between px-2">
           <div className="text-[9px] font-black text-neutral-400 tracking-tighter uppercase leading-none">
              REDCANVAS<br/>MAGAZINE 2024
           </div>
           <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white font-bold text-[9px]">
              XHS
           </div>
        </div>
      </div>
    ),
    minimal: (
      <div className="relative w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center px-12 text-center">
        <div className="mb-6 text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase">
          {seriesNumber || 'EDITORIAL'}
        </div>
        <div className="mb-12">
          {renderTitle("text-3xl")}
        </div>
        <div className="w-48 aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl bg-neutral-50">
           <ImageWithFrame />
        </div>
      </div>
    ),
    bold: (
      <div className="relative w-full h-full bg-neutral-950 flex flex-col overflow-hidden p-8">
        <div className="absolute inset-0 opacity-40">
           <ImageWithFrame />
           <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="mt-auto z-10 text-white">
          <div className="w-12 h-1 bg-white mb-6" />
          {renderTitle("text-6xl")}
          <div className="mt-8 font-playfair italic text-2xl opacity-50">{seriesNumber}</div>
        </div>
      </div>
    ),
    floating: (
      <div className="relative w-full h-full bg-[#f2f2f2] p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-20 mb-8">
          <div className="bg-neutral-900 text-white px-3 py-1 inline-block rounded-lg font-bold text-[10px] mb-4 tracking-widest">
            {seriesNumber} EDITION
          </div>
          {renderTitle("text-4xl")}
        </div>
        <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-2xl z-10 transform rotate-1 bg-white">
           <ImageWithFrame />
        </div>
      </div>
    )
  };

  return (
    <div 
      className="relative w-full max-w-[400px] aspect-[3/4] rounded-[44px] overflow-hidden border-[12px] border-neutral-900 bg-white preview-shadow select-none"
      style={{ boxSizing: 'border-box' }}
    >
      <div ref={ref} className="w-full h-full overflow-hidden">
        {templates[templateId]}
      </div>
      {/* Glossy Bezel Effect */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[32px]" />
    </div>
  );
});

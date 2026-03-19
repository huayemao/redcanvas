'use client';

import React, { useRef, useState, useEffect } from 'react';
import { TEMPLATES } from '../constants';
import { TemplateId, Orientation, ExportSize, EditorState } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { CoverRenderer } from './CoverRenderer';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface TemplateCarouselProps {
  onSelectTemplate: (templateId: TemplateId, orientation: Orientation, exportSize: ExportSize) => void;
}

const SAMPLE_STATE: EditorState = {
  title: "我，花野猫\n喜欢写代码\n想开发小工具找我",
  highlights: [
    { id: '1', text: '花野猫', color: '#ff2442', style: 'underline' },
    { id: '2', text: '写代码', color: '#ff601a', style: 'text' },
    { id: '3', text: '开发小工具', color: '#6bcbff', style: 'underline' }
  ],
  seriesNumber: "#01",
  imageUrl: "/screenshot.png",
  imageAspectRatio: 1.5,
  showDeviceFrame: true,
  deviceType: 'macbook',
  templateId: 'classic',
  fontFamily: 'kuaile',
  accentColor: '#ff2442',
  orientation: 'portrait',
  exportSize: 'xiaohongshu',
};

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({ onSelectTemplate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      skipSnaps: false,
    },
    [Autoplay({ delay: 5000 })]
  );

  const handleSelectTemplate = (templateId: TemplateId) => {
    // 根据模板类型默认选择合适的方向和导出尺寸
    let orientation: Orientation = 'portrait';
    let exportSize: ExportSize = 'xiaohongshu';

    onSelectTemplate(templateId, orientation, exportSize);
  };

  const nextSlide = () => {
    emblaApi?.scrollNext();
  };

  const prevSlide = () => {
    emblaApi?.scrollPrev();
  };

  const scrollToIndex = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative w-full max-w-5xl mx-auto my-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">精选模板</h2>
        <a href="/store" className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
          查看全部模板
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      
      <div className="relative overflow-hidden rounded-2xl">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {TEMPLATES.map((template, index) => (
              <div key={template.id} className="min-w-full">
                <div className="relative h-80 sm:h-[600px] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800 opacity-70" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
                    <div className="flex-1 flex items-center justify-center">
                      <CoverRenderer 
                        state={{
                          ...SAMPLE_STATE,
                          templateId: template.id,
                          orientation: 'portrait',
                          exportSize: 'xiaohongshu',
                          showDeviceFrame: ['mockup','bold','magazine'].includes(template.id) ? false : true,
                        }}
                        ref={() => {}}
                      />
                    </div>
                    
                    <div className="flex-1 text-white">
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4">{template.name}</h3>
                      <p className="text-white/80 mb-6 max-w-lg">{template.description}</p>
                      <button
                        onClick={() => handleSelectTemplate(template.id)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors font-medium"
                      >
                        立即使用
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {TEMPLATES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

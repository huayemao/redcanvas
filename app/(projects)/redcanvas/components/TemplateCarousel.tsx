'use client';

import React, { useRef, useState, useEffect } from 'react';
import { TEMPLATES } from '../constants';
import { TemplateId, Orientation, ExportSize, EditorState } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { CoverRenderer } from './CoverRenderer';
import { motion } from 'framer-motion';
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
    <div className="relative  mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className=" mx-auto"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex ">
              {TEMPLATES.map((template, index) => (
                <div key={template.id} className="min-w-full">
                  <div className="relative h-full ">
                    <div className="relative z-10 max-w-sm sm:max-w-md lg:max-w-4xl" style={{textAlign:'revert'}}>
                       <CoverRenderer
                          state={{
                            ...SAMPLE_STATE,
                            templateId: template.id,
                            orientation: 'portrait',
                            exportSize: 'xiaohongshu',
                            showDeviceFrame: ['mockup', 'bold', 'magazine'].includes(template.id) ? false : true,
                          }}
                          ref={() => { }}
                        />
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
      </motion.div>
    </div>
  );
};

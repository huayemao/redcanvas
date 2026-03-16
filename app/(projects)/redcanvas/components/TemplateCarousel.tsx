'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TEMPLATES } from '../constants';
import { TemplateId, Orientation, ExportSize, EditorState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Preview } from './Preview';

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleSelectTemplate = (templateId: TemplateId) => {
    // 根据模板类型默认选择合适的方向和导出尺寸
    let orientation: Orientation = 'portrait';
    let exportSize: ExportSize = 'xiaohongshu';

    onSelectTemplate(templateId, orientation, exportSize);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === TEMPLATES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? TEMPLATES.length - 1 : prev - 1));
  };

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto my-12">
      <h2 className="text-2xl font-bold text-center mb-8">精选模板</h2>
      
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative h-80 sm:h-[600px] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800 opacity-70" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
              <div className="flex-1 flex items-center justify-center">
                <Preview 
                  state={{
                    ...SAMPLE_STATE,
                    templateId: TEMPLATES[currentIndex].id,
                    orientation: 'portrait',
                    exportSize: 'xiaohongshu',
                    showDeviceFrame: ['mockup','bold','magazine'].includes(TEMPLATES[currentIndex].id) ? false : true,
                  }}
                  ref={() => {}}
                />
              </div>
              
              <div className="flex-1 text-white">
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">{TEMPLATES[currentIndex].name}</h3>
                <p className="text-white/80 mb-6 max-w-lg">{TEMPLATES[currentIndex].description}</p>
                <button
                  onClick={() => handleSelectTemplate(TEMPLATES[currentIndex].id)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors font-medium"
                >
                  立即使用
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

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
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

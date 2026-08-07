'use client';

import React, { forwardRef, useRef } from 'react';
import { usePlogStore } from '../../store/usePlogStore';
import { FONTS } from '../../constants';
import { ProductTemplate } from './templates/ProductTemplate';
import { DailyTemplate } from './templates/DailyTemplate';
import { SocialTemplate } from './templates/SocialTemplate';
import { PlogElement } from './PlogElement';

export const PlogCanvas = forwardRef<HTMLDivElement>((_, ref) => {
  const {
    plogScenario,
    plogTemplateId,
    aspectRatio,
    customWidth,
    customHeight,
    bgType,
    bgColor,
    gradientStart,
    gradientEnd,
    images,
    elements,
    fontFamily,
    titleText,
    subtitleText,
    setSelectedElementId,
  } = usePlogStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const fontConfig = FONTS.find((f) => f.id === fontFamily) || FONTS[0];

  // Aspect ratio styling
  let containerStyle: React.CSSProperties = {};
  let aspectClass = 'aspect-[3/4] max-w-[480px]';

  if (aspectRatio === '1:1') aspectClass = 'aspect-[1/1] max-w-[500px]';
  if (aspectRatio === '9:16') aspectClass = 'aspect-[9/16] max-w-[420px]';
  if (aspectRatio === '4:3') aspectClass = 'aspect-[4/3] max-w-[580px]';
  if (aspectRatio === '16:9') aspectClass = 'aspect-[16/9] max-w-[620px]';
  if (aspectRatio === '3:2') aspectClass = 'aspect-[3/2] max-w-[580px]';
  if (aspectRatio === 'custom') {
    aspectClass = 'max-w-[600px]';
    containerStyle.aspectRatio = `${customWidth} / ${customHeight}`;
  }

  // Background styling
  let bgStyle: React.CSSProperties = {};
  if (bgType === 'color') {
    bgStyle.backgroundColor = bgColor;
  } else if (bgType === 'gradient') {
    bgStyle.background = `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;
  }

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden preview-shadow select-none mx-auto rounded-[32px]`}
      style={containerStyle}
      onClick={() => setSelectedElementId(null)}
    >
      <div
        ref={(node) => {
          // Sync internal ref and forwarded export ref
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="w-full h-full relative overflow-hidden transition-all duration-300"
        style={bgStyle}
      >
        {/* Background Photo Blur option */}
        {bgType === 'blur' && images[0]?.url && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={images[0].url}
              alt="Bg Blur"
              className="w-full h-full object-cover blur-2xl scale-125 opacity-60"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        {/* Scenario Template Content Layer */}
        {plogScenario === 'product' && (
          <ProductTemplate
            images={images}
            title={titleText}
            subtitle={subtitleText}
            fontClassName={fontConfig.className}
            templateVariant={plogTemplateId}
          />
        )}

        {plogScenario === 'daily' && (
          <DailyTemplate
            images={images}
            title={titleText}
            subtitle={subtitleText}
            fontClassName={fontConfig.className}
            templateVariant={plogTemplateId}
          />
        )}

        {plogScenario === 'social' && (
          <SocialTemplate
            images={images}
            title={titleText}
            subtitle={subtitleText}
            fontClassName={fontConfig.className}
            templateVariant={plogTemplateId}
          />
        )}

        {/* Draggable Layer Elements Overlay */}
        {elements.map((el) => (
          <PlogElement
            key={el.id}
            element={el}
            containerRef={containerRef}
            fontClassName={fontConfig.className}
          />
        ))}
      </div>
    </div>
  );
});

PlogCanvas.displayName = 'PlogCanvas';

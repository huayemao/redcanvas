'use client';

import React, { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { usePlogStore } from '../../store/usePlogStore';
import { FONTS } from '../../constants';
import { ProductTemplate } from './templates/ProductTemplate';
import { DailyTemplate } from './templates/DailyTemplate';
import { SocialTemplate } from './templates/SocialTemplate';
import { PlogElement } from './PlogElement';
import { parseRgbColor, getColorLuminance } from '../../lib/svgRecolor';
import { resolveCanvasBackground, CANVAS_BLUR_BASE_COLOR } from '../../lib/canvasBackground';
import { resolveCanvasLogicalSize } from '../../lib/canvasSize';

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
    extractedColors,
  } = usePlogStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [availWidth, setAvailWidth] = useState<number>(0);

  const fontConfig = FONTS.find((f) => f.id === fontFamily) || FONTS[0];

  const { width: logicalWidth, height: logicalHeight } = resolveCanvasLogicalSize(
    aspectRatio,
    customWidth,
    customHeight
  );

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) setAvailWidth(w);
    };
    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const displayScale =
    availWidth > 0 && availWidth < logicalWidth ? availWidth / logicalWidth : 1;
  const scaledWidth = Math.round(logicalWidth * displayScale * 100) / 100;
  const scaledHeight = Math.round(logicalHeight * displayScale * 100) / 100;

  const transformPoint = useCallback(
    (p: { x: number; y: number }) =>
      displayScale !== 1 && displayScale > 0
        ? { x: p.x / displayScale, y: p.y / displayScale }
        : p,
    [displayScale]
  );

  // Background styling
  const { style: bgStyle } = resolveCanvasBackground({ bgType, bgColor, gradientStart, gradientEnd });

  return (
    <div
      ref={measureRef}
      className="w-full flex justify-center select-none"
      onClick={() => setSelectedElementId(null)}
    >
      <div
        className="relative overflow-hidden preview-shadow rounded-[32px]"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          data-canvas-scaler="true"
          style={{
            width: `${logicalWidth}px`,
            height: `${logicalHeight}px`,
            transform: displayScale !== 1 ? `scale(${displayScale})` : undefined,
            transformOrigin: 'top left',
          }}
        >
          <MotionConfig transformPagePoint={transformPoint}>
            <div
              ref={(node) => {
                // Sync internal ref and forwarded export ref
                containerRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
              }}
              className="w-full h-full relative overflow-hidden transition-colors duration-300"
              style={{
                ...bgStyle,
                width: `${logicalWidth}px`,
                height: `${logicalHeight}px`,
              }}
            >
        {/* Background Photo Blur option */}
        {bgType === 'blur' && images[0]?.url && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ backgroundColor: CANVAS_BLUR_BASE_COLOR }}
          >
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
        {(() => {
          const effCanvasBg = bgType === 'color' ? bgColor : gradientStart;
          const canvasTextColor =
            elements.find((e) => (e.type === 'text' || e.type === 'longtext') && e.color)?.color ||
            extractedColors?.textPrimary ||
            extractedColors?.textSecondary ||
            (getColorLuminance(parseRgbColor(effCanvasBg) || [15, 23, 42]) < 0.45 ? '#F8F6F2' : '#111827');

          return elements.map((el) => (
            <PlogElement
              key={el.id}
              element={el}
              containerRef={containerRef}
              canvasBg={effCanvasBg}
              canvasTextColor={canvasTextColor}
              fontClassName={fontConfig.className}
              extractedColors={extractedColors}
            />
          ));
        })()}
            </div>
          </MotionConfig>
        </div>
      </div>
    </div>
  );
});

PlogCanvas.displayName = 'PlogCanvas';

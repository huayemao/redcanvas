'use client';

import React from 'react';
import { PlogElement as PlogElementType, SHADOW_PRESETS } from '../../types';
import { Layers } from 'lucide-react';

interface StackWidgetBlockProps {
  element: PlogElementType;
  textInlines?: React.CSSProperties;
}

export const StackWidgetBlock: React.FC<StackWidgetBlockProps> = ({
  element,
  textInlines,
}) => {
  const defaultImages = [
    '/screenshot.png',
    '/mockup_scene.webp',
    '/laptop-scene.webp',
  ];

  const images =
    element.stackImages && element.stackImages.length > 0
      ? element.stackImages
      : defaultImages;

  const N = images.length;
  const style = element.stackStyle || 'fan';
  const aspect = element.stackCardAspect || '3:4';

  const aspectCss =
    aspect === '1:1'
      ? '1 / 1'
    : aspect === '4:3'
      ? '4 / 3'
    : aspect === '9:16'
      ? '9 / 16'
    : '3 / 4'; // 默认 3:4

  const rotationSpread = element.stackRotation ?? 8;
  const offsetSpread = element.stackOffset ?? 14;
  const isPolaroid = style === 'polaroid';
  const cardRadius = element.stackCardRadius ?? (isPolaroid ? 6 : 14);
  const borderWidth = element.borderWidth ?? (isPolaroid ? 0 : 1);
  const borderColor = element.borderColor || (isPolaroid ? 'transparent' : 'rgba(255,255,255,0.75)');
  const shadow = SHADOW_PRESETS[element.shadowLevel ?? 3] || SHADOW_PRESETS[3];
  const showCountBadge = element.showCountBadge !== false;

  // 容器尺寸留出旋转与错位的裕量，既保证边缘不被裁切，又保持整体饱满
  const paddingX = Math.min(28, Math.max(12, Math.round(offsetSpread * 1.5 + rotationSpread * 1.0)));
  const paddingY = Math.min(24, Math.max(10, Math.round(offsetSpread * 1.2 + rotationSpread * 0.8)));

  return (
    <div
      className="relative select-none flex items-center justify-center pointer-events-none w-full"
      style={{
        padding: `${paddingY}px ${paddingX}px`,
        ...textInlines,
      }}
    >
      {/* 叠放的卡片列表：宽度 100% 充满父级，高度由 aspectRatio 自动锁定比例计算 */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          aspectRatio: aspectCss,
        }}
      >
        {images.map((imgUrl, i) => {
          const topIdx = N - 1;
          const diff = topIdx - i;
          const mid = (N - 1) / 2;
          const norm = N > 1 ? (i - mid) / (mid || 1) : 0;

          let rot = 0;
          let dx = 0;
          let dy = 0;
          let scale = 1;
          let opacity = 1;

          if (style === 'fan') {
            // 扇形微斜：自然扩散旋转与小幅度位移
            rot = norm * rotationSpread;
            dx = norm * offsetSpread * 1.35;
            dy = Math.abs(norm) * (offsetSpread * 0.35);
          } else if (style === 'cascade') {
            // 阶梯斜叠：等比斜向错开
            rot = -diff * (rotationSpread * 0.25);
            dx = -diff * offsetSpread;
            dy = -diff * (offsetSpread * 0.85);
            scale = 1 - diff * 0.04;
          } else if (style === 'polaroid') {
            // 拍立得：散落相纸感
            rot = norm * rotationSpread + (i % 2 === 0 ? -1.5 : 1.5);
            dx = norm * offsetSpread * 1.25;
            dy = Math.abs(norm) * 5;
          } else if (style === 'minimal') {
            // 极简画册：纵深居中叠放
            rot = 0;
            dx = 0;
            dy = -diff * (offsetSpread * 1.1);
            scale = 1 - diff * 0.055;
            opacity = 1 - diff * 0.12;
          }

          return (
            <div
              key={`${imgUrl}-${i}`}
              className="absolute inset-0 transition-transform duration-200"
              style={{
                zIndex: i + 1,
                transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg) scale(${scale})`,
                opacity,
              }}
            >
              {isPolaroid ? (
                // 拍立得相框模式：四边白色相纸底衬，底边留白宽一些
                <div
                  className="w-full h-full p-2 pb-6 bg-white flex flex-col justify-between"
                  style={{
                    borderRadius: `${cardRadius}px`,
                    boxShadow: shadow,
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden bg-neutral-100 rounded-sm"
                    style={{ flex: '1 1 auto' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Stack item ${i + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  {/* 拍立得底部手写感小字或空白 */}
                  <div className="pt-1.5 flex items-center justify-between px-1 text-[8px] font-mono font-bold text-neutral-400 select-none">
                    <span>#{String(i + 1).padStart(2, '0')}</span>
                    <span className="tracking-widest uppercase">POLAROID</span>
                  </div>
                </div>
              ) : (
                // 现代卡片模式：优雅圆角、微光边框、浮游阴影
                <div
                  className="w-full h-full overflow-hidden relative"
                  style={{
                    borderRadius: `${cardRadius}px`,
                    border: `${borderWidth}px solid ${borderColor}`,
                    boxShadow: shadow,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Stack item ${i + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  {/* 顶部高光层，提升立体杂志质感 */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 叠放张数角标（如：3 PHOTOS） */}
      {showCountBadge && (
        <div
          className="absolute bottom-2 right-4 z-50 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-xl pointer-events-none"
          style={{ fontSize: '9px', fontWeight: 900 }}
        >
          <Layers className="w-2.5 h-2.5 text-red-400" />
          <span className="tracking-wider">{N} 图叠放</span>
        </div>
      )}
    </div>
  );
};

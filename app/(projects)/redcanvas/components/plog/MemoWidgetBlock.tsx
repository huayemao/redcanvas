'use client';

import React from 'react';
import { PlogElement as PlogElementType, SHADOW_PRESETS } from '../../types';
import { resolveFontClass } from './elementUtils';

interface MemoWidgetBlockProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
}

export const MemoWidgetBlock: React.FC<MemoWidgetBlockProps> = ({
  element,
  fontClassName,
  textInlines,
}) => {
  const textColor = element.color || '#18181b';
  const bgColor = element.bgColor || '#ffffff';
  const borderColor = element.borderColor || 'rgba(0,0,0,0.08)';
  const badgeBg = element.badgeBg || '#18181b';
  const badgeText = element.badgeText || 'NOTE';
  const shadow = SHADOW_PRESETS[element.shadowLevel ?? 2] || 'none';
  const baseSize = element.fontSize ?? 13;

  return (
    <div
      className={`inline-flex flex-col gap-1.5 select-none ${resolveFontClass(element.fontFamily, fontClassName)}`}
      style={textInlines}
    >
      {/* 顶部徽章 */}
      {badgeText && (
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black w-max shadow-sm"
          style={{ backgroundColor: badgeBg, color: '#ffffff' }}
        >
          <span>{badgeText}</span>
        </div>
      )}

      {/* 卡片正文 */}
      <div
        className="px-3.5 py-2.5 rounded-2xl border leading-relaxed max-w-sm whitespace-pre-wrap"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: textColor,
          boxShadow: shadow,
          fontSize: `${baseSize}px`,
        }}
      >
        {element.content || '记录灵感与备忘细节'}
      </div>
    </div>
  );
};

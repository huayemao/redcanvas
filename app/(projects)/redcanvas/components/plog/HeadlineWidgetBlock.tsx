'use client';

import React from 'react';
import { PlogElement as PlogElementType } from '../../types';
import { resolveFontClass } from './elementUtils';

interface HeadlineWidgetBlockProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
}

export const HeadlineWidgetBlock: React.FC<HeadlineWidgetBlockProps> = ({
  element,
  fontClassName,
  textInlines,
}) => {
  const baseSize = element.fontSize ?? 26;
  const titleColor = element.titleColor || element.color || '#111827';
  const subtitleColor = element.subtitleColor || element.color || '#44403C';
  const accentColor = element.accentColor || '#ff2442';
  const textAlign = element.textAlign || 'left';
  const showLine = element.showLine !== false;

  const alignClass =
    textAlign === 'center'
      ? 'items-center text-center'
      : textAlign === 'right'
      ? 'items-end text-right'
      : 'items-start text-left';

  return (
    <div
      className={`inline-flex flex-col select-none max-w-full ${alignClass} ${resolveFontClass(element.fontFamily, fontClassName)}`}
      style={textInlines}
    >
      {/* 主标题 */}
      <div
        className="font-black leading-tight tracking-tight whitespace-pre-wrap"
        style={{
          color: titleColor,
          fontSize: `${baseSize}px`,
        }}
      >
        {element.content || '杂志主标题'}
      </div>

      {/* 装饰短分割线 */}
      {showLine && (
        <span
          className="my-2 rounded-full"
          style={{
            width: `${Math.max(20, baseSize * 0.9)}px`,
            height: '2.5px',
            backgroundColor: accentColor,
          }}
        />
      )}

      {/* 副标题 */}
      {element.subtitle && (
        <div
          className="font-medium leading-relaxed tracking-normal whitespace-pre-wrap opacity-80"
          style={{
            color: subtitleColor,
            fontSize: `${Math.max(12, Math.round(baseSize * 0.45))}px`,
          }}
        >
          {element.subtitle}
        </div>
      )}
    </div>
  );
};

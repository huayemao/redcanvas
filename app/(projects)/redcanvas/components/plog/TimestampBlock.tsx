'use client';

import React, { useMemo } from 'react';
import { PlogElement as PlogElementType } from '../../types';
import { resolveFontClass } from './elementUtils';

// ============================================================================
//  TimestampBlock：杂志风日期块
//  - content 存日期串(YYYY-MM-DD)，空 = 今天，无效 = 今天
//  - 渲染：顶部短横线 + 大号 年·月·日 + 星期中文/英文（统一文字色，无强调色）
// ============================================================================
interface TimestampBlockProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
}

const WEEKDAY_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAY_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const TimestampBlock: React.FC<TimestampBlockProps> = ({
  element,
  fontClassName,
  textInlines,
}) => {
  const date = useMemo(() => {
    const raw = (element.content || '').trim();
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [element.content]);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdayCn = WEEKDAY_CN[date.getDay()];
  const weekdayEn = WEEKDAY_EN[date.getDay()];

  const textColor = element.color || '#111827';
  const baseSize = element.fontSize ?? 14;

  return (
    <div
      className={`inline-flex flex-col ${resolveFontClass(element.fontFamily, fontClassName)}`}
      style={{ color: textColor, ...textInlines }}
    >
      {/* 顶部短横线（沿用文字色） */}
      {/* <span
        style={{ width: '30px', height: '2px', background: 'currentColor', marginBottom: '7px' }}
      /> */}
      {/* 主日期：年 · 月 · 日 */}
      <div
        className="tracking-wider leading-none"
        style={{ fontSize: `${baseSize * 1.2}px`, letterSpacing: '0.04em' }}
      >
        <span>{year}</span>
        年
        <span>{month}</span>
        月
        <span>{day}</span>
        日
      </div>
      {/* 星期：中文 + 英文缩写 */}
      <div
        className="flex items-center gap-1.5 mt-1.5"
        style={{ fontSize: `${baseSize * 1}px` }}
      >
        <span className="font-bold">{weekdayCn}</span>
        <span style={{ fontWeight: 900, opacity: 0.45 }}>·</span>
        <span className="font-black tracking-widest opacity-70">{weekdayEn}</span>
      </div>
    </div>
  );
};

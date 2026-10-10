'use client';

import React, { useMemo } from 'react';
import { PlogElement as PlogElementType } from '../../types';
import { resolveFontClass } from './elementUtils';

// ============================================================================
//  TimestampBlock：复合时间戳控件
//  - 控件整体不可分割，拖拽时统一移动
//  - 支持多样化杂志风排版：magazine (经典杂志) / checkin (小红书打卡) /
//    polaroid (拍立得胶片) / minimal (极简数字) / stamp (复古印章)
// ============================================================================
interface TimestampBlockProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
}

const WEEKDAY_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAY_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
  const monthEn = MONTH_EN[date.getMonth()];

  const textColor = element.color || '#111827';
  const accentColor = element.accentColor || '#ff2442';
  const baseSize = element.fontSize ?? 14;
  const styleVariant = element.timestampStyle || 'magazine';

  const showYear = element.showYear !== false;
  const showWeekday = element.showWeekday !== false;
  const subText = element.subText || '';

  // 1. 打卡日记风：小红书 REC 药丸徽章 + 醒目日期
  if (styleVariant === 'checkin') {
    return (
      <div
        className={`inline-flex flex-col gap-1.5 select-none ${resolveFontClass(element.fontFamily, fontClassName)}`}
        style={{ color: textColor, ...textInlines }}
      >
        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black w-max shadow-sm"
          style={{ backgroundColor: accentColor, color: '#ffffff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="tracking-wider">{subText || 'REC · DAILY'}</span>
        </div>
        <div className="flex items-baseline gap-2 leading-none">
          <span
            className="font-black tracking-wide"
            style={{ fontSize: `${baseSize * 1.3}px` }}
          >
            {showYear ? `${year}年` : ''}{month}月{day}日
          </span>
          {showWeekday && (
            <span
              className="font-black tracking-widest opacity-75"
              style={{ fontSize: `${baseSize * 0.85}px` }}
            >
              {weekdayEn}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. 拍立得胶片风：边框标签 # PHOTO LOG + 等宽胶片日期
  if (styleVariant === 'polaroid') {
    return (
      <div
        className={`inline-flex flex-col gap-1 select-none ${resolveFontClass(element.fontFamily, fontClassName)}`}
        style={{ color: textColor, ...textInlines }}
      >
        <div
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider w-max"
          style={{ borderColor: textColor, opacity: 0.85 }}
        >
          <span className="opacity-50">#</span>
          <span>{subText || 'PHOTO LOG'}</span>
        </div>
        <div
          className="font-mono font-black tracking-widest leading-none mt-0.5"
          style={{ fontSize: `${baseSize * 1.25}px` }}
        >
          {showYear ? `${year}.` : ''}{month}.{day}
        </div>
        {showWeekday && (
          <div
            className="flex items-center gap-1.5 text-[10px] font-bold opacity-75 tracking-wider"
            style={{ fontSize: `${baseSize * 0.75}px` }}
          >
            <span>{weekdayCn}</span>
            <span>·</span>
            <span>{weekdayEn}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. 极简数字风：超粗 10 / 10 + 侧边英文
  if (styleVariant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center gap-2.5 select-none ${resolveFontClass(element.fontFamily, fontClassName)}`}
        style={{ color: textColor, ...textInlines }}
      >
        <div
          className="font-black leading-none tracking-tight flex items-center"
          style={{ fontSize: `${baseSize * 1.6}px` }}
        >
          <span>{month}</span>
          <span className="mx-1 opacity-40 font-light">/</span>
          <span>{day}</span>
        </div>
        <div className="flex flex-col justify-center leading-tight border-l pl-2 border-current/25">
          {showYear && (
            <span className="font-mono text-[10px] font-bold opacity-60 tracking-wider">
              {year}
            </span>
          )}
          {showWeekday && (
            <span className="font-black text-[10px] tracking-widest">
              {monthEn} · {weekdayEn}
            </span>
          )}
          {subText && (
            <span className="text-[9px] font-medium opacity-70">
              {subText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. 复古印章风：双层印章圆角框
  if (styleVariant === 'stamp') {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center p-2 rounded-xl border-2 select-none ${resolveFontClass(element.fontFamily, fontClassName)}`}
        style={{
          borderColor: accentColor,
          color: textColor,
          ...textInlines,
        }}
      >
        <div
          className="text-[9px] font-black tracking-widest uppercase mb-1"
          style={{ color: accentColor }}
        >
          ★ {subText || 'DAILY SNAP'} ★
        </div>
        <div
          className="font-mono font-black tracking-widest leading-none px-1"
          style={{ fontSize: `${baseSize * 1.15}px` }}
        >
          {showYear ? `${year}.` : ''}{month}.{day}
        </div>
        {showWeekday && (
          <div
            className="text-[9px] font-bold tracking-widest opacity-80 mt-1 uppercase"
          >
            {weekdayEn} · {weekdayCn}
          </div>
        )}
      </div>
    );
  }

  // 5. 默认：杂志经典风（Magazine Classic）
  return (
    <div
      className={`inline-flex flex-col select-none ${resolveFontClass(element.fontFamily, fontClassName)}`}
      style={{ color: textColor, ...textInlines }}
    >
      {/* 顶部短横线 */}
      <span
        style={{
          width: '28px',
          height: '2px',
          backgroundColor: accentColor || textColor,
          marginBottom: '8px',
          borderRadius: '1px',
        }}
      />
      {/* 主日期：年 · 月 · 日 */}
      <div
        className="tracking-wider leading-none font-bold"
        style={{ fontSize: `${baseSize * 1.25}px`, letterSpacing: '0.04em' }}
      >
        {showYear && (
          <>
            <span className="font-black">{year}</span>
            <span className="text-[0.8em] font-normal mx-0.5">年</span>
          </>
        )}
        <span className="font-black">{month}</span>
        <span className="text-[0.8em] font-normal mx-0.5">月</span>
        <span className="font-black">{day}</span>
        <span className="text-[0.8em] font-normal mx-0.5">日</span>
      </div>
      {/* 星期：中文 + 英文缩写 */}
      {showWeekday && (
        <div
          className="flex items-center gap-1.5 mt-1.5 opacity-80"
          style={{ fontSize: `${baseSize * 0.9}px` }}
        >
          <span className="font-bold">{weekdayCn}</span>
          <span style={{ fontWeight: 900, opacity: 0.45 }}>·</span>
          <span className="font-black tracking-widest opacity-85">{weekdayEn}</span>
          {subText && (
            <>
              <span style={{ fontWeight: 900, opacity: 0.45 }}>·</span>
              <span className="font-medium tracking-wide">{subText}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

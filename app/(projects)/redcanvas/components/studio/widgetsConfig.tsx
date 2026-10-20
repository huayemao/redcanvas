'use client';

import React from 'react';
import { PlogElement } from '../../types';
import { StudioThemeColors } from '../../store/useStudioStore';

export type WidgetCategory = 'all' | 'stack' | 'timestamp' | 'typography' | 'card';

export interface WidgetContext {
  nextZ: number;
  colors: StudioThemeColors;
  fontFamily: string;
  generateId: () => string;
}

export interface StudioWidgetPreset {
  id: string;
  name: string;
  category: WidgetCategory;
  categoryLabel: string;
  tag: string;
  description: string;
  renderPreview: (colors: StudioThemeColors) => React.ReactNode;
  createElements: (context: WidgetContext) => PlogElement[];
}

export const WIDGET_CATEGORIES: { id: WidgetCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'stack', label: '层叠相卡' },
  { id: 'timestamp', label: '时间戳' },
  { id: 'typography', label: '主副标题' },
  { id: 'card', label: '便签卡片' },
];

export const STUDIO_WIDGETS: StudioWidgetPreset[] = [
  // 0. 画报层叠相卡
  {
    id: 'widget-card-stack',
    name: '画报层叠相卡',
    category: 'stack',
    categoryLabel: '相卡叠放',
    tag: '多图叠放',
    description: '多图层叠卡片 · 扇形微斜 / 杂志级立体浮游阴影（整体拖拽）',
    renderPreview: (colors) => (
      <div className="relative h-12 w-28 flex items-center justify-center select-none">
        <div
          className="absolute w-12 h-14 rounded-md bg-white/20 border border-white/20 shadow-sm"
          style={{ transform: 'translate3d(-10px, 1px, 0) rotate(-9deg)' }}
        />
        <div
          className="absolute w-12 h-14 rounded-md bg-white/40 border border-white/30 shadow-md"
          style={{ transform: 'translate3d(8px, 2px, 0) rotate(8deg)' }}
        />
        <div
          className="absolute w-12 h-14 rounded-md bg-white/80 border border-white/50 shadow-xl overflow-hidden flex flex-col items-center justify-center text-[8px] font-black"
          style={{ transform: 'translate3d(0, -1px, 0) rotate(-1deg)', color: '#111827' }}
        >
          <span className="text-[7px] tracking-widest text-red-500">STACK</span>
          <span className="text-[9px]">3 PICS</span>
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-stack-${generateId()}`,
        type: 'stack',
        content: '画报层叠相卡',
        stackImages: ['/screenshot.png', '/mockup_scene.webp', '/laptop-scene.webp'],
        stackStyle: 'fan',
        stackRotation: 8,
        stackOffset: 14,
        stackCardRadius: 14,
        stackCardAspect: '3:4',
        stackCardWidth: 190,
        widthPct: 44,
        showCountBadge: true,
        x: 18,
        y: 18,
        zIndex: nextZ,
        shadowLevel: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
      },
    ],
  },

  // 0.1 拍立得记忆叠
  {
    id: 'widget-polaroid-stack',
    name: '拍立得记忆叠',
    category: 'stack',
    categoryLabel: '相卡叠放',
    tag: '白框相纸',
    description: '经典拍立得白框相纸叠放 · 质感旅行生活日记（整体拖拽）',
    renderPreview: (colors) => (
      <div className="relative h-12 w-28 flex items-center justify-center select-none">
        <div
          className="absolute w-12 h-14 bg-white p-0.5 pb-2 shadow-sm rounded-sm"
          style={{ transform: 'translate3d(-9px, 1px, 0) rotate(-8deg)' }}
        >
          <div className="w-full h-full bg-neutral-200 rounded-[1px]" />
        </div>
        <div
          className="absolute w-12 h-14 bg-white p-0.5 pb-2 shadow-md rounded-sm"
          style={{ transform: 'translate3d(7px, 2px, 0) rotate(7deg)' }}
        >
          <div className="w-full h-full bg-neutral-300 rounded-[1px]" />
        </div>
        <div
          className="absolute w-12 h-14 bg-white p-0.5 pb-2 shadow-xl rounded-sm flex flex-col justify-between"
          style={{ transform: 'translate3d(0, -1px, 0) rotate(-1deg)' }}
        >
          <div className="w-full h-full bg-rose-100 rounded-[1px] flex items-center justify-center text-[7px] font-black text-rose-500">
            POLA
          </div>
          <div className="text-[5px] text-center font-mono text-neutral-400">#01</div>
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-stack-${generateId()}`,
        type: 'stack',
        content: '拍立得记忆叠',
        stackImages: ['/mockup_scene.webp', '/laptop-scene.webp', '/screenshot.png'],
        stackStyle: 'polaroid',
        stackRotation: 9,
        stackOffset: 12,
        stackCardRadius: 6,
        stackCardAspect: '3:4',
        stackCardWidth: 190,
        widthPct: 44,
        showCountBadge: true,
        x: 18,
        y: 18,
        zIndex: nextZ,
        shadowLevel: 3,
        borderWidth: 0,
        borderColor: 'transparent',
      },
    ],
  },

  // 1. 杂志经典时间戳
  {
    id: 'widget-timestamp-classic',
    name: '杂志经典时间戳',
    category: 'timestamp',
    categoryLabel: '时间戳',
    tag: '经典排版',
    description: '年·月·日 + 星期中英双语 · 顶部极简装饰条',
    renderPreview: (colors) => (
      <div className="flex flex-col gap-1 text-left font-sans select-none">
        <span className="w-5 h-0.5 rounded-full" style={{ backgroundColor: colors.accent }} />
        <div
          className="text-xs font-black tracking-wider leading-none"
          style={{ color: colors.textPrimary }}
        >
          2026年10月10日
        </div>
        <div
          className="flex items-center gap-1 text-[9px] font-bold opacity-80"
          style={{ color: colors.textSecondary }}
        >
          <span>星期六</span>
          <span>·</span>
          <span className="tracking-widest font-black">SAT</span>
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-timestamp-${generateId()}`,
        type: 'timestamp',
        timestampStyle: 'magazine',
        content: '',
        x: 12,
        y: 10,
        zIndex: nextZ,
        color: colors.textPrimary,
        accentColor: colors.accent,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 14,
        fontWeight: 800,
        shadowLevel: 0,
        showYear: true,
        showWeekday: true,
      },
    ],
  },

  // 2. 打卡记录戳 (小红书 REC 风格)
  {
    id: 'widget-timestamp-checkin',
    name: '打卡记录戳',
    category: 'timestamp',
    categoryLabel: '时间戳',
    tag: '打卡利器',
    description: '小红书 REC 药丸徽章 + 醒目大号日期',
    renderPreview: (colors) => (
      <div className="flex flex-col gap-1.5 text-left select-none">
        <div
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black w-max"
          style={{ backgroundColor: colors.accent, color: '#ffffff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>REC · DAILY</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-black" style={{ color: colors.textPrimary }}>
          <span>10月10日</span>
          <span className="opacity-40">/</span>
          <span className="text-[9px] opacity-75 font-mono">SAT</span>
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-timestamp-${generateId()}`,
        type: 'timestamp',
        timestampStyle: 'checkin',
        subText: 'REC · DAILY',
        content: '',
        x: 12,
        y: 10,
        zIndex: nextZ,
        color: colors.textPrimary,
        accentColor: colors.accent,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 14,
        fontWeight: 800,
        shadowLevel: 0,
        showYear: false,
        showWeekday: true,
      },
    ],
  },

  // 3. 拍立得胶片签
  {
    id: 'widget-timestamp-polaroid',
    name: '拍立得胶片签',
    category: 'timestamp',
    categoryLabel: '时间戳',
    tag: '胶片复古',
    description: '胶片标签 # PHOTO LOG + 等宽点阵日期',
    renderPreview: (colors) => (
      <div className="flex flex-col gap-1 text-left select-none">
        <div
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold border w-max"
          style={{ color: colors.textPrimary, borderColor: colors.textSecondary }}
        >
          <span className="opacity-50">#</span>
          <span>PHOTO LOG</span>
        </div>
        <div className="text-[11px] font-mono font-black tracking-widest" style={{ color: colors.textPrimary }}>
          2026.10.10
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-timestamp-${generateId()}`,
        type: 'timestamp',
        timestampStyle: 'polaroid',
        subText: 'PHOTO LOG',
        content: '',
        x: 12,
        y: 10,
        zIndex: nextZ,
        color: colors.textPrimary,
        accentColor: colors.accent,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 14,
        fontWeight: 800,
        shadowLevel: 0,
        showYear: true,
        showWeekday: true,
      },
    ],
  },

  // 4. 极简数字戳
  {
    id: 'widget-timestamp-minimal',
    name: '极简数字戳',
    category: 'timestamp',
    categoryLabel: '时间戳',
    tag: '画册极简',
    description: '特粗斜杠月/日 + 侧边英文月份与年份',
    renderPreview: (colors) => (
      <div className="flex items-center gap-2 select-none">
        <div className="text-base font-black leading-none" style={{ color: colors.textPrimary }}>
          10 / 10
        </div>
        <div className="flex flex-col text-[8px] border-l pl-1.5 font-bold leading-tight" style={{ color: colors.textSecondary }}>
          <span>2026</span>
          <span className="font-black">OCT · SAT</span>
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-timestamp-${generateId()}`,
        type: 'timestamp',
        timestampStyle: 'minimal',
        content: '',
        x: 12,
        y: 10,
        zIndex: nextZ,
        color: colors.textPrimary,
        accentColor: colors.accent,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 16,
        fontWeight: 900,
        shadowLevel: 0,
        showYear: true,
        showWeekday: true,
      },
    ],
  },

  // 5. 复古印章戳
  {
    id: 'widget-timestamp-stamp',
    name: '复古印章戳',
    category: 'timestamp',
    categoryLabel: '时间戳',
    tag: '印章美学',
    description: '双圈复古印章徽标与内嵌居中日期',
    renderPreview: (colors) => (
      <div
        className="flex flex-col items-center justify-center p-1.5 rounded-lg border-2 text-[9px] font-black select-none w-max"
        style={{ borderColor: colors.accent, color: colors.textPrimary }}
      >
        <span className="text-[7px] tracking-widest uppercase" style={{ color: colors.accent }}>★ DAILY CHECK ★</span>
        <span className="font-mono text-[10px] mt-0.5">2026.10.10</span>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-timestamp-${generateId()}`,
        type: 'timestamp',
        timestampStyle: 'stamp',
        subText: 'DAILY CHECK',
        content: '',
        x: 12,
        y: 10,
        zIndex: nextZ,
        color: colors.textPrimary,
        accentColor: colors.accent,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 14,
        fontWeight: 800,
        shadowLevel: 0,
        showYear: true,
        showWeekday: true,
      },
    ],
  },

  // 6. 杂志主副标题组合控件
  {
    id: 'widget-headline-combo',
    name: '主副标题组合',
    category: 'typography',
    categoryLabel: '主副标题',
    tag: '排版重心',
    description: '杂志特大号主标题 + 描述副标题与装饰标线（统一拖拽）',
    renderPreview: (colors) => (
      <div className="flex flex-col gap-1 text-left select-none">
        <div className="text-xs font-black tracking-tight leading-none" style={{ color: colors.textPrimary }}>
          极简设计理念
        </div>
        <span className="w-5 h-0.5 rounded-full" style={{ backgroundColor: colors.accent }} />
        <div className="text-[9px] opacity-75 line-clamp-1 leading-none" style={{ color: colors.textSecondary }}>
          让复杂信息回归纯粹与克制
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-headline-${generateId()}`,
        type: 'headline',
        content: '杂志核心标题',
        subtitle: '副标题说明段落 · 突出关键信息与细节描述',
        showLine: true,
        textAlign: 'left',
        x: 12,
        y: 62,
        zIndex: nextZ,
        color: colors.textPrimary,
        titleColor: colors.textPrimary,
        subtitleColor: colors.textSecondary,
        accentColor: colors.accent,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 28,
        fontWeight: 900,
        shadowLevel: 0,
      },
    ],
  },

  // 7. 灵感备忘便签卡
  {
    id: 'widget-memo-card',
    name: '灵感备忘便签',
    category: 'card',
    categoryLabel: '便签卡片',
    tag: '卡片注释',
    description: '顶部分类徽标 + 气泡卡片便签正文（统一拖拽）',
    renderPreview: (colors) => (
      <div className="flex flex-col gap-1 text-left select-none">
        <div
          className="px-1.5 py-0.5 rounded-full text-[8px] font-black w-max"
          style={{ backgroundColor: colors.badgeBg, color: '#ffffff' }}
        >
          NOTE
        </div>
        <div
          className="p-1.5 rounded-xl border text-[9px] leading-snug"
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            color: colors.textPrimary,
          }}
        >
          记录今天的设计灵感与生活碎碎念 ☕
        </div>
      </div>
    ),
    createElements: ({ nextZ, colors, fontFamily, generateId }) => [
      {
        id: `widget-memo-${generateId()}`,
        type: 'memo',
        content: '记录今天的设计灵感与生活碎碎念 ☕',
        badgeText: 'NOTE',
        badgeBg: colors.badgeBg,
        bgColor: colors.cardBg,
        borderColor: colors.cardBorder,
        color: colors.textPrimary,
        x: 12,
        y: 15,
        zIndex: nextZ,
        fontFamily: fontFamily || 'xiaolai',
        fontSize: 13,
        fontWeight: 500,
        shadowLevel: 2,
      },
    ],
  },
];

import type { CSSProperties } from 'react';

/** 模糊底图模式下的深色基底（与编辑器暗黑工作区一致，保证预览与导出完全一致） */
export const CANVAS_BLUR_BASE_COLOR = '#0a0a0a';

export interface CanvasBgParams {
  bgType: 'color' | 'gradient' | 'blur';
  bgColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
}

export interface CanvasBgResolved {
  /** 作用于画布容器节点的 CSS 样式 */
  style: CSSProperties;
  /** 代表当前背景的基准单色（用于对比度、前景色推算等） */
  effectiveBgColor: string;
}

/**
 * 统一收敛画布背景解析逻辑：
 * 1. color: 纯色背景
 * 2. gradient: 线性渐变背景
 * 3. blur: 明确赋予深色基底，防止导出时白色画布穿透导致模糊图发白
 */
export function resolveCanvasBackground(params: CanvasBgParams): CanvasBgResolved {
  const { bgType, bgColor = '#ffffff', gradientStart = '#cbd5e1', gradientEnd = '#94a3b8' } = params;

  if (bgType === 'color') {
    return {
      style: { backgroundColor: bgColor },
      effectiveBgColor: bgColor,
    };
  }

  if (bgType === 'gradient') {
    return {
      style: { background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)` },
      effectiveBgColor: gradientStart,
    };
  }

  // blur 模式
  return {
    style: { backgroundColor: CANVAS_BLUR_BASE_COLOR },
    effectiveBgColor: CANVAS_BLUR_BASE_COLOR,
  };
}

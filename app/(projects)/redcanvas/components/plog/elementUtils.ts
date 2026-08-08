import { SHADOW_PRESETS } from '../../types';
import { FONTS } from '../../constants';

/** 根据阴影等级返回对应 box-shadow 字符串；undefined 返回空串 */
export const shadowOf = (lvl: number | undefined): string => {
  if (lvl === undefined) return '';
  return SHADOW_PRESETS[Math.max(0, Math.min(4, lvl))] || '';
};

/** 把字体 ID（如 'kuaile'）映射为 Tailwind className（如 'font-kuaile'）；找不到则回退 fallbackClass */
export const resolveFontClass = (
  fontFamilyId: string | undefined,
  fallbackClass: string
): string => {
  if (!fontFamilyId) return fallbackClass;
  const found = FONTS.find((f) => f.id === fontFamilyId);
  return found ? found.className : fallbackClass;
};

/** 给 6 位/8 位 hex 或 rgb(...) 色加 alpha；失败原样返回 */
export function mixColorAlpha(color: string, alpha: number): string {
  try {
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      if (hex.length === 8) {
        // rgba hex → 覆盖 alpha
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    if (color.startsWith('rgba(')) {
      const m = color.match(/rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
      if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
    }
    if (color.startsWith('rgb(')) {
      const m = color.match(/rgb\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
      if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
    }
  } catch { /* ignore */ }
  return color;
}

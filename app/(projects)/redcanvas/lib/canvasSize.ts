import { ExportSize } from '../types';

export interface CanvasLogicalSize {
  width: number;
  height: number;
  ratio: number;
}

export interface CustomSizePreset {
  label: string;
  subLabel: string;
  width: number;
  height: number;
}

export const CUSTOM_SIZE_PRESETS: CustomSizePreset[] = [
  { label: '4 : 5', subLabel: '1080×1350 竖版图文', width: 1080, height: 1350 },
  { label: '2 : 3', subLabel: '1080×1620 经典画报', width: 1080, height: 1620 },
  { label: '3 : 2', subLabel: '1440×960 单反横屏', width: 1440, height: 960 },
  { label: '1 : 2', subLabel: '1080×2160 长图Plog', width: 1080, height: 2160 },
  { label: '2.35 : 1', subLabel: '900×383 公众号首图', width: 900, height: 383 },
  { label: '3 : 4', subLabel: '1080×1440 小红书标准', width: 1080, height: 1440 },
];

/**
 * 以原有桌面端画布尺寸为唯一基准尺度，计算画布的逻辑像素宽高（CSS px）。
 * 桌面端与移动端均在此逻辑尺寸下进行内部排版（字号、内边距、圆角、阴影、折行完全一致），
 * 移动端或窄视口仅在外层通过 CSS transform: scale() 等比缩放展示，
 * 从而保证桌面端与移动端互相导入导出时，元素相对位置与视觉大小 100% 不变。
 */
export function resolveCanvasLogicalSize(
  aspectRatio: ExportSize,
  customWidth?: number,
  customHeight?: number
): CanvasLogicalSize {
  switch (aspectRatio) {
    case '3:4':
      return { width: 480, height: 640, ratio: 3 / 4 };
    case '1:1':
      return { width: 500, height: 500, ratio: 1 };
    case '9:16':
      return { width: 420, height: Math.round((420 * 16) / 9), ratio: 9 / 16 };
    case '4:3':
      return { width: 552, height: 414, ratio: 4 / 3 };
    case '16:9':
      return { width: 552, height: 310.5, ratio: 16 / 9 };
    case '3:2':
      return { width: 552, height: 368, ratio: 3 / 2 };
    case 'custom': {
      const safeW =
        typeof customWidth === 'number' && Number.isFinite(customWidth) && customWidth > 0
          ? customWidth
          : 1080;
      const safeH =
        typeof customHeight === 'number' && Number.isFinite(customHeight) && customHeight > 0
          ? customHeight
          : 1440;
      // 限制极端比例，避免输入过程中的临时值导致画布崩塌
      const ratio = Math.min(8, Math.max(0.15, safeW / safeH));

      let width = 480;
      if (Math.abs(ratio - 9 / 16) < 0.01) {
        width = 420;
      } else if (Math.abs(ratio - 1) < 0.01) {
        width = 500;
      } else if (ratio > 1) {
        width = 552;
      } else {
        // 竖版自定义尺寸（如 4:5、2:3、1:2 长图等）统一沿用桌面端 3:4 的 480px 基准宽度，
        // 保证调节画布高度时文字字号、折行宽度与元素横向尺度完全不变
        width = 480;
      }

      const height = Math.round((width / ratio) * 100) / 100;
      return { width, height, ratio };
    }
    default:
      return { width: 480, height: 640, ratio: 3 / 4 };
  }
}


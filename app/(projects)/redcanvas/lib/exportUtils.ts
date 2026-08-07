import { snapdom } from '@zumer/snapdom';
import { prepareFontsForExport } from './fontHelper';

export interface ExportOptions {
  fileName?: string;
  scale?: number;
  backgroundColor?: string;
  onProgress?: (msg: string) => void;
}

export async function exportElementToImage(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = `redcanvas-${Date.now()}.png`,
    scale = 2.5,
    backgroundColor = '#ffffff',
    onProgress,
  } = options;

  // 立即显示进度（不再等待字体预处理完成）
  onProgress?.('正在生成图片...');

  try {
    // 直接生成高清图片（移除预热步骤，减少延迟）
    const blob = await snapdom.toBlob(element, {
      scale,
      backgroundColor,
      type: 'png',
      embedFonts: true,
    });

    if (!blob) {
      throw new Error('图片生成失败，未返回有效的 Data Blob');
    }

    onProgress?.('正在触发下载...');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    // 字体预处理在后台进行，不阻塞下载
    prepareFontsForExport(element).then((cleanup) => cleanup()).catch(() => {});
  }
}

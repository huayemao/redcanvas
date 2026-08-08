import { snapdom } from '@zumer/snapdom';

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

  onProgress?.('正在生成图片...');
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
}

import { snapdom } from '@zumer/snapdom';

export interface ExportOptions {
  fileName?: string;
  scale?: number;
  backgroundColor?: string;
  onProgress?: (msg: string) => void;
}

/** 把元素渲染为 PNG Blob（不触发下载；批量导出/自定义下载流程用） */
export async function exportElementToBlob(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const { scale = 2.5, backgroundColor = '#ffffff', onProgress } = options;

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
  return blob;
}

/**
 * 等待画布就绪：切页/改配置后调用。
 * - 等两帧让 React 重渲染落地
 * - 等所有 <img> 加载完成（带超时兜底，坏图不卡死导出）
 */
export async function waitForCanvasReady(el: HTMLElement, timeoutMs = 8000): Promise<void> {
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  const imgs = Array.from(el.querySelectorAll('img'));
  const allLoaded = Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true });
          }),
    ),
  );
  await Promise.race([allLoaded, new Promise<void>((r) => setTimeout(r, timeoutMs))]);
  // 再等一帧，确保布局稳定后再截取
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

export async function exportElementToImage(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = `redcanvas-${Date.now()}.png`,
    onProgress,
  } = options;

  const blob = await exportElementToBlob(element, options);

  onProgress?.('正在触发下载...');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

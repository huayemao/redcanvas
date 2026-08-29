import { snapdom } from '@zumer/snapdom';
import { waitForMathInElement } from '../components/plog/mathRender';
import { ensureCanvasFontsLoaded } from './fontHelper';

export interface ExportOptions {
  fileName?: string;
  scale?: number;
  backgroundColor?: string;
  onProgress?: (msg: string) => void;
}

/**
 * 等待画布就绪：切页/改配置/导出前调用。
 * 1. 等待 React 切页重渲染落地（3 帧确保新页面 DOM 挂载）
 * 2. 确保画布所用 Web 字体已装载落地（内存已有 0ms 跳过；第一页未就绪则显式触发 load）
 * 3. 等待 MathJax 数学公式排版完成（无公式自动 0ms 秒过；有公式则等待全部转换为 HTML/SVG）
 * 4. 等待 <img> 图片加载完成
 */
export async function waitForCanvasReady(
  el: HTMLElement,
  options: { timeoutMs?: number; onProgress?: (msg: string) => void } = {}
): Promise<void> {
  const { timeoutMs = 8000, onProgress } = options;

  // 1. 等待 React 切页重渲染落地（3 帧确保新页面 DOM 挂载）
  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );

  // 2. 确认并强制装载画布所用的 Web 字体（内存中已有的字体 0ms 跳过；未完成的字体给予 8 秒充分下载时间）
  await ensureCanvasFontsLoaded(el, { timeoutMs: 8000, onProgress });

  // 3. 等待 MathJax 数学公式排版完成（无公式自动 0ms 秒过；有公式则等待全部转换为 HTML/SVG）
  onProgress?.('正在排版数学公式...');
  await waitForMathInElement(el, timeoutMs);

  // 4. 等待 <img> 图片加载完成
  const imgs = Array.from(el.querySelectorAll('img'));
  if (imgs.some((img) => !img.complete)) {
    onProgress?.('正在确认图片资源...');
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
  }

  // 5. 再次确认布局稳定
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

/** 把元素渲染为 PNG Blob（不触发下载；批量导出/自定义下载流程用） */
export async function exportElementToBlob(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const { scale = 2.5, backgroundColor = '#ffffff', onProgress } = options;

  await waitForCanvasReady(element, { onProgress });

  onProgress?.('正在生成高清图片...');
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

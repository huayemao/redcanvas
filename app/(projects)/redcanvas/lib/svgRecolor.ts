import { useState, useEffect, useRef } from 'react';

/**
 * 判断图源地址是否为 SVG：
 * - data:image/svg 开头
 * - 路径以 .svg 结尾（忽略 query 和 hash）
 */
export function isSvgSource(url?: string | null): boolean {
  if (!url) return false;
  if (/^data:image\/svg/i.test(url)) return true;
  return /\.svg([?#].*)?$/i.test(url);
}

/**
 * 解析颜色字符串为 RGB 数值元组 [r, g, b] (0-255)
 */
export function parseRgbColor(str?: string | null): [number, number, number] | null {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s === 'none' || s === 'transparent' || s === 'inherit' || s === 'currentcolor') {
    return null;
  }
  if (s === 'black') return [0, 0, 0];
  if (s === 'white') return [255, 255, 255];

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    } else if (hex.length === 4) {
      hex = hex.slice(0, 3).split('').map((c) => c + c).join('');
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      if (isNaN(num)) return null;
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
  }

  // rgb(r, g, b) 或 rgba(r, g, b, a)
  const rgbMatch = s.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [
      Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))),
    ];
  }

  return null;
}

/**
 * RGB 转 16 进制颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const h = (v: number) => {
    const s = clamp(v).toString(16);
    return s.length === 1 ? '0' + s : s;
  };
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * 判断某个 RGB 颜色是否属于灰度阶梯（黑、白、灰色）
 * 允许小幅度容差（如压缩或渲染导致的轻微色彩漂移）
 */
export function isGrayscaleColor(rgb: [number, number, number], tolerance = 12): boolean {
  return (
    Math.abs(rgb[0] - rgb[1]) <= tolerance &&
    Math.abs(rgb[1] - rgb[2]) <= tolerance &&
    Math.abs(rgb[0] - rgb[2]) <= tolerance
  );
}

/**
 * 计算相对明度 (Luminance, 0-1)
 */
export function getColorLuminance(rgb: [number, number, number]): number {
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

/**
 * 单色灰度重映射核心算法：
 * - 将原图的黑灰白灰阶，自适应平滑映射到以前景色为基调的明暗梯度
 * - 非灰度的彩色重点标记予以豁免保留
 */
export interface RecolorOptions {
  invert?: boolean;
  bgColor?: string;
  shadingDepth?: number;
  colorMode?: 'tonal' | 'flat';
}

/**
 * 单色灰度重映射核心算法：
 * - 将原图的黑灰白灰阶，自适应平滑映射到以前景色为基调的明暗梯度
 * - 针对原图深色阴影、截面（如 washer 圆盘、圆柱体面、积分区域）进行感知增益，保持其深色浓度与实体质感
 * - 针对中空纯白镂空（如圆环孔洞），自动融合为画布置顶底色，避免在深色背景下露出刺眼白块
 * - 支持 flat 单色剪影与 tonal 层次调色两种模式
 * - 非灰度的彩色重点标记予以豁免保留
 */
export function transformMonochromeColor(
  rawColor: string,
  fgRgb: [number, number, number],
  bgRgb: [number, number, number] = [15, 23, 42],
  shadingDepth = 1.15,
  invertOpt: boolean | undefined = undefined,
  colorMode: 'tonal' | 'flat' = 'tonal'
): string {
  const rgb = parseRgbColor(rawColor);
  if (!rgb) return rawColor;
  if (!isGrayscaleColor(rgb)) {
    // 豁免彩色 accent（如重点标记的红线、绿点）
    return rawColor;
  }

  const rawLum = getColorLuminance(rgb);
  const fgLum = getColorLuminance(fgRgb);
  const bgLum = getColorLuminance(bgRgb);

  // 判定画布环境是否为深色底：
  // 1. 若用户显式开启反色则遵循用户
  // 2. 否则根据背景明度（< 0.45）或前景色明显浅于背景色自动判定
  const isDarkCanvas = invertOpt !== undefined
    ? invertOpt
    : (bgLum < 0.45 || fgLum > bgLum + 0.15);

  // 1. 纯白部位（rawLum >= 0.985，如圆环中空镂空、图解纯白留白）：
  // 在深色卡片下，纯白镂空应当与卡片底色融为一体（真正的镂空中空），而不能是突兀的死白方块
  if (rawLum >= 0.985) {
    return rgbToHex(bgRgb[0], bgRgb[1], bgRgb[2]);
  }

  // 2. 单色剪影模式（flat）：非纯白的实体部分全部直接涂为目标前景色
  if (colorMode === 'flat') {
    return rgbToHex(fgRgb[0], fgRgb[1], fgRgb[2]);
  }

  // 3. 原始墨色线条与文字（rawDensity >= 0.88，如黑线、公式、坐标轴箭头）
  const rawDensity = 1 - rawLum;
  if (rawDensity >= 0.88) {
    return rgbToHex(fgRgb[0], fgRgb[1], fgRgb[2]);
  }

  // 3. 中间灰阶部位（如 washer 切片盘、圆柱体表面、阴影积分区、虚线）：
  // 使用感知曲线增强低明度深色部位的浓度，解决“原图较为深色的部位到头来还是浅色”的变淡糊化问题
  let density: number;
  if (rawDensity >= 0.45) {
    // 线条类灰阶（辅助虚线、副曲线）
    density = Math.pow(rawDensity, 0.70) * shadingDepth;
  } else {
    // 表面阴影/截面（原图 washer 切片、柱面、积分阴影）：
    // 提升感知浓度系数，赋予其厚实的深色视觉分量与质感
    density = Math.pow(rawDensity, 0.50) * 1.15 * shadingDepth;
  }

  density = Math.max(0, Math.min(1, density));

  let outR: number;
  let outG: number;
  let outB: number;

  if (isDarkCanvas) {
    // 深色底/夜间模式：
    // 阴影与截面以前景色色调为墨、以暗底色为纸进行加权，
    // 产生温润且有深度质感的半调暗调，绝不会产生刺目浅白
    outR = density * fgRgb[0] + (1 - density) * bgRgb[0];
    outG = density * fgRgb[1] + (1 - density) * bgRgb[1];
    outB = density * fgRgb[2] + (1 - density) * bgRgb[2];
  } else {
    // 浅色底模式：
    // 保持前景色墨度与浅色底的自然过渡，深色部位有沉稳的对比度
    outR = density * fgRgb[0] + (1 - density) * bgRgb[0];
    outG = density * fgRgb[1] + (1 - density) * bgRgb[1];
    outB = density * fgRgb[2] + (1 - density) * bgRgb[2];
  }

  return rgbToHex(outR, outG, outB);
}

/**
 * 对完整 SVG 字符串进行自适应灰度分层调色
 * 覆盖：
 * 1. XML 表现属性：fill, stroke, color, stop-color, flood-color
 * 2. 内联样式：style="..."
 * 3. 嵌入式样式表：<style>...</style>
 * 4. currentColor 上下文根染色注入
 */
export function recolorMonochromeSvg(
  svgText: string,
  fgColorHex: string,
  options: RecolorOptions = {}
): string {
  const fgRgb = parseRgbColor(fgColorHex);
  if (!fgRgb) return svgText;

  const defaultBg: [number, number, number] = [15, 23, 42];
  const bgRgb: [number, number, number] = options.bgColor
    ? parseRgbColor(options.bgColor) || defaultBg
    : defaultBg;
  const shadingDepth = options.shadingDepth ?? 1.15;
  const invertOpt = options.invert;
  const colorMode = options.colorMode || 'tonal';

  // 1. 处理 XML 属性：fill, stroke, color, stop-color, flood-color
  let result = svgText.replace(
    /\b(fill|stroke|color|stop-color|flood-color)\s*=\s*["']([^"']+)["']/gi,
    (match: string, attr: string, val: string) => {
      const trimmed = val.trim();
      if (trimmed === 'none' || trimmed === 'transparent' || trimmed === 'currentColor') {
        return match;
      }
      const newColor = transformMonochromeColor(trimmed, fgRgb, bgRgb, shadingDepth, invertOpt, colorMode);
      return `${attr}="${newColor}"`;
    }
  );

  // 2. 处理内联 style 属性中的颜色
  result = result.replace(
    /\bstyle\s*=\s*["']([^"']+)["']/gi,
    (match: string, styleContent: string) => {
      const updatedStyle = styleContent.replace(
        /\b(fill|stroke|color|stop-color|flood-color)\s*:\s*([^;!"']+)/gi,
        (sMatch: string, prop: string, sVal: string) => {
          const trimmed = sVal.trim();
          if (trimmed === 'none' || trimmed === 'transparent' || trimmed === 'currentColor') {
            return sMatch;
          }
          const newColor = transformMonochromeColor(trimmed, fgRgb, bgRgb, shadingDepth, invertOpt, colorMode);
          return `${prop}: ${newColor}`;
        }
      );
      return `style="${updatedStyle}"`;
    }
  );

  // 3. 处理 <style>...</style> 块中的 CSS 规则
  result = result.replace(
    /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match: string, openTag: string, cssContent: string, closeTag: string) => {
      const updatedCss = cssContent.replace(
        /\b(fill|stroke|color|stop-color|flood-color)\s*:\s*([^;!}]+)/gi,
        (sMatch: string, prop: string, sVal: string) => {
          const trimmed = sVal.trim();
          if (trimmed === 'none' || trimmed === 'transparent' || trimmed === 'currentColor') {
            return sMatch;
          }
          const newColor = transformMonochromeColor(trimmed, fgRgb, bgRgb, shadingDepth, invertOpt, colorMode);
          return `${prop}: ${newColor}`;
        }
      );
      return `${openTag}${updatedCss}${closeTag}`;
    }
  );

  // 4. 确保根 <svg> 具有 color 属性，使依赖 currentColor 的子节点继承目标前景色
  const targetHex = rgbToHex(fgRgb[0], fgRgb[1], fgRgb[2]);
  result = result.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    if (/\bcolor\s*=/i.test(attrs)) {
      // 已经由上方的属性替换过
      return match;
    }
    return `<svg ${attrs} color="${targetHex}">`;
  });

  return result;
}

/**
 * 将 SVG 字符串转为标准的 Data URL
 */
export function svgTextToDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

// ============================================================================
// 全局缓存层（内存 Map，确保高频重渲染和多元素共享时零开销）
// ============================================================================
const rawSvgTextCache = new Map<string, string>();
const pendingSvgFetches = new Map<string, Promise<string>>();
const recoloredDataUrlCache = new Map<string, string>();

/**
 * 解码 Data URL 或拉取远程/本地 SVG 文件内容
 */
export async function getRawSvgText(url: string): Promise<string> {
  if (rawSvgTextCache.has(url)) {
    return rawSvgTextCache.get(url)!;
  }

  // 若已经是 Data URL
  if (url.startsWith('data:image/svg+xml')) {
    try {
      const commaIdx = url.indexOf(',');
      if (commaIdx !== -1) {
        const meta = url.slice(0, commaIdx);
        const body = url.slice(commaIdx + 1);
        if (/;base64/i.test(meta)) {
          // base64 decode (safe for utf-8)
          const binary = atob(body);
          const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
          const decoded = new TextDecoder('utf-8').decode(bytes);
          rawSvgTextCache.set(url, decoded);
          return decoded;
        } else {
          // uri component decode
          const decoded = decodeURIComponent(body);
          rawSvgTextCache.set(url, decoded);
          return decoded;
        }
      }
    } catch {
      // 解码失败降级走 fetch
    }
  }

  // 走 fetch（含 blob: 与普通静态 URL 如 /真题题解图.svg）
  if (pendingSvgFetches.has(url)) {
    return pendingSvgFetches.get(url)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      rawSvgTextCache.set(url, text);
      return text;
    } finally {
      pendingSvgFetches.delete(url);
    }
  })();

  pendingSvgFetches.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * 根据 URL 与染色配置返回调色后的 Data URL
 */
export async function getRecoloredSvgDataUrl(
  url: string,
  fgColor: string,
  options: RecolorOptions = {}
): Promise<string> {
  const cacheKey = `${url}|${fgColor}|${options.colorMode || 'tonal'}|${options.invert !== undefined ? (options.invert ? '1' : '0') : 'auto'}|${options.bgColor || ''}|${options.shadingDepth ?? 1.15}`;
  if (recoloredDataUrlCache.has(cacheKey)) {
    return recoloredDataUrlCache.get(cacheKey)!;
  }

  const rawText = await getRawSvgText(url);
  const recolored = recolorMonochromeSvg(rawText, fgColor, options);
  const dataUrl = svgTextToDataUrl(recolored);

  // 限制缓存容量防止无限扩张
  if (recoloredDataUrlCache.size > 200) {
    const firstKey = recoloredDataUrlCache.keys().next().value;
    if (firstKey) recoloredDataUrlCache.delete(firstKey);
  }
  recoloredDataUrlCache.set(cacheKey, dataUrl);

  return dataUrl;
}

/**
 * 同步检查是否已有现成的调色缓存（可实现 0ms 首次绘制无跳闪）
 */
export function getCachedRecoloredSvgDataUrl(
  url: string,
  fgColor: string,
  options: RecolorOptions = {}
): string | null {
  const cacheKey = `${url}|${fgColor}|${options.colorMode || 'tonal'}|${options.invert !== undefined ? (options.invert ? '1' : '0') : 'auto'}|${options.bgColor || ''}|${options.shadingDepth ?? 1.15}`;
  return recoloredDataUrlCache.get(cacheKey) || null;
}

/**
 * React Hook：自动异步加载与调色，提供同步缓存命中支持
 */
export function useRecoloredSvg(
  url?: string | null,
  fgColor?: string | null,
  options: RecolorOptions = {}
) {
  const isSvg = isSvgSource(url);
  const shouldRecolor = isSvg && !!fgColor && fgColor !== 'transparent';

  const cacheKey = shouldRecolor && url
    ? `${url}|${fgColor}|${options.colorMode || 'tonal'}|${options.invert !== undefined ? (options.invert ? '1' : '0') : 'auto'}|${options.bgColor || ''}|${options.shadingDepth ?? 1.15}`
    : '';

  // 尝试同步命中缓存
  const initialDataUrl = shouldRecolor && url
    ? recoloredDataUrlCache.get(cacheKey) || null
    : url || null;

  const [displayUrl, setDisplayUrl] = useState<string | null>(initialDataUrl);
  const [loading, setLoading] = useState<boolean>(!initialDataUrl && shouldRecolor);
  const activeKeyRef = useRef(cacheKey);
  activeKeyRef.current = cacheKey;

  useEffect(() => {
    if (!shouldRecolor || !url) {
      setDisplayUrl(url || null);
      setLoading(false);
      return;
    }

    // 检查缓存
    const cached = recoloredDataUrlCache.get(cacheKey);
    if (cached) {
      setDisplayUrl(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    getRecoloredSvgDataUrl(url, fgColor!, options)
      .then((recoloredDataUrl) => {
        if (!cancelled && activeKeyRef.current === cacheKey) {
          setDisplayUrl(recoloredDataUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled && activeKeyRef.current === cacheKey) {
          // 失败时降级显示原始图源
          setDisplayUrl(url);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, fgColor, options.invert, options.bgColor, options.shadingDepth, shouldRecolor, cacheKey]);

  return {
    url: displayUrl || url || '',
    loading,
    isRecolored: shouldRecolor && !!displayUrl && displayUrl.startsWith('data:image/svg+xml'),
  };
}

import { ExtractedColors } from '../types';

// ============================================================================
//  颜色工具 — 色彩空间转换
// ============================================================================

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function clamp255(v: number): number {
  return Math.min(255, Math.max(0, Math.round(v)));
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp255(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = (G - B) / d + (G < B ? 6 : 0); break;
      case G: h = (B - R) / d + 2; break;
      case B: h = (R - G) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = (h % 360) / 60;
  const X = C * (1 - Math.abs((hPrime % 2) - 1));
  let R1 = 0, G1 = 0, B1 = 0;
  if (hPrime >= 0 && hPrime < 1) { R1 = C; G1 = X; B1 = 0; }
  else if (hPrime < 2) { R1 = X; G1 = C; B1 = 0; }
  else if (hPrime < 3) { R1 = 0; G1 = C; B1 = X; }
  else if (hPrime < 4) { R1 = 0; G1 = X; B1 = C; }
  else if (hPrime < 5) { R1 = X; G1 = 0; B1 = C; }
  else { R1 = C; G1 = 0; B1 = X; }
  const m = l - C / 2;
  return {
    r: Math.round((R1 + m) * 255),
    g: Math.round((G1 + m) * 255),
    b: Math.round((B1 + m) * 255),
  };
}

// ============================================================================
//  WCAG 对比度 & 相对亮度（标准算法，不要用简化的 0.299r+…）
// ============================================================================

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG 对比度比率，取值 1 ~ 21 */
function contrastRatio(a: string | RGB, b: string | RGB): number {
  const rgbA = typeof a === 'string' ? hexToRgb(a) : a;
  const rgbB = typeof b === 'string' ? hexToRgb(b) : b;
  const L1 = relativeLuminance(rgbA);
  const L2 = relativeLuminance(rgbB);
  const [lo, hi] = L1 < L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// ============================================================================
//  颜色调整原语（基于 HSL，可控、美学上更自然）
// ============================================================================

function adjustHsl(hex: string, delta: Partial<HSL>): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  const next: HSL = {
    h: (hsl.h + (delta.h ?? 0) + 360) % 360,
    s: Math.min(1, Math.max(0, hsl.s + (delta.s ?? 0))),
    l: Math.min(1, Math.max(0, hsl.l + (delta.l ?? 0))),
  };
  return rgbToHex(hslToRgb(next));
}

function setLuminosity(hex: string, targetL: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, l: Math.min(1, Math.max(0, targetL)) }));
}

function setSaturation(hex: string, targetS: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, s: Math.min(1, Math.max(0, targetS)) }));
}

/** 混合两种颜色（percent 0..1 表示 color2 权重） */
function mix(color1: string, color2: string, percent: number): string {
  const a = hexToRgb(color1);
  const b = hexToRgb(color2);
  const t = Math.min(1, Math.max(0, percent));
  return rgbToHex({
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t),
  });
}

// ============================================================================
//  美学策略 — 杂志风候选色板（永远不用"死黑/冷白"）
// ============================================================================

// 浅色文字候选（奶油白系，用于深色背景）— 按杂志审美从暖到冷
const LIGHT_TEXT_CANDIDATES = [
  '#F5EFE4', // 米白带黄，纸质感
  '#F0E9DC', // 经典杂志奶白
  '#F8F6F2', // 暖白微灰
  '#F3F2EE', // 象牙白
  '#FFFFFF', // 纯白（兜底，最亮）
  '#FAF8F0', // 古董白
];

// 深色文字候选（暖炭灰系，用于浅色背景）— 从深到浅
const DARK_TEXT_CANDIDATES = [
  '#1C1917', // 暖黑（带红棕调，不是 #000）
  '#272421', // 炭灰咖啡
  '#2A2725', // 暖深灰
  '#33312E', // 杂志正文灰
  '#3A3633', // 稍浅炭灰
  '#1F2937', // 中性深灰（兜底，避免太暖）
];

/**
 * 选出与 bg 对比度 ≥ minRatio 的候选中"最不是极端"的那个。
 * ——杂志美学原则：宁可对比度略低（但达标），也不要死黑冷白。
 */
function pickBestTextColor(
  bg: string,
  candidates: string[],
  minRatio: number,
  preferMid = true,
): string {
  const withRatio = candidates.map((c) => ({ c, r: contrastRatio(c, bg) }));
  const passing = withRatio.filter((x) => x.r >= minRatio);
  if (passing.length === 0) {
    // 没有达标 → 强制选最亮/最暗极端作为安全兜底
    return withRatio.sort((a, b) => b.r - a.r)[0].c;
  }
  if (!preferMid) return passing[0].c;
  // 在所有达标里选"最不极端"的 = 对比率先达标且颜色排名最靠中间的
  // （LIGHT 列表里中间的就是"奶油"不是纯白，DARK 里中间的就是"暖炭"不是纯黑）
  const mid = Math.floor(candidates.length / 2);
  passing.sort((a, b) =>
    Math.abs(candidates.indexOf(a.c) - mid) - Math.abs(candidates.indexOf(b.c) - mid),
  );
  return passing[0].c;
}

// ============================================================================
//  背景"优雅化"处理 — 避免高饱和刺眼色直接做大面背景
// ============================================================================

/**
 * 把从图片里拿到的"原始主色"优雅化为可以铺满画面的背景色：
 * 1) 高饱和 → 降饱和（杂志不把霓虹粉铺满整张）
 * 2) 若太接近纯黑/纯白，稍微加一点点色相（避免"死色"）
 * 3) 冷暖微调：深色背景加一点蓝紫，浅色加一点暖黄
 */
function refineBackground(rawHex: string): { refinedBg: string; isDark: boolean; hsl: HSL } {
  const rgb = hexToRgb(rawHex);
  const hsl = rgbToHsl(rgb);
  let refined = rawHex;

  // 1) 饱和度钳制：大面积背景饱和度 ≤ 0.42（温和）
  if (hsl.s > 0.42) {
    refined = setSaturation(refined, hsl.s * 0.55);
  }

  const newHsl = rgbToHsl(hexToRgb(refined));
  const isDark = newHsl.l < 0.5;

  // 2) 亮度极值救援
  if (newHsl.l < 0.06) {
    // 太黑，提亮 + 加一点色相
    refined = adjustHsl(refined, { l: 0.06, s: 0.05, h: 215 - newHsl.h > 0 ? 215 : 0 });
  } else if (newHsl.l > 0.94) {
    // 太白，压暗 + 加一点暖
    refined = adjustHsl(refined, { l: -0.05, s: 0.05, h: 45 });
  }

  // 3) 冷暖微调（在饱和度足够时才加，避免灰里硬加色）
  const cur = rgbToHsl(hexToRgb(refined));
  if (isDark && cur.s < 0.08) {
    // 近乎无彩的深灰 → 给一点蓝紫相，更高级
    refined = mix(refined, '#1A1F2E', 0.18);
  } else if (!isDark && cur.s < 0.08) {
    // 近乎无彩的浅灰 → 给一点暖米
    refined = mix(refined, '#F2EBDF', 0.18);
  }

  const finalHsl = rgbToHsl(hexToRgb(refined));
  return { refinedBg: refined, isDark, hsl: finalHsl };
}

/** 基于背景色生成一对优雅渐变（色相接近，亮度差 ~12%~18%，避免两端太跳） */
function buildGradientPair(refinedBg: string, isDark: boolean, hsl: HSL): { start: string; end: string } {
  const angle = isDark ? -10 : 10; // 深色背景：起点稍亮 → 终点稍暗；浅色相反
  const hueShift = (hsl.s > 0.12) ? (isDark ? +6 : -4) : 0; // 有彩时才转色相，营造深度
  const satBoost = hsl.s < 0.25 ? 0.06 : 0; // 低饱和时起点略补彩

  const start = adjustHsl(refinedBg, { l: +angle / 100, h: hueShift, s: satBoost });
  const end = adjustHsl(refinedBg, { l: -angle / 100, h: -hueShift * 0.5, s: -0.02 });
  return { start, end };
}

/** 生成卡片背景色：与渐变背景有 8%~12% 的亮度差，且颜色略深（是内嵌感） */
function buildCardBg(gradientStart: string, gradientEnd: string, isDark: boolean): { cardBg: string; cardBorder: string } {
  const base = mix(gradientStart, gradientEnd, 0.5);
  const baseHsl = rgbToHsl(hexToRgb(base));
  if (isDark) {
    // 深色整体背景 → 卡片比背景再稍深 + 加一点边
    const cardBg = adjustHsl(base, { l: -0.09, s: -0.03 });
    const cardBorder = mix(cardBg, '#FFFFFF', 0.06); // 极淡描边
    return { cardBg, cardBorder };
  }
  // 浅色整体背景 → 卡片是白底（纸），比背景再稍亮或等亮，但加一点阴影边框色
  const cardBg = adjustHsl(base, { l: +0.06, s: -0.04 });
  const cardBorder = mix(cardBg, '#000000', 0.06);
  return { cardBg, cardBorder };
}

// ============================================================================
//  强调色（accent）和谐化：保证与对比度，避免和背景撞色
// ============================================================================

function refineAccent(rawAccent: string, gradientStart: string, gradientEnd: string, isDark: boolean): string {
  const bgMix = mix(gradientStart, gradientEnd, 0.5);
  let candidate = rawAccent;
  const ratio = contrastRatio(candidate, bgMix);
  if (ratio >= 3) return candidate; // 达标直接用

  // 不达标 → 用极端化挽救（按背景明暗决定提亮还是压暗）
  const hsl = rgbToHsl(hexToRgb(candidate));
  const targetL = isDark ? Math.max(0.78, hsl.l + 0.25) : Math.min(0.22, hsl.l - 0.25);
  candidate = setLuminosity(candidate, targetL);
  // 再补一点饱和
  if (rgbToHsl(hexToRgb(candidate)).s < 0.35) {
    candidate = setSaturation(candidate, 0.45);
  }
  return candidate;
}

// ============================================================================
//  完整配色方案生成
// ============================================================================

/** 从原始主色 + 次色，产出完整的配色方案 */
function buildPalette(
  rawDominant: string,
  rawSecondary: string,
  rawAccent: string,
): ExtractedColors {
  const { refinedBg, isDark, hsl } = refineBackground(rawDominant);
  const { start: gradientStart, end: gradientEnd } = buildGradientPair(refinedBg, isDark, hsl);

  // 背景代表色（用于文字对比度校验）取渐变中点
  const bgRepresent = mix(gradientStart, gradientEnd, 0.5);

  // 文字三级：4.5 / 3 / 1.5
  const lightPool = LIGHT_TEXT_CANDIDATES;
  const darkPool = DARK_TEXT_CANDIDATES;

  const textPrimary = pickBestTextColor(bgRepresent, isDark ? lightPool : darkPool, 4.5, true);
  // 次级文字：可以比主标题"更近中间"一点，所以换优先更温和的
  const textSecondary = pickBestTextColor(
    bgRepresent,
    isDark ? lightPool : darkPool,
    3,
    true,
  );
  // Muted：对比度较低，用混合把 textPrimary 往 bg 里揉 50%~55%
  const textMuted = mix(textPrimary, bgRepresent, isDark ? 0.58 : 0.52);

  // 卡片 + 边
  const { cardBg, cardBorder } = buildCardBg(gradientStart, gradientEnd, isDark);

  // 强调色
  const accent = refineAccent(rawAccent, gradientStart, gradientEnd, isDark);
  // Secondary：若和 bg 太接近则换次色的"微调版"
  let secondary = rawSecondary;
  if (contrastRatio(secondary, bgRepresent) < 1.8) {
    secondary = isDark
      ? adjustHsl(rawSecondary, { l: +0.18, s: +0.08 })
      : adjustHsl(rawSecondary, { l: -0.18, s: +0.08 });
  }

  // —— 语义化主色派生（替代 accent 的滥用） ——
  // primary：dominant 派生的"实心填充色"，饱和度更高、亮度调到适合小面积色块（徽章/标签/贴纸）
  let primary = adjustHsl(refinedBg, {
    s: Math.min(1, rgbToHsl(hexToRgb(refinedBg)).s + 0.22),
    l: isDark ? +0.14 : -0.2,
  });
  // 保证 primary 与背景有足够对比（小面积色块 ≥ 2.5:1）
  if (contrastRatio(primary, bgRepresent) < 2.5) {
    primary = isDark ? setLuminosity(refinedBg, 0.72) : setLuminosity(refinedBg, 0.28);
  }
  // emphasis：长文字加粗关键词色，primary 的文字可读版（≥ 3:1）
  let emphasis = primary;
  if (contrastRatio(emphasis, bgRepresent) < 3) {
    emphasis = isDark ? setLuminosity(primary, 0.82) : setLuminosity(primary, 0.24);
  }
  // primaryMuted：引用边框 / 分隔线 / 弱装饰 — primary 揉进背景 55%
  const primaryMuted = mix(primary, bgRepresent, 0.55);

  return {
    dominant: refinedBg,
    secondary,
    accent,
    textPrimary,
    textSecondary,
    textMuted,
    // —— 语义化色值（由 dominant 派生，避免 accent 滥用） ——
    primary,          // 徽章/标签/贴纸实心填充
    emphasis,         // 长文字加粗关键词
    primaryMuted,     // 引用边框 / 分隔线 / 弱装饰
    cardBg,
    cardBorder,
    gradientStart,
    gradientEnd,
    isDark,
    text: textPrimary, // 兼容旧字段
  };
}

// ============================================================================
//  图片主色提取（沿用原像素分桶思路，更稳）
// ============================================================================

function getLegacyLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** 从一套原始主色派生出多种"情绪风格"的配色方案（次变体：同一主色下的风格变化） */
export const PALETTE_STYLES: Array<{ styleId: string; styleName: string }> = [
  { styleId: 'balanced', styleName: '平衡自然' },
  { styleId: 'high-contrast', styleName: '高对比杂志' },
  { styleId: 'morandi', styleName: '莫兰迪柔和' },
  { styleId: 'complementary', styleName: '色相互补' },
];

/** 按风格 id 对 raw dominant 做 HSL 变换 */
function styleDominantHex(rawDominant: string, styleId: string): string {
  if (styleId === 'balanced') return rawDominant;
  const hsl = rgbToHsl(hexToRgb(rawDominant));
  if (styleId === 'high-contrast') {
    return adjustHsl(rawDominant, { l: hsl.l >= 0.5 ? -0.15 : +0.12, s: -0.1 });
  }
  if (styleId === 'morandi') {
    return adjustHsl(rawDominant, { s: -0.22, l: hsl.l >= 0.5 ? -0.03 : +0.06 });
  }
  if (styleId === 'complementary') {
    const hueAngle = hsl.h < 180 ? +32 : -32;
    return adjustHsl(rawDominant, { h: hueAngle, s: +0.05 });
  }
  return rawDominant;
}

/** 用指定风格基于一组 raw 三色构建完整配色方案 */
export function buildPaletteStyled(
  rawDominant: string,
  rawSecondary: string,
  rawAccent: string,
  styleId: string,
): ExtractedColors {
  const dom = styleDominantHex(rawDominant, styleId);
  return buildPalette(dom, rawSecondary, rawAccent);
}

/** 色相家族命名（用于候选主色的语义化标签） */
function hueFamilyName(hex: string): string {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  if (s < 0.12) {
    if (l < 0.2) return '深墨';
    if (l > 0.85) return '素白';
    return '中性灰';
  }
  if (h < 15 || h >= 345) return '赤红';
  if (h < 45) return '暖橙';
  if (h < 70) return '琥珀黄';
  if (h < 160) return '草木绿';
  if (h < 200) return '青蓝';
  if (h < 250) return '深海蓝';
  if (h < 290) return '紫罗兰';
  return '玫红';
}

export interface PaletteCandidate {
  candidateId: string;
  candidateName: string;
  dominantHex: string;
  dominant: string;
  secondary: string;
  accent: string;
}

type SampledColor = { count: number; r: number; g: number; b: number };

/** 内部：从图片采样 → 返回按占比降序的颜色桶（未做美学润色） */
async function sampleImageColors(imageSrc: string): Promise<SampledColor[] | null> {
  if (!imageSrc) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        const size = 80;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        const colorCounts: { [key: string]: SampledColor } = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          const lum = getLegacyLuminance(r, g, b);
          if (lum < 12 || lum > 243) continue;
          const qR = Math.round(r / 16) * 16;
          const qG = Math.round(g / 16) * 16;
          const qB = Math.round(b / 16) * 16;
          const key = `${qR},${qG},${qB}`;
          if (!colorCounts[key]) colorCounts[key] = { count: 0, r: qR, g: qG, b: qB };
          colorCounts[key].count++;
        }
        const sortedColors = Object.values(colorCounts).sort((a, b) => b.count - a.count);
        resolve(sortedColors.length === 0 ? null : sortedColors);
      } catch (e) {
        console.warn('[ColorExtractor] sample failed:', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageSrc;
  });
}

/** 给定一个 dominant 候选 + 全图 topPool，派生 secondary / accent（相对该 dominant） */
function pickTriadForDominant(
  domColor: SampledColor,
  topPool: SampledColor[],
): { dominant: string; secondary: string; accent: string } {
  const dominantHex = rgbToHex({ r: domColor.r, g: domColor.g, b: domColor.b });
  let secondaryHex = dominantHex;
  let bestDiff = -1;
  for (let i = 0; i < topPool.length; i++) {
    const c = topPool[i];
    const diff = Math.abs(c.r - domColor.r) + Math.abs(c.g - domColor.g) + Math.abs(c.b - domColor.b);
    if (diff > bestDiff) { bestDiff = diff; secondaryHex = rgbToHex({ r: c.r, g: c.g, b: c.b }); }
  }
  if (bestDiff < 30) {
    const hsl = rgbToHsl({ r: domColor.r, g: domColor.g, b: domColor.b });
    secondaryHex = rgbToHex(hslToRgb({ h: (hsl.h + 180) % 360, s: Math.min(1, hsl.s + 0.15), l: 0.55 }));
  }
  let accentHex: string | null = null;
  let bestScore = -1;
  for (let i = 0; i < topPool.length; i++) {
    const c = topPool[i];
    const hsl = rgbToHsl({ r: c.r, g: c.g, b: c.b });
    const share = c.count / (domColor.count || 1);
    if (share > 0.45) continue;
    const score = hsl.s * 100 + (1 - share) * 40;
    if (score > bestScore) { bestScore = score; accentHex = rgbToHex({ r: c.r, g: c.g, b: c.b }); }
  }
  if (!accentHex) {
    const hsl = rgbToHsl(hexToRgb(secondaryHex));
    accentHex = rgbToHex(hslToRgb({ h: (hsl.h + 150) % 360, s: Math.min(1, hsl.s + 0.2), l: 0.5 }));
  }
  return { dominant: dominantHex, secondary: secondaryHex, accent: accentHex };
}

/** 内部：从图片采样 → 得到 raw 三色（取占比最高者作为 dominant），不做美学润色 */
async function sampleRawTriad(
  imageSrc: string,
): Promise<{ dominant: string; secondary: string; accent: string } | null> {
  const sorted = await sampleImageColors(imageSrc);
  if (!sorted || sorted.length === 0) return null;
  const topPool = sorted.slice(0, Math.min(8, sorted.length));
  return pickTriadForDominant(sorted[0], topPool);
}

// 默认配色（含语义化字段）
const DEFAULT_PALETTE: ExtractedColors = (() => {
  const p = buildPalette('#E9E4DA', '#C9C0B0', '#B5433A');
  return p;
})();

export async function extractDominantColors(imageSrc: string): Promise<ExtractedColors> {
  const triad = await sampleRawTriad(imageSrc);
  if (!triad) return DEFAULT_PALETTE;
  return buildPalette(triad.dominant, triad.secondary, triad.accent);
}

/**
 * 提取多个"主色候选"（主变体）—— 从图片中选出最多 4 个彼此差异显著的高占比色，
 * 每个作为一套 dominant，各自派生 secondary/accent。用户在 UI 里切换主色，
 * 再配合次变体（风格）使用。
 */
export async function extractPaletteCandidates(
  imageSrc: string,
): Promise<PaletteCandidate[]> {
  const sorted = await sampleImageColors(imageSrc);
  if (!sorted || sorted.length === 0) {
    // 兜底：一深一浅两套保证
    return [
      {
        candidateId: 'c0',
        candidateName: '主色 · 素白（浅）',
        dominantHex: DEFAULT_PALETTE.dominant,
        dominant: '#E9E4DA',
        secondary: '#C9C0B0',
        accent: '#B5433A',
      },
      {
        candidateId: 'c1',
        candidateName: '主色 · 深墨（深）',
        dominantHex: '#1A1F2E',
        dominant: '#1A1F2E',
        secondary: '#2A3142',
        accent: '#E8B34A',
      },
    ];
  }
  const topPool = sorted.slice(0, Math.min(12, sorted.length));

  // —— 按亮度分成 dark / light 两组（l < 0.5 = 深） ——
  const darkPool: SampledColor[] = [];
  const lightPool: SampledColor[] = [];
  for (const c of topPool) {
    const l = rgbToHsl({ r: c.r, g: c.g, b: c.b }).l;
    if (l < 0.5) darkPool.push(c);
    else lightPool.push(c);
  }

  // 从每组选出最多 2 个差异显著的候选
  const DIVERSITY_THRESHOLD = 80;
  const pickDiverse = (pool: SampledColor[], maxN: number): SampledColor[] => {
    const picked: SampledColor[] = [];
    for (const c of pool) {
      const tooClose = picked.some((p) =>
        Math.abs(p.r - c.r) + Math.abs(p.g - c.g) + Math.abs(p.b - c.b) < DIVERSITY_THRESHOLD
      );
      if (!tooClose) picked.push(c);
      if (picked.length >= maxN) break;
    }
    return picked;
  };

  const darkPicked = pickDiverse(darkPool, 2);
  const lightPicked = pickDiverse(lightPool, 2);

  // —— 保证两组各至少 1 个：缺的那组用"反向合成"补一个 ——
  const synthesizeOpposite = (from: SampledColor, toDark: boolean): SampledColor => {
    const hsl = rgbToHsl({ r: from.r, g: from.g, b: from.b });
    const targetL = toDark
      ? Math.max(0.12, Math.min(0.38, hsl.l - 0.35))
      : Math.min(0.88, Math.max(0.62, hsl.l + 0.35));
    const targetS = Math.max(0.05, hsl.s * 0.6);
    const rgb = hslToRgb({ h: hsl.h, s: targetS, l: targetL });
    return { r: rgb.r, g: rgb.g, b: rgb.b, count: 1 };
  };

  if (darkPicked.length === 0 && topPool.length > 0) {
    darkPicked.push(synthesizeOpposite(lightPicked[0] ?? topPool[0], true));
  }
  if (lightPicked.length === 0 && topPool.length > 0) {
    lightPicked.push(synthesizeOpposite(darkPicked[0] ?? topPool[0], false));
  }

  // 组装候选顺序：浅 + 深 + 浅（若有）+ 深（若有），保证 UI 里首屏同时可见浅深
  const picked: SampledColor[] = [];
  const maxPerSide = 2;
  for (let i = 0; i < maxPerSide; i++) {
    if (lightPicked[i]) picked.push(lightPicked[i]);
    if (darkPicked[i]) picked.push(darkPicked[i]);
  }
  if (picked.length === 0) picked.push(topPool[0]);

  return picked.map((c, idx) => {
    const triad = pickTriadForDominant(c, topPool);
    // 根据最终色深浅补充语义化后缀名（浅/深标注）
    const l = rgbToHsl(hexToRgb(triad.dominant)).l;
    const depthTag = l < 0.5 ? '（深）' : '（浅）';
    return {
      candidateId: `c${idx}`,
      candidateName: `主色 · ${hueFamilyName(triad.dominant)}${depthTag}`,
      dominantHex: triad.dominant,
      ...triad,
    };
  });
}

// ============================================================================
//  对外暴露的纯函数工具（便于在 UI 里独立再算一次/做快速预览）
// ============================================================================

export {
  contrastRatio,
  rgbToHsl,
  hslToRgb,
  hexToRgb,
  rgbToHex,
  adjustHsl,
  mix,
  pickBestTextColor,
  buildPalette,
};

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
  options?: { rawBackground?: boolean },
): ExtractedColors {
  // 原色模式：跳过 refineBackground 美学精炼，直接用 raw dominant 作为背景
  // （渐变铺平为同一色），真正实现"背景色=图片里面积最大的那个颜色"
  let refinedBg: string;
  let isDark: boolean;
  let hsl: HSL;
  let gradientStart: string;
  let gradientEnd: string;
  if (options?.rawBackground) {
    const rawHsl = rgbToHsl(hexToRgb(rawDominant));
    refinedBg = rawDominant;
    isDark = rawHsl.l < 0.5;
    hsl = rawHsl;
    gradientStart = rawDominant;
    gradientEnd = rawDominant;
  } else {
    const refined = refineBackground(rawDominant);
    refinedBg = refined.refinedBg;
    isDark = refined.isDark;
    hsl = refined.hsl;
    const pair = buildGradientPair(refinedBg, isDark, hsl);
    gradientStart = pair.start;
    gradientEnd = pair.end;
  }

  // 背景代表色（用于文字对比度校验）取渐变中点
  const bgRepresent = mix(gradientStart, gradientEnd, 0.5);

  // —— primary 先算（textSecondary 要派生自它） ——
  // primary：dominant 派生的"实心填充色"（用于徽章/标签/贴纸背景）
  // 核心视觉原则：
  //   深底：primary 是【深色彩色块】—— 饱和度温和、亮度与背景拉开但不变成亮色，让白色文字可读
  //   浅底：primary 是【浅色彩色块】—— 饱和度温和、与背景有对比，深色文字可读
  // 饱和度仅微提（+0.08），避免高饱和"霓虹"感破坏杂志质感
  let primary = adjustHsl(refinedBg, {
    s: Math.min(0.55, rgbToHsl(hexToRgb(refinedBg)).s + 0.08),
    l: isDark ? +0.12 : -0.12,
  });
  // 保证 primary 与背景有 ≥2.5:1 对比（小面积色块基本可读）
  if (contrastRatio(primary, bgRepresent) < 2.5) {
    if (isDark) {
      // 深底：如果提亮不够，进一步提亮但保持在中等亮度区间（0.35~0.55），不跳成亮白
      const curL = rgbToHsl(hexToRgb(primary)).l;
      primary = setLuminosity(primary, Math.min(0.55, Math.max(0.35, curL + 0.15)));
    } else {
      // 浅底：压暗一点但保持在中等亮度区间（0.2~0.4）
      const curL = rgbToHsl(hexToRgb(primary)).l;
      primary = setLuminosity(primary, Math.max(0.2, Math.min(0.4, curL - 0.15)));
    }
  }

  // —— 文字三级（深底/浅底非对称） ——
  // 深底：正文=主色淡色（mix 0.5），主标题=主色强淡色（mix 0.7，更醒目但仍带色相），加粗=纯白（最极端）
  // 浅底：正文=主色深色（mix 0.5），主标题=主色强深色（mix 0.7，更醒目但仍带色相），加粗=暖炭黑（最极端）
  // 三级层次：emphasis(纯白/黑) > textPrimary(主色强淡/强深) > textSecondary(主色淡/深) > textMuted
  //          —— 全部 mix 派生自主色，不再用候选池固定值，避免所有预设主色都一样
  const lightPool = LIGHT_TEXT_CANDIDATES;
  const darkPool = DARK_TEXT_CANDIDATES;
  const darkAnchor = '#1C1917'; // 暖黑（带红棕调，不是 #000）

  // textPrimary：主标题色 — mix 比例 0.7（比 textSecondary 的 0.5 更接近极端，更醒目但仍带色相）
  let textPrimary: string;
  if (isDark) {
    textPrimary = mix(primary, '#FFFFFF', 0.7);
    // 保证主标题 AA 级 ≥ 4.5:1；不达标则向白拉到 0.85（更白、对比度更高，仍保留色相）
    if (contrastRatio(textPrimary, bgRepresent) < 4.5) {
      textPrimary = mix(primary, '#FFFFFF', 0.85);
    }
  } else {
    textPrimary = mix(primary, darkAnchor, 0.7);
    if (contrastRatio(textPrimary, bgRepresent) < 4.5) {
      textPrimary = mix(primary, darkAnchor, 0.85);
    }
  }

  let emphasis: string;
  let textSecondary: string;
  if (isDark) {
    // 深底：加粗 = 纯白（极端醒目）；正文 = primary 派生的浅主题色（带色相、柔和）
    // 用 mix(primary, 白, t) 派生正文，色相保留、只提亮，不再用 setLuminosity 丢色相
    emphasis = '#FFFFFF';
    // 若纯白与背景对比度不足（极浅深底罕见情况），用最白候选兜底
    if (contrastRatio(emphasis, bgRepresent) < 4.5) {
      emphasis = mix('#FFFFFF', '#FAF8F0', 0.2);
    }
    // 正文：primary 与白 50/50 混合 → 主色淡色（带色相、柔和、不刺眼）
    textSecondary = mix(primary, '#FFFFFF', 0.5);
    // 若 primary 与背景太接近，对比度仍不够 → 增加白比例到 0.72，仍保留色相
    if (contrastRatio(textSecondary, bgRepresent) < 3) {
      textSecondary = mix(primary, '#FFFFFF', 0.72);
    }
  } else {
    // 浅底：加粗 = primary 派生的深主题色（高饱和、彩色醒目）；正文 = 低饱和深主题色（带色相、舒适阅读）
    // 设计意图（保留原精心设计）：加粗靠"鲜艳彩色"醒目，正文靠"低调灰化"阅读 —— 两者方向不同，区分清晰
    // emphasis 用 adjustHsl 调深 + 加饱和，保留色相且比 primary 更鲜艳；fallback 用 mix 仍保留色相
    emphasis = adjustHsl(primary, { l: -0.2, s: +0.1 });
    if (contrastRatio(emphasis, bgRepresent) < 3) {
      emphasis = mix(primary, darkAnchor, 0.55);
    }
    // 正文：primary 与暖黑 50/50 → 主色深色版（色相弱化但仍带色、可读、不刺眼）
    textSecondary = mix(primary, darkAnchor, 0.5);
    // 若 primary 与背景太接近，对比度仍不够 → 增加深比例到 0.72，仍保留色相
    if (contrastRatio(textSecondary, bgRepresent) < 3) {
      textSecondary = mix(primary, darkAnchor, 0.72);
    }
  }

  // Muted：把正文色往背景里揉，得到弱化版
  const textMuted = mix(textSecondary, bgRepresent, isDark ? 0.58 : 0.52);

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

  // primaryMuted：引用边框 / 分隔线 / 弱装饰 — primary 揉进背景 55%
  const primaryMuted = mix(primary, bgRepresent, 0.55);

  // 徽章：永远深色背景 + 永远浅色文字（无论画布深浅，胶囊一律深底亮字）
  // badgeBg：取 dominant 色相，压暗到 L≈0.22（深到与浅画布有强烈对比），保留一定饱和度带色调
  const { h } = rgbToHsl(hexToRgb(refinedBg));
  const badgeBgRaw = rgbToHex(hslToRgb({ h, s: Math.min(0.55, 0.35 + Math.abs(h - 250) * 0.002), l: 0.22 }));
  // 保证 badgeBg 与浅画布的对比度 ≥ 3（如已经够深则不动）
  const badgeBg =
    contrastRatio(badgeBgRaw, '#FFFFFF') >= 3
      ? badgeBgRaw
      : setLuminosity(badgeBgRaw, 0.18);
  // badgeText：永远从浅文字池选（奶油白方向），在 badgeBg 上对比度 ≥ 4.5
  const badgeText = pickBestTextColor(badgeBg, LIGHT_TEXT_CANDIDATES, 4.5, true);

  return {
    dominant: refinedBg,
    secondary,
    accent,
    textPrimary,
    textSecondary,
    textMuted,
    // —— 语义化色值（由 dominant 派生，避免 accent 滥用） ——
    primary,          // 标签/贴纸实心填充
    emphasis,         // 长文字加粗关键词
    primaryMuted,     // 引用边框 / 分隔线 / 弱装饰
    badgeBg,          // 徽章背景（永远深色）
    badgeText,        // 徽章文字（永远浅色）
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
  { styleId: 'raw', styleName: '原色·最大面积' },
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
  // 原色方案：直接用图片占比最大的颜色作为背景，不做任何 HSL 美学变换与精炼
  if (styleId === 'raw') {
    return buildPalette(rawDominant, rawSecondary, rawAccent, { rawBackground: true });
  }
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

// ============================================================================
//  黑白图救援 — 当图片无彩色（黑/白/灰）占比过高时，找最具色彩的主色
// ============================================================================

/** 判定是否为无彩色（饱和度极低，即黑/白/灰系），阈值与 hueFamilyName 一致 */
function isAchromaticColor(c: SampledColor): boolean {
  const { s } = rgbToHsl({ r: c.r, g: c.g, b: c.b });
  return s < 0.12;
}

/** 计算候选池中无彩色的占比（按像素计数加权） */
function computeAchromaticRatio(pool: SampledColor[]): number {
  let total = 0;
  let ach = 0;
  for (const c of pool) {
    total += c.count;
    if (isAchromaticColor(c)) ach += c.count;
  }
  return total > 0 ? ach / total : 0;
}

/**
 * 在候选池中找"最具色彩"的颜色：仅看饱和度 ≥ 0.15 的明显带色像素，
 * 评分 = 饱和度 × 占比（colorfulness × frequency），选出既鲜艳又有分量的主色。
 * 全池无彩色时返回 null。
 */
function findMostColorful(pool: SampledColor[]): SampledColor | null {
  let best: SampledColor | null = null;
  let bestScore = -1;
  for (const c of pool) {
    const { s } = rgbToHsl({ r: c.r, g: c.g, b: c.b });
    if (s < 0.15) continue; // 跳过低饱和，只看明显带色的
    const score = s * c.count;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

// 默认配色（含语义化字段）
const DEFAULT_PALETTE: ExtractedColors = (() => {
  const p = buildPalette('#E9E4DA', '#C9C0B0', '#B5433A');
  return p;
})();

// ============================================================================
//  精选预设配色 — 覆盖基本色相，杂志风美学
//  每色含深/浅两套（共 16 套），任何情况下都能直接切换而无需等待提色
// ============================================================================

type PresetTriad = {
  candidateName: string;
  dominant: string;
  secondary: string;
  accent: string;
};

// 设计约束：
//   深色：L≈0.18~0.28，饱和度不过高（避免霓虹感）
//   浅色：L≈0.80~0.92，饱和度温和（米色/奶油感而非糖果色）
//   accent：与 dominant 有清晰对比，保证用作小装饰/链接时醒目
const PRESET_TRIADS: PresetTriad[] = [
  // —— 暖色系 ——
  { candidateName: '砖红缎 · 深', dominant: '#3A1E1A', secondary: '#5A2E26', accent: '#E8B4A0' },
  { candidateName: '砖红缎 · 浅', dominant: '#F0D9D2', secondary: '#D9B8AE', accent: '#8C3B2E' },

  { candidateName: '赤陶橙 · 深', dominant: '#3B2418', secondary: '#5E3A24', accent: '#F3B182' },
  { candidateName: '赤陶橙 · 浅', dominant: '#F4E2D0', secondary: '#E3C7A9', accent: '#B65630' },

  { candidateName: '琥珀金 · 深', dominant: '#3C2D14', secondary: '#614A1F', accent: '#F2CC8F' },
  { candidateName: '琥珀金 · 浅', dominant: '#F3E7CC', secondary: '#DDC79A', accent: '#A3741C' },

  // —— 中色系 ——
  { candidateName: '橄榄苔 · 深', dominant: '#262E1D', secondary: '#405030', accent: '#B8D08A' },
  { candidateName: '橄榄苔 · 浅', dominant: '#E6EBDB', secondary: '#C7D0B1', accent: '#5A6B36' },

  { candidateName: '松石青 · 深', dominant: '#173331', secondary: '#24524D', accent: '#8CD1CA' },
  { candidateName: '松石青 · 浅', dominant: '#DCECEA', secondary: '#B3D2CE', accent: '#2E726A' },

  // —— 冷色系 ——
  { candidateName: '深海蓝 · 深', dominant: '#15243A', secondary: '#253E60', accent: '#9BB9D9' },
  { candidateName: '深海蓝 · 浅', dominant: '#DCE3EC', secondary: '#B6C3D5', accent: '#2E4F7A' },

  { candidateName: '暮色紫 · 深', dominant: '#2A1E3A', secondary: '#473262', accent: '#C6B0DD' },
  { candidateName: '暮色紫 · 浅', dominant: '#E6DFEE', secondary: '#C6B8DA', accent: '#5E4583' },

  { candidateName: '玫褐粉 · 深', dominant: '#341C28', secondary: '#562E42', accent: '#E8B1C7' },
  { candidateName: '玫褐粉 · 浅', dominant: '#F0DCE5', secondary: '#DCBACB', accent: '#8F3D62' },
];

// 把预设 triad 包装为 PaletteCandidate（供 UI 直接追加）
const PRESET_PALETTES: PaletteCandidate[] = PRESET_TRIADS.map((t, i) => {
  // 先用 buildPalette 过一遍精炼，保证后续 UI 的 gradient/text/badge 全部派生一致
  const colors = buildPalette(t.dominant, t.secondary, t.accent);
  return {
    candidateId: `p${i}`,
    candidateName: t.candidateName,
    dominantHex: colors.dominant,
    dominant: colors.dominant,
    secondary: colors.secondary,
    accent: colors.accent,
  };
});

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
    // 兜底：先放两套保险，再追加精选预设
    const fallback: PaletteCandidate[] = [
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
    return [...fallback, ...PRESET_PALETTES];
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

  // 组装候选顺序：真正的最主色（占比最高）排第一，保证 candidates[0] 与
  // extractDominantColors / autoExtractColors 应用的一致；其余按浅深交错排列，
  // 让 UI 首屏同时可见浅深。
  const picked: SampledColor[] = [];
  const pickedKey = new Set<string>();
  const tryPick = (c: SampledColor | undefined) => {
    if (!c) return;
    const key = `${c.r},${c.g},${c.b}`;
    if (pickedKey.has(key)) return;
    pickedKey.add(key);
    picked.push(c);
  };
  // 1) 真正的最主色排第一（与 extractDominantColors 一致）
  tryPick(topPool[0]);
  // 2) 其余浅深交错
  const maxPerSide = 2;
  for (let i = 0; i < maxPerSide; i++) {
    tryPick(lightPicked[i]);
    tryPick(darkPicked[i]);
  }
  if (picked.length === 0) picked.push(topPool[0]);

  let candidates: PaletteCandidate[] = picked.map((c, idx) => {
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

  // —— 图片黑白很多时，额外增加"忽略黑白、找鲜彩主色"的候选 ——
  // 触发：无彩色（黑/白/灰）像素占比 ≥ 55%。此时常规候选的 dominant 多被灰度占据，
  // 追加一个用"最具色彩的颜色"作为 dominant 的候选；且其 secondary/accent 也仅从
  // 彩色池派生，保证整套配色鲜活可用。插到索引 1（紧跟真主色之后）让用户一眼可见。
  const achromaticRatio = computeAchromaticRatio(topPool);
  if (achromaticRatio >= 0.55) {
    const colorful = findMostColorful(topPool);
    if (colorful) {
      const colorfulHex = rgbToHex({ r: colorful.r, g: colorful.g, b: colorful.b });
      const exists = candidates.some((cand) => cand.dominantHex === colorfulHex);
      if (!exists) {
        // 为鲜彩候选准备"仅彩色"的 topPool，让 secondary/accent 也具色彩
        const chromaticPool = topPool.filter((c) => !isAchromaticColor(c));
        const colorfulPool = chromaticPool.length >= 2 ? chromaticPool : topPool;
        const triad = pickTriadForDominant(colorful, colorfulPool);
        const l = rgbToHsl(hexToRgb(triad.dominant)).l;
        const depthTag = l < 0.5 ? '（深）' : '（浅）';
        candidates.splice(1, 0, {
          candidateId: 'c-colorful',
          candidateName: `主色 · ${hueFamilyName(triad.dominant)}${depthTag} · 鲜彩`,
          dominantHex: triad.dominant,
          ...triad,
        });
        // 重新编号 candidateId 以保持与索引一致
        candidates = candidates.map((c, i) => ({ ...c, candidateId: `c${i}` }));
      }
    }
  }

  // —— 永远在末尾追加精选预设配色（覆盖全色相，任何提取结果不满意时的手动备选） ——
  // candidateId 用 p0~p15，与动态提取的 c0~cN 天然不冲突，无需重新编号
  return [...candidates, ...PRESET_PALETTES];
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

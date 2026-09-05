import { create } from 'zustand';
import {
  ExportSize,
  PlogImage,
  PlogElement,
  Highlight,
  DeviceType,
  ExtractedColors,
} from '../types';
import { extractDominantColors, extractPaletteCandidates, buildPaletteStyled, PALETTE_STYLES, PaletteCandidate } from '../lib/colorExtractor';

export type PaletteStyleDef = { styleId: string; styleName: string };

const UID = () => Math.random().toString(36).slice(2, 11);

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ============================================================
//  背景深浅判断：保证新创建的默认文字颜色"在画布上肉眼一定可见"
// ============================================================
function parseColorToRgb(input: string): { r: number; g: number; b: number } | null {
  if (!input) return null;
  const s = input.trim();
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }
  const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  return null;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function estimateBgLuminance(state: {
  bgType: 'gradient' | 'color' | 'blur';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
}): number {
  if (state.bgType === 'color') {
    const rgb = parseColorToRgb(state.bgColor);
    return rgb ? relativeLuminance(rgb) : 0.5;
  }
  // gradient / blur：取 start + end 平均
  const a = parseColorToRgb(state.gradientStart);
  const b = parseColorToRgb(state.gradientEnd);
  const la = a ? relativeLuminance(a) : 0.5;
  const lb = b ? relativeLuminance(b) : 0.5;
  return (la + lb) / 2;
}

export type StudioTab = 'templates' | 'canvas' | 'text' | 'elements';

export type StudioTemplateId = 'showcase' | 'aesthetic-gallery';

export type StudioTemplateCategory = 'all' | 'cover';

export interface StudioTemplateConfig {
  id: StudioTemplateId;
  name: string;
  category: StudioTemplateCategory;
  description: string;
  previewColor: string;
}

export const STUDIO_TEMPLATES: StudioTemplateConfig[] = [
  {
    id: 'showcase',
    name: '工具推荐爆款',
    category: 'cover',
    description: '胶带标签 + 大号截图 + 标题描述段 · 提取色自动配色',
    previewColor: '#64748b',
  },
  {
    id: 'aesthetic-gallery',
    name: '高级暗黑明信片',
    category: 'cover',
    description: '深哑光背景 + 内嵌卡片 + 品牌徽章 · 极简高级感',
    previewColor: '#111827',
  },
];

interface StudioState {
  activeTab: StudioTab;
  templateId: StudioTemplateId;
  templateCategory: StudioTemplateCategory;

  aspectRatio: ExportSize;
  customWidth: number;
  customHeight: number;

  bgType: 'gradient' | 'color' | 'blur';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  autoColorEnabled: boolean;
  extractedColors: ExtractedColors | null;
  paletteCandidates: PaletteCandidate[];
  selectedCandidateId: string | null;
  paletteStyles: PaletteStyleDef[];
  selectedStyleId: string;

  images: PlogImage[];
  imageAspectRatio: string;
  imageScale: number;
  showDeviceFrame: boolean;
  deviceType: DeviceType;

  title: string;
  subtitle: string;
  seriesNumber: string;
  fontFamily: string;
  accentColor: string;
  highlights: Highlight[];

  floatingElements: PlogElement[];
  selectedElementId: string | null;

  // —— 多页（PPT 式）项目 ——
  pages: StudioPageData[];
  currentPageId: string;

  // Actions
  setActiveTab: (tab: StudioTab) => void;
  setTemplateId: (id: StudioTemplateId) => void;
  setTemplateCategory: (cat: StudioTemplateCategory) => void;

  setAspectRatio: (ratio: ExportSize) => void;
  setCustomSize: (w: number, h: number) => void;

  setBgType: (type: 'gradient' | 'color' | 'blur') => void;
  setBgColor: (color: string) => void;
  setGradient: (start: string, end: string) => void;
  setAutoColorEnabled: (enabled: boolean) => void;
  autoExtractColors: (imageSrc: string) => Promise<void>;
  /** 切换主色候选（主变体）—— 从图片提取的不同 dominant */
  applyPaletteCandidate: (candidateId: string) => void;
  /** 切换风格（次变体）—— 同一主色下的 HSL 风格变化 */
  applyPaletteStyle: (styleId: string) => void;
  /** 内部共享：把一套 ExtractedColors 应用到全局 + background 元素 + 模板默认元素 */
  _applyPaletteToState: (colors: ExtractedColors, imageSrc?: string) => void;

  setImages: (images: PlogImage[]) => void;
  addImage: (image: PlogImage) => void;
  setPrimaryImage: (id: string) => void;
  removeImage: (id: string) => void;
  setImageAspectRatio: (ratio: string) => void;
  setImageScale: (scale: number) => void;
  detectImageRatio: (url: string) => void;
  setShowDeviceFrame: (show: boolean) => void;
  setDeviceType: (device: DeviceType) => void;

  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setSeriesNumber: (num: string) => void;
  setFontFamily: (font: string) => void;
  setAccentColor: (color: string) => void;

  addHighlight: () => void;
  updateHighlight: (id: string, partial: Partial<Highlight>) => void;
  removeHighlight: (id: string) => void;

  addFloatingElement: (element: PlogElement) => void;
  updateFloatingElement: (id: string, partial: Partial<PlogElement>) => void;
  removeFloatingElement: (id: string) => void;
  /** 调整图层顺序：direction = 'up'上移一层 / 'down'下移一层 / 'top'置顶 / 'bottom'置底。背景层不允许重排。 */
  reorderFloatingElementLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  setSelectedElementId: (id: string | null) => void;
  /** 对图片/素材元素：按 imageUrl 测量原图真实宽高 → 写入 aspectRatio 并锁定宽高比。URL 改变会自动重新测量。 */
  ensureImageAspectRatio: (id: string) => void;

  /** 根据当前 templateId + 当前 title/subtitle + 主图 URL + 提取色，生成默认好看的"样例元素组合" */
  applyTemplateDefaults: (options?: { preserveManual?: boolean }) => void;
  /** 快速新增一个元素（自动分配 zIndex/id），用于"添加元素"的工具栏按钮 */
  addElementByType: (type: PlogElement['type']) => void;

  /** 导出当前完整项目为可序列化对象（v2 多页格式，用于存档） */
  exportConfig: () => StudioProjectSnapshot;
  /** 从导出快照恢复配置（v2 多页 / v1 单页均兼容）。返回是否成功 */
  importConfig: (snapshot: unknown) => boolean;

  // —— 多页（PPT 式）项目 actions ——
  /** 把当前镜像字段写回 pages 里的当前页（切页/导出/存档前调用） */
  captureCurrentPage: () => void;
  /** 内部：把一页的字段应用到根级镜像（并重测图片比例） */
  _applyPageFields: (data: Partial<StudioPageFields>) => void;
  /** 内部：切入指定页（存量无配色页自动跟随来源页的配色方案），镜像应用该页字段 */
  _applyPageWithFallback: (id: string) => void;
  /** 切换到指定页（自动写回当前页） */
  switchPage: (id: string) => void;
  /** 新建空白页（沿用当前页的尺寸/背景/字体），插入当前页之后并切换 */
  addPage: () => void;
  /** 深拷贝指定页，插入其之后并切换 */
  duplicatePage: (id: string) => void;
  /** 删除指定页（至少保留一页；删除当前页时自动切到相邻页） */
  deletePage: (id: string) => void;
  /** 页面排序：dir = -1 左移 / 1 右移 */
  movePage: (id: string, dir: -1 | 1) => void;
  /** 重命名页面 */
  renamePage: (id: string, name: string) => void;
}

/** 导出快照结构 —— 只含"用户可配置"字段，actions/derived 不导出 */
export interface StudioConfigSnapshot {
  __type: 'redcanvas-studio-config';
  version: 1;
  exportedAt: string;
  templateId: StudioTemplateId;
  aspectRatio: ExportSize;
  customWidth: number;
  customHeight: number;
  bgType: 'gradient' | 'color' | 'blur';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  autoColorEnabled: boolean;
  extractedColors: ExtractedColors | null;
  paletteCandidates: PaletteCandidate[];
  selectedCandidateId: string | null;
  selectedStyleId: string;
  images: PlogImage[];
  imageAspectRatio: string;
  imageScale: number;
  showDeviceFrame: boolean;
  deviceType: DeviceType;
  title: string;
  subtitle: string;
  seriesNumber: string;
  fontFamily: string;
  accentColor: string;
  highlights: Highlight[];
  floatingElements: PlogElement[];
}

// ============================================================
//  多页（PPT 式）项目支持
//  - pages[] 保存每一页的完整画布字段；根级字段是"当前页"的镜像
//  - 切页 = captureCurrentPage() 写回当前页 + _applyPageFields() 读出目标页
//  - 这样所有现有编辑 action 都无需感知"页"的存在
// ============================================================

/** 每一页需要隔离的字段（其余字段为项目级/会话级，跨页共享） */
const PAGE_FIELDS = [
  'templateId', 'aspectRatio', 'customWidth', 'customHeight',
  'bgType', 'bgColor', 'gradientStart', 'gradientEnd',
  'autoColorEnabled', 'extractedColors', 'paletteCandidates',
  'selectedCandidateId', 'selectedStyleId',
  'images', 'imageAspectRatio', 'imageScale', 'showDeviceFrame', 'deviceType',
  'title', 'subtitle', 'seriesNumber', 'fontFamily', 'accentColor',
  'highlights', 'floatingElements',
] as const;

export type PageFieldKey = (typeof PAGE_FIELDS)[number];
export type StudioPageFields = Pick<StudioState, PageFieldKey>;

/** 单页数据：元信息 + 该页全部画布字段 */
export interface StudioPageData {
  id: string;
  name: string;
  data: StudioPageFields;
}

/** v2 项目快照：多页打包（config.json / IndexedDB 顶层结构） */
export interface StudioProjectSnapshot {
  __type: 'redcanvas-studio-project';
  version: 2;
  exportedAt: string;
  currentPageId: string;
  pages: StudioPageData[];
}

const pickPageFields = (s: StudioState): StudioPageFields => {
  const out = {} as Record<PageFieldKey, unknown>;
  for (const f of PAGE_FIELDS) out[f] = s[f];
  return out as unknown as StudioPageFields;
};

const pageFieldsShallowEqual = (a: StudioPageFields, b: StudioPageFields): boolean => {
  for (const f of PAGE_FIELDS) {
    if ((a as unknown as Record<string, unknown>)[f] !== (b as unknown as Record<string, unknown>)[f]) return false;
  }
  return true;
};

/** 从字段集合构造背景元素（保证每页都有一层可选中的背景） */
const makeBgElement = (
  f: Pick<StudioPageFields, 'bgType' | 'bgColor' | 'gradientStart' | 'gradientEnd' | 'images'>
): PlogElement => ({
  id: `el-bg-${UID()}`,
  type: 'background',
  content: '画布背景',
  x: 0, y: 0,
  zIndex: 0,
  widthPct: 100, heightPct: 100,
  bgVariant: f.bgType,
  bgColor: f.bgColor,
  gradientStart: f.gradientStart,
  gradientEnd: f.gradientEnd,
  imageUrl: f.images[0]?.url || '',
});

/** 读入一页数据时兜底：floatingElements 缺背景层则补建 */
const withPageBackground = (data: StudioPageFields): PlogElement[] =>
  data.floatingElements.some((e) => e.type === 'background')
    ? data.floatingElements
    : [makeBgElement(data), ...data.floatingElements];

/** 字段类型粗校验：仅放行基本类型/数组/null，缺字段用 fallback 兜底，避免脏数据炸渲染 */
function sanitizePageData(raw: unknown, fb: StudioPageFields): StudioPageFields {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const pick = <T,>(key: PageFieldKey, fallback: T): T => {
    const v = s[key];
    return v === undefined ? fallback : (v as T);
  };
  const asString = (key: PageFieldKey, fbv: string) => {
    const v = s[key];
    return typeof v === 'string' ? v : fbv;
  };
  const asNumber = (key: PageFieldKey, fbv: number) => {
    const v = s[key];
    return typeof v === 'number' && Number.isFinite(v) ? v : fbv;
  };
  const asBool = (key: PageFieldKey, fbv: boolean) => {
    const v = s[key];
    return typeof v === 'boolean' ? v : fbv;
  };
  const asArray = <T,>(key: PageFieldKey, fbv: T[]): T[] => {
    const v = s[key];
    return Array.isArray(v) ? (v as T[]) : fbv;
  };
  const asNullableObj = <T,>(key: PageFieldKey): T | null => {
    const v = s[key];
    return v && typeof v === 'object' ? (v as T) : null;
  };
  return {
    templateId: pick<StudioTemplateId>('templateId', fb.templateId),
    aspectRatio: pick<ExportSize>('aspectRatio', fb.aspectRatio),
    customWidth: asNumber('customWidth', fb.customWidth),
    customHeight: asNumber('customHeight', fb.customHeight),
    bgType: pick<'gradient' | 'color' | 'blur'>('bgType', fb.bgType),
    bgColor: asString('bgColor', fb.bgColor),
    gradientStart: asString('gradientStart', fb.gradientStart),
    gradientEnd: asString('gradientEnd', fb.gradientEnd),
    autoColorEnabled: asBool('autoColorEnabled', fb.autoColorEnabled),
    extractedColors: asNullableObj<ExtractedColors>('extractedColors'),
    paletteCandidates: asArray('paletteCandidates', fb.paletteCandidates),
    selectedCandidateId: typeof s.selectedCandidateId === 'string' ? s.selectedCandidateId : fb.selectedCandidateId,
    selectedStyleId: asString('selectedStyleId', fb.selectedStyleId),
    images: asArray<PlogImage>('images', fb.images),
    imageAspectRatio: asString('imageAspectRatio', fb.imageAspectRatio),
    imageScale: asNumber('imageScale', fb.imageScale),
    showDeviceFrame: asBool('showDeviceFrame', fb.showDeviceFrame),
    deviceType: pick<DeviceType>('deviceType', fb.deviceType),
    title: asString('title', fb.title),
    subtitle: asString('subtitle', fb.subtitle),
    seriesNumber: asString('seriesNumber', fb.seriesNumber),
    fontFamily: asString('fontFamily', fb.fontFamily),
    accentColor: asString('accentColor', fb.accentColor),
    highlights: asArray<Highlight>('highlights', fb.highlights),
    floatingElements: asArray<PlogElement>('floatingElements', fb.floatingElements),
  };
}

/** 首次使用的默认页面字段（与旧版单页默认值保持一致） */
const INITIAL_PAGE_FIELDS: StudioPageFields = {
  templateId: 'showcase',
  aspectRatio: '3:4',
  customWidth: 1080,
  customHeight: 1440,
  bgType: 'gradient',
  bgColor: '#c9d1d9',
  gradientStart: '#cbd5e1',
  gradientEnd: '#94a3b8',
  autoColorEnabled: true,
  extractedColors: null,
  paletteCandidates: [],
  selectedCandidateId: null,
  selectedStyleId: 'balanced',
  images: [{ id: 'img-1', url: '/screenshot.png', title: '主图界面' }],
  imageAspectRatio: '4:5',
  imageScale: 1,
  showDeviceFrame: false,
  deviceType: 'none',
  title: '极简设计\n高级感',
  subtitle: '',
  seriesNumber: '',
  fontFamily: 'kuaile',
  accentColor: '#1a1a1a',
  highlights: [],
  floatingElements: [],
};

export const useStudioStore = create<StudioState>((set, get) => ({
  activeTab: 'templates',
  templateCategory: 'all',
  paletteStyles: PALETTE_STYLES,

  // —— 当前页镜像字段（与 pages[0].data 同源引用） ——
  ...INITIAL_PAGE_FIELDS,

  selectedElementId: null,

  // —— 多页（PPT 式）项目 ——
  pages: [{ id: 'page-1', name: '第 1 页', data: INITIAL_PAGE_FIELDS }],
  currentPageId: 'page-1',

  setActiveTab: (activeTab) => set({ activeTab }),
  setTemplateId: (templateId) => {
    set({ templateId });
    // 切模板 = 重置为该模板的默认元素组合（样例）
    requestAnimationFrame(() => get().applyTemplateDefaults({ preserveManual: false }));
  },
  setTemplateCategory: (templateCategory) => set({ templateCategory }),

  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setCustomSize: (customWidth, customHeight) => set({ customWidth, customHeight }),

  setBgType: (bgType) => {
    const s = get();
    set({ bgType });
    // 同步到 background 元素（若存在）
    const bgEl = s.floatingElements.find((e) => e.type === 'background');
    if (bgEl && bgEl.bgVariant !== bgType) {
      set({
        floatingElements: s.floatingElements.map((e) =>
          e.id === bgEl.id ? { ...e, bgVariant: bgType } : e
        ),
      });
    }
  },
  setBgColor: (bgColor) => {
    const s = get();
    set({ bgColor });
    const bgEl = s.floatingElements.find((e) => e.type === 'background');
    if (bgEl && bgEl.bgColor !== bgColor) {
      set({
        floatingElements: s.floatingElements.map((e) =>
          e.id === bgEl.id ? { ...e, bgColor } : e
        ),
      });
    }
  },
  setGradient: (gradientStart, gradientEnd) => {
    const s = get();
    set({ gradientStart, gradientEnd });
    const bgEl = s.floatingElements.find((e) => e.type === 'background');
    if (bgEl && (bgEl.gradientStart !== gradientStart || bgEl.gradientEnd !== gradientEnd)) {
      set({
        floatingElements: s.floatingElements.map((e) =>
          e.id === bgEl.id ? { ...e, gradientStart, gradientEnd } : e
        ),
      });
    }
  },
  setAutoColorEnabled: (autoColorEnabled) => set({ autoColorEnabled }),

  // —— 内部共享：把一套 ExtractedColors 应用到全局状态 + background 元素 + 模板默认元素 ——
  // badges/tags/stickers 用 primary（主色派生），不再滥用 accent；accent 仅留给链接
  _applyPaletteToState: (colors: ExtractedColors, imageSrc?: string) => {
    const s = get();
    const bgEl = s.floatingElements.find((e) => e.type === 'background');
    set({
      extractedColors: colors,
      gradientStart: colors.gradientStart,
      gradientEnd: colors.gradientEnd,
      bgColor: colors.dominant,
      accentColor: colors.accent,
      floatingElements: bgEl
        ? s.floatingElements.map((e) =>
            e.id === bgEl.id
              ? {
                  ...e,
                  bgColor: colors.dominant,
                  gradientStart: colors.gradientStart,
                  gradientEnd: colors.gradientEnd,
                  imageUrl: imageSrc || e.imageUrl,
                }
              : e
          )
        : s.floatingElements,
    });
    requestAnimationFrame(() => {
      const st = get();
      set({
        floatingElements: st.floatingElements.map((el) => {
          if (el.type === 'text') {
            // 按 fontSize 区分主/副标题：≥18 视为主标题用 textPrimary，否则副标题用 textSecondary
            // 不再用 zIndex 判断 —— 手动添加的元素 zIndex 是动态的，无法匹配模板固定值
            const isTitle = (el.fontSize ?? 20) >= 18;
            return { ...el, color: isTitle ? colors.textPrimary : colors.textSecondary };
          }
          if (el.type === 'longtext') {
            return { ...el, color: colors.textSecondary };
          }
          // 徽章 → badgeBg（永远深色）背景 + badgeText（永远浅色）文字
          if (el.type === 'badge') {
            return { ...el, bgColor: colors.badgeBg, color: colors.badgeText };
          }
          // 高亮贴纸 → accent 同色相（半透明底 + 实心文字）
          if (el.type === 'sticker') {
            return { ...el, bgColor: colors.accent, color: colors.accent };
          }
          // 标签 → 描边色用 textSecondary，文字用 textPrimary
          if (el.type === 'tag') {
            return { ...el, borderColor: colors.textSecondary, color: colors.textPrimary };
          }
          // 说明提示框 → 卡片底色/边框随 palette.cardBg/cardBorder 自适应，文字用 textPrimary
          if (el.type === 'annotation') {
            return {
              ...el,
              color: colors.textPrimary,
              bgColor: colors.cardBg,
              borderColor: colors.cardBorder,
            };
          }
          // 时间戳 → 文字用 textPrimary
          if (el.type === 'timestamp') {
            return { ...el, color: colors.textPrimary };
          }
          return el;
        }),
      });
    });
  },

  autoExtractColors: async (imageSrc: string) => {
    // 只走候选提取一条路：用 candidates[0] 构建配色，保证"应用配色"与
    // "UI 高亮候选"始终一致（此前 extractDominantColors 与 candidates[0]
    // 可能取到不同主色，造成添加图片与一键提色结果不一致）。
    const candidates = await extractPaletteCandidates(imageSrc);
    set({
      paletteCandidates: candidates,
      selectedCandidateId: candidates[0]?.candidateId ?? null,
      selectedStyleId: 'balanced',
    });
    const cand = candidates[0];
    let colors: ExtractedColors;
    if (cand) {
      colors = buildPaletteStyled(cand.dominant, cand.secondary, cand.accent, 'balanced');
    } else {
      // 兜底：候选为空（图片采样失败）→ 回退到单套提取
      colors = await extractDominantColors(imageSrc);
    }
    get()._applyPaletteToState(colors, imageSrc);
  },

  applyPaletteCandidate: (candidateId: string) => {
    const s = get();
    const cand = s.paletteCandidates.find((c) => c.candidateId === candidateId);
    if (!cand) return;
    set({ selectedCandidateId: candidateId });
    const colors = buildPaletteStyled(cand.dominant, cand.secondary, cand.accent, s.selectedStyleId);
    get()._applyPaletteToState(colors);
  },

  applyPaletteStyle: (styleId: string) => {
    const s = get();
    const cand = s.paletteCandidates.find((c) => c.candidateId === s.selectedCandidateId) || s.paletteCandidates[0];
    if (!cand) return;
    set({ selectedStyleId: styleId });
    const colors = buildPaletteStyled(cand.dominant, cand.secondary, cand.accent, styleId);
    get()._applyPaletteToState(colors);
  },

  setImages: (images) => {
    set({ images });
    if (images.length > 0 && get().autoColorEnabled) {
      get().autoExtractColors(images[0].url);
    }
  },
  addImage: (image) => {
    // 1) 加到图库
    set((state) => ({ images: [image, ...state.images], imageScale: 1 }));
    get().detectImageRatio(image.url);
    if (get().autoColorEnabled) {
      get().autoExtractColors(image.url);
    }
    // 2) 也把这张图作为 image 元素追加到画布（右下角区域，用户可拖）
    requestAnimationFrame(() => {
      const s = get();
      const nextZ = s.floatingElements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
      const newImageEl: PlogElement = {
        id: `el-${UID()}`,
        type: 'image',
        content: image.title || '',
        x: 50,
        y: 50,
        zIndex: nextZ,
        widthPct: 50,
        heightPct: 40,
        imageUrl: image.url,
        borderRadius: 14,
        shadowLevel: 3,
        objectFit: 'contain',
      };
      set((state) => ({
        floatingElements: [...state.floatingElements, newImageEl],
        selectedElementId: newImageEl.id,
      }));
      get().ensureImageAspectRatio(newImageEl.id);
    });
  },
  setPrimaryImage: (id) => {
    set((state) => {
      const selected = state.images.find((img) => img.id === id);
      if (!selected) return state;
      const rest = state.images.filter((img) => img.id !== id);
      return { images: [selected, ...rest] };
    });
    const mainUrl = get().images[0]?.url;
    if (mainUrl && get().autoColorEnabled) {
      get().autoExtractColors(mainUrl);
    }
  },
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),

  setShowDeviceFrame: (showDeviceFrame) => set({ showDeviceFrame }),
  setDeviceType: (deviceType) => set({ deviceType }),
  setImageAspectRatio: (imageAspectRatio) => set({ imageAspectRatio }),
  setImageScale: (imageScale) => set({ imageScale }),
  detectImageRatio: (url) => {
    if (!url || typeof window === 'undefined') return;
    const img = new Image();
    if (/^https?:\/\//i.test(url)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return;
      const g = gcd(w, h);
      const ratio = `${Math.round(w / g)}:${Math.round(h / g)}`;
      set({ imageAspectRatio: ratio, imageScale: 1 });
    };
    img.src = url;
  },

  setTitle: (title) => {
    set({ title });
    // 同步：把标题字段更新映射到 zIndex=20 的"模板主标题元素"，保持旧字段仍可用
    requestAnimationFrame(() => {
      const s = get();
      const lines = title.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      set({
        floatingElements: s.floatingElements.map((el) => {
          if (el.type === 'text' && el.zIndex === 20) return { ...el, content: lines[0] || '' };
          if (el.type === 'text' && el.zIndex === 18) return { ...el, content: lines.slice(1).join(' · ') || '' };
          return el;
        }),
      });
    });
  },
  setSubtitle: (subtitle) => {
    set({ subtitle });
    requestAnimationFrame(() => {
      const s = get();
      set({
        floatingElements: s.floatingElements.map((el) =>
          el.type === 'text' && el.zIndex === 18 ? { ...el, content: subtitle || '' } : el
        ),
      });
    });
  },
  setSeriesNumber: (seriesNumber) => set({ seriesNumber }),
  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    // 同步：把全局字体应用到"模板生成的文字元素"（zIndex 20/18/16 三个层级）
    requestAnimationFrame(() => {
      const s = get();
      set({
        floatingElements: s.floatingElements.map((el) => {
          if (el.type === 'text' && (el.zIndex === 20 || el.zIndex === 18 || el.zIndex === 16)) {
            return { ...el, fontFamily };
          }
          return el;
        }),
      });
    });
  },
  setAccentColor: (accentColor) => {
    // accentColor 现在仅作为"链接强调色"全局字段；不再同步到徽章/贴纸（它们用主色派生 primary）
    set({ accentColor });
  },

  addHighlight: () =>
    set((state) => ({
      highlights: [
        ...state.highlights,
        {
          id: Math.random().toString(36).substr(2, 9),
          text: '',
          color: state.accentColor,
          style: 'underline',
        },
      ],
    })),
  updateHighlight: (id, partial) =>
    set((state) => ({
      highlights: state.highlights.map((h) => (h.id === id ? { ...h, ...partial } : h)),
    })),
  removeHighlight: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),

  addFloatingElement: (element) => {
    set((state) => ({ floatingElements: [...state.floatingElements, element] }));
    get().captureCurrentPage();
    if ((element.type === 'image' || element.type === 'asset') && element.imageUrl) {
      requestAnimationFrame(() => get().ensureImageAspectRatio(element.id));
    }
  },
  updateFloatingElement: (id, partial) => {
    const s = get();
    const el = s.floatingElements.find((e) => e.id === id);
    if (!el) return;

    let patch: Partial<PlogElement> = { ...partial };

    // 对图片/素材：锁比例（仅当 widthPct 或 heightPct 其中一项被更新时，按 ratio 联动更新另一项）
    if ((el.type === 'image' || el.type === 'asset') && partial.aspectRatio !== undefined) {
      // ratio 写入后若用户尚未手动调整过尺寸 → 用当前 widthPct 或 heightPct 重新回推另一边，锁定
      const ratio = partial.aspectRatio > 0 ? partial.aspectRatio : el.aspectRatio;
      if (ratio && ratio > 0) {
        if (el.widthPct !== undefined && partial.heightPct === undefined) {
          patch.heightPct = Number((el.widthPct / ratio).toFixed(3));
        } else if (el.heightPct !== undefined && partial.widthPct === undefined) {
          patch.widthPct = Number((el.heightPct * ratio).toFixed(3));
        }
      }
    }
    if ((el.type === 'image' || el.type === 'asset') && partial.aspectRatio === undefined) {
      const ratio = el.aspectRatio;
      if (ratio && ratio > 0) {
        if ('widthPct' in patch && patch.widthPct !== undefined) {
          const minW = 5; // 主最小边：宽度 ≥ 5%
          let w = Math.max(minW, patch.widthPct);
          patch.widthPct = w;
          patch.heightPct = Number((w / ratio).toFixed(3));
        } else if ('heightPct' in patch && patch.heightPct !== undefined) {
          const minH = 5 / (ratio || 1); // 高度下限 = 宽度5% 对应的高度，不破坏比例
          let h = Math.max(minH, patch.heightPct);
          patch.heightPct = h;
          patch.widthPct = Number((h * ratio).toFixed(3));
        }
      }
    }

    const merged: PlogElement = { ...el, ...patch };
    const nextElements = s.floatingElements.map((e) =>
      e.id === id ? merged : e
    );
    set({ floatingElements: nextElements });

    // —— 若是 background 元素：把变更同步回全局 bgType/bgColor/gradient 字段，让 CanvasControlTab UI 也同步 ——
    if (el.type === 'background') {
      const patch2: any = {};
      if ('bgVariant' in patch && patch.bgVariant !== undefined) patch2.bgType = patch.bgVariant;
      if ('bgColor' in patch) patch2.bgColor = patch.bgColor;
      if ('gradientStart' in patch || 'gradientEnd' in patch) {
        patch2.gradientStart = patch.gradientStart ?? merged.gradientStart;
        patch2.gradientEnd = patch.gradientEnd ?? merged.gradientEnd;
      }
      if (Object.keys(patch2).length > 0) {
        // 避免再走 setBgType/setBgColor/setGradient 否则会再次触发 set 回 background → 递归无限循环
        // 直接 set 全局字段即可（已经同步了 elements）
        set(patch2);
      }
    }

    // 关键：实时写回当前页镜像，确保 pages[] 与根级镜像完全同步，刷新/切页时不丢失拖拽位置
    get().captureCurrentPage();

    // 换了图 → 重新测量原图比例
    if (patch.imageUrl !== undefined && patch.imageUrl !== (el.imageUrl || '')) {
      requestAnimationFrame(() => get().ensureImageAspectRatio(id));
    }
  },
  removeFloatingElement: (id) => {
    set((state) => ({
      floatingElements: state.floatingElements.filter((el) => el.id !== id),
    }));
    get().captureCurrentPage();
  },
  reorderFloatingElementLayer: (id, direction) => {
    set((state) => {
      const elements = state.floatingElements;
      const target = elements.find((e) => e.id === id);
      if (!target || target.type === 'background') return state;

      const bgEls = elements.filter((e) => e.type === 'background');
      const bgZ = bgEls.length > 0 ? Math.min(...bgEls.map((e) => e.zIndex)) : 0;
      const nonBg = elements
        .filter((e) => e.type !== 'background')
        .sort((a, b) => a.zIndex - b.zIndex);
      const pos = nonBg.findIndex((e) => e.id === id);
      if (pos < 0) return state;

      const updates: Record<string, number> = {};

      if (direction === 'up') {
        if (pos + 1 >= nonBg.length) return state;
        const partner = nonBg[pos + 1];
        updates[target.id] = partner.zIndex;
        updates[partner.id] = target.zIndex;
      } else if (direction === 'down') {
        if (pos - 1 < 0) return state;
        const partner = nonBg[pos - 1];
        updates[target.id] = partner.zIndex;
        updates[partner.id] = target.zIndex;
      } else if (direction === 'top') {
        const maxZ = Math.max(...nonBg.map((e) => e.zIndex));
        updates[target.id] = maxZ + 1;
      } else if (direction === 'bottom') {
        const others = nonBg.filter((e) => e.id !== id);
        if (others.length === 0) return state;
        const othersMinZ = Math.min(...others.map((e) => e.zIndex));
        updates[target.id] = Math.max(othersMinZ - 1, bgZ + 1);
      }

      const ids = Object.keys(updates);
      if (ids.length === 0) return state;
      return {
        floatingElements: elements.map((e) =>
          ids.includes(e.id) ? { ...e, zIndex: updates[e.id] } : e
        ),
      };
    });
    get().captureCurrentPage();
  },
  setSelectedElementId: (selectedElementId) => set({ selectedElementId }),

  ensureImageAspectRatio: (id) => {
    if (typeof window === 'undefined') return;
    const s = get();
    const el = s.floatingElements.find((e) => e.id === id);
    if (!el) return;
    if (el.type !== 'image' && el.type !== 'asset') return;
    const url = el.imageUrl;
    if (!url) return;

    const img = new Image();
    if (/^https?:\/\//i.test(url)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return;
      const ratio = w / h;
      // ratio 改变或首次填充 → updateFloatingElement(..., { aspectRatio }) 会自动联动另一边尺寸
      get().updateFloatingElement(id, { aspectRatio: ratio });
    };
    img.onerror = () => {
      // 加载失败也设一个安全 fallback 比例，避免 width/height 自由乱改
      if (!el.aspectRatio) {
        get().updateFloatingElement(id, { aspectRatio: 4 / 3 });
      }
    };
    img.src = url;
  },

  // ============================================================================
  //  新动作：模板 = 一组默认好看的"样例元素组合"
  // ============================================================================
  applyTemplateDefaults: (options) => {
    const preserve = options?.preserveManual ?? false;
    const s = get();
    if (preserve && s.floatingElements.length > 0) return;

    const palette = s.extractedColors;
    // 优先使用提取色；否则根据"背景实时亮度"选一对对比度足够的文字色（保证无论用户改什么背景都能看清）
    let textPrimary: string;
    let textSecondary: string;
    let textMuted: string;
    let accent: string;
    let primary: string; // 主色派生（标签/贴纸实心填充）
    let dominant: string; // 图片提取主色
    let badgeBg: string;  // 徽章背景（永远深色）
    let badgeText: string;// 徽章文字（永远浅色）
    let cardBg: string;
    let cardBorder: string;
    if (palette) {
      textPrimary = palette.textPrimary;
      textSecondary = palette.textSecondary;
      textMuted = palette.textMuted;
      accent = palette.accent;
      primary = palette.primary;
      dominant = palette.dominant;
      badgeBg = palette.badgeBg;
      badgeText = palette.badgeText;
      cardBg = palette.cardBg;
      cardBorder = palette.cardBorder;
    } else {
      const bgLum = estimateBgLuminance({
        bgType: s.bgType,
        bgColor: s.bgColor,
        gradientStart: s.gradientStart,
        gradientEnd: s.gradientEnd,
      });
      const isDark = bgLum < 0.35;
      if (isDark) {
        textPrimary = '#F5F1E8';
        textSecondary = '#C8C0AE';
        textMuted = '#8A8276';
        accent = s.accentColor || '#ff6b6b';
        primary = s.bgColor || '#3A3F4A';
        dominant = s.bgColor || '#3A3F4A';
        badgeBg = '#2A2318'; // 永远深色
        badgeText = '#F5F1E8'; // 永远浅色
        cardBg = '#15171C';
        cardBorder = 'rgba(255,255,255,0.08)';
      } else {
        textPrimary = '#1C1917';
        textSecondary = '#44403C';
        textMuted = '#78716C';
        accent = s.accentColor || '#111827';
        primary = s.bgColor || '#1C1917';
        dominant = s.bgColor || '#1C1917';
        badgeBg = '#1C1917'; // 永远深色（深炭灰）
        badgeText = '#F5F1E8'; // 永远浅色（奶油白）
        cardBg = '#FFFFFF';
        cardBorder = 'rgba(0,0,0,0.06)';
      }
      // 兼容老逻辑：templateId 为 aesthetic-gallery 时，仍偏向深卡片一点（仅微调 cardBg）
      if (s.templateId === 'aesthetic-gallery' && !isDark) {
        cardBg = '#FAF9F7';
      }
    }

    const mainUrl = s.images[0]?.url || '/screenshot.png';
    const titleLines = (s.title || '你的标题')
      .split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const line1 = titleLines[0] ?? '极简设计';
    const line2 = titleLines.slice(1).join(' · ') || s.subtitle || '';

    const elements: PlogElement[] = [];

    if (s.templateId === 'showcase') {
      // Showcase：大图在上居中，主标题在下，副标题一段，右上角小标签点缀
      elements.push({
        id: `el-${UID()}`,
        type: 'image',
        content: '',
        x: 12, y: 10,
        zIndex: 10,
        widthPct: 76, heightPct: 58,
        imageUrl: mainUrl,
        borderRadius: 18,
        shadowLevel: 3,
        objectFit: 'contain',
      });
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: line1,
        x: 12, y: 72,
        zIndex: 20,
        widthPct: 76,
        color: textPrimary,
        fontSize: 30,
        fontWeight: 900,
        fontFamily: s.fontFamily,
        lineHeight: 1.25,
      });
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: line2 || '默认好看的描述段落 · 双击编辑文字',
        x: 12, y: 84,
        zIndex: 18,
        widthPct: 76,
        color: textSecondary,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: s.fontFamily,
        lineHeight: 1.6,
      });
      elements.push({
        id: `el-${UID()}`,
        type: 'badge',
        content: 'RED CANVAS',
        x: 68, y: 6,
        zIndex: 12,
        color: badgeText,
        bgColor: badgeBg,
        shadowLevel: 1,
        badgeNumber: '',
        fontSize: 10,
        fontWeight: 700,
      });
      // 文本框样例：zIndex=16 作为"模板默认正文"标记，融入背景无卡片
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: '保持**极简**与**高级**，从图片中提取自然配色。',
        x: 12, y: 91,
        zIndex: 16,
        widthPct: 76,
        color: textSecondary,
        markdownEnabled: true,
        fontSize: 15,
        fontWeight: 400,
        lineHeight: 1.72,
        letterSpacing: 0.004,
        fontFamily: s.fontFamily,
      });
    } else {
      // AestheticGallery：内嵌卡片风（一个 cardBg 容器 + 里面的 图/标题/副标题/品牌）
      // 实现：用一个 image 没有图的"卡片容器"（bg=cardBg, radius=20, border=cardBorder, shadow=4）当底层
      elements.push({
        id: `el-${UID()}`,
        type: 'image',
        content: '',
        x: 12, y: 10,
        zIndex: 5,
        widthPct: 76, heightPct: 80,
        imageUrl: '',
        borderRadius: 20,
        shadowLevel: 4,
        borderWidth: 1,
        borderColor: cardBorder,
        bgColor: cardBg,
        objectFit: 'contain',
      });
      // 卡片里的图（占卡片上半部）
      elements.push({
        id: `el-${UID()}`,
        type: 'image',
        content: '',
        x: 15, y: 13,
        zIndex: 10,
        widthPct: 70, heightPct: 50,
        imageUrl: mainUrl,
        borderRadius: 14,
        shadowLevel: 2,
        objectFit: 'contain',
      });
      // 主标题（卡片内）
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: line1,
        x: 16, y: 66,
        zIndex: 20,
        widthPct: 68,
        color: textPrimary,
        fontSize: 22,
        fontWeight: 900,
        fontFamily: s.fontFamily,
        lineHeight: 1.25,
      });
      // 副标题
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: line2 || '—',
        x: 16, y: 74,
        zIndex: 18,
        widthPct: 68,
        color: textSecondary,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: s.fontFamily,
        letterSpacing: 0.02,
      });
      // 品牌 tag
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: 'REDCANVAS',
        x: 16, y: 84,
        zIndex: 16,
        color: textMuted,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: 0.2,
      });
      // 右上角主色点
      elements.push({
        id: `el-${UID()}`,
        type: 'badge',
        content: '',
        x: 80, y: 85,
        zIndex: 12,
        color: badgeText,
        bgColor: badgeBg,
        shadowLevel: 0,
        badgeNumber: '',
        borderRadius: 999,
        widthPct: 3, heightPct: 2,
      });
      // Aesthetic Gallery 内的文本框（放在卡片下半部，文字融入 cardBg，无外壳）
      elements.push({
        id: `el-${UID()}`,
        type: 'text',
        content: '一套从图片中 **自动配色** 的杂志排版方案。',
        x: 16, y: 81,
        zIndex: 16, // 与 showcase 同号，用于 autoExtractColors 同步正文色
        widthPct: 68,
        color: textSecondary,
        markdownEnabled: true,
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.7,
        letterSpacing: 0.004,
        fontFamily: s.fontFamily,
      });
    }

    // ====== 背景元素（zIndex=0，最底层，整画布铺满，用户可选可编辑属性） ======
    const bgEl: PlogElement = {
      id: `el-bg-${UID()}`,
      type: 'background',
      content: '画布背景',
      x: 0, y: 0,
      zIndex: 0,
      widthPct: 100, heightPct: 100,
      bgVariant: s.bgType,
      bgColor: s.bgColor,
      gradientStart: s.gradientStart,
      gradientEnd: s.gradientEnd,
      imageUrl: s.images[0]?.url || '', // blur 模式下用的模糊图 URL
    };

    set({ floatingElements: [bgEl, ...elements], selectedElementId: null });
    requestAnimationFrame(() => {
      for (const el of elements) {
        if ((el.type === 'image' || el.type === 'asset') && el.imageUrl) {
          get().ensureImageAspectRatio(el.id);
        }
      }
    });
  },

  addElementByType: (type) => {
    const s = get();
    const nextZ = s.floatingElements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
    const palette = s.extractedColors;
    // 新建元素的默认文字颜色：优先提取色 → 否则根据"当前背景真实亮度"自适应，确保能看清
    let textPrimary: string;
    let textSecondary: string;
    let accent: string;
    let primary: string;
    let dominant: string;
    let badgeBg: string;
    let badgeText: string;
    let cardBg: string;
    let cardBorder: string;
    if (palette) {
      textPrimary = palette.textPrimary;
      textSecondary = palette.textSecondary;
      accent = palette.accent;
      primary = palette.primary;
      dominant = palette.dominant;
      badgeBg = palette.badgeBg;
      badgeText = palette.badgeText;
      cardBg = palette.cardBg;
      cardBorder = palette.cardBorder;
    } else {
      const bgLum = estimateBgLuminance({
        bgType: s.bgType,
        bgColor: s.bgColor,
        gradientStart: s.gradientStart,
        gradientEnd: s.gradientEnd,
      });
      const isDark = bgLum < 0.35;
      textPrimary = isDark ? '#F7F3EC' : '#111827';
      textSecondary = isDark ? '#C8C0AE' : '#44403C';
      accent = isDark ? '#ff8787' : '#ff2442';
      primary = isDark ? (s.bgColor || '#3A3F4A') : (s.bgColor || '#1C1917');
      dominant = isDark ? (s.bgColor || '#3A3F4A') : (s.bgColor || '#1C1917');
      badgeBg = '#1C1917'; // 永远深色
      badgeText = '#F5F1E8'; // 永远浅色
      // 卡片底色：深底用半透明白、浅底用纯白，均能与背景拉开层次且不刺眼
      cardBg = isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF';
      cardBorder = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)';
    }

    // —— background：若已存在则直接选中；不存在才创建（保证画布始终只有一张背景层） ——
    if (type === 'background') {
      const existingBg = s.floatingElements.find((e) => e.type === 'background');
      if (existingBg) {
        set({ selectedElementId: existingBg.id });
        return;
      }
      const bg: PlogElement = {
        id: `el-bg-${UID()}`,
        type: 'background',
        content: '画布背景',
        x: 0, y: 0,
        zIndex: 0,
        widthPct: 100, heightPct: 100,
        bgVariant: s.bgType,
        bgColor: s.bgColor,
        gradientStart: s.gradientStart,
        gradientEnd: s.gradientEnd,
        imageUrl: s.images[0]?.url || '',
      };
      set((state) => ({
        floatingElements: [bg, ...state.floatingElements],
        selectedElementId: bg.id,
      }));
      return;
    }

    let base: PlogElement;
    switch (type) {
      case 'image':
        base = {
          id: `el-${UID()}`,
          type: 'image',
          content: '',
          x: 25, y: 25,
          zIndex: nextZ,
          widthPct: 50, heightPct: 40,
          imageUrl: s.images[0]?.url || '',
          borderRadius: 0,
          shadowLevel: 0,
          objectFit: 'contain',
        };
        break;
      case 'longtext':
        // 旧入口兼容：内部走 'text'（已统一为文本框）
        base = {
          id: `el-${UID()}`,
          type: 'text',
          content: '文本内容',
          x: 30, y: 45,
          zIndex: nextZ,
          color: textPrimary,
          fontSize: 22,
          fontWeight: 400,
          fontFamily: 'xiaolai',
          markdownEnabled: true,
        };
        break;
      case 'text':
        base = {
          id: `el-${UID()}`,
          type: 'text',
          content: '文本内容',
          x: 30, y: 45,
          zIndex: nextZ,
          color: textPrimary,
          fontSize: 22,
          fontWeight: 400,
          fontFamily: 'xiaolai',
          markdownEnabled: true,
        };
        break;
      case 'asset':
        base = {
          id: `el-${UID()}`,
          type: 'asset',
          content: '',
          x: 40, y: 40,
          zIndex: nextZ,
          widthPct: 20, heightPct: 20,
          imageUrl: '',
          assetKind: 'vector',
          borderRadius: 0,
          shadowLevel: 0,
          objectFit: 'contain',
        };
        break;
      case 'badge':
        base = {
          id: `el-${UID()}`,
          type: 'badge',
          content: '步骤',
          x: 50, y: 50,
          zIndex: nextZ,
          color: badgeText,
          bgColor: badgeBg,
          fontSize: 12,
          fontWeight: 800,
          shadowLevel: 2,
          badgeNumber: '01',
          fontFamily: 'xiaolai',
        };
        break;
      case 'sticker':
        // 高亮贴纸：荧光记号笔色块，accent 半透明底 + accent 实心文字（同色相）
        base = {
          id: `el-${UID()}`,
          type: 'sticker',
          content: '重点',
          x: 50, y: 50,
          zIndex: nextZ,
          color: accent,
          bgColor: accent,
          fontSize: 14,
          fontWeight: 700,
          shadowLevel: 0,
          rotation: -3,
        };
        break;
      case 'annotation':
        // 说明提示框：气泡式注释卡片（带小尾巴指向）
        // 卡片底色用 palette.cardBg（随深/浅背景自适应，避免白色与浅底冲突）
        base = {
          id: `el-${UID()}`,
          type: 'annotation',
          content: '这里添加说明文字',
          x: 50, y: 50,
          zIndex: nextZ,
          color: textPrimary,
          bgColor: cardBg,
          borderColor: cardBorder,
          fontSize: 12,
          fontWeight: 500,
          shadowLevel: 2,
          widthPct: 32,
        };
        break;
      case 'tag':
        // 标签：描边幽灵风格 + # 前缀
        base = {
          id: `el-${UID()}`,
          type: 'tag',
          content: '标签',
          x: 50, y: 50,
          zIndex: nextZ,
          color: textPrimary,
          bgColor: 'transparent',
          borderColor: textSecondary,
          borderWidth: 1,
          fontSize: 11,
          fontWeight: 500,
          shadowLevel: 0,
        };
        break;
      case 'timestamp':
        // 时间戳：杂志风日期块。content 留空=今天；支持 YYYY-MM-DD
        base = {
          id: `el-${UID()}`,
          type: 'timestamp',
          content: '',
          x: 50, y: 50,
          zIndex: nextZ,
          color: textPrimary,
          fontFamily: 'xiaolai',
          fontSize: 14,
          fontWeight: 800,
          shadowLevel: 0,
        };
        break;
      default:
        base = {
          id: `el-${UID()}`,
          type: 'badge',
          content: 'NEW',
        x: 50, y: 50,
        zIndex: nextZ,
        color: badgeText,
        bgColor: badgeBg,
        shadowLevel: 2,
        badgeNumber: '',
        fontWeight: 700,
        fontFamily: 'xiaolai',
        };
        break;
    }

    set((state) => ({
      floatingElements: [...state.floatingElements, base],
      selectedElementId: base.id,
    }));
    if ((base.type === 'image' || base.type === 'asset') && base.imageUrl) {
      requestAnimationFrame(() => get().ensureImageAspectRatio(base.id));
    }
  },

  // ========== 多页：写回 / 读出 / 切换 / 增删 / 排序 ==========
  captureCurrentPage: () => {
    const s = get();
    const data = pickPageFields(s);
    const curPage = s.pages.find((p) => p.id === s.currentPageId);
    // 未变化则跳过，避免无意义的 set 引发重渲染
    if (curPage && pageFieldsShallowEqual(curPage.data, data)) return;
    set((state) => ({
      pages: state.pages.map((p) => (p.id === state.currentPageId ? { ...p, data } : p)),
    }));
  },

  _applyPageFields: (data) => {
    const cur = get();
    const patch: Record<string, unknown> = {};
    const curRec = cur as unknown as Record<string, unknown>;
    const dataRec = data as Record<string, unknown>;
    for (const f of PAGE_FIELDS) {
      patch[f] = dataRec[f] !== undefined ? dataRec[f] : curRec[f];
    }
    patch.selectedElementId = null;
    set(patch as Partial<StudioState>);
    // 读页后：图片/素材元素按 imageUrl 重测宽高比例（避免比例错乱）
    requestAnimationFrame(() => {
      for (const el of get().floatingElements) {
        if ((el.type === 'image' || el.type === 'asset') && el.imageUrl) {
          get().ensureImageAspectRatio(el.id);
        }
      }
    });
  },

  _applyPageWithFallback: (id) => {
    const st = get();
    const target = st.pages.find((p) => p.id === id);
    if (!target) return;
    // 存量页迁移兜底：修复前创建的页没有配色上下文（extractedColors=null 且
    // paletteCandidates 为空），导致配色面板空白、新增元素退化为兜底色。
    // 切入这类页时自动跟随来源页的配色方案（四件套），背景/内容保持该页原样。
    const noPalette =
      !target.data.extractedColors && target.data.paletteCandidates.length === 0;
    const hasSourcePalette = !!st.extractedColors || st.paletteCandidates.length > 0;
    if (noPalette && hasSourcePalette) {
      const merged: StudioPageFields = {
        ...target.data,
        extractedColors: st.extractedColors,
        paletteCandidates: st.paletteCandidates,
        selectedCandidateId: st.selectedCandidateId,
        selectedStyleId: st.selectedStyleId,
      };
      set((state) => ({
        pages: state.pages.map((p) => (p.id === id ? { ...p, data: merged } : p)),
      }));
      get()._applyPageFields(merged);
      return;
    }
    get()._applyPageFields(target.data);
  },

  switchPage: (id) => {
    const s = get();
    if (id === s.currentPageId || !s.pages.some((p) => p.id === id)) return;
    // 1) 当前镜像写回当前页  2) 目标页字段应用到镜像
    s.captureCurrentPage();
    const target = get().pages.find((p) => p.id === id);
    if (!target) return;
    set({ currentPageId: id });
    get()._applyPageWithFallback(id);
  },

  addPage: () => {
    get().captureCurrentPage();
    const pages = get().pages;
    const curPage = pages.find((p) => p.id === get().currentPageId);
    const base = curPage?.data;
    // 新页：沿用当前页的画布尺寸/背景/字体/**配色方案**，内容清空（PPT 式"新建幻灯片"）
    // 配色方案（extractedColors/paletteCandidates/选中项）必须继承：否则新页上
    // 新增的元素会退化为"背景亮度估算"的兜底色，且配色 UI 不显示 → "配色不生效"
    const data: StudioPageFields = {
      templateId: base?.templateId ?? 'showcase',
      aspectRatio: base?.aspectRatio ?? '3:4',
      customWidth: base?.customWidth ?? 1080,
      customHeight: base?.customHeight ?? 1440,
      bgType: base?.bgType ?? 'gradient',
      bgColor: base?.bgColor ?? '#c9d1d9',
      gradientStart: base?.gradientStart ?? '#cbd5e1',
      gradientEnd: base?.gradientEnd ?? '#94a3b8',
      autoColorEnabled: base?.autoColorEnabled ?? true,
      extractedColors: base?.extractedColors ?? null,
      paletteCandidates: base?.paletteCandidates ?? [],
      selectedCandidateId: base?.selectedCandidateId ?? null,
      selectedStyleId: base?.selectedStyleId ?? 'balanced',
      images: [],
      imageAspectRatio: '4:5',
      imageScale: 1,
      showDeviceFrame: false,
      deviceType: 'none',
      title: '',
      subtitle: '',
      seriesNumber: '',
      fontFamily: base?.fontFamily ?? 'kuaile',
      accentColor: base?.accentColor ?? '#1a1a1a',
      highlights: [],
      floatingElements: [],
    };
    data.floatingElements = [makeBgElement(data)];
    const page: StudioPageData = {
      id: `page-${UID()}`,
      name: `第 ${pages.length + 1} 页`,
      data,
    };
    set((state) => {
      const idx = state.pages.findIndex((p) => p.id === state.currentPageId);
      const next = [...state.pages];
      next.splice(idx + 1, 0, page);
      return { pages: next, currentPageId: page.id };
    });
    get()._applyPageFields(page.data);
  },

  duplicatePage: (id) => {
    get().captureCurrentPage();
    const src = get().pages.find((p) => p.id === id);
    if (!src) return;
    const copy: StudioPageData = {
      id: `page-${UID()}`,
      name: `${src.name} 副本`,
      // 深拷贝：元素 id 跨页无需唯一，直接克隆即可
      data: JSON.parse(JSON.stringify(src.data)),
    };
    set((state) => {
      const idx = state.pages.findIndex((p) => p.id === id);
      const next = [...state.pages];
      next.splice(idx + 1, 0, copy);
      return { pages: next, currentPageId: copy.id };
    });
    get()._applyPageFields(copy.data);
  },

  deletePage: (id) => {
    const s = get();
    if (s.pages.length <= 1) return; // 至少保留一页
    const idx = s.pages.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const isActive = s.currentPageId === id;
    const nextActiveId = (s.pages[idx + 1] ?? s.pages[idx - 1]).id;
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== id),
      currentPageId: isActive ? nextActiveId : state.currentPageId,
    }));
    if (isActive) {
      get()._applyPageWithFallback(nextActiveId);
    }
  },

  movePage: (id, dir) => {
    get().captureCurrentPage();
    set((state) => {
      const idx = state.pages.findIndex((p) => p.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= state.pages.length) return state;
      const next = [...state.pages];
      const [item] = next.splice(idx, 1);
      next.splice(to, 0, item);
      return { pages: next };
    });
  },

  renamePage: (id, name) =>
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    })),

  // ========== 存档 / 读档 ==========
  exportConfig: () => {
    // 先把当前镜像写回当前页，保证导出包含最新编辑
    get().captureCurrentPage();
    const s = get();
    return {
      __type: 'redcanvas-studio-project' as const,
      version: 2 as const,
      exportedAt: new Date().toISOString(),
      currentPageId: s.currentPageId,
      pages: s.pages,
    };
  },

  importConfig: (snapshot: unknown) => {
    if (!snapshot || typeof snapshot !== 'object') return false;
    const s = snapshot as Record<string, unknown>;
    const cur = get();

    // —— v2：多页项目 ——
    if (s.__type === 'redcanvas-studio-project') {
      if (typeof s.version !== 'number') return false;
      const rawPages = Array.isArray(s.pages) ? s.pages : [];
      if (rawPages.length === 0) return false;
      const fallback = pickPageFields(cur);
      const pages: StudioPageData[] = rawPages.map((rp, i) => {
        const rec = (rp && typeof rp === 'object' ? rp : {}) as Record<string, unknown>;
        const id = typeof rec.id === 'string' && rec.id ? rec.id : `page-${UID()}`;
        const name = typeof rec.name === 'string' && rec.name ? rec.name : `第 ${i + 1} 页`;
        const data = sanitizePageData(rec.data, fallback);
        data.floatingElements = withPageBackground(data);
        return { id, name, data };
      });
      const currentPageId = pages.some((p) => p.id === s.currentPageId)
        ? (s.currentPageId as string)
        : pages[0].id;
      set({ pages, currentPageId });
      const active = pages.find((p) => p.id === currentPageId)!;
      get()._applyPageFields(active.data);
      return true;
    }

    // —— v1：旧版单页格式（向后兼容旧 ZIP / JSON / IndexedDB） ——
    if (s.__type !== 'redcanvas-studio-config') return false;
    if (typeof s.version !== 'number') return false;
    const fallback = pickPageFields(cur);
    const data = sanitizePageData(s, fallback);
    data.floatingElements = withPageBackground(data);
    const page: StudioPageData = { id: `page-${UID()}`, name: '第 1 页', data };
    set({ pages: [page], currentPageId: page.id });
    get()._applyPageFields(data);
    return true;
  },
}));

// DEBUG: 临时暴露 store 到 window 用于浏览器诊断
if (typeof window !== 'undefined') {
  (window as unknown as { __store: typeof useStudioStore }).__store = useStudioStore;
}

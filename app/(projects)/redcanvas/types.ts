export type TemplateId = 'classic' | 'minimal' | 'bold' | 'floating' | 'magazine' | 'mockup' | 'gradient';

export interface Highlight {
  id: string;
  text: string;
  color: string;
  style: 'underline' | 'text';
}

export type DeviceType = 'none' | 'browser' | 'device';

export type Orientation = 'portrait' | 'landscape';
export type ExportSize = '3:4' | '3:2' | '1:1' | '4:3' | '9:16' | '16:9' | 'custom';

export interface EditorState {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  imageAspectRatio: string; // e.g. "4:5"
  showDeviceFrame: boolean;
  deviceType: DeviceType;
  templateId: TemplateId;
  fontFamily: string;
  accentColor: string; // Global accent
  gradientStartColor: string; // Gradient start color
  gradientEndColor: string; // Gradient end color
  orientation: Orientation;
  exportSize: ExportSize;
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  previewColor: string;
}

export interface FontOption {
  id: string;
  name: string;
  className: string;
}

// ==================== Plog 排版工具扩展类型 ====================

export type AppMode = 'cover' | 'plog';

export type PlogScenario = 'product' | 'daily' | 'social';

export type PlogTemplateId =
  // Product Showcase
  | 'product-tutorial'
  | 'product-features'
  | 'product-comparison'
  // Daily Log
  | 'daily-polaroid'
  | 'daily-vlog'
  | 'daily-journal'
  // Social Media
  | 'social-collage'
  | 'social-quote'
  | 'social-card';

export interface PlogImage {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  aspectRatio?: number;
}

export type PlogElementType =
  // 画布底层
  | 'background'     // 背景层（整画布铺满，属性为背景色/渐变/模糊图）
  // 文字类（统一为文本框，渲染 Markdown 富文本；'longtext' 仅用于读档兼容旧快照）
  | 'text'
  | 'longtext'       // [已弃用] 旧快照兼容；新建元素统一用 'text'
  // 图片/素材类
  | 'image'          // 主图片/任意图片元素，可拖拽
  | 'asset'          // 图形素材（位图/矢量，来源可为 SVG/PNG 贴纸）
  // 装饰类（保留）
  | 'badge' | 'sticker' | 'annotation' | 'tag'
  // 时间戳：显示 年·月·日 + 星期，content 存日期串(YYYY-MM-DD，空=今天)
  | 'timestamp';

export interface PlogElement {
  id: string;
  type: PlogElementType;
  content: string;
  x: number; // percentage offset 0-100 or px
  y: number; // percentage offset 0-100 or px
  scale?: number;
  rotation?: number; // in degrees
  zIndex: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: number;
  badgeNumber?: string;

  // ---- 通用尺寸（百分比 0-100，相对容器；undefined = 按内容自适应） ----
  widthPct?: number;
  heightPct?: number;

  // ---- 图片 / asset / background（模糊图）共用 ----
  imageUrl?: string;                 // image/asset 的源 URL（优先级高于 content）
  borderRadius?: number;             // 圆角 px（图片/卡片等）
  shadowLevel?: 0 | 1 | 2 | 3 | 4;   // 预设阴影等级（0=无，越大越重）
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  borderWidth?: number;              // 边框 px（配合 borderColor）
  aspectRatio?: number;              // 原图自然宽高比（naturalWidth / naturalHeight）。有值时：宽高锁定比例，height=width/ratio

  // ---- 渐变（background 元素专用 / 卡片容器备用） ----
  gradientStart?: string;            // 渐变起始色（#RRGGBB）
  gradientEnd?: string;              // 渐变结束色（#RRGGBB）

  // ---- 文字 / longtext 共用 ----
  fontWeight?: 100 | 300 | 400 | 500 | 700 | 800 | 900;
  letterSpacing?: number;            // em，0 = 默认
  lineHeight?: number;               // 行高倍数，如 1.4
  textAlign?: 'left' | 'center' | 'right';

  // ---- longtext 专属 ----
  markdownEnabled?: boolean;         // 默认 true

  // ---- background 专属 ----
  bgVariant?: 'color' | 'gradient' | 'blur'; // 背景风格（纯色 / 环境渐变 / 图片高斯模糊）

  // ---- asset 专属 ----
  assetKind?: 'bitmap' | 'vector';

  // ---- annotation 专属 ----
  /** 气泡尾巴方向（指向被注释内容），默认 'bottom-left' */
  tailDirection?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

/** 预设阴影等级 → CSS box-shadow（与"默认好看"对齐） */
export const SHADOW_PRESETS: Record<number, string> = {
  0: 'none',
  1: '0 2px 6px -2px rgba(0,0,0,0.10), 0 1px 3px -1px rgba(0,0,0,0.06)',
  2: '0 8px 20px -8px rgba(0,0,0,0.18), 0 3px 8px -4px rgba(0,0,0,0.08)',
  3: '0 24px 60px -20px rgba(0,0,0,0.28), 0 10px 24px -10px rgba(0,0,0,0.12)',
  4: '0 40px 90px -30px rgba(0,0,0,0.38), 0 18px 40px -14px rgba(0,0,0,0.18)',
};

export interface ExtractedColors {
  dominant: string;
  secondary: string;
  accent: string;

  // 三级文字颜色，对比度逐级递减（均基于 WCAG 校验）
  textPrimary: string;   // 主标题，AA 级 ≥ 4.5:1
  textSecondary: string; // 副标题/正文，AA 级 ≥ 3:1（大文字）
  textMuted: string;     // 装饰小字/品牌标识，对比度 ≥ 1.5:1

  // 语义化色值 —— 由 dominant 派生，用于不同元素角色（避免 accent 滥用）
  primary: string;        // 主色实心填充（标签/贴纸背景）— dominant 派生，适合小面积实心
  emphasis: string;       // 长文字加粗关键词色 — dominant 派生，保证在背景上可读
  primaryMuted: string;   // 主色弱化（引用边框/分隔线/弱装饰）— primary 与背景混合

  // 徽章专用：永远深色背景 + 永远浅色文字（保
  // 证浅画布上也有强对比胶囊）
  badgeBg: string;
  badgeText: string;

  // 卡片与边框色（基于背景的和谐色差）
  cardBg: string;
  cardBorder: string;

  gradientStart: string;
  gradientEnd: string;
  isDark: boolean;

  // 向后兼容旧字段
  text: string;
}

export interface PlogState {
  mode: AppMode;
  plogScenario: PlogScenario;
  plogTemplateId: PlogTemplateId;
  aspectRatio: ExportSize;
  customWidth: number;
  customHeight: number;

  // Background
  bgType: 'color' | 'gradient' | 'blur';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  autoColorEnabled: boolean;

  // Images
  images: PlogImage[];

  // Elements
  elements: PlogElement[];
  selectedElementId: string | null;

  // Global typography
  fontFamily: string;
  titleText: string;
  subtitleText: string;

  // Cover editor state integration
  coverState: EditorState;
}


import { TemplateConfig, FontOption } from './types';

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'classic',
    name: '经典爆款',
    description: '文字错落有致，适合干货分享',
    previewColor: '#ff2442'
  },
  {
    id: 'magazine',
    name: '时尚杂志',
    description: '高级排版，艺术气息浓厚',
    previewColor: '#000000'
  },
  {
    id: 'minimal',
    name: '呼吸极简',
    description: '极大的留白，突出核心意境',
    previewColor: '#a1a1aa'
  },
  {
    id: 'bold',
    name: '视觉冲击',
    description: '满屏大字，观点性极强',
    previewColor: '#3b82f6'
  },
  {
    id: 'floating',
    name: '现代重叠',
    description: '层级感分明，拒绝单调',
    previewColor: '#8b5cf6'
  },
  {
    id: 'mockup',
    name: '电脑场景',
    description: '真实电脑场景，增强代入感',
    previewColor: '#6b7280'
  },
  {
    id: 'gradient',
    name: '渐变背景',
    description: '渐变背景，增加视觉深度',
    previewColor: '#000000'
  },
];

export const PRESET_COLORS = [
  '#ff2442', // XHS Red
  '#ffd93d', // Yellow
  '#6bcbff', // Light Blue
  '#ff601a', // Light Green
  '#ff87b2', // Pink
  '#ffffff', // White
  '#000000', // Black
];

export const FONTS: FontOption[] = [
  { id: 'xiaolai', name: '小赖字体', className: 'font-xiaolai' },
  { id: 'xiaowei', name: 'ZCOOL 小薇', className: 'font-xiaowei' },
  { id: 'serif', name: '优雅宋', className: 'font-serif-sc font-black' },
  { id: 'wenkai', name: '霞鹜文楷', className: 'font-wenkai' },
  { id: 'kuaile', name: '快乐体', className: 'font-kuaile' },
  { id: 'yozai', name: '悠哉体', className: 'font-yozai' },
  { id: 'longcang', name: '龙仓', className: 'font-longcang' },
  { id: 'mashan', name: '书法行草', className: 'font-mashan' },
  { id: 'zhimang', name: '随性手写', className: 'font-zhimang' },
  { id: 'noto', name: 'Noto Sans', className: 'font-noto' },
  { id: 'inter', name: 'Inter', className: 'font-inter' },
  { id: 'system', name: '系统默认', className: 'font-system' },
];

const SVG_35MM_GRAIN_URL = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.85 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`
);

export const TEXTURE_PRESETS: import('./types').TexturePreset[] = [
  {
    id: 'none',
    name: '无材质',
    category: 'grain',
    url: '',
    description: '纯净无噪点',
    defaultOpacity: 0,
    defaultBlendMode: 'normal',
  },
  {
    id: 'film-grain-pro',
    name: '35mm 银盐胶片',
    category: 'grain',
    url: SVG_35MM_GRAIN_URL,
    description: '双向银盐微粒，黑白与彩色文字均极致胶片质感',
    defaultOpacity: 0.7,
    defaultBlendMode: 'normal',
  },
  {
    id: 'retina-dust',
    name: '胶片颗粒',
    category: 'grain',
    url: '/redcanvas/textures/retina-dust.png',
    description: '细致微粒，经典复古胶片感',
    defaultOpacity: 0.65,
    defaultBlendMode: 'normal',
  },
  {
    id: 'stardust',
    name: '星尘微粒',
    category: 'grain',
    url: '/redcanvas/textures/stardust.png',
    description: '细腻星芒噪点，柔和温润',
    defaultOpacity: 0.6,
    defaultBlendMode: 'normal',
  },
  {
    id: 'dust',
    name: '复古微尘',
    category: 'grain',
    url: '/redcanvas/textures/dust.png',
    description: '斑驳颗粒与微尘胶片氛围',
    defaultOpacity: 0.5,
    defaultBlendMode: 'normal',
  },
  {
    id: 'subtle-surface',
    name: '极简暗纹',
    category: 'grain',
    url: '/redcanvas/textures/subtle-surface.png',
    description: '极轻微表面纹理，克制高级',
    defaultOpacity: 0.7,
    defaultBlendMode: 'normal',
  },
  {
    id: 'broken-noise',
    name: '斑驳噪波',
    category: 'noise',
    url: '/redcanvas/textures/broken-noise.png',
    description: '颗粒分明，质感浓厚',
    defaultOpacity: 0.45,
    defaultBlendMode: 'normal',
  },
  {
    id: 'diagonal-noise',
    name: '斜纹噪点',
    category: 'noise',
    url: '/redcanvas/textures/diagonal-noise.png',
    description: '动感斜向颗粒微光',
    defaultOpacity: 0.5,
    defaultBlendMode: 'normal',
  },
  {
    id: 'sandpaper',
    name: '磨砂砂质',
    category: 'noise',
    url: '/redcanvas/textures/sandpaper.png',
    description: '磨砂触感与粗糙颗粒',
    defaultOpacity: 0.5,
    defaultBlendMode: 'normal',
  },
  {
    id: 'paper-fibers',
    name: '纤维手工纸',
    category: 'paper',
    url: '/redcanvas/textures/paper-fibers.png',
    description: '天然纤维纹理，温润纸感',
    defaultOpacity: 0.6,
    defaultBlendMode: 'normal',
  },
  {
    id: 'clean-gray-paper',
    name: '素雅水彩纸',
    category: 'paper',
    url: '/redcanvas/textures/clean-gray-paper.png',
    description: '水彩画纸肌理，文艺柔和',
    defaultOpacity: 0.5,
    defaultBlendMode: 'normal',
  },
  {
    id: 'cardboard',
    name: '复古牛皮纸',
    category: 'paper',
    url: '/redcanvas/textures/cardboard.png',
    description: '厚重牛皮纸纹路，怀旧复古',
    defaultOpacity: 0.45,
    defaultBlendMode: 'normal',
  },
  {
    id: 'groovepaper',
    name: '暗纹凹凸纸',
    category: 'paper',
    url: '/redcanvas/textures/groovepaper.png',
    description: '压纹纸张质感，层次丰富',
    defaultOpacity: 0.55,
    defaultBlendMode: 'normal',
  },
  {
    id: 'black-linen',
    name: '亚麻织物',
    category: 'fabric',
    url: '/redcanvas/textures/black-linen.png',
    description: '编织布面纹理，手工质感',
    defaultOpacity: 0.4,
    defaultBlendMode: 'normal',
  },
];

// —— 材质遮罩默认参数（全平台通用标准值） ——
export const DEFAULT_TEXTURE_OPACITY = 0.6;
export const DEFAULT_TEXTURE_BLEND_MODE = 'normal' as const;
export const DEFAULT_TEXTURE_SIZE = 320;
export const DEFAULT_TEXTURE_TARGET = 'all' as const;

// —— 材质混合模式选项列表 ——
export interface TextureBlendModeOption {
  value: 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen';
  name: string;
  en: string;
  desc: string;
}

export const TEXTURE_BLEND_MODES: TextureBlendModeOption[] = [
  { value: 'normal', name: '正常', en: 'Normal', desc: '推荐 · 默认标准透明叠加' },
  { value: 'overlay', name: '叠加', en: 'Overlay', desc: '保持底层通透色彩' },
  { value: 'soft-light', name: '柔光', en: 'Soft Light', desc: '细腻温和' },
  { value: 'multiply', name: '正片叠底', en: 'Multiply', desc: '浓郁复古' },
  { value: 'screen', name: '滤色', en: 'Screen', desc: '提亮星芒' },
];

// —— 噪点大小快捷预设档位 ——
export const GRAIN_SIZE_PRESETS = [
  { label: '细腻', val: 140 },
  { label: '适中', val: 280 },
  { label: '明显', val: 450 },
  { label: '粗粝', val: 700 },
] as const;


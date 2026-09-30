
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

export const TEXTURE_PRESETS: import('./types').TexturePreset[] = [
  {
    id: 'none',
    name: '无材质',
    category: 'grain',
    url: '',
    description: '纯净无噪点',
    defaultOpacity: 0,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'retina-dust',
    name: '胶片颗粒',
    category: 'grain',
    url: '/redcanvas/textures/retina-dust.png',
    description: '细致微粒，经典复古胶片感',
    defaultOpacity: 0.65,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'stardust',
    name: '星尘微粒',
    category: 'grain',
    url: '/redcanvas/textures/stardust.png',
    description: '细腻星芒噪点，柔和温润',
    defaultOpacity: 0.6,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'dust',
    name: '复古微尘',
    category: 'grain',
    url: '/redcanvas/textures/dust.png',
    description: '斑驳颗粒与微尘胶片氛围',
    defaultOpacity: 0.5,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'subtle-surface',
    name: '极简暗纹',
    category: 'grain',
    url: '/redcanvas/textures/subtle-surface.png',
    description: '极轻微表面纹理，克制高级',
    defaultOpacity: 0.7,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'broken-noise',
    name: '斑驳噪波',
    category: 'noise',
    url: '/redcanvas/textures/broken-noise.png',
    description: '颗粒分明，质感浓厚',
    defaultOpacity: 0.45,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'diagonal-noise',
    name: '斜纹噪点',
    category: 'noise',
    url: '/redcanvas/textures/diagonal-noise.png',
    description: '动感斜向颗粒微光',
    defaultOpacity: 0.5,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'sandpaper',
    name: '磨砂砂质',
    category: 'noise',
    url: '/redcanvas/textures/sandpaper.png',
    description: '磨砂触感与粗糙颗粒',
    defaultOpacity: 0.5,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'paper-fibers',
    name: '纤维手工纸',
    category: 'paper',
    url: '/redcanvas/textures/paper-fibers.png',
    description: '天然纤维纹理，温润纸感',
    defaultOpacity: 0.6,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'clean-gray-paper',
    name: '素雅水彩纸',
    category: 'paper',
    url: '/redcanvas/textures/clean-gray-paper.png',
    description: '水彩画纸肌理，文艺柔和',
    defaultOpacity: 0.5,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'cardboard',
    name: '复古牛皮纸',
    category: 'paper',
    url: '/redcanvas/textures/cardboard.png',
    description: '厚重牛皮纸纹路，怀旧复古',
    defaultOpacity: 0.45,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'groovepaper',
    name: '暗纹凹凸纸',
    category: 'paper',
    url: '/redcanvas/textures/groovepaper.png',
    description: '压纹纸张质感，层次丰富',
    defaultOpacity: 0.55,
    defaultBlendMode: 'overlay',
  },
  {
    id: 'black-linen',
    name: '亚麻织物',
    category: 'fabric',
    url: '/redcanvas/textures/black-linen.png',
    description: '编织布面纹理，手工质感',
    defaultOpacity: 0.4,
    defaultBlendMode: 'overlay',
  },
];


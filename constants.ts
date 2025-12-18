
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
  }
];

export const PRESET_COLORS = [
  '#ff2442', // XHS Red
  '#ffd93d', // Yellow
  '#6bcbff', // Light Blue
  '#b4ff9f', // Light Green
  '#ff87b2', // Pink
  '#ffffff', // White
  '#000000', // Black
];

export const FONTS: FontOption[] = [
  { id: 'kuaile', name: '快乐体 (推荐)', className: 'font-kuaile' },
  { id: 'sans', name: '极黑体', className: 'font-sans font-black' },
  { id: 'serif', name: '优雅宋', className: 'font-serif-sc font-black' },
  { id: 'mashan', name: '书法行草', className: 'font-mashan' },
  { id: 'zhimang', name: '随性手写', className: 'font-zhimang' },
];

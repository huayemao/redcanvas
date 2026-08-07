import { create } from 'zustand';
import {
  AppMode,
  PlogScenario,
  PlogTemplateId,
  ExportSize,
  PlogImage,
  PlogElement,
  EditorState,
  ExtractedColors,
} from '../types';
import { extractDominantColors } from '../lib/colorExtractor';

const INITIAL_COVER_STATE: EditorState = {
  title: '我，花野猫\n喜欢写代码\n想开发小工具找我',
  highlights: [
    { id: '1', text: '花野猫', color: '#ff2442', style: 'underline' },
    { id: '2', text: '写代码', color: '#ff601a', style: 'text' },
    { id: '3', text: '开发小工具', color: '#6bcbff', style: 'underline' },
  ],
  seriesNumber: '#01',
  imageUrl: '/screenshot.png',
  imageAspectRatio: '4:5',
  showDeviceFrame: true,
  deviceType: 'browser',
  templateId: 'classic',
  fontFamily: 'kuaile',
  accentColor: '#ff2442',
  gradientStartColor: '#83b49f',
  gradientEndColor: '#37674f',
  orientation: 'portrait',
  exportSize: '3:4',
};

const DEFAULT_PLOG_IMAGES: PlogImage[] = [
  {
    id: 'img-1',
    url: '/screenshot.png',
    title: '功能操作截图',
    caption: '一键自动生成高颜值长图与海报',
  },
];

const DEFAULT_PLOG_ELEMENTS: PlogElement[] = [
  {
    id: 'el-1',
    type: 'badge',
    content: '01 步骤解析',
    x: 10,
    y: 12,
    zIndex: 10,
    color: '#ffffff',
    bgColor: '#ff2442',
    badgeNumber: '#1',
  },
  {
    id: 'el-2',
    type: 'annotation',
    content: '💡 重点提示：拖拽任意卡片进行自由排版',
    x: 10,
    y: 78,
    zIndex: 10,
    color: '#18181b',
    bgColor: 'rgba(255,255,255,0.92)',
    borderColor: '#ff2442',
  },
  {
    id: 'el-3',
    type: 'sticker',
    content: '✨ 核心亮点',
    x: 65,
    y: 8,
    zIndex: 10,
    color: '#ffffff',
    bgColor: '#ff601a',
  },
];

interface PlogStoreState {
  mode: AppMode;
  plogScenario: PlogScenario;
  plogTemplateId: PlogTemplateId;
  aspectRatio: ExportSize;
  customWidth: number;
  customHeight: number;

  bgType: 'color' | 'gradient' | 'blur';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  autoColorEnabled: boolean;
  extractedColors: ExtractedColors | null;

  images: PlogImage[];
  elements: PlogElement[];
  selectedElementId: string | null;

  fontFamily: string;
  titleText: string;
  subtitleText: string;

  coverState: EditorState;

  // Actions
  setMode: (mode: AppMode) => void;
  setPlogScenario: (scenario: PlogScenario) => void;
  setPlogTemplate: (templateId: PlogTemplateId) => void;
  setAspectRatio: (ratio: ExportSize) => void;
  setCustomSize: (w: number, h: number) => void;
  setBgType: (type: 'color' | 'gradient' | 'blur') => void;
  setBgColor: (color: string) => void;
  setGradient: (start: string, end: string) => void;
  setAutoColorEnabled: (enabled: boolean) => void;
  autoExtractColors: (imageSrc: string) => Promise<void>;

  setImages: (images: PlogImage[]) => void;
  addImage: (image: PlogImage) => void;
  updateImage: (id: string, partial: Partial<PlogImage>) => void;
  removeImage: (id: string) => void;

  setElements: (elements: PlogElement[]) => void;
  addElement: (element: PlogElement) => void;
  updateElement: (id: string, partial: Partial<PlogElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;

  setFontFamily: (font: string) => void;
  setTitleText: (text: string) => void;
  setSubtitleText: (text: string) => void;
  setCoverState: (updater: (prev: EditorState) => EditorState) => void;
}

export const usePlogStore = create<PlogStoreState>((set, get) => ({
  mode: 'cover',
  plogScenario: 'product',
  plogTemplateId: 'product-tutorial',
  aspectRatio: '3:4',
  customWidth: 1080,
  customHeight: 1440,

  bgType: 'gradient',
  bgColor: '#fcfcfc',
  gradientStart: '#83b49f',
  gradientEnd: '#37674f',
  autoColorEnabled: true,
  extractedColors: null,

  images: DEFAULT_PLOG_IMAGES,
  elements: DEFAULT_PLOG_ELEMENTS,
  selectedElementId: null,

  fontFamily: 'kuaile',
  titleText: 'Product Plog Showcase',
  subtitleText: '记录精彩瞬间，轻松打造专业排版图文',

  coverState: INITIAL_COVER_STATE,

  setMode: (mode) => set({ mode }),
  setPlogScenario: (plogScenario) => {
    let plogTemplateId: PlogTemplateId = 'product-tutorial';
    if (plogScenario === 'daily') plogTemplateId = 'daily-polaroid';
    if (plogScenario === 'social') plogTemplateId = 'social-collage';
    set({ plogScenario, plogTemplateId });
  },
  setPlogTemplate: (plogTemplateId) => set({ plogTemplateId }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setCustomSize: (customWidth, customHeight) => set({ customWidth, customHeight }),

  setBgType: (bgType) => set({ bgType }),
  setBgColor: (bgColor) => set({ bgColor }),
  setGradient: (gradientStart, gradientEnd) => set({ gradientStart, gradientEnd }),
  setAutoColorEnabled: (autoColorEnabled) => set({ autoColorEnabled }),

  autoExtractColors: async (imageSrc: string) => {
    const colors = await extractDominantColors(imageSrc);
    set({
      extractedColors: colors,
      gradientStart: colors.gradientStart,
      gradientEnd: colors.gradientEnd,
      bgColor: colors.dominant,
    });
  },

  setImages: (images) => {
    set({ images });
    if (images.length > 0 && get().autoColorEnabled) {
      get().autoExtractColors(images[0].url);
    }
  },
  addImage: (image) => {
    set((state) => ({ images: [...state.images, image] }));
    if (get().autoColorEnabled) {
      get().autoExtractColors(image.url);
    }
  },
  updateImage: (id, partial) =>
    set((state) => ({
      images: state.images.map((img) => (img.id === id ? { ...img, ...partial } : img)),
    })),
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),

  setElements: (elements) => set({ elements }),
  addElement: (element) => set((state) => ({ elements: [...state.elements, element] })),
  updateElement: (id, partial) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...partial } : el)),
    })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),
  setSelectedElementId: (selectedElementId) => set({ selectedElementId }),

  setFontFamily: (fontFamily) => set({ fontFamily }),
  setTitleText: (titleText) => set({ titleText }),
  setSubtitleText: (subtitleText) => set({ subtitleText }),

  setCoverState: (updater) =>
    set((state) => ({ coverState: updater(state.coverState) })),
}));

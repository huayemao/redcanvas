import { create } from 'zustand';
import * as pdfjsLib from 'pdfjs-dist';
import { THEMES, PAPER_PRESETS, PRESET_COLORS, DECORATIONS } from './constants';

interface PrettyScoreState {
  // 应用状态
  appState: 'idle' | 'editor';
  setAppState: (state: 'idle' | 'editor') => void;
  
  // 文件相关
  file: File | null;
  setFile: (file: File | null) => void;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  setPdfDoc: (pdfDoc: pdfjsLib.PDFDocumentProxy | null) => void;
  numPages: number;
  setNumPages: (numPages: number) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  
  // 背景相关
  bgType: 'preset' | 'custom' | 'theme';
  setBgType: (bgType: 'preset' | 'custom' | 'theme') => void;
  bgPresetUrl: string;
  setBgPresetUrl: (bgPresetUrl: string) => void;
  bgCustomUrl: string;
  setBgCustomUrl: (bgCustomUrl: string) => void;
  bgThemeId: string;
  setBgThemeId: (bgThemeId: string) => void;
  customBgColor: string;
  setCustomBgColor: (customBgColor: string) => void;
  
  // 样式相关
  scoreColor: string;
  setScoreColor: (scoreColor: string) => void;
  decoration: string;
  setDecoration: (decoration: string) => void;
  blendMode: string;
  setBlendMode: (blendMode: string) => void;
  vignette: number;
  setVignette: (vignette: number) => void;
  warmth: number;
  setWarmth: (warmth: number) => void;
  overlayOpacity: number;
  setOverlayOpacity: (overlayOpacity: number) => void;
  overlayDirection: 'solid' | 'top-bottom' | 'bottom-top' | 'radial';
  setOverlayDirection: (overlayDirection: 'solid' | 'top-bottom' | 'bottom-top' | 'radial') => void;
  overlayColor: string;
  setOverlayColor: (overlayColor: string) => void;
  
  // 尺寸相关
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
  canvasHeight: number;
  setCanvasHeight: (height: number) => void;
  
  // 其他状态
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (isControlsOpen: boolean) => void;
  
  // 动作
  applyTheme: (themeId: string) => void;
  handlePageChange: (delta: number) => void;
}

export const usePrettyScoreStore = create<PrettyScoreState>((set, get) => ({
  // 应用状态
  appState: 'idle',
  setAppState: (appState) => set({ appState }),
  
  // 文件相关
  file: null,
  setFile: (file) => set({ file }),
  pdfDoc: null,
  setPdfDoc: (pdfDoc) => set({ pdfDoc }),
  numPages: 0,
  setNumPages: (numPages) => set({ numPages }),
  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  // 背景相关
  bgType: 'theme',
  setBgType: (bgType) => set({ bgType }),
  bgPresetUrl: PAPER_PRESETS[0].url,
  setBgPresetUrl: (bgPresetUrl) => set({ bgPresetUrl }),
  bgCustomUrl: '',
  setBgCustomUrl: (bgCustomUrl) => set({ bgCustomUrl }),
  bgThemeId: THEMES[0].id,
  setBgThemeId: (bgThemeId) => set({ bgThemeId }),
  customBgColor: THEMES[0].bgColor,
  setCustomBgColor: (customBgColor) => set({ customBgColor }),
  
  // 样式相关
  scoreColor: PRESET_COLORS[0].hex,
  setScoreColor: (scoreColor) => set({ scoreColor }),
  decoration: DECORATIONS[1].id,
  setDecoration: (decoration) => set({ decoration }),
  blendMode: 'normal',
  setBlendMode: (blendMode) => set({ blendMode }),
  vignette: THEMES[0].vignette,
  setVignette: (vignette) => set({ vignette }),
  warmth: THEMES[0].warmth,
  setWarmth: (warmth) => set({ warmth }),
  overlayOpacity: 0,
  setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
  overlayDirection: 'solid',
  setOverlayDirection: (overlayDirection) => set({ overlayDirection }),
  overlayColor: '#ffffff',
  setOverlayColor: (overlayColor) => set({ overlayColor }),
  
  // 尺寸相关
  canvasWidth: 0,
  setCanvasWidth: (canvasWidth) => set({ canvasWidth }),
  canvasHeight: 0,
  setCanvasHeight: (canvasHeight) => set({ canvasHeight }),
  
  // 其他状态
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  isControlsOpen: true,
  setIsControlsOpen: (isControlsOpen) => set({ isControlsOpen }),
  
  // 动作
  applyTheme: (themeId) => {
    const theme = THEMES.find(t => t.id === themeId);
    const paperPreset = PAPER_PRESETS.find(p => p.id === themeId);
    
    if (theme) {
      set({
        bgType: 'theme',
        bgThemeId: theme.id,
        scoreColor: theme.inkColor,
        customBgColor: theme.bgColor,
        blendMode: theme.blendMode,
        vignette: theme.vignette,
        warmth: theme.warmth,
        decoration: 'classic-border'
      });
    } else if (paperPreset) {
      set({
        bgType: 'preset',
        bgPresetUrl: paperPreset.url,
        scoreColor: paperPreset.inkColor,
        customBgColor: paperPreset.bgColor,
        blendMode: paperPreset.blendMode,
        vignette: paperPreset.vignette,
        warmth: paperPreset.warmth,
        decoration: 'classic-border'
      });
    }
  },
  
  handlePageChange: (delta) => {
    const { currentPage, numPages, pdfDoc } = get();
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= numPages) {
      set({ currentPage: newPage });
    }
  }
}));

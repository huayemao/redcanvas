import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, FileAudio } from 'lucide-react';
import ControlsPanel from './ControlsPanel';

interface EditorProps {
  finalCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  numPages: number;
  currentPage: number;
  handlePageChange: (delta: number) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (open: boolean) => void;
  setAppState: (state: 'idle' | 'editor') => void;
  // ControlsPanel 所需的所有 props
  bgType: 'preset' | 'custom' | 'theme';
  bgPresetUrl: string;
  setBgPresetUrl: (url: string) => void;
  bgCustomUrl: string;
  setBgCustomUrl: (url: string) => void;
  bgThemeId: string;
  setBgThemeId: (id: string) => void;
  customBgColor: string;
  setCustomBgColor: (color: string) => void;
  scoreColor: string;
  setScoreColor: (color: string) => void;
  decoration: string;
  setDecoration: (decoration: string) => void;
  blendMode: string;
  setBlendMode: (mode: string) => void;
  vignette: number;
  setVignette: (value: number) => void;
  warmth: number;
  setWarmth: (value: number) => void;
  overlayOpacity: number;
  setOverlayOpacity: (value: number) => void;
  overlayDirection: 'solid' | 'top-bottom' | 'bottom-top' | 'radial';
  setOverlayDirection: (direction: 'solid' | 'top-bottom' | 'bottom-top' | 'radial') => void;
  overlayColor: string;
  setOverlayColor: (color: string) => void;
  exportImage: () => void;
  exportPdf: () => void;
  debouncedCustomBgColor: string;
  debouncedScoreColor: string;
  debouncedDecoration: string;
  debouncedBlendMode: string;
  debouncedVignette: number;
  debouncedWarmth: number;
  debouncedOverlayOpacity: number;
  debouncedOverlayDirection: 'solid' | 'top-bottom' | 'bottom-top' | 'radial';
  debouncedOverlayColor: string;
  handleCustomBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyTheme: (theme: any) => void;
}

export default function Editor({ 
  finalCanvasRef, 
  numPages, 
  currentPage, 
  handlePageChange, 
  isControlsOpen, 
  setIsControlsOpen, 
  setAppState,
  // ControlsPanel 所需的 props
  bgType,
  bgPresetUrl,
  setBgPresetUrl,
  bgCustomUrl,
  setBgCustomUrl,
  bgThemeId,
  setBgThemeId,
  customBgColor,
  setCustomBgColor,
  scoreColor,
  setScoreColor,
  decoration,
  setDecoration,
  blendMode,
  setBlendMode,
  vignette,
  setVignette,
  warmth,
  setWarmth,
  overlayOpacity,
  setOverlayOpacity,
  overlayDirection,
  setOverlayDirection,
  overlayColor,
  setOverlayColor,
  exportImage,
  exportPdf,
  debouncedCustomBgColor,
  debouncedScoreColor,
  debouncedDecoration,
  debouncedBlendMode,
  debouncedVignette,
  debouncedWarmth,
  debouncedOverlayOpacity,
  debouncedOverlayDirection,
  debouncedOverlayColor,
  handleCustomBgUpload,
  applyTheme
}: EditorProps) {
  return (
    <motion.div
      key="editor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="flex h-screen w-full relative z-10"
    >
      {/* Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center p-8 md:p-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="relative shadow-2xl shadow-[var(--color-ink)]/20 rounded-sm"
        >
          <canvas ref={finalCanvasRef} className="max-w-full max-h-[85vh] object-contain rounded-sm" />
        </motion.div>

        {/* Pagination Controls */}
        {numPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-4 bg-white/80 backdrop-blur-xl border border-[var(--color-ink)]/10 rounded-full shadow-lg"
          >
            <button onClick={() => handlePageChange(-1)} disabled={currentPage <= 1} className="opacity-50 hover:opacity-100 hover:text-[var(--color-accent)] disabled:opacity-20 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="serif text-sm tracking-widest font-medium">PAGE {currentPage} / {numPages}</span>
            <button onClick={() => handlePageChange(1)} disabled={currentPage >= numPages} className="opacity-50 hover:opacity-100 hover:text-[var(--color-accent)] disabled:opacity-20 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </motion.div>
        )}
      </div>

      {/* Floating Controls Panel */}
      <AnimatePresence>
        {isControlsOpen && (
          <ControlsPanel
            bgType={bgType}
            bgPresetUrl={bgPresetUrl}
            setBgPresetUrl={setBgPresetUrl}
            bgCustomUrl={bgCustomUrl}
            setBgCustomUrl={setBgCustomUrl}
            bgThemeId={bgThemeId}
            setBgThemeId={setBgThemeId}
            customBgColor={customBgColor}
            setCustomBgColor={setCustomBgColor}
            scoreColor={scoreColor}
            setScoreColor={setScoreColor}
            decoration={decoration}
            setDecoration={setDecoration}
            blendMode={blendMode}
            setBlendMode={setBlendMode}
            vignette={vignette}
            setVignette={setVignette}
            warmth={warmth}
            setWarmth={setWarmth}
            overlayOpacity={overlayOpacity}
            setOverlayOpacity={setOverlayOpacity}
            overlayDirection={overlayDirection}
            setOverlayDirection={setOverlayDirection}
            overlayColor={overlayColor}
            setOverlayColor={setOverlayColor}
            exportImage={exportImage}
            exportPdf={exportPdf}
            debouncedCustomBgColor={debouncedCustomBgColor}
            debouncedScoreColor={debouncedScoreColor}
            debouncedDecoration={debouncedDecoration}
            debouncedBlendMode={debouncedBlendMode}
            debouncedVignette={debouncedVignette}
            debouncedWarmth={debouncedWarmth}
            debouncedOverlayOpacity={debouncedOverlayOpacity}
            debouncedOverlayDirection={debouncedOverlayDirection}
            debouncedOverlayColor={debouncedOverlayColor}
            handleCustomBgUpload={handleCustomBgUpload}
            applyTheme={applyTheme}
            setAppState={setAppState}
            setIsControlsOpen={setIsControlsOpen}
          />
        )}
      </AnimatePresence>

      {/* Toggle Controls Button (when closed) */}
      <AnimatePresence>
        {!isControlsOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsControlsOpen(true)}
            className="absolute right-8 bottom-8 w-14 h-14 bg-[var(--color-ink)] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors z-20"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

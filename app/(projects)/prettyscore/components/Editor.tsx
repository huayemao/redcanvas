import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, FileAudio, Layers } from 'lucide-react';
import ControlsPanel from './ControlsPanel';
import { usePrettyScoreStore } from '../store';
import useDebounce from '../hooks/useDebounce';

interface EditorProps {
  finalCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  numPages: number;
  currentPage: number;
  handlePageChange: (delta: number) => void;
  exportImage: (exportAll?: boolean) => Promise<void>;
  exportPdf: (exportAll?: boolean) => Promise<void>;
  handleCustomBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOverviewMode: boolean;
  setIsOverviewMode: (isOverviewMode: boolean) => void;
  generateThumbnails: () => Promise<void>;
  pdfDoc: any;
}

export default function Editor({ 
  finalCanvasRef, 
  numPages, 
  currentPage, 
  handlePageChange, 
  exportImage, 
  exportPdf, 
  handleCustomBgUpload,
  isOverviewMode,
  setIsOverviewMode,
  generateThumbnails,
  pdfDoc
}: EditorProps) {
  const {
    isControlsOpen,
    setIsControlsOpen,
  } = usePrettyScoreStore();


  return (
    <motion.div
      key="editor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="flex h-screen w-full relative z-10"
    >
      {/* Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 md:p-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="relative shadow-2xl md:top-12 shadow-[var(--color-ink)]/20 rounded-sm"
        >
          <canvas ref={finalCanvasRef} className="max-w-full max-h-[85vh] object-contain rounded-sm" />
        </motion.div>

        {/* Preview Menu - Only show for PDF files */}
        {pdfDoc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute top-8 right-8 flex items-center gap-3"
          >
            <button
              onClick={async () => {
                await generateThumbnails();
                setIsOverviewMode(true);
              }}
              className="px-4 py-2 bg-[var(--color-ink)] text-white rounded-lg hover:bg-[var(--color-accent)] transition-colors shadow-lg shadow-[var(--color-ink)]/20 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> Preview
            </button>
          </motion.div>
        )}

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

      {/* Controls Panel - Desktop: Fixed Right Sidebar, Mobile: Floating */}
      <div className="hidden md:block">
        <ControlsPanel
          exportImage={exportImage}
          exportPdf={exportPdf}
          handleCustomBgUpload={handleCustomBgUpload}
          isOverviewMode={isOverviewMode}
          setIsOverviewMode={setIsOverviewMode}
          generateThumbnails={generateThumbnails}
        />
      </div>

      {/* Mobile Floating Controls Panel */}
      <AnimatePresence>
        {isControlsOpen && (
          <div className="md:hidden">
            <ControlsPanel
            exportImage={exportImage}
            exportPdf={exportPdf}
            handleCustomBgUpload={handleCustomBgUpload}
            isOverviewMode={isOverviewMode}
            setIsOverviewMode={setIsOverviewMode}
            generateThumbnails={generateThumbnails}
          />
          </div>
        )}
      </AnimatePresence>

      {/* Toggle Controls Button (only for mobile) */}
      <AnimatePresence>
        {!isControlsOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsControlsOpen(true)}
            className="absolute right-8 bottom-8 w-14 h-14 bg-[var(--color-ink)] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors z-20 md:hidden"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

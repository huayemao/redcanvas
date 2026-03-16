"use client";

import './index.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, SlidersHorizontal, X, FileAudio, Droplet, Sparkles, Sun, Music, Palette, Layers } from 'lucide-react';
import { loadPdf, renderPdfPageToCanvas, renderSvgToCanvas } from './utils/pdfHelper';
import { processScoreCanvas, hexToRgb } from './utils/imageHelper';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import useDebounce from './hooks/useDebounce';
import IntroScreen from './components/IntroScreen';
import Editor from './components/Editor';
import useCanvas from './components/Canvas';

const PAPER_PRESETS = [
  { id: 'masterpiece', name: 'Masterpiece', url: 'https://sns-img-hw.xhscdn.com/notes_pre_post/1040g3k831k48099c329g5p8vo3lp5gacaj8eh70?imageView2/2/w/0/format/jpg' },
  { id: 'antique', name: 'Antique', url: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&w=1600&q=80' },
  { id: 'crumpled', name: 'Crumpled', url: 'https://images.unsplash.com/photo-1621799754526-a0d52c49fad5?auto=format&fit=crop&w=1600&q=80' },
  { id: 'parchment', name: 'Parchment', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80' },
];

const PRESET_COLORS = [
  { id: 'charcoal', name: 'Charcoal', hex: '#1a1a1a' },
  { id: 'sepia', name: 'Sepia', hex: '#3e2a1e' },
  { id: 'navy', name: 'Faded Navy', hex: '#1c2836' },
  { id: 'crimson', name: 'Crimson', hex: '#4a1c1c' },
];

const THEMES = [
  {
    id: 'classic',
    name: 'Ivory Sonata',
    bgColor: '#F9F6F0',
    inkColor: '#2C302E',
    blendMode: 'color-burn',
    vignette: 0,
    warmth: 0,
    elements: 'none'
  },
  {
    id: 'sakura',
    name: 'Dusty Rose',
    bgColor: '#EADADA',
    inkColor: '#4A3B3C',
    blendMode: 'multiply',
    vignette: 0,
    warmth: 0,
    elements: 'sakura'
  },
  {
    id: 'midnight',
    name: 'Midnight Velvet',
    bgColor: '#1A1C23',
    inkColor: '#E8E9EB',
    blendMode: 'screen',
    vignette: 0.1,
    warmth: 0,
    elements: 'stars'
  },
  {
    id: 'matcha',
    name: 'Sage Whisper',
    bgColor: '#E3E7D3',
    inkColor: '#2D3A33',
    blendMode: 'multiply',
    vignette: 0,
    warmth: 0,
    elements: 'leaves'
  },
  {
    id: 'ocean',
    name: 'Abyssal Teal',
    bgColor: '#162C35',
    inkColor: '#D1E8E2',
    blendMode: 'screen',
    vignette: 0,
    warmth: 0,
    elements: 'bubbles'
  },
  {
    id: 'blueprint',
    name: 'Architect',
    bgColor: '#1C3F60',
    inkColor: '#F0F4F8',
    blendMode: 'screen',
    vignette: 0,
    warmth: 0,
    elements: 'none'
  },
  {
    id: 'monochrome',
    name: 'Noir',
    bgColor: '#FFFFFF',
    inkColor: '#111111',
    blendMode: 'multiply',
    vignette: 0,
    warmth: 0,
    elements: 'none'
  },
  {
    id: 'lavender',
    name: 'Amethyst',
    bgColor: '#2D1B36',
    inkColor: '#E6D5EE',
    blendMode: 'screen',
    vignette: 0,
    warmth: 0,
    elements: 'none'
  },
  {
    id: 'gold',
    name: 'Gilded Age',
    bgColor: '#1C1C1C',
    inkColor: '#D4AF37',
    blendMode: 'screen',
    vignette: 0.2,
    warmth: 0,
    elements: 'none'
  }
];

const DECORATIONS = [
  { id: 'none', name: 'None' },
  { id: 'classic-border', name: 'Classic Border' },
  { id: 'floral-corners', name: 'Floral Corners' },
  { id: 'vintage-frame', name: 'Vintage Frame' },
  { id: 'art-deco', name: 'Art Deco' },
  { id: 'minimalist-grid', name: 'Minimalist Grid' }
];



export default function App() {
  const [appState, setAppState] = useState<'idle' | 'editor'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [bgType, setBgType] = useState<'preset' | 'custom' | 'theme'>('theme');
  const [bgPresetUrl, setBgPresetUrl] = useState(PAPER_PRESETS[0].url);
  const [bgCustomUrl, setBgCustomUrl] = useState('');
  const [bgThemeId, setBgThemeId] = useState(THEMES[0].id);

  const [customBgColor, setCustomBgColor] = useState(THEMES[0].bgColor);
  const debouncedCustomBgColor = useDebounce(customBgColor, 150);

  const [scoreColor, setScoreColor] = useState(PRESET_COLORS[0].hex);
  const debouncedScoreColor = useDebounce(scoreColor, 150);

  const [decoration, setDecoration] = useState(DECORATIONS[1].id);
  const debouncedDecoration = useDebounce(decoration, 150);

  const [blendMode, setBlendMode] = useState('color-burn');
  const debouncedBlendMode = useDebounce(blendMode, 150);

  const [vignette, setVignette] = useState(0.6);
  const debouncedVignette = useDebounce(vignette, 150);

  const [warmth, setWarmth] = useState(0.2);
  const debouncedWarmth = useDebounce(warmth, 150);

  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const debouncedOverlayOpacity = useDebounce(overlayOpacity, 150);

  const [overlayDirection, setOverlayDirection] = useState<'solid' | 'top-bottom' | 'bottom-top' | 'radial'>('solid');
  const debouncedOverlayDirection = useDebounce(overlayDirection, 150);

  const [overlayColor, setOverlayColor] = useState('#ffffff');
  const debouncedOverlayColor = useDebounce(overlayColor, 150);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastProcessedColor = useRef<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setAppState('editor');

    try {
      if (selectedFile.type === 'application/pdf') {
        const pdf = await loadPdf(selectedFile);
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(pdf, 1);
      } else if (selectedFile.type === 'image/svg+xml') {
        setPdfDoc(null);
        setNumPages(1);
        setCurrentPage(1);
        const canvas = await renderSvgToCanvas(selectedFile, 3);
        rawCanvasRef.current = canvas;
        lastProcessedColor.current = null;
        processScore();
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load file. Please try another PDF or SVG.');
      setAppState('idle');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/svg+xml': ['.svg']
    },
    maxFiles: 1
  } as any);

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    setIsProcessing(true);
    try {
      const canvas = await renderPdfPageToCanvas(pdf, pageNum, 3);
      rawCanvasRef.current = canvas;
      lastProcessedColor.current = null;
      processScore();
    } catch (error) {
      console.error('Error rendering page:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyTheme = (theme: typeof THEMES[0]) => {
    setBgType('theme');
    setBgThemeId(theme.id);
    setScoreColor(theme.inkColor);
    setCustomBgColor(theme.bgColor);
    setBlendMode(theme.blendMode);
    setVignette(theme.vignette);
    setWarmth(theme.warmth);
    setDecoration('classic-border');
  };

  const {
    drawThemeElements,
    drawDecorations,
    processScore,
    drawFinal,
  } = useCanvas({
    rawCanvasRef,
    processScoreCanvas,
    hexToRgb,
    processedCanvasRef,
    finalCanvasRef,
    lastProcessedColor,
    bgType,
    bgPresetUrl,
    bgCustomUrl,
    bgThemeId,
    debouncedCustomBgColor,
    debouncedScoreColor,
    debouncedDecoration,
    debouncedBlendMode,
    debouncedVignette,
    debouncedWarmth,
    debouncedOverlayOpacity,
    debouncedOverlayDirection,
    debouncedOverlayColor,
  });


  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgCustomUrl(url);
      setBgType('custom');
    }
  };


  useEffect(() => {
    processScore();
  }, [processScore]);

  const handlePageChange = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= numPages && pdfDoc) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
    }
  };

  const exportImage = () => {
    if (!finalCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `symphonia-score-${currentPage}.png`;
    link.href = finalCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const exportPdf = () => {
    if (!finalCanvasRef.current) return;
    const canvas = finalCanvasRef.current;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save(`symphonia-score-${currentPage}.pdf`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative bg-[var(--color-bg)]">

      {/* Subtle Noise Overlay for Texture */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <AnimatePresence mode="wait">
        {appState === 'idle' && (
          <IntroScreen getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        )}

        {appState === 'editor' && (
          <Editor
            finalCanvasRef={finalCanvasRef}
            numPages={numPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            isControlsOpen={isControlsOpen}
            setIsControlsOpen={setIsControlsOpen}
            setAppState={setAppState}
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
          />
        )}
      </AnimatePresence>

      {/* Global Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-paper)]/80 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-[1px] border-[var(--color-ink)]/20 border-t-[var(--color-accent)] rounded-full mb-6"
            />
            <p className="serif text-xl tracking-widest italic">Crafting Manuscript...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


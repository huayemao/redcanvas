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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

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

  const drawThemeElements = (ctx: CanvasRenderingContext2D, width: number, height: number, elementsType: string) => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const getEdgePosition = (seedBase: number, w: number, h: number) => {
      const isEdgeX = seededRandom(seedBase) > 0.5;
      let x, y;
      if (isEdgeX) {
        const xSide = seededRandom(seedBase + 1) > 0.5 ? 0 : 0.85;
        x = (xSide + seededRandom(seedBase + 2) * 0.15) * w;
        y = seededRandom(seedBase + 3) * h;
      } else {
        const ySide = seededRandom(seedBase + 1) > 0.5 ? 0 : 0.85;
        y = (ySide + seededRandom(seedBase + 2) * 0.15) * h;
        x = seededRandom(seedBase + 3) * w;
      }
      return { x, y };
    };

    if (elementsType === 'sakura') {
      for (let i = 0; i < 40; i++) {
        const { x, y } = getEdgePosition(i * 10, width, height);
        const size = seededRandom(i * 10 + 4) * width * 0.015 + 8;
        const angle = seededRandom(i * 10 + 5) * Math.PI * 2;
        const opacity = seededRandom(i * 10 + 6) * 0.6 + 0.2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opacity;
        
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.bezierCurveTo(size * 0.8, size * 0.8, size, 0, 0, -size * 0.8);
        ctx.bezierCurveTo(-size, 0, -size * 0.8, size * 0.8, 0, size);
        ctx.fill();
        
        ctx.fillStyle = '#ec407a';
        ctx.globalAlpha = opacity * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.6);
        ctx.bezierCurveTo(size * 0.3, size * 0.4, size * 0.2, 0, 0, -size * 0.4);
        ctx.bezierCurveTo(-size * 0.2, 0, -size * 0.3, size * 0.4, 0, size * 0.6);
        ctx.fill();
        
        ctx.restore();
      }
    } else if (elementsType === 'stars') {
      for (let i = 0; i < 60; i++) {
        const { x, y } = getEdgePosition(i * 20, width, height);
        const size = seededRandom(i * 20 + 4) * width * 0.004 + 2;
        const isCyan = seededRandom(i * 20 + 5) > 0.7;
        const isPink = seededRandom(i * 20 + 6) > 0.8;
        
        ctx.fillStyle = isCyan ? '#84ffff' : (isPink ? '#ff80ab' : '#ffffff');
        ctx.globalAlpha = seededRandom(i * 20 + 7) * 0.7 + 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.quadraticCurveTo(0, 0, 0, size);
        ctx.quadraticCurveTo(0, 0, -size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -size);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (elementsType === 'leaves') {
      for (let i = 0; i < 35; i++) {
        const { x, y } = getEdgePosition(i * 30, width, height);
        const size = seededRandom(i * 30 + 4) * width * 0.015 + 10;
        const angle = seededRandom(i * 30 + 5) * Math.PI * 2;
        const opacity = seededRandom(i * 30 + 6) * 0.5 + 0.2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opacity;
        
        ctx.fillStyle = '#a5d6a7';
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size, 0, 0, size);
        ctx.quadraticCurveTo(-size, 0, 0, -size);
        ctx.fill();
        
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(0, size * 0.8);
        ctx.stroke();
        
        ctx.restore();
      }
    } else if (elementsType === 'bubbles') {
      for (let i = 0; i < 40; i++) {
        const { x, y } = getEdgePosition(i * 50, width, height);
        const size = seededRandom(i * 50 + 4) * width * 0.02 + 5;
        const opacity = seededRandom(i * 50 + 5) * 0.4 + 0.1;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = opacity;
        
        ctx.strokeStyle = '#80deea';
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
  };

  const drawDecorations = (ctx: CanvasRenderingContext2D, width: number, height: number, type: string, color: string, currentBlendMode: string) => {
    if (type === 'none') return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, width * 0.002);
    ctx.globalCompositeOperation = currentBlendMode as any;
    
    const margin = width * 0.04;
    
    if (type === 'classic-border') {
      ctx.lineWidth = Math.max(1, width * 0.0008);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
      ctx.lineWidth = Math.max(2, width * 0.002);
      const m2 = margin + width * 0.006;
      ctx.strokeRect(m2, m2, width - m2*2, height - m2*2);
    } else if (type === 'floral-corners') {
      const drawCorner = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        const scale = width * 0.0006;
        ctx.scale(scale, scale);

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(40, 0, 80, 40, 120, 120);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(0, 40, 40, 80, 120, 120);
        ctx.stroke();

        const drawLeaf = (lx: number, ly: number, rot: number, s: number) => {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(rot);
          ctx.scale(s, s);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(15, -15, 30, 0, 40, 20);
          ctx.bezierCurveTo(20, 30, 0, 15, 0, 0);
          ctx.fill();
          ctx.restore();
        };

        drawLeaf(40, 15, Math.PI/6, 1);
        drawLeaf(15, 40, Math.PI/3, 1);
        drawLeaf(80, 45, Math.PI/4, 0.8);
        drawLeaf(45, 80, Math.PI/2.5, 0.8);

        ctx.restore();
      };
      drawCorner(margin, margin, 0);
      drawCorner(width - margin, margin, Math.PI / 2);
      drawCorner(width - margin, height - margin, Math.PI);
      drawCorner(margin, height - margin, -Math.PI / 2);
      
      ctx.lineWidth = Math.max(1, width * 0.0005);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
    } else if (type === 'vintage-frame') {
      ctx.lineWidth = Math.max(1, width * 0.001);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
      
      const innerMargin = margin + width * 0.012;
      ctx.lineWidth = Math.max(2, width * 0.002);
      ctx.strokeRect(innerMargin, innerMargin, width - innerMargin*2, height - innerMargin*2);
      
      const drawOrnament = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        const r = width * 0.015;
        
        ctx.beginPath();
        ctx.arc(r, r, r, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(r*2.5, r, r*0.5, Math.PI*0.5, Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r, r*2.5, r*0.5, Math.PI*1.5, Math.PI*2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(r*1.2, r*1.2, r*0.3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      };
      
      drawOrnament(margin, margin, 0);
      drawOrnament(width - margin, margin, Math.PI / 2);
      drawOrnament(width - margin, height - margin, Math.PI);
      drawOrnament(margin, height - margin, -Math.PI / 2);
    } else if (type === 'art-deco') {
      const m1 = margin;
      const m2 = margin + width * 0.008;
      const m3 = margin + width * 0.016;
      
      ctx.lineWidth = Math.max(1, width * 0.001);
      ctx.strokeRect(m1, m1, width - m1*2, height - m1*2);
      ctx.lineWidth = Math.max(2, width * 0.002);
      ctx.strokeRect(m2, m2, width - m2*2, height - m2*2);
      ctx.lineWidth = Math.max(1, width * 0.001);
      ctx.strokeRect(m3, m3, width - m3*2, height - m3*2);
      
      const drawDecoCorner = (x: number, y: number, mx: number, my: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(mx, my);
        const s = width * 0.035;
        ctx.beginPath();
        ctx.moveTo(0, s);
        ctx.lineTo(s*0.3, s*0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s*0.6, s*0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      
      drawDecoCorner(m1, m1, 1, 1);
      drawDecoCorner(width - m1, m1, -1, 1);
      drawDecoCorner(width - m1, height - m1, -1, -1);
      drawDecoCorner(m1, height - m1, 1, -1);
    } else if (type === 'minimalist-grid') {
      ctx.lineWidth = Math.max(1, width * 0.0005);
      ctx.globalAlpha = 0.3;
      const gridSize = width * 0.05;
      
      for (let x = margin; x <= width - margin; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, height - margin);
        ctx.stroke();
      }
      for (let y = margin; y <= height - margin; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(2, width * 0.0015);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
    }
    
    ctx.restore();
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgCustomUrl(url);
      setBgType('custom');
    }
  };

  const drawFinal = useCallback(() => {
    const finalCanvas = finalCanvasRef.current;
    const processedCanvas = processedCanvasRef.current;
    if (!finalCanvas || !processedCanvas) return;

    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    finalCanvas.width = processedCanvas.width;
    finalCanvas.height = processedCanvas.height;

    const drawBackground = () => {
      return new Promise<void>((resolve) => {
        if (bgType === 'theme') {
          const theme = THEMES.find(t => t.id === bgThemeId);
          if (theme) {
            ctx.fillStyle = debouncedCustomBgColor;
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            drawThemeElements(ctx, finalCanvas.width, finalCanvas.height, theme.elements);
          }
          resolve();
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        let hasRetried = false;
        
        img.onload = () => {
          const scale = Math.max(finalCanvas.width / img.width, finalCanvas.height / img.height);
          const x = (finalCanvas.width / 2) - (img.width / 2) * scale;
          const y = (finalCanvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          resolve();
        };
        img.onerror = () => {
          if (!hasRetried && img.src === PAPER_PRESETS[0].url) {
            hasRetried = true;
            img.src = PAPER_PRESETS[1].url; // Fallback to Unsplash if custom CDN fails CORS
          } else {
            ctx.fillStyle = '#d4b58e';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            resolve();
          }
        };
        img.src = bgType === 'preset' ? bgPresetUrl : bgCustomUrl;
      });
    };

    drawBackground().then(() => {
      // 0. Image Overlay
      if (bgType !== 'theme' && debouncedOverlayOpacity > 0) {
        ctx.save();
        const w = finalCanvas.width;
        const h = finalCanvas.height;
        const r = parseInt(debouncedOverlayColor.slice(1,3), 16) || 255;
        const g = parseInt(debouncedOverlayColor.slice(3,5), 16) || 255;
        const b = parseInt(debouncedOverlayColor.slice(5,7), 16) || 255;
        const rgba = (alpha: number) => `rgba(${r},${g},${b},${alpha})`;
        
        if (debouncedOverlayDirection === 'solid') {
          ctx.fillStyle = rgba(debouncedOverlayOpacity);
        } else if (debouncedOverlayDirection === 'top-bottom') {
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, rgba(debouncedOverlayOpacity));
          grad.addColorStop(1, rgba(0));
          ctx.fillStyle = grad;
        } else if (debouncedOverlayDirection === 'bottom-top') {
          const grad = ctx.createLinearGradient(0, h, 0, 0);
          grad.addColorStop(0, rgba(debouncedOverlayOpacity));
          grad.addColorStop(1, rgba(0));
          ctx.fillStyle = grad;
        } else if (debouncedOverlayDirection === 'radial') {
          const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
          grad.addColorStop(0, rgba(0));
          grad.addColorStop(1, rgba(debouncedOverlayOpacity));
          ctx.fillStyle = grad;
        }
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 1. Warmth Tint
      if (debouncedWarmth > 0) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(210, 150, 80, ${debouncedWarmth})`;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      // 2. Score
      ctx.globalCompositeOperation = debouncedBlendMode as any;
      ctx.drawImage(processedCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      // 3. Decorations
      drawDecorations(ctx, finalCanvas.width, finalCanvas.height, debouncedDecoration, debouncedScoreColor, debouncedBlendMode);

      // 4. Heavy Burnt Vignette
      if (debouncedVignette > 0) {
        const cx = finalCanvas.width / 2;
        const cy = finalCanvas.height / 2;
        const radius = Math.max(cx, cy);
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.2);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.6, `rgba(70, 30, 10, ${debouncedVignette * 0.4})`);
        gradient.addColorStop(1, `rgba(30, 10, 0, ${debouncedVignette})`);
        
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  }, [bgType, bgPresetUrl, bgCustomUrl, bgThemeId, debouncedCustomBgColor, debouncedWarmth, debouncedBlendMode, debouncedVignette, debouncedDecoration, debouncedScoreColor, debouncedOverlayOpacity, debouncedOverlayDirection, debouncedOverlayColor]);

  const processScore = useCallback(() => {
    if (!rawCanvasRef.current) return;
    
    // Skip heavy pixel processing if color hasn't changed
    if (lastProcessedColor.current === debouncedScoreColor && processedCanvasRef.current) {
      drawFinal();
      return;
    }
    
    const rgb = hexToRgb(debouncedScoreColor);
    processedCanvasRef.current = processScoreCanvas(rawCanvasRef.current, rgb);
    lastProcessedColor.current = debouncedScoreColor;
    drawFinal();
  }, [debouncedScoreColor, drawFinal]);

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
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            {/* Musical Staves Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <pattern id="staves" width="200" height="120" patternUnits="userSpaceOnUse">
                  <path d="M0,20 H200 M0,30 H200 M0,40 H200 M0,50 H200 M0,60 H200" stroke="var(--color-ink)" strokeWidth="1" fill="none" />
                  <path d="M10,20 V60 M190,20 V60" stroke="var(--color-ink)" strokeWidth="2" fill="none" />
                  <path d="M25,50 C25,65 40,65 40,50 C40,35 25,35 25,20 C25,5 40,5 40,20 C40,45 20,45 20,70 C20,80 30,80 30,70" stroke="var(--color-ink)" strokeWidth="1.5" fill="none" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#staves)" />
              </svg>
            </div>

            <div className="text-center mb-12 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center shadow-2xl shadow-[var(--color-ink)]/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
                <Music className="w-10 h-10 relative z-10" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                className="serif text-6xl md:text-8xl font-medium tracking-tight mb-6 text-[var(--color-ink)]"
              >
                Symphonia
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-sm md:text-lg tracking-wide opacity-70 font-medium max-w-xl mx-auto leading-relaxed"
              >
                Elevate your digital sheet music. Transform standard PDFs and SVGs into breathtaking historical manuscripts with authentic paper textures, custom ink, and elegant motifs.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="w-full max-w-2xl px-6 relative z-10"
            >
              <div
                {...getRootProps()}
                className={`relative overflow-hidden group border border-[var(--color-ink)]/20 bg-white/60 backdrop-blur-xl rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 shadow-xl shadow-[var(--color-ink)]/5 ${isDragActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.02]' : 'hover:border-[var(--color-ink)]/40 hover:bg-white/90 hover:shadow-2xl hover:shadow-[var(--color-ink)]/10'}`}
              >
                <input {...getInputProps()} />
                
                {/* Corner Accents */}
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />

                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-ink)]/5 flex items-center justify-center group-hover:bg-[var(--color-accent)]/10 transition-colors duration-500">
                  <Upload className="w-8 h-8 opacity-60 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all duration-500 group-hover:-translate-y-1" />
                </div>
                <p className="serif text-3xl mb-4 text-[var(--color-ink)] font-medium">Upload your score</p>
                <p className="text-xs tracking-[0.2em] opacity-50 uppercase font-semibold">Supports PDF & SVG formats</p>
              </div>
            </motion.div>
            
            {/* Features list */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 flex gap-12 text-center opacity-60 relative z-10"
            >
               <div className="flex flex-col items-center gap-2">
                 <ImageIcon className="w-5 h-5" />
                 <span className="text-xs uppercase tracking-widest font-medium">Procedural Paper</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Droplet className="w-5 h-5" />
                 <span className="text-xs uppercase tracking-widest font-medium">Custom Ink</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Sparkles className="w-5 h-5" />
                 <span className="text-xs uppercase tracking-widest font-medium">Vintage Motifs</span>
               </div>
            </motion.div>
          </motion.div>
        )}

        {appState === 'editor' && (
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
                <motion.aside
                  initial={{ opacity: 0, x: 400 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 400 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute right-6 top-6 bottom-6 w-80 bg-white/80 backdrop-blur-2xl border border-[var(--color-ink)]/10 rounded-3xl shadow-2xl shadow-[var(--color-ink)]/10 flex flex-col z-30 overflow-hidden"
                >
                  <div className="p-6 border-b border-[var(--color-ink)]/5 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center">
                        <FileAudio className="w-4 h-4" />
                      </div>
                      <h2 className="serif text-xl font-medium">Symphonia</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAppState('idle')} className="text-[10px] tracking-widest uppercase opacity-50 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors font-medium">New</button>
                      <span className="w-[1px] h-3 bg-[var(--color-ink)]/20" />
                      <button onClick={() => setIsControlsOpen(false)} className="p-1 opacity-50 hover:opacity-100 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Color Themes Section */}
                    <section className="bg-[var(--color-ink)]/5 rounded-2xl p-5 border border-[var(--color-ink)]/5">
                      <div className="flex items-center gap-2 mb-4 opacity-80">
                        <Palette className="w-4 h-4" />
                        <h3 className="serif text-lg italic">Color Themes</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => applyTheme(theme)}
                            className={`relative p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${bgType === 'theme' && bgThemeId === theme.id ? 'border-[var(--color-accent)] shadow-md scale-105' : 'border-transparent hover:border-[var(--color-ink)]/20'}`}
                            style={{ backgroundColor: theme.bgColor }}
                          >
                            <div className="w-6 h-6 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.inkColor }} />
                            <span className="serif text-xs font-medium" style={{ color: theme.inkColor }}>{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Paper Section */}
                    <section className="bg-[var(--color-ink)]/5 rounded-2xl p-5 border border-[var(--color-ink)]/5">
                      <div className="flex items-center gap-2 mb-4 opacity-80">
                        <ImageIcon className="w-4 h-4" />
                        <h3 className="serif text-lg italic">Paper Texture</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {PAPER_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => { setBgType('preset'); setBgPresetUrl(preset.url); }}
                            className={`relative aspect-[4/3] overflow-hidden rounded-xl group border-2 transition-all duration-300 ${bgPresetUrl === preset.url && bgType === 'preset' ? 'border-[var(--color-accent)] shadow-md' : 'border-transparent hover:border-[var(--color-ink)]/20'}`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-3">
                              <span className="serif text-xs text-white tracking-wide">{preset.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label className="block w-full border border-dashed border-[var(--color-ink)]/20 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 text-center py-3 rounded-xl cursor-pointer text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 opacity-70 hover:opacity-100">
                          Upload Custom
                          <input type="file" accept="image/*" className="hidden" onChange={handleCustomBgUpload} />
                        </label>
                      </div>
                    </section>

                    {bgType !== 'theme' && (
                      <section className="bg-[var(--color-ink)]/5 rounded-2xl p-5 border border-[var(--color-ink)]/5">
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                          <Layers className="w-4 h-4" />
                          <h3 className="serif text-lg italic">Image Overlay</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                              Overlay Color
                            </label>
                            <input 
                              type="color" 
                              value={overlayColor} 
                              onChange={(e) => setOverlayColor(e.target.value)}
                              className="w-8 h-8 rounded-full cursor-pointer shadow-sm border border-[var(--color-ink)]/10"
                            />
                          </div>
                          
                          <div>
                            <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                              Opacity <span>{Math.round(overlayOpacity * 100)}%</span>
                            </label>
                            <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-[var(--color-ink)]/20 rounded-lg appearance-none cursor-pointer" />
                          </div>

                          <div>
                            <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                              Direction
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {['solid', 'top-bottom', 'bottom-top', 'radial'].map(dir => (
                                <button
                                  key={dir}
                                  onClick={() => setOverlayDirection(dir as any)}
                                  className={`py-1.5 text-[10px] tracking-wider uppercase font-medium transition-all rounded-md ${overlayDirection === dir ? 'bg-white shadow-sm text-[var(--color-ink)]' : 'bg-[var(--color-ink)]/5 opacity-50 hover:opacity-100'}`}
                                >
                                  {dir.replace('-', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Ink Section */}
                    <section className="bg-[var(--color-ink)]/5 rounded-2xl p-5 border border-[var(--color-ink)]/5">
                      <div className="flex items-center gap-2 mb-4 opacity-80">
                        <Droplet className="w-4 h-4" />
                        <h3 className="serif text-lg italic">Ink & Color</h3>
                      </div>
                      
                      <div className="space-y-4 mb-5">
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                            Ink Color
                          </label>
                          <div className="flex items-center gap-3">
                            {PRESET_COLORS.map((ink) => (
                              <button
                                key={ink.id}
                                onClick={() => setScoreColor(ink.hex)}
                                className={`w-8 h-8 rounded-full border border-[var(--color-ink)]/10 relative flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${scoreColor === ink.hex ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-paper)]' : ''}`}
                                style={{ backgroundColor: ink.hex }}
                                title={ink.name}
                              />
                            ))}
                            <div className="w-[1px] h-6 bg-[var(--color-ink)]/20 mx-1" />
                            <div className="relative group">
                              <input 
                                type="color" 
                                value={scoreColor} 
                                onChange={(e) => setScoreColor(e.target.value)}
                                className="w-8 h-8 rounded-full cursor-pointer shadow-sm border border-[var(--color-ink)]/10"
                                title="Custom Ink Color"
                              />
                            </div>
                          </div>
                        </div>

                        {bgType === 'theme' && (
                          <div>
                            <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                              Background Color
                            </label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={customBgColor} 
                                onChange={(e) => setCustomBgColor(e.target.value)}
                                className="w-8 h-8 rounded-full cursor-pointer shadow-sm border border-[var(--color-ink)]/10"
                                title="Custom Background Color"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                          Blend Mode
                        </label>
                        <div className="flex bg-[var(--color-ink)]/5 rounded-lg p-1">
                          {['source-over', 'multiply', 'color-burn'].map(mode => (
                            <button
                              key={mode}
                              onClick={() => setBlendMode(mode)}
                              className={`flex-1 py-1.5 text-[10px] tracking-wider uppercase font-medium transition-all rounded-md ${blendMode === mode ? 'bg-white shadow-sm text-[var(--color-ink)]' : 'opacity-50 hover:opacity-100'}`}
                            >
                              {mode.replace('source-over', 'Normal').replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Decorations Section */}
                    <section className="bg-[var(--color-ink)]/5 rounded-2xl p-5 border border-[var(--color-ink)]/5">
                      <div className="flex items-center gap-2 mb-4 opacity-80">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="serif text-lg italic">Motifs</h3>
                      </div>
                      <div className="space-y-2">
                        {DECORATIONS.map((dec) => (
                          <button
                            key={dec.id}
                            onClick={() => setDecoration(dec.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${decoration === dec.id ? 'bg-white shadow-sm text-[var(--color-ink)] border border-[var(--color-ink)]/10' : 'text-[var(--color-ink)]/60 hover:bg-white/50'}`}
                          >
                            {dec.name}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Atmosphere Section */}
                    <section className="bg-[var(--color-ink)]/5 rounded-2xl p-5 border border-[var(--color-ink)]/5">
                      <div className="flex items-center gap-2 mb-4 opacity-80">
                        <Sun className="w-4 h-4" />
                        <h3 className="serif text-lg italic">Atmosphere</h3>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                            Vignette
                            <span>{Math.round(vignette * 100)}%</span>
                          </label>
                          <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={vignette}
                            onChange={e => setVignette(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase font-medium flex justify-between mb-2 opacity-60">
                            Warmth
                            <span>{Math.round(warmth * 100)}%</span>
                          </label>
                          <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={warmth}
                            onChange={e => setWarmth(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="p-6 border-t border-[var(--color-ink)]/5 bg-white/80 space-y-3">
                    <button onClick={exportImage} className="w-full py-3 bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] transition-colors duration-300 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium shadow-lg shadow-[var(--color-ink)]/10">
                      <ImageIcon className="w-4 h-4" /> Export Image
                    </button>
                    <button onClick={exportPdf} className="w-full py-3 border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] transition-colors duration-300 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium">
                      <Download className="w-4 h-4" /> Export PDF
                    </button>
                  </div>
                </motion.aside>
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


"use client";

import './index.css';
import React, { useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { loadPdf, renderPdfPageToCanvas, renderSvgToCanvas } from './utils/pdfHelper';
import { processScoreCanvas, hexToRgb } from './utils/imageHelper';
import { jsPDF } from 'jspdf';
// pdfjsLib is imported in pdfHelper.ts and only available in browser environment
import useDebounce from './hooks/useDebounce';
import IntroScreen from './components/IntroScreen';
import Editor from './components/Editor';
import useCanvas from './components/Canvas';
import ScoreOverview from './components/ScoreOverview';
import { usePrettyScoreStore } from './store';
import { Music } from 'lucide-react';



export default function App() {
  const {
    appState,
    setAppState,
    setFile,
    pdfDoc,
    setPdfDoc,
    numPages,
    setNumPages,
    currentPage,
    setCurrentPage,
    setBgType,
    setBgCustomUrl,
    customBgColor,
    scoreColor,
    decoration,
    blendMode,
    vignette,
    warmth,
    overlayOpacity,
    overlayDirection,
    overlayColor,
    isProcessing,
    setIsProcessing,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    isOverviewMode,
    setIsOverviewMode,
  } = usePrettyScoreStore();

  const debouncedCustomBgColor = useDebounce(customBgColor, 150);
  const debouncedScoreColor = useDebounce(scoreColor, 150);
  const debouncedDecoration = useDebounce(decoration, 150);
  const debouncedBlendMode = useDebounce(blendMode, 150);
  const debouncedVignette = useDebounce(vignette, 150);
  const debouncedWarmth = useDebounce(warmth, 150);
  const debouncedOverlayOpacity = useDebounce(overlayOpacity, 150);
  const debouncedOverlayDirection = useDebounce(overlayDirection, 150);
  const debouncedOverlayColor = useDebounce(overlayColor, 150);
  const debouncedCanvasWidth = useDebounce(canvasWidth, 150);
  const debouncedCanvasHeight = useDebounce(canvasHeight, 150);

  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastProcessedColor = useRef<string | null>(null);
  const pageThumbnails = useRef<{[key: number]: HTMLCanvasElement}>({});

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

  const useSampleFile = useCallback(async (filePath: string, isPdf: boolean) => {
    setIsProcessing(true);
    setAppState('editor');

    try {
      const response = await fetch(filePath);
      const blob = await response.blob();
      const file = new File([blob], isPdf ? 'score_sample.pdf' : 'score_sample.svg', { type: isPdf ? 'application/pdf' : 'image/svg+xml' });
      setFile(file);

      if (isPdf) {
        const pdf = await loadPdf(file);
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(pdf, 1);
      } else {
        setPdfDoc(null);
        setNumPages(1);
        setCurrentPage(1);
        const canvas = await renderSvgToCanvas(file, 3);
        rawCanvasRef.current = canvas;
        lastProcessedColor.current = null;
        processScore();
      }
    } catch (error) {
      console.error('Error loading sample file:', error);
      alert('Failed to load sample file. Please try again.');
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

  const renderPage = async (pdf: any, pageNum: number) => {
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




  const {
    drawThemeElements,
    drawDecorations,
    processScore,
    drawFinal,
    generateThumbnails: generateThumbnailsFromCanvas,
  } = useCanvas({
    rawCanvasRef,
    processScoreCanvas,
    hexToRgb,
    processedCanvasRef,
    finalCanvasRef,
    lastProcessedColor,
    debouncedCustomBgColor,
    debouncedScoreColor,
    debouncedDecoration,
    debouncedBlendMode,
    debouncedVignette,
    debouncedWarmth,
    debouncedOverlayOpacity,
    debouncedOverlayDirection,
    debouncedOverlayColor,
    canvasWidth: debouncedCanvasWidth,
    canvasHeight: debouncedCanvasHeight,
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

  useEffect(() => {
    // Redraw canvas when returning from overview mode
    if (!isOverviewMode && appState === 'editor') {
      processScore();
    }
  }, [isOverviewMode, appState, processScore]);

  const generateThumbnails = async () => {
    console.log(pdfDoc)
    if (!pdfDoc || numPages === 0) return;
    setIsProcessing(true);
    try {
      const thumbnails = await generateThumbnailsFromCanvas(pdfDoc, numPages, renderPdfPageToCanvas);
      // Update the pageThumbnails ref with the generated thumbnails
      if (thumbnails) {
        pageThumbnails.current = thumbnails;
      }
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= numPages && pdfDoc) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
    }
  };

  const exportImage = async (exportAll: boolean = false) => {
    if (!finalCanvasRef.current) return;
    
    if (!exportAll) {
      // 导出当前页
      const link = document.createElement('a');
      link.download = `prettyscore-score-${currentPage}.png`;
      link.href = finalCanvasRef.current.toDataURL('image/png');
      link.click();
    } else {
      // 导出所有页
      setIsProcessing(true);
      try {
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          // 切换到当前页并渲染
          await renderPage(pdfDoc, pageNum);
          
          // 等待渲染完成
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 导出当前页为图片
          if (finalCanvasRef.current) {
            const link = document.createElement('a');
            link.download = `prettyscore-score-${pageNum}.png`;
            link.href = finalCanvasRef.current.toDataURL('image/png');
            link.click();
            
            // 延迟以确保浏览器能处理多个下载
            if (pageNum < numPages) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        // 恢复到原始页面
        await renderPage(pdfDoc, currentPage);
      } catch (error) {
        console.error('Error exporting all images:', error);
        alert('Failed to export all images. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const exportPdf = async (exportAll: boolean = false) => {
    if (!finalCanvasRef.current) return;
    
    if (!exportAll) {
      // 单独导出当前页
      const canvas = finalCanvasRef.current;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`prettyscore-score-${currentPage}.pdf`);
    } else {
      // 合并导出所有页
      setIsProcessing(true);
      try {
        const canvas = finalCanvasRef.current;
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (pageNum > 1) {
            pdf.addPage();
          }
          
          // 切换到当前页并渲染
          await renderPage(pdfDoc, pageNum);
          
          // 等待渲染完成
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 添加当前页到PDF
          if (finalCanvasRef.current) {
            const imgData = finalCanvasRef.current.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
          }
        }
        
        // 恢复到原始页面
        await renderPage(pdfDoc, currentPage);
        
        pdf.save('prettyscore-score-all.pdf');
      } catch (error) {
        console.error('Error exporting all pages:', error);
        alert('Failed to export all pages. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative bg-[var(--color-bg)]">

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0  px-6 py-4   ">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center shadow-lg shadow-[var(--color-ink)]/20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
            <Music className="w-5 h-5 relative z-10" />
          </div>
          <span className="serif text-xl font-medium tracking-tight text-[var(--color-ink)]">prettyscore</span>
        </div>
      </nav>

      {/* Subtle Noise Overlay for Texture */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <AnimatePresence mode="wait">
        {appState === 'idle' && (
          <IntroScreen getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} useSampleFile={useSampleFile} />
        )}

        {appState === 'editor' && !isOverviewMode && (
          <Editor
            finalCanvasRef={finalCanvasRef}
            numPages={numPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            exportImage={exportImage}
            exportPdf={exportPdf}
            handleCustomBgUpload={handleCustomBgUpload}
            isOverviewMode={isOverviewMode}
            setIsOverviewMode={setIsOverviewMode}
            generateThumbnails={generateThumbnails}
            pdfDoc={pdfDoc}
          />
        )}

        <ScoreOverview
          isOverviewMode={isOverviewMode}
          setIsOverviewMode={setIsOverviewMode}
          numPages={numPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pdfDoc={pdfDoc}
          renderPage={renderPage}
          pageThumbnails={pageThumbnails}
          appState={appState}
        />
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


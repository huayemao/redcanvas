'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StudioEditor } from '../components/studio/StudioEditor';
import { StudioCanvas } from '../components/studio/StudioCanvas';
import { ElementPropertyPanel } from '../components/studio/ElementsControlTab';
import { useStudioStore } from '../store/useStudioStore';
import { exportElementToImage } from '../lib/exportUtils';
import { ExportSize } from '../types';
import { Loader2, Info, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('正在初始化渲染引擎...');
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [mobilePropDrawerOpen, setMobilePropDrawerOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    aspectRatio,
    setAspectRatio,
    addImage,
    autoExtractColors,
    autoColorEnabled,
    selectedElementId,
    setSelectedElementId,
  } = useStudioStore();

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              addImage({
                id: `img-${Date.now()}`,
                url,
                title: '剪贴板粘贴截图',
              });
              if (autoColorEnabled) {
                autoExtractColors(url);
              }
            };
            img.src = url;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addImage, autoColorEnabled, autoExtractColors]);

  // 选中元素变化时，关闭移动端属性抽屉（仅选中，不自动打开抽屉）
  useEffect(() => {
    setMobilePropDrawerOpen(false);
  }, [selectedElementId]);

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setExportMessage('正在生成图片...');

    // 导出前：给画布容器加 exporting 类，隐藏选中环、抓手等编辑态元素
    const canvasEl = previewRef.current;
    const prevClass = canvasEl.className;
    canvasEl.classList.add('exporting');

    try {
      await exportElementToImage(canvasEl, {
        fileName: `redcanvas-studio-${Date.now()}.png`,
        scale: 2.5,
        backgroundColor: '#ffffff',
        onProgress: (msg) => setExportMessage(msg),
      });
    } catch (err) {
      console.error('Export error:', err);
      alert('导出图片遇到安全限制或加载超时，请重试。建议使用 Chrome 或 Edge 浏览器。');
    } finally {
      // 导出完成：恢复样式
      canvasEl.className = prevClass;
      setIsExporting(false);
    }
  }, []);

  const ratios: { size: ExportSize; label: string; w: string; h: string }[] = [
    { size: '3:4', label: '3 : 4', w: 'w-8', h: 'h-10' },
    { size: '1:1', label: '1 : 1', w: 'w-9', h: 'h-9' },
    { size: '9:16', label: '9 : 16', w: 'w-5', h: 'h-11' },
    { size: '4:3', label: '4 : 3', w: 'w-11', h: 'h-8' },
    { size: '16:9', label: '16 : 9', w: 'w-12', h: 'h-7' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/40">
      <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Editor (desktop only; mobile uses drawer) */}
        <aside className="hidden lg:block w-[460px] xl:w-[520px] flex-shrink-0 bg-[#0f0f0f] border-r border-white/[0.06] p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-md lg:max-w-lg xl:max-w-xl mx-auto space-y-6">
            {/* Brand Header */}
            <header className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                  RedCanvas Studio
                </span>
              </div>
              <h1 className="text-4xl xl:text-[44px] font-black tracking-tight leading-[1.05] text-white">
                STUDIO<span className="text-red-500">.</span>
              </h1>
              <p className="text-[11px] text-white/40 font-bold mt-1.5 uppercase tracking-[0.15em]">
                Aesthetic Content & Graphic Layout
              </p>
            </header>

            {/* Editor */}
            <StudioEditor onExportPng={handleExport} isExporting={isExporting} />

            {/* Tip Card */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
              <Info className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-white/50 leading-relaxed font-medium flex-1">
                支持 <b className="text-white/80">Ctrl + V 粘贴截图</b> 自动提色 · 所有标注支持
                <b className="text-white/80"> 画布自由拖拽</b>
              </p>
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between text-[10px] text-white/20 font-medium px-1">
              <span>REDCANVAS · STUDIO v1.0</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready
              </span>
            </div>
          </div>
        </aside>

        {/* Right Panel - Canvas & Export */}
        <section className="flex-1 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] relative overflow-hidden">
          {/* Mobile editor toggle */}
          <button
            onClick={() => setMobileEditorOpen(true)}
            className="lg:hidden absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md text-white/80 text-[11px] font-black border border-white/10 hover:bg-black/70 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            编辑
          </button>
          {/* Ambient glow */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

          <div
            className="relative z-10 flex flex-col items-center justify-center gap-10 p-6 lg:p-12 min-h-screen"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedElementId(null);
            }}
          >
            {/* Canvas Preview + 桌面端属性面板 */}
            <div
              className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8 w-full max-w-[1100px]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedElementId(null);
              }}
            >
              {/* Canvas */}
              <div
                className="w-full max-w-[580px] flex flex-col items-center gap-6 flex-shrink-0"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedElementId(null);
                }}
              >
                <div className="relative w-full">
                  {/* Outer frame - premium dark */}
                  <div className="overflow-hidden border border-white/[0.08] bg-white/[0.02] p-3 shadow-2xl shadow-black/50">
                    <div className="overflow-hidden border border-white/[0.05]">
                      <StudioCanvas ref={previewRef} onEditElement={() => setMobilePropDrawerOpen(true)} />
                    </div>
                  </div>
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500/60 rounded-tl-lg pointer-events-none" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-red-500/60 rounded-tr-lg pointer-events-none" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-red-500/60 rounded-bl-lg pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500/60 rounded-br-lg pointer-events-none" />
                </div>

                {/* Ratio selector below canvas */}
                <div className="flex items-center gap-3">
                  {ratios.map((r) => {
                    const isActive = aspectRatio === r.size;
                    return (
                      <button
                        key={r.size}
                        onClick={() => setAspectRatio(r.size)}
                        className={`group flex flex-col items-center gap-1.5 transition-all ${
                          isActive ? 'scale-110' : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div
                          className={`border-2 transition-all ${
                            isActive
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-white/30 group-hover:border-white/60'
                          } rounded-sm ${r.w} ${r.h}`}
                        />
                        <span
                          className={`text-[10px] font-black tracking-wider ${
                            isActive ? 'text-red-400' : 'text-white/40'
                          }`}
                        >
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 桌面端属性面板（画布右侧，lg 以上显示） */}
              <div className="hidden lg:block w-[320px] xl:w-[340px] flex-shrink-0">
                <AnimatePresence mode="wait">
                  {selectedElementId ? (
                    <motion.div
                      key="prop-panel"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18 }}
                      className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-5 scroll-smooth"
                    >
                      <ElementPropertyPanel />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="prop-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="sticky top-6 bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-8 text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-5 h-5 text-white/30" />
                      </div>
                      <p className="text-xs text-white/40 font-medium leading-relaxed">
                        点击画布中的元素<br />即可在此调整属性
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Export Panel 已移除，下载按钮整合到左侧底部 */}
          </div>
        </section>
      </main>

      {/* 移动端编辑器抽屉（lg 以下显示，点击"编辑"按钮从底部滑出） */}
      <AnimatePresence>
        {mobileEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[95] flex items-end"
            onClick={() => setMobileEditorOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-[88vh] overflow-y-auto bg-[#0f0f0f] border-t border-white/[0.1] rounded-t-[28px] p-4 pb-8 scroll-smooth"
            >
              {/* 拖拽指示条 */}
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 flex-shrink-0" />
              {/* 标题 + 关闭按钮 */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-black text-white/80 tracking-wider">编辑器</h2>
                <button
                  onClick={() => setMobileEditorOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <StudioEditor onExportPng={handleExport} isExporting={isExporting} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端属性面板抽屉（lg 以下显示，点击抓手编辑按钮后从底部滑出） */}
      <AnimatePresence>
        {mobilePropDrawerOpen && selectedElementId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[90] flex items-end"
            onClick={() => setMobilePropDrawerOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-[80vh] overflow-y-auto bg-[#0f0f0f] border-t border-white/[0.1] rounded-t-[28px] p-5 pb-8 scroll-smooth"
            >
              {/* 拖拽指示条 */}
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 flex-shrink-0" />
              {/* 关闭按钮 */}
              <button
                onClick={() => setMobilePropDrawerOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              <ElementPropertyPanel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            aria-hidden="true"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111111] border border-white/10 p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6 max-w-xs w-full text-center"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-red-500/10 blur-xl" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">正在生成高清图片</h3>
                <p className="text-white/40 text-xs mt-2 font-medium">
                  {exportMessage}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppPage;


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { EditorState } from './types';
import * as htmlToImage from 'html-to-image';
import { Sparkles, Share2, Loader2, Download, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_STATE: EditorState = {
  title: "一天一个\n强大的网站\n互联网时光机",
  highlights: [
    { id: '1', text: '强大', color: '#ff2442' },
    { id: '2', text: '网站', color: '#ff2442' },
    { id: '3', text: '时光机', color: '#6bcbff' }
  ],
  seriesNumber: "#01",
  imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop",
  imageAspectRatio: 1.5,
  showDeviceFrame: true,
  templateId: 'classic',
  fontFamily: 'kuaile', // Switched to childlike font as default
  accentColor: '#ff2442',
};

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Keyboard and Paste Listeners
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
              setState(prev => ({ 
                ...prev, 
                imageUrl: url,
                imageAspectRatio: img.naturalWidth / img.naturalHeight
              }));
            };
            img.src = url;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const exportImage = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    
    try {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
      
      await new Promise(r => setTimeout(r, 600));
      
      const options = {
        pixelRatio: 2.5, // Slightly higher for crispness
        cacheBust: false,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
        },
      };

      const blob = await htmlToImage.toBlob(previewRef.current, options);

      if (!blob) throw new Error("Canvas generation failed");

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `redcanvas-${Date.now()}.png`;
      link.href = url;
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (err) {
      console.error('Export error:', err);
      alert('导出由于浏览器安全限制或资源加载失败。请确保网络顺畅，并建议使用 Chrome 或 Safari 浏览器。');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#fcfcfc] overflow-hidden selection:bg-red-100">
      <nav className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-200">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">RedCanvas</span>
            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">XHS Creative Suite</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={exportImage} className="lg:hidden p-2 bg-red-500 text-white rounded-full transition-transform active:scale-90">
              <Download className="w-4 h-4" />
           </button>
           <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              本地渲染引擎已就绪
           </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 bg-neutral-50/50 p-6 overflow-y-auto border-r border-neutral-100 h-full">
          <div className="max-w-md mx-auto space-y-6">
            <header className="mb-4 hidden lg:block">
              <h2 className="text-2xl font-black text-neutral-900 leading-tight">爆款封面工厂</h2>
              <p className="text-[10px] text-neutral-400 font-medium mt-1 uppercase tracking-widest">Aesthetic Content Studio</p>
            </header>
            
            <Editor state={state} setState={setState} onDownload={exportImage} />
            
            <div className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-start gap-3">
               <Info className="w-4 h-4 text-blue-500 mt-0.5" />
               <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                 推荐：开启<b>壳子模式</b>适配网站/APP 演示；使用<b>快乐体</b>提升亲和力。
               </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white relative flex items-center justify-center p-6 lg:p-12 h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center max-h-full"
          >
            <div className="w-full max-w-[380px] xl:max-w-[420px]">
              <Preview state={state} ref={previewRef} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">
               <div>High Res Output</div>
               <div className="w-1 h-1 bg-neutral-200 rounded-full" />
               <div>Strict 3:4 Aspect</div>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
             <motion.div 
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 max-w-xs w-full"
             >
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-neutral-100 rounded-full" />
                  <Loader2 className="w-12 h-12 text-red-500 animate-spin absolute inset-0" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-black text-neutral-900">正在渲染高清封面</h3>
                  <p className="text-neutral-400 text-[9px] leading-relaxed mt-2 uppercase tracking-widest">Processing High Precision Layers</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

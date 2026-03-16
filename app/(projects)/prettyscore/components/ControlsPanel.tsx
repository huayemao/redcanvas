import React from 'react';
import { motion } from 'framer-motion';
import { FileAudio, X, Palette, ImageIcon, Layers, Droplet, Sparkles, Sun, ImageIcon as Image, Download } from 'lucide-react';
import { THEMES, PAPER_PRESETS, PRESET_COLORS, DECORATIONS } from '../constants';
import { usePrettyScoreStore } from '../store';
import useDebounce from '../hooks/useDebounce';

interface ControlsPanelProps {
  exportImage: () => void;
  exportPdf: () => void;
  handleCustomBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ControlsPanel({ 
  exportImage, 
  exportPdf, 
  handleCustomBgUpload
}: ControlsPanelProps) {
  const {
    bgType,
    setBgType,
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
    applyTheme,
    setAppState,
    setIsControlsOpen
  } = usePrettyScoreStore();

  return (
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
                onClick={() => applyTheme(theme.id)}
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
                onClick={() => { setBgPresetUrl(preset.url); setBgType('preset'); }}
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
          <Image className="w-4 h-4" /> Export Image
        </button>
        <button onClick={exportPdf} className="w-full py-3 border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] transition-colors duration-300 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>
    </motion.aside>
  );
}

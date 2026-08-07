'use client';

import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Sparkles } from 'lucide-react';

export const CanvasControlTab: React.FC = () => {
  const {
    autoExtractColors,
    images,
    floatingElements,
    selectedElementId,
    paletteCandidates,
    selectedCandidateId,
    applyPaletteCandidate,
    paletteStyles,
    selectedStyleId,
    applyPaletteStyle,
  } = useStudioStore();

  const handleAutoColor = () => {
    // 优先用当前选中 image/asset 元素的图片；否则回退到图库第一张
    const sel = floatingElements.find((e) => e.id === selectedElementId);
    const url =
      (sel && (sel.type === 'image' || sel.type === 'asset') && sel.imageUrl) ||
      images[0]?.url;
    if (url) {
      autoExtractColors(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* 智能提取图片主色 */}
      <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.06] flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>智能提色 · Auto Extract</span>
          </h4>
          <p className="text-[10px] text-white/40">一键自动提色，匹配极佳底色与对比文案</p>
        </div>
        <button
          onClick={handleAutoColor}
          className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs transition-colors shadow-md flex-shrink-0"
        >
          一键提色
        </button>
      </div>

      {/* 两级配色方案 · 主色候选（主变体）+ 风格（次变体） */}
      {paletteCandidates.length > 0 && (
        <div className="space-y-4">
          {/* —— 主色候选（主变体）：横向滚动 —— */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center justify-between">
              <span>主色候选 · Dominant</span>
              <span className="text-white/20 font-mono">{paletteCandidates.length} 个</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
              {paletteCandidates.map((c) => {
                const active = selectedCandidateId === c.candidateId;
                return (
                  <button
                    key={c.candidateId}
                    onClick={() => applyPaletteCandidate(c.candidateId)}
                    className={`group flex-shrink-0 w-[88px] text-left rounded-2xl overflow-hidden border transition-all ${
                      active
                        ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.4)] scale-[1.03]'
                        : 'border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    {/* 主色色块 */}
                    <div
                      className="h-12 w-full relative flex items-end justify-end gap-1 p-1.5"
                      style={{ backgroundColor: c.dominantHex }}
                    >
                      {/* 次色 / 强调色小球 */}
                      <span
                        className="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: c.secondary }}
                        title="次色"
                      />
                      <span
                        className="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: c.accent }}
                        title="强调色"
                      />
                    </div>
                    {/* 名称 */}
                    <div className="px-2 py-1.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-center">
                      <span
                        className={`text-[10px] font-black tracking-wide truncate ${
                          active ? 'text-red-400' : 'text-white/60 group-hover:text-white/80'
                        }`}
                      >
                        {c.candidateName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* —— 风格（次变体）：按钮组 —— */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center justify-between">
              <span>风格 · Style</span>
              <span className="text-white/20 font-mono">{paletteStyles.length} 种</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paletteStyles.map((s) => {
                const active = selectedStyleId === s.styleId;
                return (
                  <button
                    key={s.styleId}
                    onClick={() => applyPaletteStyle(s.styleId)}
                    className={`py-2 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    {s.styleName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

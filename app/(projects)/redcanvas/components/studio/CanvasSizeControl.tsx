'use client';

import React, { useState, useEffect } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ExportSize } from '../../types';
import { CUSTOM_SIZE_PRESETS } from '../../lib/canvasSize';
import { Ratio, ArrowLeftRight, Sparkles } from 'lucide-react';

interface CanvasSizeControlProps {
  /** 是否仅渲染自定义尺寸编辑面板（用于画布下方已渲染比例图标按钮时的补充展开区） */
  customOnly?: boolean;
  /** 紧凑模式 */
  compact?: boolean;
}

const RATIO_OPTIONS: { size: ExportSize; label: string }[] = [
  { size: '3:4', label: '3:4' },
  { size: '1:1', label: '1:1' },
  { size: '9:16', label: '9:16' },
  { size: '4:3', label: '4:3' },
  { size: '16:9', label: '16:9' },
  { size: 'custom', label: '自定义' },
];

export const CanvasSizeControl: React.FC<CanvasSizeControlProps> = ({
  customOnly = false,
  compact = false,
}) => {
  const {
    aspectRatio,
    setAspectRatio,
    customWidth,
    customHeight,
    setCustomSize,
    floatingElements,
    images,
  } = useStudioStore();

  const [rawW, setRawW] = useState<string>(String(customWidth || 1080));
  const [rawH, setRawH] = useState<string>(String(customHeight || 1440));
  const [editingW, setEditingW] = useState(false);
  const [editingH, setEditingH] = useState(false);

  useEffect(() => {
    if (!editingW) setRawW(String(customWidth || 1080));
  }, [customWidth, editingW]);

  useEffect(() => {
    if (!editingH) setRawH(String(customHeight || 1440));
  }, [customHeight, editingH]);

  const commitWidth = (valStr: string) => {
    const n = Number(valStr);
    const clamped = Number.isFinite(n) && n >= 1 ? Math.min(10000, Math.round(n)) : (customWidth || 1080);
    setRawW(String(clamped));
    setCustomSize(clamped, customHeight || 1440);
  };

  const commitHeight = (valStr: string) => {
    const n = Number(valStr);
    const clamped = Number.isFinite(n) && n >= 1 ? Math.min(10000, Math.round(n)) : (customHeight || 1440);
    setRawH(String(clamped));
    setCustomSize(customWidth || 1080, clamped);
  };

  const handleSwap = () => {
    const nextW = customHeight || 1440;
    const nextH = customWidth || 1080;
    if (aspectRatio !== 'custom') setAspectRatio('custom');
    setCustomSize(nextW, nextH);
  };

  // 一键跟随主图真实宽高比
  const handleMatchMainImage = () => {
    const imgEl = floatingElements.find((e) => e.type === 'image' && e.imageUrl);
    const ratio = imgEl?.aspectRatio;
    if (ratio && ratio > 0) {
      const baseW = 1080;
      const calcH = Math.max(200, Math.min(4800, Math.round(baseW / ratio)));
      setAspectRatio('custom');
      setCustomSize(baseW, calcH);
      return;
    }
    const url = imgEl?.imageUrl || images[0]?.url;
    if (!url || typeof window === 'undefined') return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const r = img.naturalWidth / img.naturalHeight;
        const baseW = 1080;
        const calcH = Math.max(200, Math.min(4800, Math.round(baseW / r)));
        setAspectRatio('custom');
        setCustomSize(baseW, calcH);
      }
    };
    img.src = url;
  };

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      {!customOnly && (
        <>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-between">
            <span>画布尺寸 & 比例 · Canvas Size</span>
            <Ratio className="w-3.5 h-3.5 text-white/30" />
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            {RATIO_OPTIONS.map((r) => {
              const active = aspectRatio === r.size;
              return (
                <button
                  key={r.size}
                  type="button"
                  onClick={() => setAspectRatio(r.size)}
                  className={`py-2 rounded-xl font-black text-xs transition-all ${
                    active
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white/[0.03] text-white/55 hover:bg-white/[0.07] hover:text-white border border-white/[0.05]'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {(customOnly || aspectRatio === 'custom') && (
        <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">
              自定义宽高 (比例或像素)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMatchMainImage}
                className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08] text-[10px] font-bold transition-all flex items-center gap-1"
                title="按当前画布主图比例自动设置画布尺寸"
              >
                <Sparkles className="w-2.5 h-2.5 text-red-400" />
                <span>跟随主图比例</span>
              </button>
              <button
                type="button"
                onClick={handleSwap}
                className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08] text-[10px] font-bold transition-all flex items-center gap-1"
                title="互换宽高（横竖屏切换）"
              >
                <ArrowLeftRight className="w-2.5 h-2.5" />
                <span>互换</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30 pointer-events-none">
                宽
              </span>
              <input
                type="number"
                min={1}
                max={10000}
                value={rawW}
                onFocus={() => setEditingW(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawW(val);
                  const n = Number(val);
                  if (Number.isFinite(n) && n >= 1) {
                    setCustomSize(Math.min(10000, Math.round(n)), customHeight || 1440);
                  }
                }}
                onBlur={(e) => {
                  setEditingW(false);
                  commitWidth(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="1080"
                className="w-full pl-7 pr-2 py-1.5 bg-white/[0.04] rounded-xl text-xs font-mono font-bold text-center text-white border border-white/[0.08] focus:outline-none focus:border-red-500/60"
              />
            </div>

            <span className="text-white/30 font-black text-xs">×</span>

            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30 pointer-events-none">
                高
              </span>
              <input
                type="number"
                min={1}
                max={10000}
                value={rawH}
                onFocus={() => setEditingH(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawH(val);
                  const n = Number(val);
                  if (Number.isFinite(n) && n >= 1) {
                    setCustomSize(customWidth || 1080, Math.min(10000, Math.round(n)));
                  }
                }}
                onBlur={(e) => {
                  setEditingH(false);
                  commitHeight(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="1440"
                className="w-full pl-7 pr-2 py-1.5 bg-white/[0.04] rounded-xl text-xs font-mono font-bold text-center text-white border border-white/[0.08] focus:outline-none focus:border-red-500/60"
              />
            </div>
          </div>

          {/* 常用自定义尺寸快捷预设 */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {CUSTOM_SIZE_PRESETS.map((p) => {
              const isMatched =
                Math.abs((customWidth || 1080) / (customHeight || 1440) - p.width / p.height) < 0.008;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    if (aspectRatio !== 'custom') setAspectRatio('custom');
                    setCustomSize(p.width, p.height);
                  }}
                  title={p.subLabel}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    isMatched
                      ? 'bg-red-500/20 border-red-500/50 text-red-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


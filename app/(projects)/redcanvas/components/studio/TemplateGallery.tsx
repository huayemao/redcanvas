'use client';

import React from 'react';
import {
  STUDIO_TEMPLATES,
  StudioTemplateId,
  useStudioStore,
} from '../../store/useStudioStore';
import { ExportSize } from '../../types';
import { Check, Ratio } from 'lucide-react';

export const TemplateGallery: React.FC = () => {
  const {
    templateId,
    setTemplateId,
    aspectRatio,
    setAspectRatio,
    customWidth,
    customHeight,
    setCustomSize,
  } = useStudioStore();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
        <span className="w-8 h-px bg-white/20" />
        <span>Templates · 模板</span>
      </div>

      {/* Templates List Grid */}
      <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {STUDIO_TEMPLATES.map((item) => {
          const isSelected = templateId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTemplateId(item.id as StudioTemplateId)}
              className={`group p-3 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                isSelected
                  ? 'border-white/30 bg-white/[0.08] text-white shadow-xl'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/70 hover:border-white/[0.12] hover:bg-white/[0.04]'
              }`}
            >
              {/* Selected glow */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
              )}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.previewColor }}
                  />
                  {isSelected && <Check className="w-4 h-4 text-red-400" />}
                </div>
                <h4 className="font-black text-xs leading-tight mb-1">{item.name}</h4>
                <p
                  className={`text-[10px] line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-white/50' : 'text-white/30'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 画布比例选择 */}
      <div>
        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>画布比例 · Ratio</span>
          <Ratio className="w-3.5 h-3.5 text-white/30" />
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(['3:4', '1:1', '9:16', '4:3', '16:9', 'custom'] as ExportSize[]).map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`py-2.5 rounded-xl font-black text-xs transition-all ${
                aspectRatio === r
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {r === 'custom' ? '自定义' : r}
            </button>
          ))}
        </div>

        {aspectRatio === 'custom' && (
          <div className="flex items-center gap-2 mt-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomSize(Number(e.target.value), customHeight)}
              placeholder="宽"
              className="w-full p-2 bg-white/[0.04] rounded-lg text-xs font-mono font-bold text-center text-white border border-white/[0.06] focus:outline-none focus:border-red-500/50"
            />
            <span className="text-white/30 font-bold">:</span>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomSize(customWidth, Number(e.target.value))}
              placeholder="高"
              className="w-full p-2 bg-white/[0.04] rounded-lg text-xs font-mono font-bold text-center text-white border border-white/[0.06] focus:outline-none focus:border-red-500/50"
            />
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { FONTS } from '../../constants';
import { Plus, Trash2 } from 'lucide-react';

export const TextControlTab: React.FC = () => {
  const {
    title,
    setTitle,
    subtitle,
    setSubtitle,
    seriesNumber,
    setSeriesNumber,
    fontFamily,
    setFontFamily,
    highlights,
    addHighlight,
    updateHighlight,
    removeHighlight,
  } = useStudioStore();

  return (
    <div className="space-y-6">
      {/* 字体风格选择 */}
      <div>
        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">
          艺术字体 · Font Style
        </label>

        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFontFamily(f.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                fontFamily === f.id
                  ? 'border-red-500 bg-red-500/[0.1] text-white shadow-sm'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <span className={`text-xs font-bold block ${f.className}`}>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 主标题与副标题 */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
          主标题 · Title (支持换行)
        </label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={3}
          placeholder="请输入主标题..."
          className="w-full p-3.5 bg-white/[0.03] rounded-2xl font-bold text-sm text-white border border-white/[0.06] placeholder-white/20 focus:outline-none focus:border-red-500/50"
        />

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">
              副标题 · Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="副标题文案..."
              className="w-full p-3 bg-white/[0.03] rounded-xl font-medium text-xs text-white border border-white/[0.06] placeholder-white/20 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">
              期数 · Issue
            </label>
            <input
              type="text"
              value={seriesNumber}
              onChange={(e) => setSeriesNumber(e.target.value)}
              placeholder="#01"
              className="w-full p-3 bg-white/[0.03] rounded-xl font-mono font-bold text-xs text-white border border-white/[0.06] placeholder-white/20 text-center focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>
      </div>

      {/* 高亮关键字标注 */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
            高亮关键词 · Highlights ({highlights.length})
          </label>
          <button
            onClick={addHighlight}
            className="inline-flex items-center gap-1 text-[10px] font-black text-red-400 hover:text-red-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加关键词</span>
          </button>
        </div>

        <div className="space-y-2">
          {highlights.map((h) => (
            <div key={h.id} className="flex items-center gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
              <input
                type="text"
                value={h.text}
                onChange={(e) => updateHighlight(h.id, { text: e.target.value })}
                placeholder="目标词..."
                className="flex-1 p-1.5 bg-white/[0.04] rounded-lg text-xs font-bold text-white border border-white/[0.06] placeholder-white/20 focus:outline-none focus:border-red-500/50"
              />
              <input
                type="color"
                value={h.color}
                onChange={(e) => updateHighlight(h.id, { color: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer border border-white/[0.1] bg-transparent"
              />
              <select
                value={h.style}
                onChange={(e) =>
                  updateHighlight(h.id, { style: e.target.value as 'underline' | 'text' })
                }
                className="p-1 bg-white/[0.04] rounded-lg text-xs font-bold text-white border border-white/[0.06] focus:outline-none"
              >
                <option value="underline" className="bg-neutral-900">下划线</option>
                <option value="text" className="bg-neutral-900">文字调色</option>
              </select>
              <button
                onClick={() => removeHighlight(h.id)}
                className="p-1 text-white/30 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

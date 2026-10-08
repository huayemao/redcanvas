'use client';

import React, { useState } from 'react';
import { Film } from 'lucide-react';
import {
  TEXTURE_PRESETS,
  TEXTURE_BLEND_MODES,
  GRAIN_SIZE_PRESETS,
  DEFAULT_TEXTURE_OPACITY,
  DEFAULT_TEXTURE_BLEND_MODE,
  DEFAULT_TEXTURE_SIZE,
  DEFAULT_TEXTURE_TARGET,
} from '../../constants';

export interface TextureValue {
  textureUrl?: string;
  textureOpacity?: number;
  textureBlendMode?: 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen';
  textureTarget?: 'all' | 'bg';
  textureSize?: number;
}

export type TextureConfig = TextureValue;

export interface TextureControlSectionProps {
  title?: string;
  value: TextureValue;
  onChange: (patch: Partial<TextureValue>) => void;
  /** 是否显示覆盖范围选择器（整张图片 vs 仅限背景，仅针对画布背景层有效） */
  showTargetScope?: boolean;
}

export const TextureControlSection: React.FC<TextureControlSectionProps> = ({
  title = '胶片颗粒 · 材质遮罩',
  value,
  onChange,
  showTargetScope = false,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'grain' | 'noise' | 'paper' | 'fabric'>('all');

  const currentTexture = value.textureUrl || '';
  const currentOpacity = value.textureOpacity ?? DEFAULT_TEXTURE_OPACITY;
  const currentBlendMode = value.textureBlendMode ?? DEFAULT_TEXTURE_BLEND_MODE;
  const currentTarget = value.textureTarget ?? DEFAULT_TEXTURE_TARGET;
  const currentSize = value.textureSize ?? DEFAULT_TEXTURE_SIZE;

  const filteredPresets =
    categoryFilter === 'all'
      ? TEXTURE_PRESETS
      : TEXTURE_PRESETS.filter((p) => p.category === categoryFilter || p.id === 'none');

  return (
    <div className="space-y-3">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-red-400" />
          <span>{title}</span>
        </label>
        {currentTexture && (
          <button
            type="button"
            onClick={() => onChange({ textureUrl: '' })}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold hover:underline"
          >
            移除遮罩
          </button>
        )}
      </div>

      {/* 遮罩覆盖范围（仅当针对画布背景时显示） */}
      {showTargetScope && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => onChange({ textureTarget: 'all' })}
              className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                currentTarget === 'all'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              整张图片 (全画幅)
            </button>
            <button
              type="button"
              onClick={() => onChange({ textureTarget: 'bg' })}
              className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                currentTarget === 'bg'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              仅限背景 (不遮主体)
            </button>
          </div>
          <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] text-[11px] text-white/50 leading-relaxed">
            {currentTarget === 'bg' ? (
              <>
                仅作用于底层背景，给背景底色或模糊底图增添肌理，不遮挡前景中的图片、卡片与文字。
              </>
            ) : (
              <>
                全画幅叠层遮罩，覆盖在整张图片（所有图层）最顶层，统一赋予真实胶片与纸张质感。
              </>
            )}
          </div>
        </div>
      )}

      {/* 材质分类过滤标签 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 scrollbar-thin">
        {[
          { key: 'all', label: '全部' },
          { key: 'grain', label: '颗粒微粒' },
          { key: 'noise', label: '复古噪点' },
          { key: 'paper', label: '质感纸张' },
          { key: 'fabric', label: '手工织物' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setCategoryFilter(tab.key as any)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
              categoryFilter === tab.key
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 材质预设横向滚动列表 */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
        {filteredPresets.map((preset) => {
          const active = currentTexture === preset.url;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                if (preset.id === 'none') {
                  onChange({ textureUrl: '' });
                } else {
                  onChange({
                    textureUrl: preset.url,
                    textureOpacity: value.textureOpacity ?? preset.defaultOpacity,
                    textureBlendMode: value.textureBlendMode ?? (preset.defaultBlendMode || DEFAULT_TEXTURE_BLEND_MODE),
                  });
                }
              }}
              className={`group flex-shrink-0 w-[84px] text-center p-1.5 rounded-xl border transition-all ${
                active
                  ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500/40 shadow-sm'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div
                className="h-10 w-full rounded-lg relative overflow-hidden flex items-center justify-center border border-white/10 mb-1"
                style={{ backgroundColor: '#1e232d' }}
              >
                {preset.url ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-zinc-900 opacity-90" />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("${preset.url}")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '140px',
                        mixBlendMode: 'normal',
                        opacity: 0.85,
                      }}
                    />
                  </>
                ) : (
                  <span className="text-[10px] text-white/30 font-bold">无</span>
                )}
                {active && (
                  <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
                    <span className="text-[8px] font-black leading-none">✓</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[10px] font-black truncate block ${
                  active ? 'text-red-400' : 'text-white/60 group-hover:text-white/80'
                }`}
              >
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 材质微调面板（当启用材质时显示） */}
      {currentTexture && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
          {/* 颗粒浓度 (Opacity) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
              <span>颗粒浓度 (Opacity)</span>
              <span className="font-mono text-red-400">{Math.round(currentOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={Math.round(currentOpacity * 100)}
              onChange={(e) => onChange({ textureOpacity: Number(e.target.value) / 100 })}
              className="w-full accent-red-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* 噪点大小调节 (Grain Size / Scale) */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
              <span>噪点大小 (Grain Size)</span>
              <span className="font-mono text-red-400">{currentSize}px</span>
            </div>
            <input
              type="range"
              min={80}
              max={900}
              step={20}
              value={currentSize}
              onChange={(e) => onChange({ textureSize: Number(e.target.value) })}
              className="w-full accent-red-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {GRAIN_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ textureSize: preset.val })}
                  className={`py-1 rounded-lg text-[9px] font-bold transition-all text-center ${
                    Math.abs(currentSize - preset.val) < 35
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm'
                      : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-white/35 leading-relaxed">
              数值越大颗粒越粗粝明显，复古感更强；数值越小颗粒越细密。
            </p>
          </div>

          {/* 混合模式 (Mix Blend Mode) */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-white/60 block">混合模式 (Mix Blend Mode)</span>
            <div className="grid grid-cols-3 gap-1.5">
              {TEXTURE_BLEND_MODES.map((bm) => (
                <button
                  key={bm.value}
                  type="button"
                  onClick={() => onChange({ textureBlendMode: bm.value })}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all flex flex-col items-center justify-center ${
                    currentBlendMode === bm.value
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white'
                  }`}
                  title={bm.desc}
                >
                  <span>{bm.name}</span>
                  <span className="text-[8px] opacity-60 font-normal">{bm.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义材质图片 URL */}
          <div className="pt-2 border-t border-white/5 space-y-1">
            <label className="text-[10px] font-bold text-white/60 block">自定义材质 PNG URL</label>
            <input
              type="text"
              value={currentTexture}
              placeholder="/redcanvas/textures/retina-dust.png 或 https://..."
              onChange={(e) => onChange({ textureUrl: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};

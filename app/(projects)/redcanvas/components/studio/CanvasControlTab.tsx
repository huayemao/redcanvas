'use client';

import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Sparkles, Film } from 'lucide-react';
import { TEXTURE_PRESETS } from '../../constants';

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
    bgTexture,
    textureOpacity,
    textureBlendMode,
    textureTarget,
    setBgTexture,
    setTextureOpacity,
    setTextureBlendMode,
    setTextureTarget,
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

  const bgElement = floatingElements.find((e) => e.type === 'background');
  const currentTexture = bgElement?.textureUrl !== undefined ? bgElement.textureUrl : bgTexture;
  const currentOpacity = bgElement?.textureOpacity ?? textureOpacity ?? 0.6;
  const currentBlendMode = bgElement?.textureBlendMode ?? textureBlendMode ?? 'overlay';
  const currentTarget = bgElement?.textureTarget ?? textureTarget ?? 'all';

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
          {(() => {
            // 按 candidateId 前缀分组：c 开头=图片提取，p 开头=精选预设
            const extracted = paletteCandidates.filter((c) => c.candidateId.startsWith('c'));
            const presets = paletteCandidates.filter((c) => c.candidateId.startsWith('p'));

            // 单个候选按钮渲染（提取与预设共用）
            const renderCandidate = (c: typeof paletteCandidates[number]) => {
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
            };

            return (
              <>
                {/* 第一行：图片提取的主色候选 */}
                {extracted.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center justify-between">
                      <span>主色候选 · Dominant</span>
                      <span className="text-white/20 font-mono">{extracted.length} 个</span>
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
                      {extracted.map(renderCandidate)}
                    </div>
                  </div>
                )}

                {/* 第二行：精选预设配色（另起一行，仅在提取不理想时手动切换） */}
                {presets.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center justify-between">
                      <span>精选预设 · Presets</span>
                      <span className="text-white/20 font-mono">{presets.length} 套</span>
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
                      {presets.map(renderCandidate)}
                    </div>
                  </div>
                )}
              </>
            );
          })()}


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

      {/* 胶片颗粒与质感遮罩快捷设置 */}
      <div className="space-y-3 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-red-400" />
            <span>胶片颗粒 · 材质遮罩</span>
          </label>
          {currentTexture && (
            <button
              onClick={() => setBgTexture('')}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold hover:underline"
            >
              清除材质
            </button>
          )}
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed">
          全屏 <code className="font-mono text-white/70">mix-blend-mode: overlay</code> 遮罩，不改变色彩，统一步调叠加颗粒与纸张质感。
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
          {TEXTURE_PRESETS.map((preset) => {
            const active = (currentTexture || '') === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  if (preset.id === 'none') {
                    setBgTexture('');
                  } else {
                    setBgTexture(preset.url);
                    if (preset.defaultOpacity) setTextureOpacity(preset.defaultOpacity);
                    if (preset.defaultBlendMode) setTextureBlendMode(preset.defaultBlendMode);
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
                          mixBlendMode: 'overlay',
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

        {currentTexture && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            {/* 作用范围选择 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
                <span>作用范围</span>
                <span className="font-mono text-[9px] text-red-400">
                  {currentTarget === 'all' ? '整张图片 (全画幅)' : '仅限底层背景'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setTextureTarget('all')}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    currentTarget === 'all'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  整张图片 (全层)
                </button>
                <button
                  type="button"
                  onClick={() => setTextureTarget('bg')}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    currentTarget === 'bg'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  仅限背景 (不遮主体)
                </button>
              </div>
              <p className="text-[9px] text-white/35 leading-relaxed">
                {currentTarget === 'all'
                  ? '颗粒覆盖在最顶层，画面中所有卡片、插图和文字均染上统一胶片噪点。'
                  : '颗粒仅附着在底色与背景渐变上，前景图片与卡片主体保持高清纯净。'}
              </p>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/5">
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
                onChange={(e) => setTextureOpacity(Number(e.target.value) / 100)}
                className="w-full accent-red-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

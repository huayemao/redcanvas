'use client';

import React from 'react';
import { usePlogStore } from '../../store/usePlogStore';
import { PlogScenario, ExportSize } from '../../types';
import { Sparkles, Palette, Layers, Ratio } from 'lucide-react';
import { FONTS } from '../../constants';

export const PlogTab: React.FC = () => {
  const {
    plogScenario,
    setPlogScenario,
    aspectRatio,
    setAspectRatio,
    customWidth,
    customHeight,
    setCustomSize,
    bgType,
    setBgType,
    bgColor,
    setBgColor,
    gradientStart,
    gradientEnd,
    setGradient,
    fontFamily,
    setFontFamily,
    titleText,
    setTitleText,
    subtitleText,
    setSubtitleText,
    autoExtractColors,
    images,
  } = usePlogStore();

  const handleAutoColor = () => {
    if (images[0]?.url) {
      autoExtractColors(images[0].url);
    }
  };

  return (
    <div className="space-y-6">
      {/* 场景选择 */}
      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">
          1. 排版应用场景
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPlogScenario('product')}
            className={`py-3 px-2 rounded-2xl font-black text-xs transition-all flex flex-col items-center gap-1.5 ${
              plogScenario === 'product'
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>产品宣传/教程</span>
          </button>

          <button
            onClick={() => setPlogScenario('daily')}
            className={`py-3 px-2 rounded-2xl font-black text-xs transition-all flex flex-col items-center gap-1.5 ${
              plogScenario === 'daily'
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>日常记录/Vlog</span>
          </button>

          <button
            onClick={() => setPlogScenario('social')}
            className={`py-3 px-2 rounded-2xl font-black text-xs transition-all flex flex-col items-center gap-1.5 ${
              plogScenario === 'social'
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>社交图文/拼图</span>
          </button>
        </div>
      </div>

      {/* 文案编辑 */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
          2. 主标题与副标题
        </label>
        <textarea
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          rows={2}
          placeholder="请输入主标题..."
          className="w-full p-3.5 bg-neutral-50 rounded-2xl font-bold text-sm border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <input
          type="text"
          value={subtitleText}
          onChange={(e) => setSubtitleText(e.target.value)}
          placeholder="副标题/说明文字..."
          className="w-full p-3.5 bg-neutral-50 rounded-2xl font-medium text-xs border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {/* 字体选择 */}
      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">
          3. 字体风格
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFontFamily(f.id)}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all text-left ${
                fontFamily === f.id
                  ? 'border-red-500 bg-red-50/50 text-red-600'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className={f.className}>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 宽高比例选择 */}
      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>4. 画布宽高比例</span>
          <Ratio className="w-3.5 h-3.5 text-neutral-400" />
        </label>
        <div className="flex flex-wrap gap-2">
          {(['3:4', '1:1', '9:16', '4:3', '16:9', 'custom'] as ExportSize[]).map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                aspectRatio === r
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {r === 'custom' ? '自定义' : r}
            </button>
          ))}
        </div>

        {aspectRatio === 'custom' && (
          <div className="flex items-center gap-2 mt-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomSize(Number(e.target.value), customHeight)}
              placeholder="宽"
              className="w-full p-2 bg-white rounded-lg text-xs font-mono font-bold text-center border"
            />
            <span className="text-neutral-400 font-bold">:</span>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomSize(customWidth, Number(e.target.value))}
              placeholder="高"
              className="w-full p-2 bg-white rounded-lg text-xs font-mono font-bold text-center border"
            />
          </div>
        )}
      </div>

      {/* 配色与智能色彩识别 */}
      <div className="space-y-3 pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            5. 背景与智能主色提取
          </label>
          <button
            onClick={handleAutoColor}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-black transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>自动识别图片主色</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(['gradient', 'color', 'blur'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBgType(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                bgType === t
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t === 'gradient' ? '渐变背景' : t === 'color' ? '纯色' : '图片模糊'}
            </button>
          ))}
        </div>

        {bgType === 'gradient' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] font-bold text-neutral-400">起始色</span>
              <input
                type="color"
                value={gradientStart}
                onChange={(e) => setGradient(e.target.value, gradientEnd)}
                className="w-full h-8 rounded-lg cursor-pointer border border-neutral-200"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400">结束色</span>
              <input
                type="color"
                value={gradientEnd}
                onChange={(e) => setGradient(gradientStart, e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-neutral-200"
              />
            </div>
          </div>
        )}

        {bgType === 'color' && (
          <div>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border border-neutral-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

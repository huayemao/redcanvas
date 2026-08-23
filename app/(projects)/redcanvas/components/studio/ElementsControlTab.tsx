'use client';

import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Plus,
  Trash2,
  Tag,
  Layers,
  MessageSquare,
  Sparkles,
  Type,
  Image as ImageIcon,
  Shapes,
  Palette,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Link2,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
} from 'lucide-react';
import { PlogElement } from '../../types';
import { FONTS, PRESET_COLORS } from '../../constants';

type ShadowOption = { value: 0 | 1 | 2 | 3 | 4; label: string };
const SHADOW_OPTIONS: ShadowOption[] = [
  { value: 0, label: '无' },
  { value: 1, label: '淡' },
  { value: 2, label: '中' },
  { value: 3, label: '重' },
  { value: 4, label: '杂志级' },
];

const FONT_WEIGHTS: Array<{ value: PlogElement['fontWeight']; label: string }> = [
  { value: 300, label: '细' },
  { value: 400, label: '常规' },
  { value: 500, label: '中' },
  { value: 700, label: '粗' },
  { value: 800, label: '很粗' },
  { value: 900, label: '黑' },
];

export const ElementsControlTab: React.FC = () => {
  const {
    floatingElements,
    selectedElementId,
    setSelectedElementId,
    removeFloatingElement,
    addElementByType,
    reorderFloatingElementLayer,
    fontFamily: _globalFont,
  } = useStudioStore();

  const selected = floatingElements.find((e) => e.id === selectedElementId) || null;

  // ========== 快捷添加（统一走 addElementByType） ==========
  const addButtons = [
    { handler: () => addElementByType('background'), icon: Palette, label: '画布背景', tint: 'text-rose-400' },
    { handler: () => addElementByType('image'), icon: ImageIcon, label: '图片', tint: 'text-emerald-400' },
    { handler: () => addElementByType('text'), icon: Type, label: '文本框', tint: 'text-blue-400' },
    { handler: () => addElementByType('asset'), icon: Shapes, label: '图形素材', tint: 'text-fuchsia-400' },
    { handler: () => addElementByType('badge'), icon: Layers, label: '步骤徽章', tint: 'text-red-400' },
    { handler: () => addElementByType('annotation'), icon: MessageSquare, label: '说明提示框', tint: 'text-amber-400' },
    { handler: () => addElementByType('sticker'), icon: Sparkles, label: '高亮贴纸', tint: 'text-purple-400' },
    { handler: () => addElementByType('tag'), icon: Tag, label: '标签#', tint: 'text-neutral-300' },
    { handler: () => addElementByType('timestamp'), icon: Calendar, label: '时间戳', tint: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-6">
      {/* 快捷添加元素 */}
      <div>
        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">
          快速添加元素 · Quick Add
        </label>
        <div className="grid grid-cols-2 gap-2">
          {addButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.label}
                onClick={btn.handler}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-white/[0.06]"
              >
                <Plus className={`w-3.5 h-3.5 ${btn.tint}`} />
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================== 选中元素属性面板 ====================== */}
      {/* 桌面端：属性面板已移至画布右侧；移动端：底部抽屉。
          此处仅保留提示，引导用户选中元素后去右侧/抽屉调整。 */}
      {!selected && (
        <div className="pt-3 border-t border-white/[0.06] text-center py-6 text-xs text-white/30 font-medium">
          点击画布元素选中后，属性面板会出现在右侧
        </div>
      )}

      {/* ====================== 图层列表 ====================== */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
          图层列表 · Layers ({floatingElements.length})
        </label>

        {floatingElements.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/30 font-medium">
            暂无元素，点击上方按钮添加
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {/* 图层列表按 zIndex 降序排列：列表顶部 = 画布最上层（最前），列表底部 = 画布最底层（最后） */}
            {(() => {
              const sorted = [...floatingElements].sort((a, b) => b.zIndex - a.zIndex);
              const nonBgSortedAsc = floatingElements
                .filter((e) => e.type !== 'background')
                .sort((a, b) => a.zIndex - b.zIndex);
              return sorted.map((el) => {
                const isBg = el.type === 'background';
                const pos = nonBgSortedAsc.findIndex((e) => e.id === el.id);
                const isTopMost = !isBg && pos === nonBgSortedAsc.length - 1;
                const isBottomMost = !isBg && pos === 0;
                const mkBtn = (
                  onClick: (e: React.MouseEvent) => void,
                  disabled: boolean,
                  title: string,
                  Icon: React.ComponentType<{ className?: string }>,
                  hoverColor: 'emerald' | 'sky',
                ) => {
                  const hover =
                    hoverColor === 'emerald'
                      ? 'hover:text-emerald-400 hover:bg-emerald-500/5'
                      : 'hover:text-sky-400 hover:bg-sky-500/5';
                  return (
                    <button
                      onClick={onClick}
                      disabled={disabled}
                      title={title}
                      className={`p-0.5 rounded-md transition-colors ${
                        disabled ? 'text-white/10 cursor-not-allowed' : `text-white/30 ${hover}`
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </button>
                  );
                };
                return (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`p-2.5 rounded-2xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedElementId === el.id
                        ? 'border-red-500 bg-red-500/[0.08] shadow-sm'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* 左：类型标记 + 名称 */}
                    <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                          isBg
                            ? 'bg-rose-500/15 text-rose-300/70 border border-rose-500/20'
                            : 'bg-white/[0.04] text-white/40'
                        }`}
                      >
                        {isBg ? 'BG' : el.type.slice(0, 4)}
                      </span>
                      <span className="text-xs font-bold text-white/80 truncate">
                        {el.content || el.imageUrl || `[${el.type}]`}
                      </span>
                    </div>

                    {/* 右：排序按钮 + 删除 */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {isBg ? (
                        <span className="px-1 text-white/15" title="背景层已锁定顺序">
                          <Lock className="w-3 h-3" />
                        </span>
                      ) : (
                        <>
                          {mkBtn(
                            (e) => { e.stopPropagation(); reorderFloatingElementLayer(el.id, 'top'); },
                            isTopMost, '置顶（移至所有元素最前）', ChevronsUp, 'emerald',
                          )}
                          {mkBtn(
                            (e) => { e.stopPropagation(); reorderFloatingElementLayer(el.id, 'up'); },
                            isTopMost, '上移一层（向前）', ChevronUp, 'emerald',
                          )}
                          {mkBtn(
                            (e) => { e.stopPropagation(); reorderFloatingElementLayer(el.id, 'down'); },
                            isBottomMost, '下移一层（向后）', ChevronDown, 'sky',
                          )}
                          {mkBtn(
                            (e) => { e.stopPropagation(); reorderFloatingElementLayer(el.id, 'bottom'); },
                            isBottomMost, '置底（移至背景之上）', ChevronsDown, 'sky',
                          )}
                        </>
                      )}
                      <div className="w-px h-4 bg-white/[0.06] mx-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBg) return; // 背景层禁止删除
                          removeFloatingElement(el.id);
                          if (selectedElementId === el.id) setSelectedElementId(null);
                        }}
                        disabled={isBg}
                        className={`p-1 rounded-md transition-colors ${
                          isBg
                            ? 'text-white/10 cursor-not-allowed'
                            : 'text-white/30 hover:text-red-400 hover:bg-red-500/5'
                        }`}
                        title={isBg ? '背景层不可删除' : '删除图层'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
//  ElementPropertyPanel：选中元素的属性面板（独立导出）
//  - 桌面端：渲染在画布右侧
//  - 移动端：由 page.tsx 包裹在底部抽屉中
// ============================================================================
export const ElementPropertyPanel: React.FC = () => {
  const {
    floatingElements,
    selectedElementId,
    updateFloatingElement,
    fontFamily: _globalFont,
    autoColorEnabled,
    autoExtractColors,
  } = useStudioStore();

  const selected = floatingElements.find((e) => e.id === selectedElementId) || null;
  if (!selected) return null;

  const update = (partial: Partial<PlogElement>) => {
    updateFloatingElement(selected.id, partial);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5 text-white/50" />
        元素属性 · {selected.type.toUpperCase()}
      </label>

      {/* 通用：位置/尺寸（背景层锁定整画布，不允许改位置/尺寸） */}
      {selected.type === 'background' ? (
        <div className="text-[10px] font-bold tracking-wide px-3 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300/90 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" />
          <span>背景层已锁定整画布铺满 · 下方可调整背景风格与配色</span>
        </div>
      ) : (
        <Section title="位置 & 尺寸">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="X %" value={selected.x} min={-10} max={110} step={1}
              onChange={(v) => update({ x: v })} />
            <NumberField label="Y %" value={selected.y} min={-10} max={110} step={1}
              onChange={(v) => update({ y: v })} />
          </div>

          {(selected.type === 'image' || selected.type === 'asset') && selected.aspectRatio ? (
            <>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <NumberField
                  label="宽 %"
                  value={selected.widthPct}
                  min={5} max={100} step={1}
                  onChange={(v) => update({ widthPct: v as number | undefined })}
                />
                <NumberField
                  label="高 %（按比例锁定）"
                  value={selected.heightPct}
                  disabled
                  placeholder={`宽 ÷ ${selected.aspectRatio.toFixed(2)}`}
                  onChange={() => { /* 禁用 */ }}
                />
              </div>
              <div className="mt-2 text-[10px] font-bold text-emerald-400/90 tracking-wide flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M20 6 9 17l-5-5"/></svg>
                <span>原图比例已锁定 ·</span>
                <span className="font-mono">{formatRatio(selected.aspectRatio)}</span>
                <span className="opacity-70">（仅允许调整缩放和宽度）</span>
              </div>
              {/* 快捷：占满画布 */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    const ratio = selected.aspectRatio!;
                    // 按画布 100% 宽度铺满，高度按比例自动算出对应的百分比并居中
                    const w = 100;
                    const hPct = 100 / ratio;
                    const y = hPct > 100 ? -(hPct - 100) / 2 : (100 - hPct) / 2;
                    update({
                      widthPct: w,
                      heightPct: hPct,
                      x: 0,
                      y: Math.max(-5, Math.min(98, y)),
                      scale: 1,
                      rotation: 0,
                    });
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all text-[11px] font-black flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/>
                  </svg>
                  占满画布（按宽铺满）
                </button>
                <button
                  onClick={() => {
                    const ratio = selected.aspectRatio!;
                    // 按画布 100% 高度铺满
                    const h = 100;
                    const wPct = 100 * ratio;
                    const x = wPct > 100 ? -(wPct - 100) / 2 : (100 - wPct) / 2;
                    update({
                      widthPct: Math.min(100, wPct),
                      heightPct: h,
                      x: Math.max(-5, Math.min(98, x)),
                      y: 0,
                      scale: 1,
                      rotation: 0,
                    });
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all text-[11px] font-black flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M9 4h6M9 20h6M4 9v6M20 9v6"/>
                  </svg>
                  占满画布（按高铺满）
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <NumberField label="宽 %" value={selected.widthPct} min={2} max={100} step={1}
                nullable placeholder="自动"
                onChange={(v) => update({ widthPct: v as number | undefined })} />
              <NumberField label="高 %" value={selected.heightPct} min={2} max={100} step={1}
                nullable placeholder="自动"
                onChange={(v) => update({ heightPct: v as number | undefined })} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2">
            <NumberField label="缩放" value={(selected.scale ?? 1) * 100} min={10} max={300} step={5}
              onChange={(v) => update({ scale: (v ?? 100) / 100 })} />
            <NumberField label="旋转°" value={selected.rotation ?? 0} min={-180} max={180} step={1}
              onChange={(v) => update({ rotation: v ?? 0 })} />
          </div>
        </Section>
      )}

      {/* ===== 背景元素专属：风格 / 颜色 / 渐变 / 模糊图 ===== */}
      {selected.type === 'background' && (
        <>
          <Section title="背景风格">
            <div className="flex items-center gap-2">
              {(['gradient', 'color', 'blur'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ bgVariant: t })}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    (selected.bgVariant ?? 'gradient') === t
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {t === 'gradient' ? '环境渐变' : t === 'color' ? '纯色' : '图片高斯模糊'}
                </button>
              ))}
            </div>
          </Section>

          {(selected.bgVariant ?? 'gradient') === 'gradient' && (
            <Section title="渐变色">
              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label="起始色"
                  value={selected.gradientStart || '#cbd5e1'}
                  onChange={(v) => update({ gradientStart: v })}
                />
                <ColorField
                  label="结束色"
                  value={selected.gradientEnd || '#94a3b8'}
                  onChange={(v) => update({ gradientEnd: v })}
                />
              </div>
            </Section>
          )}

          {(selected.bgVariant ?? 'gradient') === 'color' && (
            <Section title="纯色背景">
              <ColorField
                label="背景色"
                value={selected.bgColor || '#c9d1d9'}
                onChange={(v) => update({ bgColor: v })}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ bgColor: c })}
                    className="w-7 h-7 rounded-full border-2 border-white/10 shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Section>
          )}

          {(selected.bgVariant ?? 'gradient') === 'blur' && (
            <Section title="高斯模糊图源">
              <TextField
                label="模糊图片URL"
                value={selected.imageUrl || ''}
                placeholder="/screenshot.png 或 https://..."
                onChange={(v) => update({ imageUrl: v })}
              />
              <p className="mt-2 text-[10px] text-white/40 font-medium leading-relaxed">
                留空默认使用图库第一张主图作为模糊底色。
              </p>
            </Section>
          )}
        </>
      )}

      {/* 图片 / asset 专属 */}
      {(selected.type === 'image' || selected.type === 'asset') && (
        <>
          <Section title="图片">
            <ImagePickerField
              value={selected.imageUrl || ''}
              placeholder="/screenshot.png 或 https://..."
              onChange={(v) => update({ imageUrl: v })}
              onFileLoaded={(url) => {
                // 更换图片（拖放/点击）后自动基于新图提色
                if (autoColorEnabled) autoExtractColors(url);
              }}
            />
            <SelectField
              label="填充模式"
              value={selected.objectFit || 'contain'}
              options={[
                { value: 'contain', label: '包含(完整显示) contain' },
                { value: 'cover', label: '覆盖(裁剪留白) cover' },
                { value: 'fill', label: '拉伸(变形) fill' },
                { value: 'none', label: '原始 none' },
              ]}
              onChange={(v) => update({ objectFit: v as PlogElement['objectFit'] })}
            />
          </Section>
          <Section title="外观">
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="圆角(px)" value={selected.borderRadius ?? 0} min={0} max={120} step={1}
                onChange={(v) => update({ borderRadius: v })} />
              <NumberField label="边框(px)" value={selected.borderWidth ?? 0} min={0} max={20} step={1}
                onChange={(v) => update({ borderWidth: v })} />
            </div>
            <SegmentField
              label="阴影等级"
              value={(selected.shadowLevel ?? 2) as 0 | 1 | 2 | 3 | 4}
              options={SHADOW_OPTIONS}
              onChange={(v) => update({ shadowLevel: v })}
            />
            {selected.borderWidth ? (
              <ColorField
                label="边框颜色"
                value={selected.borderColor || '#000000'}
                onChange={(v) => update({ borderColor: v })}
              />
            ) : null}
            <ColorField
              label="背景色(无图时)"
              value={selected.bgColor || 'transparent'}
              onChange={(v) => update({ bgColor: v })}
            />
          </Section>
        </>
      )}

      {/* 文字类：统一文本框（text/longtext 共用，均支持 Markdown 渲染） */}
      {(selected.type === 'text' || selected.type === 'longtext') && (
        <>
          <Section title="内容">
            <textarea
              className="w-full min-h-[108px] p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/85 text-xs focus:outline-none focus:border-white/20 resize-y font-mono leading-relaxed"
              value={selected.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="支持 Markdown：## 标题 / **粗体** / - 列表 / > 引用"
            />
            <CheckboxField
              label="启用 Markdown 渲染"
              checked={selected.markdownEnabled ?? true}
              onChange={(v) => update({ markdownEnabled: v })}
            />
          </Section>
          <Section title="字体排版">
            <SelectField
              label="字体"
              value={selected.fontFamily || _globalFont}
              options={FONTS.map((f) => ({ value: f.id, label: f.name }))}
              onChange={(v) => update({ fontFamily: v })}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <NumberField
                label="字号(px)"
                value={selected.fontSize ?? 18}
                min={8} max={128} step={1}
                onChange={(v) => update({ fontSize: v })}
              />
              <SelectField
                label="字重"
                value={String(selected.fontWeight ?? 700)}
                options={FONT_WEIGHTS.map((w) => ({ value: String(w.value), label: w.label }))}
                onChange={(v) => update({ fontWeight: Number(v) as PlogElement['fontWeight'] })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <NumberField
                label="字距(em)"
                value={Math.round((selected.letterSpacing ?? 0) * 100)}
                min={-50} max={200} step={1}
                onChange={(v) => update({ letterSpacing: (v ?? 0) / 100 })}
              />
              <NumberField
                label="行高(×)"
                value={Math.round((selected.lineHeight ?? 1.5) * 10)}
                min={8} max={40} step={1}
                onChange={(v) => update({ lineHeight: (v ?? 15) / 10 })}
              />
            </div>
            <div className="mt-2">
              <SegmentField
                label="对齐"
                value={selected.textAlign ?? 'left'}
                options={[
                  { value: 'left', label: <AlignLeft className="w-3.5 h-3.5" /> },
                  { value: 'center', label: <AlignCenter className="w-3.5 h-3.5" /> },
                  { value: 'right', label: <AlignRight className="w-3.5 h-3.5" /> },
                ]}
                onChange={(v) => update({ textAlign: v as PlogElement['textAlign'] })}
              />
            </div>
          </Section>
          <Section title="颜色">
            <ColorField
              label="文字色"
              value={selected.color || '#111827'}
              onChange={(v) => update({ color: v })}
            />
            <ColorField
              label="背景色"
              value={selected.bgColor || 'transparent'}
              onChange={(v) => update({ bgColor: v })}
            />
            {selected.type === 'longtext' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <NumberField
                  label="圆角(px)"
                  value={selected.borderRadius ?? 16}
                  min={0} max={80} step={1}
                  onChange={(v) => update({ borderRadius: v })}
                />
                <SegmentField
                  label="阴影"
                  value={(selected.shadowLevel ?? 1) as 0 | 1 | 2 | 3 | 4}
                  options={SHADOW_OPTIONS}
                  onChange={(v) => update({ shadowLevel: v })}
                />
              </div>
            )}
          </Section>
        </>
      )}

      {/* 装饰类：badge / sticker / annotation / tag / timestamp */}
      {(selected.type === 'badge' || selected.type === 'sticker' || selected.type === 'annotation' || selected.type === 'tag' || selected.type === 'timestamp') && (
        <>
          <Section title="内容">
            {selected.type === 'timestamp' ? (
              <>
                <FieldLabel>日期（留空 = 今天）</FieldLabel>
                <input
                  type="date"
                  value={selected.content || ''}
                  onChange={(e) => update({ content: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/85 text-xs focus:outline-none focus:border-white/20"
                />
                <button
                  onClick={() => update({ content: '' })}
                  className="mt-2 w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.06] transition-all text-[11px] font-bold"
                >
                  重置为今天
                </button>
              </>
            ) : (
              <TextField
                label="内容"
                value={selected.content}
                onChange={(v) => update({ content: v })}
              />
            )}
            {selected.type === 'badge' && (
              <TextField
                label="徽章编号"
                value={selected.badgeNumber || ''}
                placeholder="例：#1 / 01"
                onChange={(v) => update({ badgeNumber: v })}
              />
            )}
          </Section>
          <Section title="外观">
            <ColorField label="文字色" value={selected.color || '#FFFFFF'} onChange={(v) => update({ color: v })} />
            {selected.type !== 'timestamp' && (
              <ColorField
                label={selected.type === 'sticker' ? '荧光色' : '背景色'}
                value={selected.bgColor || (selected.type === 'tag' ? 'transparent' : '#ff2442')}
                onChange={(v) => update({ bgColor: v })}
              />
            )}
            {(selected.type === 'annotation' || selected.type === 'tag') && (
              <ColorField label="边框色" value={selected.borderColor || 'rgba(0,0,0,0.08)'} onChange={(v) => update({ borderColor: v })} />
            )}
            {selected.type === 'annotation' && (
              <SegmentField
                label="尾巴方向"
                value={selected.tailDirection ?? 'bottom-left'}
                options={[
                  { value: 'bottom-left', label: '↙ 左下' },
                  { value: 'bottom-right', label: '↘ 右下' },
                  { value: 'top-left', label: '↖ 左上' },
                  { value: 'top-right', label: '↗ 右上' },
                ]}
                onChange={(v) => update({ tailDirection: v as PlogElement['tailDirection'] })}
              />
            )}
            {selected.type === 'tag' && (
              <NumberField
                label="边框(px)"
                value={selected.borderWidth ?? 1}
                min={0} max={6} step={1}
                onChange={(v) => update({ borderWidth: v })}
              />
            )}
            {(selected.type === 'badge' || selected.type === 'timestamp') && (
              <SelectField
                label="字体"
                value={selected.fontFamily || _globalFont}
                options={FONTS.map((f) => ({ value: f.id, label: f.name }))}
                onChange={(v) => update({ fontFamily: v })}
              />
            )}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <NumberField
                label="字号(px)"
                value={selected.fontSize ?? 12}
                min={8} max={64} step={1}
                onChange={(v) => update({ fontSize: v })}
              />
              <SelectField
                label="字重"
                value={String(selected.fontWeight ?? 700)}
                options={FONT_WEIGHTS.map((w) => ({ value: String(w.value), label: w.label }))}
                onChange={(v) => update({ fontWeight: Number(v) as PlogElement['fontWeight'] })}
              />
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

// ============================================================================
//  通用小组件（避免引 UI 库，保持零依赖）
// ============================================================================

// 工具：把 aspectRatio (w/h，例如 1.7778) 转成用户友好的宽高比字符串，例如 "16:9"
function formatRatio(ratio: number): string {
  if (!ratio || ratio <= 0) return '?';
  // 常见比例快速匹配
  const presets: { r: number; label: string }[] = [
    { r: 9 / 16, label: '9:16' },
    { r: 3 / 4, label: '3:4' },
    { r: 4 / 5, label: '4:5' },
    { r: 2 / 3, label: '2:3' },
    { r: 1, label: '1:1' },
    { r: 3 / 2, label: '3:2' },
    { r: 5 / 4, label: '5:4' },
    { r: 4 / 3, label: '4:3' },
    { r: 16 / 9, label: '16:9' },
    { r: 16 / 10, label: '16:10' },
    { r: 21 / 9, label: '21:9' },
  ];
  for (const p of presets) {
    if (Math.abs(ratio - p.r) / p.r < 0.015) return p.label;
  }
  // 未命中常见比例：使用 gcd 化简
  const w = Math.round(ratio * 100);
  const h = 100;
  const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
  const gcdv = g(w, h);
  if (gcdv > 0) return `${Math.round(w / gcdv)}:${Math.round(h / gcdv)}`;
  return ratio.toFixed(2);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 space-y-2">
      <div className="text-[10px] font-black text-white/40 tracking-widest uppercase">{title}</div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold text-white/50 mb-1 tracking-wide">{children}</label>;
}

function TextField({ label, value, onChange, placeholder }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/85 text-xs focus:outline-none focus:border-white/20"
      />
    </div>
  );
}

/**
 * 图片选择字段：拖放 / 点击选文件 / 手动粘贴 URL 三合一
 * - 拖拽图片文件到框内 → 读为 blob URL → onChange
 * - 点击框触发 <input type=file>
 * - 下方 URL 输入框可粘贴远程链接（https://...）或本地路径
 * - 已有图片时左上角显示缩略图
 */
function ImagePickerField({
  value,
  onChange,
  onFileLoaded,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  /** 仅文件加载（拖放/点击）成功时触发；URL 输入不触发 */
  onFileLoaded?: (url: string) => void;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onChange(url);
    // 文件加载成功 → 通知父组件（用于触发提色）
    onFileLoaded?.(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) readFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  return (
    <div className="space-y-2">
      {/* 拖放 / 点击区 */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex items-center gap-3 w-full h-24 px-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all group ${
          dragOver
            ? 'border-red-400 bg-red-500/10'
            : 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.25] hover:bg-white/[0.04]'
        }`}
      >
        {/* 缩略图 / 占位图标 */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.08] bg-white/[0.04] flex items-center justify-center">
          {value ? (
            <img
              src={value}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-white/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-white/60 group-hover:text-white/85 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{dragOver ? '松开以上传' : '点击或拖放图片到此'}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-white/35 truncate">
            {value ? '已加载 · 拖放新图可替换' : '支持 PNG / JPG / WebP / GIF / SVG'}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 手动粘贴 URL */}
      <div>
        <FieldLabel>
          <span className="inline-flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            图片 URL
          </span>
        </FieldLabel>
        <input
          type="text"
          value={value}
          placeholder={placeholder || '/screenshot.png 或 https://...'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/85 text-xs focus:outline-none focus:border-white/20"
        />
      </div>
    </div>
  );
}

function NumberField({
  label, value, onChange, min, max, step, nullable, placeholder, disabled,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number; max?: number; step?: number;
  nullable?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  // 本地字符串状态：输入过程中允许任意中间值（如"1"），避免 min 钳制导致"第一位永远是8"
  // 仅在失焦时钳制到 [min, max] 范围
  const [localRaw, setLocalRaw] = useState<string | null>(null);
  const isEditing = localRaw !== null;

  const commit = (raw: string) => {
    if (raw === '' && nullable) {
      onChange(undefined);
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      let r = n;
      if (min !== undefined) r = Math.max(min, r);
      if (max !== undefined) r = Math.min(max, r);
      onChange(r);
    }
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        disabled={disabled}
        value={isEditing ? localRaw : (value === undefined ? '' : value)}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const raw = e.target.value;
          setLocalRaw(raw);
          // 实时提交（不钳制），让 store 跟随更新；钳制留给 onBlur
          if (raw === '' && nullable) {
            onChange(undefined);
          } else {
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }
        }}
        onBlur={(e) => {
          commit(e.target.value);
          setLocalRaw(null);
        }}
        className={[
          'w-full px-2.5 py-1.5 rounded-xl text-xs focus:outline-none transition-colors',
          disabled
            ? 'bg-white/[0.02] border border-white/[0.06] text-white/40 cursor-not-allowed'
            : 'bg-white/[0.04] border border-white/[0.06] text-white/85 focus:border-white/20',
        ].join(' ')}
      />
    </div>
  );
}

function ColorField({ label, value, onChange }:
  { label: string; value: string; onChange: (v: string) => void }) {
  const isTransparent = value === 'transparent' || value === '';
  // 用于原生 color input 的回退颜色：有值就用，否则占位白
  const hexValue = value.startsWith('#') && value.length >= 7
    ? value
    : (value.startsWith('rgba(') || value.startsWith('rgb('))
      ? '#ffffff'
      : '#ffffff';
  return (
    <div className="mt-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        {/* 拾色器 + 透明棋盘格预览叠加 */}
        <div className="relative h-[34px] w-[44px]">
          {/* 棋盘格底（表示透明） */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-xl border border-white/[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              backgroundColor: '#222',
            }}
          />
          <input
            type="color"
            value={hexValue}
            onChange={(e) => onChange(e.target.value)}
            className={`absolute inset-0 h-[34px] w-[44px] rounded-xl cursor-pointer ${
              isTransparent ? 'opacity-0' : 'bg-transparent border border-white/[0.06]'
            }`}
            title={isTransparent ? '点击选择颜色（当前为透明）' : '点击选择颜色'}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB / rgba(...) / transparent"
          className="flex-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/85 text-xs focus:outline-none focus:border-white/20 font-mono"
        />
        <button
          type="button"
          onClick={() => onChange('transparent')}
          className={`shrink-0 px-2.5 h-[34px] rounded-xl text-[11px] font-bold transition-colors border ${
            isTransparent
              ? 'bg-red-500/15 border-red-500/40 text-red-400'
              : 'bg-white/[0.04] border-white/[0.06] text-white/55 hover:text-white/80 hover:bg-white/[0.08]'
          }`}
        >
          透明
        </button>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }:
  { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="mt-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/85 text-xs focus:outline-none focus:border-white/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-neutral-900 text-white">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

type SegmentOption<V extends string | number> = { value: V; label: React.ReactNode };
function SegmentField<T extends string | number>({ label, value, options, onChange }:
  { label: string; value: T; options: SegmentOption<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="mt-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl p-1 bg-white/[0.03] border border-white/[0.06]">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              onClick={() => onChange(o.value)}
              className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center ${
                active ? 'bg-white/15 text-white shadow-sm' : 'text-white/55 hover:text-white/80'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxField({ label, checked, onChange }:
  { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-2 flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-red-500"
      />
      <span className="text-xs font-bold text-white/70">{label}</span>
    </label>
  );
}

// 给 Bold 图标导入的引用防止 TS unused 报错（保留用于后续扩展图标按钮式字重）
export const _weightIcon = Bold;

'use client';

import React, { useState } from 'react';
import {
  useStudioStore,
  resolveStudioThemeColors,
} from '../../store/useStudioStore';
import { ExportSize, PlogElement } from '../../types';
import { FONTS } from '../../constants';
import {
  Ratio,
  Check,
  Plus,
  Component,
  ArrowLeft,
  Trash2,
  Calendar,
  Type,
  MessageSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import {
  STUDIO_WIDGETS,
  WIDGET_CATEGORIES,
  StudioWidgetPreset,
  WidgetCategory,
} from './widgetsConfig';

export const TemplateGallery: React.FC = () => {
  const {
    aspectRatio,
    setAspectRatio,
    customWidth,
    customHeight,
    setCustomSize,
    floatingElements,
    selectedElementId,
    setSelectedElementId,
    updateFloatingElement,
    removeFloatingElement,
    fontFamily: globalFont,
    addFloatingElements,
  } = useStudioStore();

  const storeState = useStudioStore();
  const themeColors = resolveStudioThemeColors(storeState);

  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // 检查当前是否有选中的复合控件
  const selectedElement = floatingElements.find((e) => e.id === selectedElementId) || null;
  const isWidgetSelected =
    selectedElement &&
    (selectedElement.type === 'timestamp' ||
      selectedElement.type === 'headline' ||
      selectedElement.type === 'memo');

  const filteredWidgets =
    selectedCategory === 'all'
      ? STUDIO_WIDGETS
      : STUDIO_WIDGETS.filter((w) => w.category === selectedCategory);

  const handleAddWidget = (widget: StudioWidgetPreset) => {
    const nextZ = floatingElements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
    const uidGenerator = () => Math.random().toString(36).slice(2, 11);

    const elementsToAdd = widget.createElements({
      nextZ,
      colors: themeColors,
      fontFamily: globalFont,
      generateId: uidGenerator,
    });

    addFloatingElements(elementsToAdd);
    setJustAddedId(widget.id);
    setTimeout(() => {
      setJustAddedId((curr) => (curr === widget.id ? null : curr));
    }, 1000);
  };

  const updateSelected = (patch: Partial<PlogElement>) => {
    if (!selectedElement) return;
    updateFloatingElement(selectedElement.id, patch);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================
          模式 1：已选中某个控件时 → 渲染该控件的【独立字段组配置面板】
         ============================================================ */}
      {isWidgetSelected && selectedElement ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 字段组顶部返回条 */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <button
              onClick={() => setSelectedElementId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回控件库</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                {selectedElement.type === 'timestamp'
                  ? '时间戳控件'
                  : selectedElement.type === 'headline'
                  ? '主副标题控件'
                  : '便签卡片控件'}
              </span>
              <button
                onClick={() => {
                  removeFloatingElement(selectedElement.id);
                  setSelectedElementId(null);
                }}
                className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="删除此控件"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ==================== 1. 时间戳控件专属字段组 ==================== */}
          {selectedElement.type === 'timestamp' && (
            <div className="space-y-4">
              {/* 样式变体选择 */}
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  排版风格 · Style Variant
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'magazine', label: '杂志经典' },
                      { id: 'checkin', label: '打卡日记' },
                      { id: 'polaroid', label: '拍立得胶片' },
                      { id: 'minimal', label: '极简数字' },
                      { id: 'stamp', label: '复古印章' },
                    ] as const
                  ).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateSelected({ timestampStyle: style.id })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all text-center border ${
                        (selectedElement.timestampStyle || 'magazine') === style.id
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-white/[0.03] text-white/60 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 日期字段 */}
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  日期字段（留空自动跟随今天）
                </label>
                <input
                  type="date"
                  value={selectedElement.content || ''}
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-xs font-mono focus:outline-none focus:border-red-500/50"
                />
                <button
                  onClick={() => updateSelected({ content: '' })}
                  className="mt-1.5 w-full py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-all text-[11px] font-bold"
                >
                  重置为今天实时日期
                </button>
              </div>

              {/* 辅助标语/编号 */}
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  辅助标语 / 胶片标签
                </label>
                <input
                  type="text"
                  value={selectedElement.subText || ''}
                  placeholder={
                    selectedElement.timestampStyle === 'checkin'
                      ? '例：REC · DAILY'
                      : selectedElement.timestampStyle === 'polaroid'
                      ? '例：PHOTO LOG'
                      : '例：WEEKEND VIBE'
                  }
                  onChange={(e) => updateSelected({ subText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-xs focus:outline-none focus:border-red-500/50"
                />
              </div>

              {/* 开关选项：显示年份、显示星期 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateSelected({ showYear: selectedElement.showYear === false ? true : false })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    selectedElement.showYear !== false
                      ? 'border-white/30 bg-white/[0.08] text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                  }`}
                >
                  <span>显示年份</span>
                  <span className={`w-2 h-2 rounded-full ${selectedElement.showYear !== false ? 'bg-emerald-400' : 'bg-white/20'}`} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      showWeekday: selectedElement.showWeekday === false ? true : false,
                    })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    selectedElement.showWeekday !== false
                      ? 'border-white/30 bg-white/[0.08] text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                  }`}
                >
                  <span>显示星期</span>
                  <span className={`w-2 h-2 rounded-full ${selectedElement.showWeekday !== false ? 'bg-emerald-400' : 'bg-white/20'}`} />
                </button>
              </div>

              {/* 字体与字号 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    字体选择
                  </label>
                  <select
                    value={selectedElement.fontFamily || globalFont}
                    onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/85 text-xs font-bold focus:outline-none focus:border-red-500/50"
                  >
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    基准字号 (px)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={48}
                    value={selectedElement.fontSize ?? 14}
                    onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/85 text-xs font-bold text-center focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* 颜色配置 */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    文字主色
                  </label>
                  <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
                    <input
                      type="color"
                      value={selectedElement.color || '#111827'}
                      onChange={(e) => updateSelected({ color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-white/70 truncate uppercase">
                      {selectedElement.color || '#111827'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    强调/徽标色
                  </label>
                  <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
                    <input
                      type="color"
                      value={selectedElement.accentColor || '#ff2442'}
                      onChange={(e) => updateSelected({ accentColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-white/70 truncate uppercase">
                      {selectedElement.accentColor || '#ff2442'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. 主副标题控件专属字段组 ==================== */}
          {selectedElement.type === 'headline' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  主标题文案
                </label>
                <textarea
                  rows={2}
                  value={selectedElement.content || ''}
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs font-bold focus:outline-none focus:border-red-500/50 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  副标题说明文案
                </label>
                <textarea
                  rows={2}
                  value={selectedElement.subtitle || ''}
                  onChange={(e) => updateSelected({ subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-xs focus:outline-none focus:border-red-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* 排版对齐与分割线 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    排版对齐
                  </label>
                  <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
                    {(['left', 'center', 'right'] as const).map((align) => {
                      const Icon =
                        align === 'left'
                          ? AlignLeft
                          : align === 'center'
                          ? AlignCenter
                          : AlignRight;
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateSelected({ textAlign: align })}
                          className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${
                            (selectedElement.textAlign || 'left') === align
                              ? 'bg-white text-black shadow'
                              : 'text-white/40 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    装饰分割线
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected({ showLine: selectedElement.showLine === false ? true : false })
                    }
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                      selectedElement.showLine !== false
                        ? 'border-white/30 bg-white/[0.08] text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                    }`}
                  >
                    <span>装饰细线</span>
                    <span className={`w-2 h-2 rounded-full ${selectedElement.showLine !== false ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  </button>
                </div>
              </div>

              {/* 字体与主字号 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    字体
                  </label>
                  <select
                    value={selectedElement.fontFamily || globalFont}
                    onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/85 text-xs font-bold focus:outline-none"
                  >
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    主标题字号 (px)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={60}
                    value={selectedElement.fontSize ?? 28}
                    onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/85 text-xs font-bold text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* 颜色配置 */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    主标题颜色
                  </label>
                  <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
                    <input
                      type="color"
                      value={selectedElement.titleColor || selectedElement.color || '#111827'}
                      onChange={(e) =>
                        updateSelected({ titleColor: e.target.value, color: e.target.value })
                      }
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-white/70 truncate uppercase">
                      {selectedElement.titleColor || selectedElement.color || '#111827'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    副标题颜色
                  </label>
                  <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
                    <input
                      type="color"
                      value={selectedElement.subtitleColor || '#44403C'}
                      onChange={(e) => updateSelected({ subtitleColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-white/70 truncate uppercase">
                      {selectedElement.subtitleColor || '#44403C'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. 便签卡片控件专属字段组 ==================== */}
          {selectedElement.type === 'memo' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  徽标标语
                </label>
                <input
                  type="text"
                  value={selectedElement.badgeText || ''}
                  placeholder="例：NOTE / 01 灵感"
                  onChange={(e) => updateSelected({ badgeText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs font-bold focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                  便签正文
                </label>
                <textarea
                  rows={3}
                  value={selectedElement.content || ''}
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-red-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* 颜色配置 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    便签底色
                  </label>
                  <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
                    <input
                      type="color"
                      value={selectedElement.bgColor || '#ffffff'}
                      onChange={(e) => updateSelected({ bgColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-white/70 truncate uppercase">
                      {selectedElement.bgColor || '#FFFFFF'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                    文字颜色
                  </label>
                  <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
                    <input
                      type="color"
                      value={selectedElement.color || '#18181b'}
                      onChange={(e) => updateSelected({ color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-white/70 truncate uppercase">
                      {selectedElement.color || '#18181B'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================
            模式 2：未选中控件时 → 渲染【精选控件库列表】
           ============================================================ */
        <div className="space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
              <span className="w-8 h-px bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Component className="w-3.5 h-3.5 text-red-400" />
                <span>Widgets · 复合控件库</span>
              </span>
            </div>
            <p className="text-[11px] text-white/40 pl-10 leading-relaxed">
              不可拆分 · 整体拖拽 · 字段组驱动 · 宁缺毋滥
            </p>
          </div>

          {/* 分类筛选器 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {WIDGET_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* 控件列表卡片流 */}
          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {filteredWidgets.map((widget) => {
              const isJustAdded = justAddedId === widget.id;
              return (
                <div
                  key={widget.id}
                  onClick={() => handleAddWidget(widget)}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 ${
                    isJustAdded
                      ? 'border-emerald-500/50 bg-emerald-500/[0.06] ring-1 ring-emerald-500/30'
                      : 'border-white/[0.07]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-red-400 transition-colors">
                        {widget.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/60">
                        {widget.tag}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddWidget(widget);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 transition-all flex items-center gap-1 ${
                        isJustAdded
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-white/[0.06] text-white/70 group-hover:bg-white group-hover:text-black'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>已添加</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>添加</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 微型实时预览框 */}
                  <div className="p-3 rounded-xl bg-black/35 border border-white/[0.05] mb-2 min-h-[52px] flex items-center">
                    {widget.renderPreview(themeColors)}
                  </div>

                  <p className="text-[10px] text-white/40 leading-relaxed">
                    {widget.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          画布比例选择（始终保留在底部，便于快速调整整体尺寸）
         ============================================================ */}
      <div className="pt-3 border-t border-white/[0.06]">
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

export const WidgetGallery = TemplateGallery;

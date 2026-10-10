'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { FONTS } from '../../constants';
import { PlogElement as PlogElementType } from '../../types';
import { PlogElement } from '../plog/PlogElement';
import { parseRgbColor, getColorLuminance } from '../../lib/svgRecolor';
import { SlidersHorizontal } from 'lucide-react';

interface StudioCanvasProps {
  onEditElement?: () => void;
}

export const StudioCanvas = forwardRef<HTMLDivElement, StudioCanvasProps>(({ onEditElement }, ref) => {
  const {
    aspectRatio,
    customWidth,
    customHeight,
    bgType: _globalBgType,
    bgColor: _globalBgColor,
    gradientStart: _globalGradientStart,
    gradientEnd: _globalGradientEnd,
    bgTexture: _globalBgTexture,
    textureOpacity: _globalTextureOpacity,
    textureBlendMode: _globalTextureBlendMode,
    textureTarget: _globalTextureTarget,
    textureSize: _globalTextureSize,
    images,
    fontFamily,
    extractedColors,
    floatingElements,
    selectedElementId,
    setSelectedElementId,
    updateFloatingElement,
    removeFloatingElement,
    detectImageRatio,
    applyTemplateDefaults,
    addFloatingElement,
  } = useStudioStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const didInitRef = useRef(false);

  const fontConfig = FONTS.find((f) => f.id === fontFamily) || FONTS[0];
  const mainImage = images[0]?.url || '/screenshot.png';

  // —— 背景：优先读取 background 元素（用户可像操作元素一样选中编辑属性）——
  const bgElement = floatingElements.find((e) => e.type === 'background');
  const effBgType = bgElement?.bgVariant ?? _globalBgType;
  const effBgColor = bgElement?.bgColor ?? _globalBgColor;
  const effGradientStart = bgElement?.gradientStart ?? _globalGradientStart;
  const effGradientEnd = bgElement?.gradientEnd ?? _globalGradientEnd;
  const effTextureUrl = bgElement?.textureUrl !== undefined ? bgElement.textureUrl : _globalBgTexture;
  const effTextureOpacity = bgElement?.textureOpacity ?? _globalTextureOpacity ?? 0.6;
  const effTextureBlendMode = bgElement?.textureBlendMode ?? _globalTextureBlendMode ?? 'normal';
  const effTextureTarget = bgElement?.textureTarget ?? _globalTextureTarget ?? 'all';
  const effTextureSize = bgElement?.textureSize !== undefined ? bgElement.textureSize : (_globalTextureSize ?? 320);
  // 浮动元素：过滤掉 background（背景作为容器底层已经单独渲染，不参与 PlogElement 循环）
  const floatingOnly = floatingElements.filter((e) => e.type !== 'background');

  // 首次挂载时，如果画布为空 → 用当前 templateId 注入一套默认好看的"样例元素组合"
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    applyTemplateDefaults({ preserveManual: true });

    // —— 保底：如果 floatingElements 里缺少 background 元素（用户手动加了元素但模板没创建背景/读档没带背景）→ 补建一个
    //    背景层是"可选中的独立元素"体验的核心前提，缺失就无法通过点空白选中它
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const state = useStudioStore.getState();
    if (!state.floatingElements.some((e) => e.type === 'background')) {
      const bgEl: PlogElementType = {
        id: `el-${Math.random().toString(36).slice(2, 11)}`,
        type: 'background',
        content: '画布背景',
        x: 0,
        y: 0,
        zIndex: 0,
        widthPct: 100,
        heightPct: 100,
        bgVariant: state.bgType,
        bgColor: state.bgColor,
        gradientStart: state.gradientStart,
        gradientEnd: state.gradientEnd,
        imageUrl: state.images[0]?.url || '',
        textureUrl: state.bgTexture || '',
        textureOpacity: state.textureOpacity ?? 0.6,
        textureBlendMode: state.textureBlendMode ?? 'normal',
      };
      state.addFloatingElement(bgEl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 首次挂载或主图变化时检测比例（保留旧字段 imageAspectRatio 的填充）
  useEffect(() => {
    if (mainImage) detectImageRatio(mainImage);
  }, [mainImage, detectImageRatio]);

  let containerStyle: React.CSSProperties = {};
  let aspectClass = 'aspect-[3/4] max-w-[480px]';

  if (aspectRatio === '1:1') aspectClass = 'aspect-[1/1] max-w-[500px]';
  if (aspectRatio === '9:16') aspectClass = 'aspect-[9/16] max-w-[420px]';
  if (aspectRatio === '4:3') aspectClass = 'aspect-[4/3] max-w-[580px]';
  if (aspectRatio === '16:9') aspectClass = 'aspect-[16/9] max-w-[620px]';
  if (aspectRatio === '3:2') aspectClass = 'aspect-[3/2] max-w-[580px]';
  if (aspectRatio === 'custom') {
    aspectClass = 'max-w-[600px]';
    containerStyle.aspectRatio = `${customWidth} / ${customHeight}`;
  }

  let bgStyle: React.CSSProperties = {};
  if (effBgType === 'color') {
    bgStyle.backgroundColor = effBgColor;
  } else if (effBgType === 'gradient') {
    bgStyle.background = `linear-gradient(135deg, ${effGradientStart} 0%, ${effGradientEnd} 100%)`;
  }
  // blur 模式的底图：优先 background 元素的 imageUrl，否则取主图
  const blurImageSrc = bgElement?.imageUrl || mainImage;

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden preview-shadow select-none mx-auto`}
      style={containerStyle}
    >
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`w-full h-full relative overflow-hidden transition-all duration-300 ${
          bgElement && selectedElementId === bgElement.id
            ? 'ring-2 ring-red-500 ring-inset' // 选中背景元素时，画布容器加选中描边提示
            : ''
        }`}
        style={bgStyle}
        // 点击画布空白区域 → 选中背景层（若存在），否则取消选中
        // PlogElement 内的 onClick 有 stopPropagation，所以点元素不会触发这里
        onClick={() => setSelectedElementId(bgElement?.id ?? null)}
        onDoubleClick={() => {
          if (bgElement) {
            setSelectedElementId(bgElement.id);
            onEditElement?.();
          }
        }}
      >
        {/* 背景被选中时：画布中央下方浮动出现配置胶囊，便于移动端及触屏一键呼出属性抽屉 */}
        {bgElement && selectedElementId === bgElement.id && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-red-500/50 shadow-2xl shadow-black/80 pointer-events-auto select-none">
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-black tracking-wide">画布背景</span>
              {effTextureUrl && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-red-300 font-bold border border-white/10">
                  {effTextureTarget === 'bg' ? '仅背景颗粒' : '全图颗粒'}
                </span>
              )}
            </div>
            <div className="h-3 w-px bg-white/20" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditElement?.();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white text-[10px] font-black transition-all shadow-md"
              title="打开背景配置抽屉 (材质/颜色/渐变)"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>配置背景</span>
            </button>
          </div>
        )}
        {effBgType === 'blur' && blurImageSrc && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={blurImageSrc}
              alt="Bg Blur"
              className="w-full h-full object-cover blur-2xl scale-125 opacity-60"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        {/* 背景专享材质遮罩：当设置仅针对背景 (textureTarget === 'bg') 时，渲染在背景图层内部/浮动元素下方 */}
        {effTextureUrl && effTextureTarget === 'bg' ? (
          <>
            <div
              className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
              style={{
                backgroundImage: `url("${effTextureUrl}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: `${effTextureSize}px`,
                mixBlendMode: (effTextureBlendMode || 'normal') as any,
                opacity: Math.min(1, effTextureOpacity * 1.4),
                filter: 'contrast(120%)',
              }}
            />
            {/* 浅色底色高光反相补偿（确保在纯白/浅灰底色上纤维颗粒依然清晰可见） */}
            {((effTextureBlendMode || 'normal') === 'normal' ||
              effTextureBlendMode === 'overlay' ||
              effTextureBlendMode === 'soft-light') && (
              <div
                className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
                style={{
                  backgroundImage: `url("${effTextureUrl}")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: `${effTextureSize}px`,
                  filter: 'invert(1) contrast(160%)',
                  mixBlendMode: 'multiply',
                  opacity: Math.min(1, effTextureOpacity * 1.1),
                }}
              />
            )}
          </>
        ) : null}

        {/* =============================================================
            画布 = 一组可拖拽的自由元素（background 除外，已作为容器底层渲染）
           ============================================================= */}
        {(() => {
          const effCanvasBg = effBgType === 'color' ? effBgColor : effGradientStart;
          const canvasTextColor =
            floatingOnly.find((e) => (e.type === 'text' || e.type === 'longtext') && e.color)?.color ||
            extractedColors?.textPrimary ||
            extractedColors?.textSecondary ||
            (getColorLuminance(parseRgbColor(effCanvasBg) || [15, 23, 42]) < 0.45 ? '#F7F3EC' : '#111827');

          return floatingOnly.map((el) => (
            <PlogElement
              key={el.id}
              element={el}
              containerRef={containerRef}
              canvasBg={effCanvasBg}
              canvasTextColor={canvasTextColor}
              fontClassName={fontConfig.className}
              selectedId={selectedElementId}
              extractedColors={extractedColors}
              onEditElement={onEditElement}
              actions={{
                setSelectedElementId,
                updateElement: updateFloatingElement,
                removeElement: removeFloatingElement,
              }}
            />
          ));
        })()}

        {/* =============================================================
            全画幅胶片颗粒与材质遮罩（整张图片/全部前景元素顶层覆盖）
            挂载于画布顶层 (z-40)，位于所有前景文字、卡片、图片之上
            采用双通道高动态范围明暗颗粒补偿体系：
            1. 正向颗粒层：负责深色底色与深色文字上的银盐高光颗粒；
            2. 反相暗调补偿层：负责白色标题、浅色正文与浅色卡片上的深色微粒与纸张纤维咬合；
            内置 Alpha 增益与对比度增强，彻底消除 PNG 贴图固有半透明度过低导致字体“看不出纹理”的问题。
           ============================================================= */}
        {effTextureUrl && effTextureTarget !== 'bg' ? (
          <>
            {/* 通道 1：正向高反差颗粒层（负责深色底色与深色文字的高光银盐） */}
            <div
              className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-200"
              style={{
                backgroundImage: `url("${effTextureUrl}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: `${effTextureSize}px`,
                mixBlendMode: (effTextureBlendMode || 'normal') as any,
                opacity: Math.min(1, effTextureOpacity * 1.5),
                filter: 'contrast(130%) brightness(105%)',
              }}
            />
            {/* 通道 2：反相暗调咬合补偿层（负责纯白大字、浅色卡片上的暗部纸张纤维与银盐颗粒） */}
            {((effTextureBlendMode || 'normal') === 'normal' ||
              effTextureBlendMode === 'overlay' ||
              effTextureBlendMode === 'soft-light') && (
              <div
                className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-200"
                style={{
                  backgroundImage: `url("${effTextureUrl}")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: `${effTextureSize}px`,
                  filter: 'invert(1) contrast(180%)',
                  mixBlendMode: 'multiply',
                  opacity: Math.min(1, effTextureOpacity * 1.35),
                }}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';

'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { FONTS } from '../../constants';
import { PlogElement as PlogElementType } from '../../types';
import { PlogElement } from '../plog/PlogElement';

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
      >
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

        {/* =============================================================
            画布 = 一组可拖拽的自由元素（background 除外，已作为容器底层渲染）
           ============================================================= */}
        {floatingOnly.map((el) => (
          <PlogElement
            key={el.id}
            element={el}
            containerRef={containerRef}
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
        ))}
      </div>
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';

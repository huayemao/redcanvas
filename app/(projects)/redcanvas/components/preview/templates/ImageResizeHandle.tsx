'use client';

import React from 'react';
import { useImageResize } from './useImageResize';

interface ImageResizeHandleProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  onScaleChange: (scale: number) => void;
  min?: number;
  max?: number;
}

/**
 * 右下角拖拽手柄 —— 按比例缩放图片卡片，不改变宽高比。
 * 仅在 interactive 模式下由模板渲染。
 */
export const ImageResizeHandle: React.FC<ImageResizeHandleProps> = ({
  cardRef,
  scale,
  onScaleChange,
  min,
  max,
}) => {
  const { onPointerDown, onPointerMove, onPointerUp } = useImageResize(
    () => cardRef.current,
    scale,
    onScaleChange,
    min,
    max
  );

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute right-2 bottom-2 z-30 w-5 h-5 cursor-nwse-resize rounded-full bg-white/90 shadow-lg border border-black/10 flex items-center justify-center touch-none"
      title="拖拽缩放"
    >
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M9 1L1 9M9 5L5 9" stroke="#111" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
};

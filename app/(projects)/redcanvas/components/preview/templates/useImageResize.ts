'use client';

import { useCallback, useRef } from 'react';

interface DragState {
  originX: number;
  originY: number;
  startDist: number;
  startScale: number;
  pointerId: number;
  target: HTMLElement;
}

/**
 * 按比例锁定的拖拽缩放 hook。
 *
 * 拖拽手柄时，以卡片左上角为固定原点，按「指针到原点的距离」比例缩放，
 * 始终保持图片宽高比不变（只改变 imageScale，不改 imageAspectRatio）。
 */
export function useImageResize(
  getCardEl: () => HTMLElement | null,
  currentScale: number,
  onScaleChange: (scale: number) => void,
  min = 0.3,
  max = 1.6
) {
  const stateRef = useRef<DragState | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const card = getCardEl();
      if (!card) return;
      const rect = card.getBoundingClientRect();
      stateRef.current = {
        originX: rect.left,
        originY: rect.top,
        startDist: Math.hypot(e.clientX - rect.left, e.clientY - rect.top) || 1,
        startScale: currentScale,
        pointerId: e.pointerId,
        target: e.target as HTMLElement,
      };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      if (typeof window !== 'undefined') (window as any).__hookPD = ((window as any).__hookPD || 0) + 1;
    },
    [getCardEl, currentScale]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = stateRef.current;
      if (!s || e.pointerId !== s.pointerId) return;
      if (typeof window !== 'undefined') (window as any).__hookPM = ((window as any).__hookPM || 0) + 1;
      const curDist = Math.hypot(e.clientX - s.originX, e.clientY - s.originY);
      let next = s.startScale * (curDist / s.startDist);
      if (typeof window !== 'undefined') (window as any).__hookNext = { startScale: s.startScale, startDist: s.startDist, curDist, next, cx: e.clientX, cy: e.clientY, ox: s.originX, oy: s.originY };
      if (!isFinite(next)) return;
      next = Math.min(max, Math.max(min, next));
      onScaleChange(next);
      if (typeof window !== 'undefined') (window as any).__hookCalled = ((window as any).__hookCalled || 0) + 1;
    },
    [onScaleChange]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s) return;
    try {
      s.target.releasePointerCapture(e.pointerId);
    } catch {}
    stateRef.current = null;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}

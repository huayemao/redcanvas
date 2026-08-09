'use client';

import React from 'react';
import { X, Move, Pencil } from 'lucide-react';

interface ElementToolbarProps {
  /** 点击抓手中的"编辑"按钮时回调（移动端打开属性抽屉） */
  onEditElement?: () => void;
  /** 删除当前元素 */
  onRemove: () => void;
  /** 拖拽手柄：移动端只能通过此抓手拖动元素，避免误触 */
  onDragStart?: (e: React.PointerEvent) => void;
}

/**
 * 选中元素时浮出的操作条（抓手 + 编辑 + 删除）。
 *
 * 设计要点：
 * - 定位在元素内部左上角（不再悬于元素外侧），避免被相邻元素遮挡或溢出画布；
 * - 抓手（Move 图标）作为拖拽手柄，移动端仅可通过抓手拖动元素，杜绝误触；
 * - 宽度由内容撑开，footprint 极小。
 */
export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onEditElement,
  onRemove,
  onDragStart,
}) => {
  return (
    <div className="hide-on-export absolute top-1 left-1 flex items-center gap-1 bg-neutral-900/90 text-white rounded-lg p-1 text-[10px] shadow-xl z-50 backdrop-blur-sm">
      {/* 抓手 —— 拖拽手柄（移动端唯一拖动入口） */}
      <span
        onPointerDown={(e) => {
          // 阻止事件冒泡到 motion.div 的默认 drag listener，统一由 dragControls 接管
          e.stopPropagation();
          onDragStart?.(e);
        }}
        className="p-0.5 cursor-grab active:cursor-grabbing touch-none hover:text-blue-400 transition-colors flex items-center"
        title="拖动"
      >
        <Move className="w-3 h-3" />
      </span>
      {onEditElement && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditElement();
          }}
          className="p-0.5 hover:text-blue-400 transition-colors lg:hidden"
          title="编辑属性"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-0.5 hover:text-red-400 transition-colors"
        title="删除元素"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

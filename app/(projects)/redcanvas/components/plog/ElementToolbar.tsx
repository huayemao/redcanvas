'use client';

import React from 'react';
import { X, Move, Pencil } from 'lucide-react';

interface ElementToolbarProps {
  /** 点击抓手中的"编辑"按钮时回调（移动端打开属性抽屉） */
  onEditElement?: () => void;
  /** 删除当前元素 */
  onRemove: () => void;
}

/**
 * 选中元素时浮出的操作条（移动图标 + 编辑 + 删除）。
 *
 * 设计要点：
 * - 宽度由内容撑开（不再 left-0 right-0 铺满整个元素宽度），避免宽元素拖出一条超长工具条；
 * - 水平居中于元素顶部，footprint 极小，最大限度减少与相邻元素的重叠，
 *   从而避免工具条被其它元素遮挡、点击事件被别的元素捕获。
 */
export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onEditElement,
  onRemove,
}) => {
  return (
    <div className="hide-on-export absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-900 text-white rounded-lg p-1 text-[10px] shadow-xl z-50">
      <Move className="w-3 h-3 text-neutral-400" />
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

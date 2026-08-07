'use client';

import React from 'react';
import { usePlogStore } from '../../store/usePlogStore';
import { Plus, Trash2, Tag, Layers, MessageSquare, Sparkles, Type } from 'lucide-react';
import { PlogElement } from '../../types';

export const LayerTab: React.FC = () => {
  const { elements, addElement, removeElement, selectedElementId, setSelectedElementId } =
    usePlogStore();

  const handleAddStepBadge = () => {
    const stepNum = elements.filter((e) => e.type === 'badge').length + 1;
    const newEl: PlogElement = {
      id: `badge-${Date.now()}`,
      type: 'badge',
      content: `步骤 ${stepNum}`,
      badgeNumber: `#${stepNum}`,
      x: 15 + stepNum * 5,
      y: 20 + stepNum * 10,
      zIndex: 20,
      bgColor: '#ff2442',
      color: '#ffffff',
    };
    addElement(newEl);
    setSelectedElementId(newEl.id);
  };

  const handleAddAnnotation = () => {
    const newEl: PlogElement = {
      id: `annotation-${Date.now()}`,
      type: 'annotation',
      content: '💡 在此输入重点注释或操作说明...',
      x: 20,
      y: 65,
      zIndex: 20,
      bgColor: 'rgba(255,255,255,0.92)',
      color: '#18181b',
      borderColor: '#ff2442',
    };
    addElement(newEl);
    setSelectedElementId(newEl.id);
  };

  const handleAddSticker = () => {
    const newEl: PlogElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      content: '✨ 高能推荐',
      x: 55,
      y: 15,
      zIndex: 20,
      bgColor: '#ff601a',
      color: '#ffffff',
    };
    addElement(newEl);
    setSelectedElementId(newEl.id);
  };

  const handleAddText = () => {
    const newEl: PlogElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: '点击编辑文本内容',
      x: 30,
      y: 40,
      zIndex: 20,
      color: '#18181b',
    };
    addElement(newEl);
    setSelectedElementId(newEl.id);
  };

  return (
    <div className="space-y-6">
      {/* 快捷添加图层与元素 */}
      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">
          快捷添加标注与贴纸 (可自由拖拽)
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddStepBadge}
            className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-red-100 shadow-sm"
          >
            <Plus className="w-4 h-4 text-red-500" />
            <Layers className="w-3.5 h-3.5" />
            <span>添加步骤标记</span>
          </button>

          <button
            onClick={handleAddAnnotation}
            className="p-3 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-amber-100 shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <MessageSquare className="w-3.5 h-3.5" />
            <span>添加注释说明框</span>
          </button>

          <button
            onClick={handleAddSticker}
            className="p-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-purple-100 shadow-sm"
          >
            <Plus className="w-4 h-4 text-purple-500" />
            <Sparkles className="w-3.5 h-3.5" />
            <span>添加高亮贴纸</span>
          </button>

          <button
            onClick={handleAddText}
            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl font-bold text-xs flex items-center gap-2 transition-colors border border-blue-100 shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-500" />
            <Type className="w-3.5 h-3.5" />
            <span>自由文字块</span>
          </button>
        </div>
      </div>

      {/* 当前图层列表管理 */}
      <div className="space-y-3 pt-3 border-t border-neutral-100">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
          画布图层管理 ({elements.length})
        </label>

        {elements.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-400 font-medium">
            暂无浮动图层，点击上方添加
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {elements.map((el) => (
              <div
                key={el.id}
                onClick={() => setSelectedElementId(el.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  selectedElementId === el.id
                    ? 'border-red-500 bg-red-50/50 shadow-sm'
                    : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Tag className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-neutral-800 truncate">
                    {el.content}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(el.id);
                  }}
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  title="删除图层"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

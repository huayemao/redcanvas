'use client';

import React from 'react';
import { Type, Palette, Image as ImageIcon, Layers, LayoutGrid } from 'lucide-react';
import { usePlogStore } from '../../store/usePlogStore';

export type Tab = 'content' | 'style' | 'asset' | 'plog' | 'layer';

interface EditorTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onTabChange }) => {
  const { mode } = usePlogStore();

  const coverTabs = [
    { id: 'content', label: '文案', icon: Type },
    { id: 'style', label: '风格', icon: Palette },
    { id: 'asset', label: '素材', icon: ImageIcon },
  ];

  const plogTabs = [
    { id: 'plog', label: 'Plog 排版', icon: LayoutGrid },
    { id: 'layer', label: '图层与标注', icon: Layers },
    { id: 'asset', label: '素材上传', icon: ImageIcon },
  ];

  const currentTabs = mode === 'plog' ? plogTabs : coverTabs;

  return (
    <div className="flex border-b border-neutral-100 px-2 py-2">
      {currentTabs.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id as Tab)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === item.id
              ? mode === 'plog'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-neutral-900 text-white shadow-lg'
              : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <item.icon className="w-3.5 h-3.5" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

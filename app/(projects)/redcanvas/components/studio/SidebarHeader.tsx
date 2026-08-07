'use client';

import React from 'react';
import { StudioTab, useStudioStore } from '../../store/useStudioStore';
import { LayoutGrid, Palette, Type, Layers } from 'lucide-react';

export const SidebarHeader: React.FC = () => {
  const { activeTab, setActiveTab } = useStudioStore();

  const tabs: { id: StudioTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'templates', label: '模板', icon: LayoutGrid },
    { id: 'canvas', label: '配色', icon: Palette },
    { id: 'text', label: '文案', icon: Type },
    { id: 'elements', label: '元素', icon: Layers },
  ];

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] p-2 bg-white/[0.02] rounded-2xl mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
              isActive
                ? 'bg-white text-black shadow-md'
                : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

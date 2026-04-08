import React from 'react';
import { Type, Palette, Image as ImageIcon } from 'lucide-react';

type Tab = 'content' | 'style' | 'asset';

interface EditorTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onTabChange }) => {
  const tabItems = [
    { id: 'content', label: '文案', icon: Type },
    { id: 'style', label: '风格', icon: Palette },
    { id: 'asset', label: '素材', icon: ImageIcon },
  ];

  return (
    <div className="flex border-b border-neutral-50 px-2 py-2">
      {tabItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id as Tab)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-black transition-all ${
            activeTab === item.id 
            ? 'bg-neutral-900 text-white shadow-lg' 
            : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

'use client';

import React from 'react';
import { AppMode } from '../../types';
import { Sparkles, LayoutGrid } from 'lucide-react';
import { usePlogStore } from '../../store/usePlogStore';

export const ModeTab: React.FC = () => {
  const { mode, setMode } = usePlogStore();

  return (
    <div className="bg-neutral-100 p-1.5 rounded-2xl flex items-center gap-1 mb-4 shadow-inner">
      <button
        onClick={() => setMode('cover')}
        className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
          mode === 'cover'
            ? 'bg-neutral-900 text-white shadow-md'
            : 'text-neutral-500 hover:text-neutral-900'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>爆款封面模式</span>
      </button>

      <button
        onClick={() => setMode('plog')}
        className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
          mode === 'plog'
            ? 'bg-red-500 text-white shadow-md'
            : 'text-neutral-500 hover:text-neutral-900'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Plog 灵感排版</span>
      </button>
    </div>
  );
};

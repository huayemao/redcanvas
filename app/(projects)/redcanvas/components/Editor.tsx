
'use client';

import React, { useState } from 'react';
import { EditorState, Highlight } from '../types';
import { AnimatePresence } from 'framer-motion';
import { EditorTabs } from './editor/EditorTabs';
import { ContentTab } from './editor/ContentTab';
import { StyleTab } from './editor/StyleTab';
import { AssetTab } from './editor/AssetTab';

interface EditorProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  onDownload: () => void;
}

type Tab = 'content' | 'style' | 'asset';

export const Editor: React.FC<EditorProps> = ({ state, setState, onDownload }) => {
  const [activeTab, setActiveTab] = useState<Tab>('content');

  const addHighlight = () => {
    const newHighlight: Highlight = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      color: state.accentColor,
      style: 'underline',
    };
    setState(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight] }));
  };

  const updateHighlight = (id: string, updates: Partial<Highlight>) => {
    setState(prev => ({
      ...prev,
      highlights: prev.highlights.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  };

  const removeHighlight = (id: string) => {
    setState(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h.id !== id)
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
      {/* Tabs Header */}
      <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <ContentTab
              state={state}
              setState={setState}
              onAddHighlight={addHighlight}
              onUpdateHighlight={updateHighlight}
              onRemoveHighlight={removeHighlight}
            />
          )}

          {activeTab === 'style' && (
            <StyleTab state={state} setState={setState} />
          )}

          {activeTab === 'asset' && (
            <AssetTab state={state} setState={setState} />
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-neutral-50 bg-neutral-50/50">
        {/* 导出按钮已移除，移到了Preview组件下方 */}
      </div>
    </div>
  );
};


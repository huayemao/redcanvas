'use client';

import React, { useState, useEffect } from 'react';
import { EditorState, Highlight } from '../types';
import { AnimatePresence } from 'framer-motion';
import { EditorTabs, Tab } from './editor/EditorTabs';
import { ContentTab } from './editor/ContentTab';
import { StyleTab } from './editor/StyleTab';
import { AssetTab } from './editor/AssetTab';
import { ModeTab } from './editor/ModeTab';
import { PlogTab } from './editor/PlogTab';
import { LayerTab } from './editor/LayerTab';
import { usePlogStore } from '../store/usePlogStore';

interface EditorProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  onDownload: () => void;
}

export const Editor: React.FC<EditorProps> = ({ state, setState }) => {
  const { mode } = usePlogStore();
  const [activeTab, setActiveTab] = useState<Tab>('content');

  // Switch default tab when mode changes
  useEffect(() => {
    if (mode === 'plog') {
      setActiveTab('plog');
    } else {
      setActiveTab('content');
    }
  }, [mode]);

  const addHighlight = () => {
    const newHighlight: Highlight = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      color: state.accentColor,
      style: 'underline',
    };
    setState((prev) => ({ ...prev, highlights: [...prev.highlights, newHighlight] }));
  };

  const updateHighlight = (id: string, updates: Partial<Highlight>) => {
    setState((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  };

  const removeHighlight = (id: string) => {
    setState((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h.id !== id),
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
      {/* Mode Switcher */}
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
        <ModeTab />
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-[420px]">
        <AnimatePresence mode="wait">
          {mode === 'cover' && activeTab === 'content' && (
            <ContentTab
              state={state}
              setState={setState}
              onAddHighlight={addHighlight}
              onUpdateHighlight={updateHighlight}
              onRemoveHighlight={removeHighlight}
            />
          )}

          {mode === 'cover' && activeTab === 'style' && (
            <StyleTab state={state} setState={setState} />
          )}

          {mode === 'cover' && activeTab === 'asset' && (
            <AssetTab state={state} setState={setState} />
          )}

          {mode === 'plog' && activeTab === 'plog' && <PlogTab />}

          {mode === 'plog' && activeTab === 'layer' && <LayerTab />}

          {mode === 'plog' && activeTab === 'asset' && (
            <AssetTab state={state} setState={setState} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

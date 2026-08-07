'use client';

import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { SidebarHeader } from './SidebarHeader';
import { TemplateGallery } from './TemplateGallery';
import { CanvasControlTab } from './CanvasControlTab';
import { TextControlTab } from './TextControlTab';
import { ElementsControlTab } from './ElementsControlTab';
import { ConfigToolbar } from './ConfigToolbar';
import { AnimatePresence, motion } from 'framer-motion';

export const StudioEditor: React.FC = () => {
  const { activeTab } = useStudioStore();

  return (
    <div className="flex flex-col h-full bg-white/[0.02] rounded-[32px] border border-white/[0.06] overflow-hidden">
      {/* 存档 / 读档工具栏 */}
      <div className="px-4 pt-4">
        <ConfigToolbar />
      </div>

      {/* Tab Navigation Header */}
      <div className="px-4 pb-4 border-b border-white/[0.06] bg-white/[0.02]">
        <SidebarHeader />
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-[440px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'templates' && <TemplateGallery />}
            {activeTab === 'canvas' && <CanvasControlTab />}
            {activeTab === 'text' && <TextControlTab />}
            {activeTab === 'elements' && <ElementsControlTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

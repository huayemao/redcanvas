import React from 'react';
import { motion } from 'framer-motion';
import { EditorState, TemplateId } from '../../types';
import { FONTS } from '../../constants';
import { TemplateSelector } from './TemplateSelector';
import { ColorPicker } from './ColorPicker';

interface StyleTabProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}

export const StyleTab: React.FC<StyleTabProps> = ({ state, setState }) => {
  return (
    <motion.div
      key="style"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6"
    >
      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">字体库</label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map(f => (
            <button
              key={f.id}
              onClick={() => setState(prev => ({ ...prev, fontFamily: f.id }))}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                state.fontFamily === f.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-100 hover:border-neutral-200'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <TemplateSelector
        selectedTemplate={state.templateId}
        onSelectTemplate={(templateId) => setState(prev => ({ ...prev, templateId }))}
        title="视觉模板"
      />
      
      <div className="mt-8">
        <TemplateSelector
          selectedTemplate={state.templateId}
          onSelectTemplate={(templateId) => setState(prev => ({ ...prev, templateId }))}
          filter="mockup"
          title="Realistic Scenes"
        />
      </div>
      
      <div className="mt-8">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">渐变颜色</label>
        <div className="space-y-4">
          <ColorPicker
            label="起始颜色"
            value={state.gradientStartColor}
            onChange={(value) => setState(prev => ({ ...prev, gradientStartColor: value }))}
          />
          <ColorPicker
            label="结束颜色"
            value={state.gradientEndColor}
            onChange={(value) => setState(prev => ({ ...prev, gradientEndColor: value }))}
          />
          <div className="h-12 rounded-xl" style={{ background: `linear-gradient(135deg, ${state.gradientStartColor} 0%, ${state.gradientEndColor} 100%)` }} />
        </div>
      </div>
    </motion.div>
  );
};

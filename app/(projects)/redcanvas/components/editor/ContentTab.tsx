import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { EditorState, Highlight } from '../../types';
import { HighlightItem } from './HighlightItem';

interface ContentTabProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  onAddHighlight: () => void;
  onUpdateHighlight: (id: string, updates: Partial<Highlight>) => void;
  onRemoveHighlight: (id: string) => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({ 
  state, 
  setState, 
  onAddHighlight, 
  onUpdateHighlight, 
  onRemoveHighlight 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6"
    >
      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">主标题内容</label>
        <textarea
          name="title"
          value={state.title}
          onChange={handleInputChange}
          className="w-full px-5 py-4 bg-neutral-50 border-none focus:ring-2 focus:ring-red-500/10 rounded-2xl transition-all text-base font-bold resize-none outline-none"
          placeholder="输入标题..."
          rows={3}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">多色高亮关键词</label>
           <button onClick={onAddHighlight} className="p-1.5 bg-neutral-100 rounded-lg hover:bg-red-500 hover:text-white transition-all">
              <Plus className="w-3 h-3" />
           </button>
        </div>
        {state.highlights.map((h) => (
          <HighlightItem
            key={h.id}
            highlight={h}
            onUpdate={onUpdateHighlight}
            onRemove={onRemoveHighlight}
          />
        ))}
      </div>

      <div>
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">系列号标记（可选）</label>
        <input
          type="text"
          name="seriesNumber"
          value={state.seriesNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-neutral-50 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/10"
          placeholder="#01"
        />
      </div>
    </motion.div>
  );
};

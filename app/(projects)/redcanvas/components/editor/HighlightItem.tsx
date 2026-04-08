import React from 'react';
import { X } from 'lucide-react';
import { Highlight } from '../../types';
import { PRESET_COLORS } from '../../constants';

interface HighlightItemProps {
  highlight: Highlight;
  onUpdate: (id: string, updates: Partial<Highlight>) => void;
  onRemove: (id: string) => void;
}

export const HighlightItem: React.FC<HighlightItemProps> = ({ highlight, onUpdate, onRemove }) => {
  return (
    <div key={highlight.id} className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-100">
      <input
        type="text"
        value={highlight.text}
        onChange={(e) => onUpdate(highlight.id, { text: e.target.value })}
        className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-xs"
        placeholder="高亮词组"
      />
      <div className="flex gap-1">
        {PRESET_COLORS.map(c => (
          <button 
            key={c}
            onClick={() => onUpdate(highlight.id, { color: c })}
            className={`w-4 h-4 rounded border ${highlight.color === c ? 'border-neutral-900 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={highlight.color}
          onChange={(e) => onUpdate(highlight.id, { color: e.target.value })}
          className="w-4 h-4 rounded border border-neutral-200 cursor-pointer"
        />
      </div>
      <div className="flex gap-1 border-l border-neutral-200 pl-2">
        <button
          onClick={() => onUpdate(highlight.id, { style: 'underline' })}
          className={`px-2 py-1 rounded text-xs font-bold ${highlight.style === 'underline' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}
        >
          下划线
        </button>
        <button
          onClick={() => onUpdate(highlight.id, { style: 'text' })}
          className={`px-2 py-1 rounded text-xs font-bold ${highlight.style === 'text' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}
        >
          文本色
        </button>
      </div>
      <button onClick={() => onRemove(highlight.id)} className="text-neutral-300 hover:text-red-500 p-1">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

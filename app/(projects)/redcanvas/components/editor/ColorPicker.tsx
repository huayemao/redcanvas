import React from 'react';
import { Sparkles } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAutoExtract?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  onAutoExtract,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
          {label}
        </label>
        {onAutoExtract && (
          <button
            onClick={onAutoExtract}
            className="inline-flex items-center gap-1 text-[10px] font-black text-red-500 hover:text-neutral-900 transition-colors"
            title="自动从主图中提取最佳配色"
          >
            <Sparkles className="w-3 h-3" />
            <span>智能提取</span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border-2 border-neutral-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-neutral-50 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/10"
        />
      </div>
    </div>
  );
};

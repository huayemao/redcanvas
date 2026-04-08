import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">{label}</label>
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

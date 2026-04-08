import React from 'react';
import { TemplateId } from '../../types';
import { TEMPLATES } from '../../constants';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  filter?: string;
  title?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  selectedTemplate, 
  onSelectTemplate, 
  filter,
  title
}) => {
  const filteredTemplates = filter 
    ? TEMPLATES.filter(tpl => tpl.id === filter)
    : TEMPLATES.filter(tpl => tpl.id !== 'mockup');

  return (
    <div>
      {title && (
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">{title}</label>
      )}
      <div className="grid grid-cols-1 gap-2">
        {filteredTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              selectedTemplate === tpl.id 
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                : 'border-neutral-100 hover:border-neutral-200 bg-white'
            }`}
          >
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: tpl.previewColor }} />
            <div className="text-left">
              <div className="text-xs font-black">{tpl.name}</div>
              <div className="text-[9px] opacity-60 font-medium">{tpl.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

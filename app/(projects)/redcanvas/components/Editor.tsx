
'use client';

import React, { useState, useCallback } from 'react';
import { EditorState, TemplateId, Highlight, DeviceType } from '../types';
import { TEMPLATES, PRESET_COLORS, FONTS } from '../constants';
import { Upload, Type, Palette, Layout, Plus, X, Download, Monitor, Smartphone, Image as ImageIcon, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  onDownload: () => void;
}

type Tab = 'content' | 'style' | 'asset';

export const Editor: React.FC<EditorProps> = ({ state, setState, onDownload }) => {
  const [activeTab, setActiveTab] = useState<Tab>('content');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setState(prev => ({ 
          ...prev, 
          imageUrl: url, 
          imageAspectRatio: img.naturalWidth / img.naturalHeight 
        }));
      };
      img.src = url;
    }
  }, [setState]);

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

  const tabItems = [
    { id: 'content', label: '文案', icon: Type },
    { id: 'style', label: '风格', icon: Palette },
    { id: 'asset', label: '素材', icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-neutral-50 px-2 py-2">
        {tabItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-black transition-all ${
              activeTab === item.id 
              ? 'bg-neutral-900 text-white shadow-lg' 
              : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
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
                   <button onClick={addHighlight} className="p-1.5 bg-neutral-100 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                      <Plus className="w-3 h-3" />
                   </button>
                </div>
                {state.highlights.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                     <input
                       type="text"
                       value={h.text}
                       onChange={(e) => updateHighlight(h.id, { text: e.target.value })}
                       className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-xs"
                       placeholder="高亮词组"
                     />
                     <div className="flex gap-1">
                        {PRESET_COLORS.map(c => (
                          <button 
                            key={c}
                            onClick={() => updateHighlight(h.id, { color: c })}
                            className={`w-4 h-4 rounded border ${h.color === c ? 'border-neutral-900 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="color"
                          value={h.color}
                          onChange={(e) => updateHighlight(h.id, { color: e.target.value })}
                          className="w-4 h-4 rounded border border-neutral-200 cursor-pointer"
                        />
                     </div>
                     <div className="flex gap-1 border-l border-neutral-200 pl-2">
                        <button
                          onClick={() => updateHighlight(h.id, { style: 'underline' })}
                          className={`px-2 py-1 rounded text-xs font-bold ${h.style === 'underline' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}
                        >
                          下划线
                        </button>
                        <button
                          onClick={() => updateHighlight(h.id, { style: 'text' })}
                          className={`px-2 py-1 rounded text-xs font-bold ${h.style === 'text' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}
                        >
                          文本色
                        </button>
                     </div>
                     <button onClick={() => removeHighlight(h.id)} className="text-neutral-300 hover:text-red-500 p-1">
                        <X className="w-3 h-3" />
                     </button>
                  </div>
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
          )}

          {activeTab === 'style' && (
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

              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">视觉模板</label>
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATES.filter(tpl => tpl.id !== 'mockup').map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setState(prev => ({ ...prev, templateId: tpl.id }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        state.templateId === tpl.id 
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
              
              <div className="mt-8">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">Realistic Scenes</label>
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATES.filter(tpl => tpl.id === 'mockup').map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setState(prev => ({ ...prev, templateId: tpl.id }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        state.templateId === tpl.id 
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
            </motion.div>
          )}

          {activeTab === 'asset' && (
            <motion.div
              key="asset"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">背景图片</label>
                   <button 
                     onClick={() => setState(prev => ({ ...prev, showDeviceFrame: !prev.showDeviceFrame }))}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                       state.showDeviceFrame 
                       ? 'bg-red-500 text-white' 
                       : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                     }`}
                   >
                     {state.imageAspectRatio > 1 ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                     网站/App 壳子: {state.showDeviceFrame ? '开启' : '关闭'}
                   </button>
                </div>
                {state.showDeviceFrame ? (
                  <div className="mb-4">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">设备类型</label>
                    <div className="grid grid-cols-3 gap-2">
                      {
                        [
                          { type: 'none' as DeviceType, label: '无', icon: Monitor },
                          { type: 'browser' as DeviceType, label: '浏览器', icon: Monitor },
                          { type: 'device' as DeviceType, label: '设备', icon: Laptop },
                        ].map((device) => (
                          <button
                            key={device.type}
                            onClick={() => setState(prev => ({ ...prev, deviceType: device.type }))}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                              state.deviceType === device.type 
                                ? 'border-neutral-900 bg-neutral-900 text-white' 
                                : 'border-neutral-100 hover:border-neutral-200 bg-white'
                            }`}
                          >
                            <device.icon className="w-4 h-4" />
                            <span className="text-[9px] font-black">{device.label}</span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">图片比例</label>
                    <div className="grid grid-cols-5 gap-2">
                      {
                        [
                          { ratio: 16/9, label: '16:9' },
                          { ratio: 3/2, label: '3:2' },
                          { ratio: 4/3, label: '4:3' },
                          { ratio: 2/3, label: '2:3' },
                          { ratio: 9/20, label: '9:20' },
                        ].map((option) => (
                          <button
                            key={option.ratio}
                            onClick={() => setState(prev => ({ ...prev, imageAspectRatio: option.ratio }))}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                              Math.abs(state.imageAspectRatio - option.ratio) < 0.01 
                                ? 'border-neutral-900 bg-neutral-900 text-white' 
                                : 'border-neutral-100 hover:border-neutral-200 bg-white'
                            }`}
                          >
                            <span className="text-[9px] font-black">{option.label}</span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-100 rounded-3xl cursor-pointer hover:bg-neutral-50 transition-all group">
                  <Upload className="w-6 h-6 text-neutral-300 mb-2 group-hover:text-red-500" />
                  <span className="text-[10px] font-black text-neutral-400">点击/拖拽/粘贴图片素材</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </motion.div>
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


'use client';

import React, { useState } from 'react';
import { TEMPLATES, FONTS } from '../constants';
import { TemplateId, Orientation, ExportSize, EditorState } from '../types';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, ExternalLink, Grid, List } from 'lucide-react';
import { CoverRenderer } from './CoverRenderer';

interface TemplateStoreProps {
    onSelectTemplate: (templateId: TemplateId, orientation: Orientation, exportSize: ExportSize) => void;
}

type FilterType = 'all' | 'portrait' | 'landscape' | 'classic' | 'modern' | 'minimal' | 'bold';

const SAMPLE_STATE: EditorState = {
    title: "我，花野猫\n喜欢写代码\n想开发小工具找我",
    highlights: [
        { id: '1', text: '花野猫', color: '#ff2442', style: 'underline' },
        { id: '2', text: '写代码', color: '#ff601a', style: 'text' },
        { id: '3', text: '开发小工具', color: '#6bcbff', style: 'underline' }
    ],
    seriesNumber: "#01",
    imageUrl: "/screenshot.png",
    imageAspectRatio: 1.5,
    showDeviceFrame: true,
    deviceType: 'browser',
    templateId: 'classic',
    fontFamily: 'kuaile',
    accentColor: '#ff2442',
    orientation: 'portrait',
    exportSize: 'xiaohongshu',
};

export const TemplateStore: React.FC<TemplateStoreProps> = ({ onSelectTemplate }) => {
    const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all']);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const handleFilterToggle = (filter: FilterType) => {
        setActiveFilters(prev => {
            if (filter === 'all') {
                return ['all'];
            }
            const newFilters = prev.includes('all')
                ? [filter]
                : prev.includes(filter)
                    ? prev.filter(f => f !== filter)
                    : [...prev, filter];
            return newFilters.length === 0 ? ['all'] : newFilters;
        });
    };

    const filteredTemplates = TEMPLATES.filter(template => {
        if (activeFilters.includes('all')) return true;

        // 这里可以根据模板特性进行更复杂的筛选逻辑
        // 暂时简单处理，后续可以根据需要扩展
        const templateCategories: Record<TemplateId, FilterType[]> = {
            classic: ['classic', 'portrait', 'landscape'],
            magazine: ['modern', 'portrait', 'landscape'],
            minimal: ['minimal', 'portrait', 'landscape'],
            bold: ['bold', 'portrait', 'landscape'],
            floating: ['modern', 'portrait', 'landscape'],
            mockup: ['modern', 'landscape']
        };

        return templateCategories[template.id].some(category => activeFilters.includes(category));
    });

    const handleSelectTemplate = (templateId: TemplateId) => {
        // 根据模板类型默认选择合适的方向和导出尺寸
        let orientation: Orientation = 'portrait';
        let exportSize: ExportSize = 'xiaohongshu';



        onSelectTemplate(templateId, orientation, exportSize);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-30" />

            <div className="relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-4">模板商店</h1>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Premium Template Collection</p>
                </div>

                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-xs font-black text-neutral-900 hover:bg-neutral-100 transition-all shadow-md border border-neutral-100"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="uppercase tracking-wider">筛选</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilterMenu && (
                            <div className="absolute z-20 mt-2 bg-white rounded-2xl shadow-2xl p-4 border border-neutral-100">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'all', label: '全部' },
                                        { id: 'portrait', label: '纵向' },
                                        { id: 'landscape', label: '横向' },
                                        { id: 'classic', label: '经典' },
                                        { id: 'modern', label: '现代' },
                                        { id: 'minimal', label: '极简' },
                                        { id: 'bold', label: '大胆' }
                                    ].map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => handleFilterToggle(filter.id as FilterType)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeFilters.includes(filter.id as FilterType) ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'}`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group"
                        >
                            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-neutral-100 hover:shadow-2xl hover:shadow-red-50/50 transition-all duration-300">
                                <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden p-4">
                                    <CoverRenderer
                                        state={{
                                            ...SAMPLE_STATE,
                                            templateId: template.id,
                                            exportSize: 'xiaohongshu',
                                            deviceType: 'macbook',
                                            showDeviceFrame: ['mockup', 'bold', 'magazine'].includes(template.id) ? false : true,
                                        }}
                                        ref={() => { }}
                                    />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-black text-neutral-900 mb-2 uppercase tracking-wider">{template.name}</h3>
                                    <p className="text-xs text-neutral-500 mb-4 leading-relaxed">{template.description}</p>
                                    <button
                                        onClick={() => handleSelectTemplate(template.id)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-neutral-900 transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-red-100/50 hover:shadow-2xl hover:shadow-red-50/50 group-hover:scale-[1.02]"
                                    >
                                        使用模板
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

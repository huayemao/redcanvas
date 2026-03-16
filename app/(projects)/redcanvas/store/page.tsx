'use client';

import React, { useState } from 'react';
import { TemplateStore } from '../components/TemplateStore';
import { EditorState, TemplateId, Orientation, ExportSize } from '../types';
import { redirect } from 'next/navigation';

export default function StorePage() {
  const handleSelectTemplate = (templateId: TemplateId, orientation: Orientation, exportSize: ExportSize) => {
    // 构建查询参数，用于传递模板配置到编辑器页面
    const params = new URLSearchParams();
    params.set('template', templateId);
    params.set('orientation', orientation);
    params.set('exportSize', exportSize);
    
    // 重定向到主页，带上模板配置参数
    redirect(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TemplateStore onSelectTemplate={handleSelectTemplate} />
    </div>
  );
}

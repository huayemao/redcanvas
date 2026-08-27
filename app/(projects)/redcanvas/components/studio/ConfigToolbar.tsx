'use client';

import React, { useState } from 'react';
import { Download, Upload, Check, AlertCircle, Image as ImageIcon, Images, Loader2, ChevronDown, FileText } from 'lucide-react';
import { useConfigTransfer } from './useConfigTransfer';
import { useStudioStore } from '../../store/useStudioStore';

/**
 * 存档 / 读档工具栏（侧栏 / 抽屉内使用）
 * - 导出下拉：导出配置（ZIP/JSON） + 导出当前页图片（PNG） + 导出全部页面（多页时，ZIP 打包）
 * - 导入：按文件扩展名 / MIME 分派（.zip → ZIP；.json → JSON）
 * 实际导入/导出逻辑见 useConfigTransfer。
 */
interface ConfigToolbarProps {
  onExportPng?: () => void;
  isPngExporting?: boolean;
  onExportAllPng?: () => void;
}

export const ConfigToolbar: React.FC<ConfigToolbarProps> = ({ onExportPng, isPngExporting, onExportAllPng }) => {
  const {
    fileRef,
    toast,
    busy,
    hasImageAssets,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
  } = useConfigTransfer();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const pageCount = useStudioStore((s) => s.pages.length);

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        {/* 导出下拉菜单 */}
        <div className="relative flex-1">
          <button
            onClick={() => setExportMenuOpen((v) => !v)}
            disabled={busy || isPngExporting}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all text-[11px] font-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy || isPngExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {busy || isPngExporting ? '处理中…' : '导出'}
            <ChevronDown className={`w-3 h-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {exportMenuOpen && !(busy || isPngExporting) && (
            <>
              {/* 点击外部关闭 */}
              <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
              {/* 下拉菜单 */}
              <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl bg-[#1a1a1a] border border-white/[0.08] shadow-2xl overflow-hidden">
                <button
                  onClick={() => { setExportMenuOpen(false); handleExportConfig(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white/80">导出配置</div>
                    <div className="text-[9px] text-white/30 font-medium">{hasImageAssets ? 'ZIP · 含图片资源' : 'JSON · 纯配置'}</div>
                  </div>
                </button>
                {onExportPng && (
                  <button
                    onClick={() => { setExportMenuOpen(false); onExportPng(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-white/80">导出当前页图片</div>
                      <div className="text-[9px] text-white/30 font-medium">高清 PNG · 2.5x</div>
                    </div>
                  </button>
                )}
                {onExportAllPng && pageCount > 1 && (
                  <button
                    onClick={() => { setExportMenuOpen(false); onExportAllPng(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Images className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-white/80">导出全部页面（{pageCount} 页）</div>
                      <div className="text-[9px] text-white/30 font-medium">逐页高清 PNG · 打包 ZIP</div>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* 导入按钮 */}
        <button
          onClick={handleImportClick}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all text-[11px] font-black disabled:opacity-50 disabled:cursor-not-allowed"
          title="从 JSON 或 ZIP 文件恢复配置"
        >
          <Upload className="w-3.5 h-3.5" />
          导入
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json,application/zip,.zip,application/x-zip-compressed"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl shadow-2xl text-[12px] font-bold border backdrop-blur-md ${
            toast.kind === 'ok'
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
              : 'bg-rose-500/15 border-rose-400/30 text-rose-200'
          }`}
        >
          {toast.kind === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
};

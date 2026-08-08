'use client';

import React, { useState } from 'react';
import { Download, Upload, Check, AlertCircle, Image as ImageIcon, Loader2, ChevronDown, FileText } from 'lucide-react';
import { useConfigTransfer } from './useConfigTransfer';

/**
 * 移动端顶栏的紧凑存档/读档条（lg 以下显示，放在"编辑"按钮旁边，抽屉外）。
 * 与"编辑"按钮同款 pill 样式：导出下拉（导出配置 / 导出图片）+ 导入。
 * 逻辑复用 useConfigTransfer；与抽屉内的 ConfigToolbar 共享同一 store。
 */
interface MobileConfigBarProps {
  onExportPng?: () => void;
  isPngExporting?: boolean;
}

const pillBtn =
  'flex items-center gap-1 px-2.5 py-2 rounded-xl bg-black/50 backdrop-blur-md text-white/80 text-[11px] font-black border border-white/10 hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const MobileConfigBar: React.FC<MobileConfigBarProps> = ({ onExportPng, isPngExporting }) => {
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
  const anyBusy = busy || !!isPngExporting;

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* 导出下拉 */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen((v) => !v)}
            disabled={anyBusy}
            className={pillBtn}
          >
            {anyBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            导出
            <ChevronDown className={`w-3 h-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {exportMenuOpen && !anyBusy && (
            <>
              {/* 点击外部关闭 */}
              <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
              {/* 下拉菜单 */}
              <div className="absolute top-full left-0 mt-1 z-50 w-40 rounded-xl bg-[#1a1a1a] border border-white/[0.08] shadow-2xl overflow-hidden">
                <button
                  onClick={() => { setExportMenuOpen(false); handleExportConfig(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white/80">导出配置</div>
                    <div className="text-[9px] text-white/30 font-medium">{hasImageAssets ? 'ZIP · 含图片' : 'JSON · 纯配置'}</div>
                  </div>
                </button>
                {onExportPng && (
                  <button
                    onClick={() => { setExportMenuOpen(false); onExportPng(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-white/80">导出图片</div>
                      <div className="text-[9px] text-white/30 font-medium">高清 PNG · 2.5x</div>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* 导入 */}
        <button
          onClick={handleImportClick}
          disabled={busy}
          className={pillBtn}
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
          className={`fixed top-4 right-4 z-[120] flex items-center gap-2 px-3.5 py-2 rounded-xl shadow-2xl text-[12px] font-bold border backdrop-blur-md ${
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

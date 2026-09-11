'use client';

import React, { useState } from 'react';
import { Download, Upload, Check, AlertCircle, Image as ImageIcon, Images, Loader2, ChevronDown, FileText, PenLine, RotateCcw, ShieldCheck } from 'lucide-react';
import { useConfigTransfer } from './useConfigTransfer';
import { useStudioStore } from '../../store/useStudioStore';
import { getDefaultExportName } from '../../lib/namingUtils';

/**
 * 移动端顶栏的紧凑存档/读档条（lg 以下显示，放在"编辑"按钮旁边，抽屉外）。
 * 与"编辑"按钮同款 pill 样式：导出下拉（导出配置 / 导出当前页 / 导出全部页面）+ 导入。
 * 逻辑复用 useConfigTransfer；与抽屉内的 ConfigToolbar 共享同一 store。
 */
interface MobileConfigBarProps {
  onExportPng?: () => void;
  isPngExporting?: boolean;
  onExportAllPng?: () => void;
}

const pillBtn =
  'flex items-center gap-1 px-2.5 py-2 rounded-xl bg-black/50 backdrop-blur-md text-white/80 text-[11px] font-black border border-white/10 hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const MobileConfigBar: React.FC<MobileConfigBarProps> = ({ onExportPng, isPngExporting, onExportAllPng }) => {
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
  const customExportName = useStudioStore((s) => s.customExportName);
  const setCustomExportName = useStudioStore((s) => s.setCustomExportName);
  const autoExportConfig = useStudioStore((s) => s.autoExportConfig);
  const setAutoExportConfig = useStudioStore((s) => s.setAutoExportConfig);
  const getExportName = useStudioStore((s) => s.getExportName);
  const pages = useStudioStore((s) => s.pages);
  const currentPageId = useStudioStore((s) => s.currentPageId);
  const floatingElements = useStudioStore((s) => s.floatingElements);
  const title = useStudioStore((s) => s.title);

  const defaultExportName = getDefaultExportName({ pages, currentPageId, floatingElements, title, customExportName: '' });
  const effectiveExportName = getExportName();
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
              <div className="absolute top-full left-0 mt-1 z-50 w-56 rounded-2xl bg-[#141414] border border-white/[0.1] shadow-2xl overflow-hidden backdrop-blur-2xl">
                {/* 文件命名配置块 */}
                <div className="p-3 bg-white/[0.03] border-b border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-white/45 uppercase tracking-wider flex items-center gap-1">
                      <PenLine className="w-3 h-3 text-red-400" />
                      导出命名
                    </span>
                    {customExportName && (
                      <button
                        type="button"
                        onClick={() => setCustomExportName('')}
                        className="text-[9px] text-white/40 hover:text-red-400 transition-colors flex items-center gap-0.5"
                        title="恢复为第一张图片最大字号文本命名"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        默认
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customExportName}
                    onChange={(e) => setCustomExportName(e.target.value)}
                    placeholder={defaultExportName || 'redcanvas'}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                  <div className="mt-1.5 text-[9px] text-white/35 truncate" title={`${effectiveExportName}.png`}>
                    预览: <span className="text-white/60 font-mono">{effectiveExportName}.png</span>
                  </div>
                </div>

                {/* 一并导出配置开关 */}
                <div className="px-3 py-2 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className={`w-3.5 h-3.5 ${autoExportConfig ? 'text-emerald-400' : 'text-white/30'}`} />
                    <span className="text-[10px] font-bold text-white/70">一并导出配置</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoExportConfig(!autoExportConfig)}
                    className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${autoExportConfig ? 'bg-emerald-500' : 'bg-white/20'}`}
                    title={autoExportConfig ? '已开启：导出图片时自动备份配置，防止工程丢失' : '已关闭'}
                  >
                    <span className={`block w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${autoExportConfig ? 'left-3.5' : 'left-0.5'}`} />
                  </button>
                </div>

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
                      <div className="text-[11px] font-bold text-white/80">导出当前页图片</div>
                      <div className="text-[9px] text-white/30 font-medium">
                        高清 PNG{autoExportConfig ? ' · 一并备份配置' : ' · 2.5x'}
                      </div>
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
                      <div className="text-[9px] text-white/30 font-medium">
                        逐页高清 PNG{autoExportConfig ? ' + 项目配置' : ''} · 打包 ZIP
                      </div>
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

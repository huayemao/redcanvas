'use client';

import React, { useRef, useState } from 'react';
import { Download, Upload, Check, AlertCircle, Image as ImageIcon, Loader2, ChevronDown, FileText } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { packConfigZip, unpackConfigZip } from '../../lib/configPack';

/**
 * 存档 / 读档工具栏
 * - 导出：有图片资源 → ZIP（含 config.json + assets/）；无图片 → 纯 JSON 文件
 * - 导入：按文件扩展名 / MIME 分派（.zip → ZIP；.json → JSON）
 */
interface ConfigToolbarProps {
  onExportPng?: () => void;
  isPngExporting?: boolean;
}

export const ConfigToolbar: React.FC<ConfigToolbarProps> = ({ onExportPng, isPngExporting }) => {
  const { exportConfig, importConfig, images, floatingElements } = useStudioStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const flashToast = (kind: 'ok' | 'err', msg: string) => {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 2600);
  };

  // 是否存在图片资源（图库 + 元素里 imageUrl 非空且非空字符串）
  const hasImageAssets = (() => {
    const inLib = images.some((i) => i.url);
    const inEls = floatingElements.some(
      (e) => typeof e.imageUrl === 'string' && e.imageUrl,
    );
    return inLib || inEls;
  })();

  const stampName = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const snapshot = exportConfig();
      if (hasImageAssets) {
        // —— ZIP 模式 ——
        const { blob, assetsCount, skipped } = await packConfigZip(snapshot);
        triggerDownload(blob, `redcanvas-config-${stampName()}.zip`);
        const skipNote = skipped.length > 0 ? ` · ${skipped.length} 张跳过` : '';
        flashToast('ok', `已导出 ZIP（含 ${assetsCount} 张图片${skipNote}）`);
      } else {
        // —— 纯 JSON 模式 ——
        const json = JSON.stringify(snapshot, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        triggerDownload(blob, `redcanvas-config-${stampName()}.json`);
        flashToast('ok', '配置已导出（无图片，纯 JSON）');
      }
    } catch (e) {
      flashToast('err', '导出失败：' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  };

  const handleImportClick = () => {
    if (busy) return;
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (busy) return;
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      const isZip =
        name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
      const isJson = name.endsWith('.json') || file.type === 'application/json';

      if (isZip) {
        // —— ZIP 读档 ——
        const snapshot = await unpackConfigZip(file);
        if (!snapshot) {
          flashToast('err', 'ZIP 内未找到有效的 config.json');
          return;
        }
        const ok = importConfig(snapshot);
        if (ok) {
          flashToast('ok', '配置已读档（含图片资源）');
        } else {
          flashToast('err', 'config.json 格式不正确');
        }
      } else if (isJson) {
        // —— 纯 JSON 读档 ——
        const text = await file.text();
        const parsed = JSON.parse(text);
        const ok = importConfig(parsed);
        if (ok) {
          flashToast('ok', '配置已读档');
        } else {
          flashToast('err', 'JSON 文件缺少 __type 标记');
        }
      } else {
        flashToast('err', '不支持的文件类型（请选 .json 或 .zip）');
      }
    } catch (err) {
      flashToast('err', '解析失败：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

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
                  onClick={() => { setExportMenuOpen(false); handleExport(); }}
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
                      <div className="text-[11px] font-bold text-white/80">导出图片</div>
                      <div className="text-[9px] text-white/30 font-medium">高清 PNG · 2.5x</div>
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

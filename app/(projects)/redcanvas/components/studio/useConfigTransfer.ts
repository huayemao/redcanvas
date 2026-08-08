'use client';

import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { packConfigZip, unpackConfigZip } from '../../lib/configPack';

export interface ConfigToast {
  kind: 'ok' | 'err';
  msg: string;
}

/**
 * 配置导入/导出的共享逻辑（存档/读档）。
 * 供 ConfigToolbar（侧栏/抽屉）与 MobileConfigBar（移动端顶栏）复用，避免重复实现。
 * - 导出：有图片资源 → ZIP（含 config.json + assets/）；无图片 → 纯 JSON
 * - 导入：按文件扩展名 / MIME 分派（.zip → ZIP；.json → JSON）
 */
export function useConfigTransfer() {
  const { exportConfig, importConfig, images, floatingElements } = useStudioStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ConfigToast | null>(null);
  const [busy, setBusy] = useState(false);

  const flashToast = (kind: 'ok' | 'err', msg: string) => {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 2600);
  };

  // 是否存在图片资源（图库 + 元素里 imageUrl 非空）
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

  const handleExportConfig = async () => {
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

  return {
    fileRef,
    toast,
    busy,
    hasImageAssets,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
  };
}

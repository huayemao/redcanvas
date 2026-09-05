import JSZip from 'jszip';
import { StudioConfigSnapshot, StudioProjectSnapshot } from '../store/useStudioStore';

// ============================================================================
//  配置 ZIP 打包 / 解包
//  - 导出：snapshot + 图片资源 → ZIP（含 config.json + assets/*）
//  - 导入：ZIP → snapshot（图片资源转 blob URL 注回 imageUrl）
//  兼容 v1 单页（redcanvas-studio-config）与 v2 多页项目（redcanvas-studio-project）：
//  url/imageUrl 收集与改写均递归遍历，无需感知具体层级。
//  设计原则：远程 URL fetch 失败时保留原值，避免阻塞导出
// ============================================================================

/** 递归收集对象里所有"图片资源 URL"（仅 url / imageUrl 字段），去重后返回 */
function collectAssetUrls(root: unknown): string[] {
  const urls = new Set<string>();
  const walk = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if ((k === 'url' || k === 'imageUrl') && typeof v === 'string' && v) {
        urls.add(v);
      } else {
        walk(v);
      }
    }
  };
  walk(root);
  return Array.from(urls);
}

function normalizeAssetPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

/** 递归把对象里名为 url/imageUrl 的字符串字段，按 map 替换 */
function remapAssetFields<T>(obj: T, map: Map<string, string>): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((v) => remapAssetFields(v, map)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if ((k === 'url' || k === 'imageUrl') && typeof v === 'string') {
        const norm = normalizeAssetPath(v);
        if (map.has(v)) {
          out[k] = map.get(v);
        } else if (map.has(norm)) {
          out[k] = map.get(norm);
        } else {
          out[k] = v;
        }
      } else {
        out[k] = remapAssetFields(v, map);
      }
    }
    return out as unknown as T;
  }
  return obj;
}

/** 从 Blob 的 mime 或 URL 推断扩展名；未知时回退 png */
function extFromBlob(blob: Blob, url?: string): string {
  if (url && (/^data:image\/svg/i.test(url) || /\.svg([?#].*)?$/i.test(url))) {
    return 'svg';
  }
  const t = blob.type.toLowerCase();
  if (t === 'image/jpeg' || t === 'image/jpg') return 'jpg';
  if (t === 'image/png') return 'png';
  if (t === 'image/gif') return 'gif';
  if (t === 'image/webp') return 'webp';
  if (t === 'image/svg+xml' || t === 'text/xml+svg') return 'svg';
  if (t === 'image/avif') return 'avif';
  if (url) {
    const match = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
    if (match) {
      const ext = match[1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  }
  // 兜底
  return 'png';
}

function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'svg': return 'image/svg+xml';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'avif': return 'image/avif';
    default: return 'application/octet-stream';
  }
}

/**
 * 把 snapshot 打包成 ZIP Blob。
 * - 配置写入 config.json
 * - 所有图片资源 fetch 后放入 assets/img-<n>.<ext>
 * - snapshot 里的 url/imageUrl 改写为 assets 相对路径
 * - fetch 失败的资源保留原 URL（不阻塞导出）
 */
export async function packConfigZip(
  snapshot: StudioProjectSnapshot | StudioConfigSnapshot,
): Promise<{ blob: Blob; assetsCount: number; skipped: string[] }> {
  const zip = new JSZip();
  const urls = collectAssetUrls(snapshot);
  const urlToZipPath = new Map<string, string>();
  const skipped: string[] = [];

  let idx = 0;
  for (const url of urls) {
    try {
      // fetch 同时支持 http(s) URL、同源 /xxx 路径、data: URL
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      // 跳过空 blob
      if (blob.size === 0) throw new Error('empty blob');
      const ext = extFromBlob(blob, url);
      const zipPath = `assets/img-${idx}.${ext}`;
      zip.file(zipPath, blob);
      urlToZipPath.set(url, zipPath);
      idx++;
    } catch (e) {
      // 失败保留原 URL
      skipped.push(`${url} (${e instanceof Error ? e.message : String(e)})`);
    }
  }

  // 改写 snapshot 里的 url/imageUrl
  const remapped = remapAssetFields(snapshot, urlToZipPath);
  zip.file('config.json', JSON.stringify(remapped, null, 2));

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  return { blob, assetsCount: urlToZipPath.size, skipped };
}

/**
 * 从 ZIP Blob 解出 snapshot。
 * - 读 config.json（v1 单页 / v2 多页项目均支持）
 * - 把 assets/* 资源转成 blob URL / data URL，回填到 snapshot 的 url/imageUrl
 * - 找不到 config.json 或 __type 不合法 → 返回 null
 */
export async function unpackConfigZip(
  blob: Blob,
): Promise<StudioProjectSnapshot | StudioConfigSnapshot | null> {
  const zip = await JSZip.loadAsync(blob);
  const configFile = zip.file('config.json');
  if (!configFile) return null;
  const text = await configFile.async('string');
  let snapshot: StudioProjectSnapshot | StudioConfigSnapshot;
  try {
    snapshot = JSON.parse(text) as StudioProjectSnapshot | StudioConfigSnapshot;
  } catch {
    return null;
  }
  if (
    !snapshot ||
    (snapshot.__type !== 'redcanvas-studio-config' && snapshot.__type !== 'redcanvas-studio-project')
  ) {
    return null;
  }

  // 收集所有 assets/* 文件，建立 zipPath → blobUrl / dataUrl
  const zipPathToBlobUrl = new Map<string, string>();
  const assetEntries = Object.entries(zip.files).filter(
    ([path, f]) => !f.dir && path.replace(/\\/g, '/').startsWith('assets/'),
  );
  for (const [rawPath, f] of assetEntries) {
    const path = rawPath.replace(/\\/g, '/');
    try {
      if (path.toLowerCase().endsWith('.svg')) {
        // SVG 特殊处理：转为标准 data:image/svg+xml Data URL
        // 1. 规避 JSZip 默认 blob.type 为空导致浏览器 <img> 拒绝渲染 SVG（XML 需显式 MIME）
        // 2. data:image/svg 前缀使 isSvgSource / isSvgUrl 能准确识别为 SVG，保留前景色染色与侧边栏控制项
        // 3. 与用户手动上传 SVG 时的行为（ElementsControlTab 中转存为 data URL）保持完全一致
        const base64 = await f.async('base64');
        const dataUrl = `data:image/svg+xml;base64,${base64}`;
        zipPathToBlobUrl.set(rawPath, dataUrl);
        zipPathToBlobUrl.set(path, dataUrl);
      } else {
        const mime = mimeFromPath(path);
        const ab = await f.async('blob');
        const blob = ab.type === mime ? ab : ab.slice(0, ab.size, mime);
        const blobUrl = URL.createObjectURL(blob);
        zipPathToBlobUrl.set(rawPath, blobUrl);
        zipPathToBlobUrl.set(path, blobUrl);
      }
    } catch {
      // 单个资源失败跳过
    }
  }

  // 把 snapshot 里所有以 assets/ 开头的 url/imageUrl 替换为 blobUrl / dataUrl
  const remapped = remapAssetFields(snapshot, zipPathToBlobUrl);
  return remapped;
}

/**
 * 把多页导出的 PNG Blob 打包成一个 ZIP（批量导出用）。items 顺序即页面顺序。
 */
export async function packImageBlobsZip(
  items: { name: string; blob: Blob }[],
): Promise<Blob> {
  const zip = new JSZip();
  for (const item of items) {
    zip.file(item.name, item.blob);
  }
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 3 },
  });
}

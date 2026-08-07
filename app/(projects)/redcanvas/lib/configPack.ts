import JSZip from 'jszip';
import { StudioConfigSnapshot } from '../store/useStudioStore';

// ============================================================================
//  配置 ZIP 打包 / 解包
//  - 导出：snapshot + 图片资源 → ZIP（含 config.json + assets/*）
//  - 导入：ZIP → snapshot（图片资源转 blob URL 注回 imageUrl）
//  设计原则：远程 URL fetch 失败时保留原值，避免阻塞导出
// ============================================================================

/** 收集 snapshot 里所有"图片资源 URL"（仅 url / imageUrl 字段），去重后返回 */
function collectAssetUrls(snapshot: StudioConfigSnapshot): string[] {
  const urls = new Set<string>();
  for (const img of snapshot.images ?? []) {
    if (typeof img.url === 'string' && img.url) urls.add(img.url);
  }
  for (const el of snapshot.floatingElements ?? []) {
    if (typeof el.imageUrl === 'string' && el.imageUrl) urls.add(el.imageUrl);
  }
  return Array.from(urls);
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
      if ((k === 'url' || k === 'imageUrl') && typeof v === 'string' && map.has(v)) {
        out[k] = map.get(v);
      } else {
        out[k] = remapAssetFields(v, map);
      }
    }
    return out as unknown as T;
  }
  return obj;
}

/** 从 Blob 的 mime 推断扩展名；未知时回退 png */
function extFromBlob(blob: Blob): string {
  const t = blob.type.toLowerCase();
  if (t === 'image/jpeg' || t === 'image/jpg') return 'jpg';
  if (t === 'image/png') return 'png';
  if (t === 'image/gif') return 'gif';
  if (t === 'image/webp') return 'webp';
  if (t === 'image/svg+xml') return 'svg';
  if (t === 'image/avif') return 'avif';
  // 兜底
  return 'png';
}

/**
 * 把 snapshot 打包成 ZIP Blob。
 * - 配置写入 config.json
 * - 所有图片资源 fetch 后放入 assets/img-<n>.<ext>
 * - snapshot 里的 url/imageUrl 改写为 assets 相对路径
 * - fetch 失败的资源保留原 URL（不阻塞导出）
 */
export async function packConfigZip(
  snapshot: StudioConfigSnapshot,
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
      const ext = extFromBlob(blob);
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
 * - 读 config.json
 * - 把 assets/* 资源转成 blob URL，回填到 snapshot 的 url/imageUrl
 * - 找不到 config.json → 返回 null
 */
export async function unpackConfigZip(
  blob: Blob,
): Promise<StudioConfigSnapshot | null> {
  const zip = await JSZip.loadAsync(blob);
  const configFile = zip.file('config.json');
  if (!configFile) return null;
  const text = await configFile.async('string');
  let snapshot: StudioConfigSnapshot;
  try {
    snapshot = JSON.parse(text) as StudioConfigSnapshot;
  } catch {
    return null;
  }
  if (!snapshot || snapshot.__type !== 'redcanvas-studio-config') return null;

  // 收集所有 assets/* 文件，建立 zipPath → blobUrl
  const zipPathToBlobUrl = new Map<string, string>();
  const assetEntries = Object.entries(zip.files).filter(
    ([path, f]) => !f.dir && path.startsWith('assets/'),
  );
  for (const [path, f] of assetEntries) {
    try {
      const ab = await f.async('blob');
      const blobUrl = URL.createObjectURL(ab);
      zipPathToBlobUrl.set(path, blobUrl);
    } catch {
      // 单个资源失败跳过
    }
  }

  // 把 snapshot 里所有以 assets/ 开头的 url/imageUrl 替换为 blobUrl
  const remapped = remapAssetFields(snapshot, zipPathToBlobUrl);
  return remapped;
}

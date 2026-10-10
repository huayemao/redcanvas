import JSZip from 'jszip';
import { StudioConfigSnapshot, StudioProjectSnapshot, StudioPageFields } from '../store/useStudioStore';

// ============================================================================
//  配置 ZIP 打包 / 解包
//  - 导出：snapshot + 图片资源 → ZIP（含 config.json + assets/*）
//  - 导入：ZIP → snapshot（图片资源转 blob URL 注回 imageUrl）
//  兼容 v1 单页（redcanvas-studio-config）与 v2 多页项目（redcanvas-studio-project）：
//  精准收集各页实际引用的图片/材质资源，绝不打包当前任何页面都未引用的冗余文件。
//  设计原则：远程 URL fetch 失败时保留原值，避免阻塞导出
// ============================================================================

/**
 * 获取某个页面中所有实际被引用的图片/材质资源 URL（去重集合）。
 * 引用来源包括：
 * 1. 浮动元素 (image / asset) 的非空 imageUrl
 * 2. 背景元素在 blur 模式下的非空 imageUrl (非 blur 模式不计为引用)
 * 3. 背景元素或其它元素设置的非空 textureUrl
 * 4. 页面级别的非空 bgTexture
 * 5. 如果页面处于 blur 模式且背景元素缺少 imageUrl，fallback 取 images[0].url
 */
export function getPageReferencedAssetUrls(pageData: Partial<StudioPageFields>): Set<string> {
  const referenced = new Set<string>();
  if (!pageData) return referenced;

  const isBlurBg = pageData.bgType === 'blur';
  const bgElement = pageData.floatingElements?.find((e) => e.type === 'background');
  const bgVariantIsBlur = bgElement?.bgVariant === 'blur' || isBlurBg;

  // 1. 遍历 floatingElements
  for (const el of pageData.floatingElements || []) {
    if (!el) continue;
    if ((el.type === 'image' || el.type === 'asset') && typeof el.imageUrl === 'string' && el.imageUrl.trim()) {
      referenced.add(el.imageUrl.trim());
    }
    if (el.type === 'background') {
      if (bgVariantIsBlur && typeof el.imageUrl === 'string' && el.imageUrl.trim()) {
        referenced.add(el.imageUrl.trim());
      }
      if (typeof el.textureUrl === 'string' && el.textureUrl.trim()) {
        referenced.add(el.textureUrl.trim());
      }
    } else if (typeof el.textureUrl === 'string' && el.textureUrl.trim()) {
      referenced.add(el.textureUrl.trim());
    }
  }

  // 2. 页面 bgTexture
  if (typeof pageData.bgTexture === 'string' && pageData.bgTexture.trim()) {
    referenced.add(pageData.bgTexture.trim());
  }

  // 3. blur 模式下若背景元素未指定 imageUrl，画布会 fallback 读取 images[0]
  if (bgVariantIsBlur && !bgElement?.imageUrl && pageData.images?.[0]?.url?.trim()) {
    referenced.add(pageData.images[0].url.trim());
  }

  return referenced;
}

/**
 * 清洗快照：
 * 1. 遍历所有页面，收集各页实际引用的图片资源 URL；
 * 2. 对每个页面：
 *    - 如果背景不是 blur 模式，清除 background 元素的 imageUrl 历史残留（设为空字符串）；
 *    - 过滤 pageData.images，只保留当前页面实际引用的图片项；
 * 3. 统计整个快照中被当前任何页面引用的总资源集合；
 * 4. 确保导出的 ZIP assets 里仅包含有实际引用的资源，绝不打包未引用的资源；
 *    无任何图片资源引用时返回纯 JSON。
 */
export function sanitizeSnapshotForExport<T extends StudioProjectSnapshot | StudioConfigSnapshot>(
  snapshot: T,
): { cleanSnapshot: T; referencedUrls: Set<string> } {
  // 深拷贝快照，避免直接修改运行时 store
  const clean = JSON.parse(JSON.stringify(snapshot)) as T;
  const allReferenced = new Set<string>();

  if (clean.__type === 'redcanvas-studio-project') {
    const proj = clean as StudioProjectSnapshot;
    for (const page of proj.pages || []) {
      if (!page?.data) continue;
      const pageReferenced = getPageReferencedAssetUrls(page.data);
      for (const u of pageReferenced) allReferenced.add(u);

      const isBlur = page.data.bgType === 'blur';
      // 清理未处于 blur 模式的背景元素上的无用 imageUrl 残留
      if (Array.isArray(page.data.floatingElements)) {
        page.data.floatingElements = page.data.floatingElements.map((el) => {
          if (el.type === 'background') {
            const elBlur = el.bgVariant === 'blur' || isBlur;
            return {
              ...el,
              imageUrl: elBlur ? (el.imageUrl || '') : '',
            };
          }
          return el;
        });
      }

      // 仅保留该页面实际引用的 images 项
      if (Array.isArray(page.data.images)) {
        page.data.images = page.data.images.filter((img) => img?.url && pageReferenced.has(img.url.trim()));
      }
    }
  } else if (clean.__type === 'redcanvas-studio-config') {
    const single = clean as StudioConfigSnapshot;
    const pageReferenced = getPageReferencedAssetUrls(single);
    for (const u of pageReferenced) allReferenced.add(u);

    const isBlur = single.bgType === 'blur';
    if (Array.isArray(single.floatingElements)) {
      single.floatingElements = single.floatingElements.map((el) => {
        if (el.type === 'background') {
          const elBlur = el.bgVariant === 'blur' || isBlur;
          return {
            ...el,
            imageUrl: elBlur ? (el.imageUrl || '') : '',
          };
        }
        return el;
      });
    }

    if (Array.isArray(single.images)) {
      single.images = single.images.filter((img) => img?.url && pageReferenced.has(img.url.trim()));
    }
  }

  return { cleanSnapshot: clean, referencedUrls: allReferenced };
}

/** 收集快照中所有页面实际引用的图片资源 URL（去重） */
export function collectAssetUrls(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== 'object') return [];
  const s = snapshot as StudioProjectSnapshot | StudioConfigSnapshot;
  if (s.__type === 'redcanvas-studio-project' || s.__type === 'redcanvas-studio-config') {
    const { referencedUrls } = sanitizeSnapshotForExport(s);
    return Array.from(referencedUrls);
  }
  return [];
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
 * - 仅将当前工程中实际引用的图片资源 fetch 后放入 assets/img-<n>.<ext>
 * - snapshot 里的 url/imageUrl 改写为 assets 相对路径
 * - fetch 失败的资源保留原 URL（不阻塞导出）
 */
export async function packConfigZip(
  snapshot: StudioProjectSnapshot | StudioConfigSnapshot,
): Promise<{ blob: Blob; assetsCount: number; skipped: string[] }> {
  const { cleanSnapshot, referencedUrls } = sanitizeSnapshotForExport(snapshot);
  const zip = new JSZip();
  const urlToZipPath = new Map<string, string>();
  const skipped: string[] = [];

  let idx = 0;
  for (const url of referencedUrls) {
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

  // 改写 cleanSnapshot 里的 url/imageUrl
  const remapped = remapAssetFields(cleanSnapshot, urlToZipPath);
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
 * - 兼容多页导出包结构：若顶层未找到 config.json，则自动探测内嵌的 *-config.zip 或 config.zip / *.json
 */
export async function unpackConfigZip(
  blob: Blob | ArrayBuffer,
): Promise<StudioProjectSnapshot | StudioConfigSnapshot | null> {
  const data = typeof (blob as Blob)?.arrayBuffer === 'function' ? await (blob as Blob).arrayBuffer() : blob;
  const zip = await JSZip.loadAsync(data);
  let targetZip = zip;
  let configFile = zip.file('config.json');

  if (!configFile) {
    // 兼容外层多页导出包结构：压缩包内包含一个独立的 *-config.zip 或 config.zip
    const innerZipEntry = Object.entries(zip.files).find(
      ([path, f]) => !f.dir && path.toLowerCase().endsWith('.zip')
    );
    if (innerZipEntry) {
      try {
        const innerData = await innerZipEntry[1].async('arraybuffer');
        targetZip = await JSZip.loadAsync(innerData);
        configFile = targetZip.file('config.json');
      } catch {
        // 内层 zip 读取失败继续向下
      }
    } else {
      // 检查是否有内嵌的 *-config.json 或 config.json
      const innerJsonEntry = Object.entries(zip.files).find(
        ([path, f]) => !f.dir && (path.toLowerCase().endsWith('-config.json') || path.toLowerCase() === 'config.json' || path.toLowerCase().endsWith('.json'))
      );
      if (innerJsonEntry) {
        try {
          const jsonText = await innerJsonEntry[1].async('string');
          const parsed = JSON.parse(jsonText);
          if (
            parsed &&
            (parsed.__type === 'redcanvas-studio-config' || parsed.__type === 'redcanvas-studio-project')
          ) {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
    }
  }

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

  // 收集 targetZip 中所有 assets/* 文件，建立 zipPath → blobUrl / dataUrl
  const zipPathToBlobUrl = new Map<string, string>();
  const assetEntries = Object.entries(targetZip.files).filter(
    ([path, f]) => !f.dir && path.replace(/\\/g, '/').startsWith('assets/'),
  );
  for (const [rawPath, f] of assetEntries) {
    const path = rawPath.replace(/\\/g, '/');
    try {
      if (path.toLowerCase().endsWith('.svg')) {
        // SVG 特殊处理：转为标准 data:image/svg+xml Data URL
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

/**
 * 判断快照中是否包含当前任何页面实际引用的图片资源
 */
export function snapshotHasImageAssets(snapshot: unknown): boolean {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const s = snapshot as StudioProjectSnapshot | StudioConfigSnapshot;
  if (s.__type === 'redcanvas-studio-project' || s.__type === 'redcanvas-studio-config') {
    const { referencedUrls } = sanitizeSnapshotForExport(s);
    return referencedUrls.size > 0;
  }
  return false;
}

/** 生成时间戳后缀：YYYYMMDD-HHmm */
export function formatTimestampName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/**
 * 将 snapshot 生成独立导出的文件 Blob（含文件名与类型）。
 * - 若含实际引用的图片资源，打包为 ZIP（含 config.json + assets/）
 * - 若无图片资源，输出纯 JSON
 */
export async function generateConfigExportFile(
  snapshot: StudioProjectSnapshot | StudioConfigSnapshot,
  baseName: string = 'redcanvas'
): Promise<{ blob: Blob; filename: string; isZip: boolean }> {
  const { cleanSnapshot, referencedUrls } = sanitizeSnapshotForExport(snapshot);
  const hasAssets = referencedUrls.size > 0;
  const stamp = formatTimestampName();
  if (hasAssets) {
    const { blob } = await packConfigZip(cleanSnapshot);
    return {
      blob,
      filename: `${baseName}-config-${stamp}.zip`,
      isZip: true,
    };
  } else {
    const json = JSON.stringify(cleanSnapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    return {
      blob,
      filename: `${baseName}-config-${stamp}.json`,
      isZip: false,
    };
  }
}

/**
 * 把多页导出的 PNG Blob 与项目配置打包进同一个 ZIP。
 * 1. 包含用户可直接查阅/发布的各页高清 PNG（直接位于压缩包根目录下）；
 * 2. 包含一个独立的项目配置压缩包（如 <baseName>-config.zip，或纯 JSON <baseName>-config.json），
 *    而不是把 config.json 和 assets 文件夹散落混在根目录下。
 */
export async function packImagesAndConfigZip(
  items: { name: string; blob: Blob }[],
  snapshot?: StudioProjectSnapshot | StudioConfigSnapshot,
  baseName: string = 'redcanvas',
): Promise<Blob> {
  const zip = new JSZip();

  // 1. 放入各页图片（位于压缩包根目录，方便用户直接查阅或发帖）
  for (const item of items) {
    const data = typeof item.blob?.arrayBuffer === 'function' ? await item.blob.arrayBuffer() : item.blob;
    zip.file(item.name, data);
  }

  // 2. 若传入 snapshot，一并打包工程配置为独立的压缩包或 JSON 文件
  //    注意：不要把 config.json 和 assets 文件夹散落混在根目录下，而是直接作为一个内嵌的配置包
  if (snapshot) {
    const { cleanSnapshot, referencedUrls } = sanitizeSnapshotForExport(snapshot);
    if (referencedUrls.size > 0) {
      const { blob } = await packConfigZip(cleanSnapshot);
      const configData = typeof blob?.arrayBuffer === 'function' ? await blob.arrayBuffer() : blob;
      zip.file(`${baseName}-config.zip`, configData);
    } else {
      const json = JSON.stringify(cleanSnapshot, null, 2);
      zip.file(`${baseName}-config.json`, json);
    }
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 4 },
  });
}

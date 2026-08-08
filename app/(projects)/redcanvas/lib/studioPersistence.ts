import { useEffect, useRef } from 'react';
import { useStudioStore, StudioConfigSnapshot } from '../store/useStudioStore';

// ============================================================================
//  本地化持久化（IndexedDB）
//  - localStorage 配额（~5MB）装不下多张图片的 base64，ZIP 导入后图片会被降级丢弃；
//    改用 IndexedDB：图片以 Blob（二进制）单独存于 assets store，按内容哈希去重，
//    配置存于 config store。拖拽等不含图片变化的编辑只需重写小体积 config，性能稳定。
//  - 远程 URL（http/https/相对路径）原样保留（服务器已托管，无需入库）；
//    仅 blob:/data: 这类会话级 URL 才入库，刷新后用 Blob 重建 blob URL 还原。
// ============================================================================

const DB_NAME = 'redcanvas-studio';
const DB_VERSION = 1;
const CONFIG_STORE = 'config';
const ASSETS_STORE = 'assets';
const CONFIG_KEY = 'current';
const IDB_SCHEME = 'idb://';

// 会话级缓存：原始 url → 资源 key。blob URL 在会话内稳定，命中缓存可避免重复 fetch/hash/写入。
const urlToKeyCache = new Map<string, string>();

// ---------------- IndexedDB 基础 ----------------
let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('indexedDB unavailable'));
  }
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(CONFIG_STORE)) db.createObjectStore(CONFIG_STORE);
        if (!db.objectStoreNames.contains(ASSETS_STORE)) db.createObjectStore(ASSETS_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function idbPut(db: IDBDatabase, store: string, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbGet<T>(db: IDBDatabase, store: string, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbAllKeys(db: IDBDatabase, store: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAllKeys();
    req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(String));
    req.onerror = () => reject(req.error);
  });
}

// ---------------- 资源 URL 处理 ----------------
function isLocalAssetUrl(url: unknown): url is string {
  return typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('data:'));
}

/** 内容哈希作为资源 key（同图同 key，跨会话天然去重）；subtle 不可用时回退会话内唯一 key */
async function blobToHashKey(blob: Blob): Promise<string> {
  try {
    if (crypto?.subtle) {
      const buf = await blob.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buf);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return `sha256:${hex}`;
    }
  } catch {
    /* fall through */
  }
  return `fallback:${blob.size}:${Date.now()}`;
}

async function fetchBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

/** 递归把对象里名为 url/imageUrl 的字符串字段，按 map 替换 */
function remapUrls<T>(obj: T, map: Map<string, string>): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((v) => remapUrls(v, map)) as unknown as T;
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if ((k === 'url' || k === 'imageUrl') && typeof v === 'string' && map.has(v)) {
        out[k] = map.get(v);
      } else {
        out[k] = remapUrls(v, map);
      }
    }
    return out as unknown as T;
  }
  return obj;
}

/** 收集快照里所有"本地资源 URL"（blob:/data:），去重 */
function collectLocalAssetUrls(snapshot: StudioConfigSnapshot): string[] {
  const set = new Set<string>();
  for (const img of snapshot.images ?? []) if (isLocalAssetUrl(img.url)) set.add(img.url);
  for (const el of snapshot.floatingElements ?? [])
    if (isLocalAssetUrl(el.imageUrl)) set.add(el.imageUrl);
  return Array.from(set);
}

/** 收集快照里所有 idb:// 引用（读取时用） */
function collectIdbRefs(snapshot: StudioConfigSnapshot): string[] {
  const set = new Set<string>();
  const walk = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if ((k === 'url' || k === 'imageUrl') && typeof v === 'string' && v.startsWith(IDB_SCHEME)) {
        set.add(v);
      } else {
        walk(v);
      }
    }
  };
  walk(snapshot);
  return Array.from(set);
}

// ---------------- 持久化：保存 ----------------
export async function saveStudioConfig(snapshot: StudioConfigSnapshot): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  try {
    const db = await getDb();
    const localUrls = collectLocalAssetUrls(snapshot);
    const urlToPersistRef = new Map<string, string>(); // 原始 url → idb://key
    const usedKeys = new Set<string>();

    // 1) 为每个本地 URL 解析/存储 Blob（命中缓存则复用 key，不重复 fetch/写入）
    for (const url of localUrls) {
      let key = urlToKeyCache.get(url);
      if (!key) {
        const blob = await fetchBlob(url);
        if (!blob || blob.size === 0) continue; // 取不到 → 保留原 url（不入库）
        key = await blobToHashKey(blob);
        await idbPut(db, ASSETS_STORE, key, blob);
        urlToKeyCache.set(url, key);
      }
      usedKeys.add(key);
      urlToPersistRef.set(url, `${IDB_SCHEME}${key}`);
    }

    // 2) 改写快照：本地 URL → idb://key；远程/相对 URL 原样保留
    const persistable = remapUrls(snapshot, urlToPersistRef);

    // 3) 写入 config（小体积：引用都是短字符串）
    await idbPut(db, CONFIG_STORE, CONFIG_KEY, persistable);

    // 4) GC：删除 assets 里不再被引用的孤儿
    await gcAssets(db, usedKeys);
  } catch {
    /* ignore */
  }
}

async function gcAssets(db: IDBDatabase, usedKeys: Set<string>): Promise<void> {
  try {
    const all = await idbAllKeys(db, ASSETS_STORE);
    const orphans = all.filter((k) => !usedKeys.has(k));
    if (orphans.length === 0) return;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ASSETS_STORE, 'readwrite');
      const store = tx.objectStore(ASSETS_STORE);
      for (const k of orphans) store.delete(k);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    // 同步清理缓存里指向已删 key 的项
    for (const [url, key] of urlToKeyCache) {
      if (orphans.includes(key)) urlToKeyCache.delete(url);
    }
  } catch {
    /* ignore */
  }
}

// ---------------- 持久化：读取 ----------------
export async function loadStudioConfig(): Promise<StudioConfigSnapshot | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;
  try {
    const db = await getDb();
    const persistable = await idbGet<StudioConfigSnapshot>(db, CONFIG_STORE, CONFIG_KEY);
    if (!persistable || persistable.__type !== 'redcanvas-studio-config') return null;

    // 收集所有 idb:// 引用，读 Blob → 创建新 blob URL 回填
    const idbRefs = collectIdbRefs(persistable);
    if (idbRefs.length === 0) return persistable;

    const refToBlobUrl = new Map<string, string>();
    for (const ref of idbRefs) {
      const key = ref.slice(IDB_SCHEME.length);
      const blob = await idbGet<Blob>(db, ASSETS_STORE, key);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        refToBlobUrl.set(ref, blobUrl);
        // 缓存：新 blob URL → 原 key（下次保存时复用，避免重复 fetch/hash）
        urlToKeyCache.set(blobUrl, key);
      }
    }

    return remapUrls(persistable, refToBlobUrl);
  } catch {
    return null;
  }
}

/** 清除全部持久化数据 */
export function clearStudioConfig(): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  dbPromise = null;
  urlToKeyCache.clear();
  indexedDB.deleteDatabase(DB_NAME);
}

// ---------------- Hook ----------------
/**
 * 在应用根组件调用一次：
 * 1. 首次挂载从 IndexedDB 恢复配置（复用 store.importConfig，含图片比例重测）；
 * 2. 之后订阅 store 变化（防抖 600ms）自动保存 exportConfig() 快照。
 * 注：恢复在 useEffect 中异步执行，避免 SSR/水合不一致；会覆盖 StudioCanvas 首次注入的样例元素。
 */
export function useStudioPersistence(): void {
  const hydratedRef = useRef(false);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    let cancelled = false;
    // 1) 恢复（异步）
    loadStudioConfig().then((snap) => {
      if (cancelled) return;
      if (snap) useStudioStore.getState().importConfig(snap);
      hydratedRef.current = true;
    });

    // 2) 订阅变化（防抖保存 + 无变化跳过）
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useStudioStore.subscribe(() => {
      if (!hydratedRef.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const snapshot = useStudioStore.getState().exportConfig();
        const json = JSON.stringify(snapshot);
        if (json === lastSavedRef.current) return; // 跳过无变化
        lastSavedRef.current = json;
        void saveStudioConfig(snapshot);
      }, 600);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);
}

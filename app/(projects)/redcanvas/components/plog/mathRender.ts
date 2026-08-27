// ============================================================================
//  Markdown 数学公式支持（MathJax v4，按需从 CDN 懒加载）
//  - GFM 已在下方 mdRenderer 构造时启用（gfm: true, breaks: true）
//  - 块级公式：$$ ... $$（独占段落）；行内公式：$ ... $
//  - MathJax v4 的 CSS + JS 仅在首次渲染含公式的文本框时注入 <head>，避免全局加载
//  - v4 原生支持 display 公式自动折行（displayOverflow:'linebreak'），长公式按
//    容器宽度在关系符/运算符处换行，这是选它而非 KaTeX 的决定性原因
// ============================================================================
import { Marked } from 'marked';

// CDN 多源回退：国内镜像优先（jsdelivr/unpkg 在大陆网络或带广告拦截插件的浏览器里常被墙/拦截，
// 单源失败会导致公式永远停留在占位态）
const MATHJAX_SOURCES = [
  'https://registry.npmmirror.com/mathjax/4.1.3/files/tex-chtml.js',
  'https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js',
  'https://unpkg.com/mathjax@4/tex-chtml.js',
];

/** 注入单个 CDN 源；resolve(true)=脚本执行且 startup 完成，resolve(false)=失败/超时 */
function injectMathJaxScript(src: string, timeoutMs = 12000): Promise<boolean> {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      s.remove();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    s.onload = () => {
      // 脚本加载完成 ≠ startup 完成；tex2chtml 需等 startup.promise
      const mj = (window as unknown as { MathJax?: { startup?: { promise?: Promise<void> } } }).MathJax;
      if (mj?.startup?.promise) mj.startup.promise.then(() => finish(true), () => finish(true));
      else finish(true);
    };
    s.onerror = () => finish(false);
    document.head.appendChild(s);
  });
}

let mathJaxLoadPromise: Promise<void> | null = null;
export function ensureMathJaxLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  // 只有 tex2chtmlPromise + getMetricsFor 都可用才算真正就绪：
  // window.MathJax 在脚本加载完成前只是我们挂的配置对象，
  // 若此处误判为已就绪会短路返回，导致排版流程拿不到库、公式永久停留在占位态
  const ready = (window as unknown as {
    MathJax?: { tex2chtmlPromise?: unknown; getMetricsFor?: unknown };
  }).MathJax;
  if (
    ready &&
    typeof ready.tex2chtmlPromise === 'function' &&
    typeof ready.getMetricsFor === 'function'
  ) {
    return Promise.resolve();
  }
  if (mathJaxLoadPromise) return mathJaxLoadPromise;
  mathJaxLoadPromise = (async () => {
    // MathJax 配置必须在脚本加载前挂到 window.MathJax：
    // - startup.typeset:false 关闭自动扫描页面排版，全部走 tex2chtml 手动转换
    // - output.displayOverflow:'linebreak' 开启超宽 display 公式自动折行
    // - options.enableMenu:false 关闭右键菜单，画布内不打扰交互
    if (!(window as unknown as { MathJax?: unknown }).MathJax) {
      (window as unknown as { MathJax?: unknown }).MathJax = {
        startup: { typeset: false },
        output: {
          displayOverflow: 'linebreak',
          linebreaks: { inline: true, width: '100%', lineleading: 0.2 },
        },
        options: { enableMenu: false },
      };
    }
    // 依次尝试各 CDN 源，一个成功即返回
    for (const src of MATHJAX_SOURCES) {
      if (await injectMathJaxScript(src)) return;
    }
    // 全部失败：清掉配置对象避免污染后续判断；渲染端检测不到库会回退为原文占位
    delete (window as unknown as { MathJax?: unknown }).MathJax;
  })();
  return mathJaxLoadPromise;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;',
  );
}

// 用 MathJax 把 TeX 渲染成 HTML 占位结构。
// —— MathJax v4 废弃了 <script type="math/tex"> DOM 扫描，不再支持 script 占位。
// 新方案：把 TeX 原文 + display 标记以 data 属性形式挂到 .math-block / .math-inline
// 包装器上，DOM 挂载后 typesetMathInElement() 直接调用官方推荐的
// MathJax.tex2chtmlPromise() + getMetricsFor() API，按实测容器宽度渲染并折行。
// 仍保留 .math-pending 子节点作为视觉占位（暗淡斜体原文），渲染成功后由
// typesetMathInElement 移除；失败时保留原文给用户看，避免"凭空消失"。
function renderMath(tex: string, displayMode: boolean): string {
  // TeX 写入 data 属性：必须 HTML 转义（尤其双引号 " 会截断属性值）
  const texAttr = escapeHtml(tex);
  // .math-pending 内容：同样转义（放入 text 节点上下文，&<> 必须转义）
  const visible = escapeHtml(tex);
  const displayStr = displayMode ? 'true' : 'false';
  if (displayMode) {
    return (
      `<div class="math-block" data-mj-tex="${texAttr}" data-mj-display="${displayStr}">` +
      `<span class="math-pending">${visible}</span>` +
      `</div>`
    );
  }
  return (
    `<span class="math-inline" data-mj-tex="${texAttr}" data-mj-display="${displayStr}">` +
    `<span class="math-pending">${visible}</span>` +
    `</span>`
  );
}

/** 正在排版中的 root 容器，防止同一容器并发调用（MathJax 非线程安全） */
const _typesettingRoots = new WeakSet<HTMLElement>();

// MathJax v4 全局对象的扩展类型（仅取本文件需要用到的字段，避免与真实 MathJax 类型冲突）
type MathJaxAPI = {
  tex2chtmlPromise: (tex: string, options?: { display?: boolean }) => Promise<HTMLElement>;
  getMetricsFor: (el: Element, display: boolean) => Record<string, unknown>;
  startup: {
    promise?: Promise<void>;
    document?: {
      clear: () => void;
      updateDocument: () => void;
    };
  };
};

/**
 * 对 root 内所有 .math-block / .math-inline[data-mj-tex] 占位执行真实渲染。
 * —— MathJax v4 官方推荐：直接调用 tex2chtmlPromise() 把 TeX 字符串转为
 * mjx-container HTMLElement；配合 getMetricsFor() 从已挂载到 DOM 中的 wrapper
 * 读取实测容器宽度 → displayOverflow:'linebreak' 折行按真实宽度生效。
 *
 * 关键稳定性保障（与旧版 typesetPromise 方案语义对齐）：
 * 1) 同一容器并发调用直接返回，避免 MathJax 内部状态机冲突；
 * 2) 单个公式渲染失败不影响其它公式；
 * 3) 只有"确实渲染成功"的公式才会移除 .math-pending 原文占位；
 *    失败的公式保留 pending + data 属性，下次调用可重试。
 */
export async function typesetMathInElement(root: HTMLElement): Promise<void> {
  if (typeof window === 'undefined') return;
  const wrappers = root.querySelectorAll<HTMLElement>(
    '.math-block[data-mj-tex], .math-inline[data-mj-tex]',
  );
  if (wrappers.length === 0) return;
  if (_typesettingRoots.has(root)) return; // 防并发
  _typesettingRoots.add(root);

  // 每个 wrapper 的待处理快照 + 回滚上下文
  type Job = {
    wrapper: HTMLElement;
    tex: string;
    display: boolean;
    pending: Element | null;
  };
  const jobs: Job[] = [];
  wrappers.forEach((w) => {
    const tex = w.dataset.mjTex;
    if (!tex) return;
    const display = w.dataset.mjDisplay === 'true';
    // 立即清除 data 属性，防止重复进入（失败时会恢复，允许下次重试）
    delete w.dataset.mjTex;
    delete w.dataset.mjDisplay;
    const pending = w.querySelector('.math-pending');
    jobs.push({ wrapper: w, tex, display, pending });
  });
  if (jobs.length === 0) {
    _typesettingRoots.delete(root);
    return;
  }

  try {
    await ensureMathJaxLoaded();
    const mj = (window as unknown as { MathJax?: MathJaxAPI }).MathJax;
    if (!mj || typeof mj.tex2chtmlPromise !== 'function') {
      // MathJax 加载完全失败：恢复 data 属性，保留 pending 原文占位
      jobs.forEach(({ wrapper, tex, display }) => {
        wrapper.dataset.mjTex = tex;
        wrapper.dataset.mjDisplay = display ? 'true' : 'false';
      });
      return;
    }

    for (const job of jobs) {
      try {
        // —— 核心：容器已在 DOM 中，先取实测 metrics（包含宽度/em/ex 信息）
        // 再把 metrics 传给 tex2chtmlPromise → 长公式按真实容器宽度折行
        const metrics =
          typeof mj.getMetricsFor === 'function'
            ? mj.getMetricsFor(job.wrapper, job.display)
            : {};
        const mjx = await mj.tex2chtmlPromise(job.tex, {
          ...metrics,
          display: job.display,
        });
        // v4: tex2chtmlPromise 返回 HTMLElement（不是字符串），直接插入 DOM
        if (job.pending && job.pending.parentNode === job.wrapper) {
          job.wrapper.removeChild(job.pending);
        } else if (job.pending) {
          job.pending.remove();
        }
        job.wrapper.appendChild(mjx);
        // 同步 MathJax 内部文档状态 & 全局 CHTML CSS（避免首次渲染后某些
        // 符号字体缺失，需 clear + updateDocument 把新增节点纳入样式同步）
        mj.startup.document?.clear();
        mj.startup.document?.updateDocument();
      } catch (err) {
        // 单个公式失败：恢复 data-mj-tex / mjDisplay，下次可重试；
        // .math-pending 未被删除 → 用户继续看到原文占位，不凭空消失
        job.wrapper.dataset.mjTex = job.tex;
        job.wrapper.dataset.mjDisplay = job.display ? 'true' : 'false';
        // （用户可调高日志级别排查；默认不污染控制台）
        if (typeof console !== 'undefined' && 'debug' in console) {
          // eslint-disable-next-line no-console
          console.debug('[MathJax] 单条公式渲染失败，已保留原文占位：', job.tex, err);
        }
      }
    }
  } catch {
    // 顶层异常（MathJax 加载/排版流程级错误）：恢复所有 job 的 data 属性，保留 pending
    jobs.forEach(({ wrapper, tex, display }) => {
      wrapper.dataset.mjTex = tex;
      wrapper.dataset.mjDisplay = display ? 'true' : 'false';
    });
  } finally {
    _typesettingRoots.delete(root);
  }
}

// 专用 Marked 实例：启用 GFM + 软换行，并注册数学公式扩展
export const mdRenderer = new Marked({ gfm: true, breaks: true });
mdRenderer.use({
  extensions: [
    {
      name: 'blockMath',
      level: 'block',
      // start：告诉 marked 块公式最早可能出现在哪里（辅助段落中断判断）
      start(src: string) {
        return src.indexOf('$$');
      },
      tokenizer(src: string) {
        const m = /^\s*\$\$([\s\S]+?)\$\$\s*(?:\n+|$)/.exec(src);
        if (!m) return undefined;
        return { type: 'blockMath', raw: m[0], text: m[1].trim() };
      },
      renderer(token) {
        return renderMath((token as unknown as { text: string }).text, true);
      },
    },
    {
      name: 'inlineMath',
      level: 'inline',
      start(src: string) {
        return src.indexOf('$');
      },
      tokenizer(src: string) {
        const m = /^\$([^\$\n]+?)\$(?!\d)/.exec(src);
        if (!m) return undefined;
        return { type: 'inlineMath', raw: m[0], text: m[1].trim() };
      },
      renderer(token) {
        return renderMath((token as unknown as { text: string }).text, false);
      },
    },
  ],
});

/**
 * 保证块级公式 $$...$$ 前后有空行（独立成段）。
 * marked 的段落会一路吞文本直到空行，若 $$ 紧跟在普通文字行后（中间无空行），
 * 块级公式的自定义 tokenizer 根本没机会执行，导致整个公式被当纯文本逐行渲染。
 */
export function ensureMathBlockParagraph(src: string): string {
  const lines = src.split('\n');
  const out: string[] = [];
  let inMath = false; // 当前是否处于 $$ 块内部
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!inMath && t.startsWith('$$')) {
      // 块开始：上一行非空则补空行隔断前面的文字
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(line);
      // 同一行成对闭合（$$...$$）：下一行非空则补空行
      const closedSameLine = t.length > 2 && t.endsWith('$$');
      if (closedSameLine) inMath = false;
      else inMath = true;
      if (!inMath && i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
      continue;
    }
    if (inMath && t.endsWith('$$')) {
      // 块结束：下一行非空则补空行，防止公式块吞掉后续文字
      out.push(line);
      inMath = false;
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

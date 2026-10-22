'use client';

import React from 'react';
import { PlogElement as PlogElementType, ExtractedColors } from '../../types';
import { shadowOf, resolveFontClass, mixColorAlpha } from './elementUtils';
import { typesetMathInElement } from './mathRender';
import {
  isSvgSource,
  getRecoloredSvgDataUrl,
  getCachedRecoloredSvgDataUrl,
  parseRgbColor,
  getColorLuminance,
} from '../../lib/svgRecolor';

// ============================================================================
//  LongTextBody：负责"长文字 + Markdown + 智能配色 + 默认融入背景"
//  - 默认：无卡片背景 / 无阴影 / 无圆角（文字直接铺在背景上，像杂志正文）
//  - 仅当用户显式设置 bgColor 时：渲染卡片外壳（背景 + 圆角 + 阴影）
//  - 文字颜色：用户显式 element.color > 智能配色 palette.textSecondary > 中性色
//  - 链接/引用/strong 强调色：智能配色 palette.accent
//  - 支持 Markdown 内嵌 SVG 图片的自适应调色与阴影深度控制
// ============================================================================
interface LongTextBodyProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
  extractedColors: ExtractedColors | null;
  renderedMd: string;
  effectiveBg?: string;
  canvasTextColor?: string;
}

export const LongTextBody: React.FC<LongTextBodyProps> = ({
  element,
  fontClassName,
  textInlines,
  extractedColors,
  renderedMd,
  effectiveBg,
  canvasTextColor,
}) => {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  // 记录"上次写入 DOM 的 Markdown 内容"。
  // 关键：父组件 PlogElement 因选中态/拖拽/配色等无关字段重渲染时，renderedMd 内容没变，
  // 此时绝不能触碰 bodyRef 的 innerHTML——一旦写 innerHTML，之前 MathJax 排好的 mjx-container
  // 会被全部炸掉，变回 math-pending 占位，而 typeset effect 因 renderedMd（字符串值）和上次
  // 相同会被 React deps 跳过，结果就永久停在 pending 或空白。
  const lastWrittenMd = React.useRef<string>('');

  // 原子化处理：写 HTML + 触发公式排版合并为一个 effect，由 renderedMd / markdownEnabled 驱动
  // 只有当内容真的变化时才执行。这样：
  //   1) 选中态切换等父重渲染 → renderedMd 值不变 → 早返回，DOM 完全不碰 → mjx 保留 ✅
  //   2) toggle markdownEnabled → 分支切换 → 对应分支负责清空/重建 DOM ✅
  //   3) 用户编辑内容（renderedMd 字符串值变了）→ 写新 HTML → typeset 新占位 ✅
  React.useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const mdOn = element.markdownEnabled ?? true;
    if (!mdOn) {
      // Markdown 关闭：清空容器（外层由另一个 <p> 渲染纯文本，内层 Markdown 容器应空）
      if (root.innerHTML !== '') root.innerHTML = '';
      lastWrittenMd.current = '';
      return;
    }
    if (lastWrittenMd.current === renderedMd) return; // 内容不变：DOM 完全不动（保留已排版好的 mjx）
    lastWrittenMd.current = renderedMd;
    // 手动写 DOM，绕开 dangerouslySetInnerHTML 在高频重渲染下的竞态
    // （dangerouslySetInnerHTML 每次 render 都生成新对象字面量，React diff 在 motion/zustand
    //  批处理更新下有概率把字符串相同但对象引用不同的情况当成变更处理）
    root.innerHTML = renderedMd;
    if (root.querySelector('[data-mj-tex]')) {
      void typesetMathInElement(root);
    }

    // 粗体色彩统一特性：扫描所有子元素，只要最终计算样式为粗体，就应用 emphasis 强调色
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const el = node as HTMLElement;
        if (el.tagName === 'A' || el.tagName === 'CODE' || el.tagName === 'PRE') continue;
        const computed = window.getComputedStyle(el);
        const weight = computed.fontWeight;
        const isBold = weight === 'bold' || weight === 'bolder' || (parseInt(weight, 10) >= 600);
        if (isBold) {
          el.style.color = 'var(--lt-emphasis)';
        }
      }
    } catch {
      // 容错降级，由 CSS 规则托底
    }
  }, [renderedMd, element.markdownEnabled]);

  // 粗体色彩统一特性：整块文本只要最终样式是粗体（fontWeight >= 700），也统一应用 emphasis
  const isElementBold = typeof element.fontWeight === 'number' && element.fontWeight >= 700;

  // —— 语义化强调色（先确定加粗色，再用于粗体文字兜底）
  const accent =
    extractedColors?.accent ||
    (element.color ? mixColorAlpha(element.color, 0.85) : '#2563eb');
  const emphasis =
    extractedColors?.emphasis ||
    (element.color ? mixColorAlpha(element.color, 0.9) : accent);

  const isThemeColor =
    !element.color ||
    element.color === extractedColors?.textSecondary ||
    element.color === extractedColors?.textPrimary ||
    element.color === extractedColors?.emphasis;

  // —— 智能配色：若 element 没写 color，或当前为粗体样式，应用对应语义色
  const effColor = isThemeColor
    ? (isElementBold
        ? (emphasis || extractedColors?.textPrimary)
        : (extractedColors?.textSecondary || extractedColors?.textPrimary))
    : (element.color || (element.bgColor ? '#1f2937' : undefined));

  const isDarkBg = effectiveBg
    ? (getColorLuminance(parseRgbColor(effectiveBg) || [15, 23, 42]) < 0.45)
    : (extractedColors?.isDark ?? true);

  const primaryMuted =
    extractedColors?.primaryMuted ||
    (isDarkBg ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)');

  // 分隔线专用颜色：绝不刺眼、不喧宾夺主的极细微透发丝线
  // 深底环境下：以文字色 14% 透明度（或半透明白）呈现，温润低调融入深色画布，克制不刺眼
  // 浅底环境下：以文字色 10% 透明度（或半透明黑）呈现，轻盈雅致
  const hrColor = isDarkBg
    ? (effColor ? mixColorAlpha(effColor, 0.14) : 'rgba(255, 255, 255, 0.14)')
    : (effColor ? mixColorAlpha(effColor, 0.10) : 'rgba(0, 0, 0, 0.08)');

  const tableBorder = effColor
    ? mixColorAlpha(effColor, 0.28)
    : 'rgba(128, 128, 128, 0.3)';
  const tableHeaderBg = effColor
    ? mixColorAlpha(effColor, 0.12)
    : 'rgba(128, 128, 128, 0.12)';
  const tableStripeBg = effColor
    ? mixColorAlpha(effColor, 0.04)
    : 'rgba(128, 128, 128, 0.04)';

  // —— 是否"卡片模式"：仅用户显式给了 bgColor 才算卡片（没给则融入背景，不画外壳）
  const isCardMode = !!element.bgColor;

  const shellStyle: React.CSSProperties = {};
  if (isCardMode) {
    shellStyle.background = element.bgColor;
    shellStyle.borderRadius = `${element.borderRadius ?? 16}px`;
    shellStyle.boxShadow = shadowOf(element.shadowLevel ?? 1);
  }

  const shellPad = isCardMode ? 'px-4 py-3' : 'py-1';
  const shellRadius = isCardMode ? 'rounded-2xl' : '';

  // 注入 CSS var，让 Markdown prose 子元素能拿到语义色
  // --lt-line-height：用户调整的行高倍数；未设时由内层段落类 fallback 到 1.625（原 leading-relaxed）
  const cssVars = {
    '--lt-color': effColor || 'inherit',
    '--lt-accent': accent,            // 链接
    '--lt-emphasis': emphasis,        // 加粗关键词 / 所有粗体专属强调色
    '--lt-primary-muted': primaryMuted, // 引用边框 / 装饰线
    '--lt-hr-color': hrColor,           // 分隔线专用色（微透发丝，克制不突兀）
    '--lt-table-border': tableBorder,   // 表格网格框线
    '--lt-table-header-bg': tableHeaderBg, // 表头背景微高亮
    '--lt-table-stripe-bg': tableStripeBg, // 偶数行轻微斑马纹
    '--lt-line-height': element.lineHeight !== undefined ? String(element.lineHeight) : undefined,
  } as React.CSSProperties;

  // 内层 Markdown 容器的 className（段落排版规则集合；与之前一致）
  const proseClass = [
    // 段落/标题/列表的基础排版
    // leading 用 CSS 变量，用户设的 element.lineHeight 才能覆盖默认 1.625
    '[&>p]:my-2 [&>p]:leading-[var(--lt-line-height,1.625)]',
    '[&_strong]:font-black [&_em]:italic',
    // 标题样式：各级标题最终样式均为粗体，统一应用 emphasis 色
    '[&>h1]:text-2xl [&>h1]:font-black [&>h1]:leading-tight [&>h1]:my-3 [&>h1]:text-[var(--lt-emphasis)]',
    '[&>h2]:text-xl [&>h2]:font-black [&>h2]:leading-tight [&>h2]:my-3 [&>h2]:text-[var(--lt-emphasis)]',
    '[&>h3]:text-lg [&>h3]:font-bold [&>h3]:my-2 [&>h3]:text-[var(--lt-emphasis)]',
    '[&>h4]:text-base [&>h4]:font-bold [&>h4]:my-1.5 [&>h4]:text-[var(--lt-emphasis)]',
    '[&>h5]:text-sm [&>h5]:font-bold [&>h5]:my-1 [&>h5]:text-[var(--lt-emphasis)]',
    '[&>h6]:text-xs [&>h6]:font-bold [&>h6]:my-1 [&>h6]:text-[var(--lt-emphasis)]',
    // 列表基础与多级嵌套支持：解决嵌套列表项目符号被吞与层级缩进缺失问题
    '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2',
    '[&_ul_ul]:list-[circle]',
    '[&_ul_ul_ul]:list-[square]',
    '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2',
    '[&_ol_ol]:list-[lower-alpha]',
    '[&_ol_ol_ol]:list-[lower-roman]',
    '[&_li]:my-0.5 [&_li]:leading-[var(--lt-line-height,1.625)]',
    '[&_li>ul]:my-1 [&_li>ol]:my-1',
    '[&_li>p]:my-0.5',
    '[&_li:has(input[type=checkbox])]:list-none',
    '[&_code]:text-[0.9em] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-white/10',
    '[&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-xs [&_pre]:bg-white/10 [&_pre]:overflow-auto',
    // 链接：accent（高饱和强调，仅留给超链接）
    '[&_a]:underline [&_a]:decoration-[var(--lt-primary-muted)] [&_a]:underline-offset-2 [&_a]:text-[var(--lt-accent)] [&_a:hover]:decoration-[var(--lt-accent)]',
    // 粗体色彩统一特性：只要最终样式是粗体（strong、b、各级标题、th表头、font-bold等），就统一应用 emphasis 语义色
    '[&_strong]:text-[var(--lt-emphasis)]',
    '[&_b]:text-[var(--lt-emphasis)]',
    '[&_b]:font-bold',
    '[&_.font-bold]:text-[var(--lt-emphasis)]',
    '[&_.font-semibold]:text-[var(--lt-emphasis)]',
    '[&_.font-black]:text-[var(--lt-emphasis)]',
    '[&_.font-extrabold]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:bold"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:_bold"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:700"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:_700"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:800"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:_800"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:900"]]:text-[var(--lt-emphasis)]',
    '[&_[style*="font-weight:_900"]]:text-[var(--lt-emphasis)]',
    // 分隔线：高级微透发丝线（绝不刺眼、不喧宾夺主，深色底温润融入，浅色底轻盈雅致）
    '[&_hr]:my-4 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-[var(--lt-hr-color)]',
    // 引用块：SVG 引号装饰 + 斜体（样式在 globals.css 中定义，em 单位随文字自适应）
    '[&_blockquote]:border-0 [&_blockquote]:italic',
    // 表格：清晰框线 + 表头区分 + 单元格边距 + 垂直居中
    '[&_table]:w-full [&_table]:border-collapse [&_table]:my-3',
    '[&_thead]:bg-[var(--lt-table-header-bg)]',
    '[&_th]:border [&_th]:border-[var(--lt-table-border)] [&_th]:px-3 [&_th]:py-2 [&_th]:font-bold [&_th]:align-middle [&_th]:text-[var(--lt-emphasis)]',
    '[&_td]:border [&_td]:border-[var(--lt-table-border)] [&_td]:px-3 [&_td]:py-2 [&_td]:align-middle',
    '[&_tbody_tr:nth-child(even)]:bg-[var(--lt-table-stripe-bg)]',
    // 插图：最大宽度、圆角、居中
    '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-3 [&_img]:mx-auto [&_img]:block',
  ].join(' ');

  // —— Markdown 内嵌 SVG 图片智能染色（支持与文字同色/自定义前景色、深浅底色适配与阴影深度）
  React.useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;

    const imgs = root.querySelectorAll<HTMLImageElement>('img');
    if (imgs.length === 0) return;

    const shouldRecolor = !!element.fgColor && element.fgColor !== 'transparent';
    const targetFg = element.fgColor === 'currentColor'
      ? (canvasTextColor || effColor || '#ffffff')
      : element.fgColor;

    let cancelled = false;

    imgs.forEach(async (img) => {
      let rawSrc = img.getAttribute('data-raw-src');
      if (!rawSrc) {
        rawSrc = img.getAttribute('src') || '';
        if (rawSrc) img.setAttribute('data-raw-src', rawSrc);
      }
      if (!rawSrc || !isSvgSource(rawSrc)) return;

      if (!shouldRecolor || !targetFg) {
        if (img.src !== rawSrc) img.src = rawSrc;
        return;
      }

      const options = {
        invert: element.svgInvert,
        bgColor: effectiveBg,
        shadingDepth: element.svgShadingDepth ?? 1.15,
        colorMode: element.svgColorMode ?? 'tonal',
      };

      try {
        const cached = getCachedRecoloredSvgDataUrl(rawSrc, targetFg, options);
        if (cached) {
          if (img.src !== cached) img.src = cached;
          return;
        }

        const recolored = await getRecoloredSvgDataUrl(rawSrc, targetFg, options);
        if (!cancelled && img.getAttribute('data-raw-src') === rawSrc) {
          img.src = recolored;
        }
      } catch {
        if (!cancelled && img.src !== rawSrc) img.src = rawSrc;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    renderedMd,
    element.fgColor,
    element.svgColorMode,
    element.svgInvert,
    element.svgShadingDepth,
    effectiveBg,
    effColor,
  ]);

  return (
    <div
      className={`max-w-full prose-sm md:prose-base ${shellPad} ${shellRadius} ${resolveFontClass(element.fontFamily, fontClassName)}`}
      style={{
        ...shellStyle,
        color: effColor || 'inherit',
        ...textInlines,
        ...cssVars,
      }}
    >
      {(element.markdownEnabled ?? true) ? (
        // 重要：去掉 dangerouslySetInnerHTML，DOM 由上方 useEffect 管理。
        // 这样 React 永远不会因父组件重渲染而触碰这里的 innerHTML → mjx-container 永保。
        <div ref={bodyRef} className={proseClass} />
      ) : (
        <p className="whitespace-pre-wrap leading-[var(--lt-line-height,1.625)]">{element.content}</p>
      )}
    </div>
  );
};

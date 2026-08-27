'use client';

import React from 'react';
import { PlogElement as PlogElementType, ExtractedColors } from '../../types';
import { shadowOf, resolveFontClass, mixColorAlpha } from './elementUtils';
import { typesetMathInElement } from './mathRender';

// ============================================================================
//  LongTextBody：负责"长文字 + Markdown + 智能配色 + 默认融入背景"
//  - 默认：无卡片背景 / 无阴影 / 无圆角（文字直接铺在背景上，像杂志正文）
//  - 仅当用户显式设置 bgColor 时：渲染卡片外壳（背景 + 圆角 + 阴影）
//  - 文字颜色：用户显式 element.color > 智能配色 palette.textSecondary > 中性色
//  - 链接/引用/strong 强调色：智能配色 palette.accent
// ============================================================================
interface LongTextBodyProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
  extractedColors: ExtractedColors | null;
  renderedMd: string;
}

export const LongTextBody: React.FC<LongTextBodyProps> = ({
  element,
  fontClassName,
  textInlines,
  extractedColors,
  renderedMd,
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
  }, [renderedMd, element.markdownEnabled]);

  // —— 智能配色：若 element 没写 color，用 palette 的正文色（保证背景对比度）
  const effColor =
    element.color ||
    extractedColors?.textSecondary ||
    extractedColors?.textPrimary ||
    (element.bgColor ? '#1f2937' : undefined); // 只有当有卡片白底时，默认深灰；否则 undefined 继承 CSS

  // —— 语义化强调色：
  //   accent     → 链接（保留，高饱和强调）
  //   emphasis   → 加粗关键词（primary 派生，可读版）
  //   primaryMuted → 引用边框 / 分隔线 / 弱装饰（primary 揉进背景 55%）
  const accent =
    extractedColors?.accent ||
    (effColor ? mixColorAlpha(effColor, 0.85) : '#2563eb');
  const emphasis =
    extractedColors?.emphasis ||
    (effColor ? mixColorAlpha(effColor, 0.9) : accent);
  const primaryMuted =
    extractedColors?.primaryMuted ||
    mixColorAlpha(accent, 0.35);

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
    '--lt-emphasis': emphasis,        // 加粗关键词
    '--lt-primary-muted': primaryMuted, // 引用边框 / 分隔线
    '--lt-line-height': element.lineHeight !== undefined ? String(element.lineHeight) : undefined,
  } as React.CSSProperties;

  // 内层 Markdown 容器的 className（段落排版规则集合；与之前一致）
  const proseClass = [
    // 段落/标题/列表的基础排版
    // leading 用 CSS 变量，用户设的 element.lineHeight 才能覆盖默认 1.625
    '[&>p]:my-2 [&>p]:leading-[var(--lt-line-height,1.625)]',
    '[&_strong]:font-black [&_em]:italic',
    '[&>h1]:text-2xl [&>h1]:font-black [&>h1]:leading-tight [&>h1]:my-3',
    '[&>h2]:text-xl [&>h2]:font-black [&>h2]:leading-tight [&>h2]:my-3',
    '[&>h3]:text-lg [&>h3]:font-bold [&>h3]:my-2',
    '[&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2',
    '[&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2',
    '[&_li]:my-0.5',
    '[&_code]:text-[0.9em] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-white/10',
    '[&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-xs [&_pre]:bg-white/10 [&_pre]:overflow-auto',
    // 链接：accent（高饱和强调，仅留给超链接）
    '[&_a]:underline [&_a]:decoration-[var(--lt-primary-muted)] [&_a]:underline-offset-2 [&_a]:text-[var(--lt-accent)] [&_a:hover]:decoration-[var(--lt-accent)]',
    // 加粗强调：用 emphasis（primary 派生的可读版，像杂志正文的高亮关键词）
    '[&_strong]:text-[var(--lt-emphasis)]',
    // 分隔线：primaryMuted（主色弱化）
    '[&_hr]:my-4 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-[var(--lt-primary-muted)]',
    // 引用块：SVG 引号装饰 + 斜体（样式在 globals.css 中定义，em 单位随文字自适应）
    '[&_blockquote]:border-0 [&_blockquote]:italic',
  ].join(' ');

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

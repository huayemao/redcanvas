'use client';

import React from 'react';
import { PlogElement as PlogElementType, ExtractedColors } from '../../types';
import { shadowOf, resolveFontClass, mixColorAlpha } from './elementUtils';

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
        <div
          className={[
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
            // 引用块：左边框 + 斜体（样式在 globals.css 中定义）
            '[&_blockquote]:border-0 [&_blockquote]:italic',
          ].join(' ')}
          dangerouslySetInnerHTML={{ __html: renderedMd }}
        />
      ) : (
        <p className="whitespace-pre-wrap leading-[var(--lt-line-height,1.625)]">{element.content}</p>
      )}
    </div>
  );
};

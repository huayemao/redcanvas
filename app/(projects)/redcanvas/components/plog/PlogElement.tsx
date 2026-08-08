'use client';

import React, { useMemo, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { marked } from 'marked';
import { X, Move, Pencil } from 'lucide-react';
import {
  PlogElement as PlogElementType,
  SHADOW_PRESETS,
  ExtractedColors,
} from '../../types';
import { usePlogStore } from '../../store/usePlogStore';
import { FONTS } from '../../constants';

interface ElementActions {
  setSelectedElementId?: (id: string | null) => void;
  updateElement?: (id: string, partial: Partial<PlogElementType>) => void;
  removeElement?: (id: string) => void;
}

interface PlogElementProps {
  element: PlogElementType;
  containerRef: React.RefObject<HTMLDivElement | null>;
  fontClassName?: string;
  /** 外部注入 actions（Studio 场景传 useStudioStore 的 actions；Plog 场景留空走内部 usePlogStore） */
  actions?: ElementActions;
  /** 外部指定当前选中的元素 id（Studio 场景）；优先级高于内部 usePlogStore.selectedElementId */
  selectedId?: string | null;
  /** 智能配色方案（Studio 场景传入；未传则回退到 element.color 硬编码） */
  extractedColors?: ExtractedColors | null;
  /** 点击抓手中的"编辑"按钮时回调（移动端打开属性抽屉） */
  onEditElement?: () => void;
}

const shadowOf = (lvl: number | undefined): string => {
  if (lvl === undefined) return '';
  return SHADOW_PRESETS[Math.max(0, Math.min(4, lvl))] || '';
};

/** 把字体 ID（如 'kuaile'）映射为 Tailwind className（如 'font-kuaile'）；找不到则回退 fallbackClass */
const resolveFontClass = (fontFamilyId: string | undefined, fallbackClass: string): string => {
  if (!fontFamilyId) return fallbackClass;
  const found = FONTS.find((f) => f.id === fontFamilyId);
  return found ? found.className : fallbackClass;
};

export const PlogElement: React.FC<PlogElementProps> = ({
  element,
  containerRef,
  fontClassName = '',
  actions,
  selectedId,
  extractedColors = null,
  onEditElement,
}) => {
  const plogStore = usePlogStore();

  const setSelectedElementId: NonNullable<ElementActions['setSelectedElementId']> =
    actions?.setSelectedElementId ?? plogStore.setSelectedElementId;
  const updateElement: NonNullable<ElementActions['updateElement']> =
    actions?.updateElement ?? plogStore.updateElement;
  const removeElement: NonNullable<ElementActions['removeElement']> =
    actions?.removeElement ?? plogStore.removeElement;

  // 选中判定：显式 selectedId prop > 外部注入了 actions（由外部 selectedId 负责）> 内部 usePlogStore
  const effSelectedId =
    selectedId !== undefined ? selectedId :
    actions?.setSelectedElementId !== undefined ? null :
    plogStore.selectedElementId;

  const isSelected = effSelectedId === element.id;

  // ========== 拖拽 ==========
  // 用外部 motion value 控制 drag 的 x/y，便于释放后手动归零。
  // 原因：dragMomentum={false} 时，释放后的 inertia 动画 velocity=0，不会把 x/y 拉回 0，
  // 导致 transform 残留在释放位置；而 handleDragEnd 又把位移写进 left/top，造成「双重叠加」，
  // 元素最终落地位置比拖拽时看到的位置更远，越拖越明显。
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (_: any, info: any) => {
    dragStartRef.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (_: any, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // 用实际的 drag translate（已受 dragConstraints 约束的值），而非 info.offset（原始指针位移）。
    // 这样释放后落地位置 = 拖拽时看到的位置（包含边界约束）。
    const dxv = dragX.get();
    const dyv = dragY.get();
    const deltaXPercent = (dxv / rect.width) * 100;
    const deltaYPercent = (dyv / rect.height) * 100;
    const newX = Math.min(98, Math.max(-5, element.x + deltaXPercent));
    const newY = Math.min(98, Math.max(-5, element.y + deltaYPercent));
    updateElement(element.id, { x: newX, y: newY });
    // 关键：把 drag 的 x/y 归零，位移已转移到 left/top，避免残留 transform 与新位置叠加。
    dragX.set(0);
    dragY.set(0);
    console.log('[dragEnd]', { id: element.id, dxv, dyv, newX, newY, afterSet: { x: dragX.get(), y: dragY.get() } });
  };

  // ========== 通用 wrapper 样式 ==========
  const isImageLike = element.type === 'image' || element.type === 'asset';
  const hasRatio = isImageLike && element.aspectRatio !== undefined && element.aspectRatio > 0;

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    zIndex: element.zIndex,
    // scale / rotate / x / y 都以 motion value 形式传入（见下方 style 合并），
    // 不能写成 transform 字符串：否则 framer-motion 拖拽时 buildTransform 不会合成 x/y，
    // 元素拖拽过程中不随手移动，只有释放后才跳到新位置。
    minWidth:
      isImageLike ? '80px' :
      element.type === 'longtext' ? '120px' :
      element.type === 'annotation' ? '100px' :
      element.type === 'timestamp' ? '120px' : '48px',
    minHeight:
      isImageLike ? '60px' :
      element.type === 'longtext' ? '80px' :
      element.type === 'annotation' ? '56px' :
      element.type === 'timestamp' ? '60px' : '20px',
  };
  if (element.widthPct !== undefined) wrapperStyle.width = `${element.widthPct}%`;
  if (element.heightPct !== undefined) {
    // 图片类：有 aspectRatio 时以 CSS 属性严格锁比例（不再依赖强行写 height%，避免累积精度误差破坏比例）
    if (!hasRatio) {
      wrapperStyle.height = `${element.heightPct}%`;
    }
  }
  if (hasRatio) {
    // 关键：width + aspect-ratio = 浏览器按原图比例自动给 height，保证永远不拉伸变形
    wrapperStyle.aspectRatio = `${element.aspectRatio}`;
  }

  const selectedClass = isSelected
    ? 'ring-2 ring-red-500 ring-offset-2 rounded-xl shadow-2xl'
    : '';

  // ========== 文字公共（text/longtext 通用） inline style ==========
  const textInlines: React.CSSProperties = {};
  if (element.color) textInlines.color = element.color;
  if (element.fontSize) textInlines.fontSize = `${element.fontSize}px`;
  if (element.fontWeight) textInlines.fontWeight = element.fontWeight;
  if (element.letterSpacing !== undefined) textInlines.letterSpacing = `${element.letterSpacing}em`;
  if (element.lineHeight) textInlines.lineHeight = element.lineHeight;
  if (element.textAlign) textInlines.textAlign = element.textAlign;

  // ========== Markdown 渲染（text 与旧 longtext 统一） ==========
  const renderedMd = useMemo(() => {
    if (element.type !== 'text' && element.type !== 'longtext') return '';
    if (!(element.markdownEnabled ?? true)) return '';
    try {
      return marked.parse(element.content || '', { async: false, breaks: true, gfm: true }) as string;
    } catch {
      return element.content || '';
    }
  }, [element.type, element.content, element.markdownEnabled]);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.05}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      _dragX={dragX}
      _dragY={dragY}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElementId(element.id);
      }}
      style={{
        ...wrapperStyle,
        // x/y 绑定 drag motion value，让拖拽时元素随手移动；
        // scale/rotate 也以 motion value 形式传入，由 framer-motion 的 buildTransform
        // 按 transformPropOrder 统一合成为 translateX(x) translateY(y) scale(s) rotate(r)。
        x: dragX,
        y: dragY,
        scale: element.scale || 1,
        rotate: element.rotation || 0,
      }}
      className={`cursor-grab active:cursor-grabbing group select-none transition-shadow ${selectedClass}`}
    >
      {/* ============================================================
           类型分支
         ============================================================ */}

      {/* 图片元素 */}
      {element.type === 'image' && (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            borderRadius: `${element.borderRadius ?? 16}px`,
            boxShadow: shadowOf(element.shadowLevel ?? 2),
            border: element.borderWidth
              ? `${element.borderWidth}px solid ${element.borderColor || 'rgba(0,0,0,0.08)'}`
              : undefined,
            background: element.bgColor ||
              'linear-gradient(135deg, rgba(148,163,184,0.18) 0%, rgba(100,116,139,0.28) 100%)',
          }}
        >
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              crossOrigin="anonymous"
              alt=""
              className="w-full h-full block"
              style={{ objectFit: element.objectFit || 'cover' }}
              draggable={false}
              onError={(e) => {
                // 图片加载失败时降级为占位，避免完全空白/破图
                const tgt = e.currentTarget;
                tgt.style.display = 'none';
                const parent = tgt.parentElement;
                if (parent && !parent.querySelector('[data-plog-placeholder]')) {
                  const holder = document.createElement('div');
                  holder.setAttribute('data-plog-placeholder', 'true');
                  holder.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;background:linear-gradient(135deg,#e5e7eb 0%,#cbd5e1 100%);color:#475569;font-family:inherit;';
                  holder.innerHTML = '<div style="font-size:11px;font-weight:800;letter-spacing:0.1em;opacity:0.7">图片加载失败</div><div style="font-size:10px;opacity:0.5">请检查 URL</div>';
                  parent.appendChild(holder);
                }
              }}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[10px] font-black tracking-widest"
              style={{
                background:
                  'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)',
                color: '#334155',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl border-2 border-white/60 flex items-center justify-center shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.25))',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <span>图片占位</span>
            </div>
          )}
        </div>
      )}

      {/* 图形素材（与 image 视觉一致，但允许 vector/bitmap 区分，避免占位文本） */}
      {element.type === 'asset' && (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            borderRadius: `${element.borderRadius ?? 0}px`,
            boxShadow: shadowOf(element.shadowLevel ?? 0),
            border: element.borderWidth
              ? `${element.borderWidth}px solid ${element.borderColor || 'rgba(0,0,0,0.08)'}`
              : undefined,
            background: element.bgColor ||
              'linear-gradient(135deg, rgba(217,70,239,0.12), rgba(99,102,241,0.12))',
          }}
        >
          {element.assetKind === 'vector' ? (
            element.content ? (
              <div
                className="w-full h-full"
                // 允许 SVG 直接嵌入 content
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[10px] font-black tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, #fdf4ff 0%, #e9d5ff 50%, #c4b5fd 100%)',
                  color: '#6d28d9',
                }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                  <polyline points="7.5 19.79 7.5 14.6 3 12" />
                  <polyline points="21 12 16.5 14.6 16.5 19.79" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>图形素材</span>
              </div>
            )
          ) : element.imageUrl ? (
            <img
              src={element.imageUrl}
              crossOrigin="anonymous"
              alt=""
              className="w-full h-full block"
              style={{ objectFit: element.objectFit || 'contain' }}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-black opacity-60 tracking-widest"
              style={{ color: '#a21caf' }}>
              插入素材
            </div>
          )}
        </div>
      )}

      {/* 文本框（统一 Markdown 富文本渲染；'text' 与旧 'longtext' 共用此分支） */}
      {(element.type === 'text' || element.type === 'longtext') && (
        <LongTextBody
          element={element}
          fontClassName={fontClassName}
          textInlines={textInlines}
          extractedColors={extractedColors}
          renderedMd={renderedMd}
        />
      )}

      {/* 以下：装饰类（badge / sticker / annotation / tag）保持原样，但加上字体/阴影增强 */}

      {/* ===== 步骤徽章：实心胶囊 + 编号圆点（用于分步说明） ===== */}
      {element.type === 'badge' && (
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-black backdrop-blur-md border border-white/20 whitespace-nowrap ${resolveFontClass(element.fontFamily, fontClassName)}`}
          style={{
            backgroundColor: element.bgColor || '#ff2442',
            color: element.color || '#ffffff',
            boxShadow: shadowOf(element.shadowLevel ?? 1),
            whiteSpace: 'nowrap',
            ...textInlines,
          }}
        >
          {element.badgeNumber && (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{
                background: 'rgba(255,255,255,0.22)',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            >
              {element.badgeNumber}
            </span>
          )}
          <span className="whitespace-nowrap">{element.content}</span>
        </div>
      )}

      {/* ===== 说明提示框：气泡式注释卡片，左下角小尾巴指向被注释内容 =====
           有 bgColor → 卡片模式（背景+边框+尾巴+阴影）
           无 bgColor → 融入背景（仅文字，避免白底与浅色画布冲突） */}
      {element.type === 'annotation' && (() => {
        const hasCard = !!element.bgColor && element.bgColor !== 'transparent';
        return (
          <div className="relative">
            <div
              className={`relative text-xs font-medium leading-relaxed ${resolveFontClass(element.fontFamily, fontClassName)} ${hasCard ? 'px-4 py-3 rounded-2xl border' : 'px-1 py-0.5'}`}
              style={{
                backgroundColor: hasCard ? element.bgColor : 'transparent',
                color: element.color || '#18181b',
                borderColor: hasCard ? (element.borderColor || 'rgba(0,0,0,0.08)') : 'transparent',
                boxShadow: hasCard ? shadowOf(element.shadowLevel ?? 2) : 'none',
                ...textInlines,
              }}
            >
              {/* 气泡小尾巴：仅卡片模式下显示，左下角三角，颜色与卡片底色一致 */}
              {hasCard && (
                <span
                  className="absolute left-3 -bottom-1.5 w-3 h-3 rotate-45 border-r border-b"
                  style={{
                    backgroundColor: element.bgColor,
                    borderColor: element.borderColor || 'rgba(0,0,0,0.08)',
                  }}
                />
              )}
              <p className="whitespace-pre-wrap">{element.content}</p>
            </div>
          </div>
        );
      })()}

      {/* ===== 高亮贴纸：荧光记号笔 —— accent 半透明色块 + accent 实心文字（同色相） ===== */}
      {element.type === 'sticker' && (
        <div
          className={`inline-block font-black whitespace-nowrap ${resolveFontClass(element.fontFamily, fontClassName)}`}
          style={{
            // 记号笔效果：accent 35% 透明底，文字用 accent 实心（同色相，文字全不透明显眼）
            backgroundColor: mixColorAlpha(element.bgColor || '#ff601a', 0.35),
            padding: '1px 6px',
            borderRadius: '3px',
            boxShadow: 'none',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            ...textInlines,
          }}
        >
          <span className="whitespace-nowrap">{element.content}</span>
        </div>
      )}

      {/* ===== 标签：描边幽灵风格 + # 前缀（区别于实心 badge） ===== */}
      {element.type === 'tag' && (
        <div
          className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide whitespace-nowrap ${resolveFontClass(element.fontFamily, fontClassName)}`}
          style={{
            backgroundColor: element.bgColor || 'transparent',
            color: element.color || '#ffffff',
            border: `${element.borderWidth ?? 1}px solid ${element.borderColor || 'rgba(255,255,255,0.4)'}`,
            boxShadow: shadowOf(element.shadowLevel ?? 0),
            whiteSpace: 'nowrap',
            ...textInlines,
          }}
        >
          <span className="opacity-60 font-black">#</span>
          <span className="whitespace-nowrap">{element.content}</span>
        </div>
      )}

      {/* ===== 时间戳：杂志风日期块 · 年·月·日 + 星期 ===== */}
      {element.type === 'timestamp' && (
        <TimestampBlock
          element={element}
          fontClassName={fontClassName}
          textInlines={textInlines}
        />
      )}

      {/* Selected Action Controls overlay (Hide on image export) */}
      {isSelected && (
        <div className="hide-on-export absolute -top-8 left-0 right-0 flex items-center justify-center gap-1.5 bg-neutral-900 text-white rounded-lg p-1 text-[10px] shadow-xl z-50">
          <Move className="w-3 h-3 text-neutral-400" />
          {onEditElement && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditElement();
              }}
              className="p-0.5 hover:text-blue-400 transition-colors lg:hidden"
              title="编辑属性"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeElement(element.id);
            }}
            className="p-0.5 hover:text-red-400 transition-colors"
            title="删除元素"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

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

const LongTextBody: React.FC<LongTextBodyProps> = ({
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
  const cssVars = {
    '--lt-color': effColor || 'inherit',
    '--lt-accent': accent,            // 链接
    '--lt-emphasis': emphasis,        // 加粗关键词
    '--lt-primary-muted': primaryMuted, // 引用边框 / 分隔线
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
            '[&>p]:my-2 [&>p]:leading-relaxed',
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
            // 引用块：左边框 primaryMuted（主色弱化），文字降饱和 italic
            '[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--lt-primary-muted)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:opacity-85',
            // 加粗强调：用 emphasis（primary 派生的可读版，像杂志正文的高亮关键词）
            '[&_strong]:text-[var(--lt-emphasis)]',
            // 分隔线：primaryMuted（主色弱化）
            '[&_hr]:my-4 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-[var(--lt-primary-muted)]',
            // 引用块：引号风格 —— 去掉左边框线条，改用大号引号字符做装饰
            // 实现思路：blockquote 相对定位 + ::before 伪元素放大引号字符，正文缩进让出空间
            // 引号字符的 content 在 globals.css 的 .prose-sm blockquote::before 定义（Tailwind 任意值不能传含引号字符串）
            '[&_blockquote]:relative [&_blockquote]:border-0 [&_blockquote]:pl-8 [&_blockquote]:pr-2 [&_blockquote]:py-1 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:opacity-90',
            '[&_blockquote::before]:absolute [&_blockquote::before]:left-0 [&_blockquote::before]:top-[-6px] [&_blockquote::before]:text-4xl [&_blockquote::before]:leading-none [&_blockquote::before]:font-serif [&_blockquote::before]:text-[var(--lt-primary-muted)]',
          ].join(' ')}
          dangerouslySetInnerHTML={{ __html: renderedMd }}
        />
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed">{element.content}</p>
      )}
    </div>
  );
};

// ============================================================================
//  TimestampBlock：杂志风日期块
//  - content 存日期串(YYYY-MM-DD)，空 = 今天，无效 = 今天
//  - 渲染：顶部短横线 + 大号 年·月·日 + 星期中文/英文（统一文字色，无强调色）
// ============================================================================
interface TimestampBlockProps {
  element: PlogElementType;
  fontClassName: string;
  textInlines: React.CSSProperties;
}

const WEEKDAY_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAY_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const TimestampBlock: React.FC<TimestampBlockProps> = ({ element, fontClassName, textInlines }) => {
  const date = useMemo(() => {
    const raw = (element.content || '').trim();
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [element.content]);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdayCn = WEEKDAY_CN[date.getDay()];
  const weekdayEn = WEEKDAY_EN[date.getDay()];

  const textColor = element.color || '#111827';
  const baseSize = element.fontSize ?? 14;

  return (
    <div
      className={`inline-flex flex-col ${resolveFontClass(element.fontFamily, fontClassName)}`}
      style={{ color: textColor, ...textInlines }}
    >
      {/* 顶部短横线（沿用文字色） */}
      {/* <span
        style={{ width: '30px', height: '2px', background: 'currentColor', marginBottom: '7px' }}
      /> */}
      {/* 主日期：年 · 月 · 日 */}
      <div
        className="tracking-wider leading-none"
        style={{ fontSize: `${baseSize * 1.2}px`, letterSpacing: '0.04em' }}
      >
        <span>{year}</span>
        年
        <span>{month}</span>
        月
        <span>{day}</span>
        日
      </div>
      {/* 星期：中文 + 英文缩写 */}
      <div
        className="flex items-center gap-1.5 mt-1.5"
        style={{ fontSize: `${baseSize * 1}px` }}
      >
        <span className="font-bold">{weekdayCn}</span>
        <span style={{ fontWeight: 900, opacity: 0.45 }}>·</span>
        <span className="font-black tracking-widest opacity-70">{weekdayEn}</span>
      </div>
    </div>
  );
};

// 简易工具：给 6 位/8 位 hex 或 rgb(...) 色加 alpha；失败原样返回
function mixColorAlpha(color: string, alpha: number): string {
  try {
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      if (hex.length === 8) {
        // rgba hex → 覆盖 alpha
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    if (color.startsWith('rgba(')) {
      const m = color.match(/rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
      if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
    }
    if (color.startsWith('rgb(')) {
      const m = color.match(/rgb\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
      if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
    }
  } catch { /* ignore */ }
  return color;
}


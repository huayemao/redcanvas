'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import {
  PlogElement as PlogElementType,
  ExtractedColors,
} from '../../types';
import { usePlogStore } from '../../store/usePlogStore';
import { shadowOf, resolveFontClass, mixColorAlpha } from './elementUtils';
import { LongTextBody } from './LongTextBody';
import { TimestampBlock } from './TimestampBlock';
import { ElementToolbar } from './ElementToolbar';
import { mdRenderer, ensureMathBlockParagraph } from './mathRender';

// ============================================================================
// SVG 前景色染色（CSS mask 方案）
// - 用 SVG 图源作为遮罩，backgroundColor 即为前景色，整图单色染色
// - fgColor 未设置 / transparent = 保持原色，走普通 <img> 渲染
// ============================================================================
/** 判断图源地址是否为 SVG：data:image/svg 开头，或路径以 .svg 结尾 */
function isSvgSource(url?: string | null): boolean {
  if (!url) return false;
  if (/^data:image\/svg/i.test(url)) return true;
  return /\.svg([?#].*)?$/i.test(url);
}

/** 取元素的前景染色色值；不满足条件返回 null（保持原色） */
function svgTintOf(el: PlogElementType): string | null {
  if (!el.fgColor || el.fgColor === 'transparent') return null;
  // asset 的 vector 分支用 content 内嵌 SVG，此处仅处理 imageUrl 渲染路径
  return isSvgSource(el.imageUrl) ? el.fgColor : null;
}

/** objectFit → CSS mask-size 映射 */
function maskSizeOf(fit?: PlogElementType['objectFit']): string {
  switch (fit) {
    case 'cover': return 'cover';
    case 'fill': return '100% 100%';
    case 'none': return 'auto';
    default: return 'contain';   // contain 及默认
  }
}

/** 用图源做遮罩、以指定颜色填充的染色层（替代 <img>） */
function TintedSvgLayer({ url, color, fit }: { url: string; color: string; fit?: PlogElementType['objectFit'] }) {
  const size = maskSizeOf(fit);
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
    WebkitMaskImage: `url("${url}")`,
    maskImage: `url("${url}")`,
    WebkitMaskSize: size,
    maskSize: size,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  };
  return <div className="w-full h-full block" style={style} />;
}

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

  // 移动端检测：移动端仅允许通过抓手（ElementToolbar 里的 Move 图标）拖动，避免误触。
  // 桌面端保持"抓任意位置即可拖动"的体验。lg 断点（1024px）与项目其它 lg:hidden 对齐。
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // dragControls：让抓手通过 onPointerDown → dragControls.start 发起拖拽
  const dragControls = useDragControls();

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
    ? 'ring-2 ring-red-500'
    : '';

  // ========== 文字公共（text/longtext 通用） inline style ==========
  const textInlines: React.CSSProperties = {};
  if (element.color) textInlines.color = element.color;
  if (element.fontSize) textInlines.fontSize = `${element.fontSize}px`;
  if (element.fontWeight) textInlines.fontWeight = element.fontWeight;
  if (element.letterSpacing !== undefined) textInlines.letterSpacing = `${element.letterSpacing}em`;
  if (element.lineHeight) textInlines.lineHeight = element.lineHeight;
  if (element.textAlign) textInlines.textAlign = element.textAlign;

  // ========== Markdown 渲染（text 与旧 longtext 统一；支持 GFM + MathJax 数学公式） ==========
  // 注意：公式走"先生成 <script type='math/tex'> 占位 → DOM 挂载后 LongTextBody 的 effect
  // 调 typesetMathInElement 后排版"，所以此处 mdRenderer.parse 输出不依赖 MathJax 是否就绪。
  // useMemo 依赖仅保留真正影响渲染结果的字段，避免拖拽/选中态等重渲染触发字符串变化 →
  // → React dangerouslySetInnerHTML 重置 innerHTML → 炸掉已排版的 mjx-container 造成闪烁。
  const renderedMd = useMemo(() => {
    if (element.type !== 'text' && element.type !== 'longtext') return '';
    if (!(element.markdownEnabled ?? true)) return '';
    try {
      // 先把 $$ 块公式隔离成独立段落（前后补空行），再交给 marked 解析
      return mdRenderer.parse(ensureMathBlockParagraph(element.content || ''), { async: false }) as string;
    } catch {
      return element.content || '';
    }
  }, [element.type, element.content, element.markdownEnabled]);

  return (
    <motion.div
      drag
      // 移动端关闭默认 drag listener，仅允许抓手发起拖拽；桌面端保持整元素可拖
      dragListener={!isMobile}
      dragControls={dragControls}
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
            svgTintOf(element) ? (
              // SVG 前景染色：以图源为遮罩、fgColor 填充（原 <img> 的占位降级不适用，mask 加载失败仅显示底色）
              <TintedSvgLayer url={element.imageUrl!} color={svgTintOf(element)!} fit={element.objectFit} />
            ) : (
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
            )
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
            svgTintOf(element) ? (
              // SVG 前景染色（asset 位图/矢量路径同样支持）
              <TintedSvgLayer url={element.imageUrl} color={svgTintOf(element)!} fit={element.objectFit || 'contain'} />
            ) : (
            <img
              src={element.imageUrl}
              crossOrigin="anonymous"
              alt=""
              className="w-full h-full block"
              style={{ objectFit: element.objectFit || 'contain' }}
              draggable={false}
            />
            )
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
      {element.type === 'badge' && (() => {
        // 永远深底亮字：bg → badgeBg（永远深色），text → badgeText（永远浅色）
        const badgeColor = element.color || extractedColors?.badgeText || '#F5F1E8';
        const badgeBg = element.bgColor || extractedColors?.badgeBg || '#1C1917';
        // 边框：与背景不同色 —— 用文字色 40% 透明度（亮文字 → 亮边框半透明，与深底对比明显）
        const badgeBorder = element.borderColor || mixColorAlpha(badgeColor, 0.4);
        return (
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-black backdrop-blur-md border whitespace-nowrap ${resolveFontClass(element.fontFamily, fontClassName)}`}
          style={{
            backgroundColor: badgeBg,
            color: badgeColor,
            borderWidth: `${element.borderWidth ?? 2}px`,
            borderColor: badgeBorder,
            borderStyle: 'solid',
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
        );
      })()}

      {/* ===== 说明提示框：气泡式注释卡片，尾巴方向可配置，指向被注释内容 =====
           有 bgColor → 卡片模式（背景+边框+尾巴+阴影）
           无 bgColor → 融入背景（仅文字，避免白底与浅色画布冲突） */}
      {element.type === 'annotation' && (() => {
        const hasCard = !!element.bgColor && element.bgColor !== 'transparent';
        // 尾巴方向 → 定位 + 可见边（旋转 45° 的小方块，露出的两条边构成三角）
        const tailPos: Record<string, string> = {
          'bottom-left': 'left-3 -bottom-1.5 border-b border-r',
          'bottom-right': 'right-3 -bottom-1.5 border-b border-r',
          'top-left': 'left-3 -top-1.5 border-t border-r',
          'top-right': 'right-3 -top-1.5 border-t border-r',
        };
        const dir = element.tailDirection ?? 'bottom-left';
        return (
          <div className="relative inline-block">
            <div
              className={`relative text-xs font-medium leading-relaxed ${resolveFontClass(element.fontFamily, fontClassName)} ${hasCard ? 'px-4 py-2 rounded-2xl border' : 'px-1 py-0.5'}`}
              style={{
                backgroundColor: hasCard ? element.bgColor : 'transparent',
                color: element.color || '#18181b',
                borderColor: hasCard ? (element.borderColor || 'rgba(0,0,0,0.08)') : 'transparent',
                boxShadow: hasCard ? shadowOf(element.shadowLevel ?? 2) : 'none',
                ...textInlines,
              }}
            >
              {/* 气泡小尾巴：仅卡片模式下显示，方向可配置，颜色与卡片底色一致 */}
              {hasCard && (
                <span
                  className={`absolute w-3 h-3 rotate-45 ${tailPos[dir]}`}
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
          className={`inline-block font-bold whitespace-nowrap ${resolveFontClass(element.fontFamily, fontClassName)}`}
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
        <ElementToolbar
          onEditElement={onEditElement}
          onRemove={() => removeElement(element.id)}
          onDragStart={(e) => dragControls.start(e)}
        />
      )}
    </motion.div>
  );
};

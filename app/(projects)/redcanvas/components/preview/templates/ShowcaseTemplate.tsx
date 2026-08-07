'use client';

import React, { useRef } from "react";
import { Highlight } from "../../../types";
import { TitleRenderer } from "../TitleRenderer";
import { ImageResizeHandle } from "./ImageResizeHandle";

interface ShowcaseTemplateProps {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  showDeviceFrame?: boolean;
  deviceType?: string;
  imageAspectRatio: string;
  imageScale?: number;
  fontClassName: string;
  isLandscape?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
  accentColor?: string;
  interactive?: boolean;
  onScaleChange?: (scale: number) => void;

  // 配色系统：提取后的三级文字色
  textPrimary?: string;   // #RRGGBB
  textSecondary?: string; // #RRGGBB
  textMuted?: string;     // #RRGGBB
  cardBg?: string;
  cardBorder?: string;
}

/**
 * ShowcaseTemplate — 极简工具封面
 * 只有：背景渐变 + 截图卡片(阴影) + 大标题 + 一行小字
 * 截图卡片支持拖拽按比例缩放（不改宽高比）。
 */
export const ShowcaseTemplate = ({
  title,
  highlights,
  imageUrl,
  fontClassName,
  isLandscape,
  imageAspectRatio = "4:5",
  imageScale = 1,
  gradientStartColor = "#f5f5f5",
  gradientEndColor = "#e8e8e8",
  accentColor = "#1a1a1a",
  interactive = false,
  onScaleChange,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  cardBorder,
}: ShowcaseTemplateProps) => {
  const landscape = !!isLandscape;
  const imgRatioCss = ratioToCss(imageAspectRatio);
  const cardRef = useRef<HTMLDivElement>(null);

  const basePct = landscape ? 52 : 76;
  const widthPct = Math.min(99, Math.max(18, basePct * imageScale));

  // 当提供了提取色时，卡片可以加一层极淡的描边让它和背景区分
  const cardExtraStyle: React.CSSProperties = {};
  if (cardBorder) cardExtraStyle.border = `1px solid ${cardBorder}`;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${gradientStartColor} 0%, ${gradientEndColor} 100%)`,
      }}
    >
      <div className={`relative w-full h-full ${landscape ? "px-8 py-8 flex flex-row items-center gap-8" : "px-8 pt-12 pb-8 flex flex-col"}`}>
        {/* 截图卡片 — 居中，干净阴影，宽度随 imageScale 缩放 */}
        <div className={`relative ${landscape ? "flex items-center z-10 flex-shrink-0" : "flex justify-center z-10 flex-shrink-0"}`}>
          <div
            ref={cardRef}
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: `${widthPct}%`,
              aspectRatio: imgRatioCss,
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.18), 0 8px 20px -8px rgba(0,0,0,0.08)",
              background: cardBg,
              ...cardExtraStyle,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                crossOrigin="anonymous"
                alt="showcase"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm font-bold"
                style={{ color: textMuted || '#a3a3a3', background: cardBg || '#f5f5f5' }}
              >
                上传截图
              </div>
            )}
            {interactive && onScaleChange && (
              <ImageResizeHandle
                cardRef={cardRef}
                scale={imageScale}
                onScaleChange={onScaleChange}
              />
            )}
          </div>
        </div>

        {/* 标题 + 一行小字 */}
        <div className={`relative z-20 ${landscape ? "flex-1 min-w-0 flex flex-col justify-center" : "mt-8 px-1"}`}>
          <TitleRenderer
            title={title || "你的标题"}
            highlights={highlights}
            fontClassName={fontClassName}
            sizeClass={landscape ? "text-2xl lg:text-3xl" : "text-[28px]"}
            textColor="text-neutral-900"
            textColorStyle={textPrimary}
          />
          <p
            className={`mt-3 text-[13px] font-medium leading-relaxed ${landscape ? "max-w-[85%]" : ""}`}
            style={{ color: textSecondary || '#737373' }}
          >
            {accentColor && accentColor !== '#1a1a1a' ? '' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

/** 把 "4:5" 这种字符串转成 CSS aspectRatio "4 / 5" */
function ratioToCss(ratio: string): string {
  if (!ratio || !ratio.includes(":")) return "4 / 5";
  const [w, h] = ratio.split(":");
  return `${w} / ${h}`;
}

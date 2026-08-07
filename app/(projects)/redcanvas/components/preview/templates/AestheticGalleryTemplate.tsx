'use client';

import React, { useRef } from "react";
import { Highlight } from "../../../types";
import { TitleRenderer } from "../TitleRenderer";
import { ImageResizeHandle } from "./ImageResizeHandle";

interface AestheticGalleryTemplateProps {
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

  // 配色系统：提取后的三级文字色 / 卡片色
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  cardBg?: string;
  cardBorder?: string;
}

/**
 * AestheticGalleryTemplate — 极简暗黑卡片
 * 只有：深色背景 + 内嵌卡片(图片+标题)
 * 整张明信片卡片支持拖拽按比例缩放（不改宽高比）。
 */
export const AestheticGalleryTemplate = ({
  title,
  highlights,
  imageUrl,
  fontClassName,
  isLandscape,
  imageAspectRatio = "4:5",
  imageScale = 1,
  gradientStartColor = "#141414",
  gradientEndColor = "#0a0a0a",
  accentColor = "#9ca3af",
  interactive = false,
  onScaleChange,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  cardBorder,
}: AestheticGalleryTemplateProps) => {
  const landscape = !!isLandscape;
  const imgRatioCss = ratioToCss(imageAspectRatio);
  const cardRef = useRef<HTMLDivElement>(null);

  const [titleLine1, titleLine2] = splitTitle(title);

  const basePct = landscape ? 64 : 60;
  const widthPct = Math.min(94, Math.max(28, basePct * imageScale));

  // 卡片背景：优先用提取色，否则沿用深色
  const finalCardBg = cardBg ?? "#111113";
  // 卡片描边：提取/默认都用
  const finalCardBorder = cardBorder ?? "rgba(255,255,255,0.06)";

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(140deg, ${gradientStartColor} 0%, ${gradientEndColor} 100%)`,
      }}
    >
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center ${
          landscape ? "px-8" : "px-8 py-10"
        }`}
      >
        <div
          ref={cardRef}
          className="relative rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            width: `${widthPct}%`,
            aspectRatio: landscape ? "4 / 5" : "3 / 4",
            background: finalCardBg,
            border: `1px solid ${finalCardBorder}`,
          }}
        >
          {/* 图片区域 — 使用 imageAspectRatio 控制图片本身宽高比 */}
          <div
            className="relative overflow-hidden m-3 mb-0 rounded-xl"
            style={{ aspectRatio: imgRatioCss, flexShrink: 0 }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                crossOrigin="anonymous"
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-bold tracking-widest"
                style={{
                  color: textMuted ?? 'rgba(255,255,255,0.25)',
                  background: textMuted ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)',
                }}
              >
                UPLOAD IMAGE
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-black/0 to-black/20" />
          </div>

          {/* 文字区域 — 占据剩余空间 */}
          <div className="flex-1 min-h-0 px-5 pt-4 pb-4 flex flex-col justify-between">
            <div>
              <TitleRenderer
                title={titleLine1}
                highlights={highlights}
                fontClassName={fontClassName}
                sizeClass="text-[20px] lg:text-[24px]"
                textColor="text-white"
                textColorStyle={textPrimary}
              />
              <p
                className="mt-1.5 text-[12px] font-medium tracking-wide"
                style={{ color: textSecondary ?? 'rgba(255,255,255,0.35)' }}
              >
                {titleLine2 || "—"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-black tracking-[0.2em] uppercase"
                style={{ color: textMuted ?? 'rgba(255,255,255,0.2)' }}
              >
                REDCANVAS
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accentColor, opacity: 0.7 }}
              />
            </div>
          </div>

          {interactive && onScaleChange && (
            <ImageResizeHandle
              cardRef={cardRef}
              scale={imageScale}
              onScaleChange={onScaleChange}
            />
          )}
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

function splitTitle(title: string): [string, string] {
  const lines = (title || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length >= 2) return [lines[0], lines.slice(1).join(" · ")];
  if (lines.length === 1) return [lines[0], ""];
  return ["Aesthetic", ""];
}

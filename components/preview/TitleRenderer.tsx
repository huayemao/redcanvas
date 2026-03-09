'use client';

import React from "react";
import { Highlight } from "@/types";

interface TitleRendererProps {
  title: string;
  highlights: Highlight[];
  sizeClass?: string;
  fontClassName: string;
}

export const TitleRenderer = ({
  title,
  highlights,
  sizeClass = "text-4xl",
  fontClassName,
}: TitleRendererProps) => {
  let content: React.ReactNode[] = [title];

  highlights.forEach((h) => {
    if (!h.text) return;
    const newContent: React.ReactNode[] = [];
    content.forEach((segment) => {
      if (typeof segment === "string") {
        const parts = segment.split(new RegExp(`(${h.text})`, "gi"));
        parts.forEach((part, i) => {
          if (part.toLowerCase() === h.text.toLowerCase()) {
            if (h.style === 'text') {
              newContent.push(
                <span
                  key={`${h.id}-${i}`}
                  style={{ color: h.color }}
                >
                  {part}
                </span>
              );
            } else {
              newContent.push(
                <span
                  key={`${h.id}-${i}`}
                  className="relative inline-block mx-0.5"
                >
                  <span className="relative z-10">{part}</span>
                  <span
                    className="absolute -bottom-1 left-0 w-full h-[14px] -rotate-[1.5deg] z-0 opacity-100 rounded-[10px_2px_12px_3px]"
                    style={{ backgroundColor: h.color }}
                  />
                </span>
              );
            }
          } else {
            newContent.push(part);
          }
        });
      } else {
        newContent.push(segment);
      }
    });
    content = newContent;
  });

  return (
    <h1
      className={`${sizeClass} leading-[1.3] font-black whitespace-pre-wrap break-words ${fontClassName}`}
    >
      {content}
    </h1>
  );
};

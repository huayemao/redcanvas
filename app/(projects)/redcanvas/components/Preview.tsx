'use client';

import React, { forwardRef } from "react";
import { EditorState } from "../types";
import { FONTS } from "../constants";
import {
  ClassicTemplate,
  MagazineTemplate,
  MinimalTemplate,
  BoldTemplate,
  FloatingTemplate,
  MockupTemplate,
} from "./preview/Templates";

interface PreviewProps {
  state: EditorState;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(
  ({ state }, ref) => {
    const {
      title,
      highlights,
      seriesNumber,
      imageUrl,
      templateId,
      fontFamily,
      showDeviceFrame,
      deviceType,
      imageAspectRatio,
      orientation,
      exportSize,
    } = state;

    const fontConfig = FONTS.find((f) => f.id === fontFamily) || FONTS[0];

    const isLandscape =
      orientation === "landscape" ||
      exportSize === "bilibili" ||
      exportSize === "youtube";

    const templates = {
      classic: (
        <ClassicTemplate
          title={title}
          highlights={highlights}
          seriesNumber={seriesNumber}
          imageUrl={imageUrl}
          showDeviceFrame={showDeviceFrame}
          deviceType={deviceType}
          imageAspectRatio={imageAspectRatio}
          fontClassName={fontConfig.className}
          isLandscape={isLandscape}
        />
      ),
      magazine: (
        <MagazineTemplate
          title={title}
          highlights={highlights}
          seriesNumber={seriesNumber}
          imageUrl={imageUrl}
          showDeviceFrame={showDeviceFrame}
          deviceType={deviceType}
          imageAspectRatio={imageAspectRatio}
          fontClassName={fontConfig.className}
          isLandscape={isLandscape}
        />
      ),
      minimal: (
        <MinimalTemplate
          title={title}
          highlights={highlights}
          seriesNumber={seriesNumber}
          imageUrl={imageUrl}
          showDeviceFrame={showDeviceFrame}
          deviceType={deviceType}
          imageAspectRatio={imageAspectRatio}
          fontClassName={fontConfig.className}
          isLandscape={isLandscape}
        />
      ),
      bold: (
        <BoldTemplate
          title={title}
          highlights={highlights}
          seriesNumber={seriesNumber}
          imageUrl={imageUrl}
          showDeviceFrame={showDeviceFrame}
          deviceType={deviceType}
          imageAspectRatio={imageAspectRatio}
          fontClassName={fontConfig.className}
          isLandscape={isLandscape}
        />
      ),
      floating: (
        <FloatingTemplate
          title={title}
          highlights={highlights}
          seriesNumber={seriesNumber}
          imageUrl={imageUrl}
          showDeviceFrame={showDeviceFrame}
          deviceType={deviceType}
          imageAspectRatio={imageAspectRatio}
          fontClassName={fontConfig.className}
          isLandscape={isLandscape}
        />
      ),
      mockup: (
        <MockupTemplate
          imageAspectRatio={imageAspectRatio}
          isLandscape={isLandscape}
          title={title}
          highlights={highlights}
          seriesNumber={seriesNumber}
          imageUrl={imageUrl}
          fontClassName={fontConfig.className}
        />
      ),
    };

    return (
      <div
        className={`relative w-full ${exportSize === "xiaohongshu" || (exportSize === "custom" && orientation === "portrait") ? "max-w-[400px]" : "max-w-[600px]"} ${(exportSize === "bilibili" || exportSize === "youtube" || (exportSize === "custom" && orientation === "landscape")) ? "aspect-[3/2]" : "aspect-[3/4]"} rounded-[44px] overflow-hidden border-[8px] sm:border-[12px] border-neutral-900 bg-white preview-shadow select-none mx-auto`}
        style={{ boxSizing: "border-box" }}
      >
        <div ref={ref} className="w-full h-full overflow-hidden">
          {templates[templateId]}
        </div>
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[32px]" />
      </div>
    );
  }
);

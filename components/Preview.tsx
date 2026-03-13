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

    const getAspectRatio = () => {
      switch (exportSize) {
        case "xiaohongshu":
          return "3/4";
        case "bilibili":
        case "youtube":
          return "3/2";
        case "custom":
          return orientation === "portrait" ? "3/4" : "3/2";
        default:
          return "3/4";
      }
    };

    const getMaxWidth = () => {
      if (
        exportSize === "xiaohongshu" ||
        (exportSize === "custom" && orientation === "portrait")
      ) {
        return "max-w-[400px]";
      } else {
        return "max-w-[600px]";
      }
    };

    return (
      <div
        className={`relative w-full ${getMaxWidth()} aspect-[${getAspectRatio()}] rounded-[44px] overflow-hidden border-[8px] sm:border-[12px] border-neutral-900 bg-white preview-shadow select-none mx-auto`}
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

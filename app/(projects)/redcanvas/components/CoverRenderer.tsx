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
  GradientTemplate,
} from "./preview/Templates";

interface CoverRendererProps {
  state: EditorState;
}

export const CoverRenderer = forwardRef<HTMLDivElement, CoverRendererProps>(
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

    const TemplateMap = {
      classic: ClassicTemplate,
      magazine: MagazineTemplate,
      minimal: MinimalTemplate,
      bold: BoldTemplate,
      floating: FloatingTemplate,
      mockup: MockupTemplate,
      gradient: GradientTemplate,
    };

    const TemplateComponent = TemplateMap[templateId];

    return (
      <div
        className={`relative w-full ${exportSize === "xiaohongshu" || (exportSize === "custom" && orientation === "portrait") ? "max-w-[480px]" : "max-w-[600px]"} ${(exportSize === "bilibili" || exportSize === "youtube" || (exportSize === "custom" && orientation === "landscape")) ? "aspect-[3/2]" : "aspect-[3/4]"}  overflow-hidden bg-white preview-shadow select-none mx-auto`}
      >
        <div ref={ref} className="w-full h-full overflow-hidden">
          {TemplateComponent && (
            <TemplateComponent
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
          )}
        </div>
      </div>
    );
  }
);

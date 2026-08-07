'use client';

import React, { forwardRef } from "react";
import { EditorState } from "../types";
import { FONTS } from "../constants";
import {
  ShowcaseTemplate,
  AestheticGalleryTemplate,
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
      exportSize,
      gradientStartColor,
      gradientEndColor,
    } = state;

    const fontConfig = FONTS.find((f) => f.id === fontFamily) || FONTS[0];

    const isLandscape =
      exportSize === "3:2" ||
      exportSize === "4:3";

    const TemplateMap = {
      showcase: ShowcaseTemplate,
      'aesthetic-gallery': AestheticGalleryTemplate,
    };

    const TemplateComponent = TemplateMap[templateId as keyof typeof TemplateMap] || ShowcaseTemplate;

    return (
      <div
        ref={ref}
        className={`relative w-full ${
          exportSize === "3:4" || exportSize === "9:16"
            ? "max-w-[480px]"
            : exportSize === "1:1"
            ? "max-w-[500px]"
            : "max-w-[600px]"
        } ${
          exportSize === "1:1"
            ? "aspect-[1/1]"
            : exportSize === "4:3"
            ? "aspect-[4/3]"
            : exportSize === "9:16"
            ? "aspect-[9/16]"
            : exportSize === "3:2"
            ? "aspect-[3/2]"
            : "aspect-[3/4]"
        } overflow-hidden bg-white preview-shadow select-none mx-auto`}
      >
        <div className="w-full h-full overflow-hidden">
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
            gradientStartColor={gradientStartColor}
            gradientEndColor={gradientEndColor}
          />
        </div>
      </div>
    );
  }
);

CoverRenderer.displayName = 'CoverRenderer';

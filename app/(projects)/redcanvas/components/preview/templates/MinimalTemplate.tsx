'use client';

import React from "react";
import { TitleRenderer } from "../TitleRenderer";
import { ImageWithFrame } from "../ImageWithFrame";
import { Highlight, DeviceType } from "../../../types";

interface TemplateProps {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  showDeviceFrame: boolean;
  deviceType: DeviceType;
  imageAspectRatio: number | null;
  fontClassName: string;
  isLandscape: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
}

export const MinimalTemplate = ({
  title,
  highlights,
  seriesNumber,
  imageUrl,
  showDeviceFrame,
  deviceType,
  imageAspectRatio,
  fontClassName,
  isLandscape,
  gradientStartColor,
  gradientEndColor,
}: TemplateProps) => {
  if (isLandscape) {
    return (
      <div className="relative w-full h-full bg-[#fdfdfd] flex flex-row items-center justify-center px-3">
        <div className="flex-1 text-center pr-2">
          {seriesNumber && (
            <div className="mb-4 text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase">
              {seriesNumber}
            </div>
          )}
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-xl"
            fontClassName={fontClassName}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          {showDeviceFrame ? (
            <div className="w-full h-full">
              <ImageWithFrame
                imageUrl={imageUrl}
                showDeviceFrame={showDeviceFrame}
                deviceType={deviceType}
                imageAspectRatio={imageAspectRatio}
              />
            </div>
          ) : (
            <div className="w-40 aspect-video rounded-full overflow-hidden border-4 border-white shadow-xl bg-neutral-50">
              <ImageWithFrame
                imageUrl={imageUrl}
                showDeviceFrame={showDeviceFrame}
                deviceType={deviceType}
                imageAspectRatio={imageAspectRatio}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center px-12 text-center">
      {seriesNumber && (
        <div className="mb-6 text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase">
          {seriesNumber}
        </div>
      )}
      <div className="mb-12">
        <TitleRenderer
          title={title}
          highlights={highlights}
          sizeClass="text-3xl"
          fontClassName={fontClassName}
        />
      </div>
      {showDeviceFrame ? (
        <div className="w-full h-full">
          <ImageWithFrame
            imageUrl={imageUrl}
            showDeviceFrame={showDeviceFrame}
            deviceType={deviceType}
            imageAspectRatio={imageAspectRatio}
          />
        </div>
      ) : (
        <div className="w-48 aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl bg-neutral-50">
          <ImageWithFrame
            imageUrl={imageUrl}
            showDeviceFrame={showDeviceFrame}
            deviceType={deviceType}
            imageAspectRatio={imageAspectRatio}
          />
        </div>
      )}
    </div>
  );
};

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

export const MagazineTemplate = ({
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
      <div className="relative w-full h-full bg-neutral-50 flex flex-col overflow-hidden">
        {showDeviceFrame ? (
          <div className="flex-1 w-full">
            <ImageWithFrame
              imageUrl={imageUrl}
              showDeviceFrame={showDeviceFrame}
              deviceType={deviceType}
              imageAspectRatio={imageAspectRatio}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative shadow-inner bg-neutral-200">
            <ImageWithFrame
              imageUrl={imageUrl}
              showDeviceFrame={showDeviceFrame}
              deviceType={deviceType}
              imageAspectRatio={imageAspectRatio}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
          </div>
        )}
        <div className="absolute inset-0 flex justify-center items-center px-6 z-20 text-white drop-shadow-2xl">
          {seriesNumber && (
            <div className="text-[10px] font-black tracking-[0.5em] mb-3 opacity-90 uppercase">
              {seriesNumber}
            </div>
          )}
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-3xl"
            fontClassName={fontClassName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-neutral-50 flex flex-col overflow-hidden">
      {showDeviceFrame ? (
        <div className="flex-1 w-full">
          <ImageWithFrame
            imageUrl={imageUrl}
            showDeviceFrame={showDeviceFrame}
            deviceType={deviceType}
            imageAspectRatio={imageAspectRatio}
          />
        </div>
      ) : (
        <div className="flex-1  overflow-hidden relative shadow-inner bg-neutral-200">
          <ImageWithFrame
            imageUrl={imageUrl}
            showDeviceFrame={showDeviceFrame}
            deviceType={deviceType}
            imageAspectRatio={imageAspectRatio}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
        </div>
      )}
      <div className="absolute top-14 left-0 w-full px-10 z-20 text-white drop-shadow-2xl">
        {seriesNumber && (
          <div className="text-[10px] font-black tracking-[0.5em] mb-3 opacity-90 uppercase">
            {seriesNumber}
          </div>
        )}
        <TitleRenderer
          title={title}
          highlights={highlights}
          sizeClass="text-5xl"
          fontClassName={fontClassName}
        />
      </div>
    </div>
  );
};

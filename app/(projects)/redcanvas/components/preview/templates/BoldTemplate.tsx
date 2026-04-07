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
  imageAspectRatio: number;
  fontClassName: string;
  isLandscape: boolean;
}

export const BoldTemplate = ({
  title,
  highlights,
  seriesNumber,
  imageUrl,
  showDeviceFrame,
  deviceType,
  imageAspectRatio,
  fontClassName,
  isLandscape,
}: TemplateProps) => {
  if (isLandscape) {
    return (
      <div className="relative w-full h-full bg-neutral-950 flex flex-row overflow-hidden p-10">
        <div className="flex-1">
          {showDeviceFrame ? (
            <div className="w-full h-full opacity-40">
              <ImageWithFrame
                imageUrl={imageUrl}
                showDeviceFrame={showDeviceFrame}
                deviceType={deviceType}
                imageAspectRatio={imageAspectRatio}
              />
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
            </div>
          ) : (
            <div className="w-full h-full opacity-40">
              <ImageWithFrame
                imageUrl={imageUrl}
                showDeviceFrame={showDeviceFrame}
                deviceType={deviceType}
                imageAspectRatio={imageAspectRatio}
              />
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center pl-8 z-10 text-white">
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-4xl"
            fontClassName={fontClassName}
          />
          {seriesNumber && (
            <div className="mt-6 font-playfair italic text-lg opacity-50">
              {seriesNumber}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-neutral-950 flex flex-col overflow-hidden p-8">
      <div className="absolute inset-0 ">
        <ImageWithFrame
          imageUrl={imageUrl}
          showDeviceFrame={showDeviceFrame}
          deviceType={deviceType}
          imageAspectRatio={imageAspectRatio}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>
      <div className="mt-auto z-10 text-white">
        <TitleRenderer
          title={title}
          highlights={highlights}
          sizeClass="text-5xl"
          fontClassName={fontClassName}
        />
        {seriesNumber && (
          <div className="mt-8 font-playfair italic text-2xl opacity-50">
            {seriesNumber}
          </div>
        )}
      </div>
    </div>
  );
};

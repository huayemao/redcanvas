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

export const FloatingTemplate = ({
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
      <div className="relative w-full h-full bg-[#f2f2f2] flex flex-row p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex-1 flex flex-col justify-center pr-2 z-20 items-start">
          {seriesNumber && (
            <div className="bg-neutral-900 text-white px-3 py-1 inline-block rounded-lg font-bold text-[10px] mb-4 tracking-widest">
              {seriesNumber}
            </div>
          )}
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-2xl"
            fontClassName={fontClassName}
          />
        </div>
        <div className="flex-1 flex items-center justify-center self-end">
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
            <div className="relative aspect-video rounded-[24px] overflow-hidden shadow-2xl z-10 transform rotate-1 bg-white">
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
    <div className="relative w-full h-full bg-[#f2f2f2] p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-20 mb-8">
        {seriesNumber && (
          <div className="bg-neutral-900 text-white px-3 py-1 inline-block rounded-lg font-bold text-[10px] mb-4 tracking-widest">
            {seriesNumber}
          </div>
        )}
        <TitleRenderer
          title={title}
          highlights={highlights}
          sizeClass="text-4xl"
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
        <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-2xl z-10 transform rotate-1 bg-white">
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

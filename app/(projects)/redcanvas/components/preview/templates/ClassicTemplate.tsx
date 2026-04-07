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

export const ClassicTemplate = ({
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
      <div className="relative w-full h-full bg-white flex flex-row px-4 py-4 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center pr-2">
          {seriesNumber && (
            <div className="text-xl font-playfair italic text-neutral-200 mb-4">
              {seriesNumber}
            </div>
          )}
          <div className="z-10 text-neutral-900">
            <TitleRenderer
              title={title}
              highlights={highlights}
              sizeClass="text-2xl"
              fontClassName={fontClassName}
            />
          </div>
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
            <div className="w-full aspect-video rounded shadow-2xl overflow-hidden ring-[10px] ring-neutral-50 -rotate-1 transform-gpu">
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
    <div className="relative w-full h-full bg-white flex flex-col pt-16 px-10 overflow-hidden">
      {seriesNumber && (
        <div className="absolute top-6 left-10 text-3xl font-playfair italic text-neutral-200">
          {seriesNumber}
        </div>
      )}
      <div className="z-10 mb-8 text-neutral-900">
        <TitleRenderer
          title={title}
          highlights={highlights}
          sizeClass="text-4xl"
          fontClassName={fontClassName}
        />
      </div>
      <div className="flex-1 flex items-center justify-center pb-16">
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
          <div className="w-full aspect-square rounded-[32px] shadow-2xl overflow-hidden ring-[10px] ring-neutral-50 -rotate-1 transform-gpu">
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
};

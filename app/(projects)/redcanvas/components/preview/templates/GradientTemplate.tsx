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
}

export const GradientTemplate = ({
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
      <div className="relative w-full h-full bg-gradient-to-b from-green-100 to-blue-100  p-4 overflow-hidden">
        {/* Text content */}
        <div className="z-10 mb-6 text-center max-w-md">
          {seriesNumber && (
            <div className="text-sm font-black tracking-[0.3em] mb-3 text-neutral-700 uppercase">
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
        {/* Image */}
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
            <div className="w-full max-w-md aspect-video rounded-lg shadow-xl overflow-hidden bg-white">
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
    <div className="relative w-full h-full bg-gradient-to-b from-green-100 to-blue-100 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Text content */}
      <div className="z-10 mb-8 text-center max-w-md">
        {seriesNumber && (
          <div className="text-sm font-black tracking-[0.3em] mb-3 text-neutral-700 uppercase">
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
      {/* Image */}
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
          <div className="w-full max-w-md rounded-lg shadow-xl overflow-hidden bg-white">
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

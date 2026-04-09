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
  gradientStartColor: string;
  gradientEndColor: string;
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
  gradientStartColor,
  gradientEndColor,
}: TemplateProps) => {
  if (isLandscape) {
    return (
      <div 
        className="relative w-full h-full p-4 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${gradientStartColor} 0%, ${gradientEndColor} 100%)`,
          backgroundSize: '150% 150%',
          animation: 'gradient 15s ease infinite',
        }}
      >
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        {/* Text content */}
        <div className="z-10 mb-6 text-center max-w-md">
          {seriesNumber && (
            <div className="text-sm font-black tracking-[0.3em] mb-3 text-white/90 uppercase">
              {seriesNumber}
            </div>
          )}
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-3xl"
            fontClassName={fontClassName}
            textColor="text-white"
          />
        </div>
        {/* Image */}
        <div className="">
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
            <div className="w-full max-w-md aspect-video rounded-lg shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
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
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${gradientStartColor} 0%, ${gradientEndColor} 100%)`,
        backgroundSize: '150% 150%',
        animation: 'gradient 15s ease infinite',
      }}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      {/* Text content */}
      <div className="z-10 mb-8 text-center max-w-md">
        {seriesNumber && (
          <div className="text-sm font-black tracking-[0.3em] mb-3 text-white/90 uppercase">
            {seriesNumber}
          </div>
        )}
        <TitleRenderer
          title={title}
          highlights={highlights}
          sizeClass="text-4xl"
          fontClassName={fontClassName}
          textColor="text-white"
        />
      </div>
      {/* Image */}
      <div className="">
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
          <div className="w-full max-w-md rounded-lg shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
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

'use client';

import React from "react";
import { DeviceType } from "../../types";

interface ImageWithFrameProps {
  imageUrl: string | null;
  showDeviceFrame: boolean;
  deviceType: DeviceType;
  imageAspectRatio: number;
}

export const ImageWithFrame = ({
  imageUrl,
  showDeviceFrame,
  deviceType,
  imageAspectRatio,
}: ImageWithFrameProps) => {
  if (!imageUrl)
    return (
      <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300 font-bold">
        待上传图片
      </div>
    );

  if (!showDeviceFrame || deviceType === "none") {
    return (
      <img
        src={imageUrl}
        crossOrigin="anonymous"
        className="w-full h-full object-cover"
        alt="cover"
      />
    );
  }

  const isLandscape = imageAspectRatio >= 1;

  if (deviceType === "browser") {
    if (isLandscape) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded  rotate-1">
            <div className="h-6 flex items-center gap-1.5 px-3 bg-[#e5e7eb] border-b border-neutral-300">
              <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
              <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
              <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
              <div className="ml-4 flex-1 h-3 bg-white/60 rounded-full border border-neutral-300/50" />
            </div>
            <div className="flex-1 overflow-hidden rounded">
              <img
                src={imageUrl}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                alt="cover"
              />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-[75%] aspect-[9/19] flex flex-col overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded  rotate-1">
            <div className="h-6 flex items-center gap-1.5 px-3 bg-[#e5e7eb] border-b border-neutral-300">
              <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
              <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
              <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
              <div className="ml-4 flex-1 h-3 bg-white/60 rounded-full border border-neutral-300/50" />
            </div>
            <div className="flex-1 overflow-hidden">
              <img
                src={imageUrl}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                alt="cover"
              />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          </div>
        </div>
      );
    }
  }

  if (deviceType === "device") {
    if (isLandscape) {
      return (
        <div className="relative w-[145%] left-[-10%] top-[-4%] aspect-[16/10]">
          <div className="relative">
            <img
              src="/macbook-mockup.png"
              alt="MacBook mockup"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0  w-[78%]  top-[5%] left-[11%]">
              <img
                src={imageUrl}
                crossOrigin="anonymous"
                className="object-cover aspect-[16/10]"
                alt="cover"
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative w-full aspect-[16/12] mx-auto">
          <div className="relative top-[45%]">
            <img
              src="/iphone-15-pro-mockup.png"
              alt="iPhone mockup"
              className="relative  object-contain scale-240"
            />
            <div className="absolute inset-0  w-[74.5%]  -top-[57%] left-[12.5%] rounded-[30px]">
              <img
                src={imageUrl}
                crossOrigin="anonymous"
                className="object-cover aspect-[9/19] rounded-[30px]"
                alt="cover"
              />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <img
      src={imageUrl}
      crossOrigin="anonymous"
      className="w-full h-full object-cover"
      alt="cover"
    />
  );
};

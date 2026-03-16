'use client';

import React from "react";
import { TitleRenderer } from "./TitleRenderer";
import { ImageWithFrame } from "./ImageWithFrame";
import { Highlight, DeviceType } from "../../types";

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

interface TemplatePropsSimple {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  imageAspectRatio: number;
  fontClassName: string;
  isLandscape?: boolean;
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

export const MockupTemplate = ({
  title,
  highlights,
  seriesNumber,
  imageUrl,
  fontClassName,
}: TemplatePropsSimple) => {
  return (
    <div className="relative w-full h-full">
      {/* Background mockup image */}
      <div className="absolute inset-0">
        <img
          src="/mockup_scene.webp"
          alt="Mockup scene"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text content with gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="relative px-8 pb-8 pt-16">
          {seriesNumber && (
            <span className="text-[12px] font-black tracking-[0.3em] mb-4 text-white/80 uppercase block">
              {seriesNumber}
            </span>
          )}
          <TitleRenderer
            title={title}
            highlights={highlights}
            sizeClass="text-white inline text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg"
            fontClassName={fontClassName}
          />
        </div>
      </div>  
      <div className="perspective-[1200px] w-[80.5%] mx-auto relative rounded-top rounded-lg top-[14.3%] left-[4.5%]">
        <div className="w-full bg-white shadow-xl    overflow-hidden  rounded-t rounded-t-[5px]
              transform 
              aspect-[16/10.5]
              -rotate-x-14
              rotate-y-10
              rotate-[0.89deg]
              origin-center"
              >
          <img
            src={imageUrl || '/mockup_screen.webp'}
            alt="MacBook Screen"
            className="w-full  object-cover"
          />
        </div>
      </div>
    </div>
  );
};

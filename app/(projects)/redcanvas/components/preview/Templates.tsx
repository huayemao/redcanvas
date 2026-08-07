'use client';

import React from "react";
import { Highlight, DeviceType } from "../../types";
import { ShowcaseTemplate } from "./templates/ShowcaseTemplate";
import { AestheticGalleryTemplate } from "./templates/AestheticGalleryTemplate";

export interface TemplateProps {
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

export interface TemplatePropsSimple {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  imageAspectRatio: number | null;
  fontClassName: string;
  isLandscape?: boolean;
}

export type TemplateType = 'showcase' | 'aesthetic-gallery';

const templateMap: Record<TemplateType, React.ComponentType<any>> = {
  showcase: ShowcaseTemplate,
  'aesthetic-gallery': AestheticGalleryTemplate,
};

export const getTemplateComponent = (template: TemplateType) => {
  return templateMap[template] || ShowcaseTemplate;
};

export {
  ShowcaseTemplate,
  AestheticGalleryTemplate,
};

'use client';

import React from "react";
import { Highlight, DeviceType } from "../../types";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MagazineTemplate } from "./templates/MagazineTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { BoldTemplate } from "./templates/BoldTemplate";
import { FloatingTemplate } from "./templates/FloatingTemplate";
import { MockupTemplate } from "./templates/MockupTemplate";
import { GradientTemplate } from "./templates/GradientTemplate";

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

export type TemplateType = 'classic' | 'magazine' | 'minimal' | 'bold' | 'floating' | 'mockup' | 'gradient';

const templateMap: Record<TemplateType, React.ComponentType<any>> = {
  classic: ClassicTemplate,
  magazine: MagazineTemplate,
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  floating: FloatingTemplate,
  mockup: MockupTemplate,
  gradient: GradientTemplate,
};

export const getTemplateComponent = (template: TemplateType) => {
  return templateMap[template] || ClassicTemplate;
};

export {
  ClassicTemplate,
  MagazineTemplate,
  MinimalTemplate,
  BoldTemplate,
  FloatingTemplate,
  MockupTemplate,
  GradientTemplate,
};


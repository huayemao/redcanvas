
export type TemplateId = 'classic' | 'minimal' | 'bold' | 'floating' | 'magazine';

export interface Highlight {
  id: string;
  text: string;
  color: string;
}

export type DeviceType = 'none' | 'browser' | 'macbook';

export interface EditorState {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  imageAspectRatio: number; // Width / Height
  showDeviceFrame: boolean;
  deviceType: DeviceType;
  templateId: TemplateId;
  fontFamily: string;
  accentColor: string; // Global accent
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  previewColor: string;
}

export interface FontOption {
  id: string;
  name: string;
  className: string;
}

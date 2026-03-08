
export type TemplateId = 'classic' | 'minimal' | 'bold' | 'floating' | 'magazine';

export interface Highlight {
  id: string;
  text: string;
  color: string;
  style: 'underline' | 'text';
}

export type DeviceType = 'none' | 'browser' | 'macbook';

export type Orientation = 'portrait' | 'landscape';
export type ExportSize = 'xiaohongshu' | 'bilibili' | 'youtube' | 'custom';

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
  orientation: Orientation;
  exportSize: ExportSize;
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

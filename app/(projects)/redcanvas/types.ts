
export type TemplateId = 'classic' | 'minimal' | 'bold' | 'floating' | 'magazine'| 'mockup' | 'gradient';

export interface Highlight {
  id: string;
  text: string;
  color: string;
  style: 'underline' | 'text';
}

export type DeviceType = 'none' | 'browser' | 'device';

export type Orientation = 'portrait' | 'landscape';
export type ExportSize = '3:4' | '3:2' | '1:1' | '4:3' | '9:16';

export interface EditorState {
  title: string;
  highlights: Highlight[];
  seriesNumber: string;
  imageUrl: string | null;
  imageAspectRatio: number | null; // Width / Height, null means original ratio
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

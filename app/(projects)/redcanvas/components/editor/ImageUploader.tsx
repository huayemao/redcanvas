import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        onImageUpload(url);
      };
      img.src = url;
    }
  }, [onImageUpload]);

  return (
    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-100 rounded-3xl cursor-pointer hover:bg-neutral-50 transition-all group">
      <Upload className="w-6 h-6 text-neutral-300 mb-2 group-hover:text-red-500" />
      <span className="text-[10px] font-black text-neutral-400">点击/拖拽/粘贴图片素材</span>
      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
    </label>
  );
};

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
    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/[0.1] rounded-3xl cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.2] transition-all group">
      <Upload className="w-6 h-6 text-white/30 mb-2 group-hover:text-red-400 transition-colors" />
      <span className="text-[10px] font-black text-white/40 group-hover:text-white/60 transition-colors">
        点击/拖拽/粘贴图片素材
      </span>
      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
    </label>
  );
};

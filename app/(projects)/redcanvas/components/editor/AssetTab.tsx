import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Laptop } from 'lucide-react';
import { EditorState, DeviceType } from '../../types';
import { ImageUploader } from './ImageUploader';

interface AssetTabProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
}

const RATIO_OPTIONS: { value: string; label: string }[] = [
  { value: '16:9', label: '16:9' },
  { value: '3:2', label: '3:2' },
  { value: '4:3', label: '4:3' },
  { value: '2:3', label: '2:3' },
  { value: '9:20', label: '9:20' },
];

export const AssetTab: React.FC<AssetTabProps> = ({ state, setState }) => {
  const handleImageUpload = (url: string) => {
    setState(prev => ({
      ...prev,
      imageUrl: url,
      imageAspectRatio: '4:5',
    }));
  };

  const isLandscape = state.imageAspectRatio
    ? Number(state.imageAspectRatio.split(':')[0]) >= Number(state.imageAspectRatio.split(':')[1])
    : false;

  return (
    <motion.div
      key="asset"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
           <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">背景图片</label>
           <button
             onClick={() => setState(prev => ({ ...prev, showDeviceFrame: !prev.showDeviceFrame }))}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
               state.showDeviceFrame
               ? 'bg-red-500 text-white'
               : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
             }`}
           >
             {isLandscape ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
             网站/App 壳子: {state.showDeviceFrame ? '开启' : '关闭'}
           </button>
        </div>
        {state.showDeviceFrame ? (
          <div className="mb-4">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">设备类型</label>
            <div className="grid grid-cols-3 gap-2">
              {
                [
                  { type: 'none' as DeviceType, label: '无', icon: Monitor },
                  { type: 'browser' as DeviceType, label: '浏览器', icon: Monitor },
                  { type: 'device' as DeviceType, label: '设备', icon: Laptop },
                ].map((device) => (
                  <button
                    key={device.type}
                    onClick={() => setState(prev => ({ ...prev, deviceType: device.type }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      state.deviceType === device.type
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-100 hover:border-neutral-200 bg-white'
                    }`}
                  >
                    <device.icon className="w-4 h-4" />
                    <span className="text-[9px] font-black">{device.label}</span>
                  </button>
                ))
              }
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">图片比例</label>
            <div className="grid grid-cols-6 gap-2">
              {RATIO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setState(prev => ({ ...prev, imageAspectRatio: option.value }))}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    state.imageAspectRatio === option.value
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-100 hover:border-neutral-200 bg-white'
                  }`}
                >
                  <span className="text-[9px] font-black">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <ImageUploader onImageUpload={handleImageUpload} />
      </div>
    </motion.div>
  );
};

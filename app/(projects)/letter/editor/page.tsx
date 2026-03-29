'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Copy, Image as ImageIcon, Check, Palette, Scissors } from 'lucide-react';
import { themes, ThemeId } from '../lib/themes';
import { renderMarkdown } from '../lib/markdown';

const DEFAULT_MARKDOWN = `# 亲爱的朋友

见字如面。

这是一封用 **信纸计划** 写就的信。你可以用它来记录生活、表达情感，或者仅仅是享受纯粹的文字排版之美。

## 为什么写信？

在这个快节奏的时代，我们习惯了即时通讯的便捷，却也渐渐遗忘了文字的温度。一封排版精美的信，不仅是对收信人的尊重，也是对自己内心的梳理。

* 它可以是一段回忆
* 它可以是一份祝福
* 它可以是一次倾诉

> "从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。"

## 功能展示

信纸计划支持标准的 Markdown 语法，包括：

1. **加粗** 和 *斜体*
2. [链接](https://example.com)
3. 列表和引用

甚至可以插入图片，并自动将图片的 alt 文本渲染为优雅的图注：

![一封来自远方的信](https://picsum.photos/seed/letter/800/400)

祝好，
你的朋友
`;

export default function Editor() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState('');
  const [themeId, setThemeId] = useState<ThemeId>('classic');
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [autoSlice, setAutoSlice] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHtml = async () => {
      const rendered = await renderMarkdown(markdown, themes[themeId]);
      setHtml(rendered);
    };
    updateHtml();
  }, [markdown, themeId]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
      alert('复制失败，请重试');
    }
  };

  const sliceImage = async (dataUrl: string): Promise<Blob[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const slices: Blob[] = [];
        const sliceHeight = img.width * 1.25; 
        const numSlices = Math.ceil(img.height / sliceHeight);
        
        let loadedSlices = 0;
        
        for (let i = 0; i < numSlices; i++) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          const currentSliceHeight = Math.min(sliceHeight, img.height - i * sliceHeight);
          canvas.height = currentSliceHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(
            img,
            0, i * sliceHeight, img.width, currentSliceHeight,
            0, 0, canvas.width, currentSliceHeight
          );
          
          canvas.toBlob((blob) => {
            if (blob) {
              slices[i] = blob;
              loadedSlices++;
              if (loadedSlices === numSlices) {
                resolve(slices);
              }
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png', 1.0);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for slicing'));
      img.src = dataUrl;
    });
  };

  const handleExportImage = async () => {
    if (!previewRef.current) return;
    
    try {
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      if (autoSlice) {
        const slices = await sliceImage(dataUrl);
        const zip = new JSZip();
        
        slices.forEach((blob, index) => {
          zip.file(`letter-part-${index + 1}.png`, blob);
        });
        
        const zipContent = await zip.generateAsync({ type: 'blob' });
        saveAs(zipContent, `letter-slices-${Date.now()}.zip`);
      } else {
        const link = document.createElement('a');
        link.download = `letter-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('导出图片失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-stone-50">
      <div className="md:hidden flex border-b border-stone-200 bg-white shrink-0">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'edit' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          编辑
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'preview' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          预览与导出
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`w-full md:w-1/2 flex-col border-r border-stone-200 bg-white ${mobileTab === 'edit' ? 'flex' : 'hidden md:flex'}`}>
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/50 shrink-0">
            <div className="flex items-center gap-2 text-stone-600 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Markdown 编辑器
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-4 md:p-6 resize-none focus:outline-none text-stone-700 font-mono text-sm leading-relaxed bg-transparent"
            placeholder="在此输入 Markdown..."
          />
        </div>

        <div className={`w-full md:w-1/2 flex-col bg-stone-100 relative ${mobileTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-b border-stone-200/50 shadow-sm shrink-0">
            <div className="flex items-center gap-2 p-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center bg-stone-100 rounded-lg p-1 shrink-0">
                <Palette size={16} className="text-stone-500 ml-2 mr-1" />
                {(Object.keys(themes) as ThemeId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setThemeId(id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      themeId === id
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {themes[id].name}
                  </button>
                ))}
              </div>
              
              <div className="w-px h-6 bg-stone-200 mx-1 shrink-0"></div>
              
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
                title="复制内联 HTML，可直接粘贴到邮件客户端"
              >
                {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                <span>{isCopied ? '已复制' : '复制 HTML'}</span>
              </button>
              
              <div className="w-px h-6 bg-stone-200 mx-1 shrink-0"></div>

              <label className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-stone-600 cursor-pointer hover:text-stone-900 transition-colors shrink-0" title="导出时自动切成多张图，适合发朋友圈">
                <input 
                  type="checkbox" 
                  checked={autoSlice} 
                  onChange={(e) => setAutoSlice(e.target.checked)}
                  className="w-3 h-3 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <Scissors size={14} />
                <span>自动切图</span>
              </label>
              
              <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50 shrink-0 ml-auto"
              >
                <ImageIcon size={16} />
                <span>{isExporting ? '导出中...' : '导出图片'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 pb-20">
            <motion.div
              key={themeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <div 
                ref={previewRef}
                className="w-full max-w-[800px] transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

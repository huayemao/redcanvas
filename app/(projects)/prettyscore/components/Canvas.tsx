import React, { useCallback } from 'react';
import { THEMES } from '../constants';

interface UseCanvasProps {
  rawCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  processedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  finalCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  lastProcessedColor: React.RefObject<string | null>;
  bgType: 'preset' | 'custom' | 'theme';
  bgPresetUrl: string;
  bgCustomUrl: string;
  bgThemeId: string;
  debouncedCustomBgColor: string;
  debouncedScoreColor: string;
  debouncedDecoration: string;
  debouncedBlendMode: string;
  debouncedVignette: number;
  debouncedWarmth: number;
  debouncedOverlayOpacity: number;
  debouncedOverlayDirection: 'solid' | 'top-bottom' | 'bottom-top' | 'radial';
  debouncedOverlayColor: string;
  processScoreCanvas: (canvas: HTMLCanvasElement, rgb: { r: number; g: number; b: number }) => HTMLCanvasElement;
  hexToRgb: (hex: string) => { r: number; g: number; b: number };
}

export default function useCanvas({ 
  rawCanvasRef, 
  processedCanvasRef, 
  finalCanvasRef, 
  lastProcessedColor, 
  bgType, 
  bgPresetUrl, 
  bgCustomUrl, 
  bgThemeId, 
  debouncedCustomBgColor, 
  debouncedScoreColor, 
  debouncedDecoration, 
  debouncedBlendMode, 
  debouncedVignette, 
  debouncedWarmth, 
  debouncedOverlayOpacity, 
  debouncedOverlayDirection, 
  debouncedOverlayColor,
  processScoreCanvas,
  hexToRgb
}: UseCanvasProps) {
  const drawThemeElements = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, elementsType: string) => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const getEdgePosition = (seedBase: number, w: number, h: number) => {
      const isEdgeX = seededRandom(seedBase) > 0.5;
      let x, y;
      if (isEdgeX) {
        const xSide = seededRandom(seedBase + 1) > 0.5 ? 0 : 0.85;
        x = (xSide + seededRandom(seedBase + 2) * 0.15) * w;
        y = seededRandom(seedBase + 3) * h;
      } else {
        const ySide = seededRandom(seedBase + 1) > 0.5 ? 0 : 0.85;
        y = (ySide + seededRandom(seedBase + 2) * 0.15) * h;
        x = seededRandom(seedBase + 3) * w;
      }
      return { x, y };
    };

    if (elementsType === 'sakura') {
      for (let i = 0; i < 40; i++) {
        const { x, y } = getEdgePosition(i * 10, width, height);
        const size = seededRandom(i * 10 + 4) * width * 0.015 + 8;
        const angle = seededRandom(i * 10 + 5) * Math.PI * 2;
        const opacity = seededRandom(i * 10 + 6) * 0.6 + 0.2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opacity;
        
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.bezierCurveTo(size * 0.8, size * 0.8, size, 0, 0, -size * 0.8);
        ctx.bezierCurveTo(-size, 0, -size * 0.8, size * 0.8, 0, size);
        ctx.fill();
        
        ctx.fillStyle = '#ec407a';
        ctx.globalAlpha = opacity * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.6);
        ctx.bezierCurveTo(size * 0.3, size * 0.4, size * 0.2, 0, 0, -size * 0.4);
        ctx.bezierCurveTo(-size * 0.2, 0, -size * 0.3, size * 0.4, 0, size * 0.6);
        ctx.fill();
        
        ctx.restore();
      }
    } else if (elementsType === 'stars') {
      for (let i = 0; i < 60; i++) {
        const { x, y } = getEdgePosition(i * 20, width, height);
        const size = seededRandom(i * 20 + 4) * width * 0.004 + 2;
        const isCyan = seededRandom(i * 20 + 5) > 0.7;
        const isPink = seededRandom(i * 20 + 6) > 0.8;
        
        ctx.fillStyle = isCyan ? '#84ffff' : (isPink ? '#ff80ab' : '#ffffff');
        ctx.globalAlpha = seededRandom(i * 20 + 7) * 0.7 + 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.quadraticCurveTo(0, 0, 0, size);
        ctx.quadraticCurveTo(0, 0, -size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -size);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (elementsType === 'leaves') {
      for (let i = 0; i < 35; i++) {
        const { x, y } = getEdgePosition(i * 30, width, height);
        const size = seededRandom(i * 30 + 4) * width * 0.015 + 10;
        const angle = seededRandom(i * 30 + 5) * Math.PI * 2;
        const opacity = seededRandom(i * 30 + 6) * 0.5 + 0.2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opacity;
        
        ctx.fillStyle = '#a5d6a7';
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size, 0, 0, size);
        ctx.quadraticCurveTo(-size, 0, 0, -size);
        ctx.fill();
        
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(0, size * 0.8);
        ctx.stroke();
        
        ctx.restore();
      }
    } else if (elementsType === 'bubbles') {
      for (let i = 0; i < 40; i++) {
        const { x, y } = getEdgePosition(i * 50, width, height);
        const size = seededRandom(i * 50 + 4) * width * 0.02 + 5;
        const opacity = seededRandom(i * 50 + 5) * 0.4 + 0.1;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = opacity;
        
        ctx.strokeStyle = '#80deea';
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
  }, []);

  const drawDecorations = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, type: string, color: string, currentBlendMode: string) => {
    if (type === 'none') return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, width * 0.002);
    ctx.globalCompositeOperation = currentBlendMode as any;
    
    const margin = width * 0.04;
    
    if (type === 'classic-border') {
      ctx.lineWidth = Math.max(1, width * 0.0008);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
      ctx.lineWidth = Math.max(2, width * 0.002);
      const m2 = margin + width * 0.006;
      ctx.strokeRect(m2, m2, width - m2*2, height - m2*2);
    } else if (type === 'floral-corners') {
      const drawCorner = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        const scale = width * 0.0006;
        ctx.scale(scale, scale);

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(40, 0, 80, 40, 120, 120);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(0, 40, 40, 80, 120, 120);
        ctx.stroke();

        const drawLeaf = (lx: number, ly: number, rot: number, s: number) => {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(rot);
          ctx.scale(s, s);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(15, -15, 30, 0, 40, 20);
          ctx.bezierCurveTo(20, 30, 0, 15, 0, 0);
          ctx.fill();
          ctx.restore();
        };

        drawLeaf(40, 15, Math.PI/6, 1);
        drawLeaf(15, 40, Math.PI/3, 1);
        drawLeaf(80, 45, Math.PI/4, 0.8);
        drawLeaf(45, 80, Math.PI/2.5, 0.8);

        ctx.restore();
      };
      drawCorner(margin, margin, 0);
      drawCorner(width - margin, margin, Math.PI / 2);
      drawCorner(width - margin, height - margin, Math.PI);
      drawCorner(margin, height - margin, -Math.PI / 2);
      
      ctx.lineWidth = Math.max(1, width * 0.0005);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
    } else if (type === 'vintage-frame') {
      ctx.lineWidth = Math.max(1, width * 0.001);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
      
      const innerMargin = margin + width * 0.012;
      ctx.lineWidth = Math.max(2, width * 0.002);
      ctx.strokeRect(innerMargin, innerMargin, width - innerMargin*2, height - innerMargin*2);
      
      const drawOrnament = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        const r = width * 0.015;
        
        ctx.beginPath();
        ctx.arc(r, r, r, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(r*2.5, r, r*0.5, Math.PI*0.5, Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r, r*2.5, r*0.5, Math.PI*1.5, Math.PI*2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(r*1.2, r*1.2, r*0.3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      };
      
      drawOrnament(margin, margin, 0);
      drawOrnament(width - margin, margin, Math.PI / 2);
      drawOrnament(width - margin, height - margin, Math.PI);
      drawOrnament(margin, height - margin, -Math.PI / 2);
    } else if (type === 'art-deco') {
      const m1 = margin;
      const m2 = margin + width * 0.008;
      const m3 = margin + width * 0.016;
      
      ctx.lineWidth = Math.max(1, width * 0.001);
      ctx.strokeRect(m1, m1, width - m1*2, height - m1*2);
      ctx.lineWidth = Math.max(2, width * 0.002);
      ctx.strokeRect(m2, m2, width - m2*2, height - m2*2);
      ctx.lineWidth = Math.max(1, width * 0.001);
      ctx.strokeRect(m3, m3, width - m3*2, height - m3*2);
      
      const drawDecoCorner = (x: number, y: number, mx: number, my: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(mx, my);
        const s = width * 0.035;
        ctx.beginPath();
        ctx.moveTo(0, s);
        ctx.lineTo(s*0.3, s*0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s*0.6, s*0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      
      drawDecoCorner(m1, m1, 1, 1);
      drawDecoCorner(width - m1, m1, -1, 1);
      drawDecoCorner(width - m1, height - m1, -1, -1);
      drawDecoCorner(m1, height - m1, 1, -1);
    } else if (type === 'minimalist-grid') {
      ctx.lineWidth = Math.max(1, width * 0.0005);
      ctx.globalAlpha = 0.3;
      const gridSize = width * 0.05;
      
      for (let x = margin; x <= width - margin; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, height - margin);
        ctx.stroke();
      }
      for (let y = margin; y <= height - margin; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(2, width * 0.0015);
      ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
    }
    
    ctx.restore();
  }, []);

  const drawFinal = useCallback(() => {
    const finalCanvas = finalCanvasRef.current;
    const processedCanvas = processedCanvasRef.current;
    if (!finalCanvas || !processedCanvas) return;

    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    finalCanvas.width = processedCanvas.width;
    finalCanvas.height = processedCanvas.height;

    const drawBackground = () => {
      return new Promise<void>((resolve) => {
        if (bgType === 'theme') {
          const theme = THEMES.find(t => t.id === bgThemeId);
          if (theme) {
            ctx.fillStyle = debouncedCustomBgColor;
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            drawThemeElements(ctx, finalCanvas.width, finalCanvas.height, theme.elements);
          }
          resolve();
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        let hasRetried = false;
        
        img.onload = () => {
          const scale = Math.max(finalCanvas.width / img.width, finalCanvas.height / img.height);
          const x = (finalCanvas.width / 2) - (img.width / 2) * scale;
          const y = (finalCanvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          resolve();
        };
        img.onerror = () => {
          if (!hasRetried && img.src === bgPresetUrl) {
            hasRetried = true;
            img.src = bgPresetUrl; // Fallback to the same URL for now
          } else {
            ctx.fillStyle = '#d4b58e';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            resolve();
          }
        };
        img.src = bgType === 'preset' ? bgPresetUrl : bgCustomUrl;
      });
    };

    drawBackground().then(() => {
      // 0. Image Overlay
      if (bgType !== 'theme' && debouncedOverlayOpacity > 0) {
        ctx.save();
        const w = finalCanvas.width;
        const h = finalCanvas.height;
        const r = parseInt(debouncedOverlayColor.slice(1,3), 16) || 255;
        const g = parseInt(debouncedOverlayColor.slice(3,5), 16) || 255;
        const b = parseInt(debouncedOverlayColor.slice(5,7), 16) || 255;
        const rgba = (alpha: number) => `rgba(${r},${g},${b},${alpha})`;
        
        if (debouncedOverlayDirection === 'solid') {
          ctx.fillStyle = rgba(debouncedOverlayOpacity);
        } else if (debouncedOverlayDirection === 'top-bottom') {
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, rgba(debouncedOverlayOpacity));
          grad.addColorStop(1, rgba(0));
          ctx.fillStyle = grad;
        } else if (debouncedOverlayDirection === 'bottom-top') {
          const grad = ctx.createLinearGradient(0, h, 0, 0);
          grad.addColorStop(0, rgba(debouncedOverlayOpacity));
          grad.addColorStop(1, rgba(0));
          ctx.fillStyle = grad;
        } else if (debouncedOverlayDirection === 'radial') {
          const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
          grad.addColorStop(0, rgba(0));
          grad.addColorStop(1, rgba(debouncedOverlayOpacity));
          ctx.fillStyle = grad;
        }
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 1. Warmth Tint
      if (debouncedWarmth > 0) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(210, 150, 80, ${debouncedWarmth})`;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      // 2. Score
      ctx.globalCompositeOperation = debouncedBlendMode as any;
      ctx.drawImage(processedCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      // 3. Decorations
      drawDecorations(ctx, finalCanvas.width, finalCanvas.height, debouncedDecoration, debouncedScoreColor, debouncedBlendMode);

      // 4. Heavy Burnt Vignette
      if (debouncedVignette > 0) {
        const cx = finalCanvas.width / 2;
        const cy = finalCanvas.height / 2;
        const radius = Math.max(cx, cy);
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.2);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.6, `rgba(70, 30, 10, ${debouncedVignette * 0.4})`);
        gradient.addColorStop(1, `rgba(30, 10, 0, ${debouncedVignette})`);
        
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  }, [bgType, bgPresetUrl, bgCustomUrl, bgThemeId, debouncedCustomBgColor, debouncedWarmth, debouncedBlendMode, debouncedVignette, debouncedDecoration, debouncedScoreColor, debouncedOverlayOpacity, debouncedOverlayDirection, debouncedOverlayColor, drawThemeElements, drawDecorations, finalCanvasRef, processedCanvasRef]);

  const processScore = useCallback(() => {
    if (!rawCanvasRef.current) return;
    
    // Skip heavy pixel processing if color hasn't changed
    if (lastProcessedColor.current === debouncedScoreColor && processedCanvasRef.current) {
      drawFinal();
      return;
    }
    
    const rgb = hexToRgb(debouncedScoreColor);
    processedCanvasRef.current = processScoreCanvas(rawCanvasRef.current, rgb);
    lastProcessedColor.current = debouncedScoreColor;
    drawFinal();
  }, [rawCanvasRef, processedCanvasRef, lastProcessedColor, debouncedScoreColor, hexToRgb, processScoreCanvas, drawFinal]);

  return {
    drawFinal,
    processScore,
    drawThemeElements,
    drawDecorations
  };
}

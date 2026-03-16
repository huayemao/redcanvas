// 从 imageHelper.ts 中移过来的函数
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // 移除 # 号
  const cleanHex = hex.replace('#', '');
  
  // 解析 RGB 值
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

export function processScoreCanvas(canvas: HTMLCanvasElement, targetColor: { r: number; g: number; b: number }): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // 如果像素是透明的，跳过
    if (a === 0) continue;
    
    // 计算灰度值
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // 计算新的 RGB 值，基于目标颜色和灰度
    const newR = Math.round((gray / 255) * targetColor.r);
    const newG = Math.round((gray / 255) * targetColor.g);
    const newB = Math.round((gray / 255) * targetColor.b);
    
    // 更新像素值
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
    // 保持 alpha 值不变
  }
  
  // 创建新的画布并绘制处理后的图像
  const newCanvas = document.createElement('canvas');
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext('2d');
  if (newCtx) {
    newCtx.putImageData(imageData, 0, 0);
  }
  
  return newCanvas;
}

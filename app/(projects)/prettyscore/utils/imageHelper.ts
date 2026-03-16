export function processScoreCanvas(
  sourceCanvas: HTMLCanvasElement,
  targetColor: { r: number; g: number; b: number }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate lightness (0 to 255)
    const lightness = (r + g + b) / 3;
    
    // Invert lightness for alpha (black = 255 alpha, white = 0 alpha)
    const alpha = 255 - lightness;
    
    data[i] = targetColor.r;
    data[i + 1] = targetColor.g;
    data[i + 2] = targetColor.b;
    data[i + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

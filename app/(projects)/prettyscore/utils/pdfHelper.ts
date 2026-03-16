import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs';

export async function loadPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  return pdf;
}

export async function renderPdfPageToCanvas(pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number, scale: number = 2) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // Fill white background first, because PDF.js might render transparent
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const renderContext: any = {
    canvasContext: context,
    viewport: viewport,
  };
  
  await page.render(renderContext).promise;
  return canvas;
}

export async function renderSvgToCanvas(file: File, scale: number = 2) {
  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('No 2d context'));
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Fill white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

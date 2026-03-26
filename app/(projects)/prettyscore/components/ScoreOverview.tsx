import React from 'react';

interface ScoreOverviewProps {
  isOverviewMode: boolean;
  setIsOverviewMode: (value: boolean) => void;
  numPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pdfDoc: any;
  renderPage: (pdf: any, pageNum: number) => Promise<void>;
  pageThumbnails: React.MutableRefObject<{[key: number]: HTMLCanvasElement}>;
  appState: string;
}

export default function ScoreOverview({
  isOverviewMode,
  setIsOverviewMode,
  numPages,
  currentPage,
  setCurrentPage,
  pdfDoc,
  renderPage,
  pageThumbnails,
  appState
}: ScoreOverviewProps) {
  if (appState !== 'editor' || !isOverviewMode) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-sm flex flex-col p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="serif text-2xl font-medium text-[var(--color-ink)]">Score Overview</h2>
        <button
          onClick={() => setIsOverviewMode(false)}
          className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Close Overview
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto flex-1">
        {Array.from({ length: numPages }, (_, index) => {
          const pageNum = index + 1;
          return (
            <div
              key={pageNum}
              className={`cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl ${currentPage === pageNum ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
              onClick={async () => {
                setIsOverviewMode(false);
                setCurrentPage(pageNum);
                await renderPage(pdfDoc, pageNum);
              }}
            >
              {pageThumbnails.current[pageNum] ? (
                <div 
                  className="w-full aspect-[8.5/11] flex items-center justify-center bg-[var(--color-paper)]"
                  ref={(el) => {
                    if (el && pageThumbnails.current[pageNum]) {
                      // 清空容器
                      el.innerHTML = '';
                      // 添加canvas元素
                      const canvas = pageThumbnails.current[pageNum];
                      canvas.style.width = '100%';
                      canvas.style.height = '100%';
                      canvas.style.objectFit = 'contain';
                      el.appendChild(canvas);
                    }
                  }}
                />
              ) : (
                <div className="w-full aspect-[8.5/11] bg-[var(--color-paper)] flex items-center justify-center">
                  <p className="text-[var(--color-ink)]/50">Loading...</p>
                </div>
              )}
              <div className="p-3 bg-[var(--color-ink)] text-[var(--color-paper)] text-center">
                Page {pageNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

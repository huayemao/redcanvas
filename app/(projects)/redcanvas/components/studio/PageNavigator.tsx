'use client';

import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 多页导航条（PPT 式）：画布下方的页面条，桌面与移动端共用。
 * - 点击页码切换页面（自动写回当前页编辑）
 * - "+" 新建空白页（沿用当前页的尺寸/背景/字体）
 * - 双击页码重命名
 * - 右侧操作区：复制 / 左移 / 右移 / 删除（作用于当前页）
 */
export const PageNavigator: React.FC = () => {
  const pages = useStudioStore((s) => s.pages);
  const currentPageId = useStudioStore((s) => s.currentPageId);
  const switchPage = useStudioStore((s) => s.switchPage);
  const addPage = useStudioStore((s) => s.addPage);
  const duplicatePage = useStudioStore((s) => s.duplicatePage);
  const deletePage = useStudioStore((s) => s.deletePage);
  const movePage = useStudioStore((s) => s.movePage);
  const renamePage = useStudioStore((s) => s.renamePage);

  return (
    <div className="w-full flex items-center gap-2">
      {/* 页码列表 */}
      <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 py-1 px-0.5">
        {pages.map((p, i) => {
          const isActive = p.id === currentPageId;
          return (
            <button
              key={p.id}
              onClick={() => switchPage(p.id)}
              onDoubleClick={() => {
                const name = window.prompt('重命名页面', p.name);
                if (name !== null) renamePage(p.id, name);
              }}
              title={`${p.name}（双击重命名）`}
              className={`w-9 h-9 flex-shrink-0 rounded-lg border flex items-center justify-center text-[12px] font-black transition-all ${
                isActive
                  ? 'border-red-500 bg-red-500/10 text-red-300'
                  : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:border-white/25 hover:text-white/80'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
        <button
          onClick={addPage}
          title="新建页面（沿用当前尺寸与背景）"
          className="w-9 h-9 flex-shrink-0 rounded-lg border border-dashed border-white/[0.15] flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 当前页操作 */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <NavActionBtn title="复制当前页" onClick={() => duplicatePage(currentPageId)}>
          <Copy className="w-3.5 h-3.5" />
        </NavActionBtn>
        <NavActionBtn title="左移当前页" onClick={() => movePage(currentPageId, -1)}>
          <ChevronLeft className="w-3.5 h-3.5" />
        </NavActionBtn>
        <NavActionBtn title="右移当前页" onClick={() => movePage(currentPageId, 1)}>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavActionBtn>
        <NavActionBtn
          title={pages.length <= 1 ? '至少保留一页' : '删除当前页'}
          disabled={pages.length <= 1}
          danger
          onClick={() => deletePage(currentPageId)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </NavActionBtn>
      </div>
    </div>
  );
};

const NavActionBtn: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, disabled, danger, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
      disabled
        ? 'text-white/15 cursor-not-allowed'
        : danger
          ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
          : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
    }`}
  >
    {children}
  </button>
);

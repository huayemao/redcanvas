import { PlogElement } from '../types';
import type { StudioState, StudioPageData } from '../store/useStudioStore';

/**
 * 清理文本，使其适合用作操作系统文件名：
 * 1. 去除 Markdown 格式标记（标题 #、加粗 **、斜体 *、链接、行内代码、数学公式等）
 * 2. 提取第一个非空行
 * 3. 过滤系统非法文件名字符（\ / : * ? " < > | 及控制字符）
 * 4. 折叠连续空格与下划线，去除首尾符号，截断到合理长度
 */
export function cleanTextForFilename(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw;

  // 1. 去除 Markdown 链接与图片：[描述](url) -> 描述, ![alt](url) -> ''
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. 去除真实 HTML 标签（以字母开头的常见标签如 <div> <span> <br/> 等）与常见实体
  text = text.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  text = text.replace(/&[a-zA-Z0-9#]+;/g, ' ');

  // 3. 去除数学公式标记 $$...$$ 或 $...$
  text = text.replace(/\$\$[\s\S]*?\$\$/g, '');
  text = text.replace(/\$([^\$]+)\$/g, '$1');

  // 4. 去除行首的 Markdown 标题语法 (# 标题)
  text = text.replace(/^#+\s+/gm, '');

  // 5. 去除 Markdown 强调/删除线/代码语法
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  text = text.replace(/~~(.*?)~~/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 6. 按行拆分，提取第一个有内容的有效行作为主标题提取对象
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const primaryLine = lines[0] || '';

  // 7. 过滤文件名非法字符
  // Windows & Unix 非法字符: \ / : * ? " < > |
  let sanitized = primaryLine
    .replace(/[\\/:*?"<>|\r\n\t]+/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 去除首尾的句点、破折号、下划线
  sanitized = sanitized.replace(/^[-_.]+|[-_.]+$/g, '').trim();

  // 限制最大长度（避免超长路径报错）
  if (sanitized.length > 50) {
    sanitized = sanitized.slice(0, 50).trim();
  }

  return sanitized;
}

/**
 * 获取元素字号（px）。
 * 若元素未显式指定 fontSize，按元素类型提供合理的排版字号基准
 */
function getElementFontSize(el: PlogElement): number {
  if (typeof el.fontSize === 'number' && el.fontSize > 0) {
    return el.fontSize;
  }
  switch (el.type) {
    case 'text':
    case 'longtext':
      return 20;
    case 'sticker':
      return 14;
    case 'timestamp':
      return 14;
    case 'annotation':
      return 12;
    case 'badge':
      return 10;
    case 'tag':
      return 11;
    default:
      return 12;
  }
}

/** 文本候选结构 */
interface TextCandidate {
  text: string;
  fontSize: number;
  zIndex: number;
}

type StudioStateLike = Pick<StudioState, 'pages' | 'currentPageId' | 'floatingElements' | 'title' | 'customExportName'>;

/**
 * 默认命名规则：
 * 提取第一张图片（第 1 页）中字体最大（fontSize 最大）的文本内容。
 * 若无有效文字元素，回退到第一页的 title 字段；若仍无则兜底为 'redcanvas'
 */
export function getDefaultExportName(state: StudioStateLike): string {
  const pages = state.pages || [];
  const firstPage: StudioPageData | undefined = pages[0];

  // 获取第一页的所有浮动元素
  // 若当前激活页正是第一页，state.floatingElements 包含最新鲜的编辑状态
  let firstPageElements: PlogElement[] = [];
  if (firstPage) {
    if (state.currentPageId === firstPage.id) {
      firstPageElements = state.floatingElements || [];
    } else {
      firstPageElements = firstPage.data?.floatingElements || [];
    }
  } else {
    firstPageElements = state.floatingElements || [];
  }

  const textTypes = new Set<string>([
    'text',
    'longtext',
    'badge',
    'annotation',
    'sticker',
    'tag',
    'timestamp',
  ]);

  const candidates: TextCandidate[] = [];

  for (const el of firstPageElements) {
    if (!textTypes.has(el.type)) continue;
    if (!el.content) continue;

    const cleaned = cleanTextForFilename(el.content);
    if (!cleaned) continue;

    candidates.push({
      text: cleaned,
      fontSize: getElementFontSize(el),
      zIndex: el.zIndex ?? 0,
    });
  }

  // 按字号降序排列；字号相同时按 zIndex 降序，再按文本长度
  candidates.sort((a, b) => {
    if (b.fontSize !== a.fontSize) return b.fontSize - a.fontSize;
    if (b.zIndex !== a.zIndex) return b.zIndex - a.zIndex;
    return b.text.length - a.text.length;
  });

  if (candidates.length > 0) {
    return candidates[0].text;
  }

  // 回退检查第 1 页的 title
  const rawTitle = firstPage?.data?.title ?? state.title;
  if (rawTitle) {
    const cleanedTitle = cleanTextForFilename(rawTitle);
    if (cleanedTitle) return cleanedTitle;
  }

  return 'redcanvas';
}

/**
 * 获取最终生效的导出名称：
 * 若用户设置了自定义命名则使用自定义（经过安全字符清理），否则使用第一张图最大字体文本默认命名
 */
export function getEffectiveExportName(state: StudioStateLike): string {
  const custom = state.customExportName?.trim();
  if (custom) {
    const cleaned = cleanTextForFilename(custom);
    if (cleaned) return cleaned;
  }
  return getDefaultExportName(state);
}

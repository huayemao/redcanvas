/**
 * RedCanvas 核心 Web 字体家族列表
 */
const KNOWN_FONT_FAMILIES = [
  'Xiaolai SC', 'Xiaolai',
  'ZCOOL XiaoWei',
  'Noto Serif SC',
  'LXGWWenKai', 'LXGWWenKai-Bold', 'LXGWWenKai-Regular',
  'ZCOOL KuaiLe',
  'Yozai',
  'LongCang', 'Long Cang',
  'Ma Shan Zheng',
  'Zhi Mang Xing',
  'Noto Sans SC',
  'Inter',
  'Playfair Display',
];

/**
 * 确保目标画布内使用的所有自定义 Web 字体（涵盖所有文本框的真实 fontWeight / fontSize / fontStyle / fontFamily 组合）已经被浏览器完全装载落地。
 * 
 * 核心破解：
 * W3C Font Loading 规范要求 document.fonts.check(fontSpec, text) 中的 fontSpec 必须精准匹配节点的真实 CSS 字体描述符。
 * 如果硬编码 16px normal，会导致加粗 (fontWeight: 700/bold) 或不同字号 (fontSize) 的字体切片无法被命中所导致的字重/字符回退问题。
 * 
 * 此方法遍历所有文本节点，精确读取 getComputedStyle(node) 中的 fontWeight / fontStyle / fontSize / fontFamily，
 * 构造精准 fontSpec 并配合 text 文本采样进行全量校验与装载。
 */
export async function ensureCanvasFontsLoaded(
  targetElement: HTMLElement,
  options: { timeoutMs?: number; onProgress?: (msg: string) => void } = {}
): Promise<void> {
  const { timeoutMs = 8000, onProgress } = options;
  if (typeof window === 'undefined' || !('fonts' in document)) return;

  try {
    const fontLoadTasks: Promise<unknown>[] = [];
    const checkedSpecs = new Set<string>();

    const allNodes = Array.from(targetElement.querySelectorAll<HTMLElement>('*'));
    allNodes.push(targetElement);

    allNodes.forEach((node) => {
      const text = node.textContent?.trim();
      if (!text) return;

      const computed = window.getComputedStyle(node);
      const computedFont = computed.fontFamily;
      if (!computedFont) return;

      const weight = computed.fontWeight || 'normal';
      const style = computed.fontStyle || 'normal';
      const size = computed.fontSize || '16px';

      const families = computedFont.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, ''));
      families.forEach((family) => {
        if (KNOWN_FONT_FAMILIES.some((k) => k.toLowerCase() === family.toLowerCase())) {
          // 构造精准匹配该节点的完整 CSS font 描述符：[style] [weight] [size] "[family]"
          const stylePrefix = style !== 'normal' ? `${style} ` : '';
          const weightPrefix = weight !== 'normal' ? `${weight} ` : '';
          const fontSpec = `${stylePrefix}${weightPrefix}${size} "${family}"`;

          // 防止重复产生相同的加载任务
          const specKey = `${fontSpec}|||${text}`;
          if (checkedSpecs.has(specKey)) return;
          checkedSpecs.add(specKey);

          // 传入精准 fontSpec + 文本采样校验对应字重、字号与中文字符切片
          const isReady = document.fonts.check(fontSpec, text);
          if (!isReady) {
            fontLoadTasks.push(document.fonts.load(fontSpec, text));
          }
        }
      });
    });

    if (fontLoadTasks.length > 0) {
      onProgress?.('正在精准装载各文本框字重与字体切片...');
      await Promise.race([
        Promise.all(fontLoadTasks).then(() => document.fonts.ready),
        new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
      ]);
    } else {
      // 全部通过也确认一遍 document.fonts.ready
      await Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
    }
  } catch (err) {
    console.warn('[FontLoader] ensureCanvasFontsLoaded error:', err);
  }
}

/**
 * Font inline Helper for robust image export.
 * Browser SVG/Canvas rendering sandboxes external font resources.
 * This helper preloads loaded fonts, converts external font rules to Base64 Data URIs,
 * and embeds an inline style block inside the capture target.
 */

const fontBase64Cache = new Map<string, string>();

async function fetchAsBase64(url: string): Promise<string> {
  if (fontBase64Cache.has(url)) {
    return fontBase64Cache.get(url)!;
  }
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        fontBase64Cache.set(url, result);
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`[FontLoader] Failed to inline font resource at ${url}:`, err);
    return url;
  }
}

export async function prepareFontsForExport(targetElement: HTMLElement): Promise<() => void> {
  // 1. Wait for document fonts to complete loading
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // 2. Collect custom @font-face rules from style sheets
  const fontRules: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (!sheet.cssRules) continue;
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSFontFaceRule) {
          fontRules.push(rule.cssText);
        }
      }
    } catch {
      // CORS protected sheet, skip direct access
    }
  }

  // If no font rules found or extracted, return no-op cleanup
  if (fontRules.length === 0) {
    return () => {};
  }

  // 3. Process URLs in @font-face rules to inline data URIs if needed
  const processedRules: string[] = [];
  for (const rule of fontRules) {
    const urlMatches = Array.from(rule.matchAll(/url\((['"]?)(.*?)\1\)/g));
    let updatedRule = rule;

    for (const match of urlMatches) {
      const originalUrl = match[2];
      if (originalUrl.startsWith('data:')) continue;
      
      try {
        const base64Url = await fetchAsBase64(originalUrl);
        if (base64Url && base64Url !== originalUrl) {
          updatedRule = updatedRule.replace(match[0], `url("${base64Url}")`);
        }
      } catch {
        // Fallback to original URL
      }
    }
    processedRules.push(updatedRule);
  }

  // 4. Inject temporary style element into target
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-export-fonts', 'true');
  styleEl.textContent = processedRules.join('\n');
  targetElement.appendChild(styleEl);

  // Return cleanup callback to remove injected style
  return () => {
    if (styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  };
}

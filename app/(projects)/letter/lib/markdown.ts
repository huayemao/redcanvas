import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Theme } from './themes';

export async function renderMarkdown(markdown: string, theme: Theme): Promise<string> {
  // Parse markdown to HTML
  const rawHtml = await marked.parse(markdown, { gfm: true, breaks: true });

  // Use DOMParser to apply inline styles
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Apply styles to elements
  const applyStyle = (selector: string, styleString: string) => {
    if (!styleString) return;
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const existingStyle = el.getAttribute('style') || '';
      el.setAttribute('style', `${existingStyle} ${styleString}`.trim());
    });
  };

  applyStyle('h1', theme.h1);
  applyStyle('h2', theme.h2);
  applyStyle('h3', theme.h3);
  applyStyle('h4, h5, h6', theme.h3); // Fallback for other headings
  applyStyle('p', theme.p);
  applyStyle('a', theme.a);
  applyStyle('strong, b', theme.strong);
  applyStyle('em, i', theme.em);
  applyStyle('ul', theme.ul);
  applyStyle('ol', theme.ol);
  applyStyle('li', theme.li);
  applyStyle('blockquote', theme.blockquote);
  applyStyle('code', theme.code);
  applyStyle('pre', theme.pre);
  applyStyle('hr', theme.hr);
  applyStyle('img', theme.img);
  applyStyle('table', theme.table);
  applyStyle('th', theme.th);
  applyStyle('td', theme.td);

  // Special handling for images to wrap them in figure/figcaption if they have alt text
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    const altText = img.getAttribute('alt');
    if (altText) {
      const figure = doc.createElement('figure');
      figure.setAttribute('style', theme.figure);
      
      // Clone the image and append to figure
      const newImg = img.cloneNode(true) as HTMLElement;
      figure.appendChild(newImg);
      
      const figcaption = doc.createElement('figcaption');
      figcaption.setAttribute('style', theme.figcaption);
      figcaption.textContent = altText;
      figure.appendChild(figcaption);
      
      // Replace original image with figure
      img.parentNode?.replaceChild(figure, img);
    }
  });

  // Wrap in container
  const container = doc.createElement('div');
  container.className = 'letter-container';
  container.setAttribute('style', theme.container);
  
  // Move all body children into container
  while (doc.body.firstChild) {
    container.appendChild(doc.body.firstChild);
  }
  doc.body.appendChild(container);

  // Purify HTML
  return DOMPurify.sanitize(doc.body.innerHTML, {
    ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
  });
}

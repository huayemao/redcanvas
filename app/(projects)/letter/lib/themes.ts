export type ThemeId = 'classic' | 'kraft' | 'handwritten' | 'poetry' | 'typewriter' | 'parchment' | 'grid';

export interface Theme {
  id: ThemeId;
  name: string;
  container: string;
  h1: string;
  h2: string;
  h3: string;
  p: string;
  a: string;
  strong: string;
  em: string;
  ul: string;
  ol: string;
  li: string;
  blockquote: string;
  code: string;
  pre: string;
  hr: string;
  img: string;
  figure: string;
  figcaption: string;
  table: string;
  th: string;
  td: string;
}

const serifFont = "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif";
const handFont = "'Ma Shan Zheng', 'Kaiti SC', 'STKaiti', 'KaiTi', serif";
const monoFont = "'JetBrains Mono', 'Courier New', Courier, monospace";

export const themes: Record<ThemeId, Theme> = {
  classic: {
    id: 'classic',
    name: '经典白',
    container: `background-color: #ffffff; color: #222222; padding: 60px 8%; font-family: ${serifFont}; letter-spacing: 0.02em; line-height: 2.2; max-width: 700px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border-radius: 2px;`,
    h1: "font-size: 28px; text-align: center; margin: 0 0 40px 0; color: #111; font-weight: 600; letter-spacing: 0.1em;",
    h2: "font-size: 22px; margin: 40px 0 20px 0; color: #111; font-weight: 600; text-align: center;",
    h3: "font-size: 20px; margin: 30px 0 15px 0; color: #333; font-weight: 600;",
    p: "font-size: 16px; margin-bottom: 24px; text-align: justify; font-weight: 400;",
    a: "color: #555; text-decoration: none; border-bottom: 1px solid #ccc; padding-bottom: 1px;",
    strong: "font-weight: 600; color: #000;",
    em: "font-style: italic; color: #666;",
    ul: "margin-bottom: 24px; padding-left: 2em; list-style-type: disc;",
    ol: "margin-bottom: 24px; padding-left: 2em; list-style-type: decimal;",
    li: "margin-bottom: 10px; font-size: 16px;",
    blockquote: "margin: 30px 0; padding: 16px 25px; border-left: 3px solid #eee; color: #666; font-size: 14px; background: #fafafa;",
    code: "font-family: monospace; font-size: 13px; background-color: #f5f5f5; padding: 3px 6px; border-radius: 3px; color: #333;",
    pre: "background-color: #f9f9f9; padding: 20px; border-radius: 4px; overflow-x: auto; margin-bottom: 24px; border: 1px solid #eee;",
    hr: "border: 0; border-top: 1px solid #eee; margin: 40px 0;",
    img: "max-width: 100%; height: auto; display: block; margin: 30px auto; border-radius: 2px;",
    figure: "margin: 30px 0; text-align: center;",
    figcaption: "font-size: 13px; color: #999; margin-top: 12px; letter-spacing: 0.05em;",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;",
    th: "border-bottom: 2px solid #333; padding: 12px 8px; font-weight: 600; text-align: left;",
    td: "border-bottom: 1px solid #eee; padding: 12px 8px;",
  },
  kraft: {
    id: 'kraft',
    name: '旧时光',
    container: `background-color: #EFE9E0; background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png'); color: #3A352F; padding: 60px 8%; font-family: ${serifFont}; letter-spacing: 0.05em; line-height: 2.2; max-width: 700px; margin: 0 auto; box-shadow: 2px 4px 16px rgba(0,0,0,0.08); border-radius: 4px;`,
    h1: "font-size: 26px; text-align: center; margin: 0 0 40px 0; color: #2C2825; font-weight: 600; border-bottom: 1px dashed #C0B5A2; padding-bottom: 20px;",
    h2: "font-size: 20px; margin: 40px 0 20px 0; color: #4A4238; font-weight: 600;",
    h3: "font-size: 16px; margin: 30px 0 15px 0; color: #5C5346; font-weight: 600;",
    p: "font-size: 15px; margin-bottom: 24px; text-indent: 2em; text-align: justify;",
    a: "color: #8B6D4D; text-decoration: none; border-bottom: 1px solid #D4C4B7;",
    strong: "font-weight: 600; color: #2C2825;",
    em: "font-style: italic; color: #6B6255;",
    ul: "margin-bottom: 24px; padding-left: 2em; list-style-type: circle;",
    ol: "margin-bottom: 24px; padding-left: 2em; list-style-type: decimal;",
    li: "margin-bottom: 10px; font-size: 15px;",
    blockquote: "margin: 30px 0; padding: 20px; background-color: rgba(139, 109, 77, 0.05); border-left: 4px solid #C0B5A2; color: #6B6255; font-style: italic;",
    code: "font-family: monospace; font-size: 13px; background-color: rgba(0,0,0,0.04); padding: 3px 6px; border-radius: 3px; color: #8B6D4D;",
    pre: "background-color: #E8DFC8; padding: 20px; border-radius: 4px; overflow-x: auto; margin-bottom: 24px; border: 1px solid #D4C4B7;",
    hr: "border: 0; border-top: 1px dashed #C0B5A2; margin: 40px 0;",
    img: "max-width: 100%; height: auto; display: block; margin: 30px auto; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); filter: sepia(0.1);",
    figure: "margin: 30px 0; text-align: center;",
    figcaption: "font-size: 13px; color: #8C8273; margin-top: 12px; font-style: italic;",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;",
    th: "border: 1px solid #C0B5A2; padding: 12px; background-color: rgba(139, 109, 77, 0.1); font-weight: 600; text-align: left;",
    td: "border: 1px solid #C0B5A2; padding: 12px;",
  },
  handwritten: {
    id: 'handwritten',
    name: '手写信笺',
    container: `background-color: #F9F8F6; background-image: repeating-linear-gradient(transparent, transparent 31px, #E0DCD3 31px, #E0DCD3 32px); color: #2C303A; padding: 60px 8%; font-family: ${handFont}; letter-spacing: 0.1em; line-height: 32px; max-width: 700px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 4px;`,
    h1: "font-size: 32px; text-align: center; margin: 0 0 32px 0; color: #1A1D24; font-weight: normal;",
    h2: "font-size: 24px; margin: 32px 0 16px 0; color: #2C303A; font-weight: normal;",
    h3: "font-size: 20px; margin: 32px 0 16px 0; color: #3D424F; font-weight: normal;",
    p: "font-size: 18px; margin-bottom: 32px; text-indent: 2em; text-align: justify;",
    a: "color: #4A6B8C; text-decoration: none; border-bottom: 1px dashed #4A6B8C;",
    strong: "font-weight: bold; color: #1A1D24;",
    em: "font-style: italic; color: #5A6070;",
    ul: "margin-bottom: 32px; padding-left: 2em; list-style-type: none;",
    ol: "margin-bottom: 32px; padding-left: 2em; list-style-type: decimal;",
    li: "margin-bottom: 16px; font-size: 18px; position: relative;",
    blockquote: "margin: 32px 0; padding: 0 20px; color: #5A6070; font-size: 18px; border-left: 2px solid #C0C4CC;",
    code: "font-family: monospace; font-size: 14px; background-color: rgba(0,0,0,0.03); padding: 2px 6px; border-radius: 3px;",
    pre: "background-color: #F0EFEA; padding: 20px; border-radius: 4px; overflow-x: auto; margin-bottom: 32px; line-height: 1.5;",
    hr: "border: 0; border-top: 1px solid #DCD8C0; margin: 40px 0;",
    img: "max-width: 100%; height: auto; display: block; margin: 32px auto; border-radius: 2px; padding: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee;",
    figure: "margin: 32px 0; text-align: center;",
    figcaption: "font-size: 14px; color: #888; margin-top: 12px;",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 16px;",
    th: "border-bottom: 1px solid #2C303A; padding: 12px 8px; font-weight: normal; text-align: left;",
    td: "border-bottom: 1px dashed #E0DCD3; padding: 12px 8px;",
  },
  poetry: {
    id: 'poetry',
    name: '诗意留白',
    container: `background-color: #F4F4F0; background-image: url('https://www.transparenttextures.com/patterns/rice-paper.png'); color: #2C2C2C; padding: 80px 12%; font-family: ${serifFont}; letter-spacing: 0.08em; line-height: 2.4; max-width: 700px; margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.06); border-radius: 2px; border-left: 1px solid #E5E2D1; border-right: 1px solid #E5E2D1;`,
    h1: "font-size: 24px; text-align: center; margin: 0 0 50px 0; color: #111; font-weight: 500; letter-spacing: 0.2em; border-bottom: 1px solid #111; padding-bottom: 20px; display: inline-block; position: relative; left: 50%; transform: translateX(-50%);",
    h2: "font-size: 18px; margin: 50px 0 20px 0; color: #222; font-weight: 500; text-align: center;",
    h3: "font-size: 15px; margin: 40px 0 15px 0; color: #444; font-weight: 500;",
    p: "font-size: 14px; margin-bottom: 28px; text-align: justify; font-weight: 400;",
    a: "color: #7A5C43; text-decoration: none; border-bottom: 1px solid #7A5C43;",
    strong: "font-weight: 600; color: #111;",
    em: "font-style: italic; color: #666;",
    ul: "margin-bottom: 28px; padding-left: 2em; list-style-type: square;",
    ol: "margin-bottom: 28px; padding-left: 2em; list-style-type: decimal;",
    li: "margin-bottom: 12px; font-size: 14px;",
    blockquote: "margin: 40px 0; padding: 20px 30px; background-color: #EFECE1; color: #555; font-size: 13px; text-align: center; font-style: italic;",
    code: "font-family: monospace; font-size: 12px; background-color: rgba(0,0,0,0.03); padding: 2px 6px; color: #555;",
    pre: "background-color: #EFECE1; padding: 20px; overflow-x: auto; margin-bottom: 28px; font-size: 12px;",
    hr: "border: 0; border-top: 1px solid #DCD8C0; margin: 50px 0; width: 50%; margin-left: auto; margin-right: auto;",
    img: "max-width: 100%; height: auto; display: block; margin: 40px auto; filter: grayscale(20%) contrast(110%);",
    figure: "margin: 40px 0; text-align: center;",
    figcaption: "font-size: 12px; color: #888; margin-top: 16px; letter-spacing: 0.1em;",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px;",
    th: "border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 12px 8px; font-weight: 500; text-align: left;",
    td: "border-bottom: 1px solid #E5E2D1; padding: 12px 8px;",
  },
  typewriter: {
    id: 'typewriter',
    name: '打字机',
    container: `background-color: #F5F2EB; background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png'); color: #1A1A1A; padding: 60px 10%; font-family: ${monoFont}; letter-spacing: 0.05em; line-height: 1.8; max-width: 700px; margin: 0 auto; box-shadow: inset 0 0 40px rgba(0,0,0,0.05), 0 4px 15px rgba(0,0,0,0.05); border-radius: 2px;`,
    h1: "font-size: 24px; text-align: center; margin: 0 0 40px 0; color: #000; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;",
    h2: "font-size: 18px; margin: 40px 0 20px 0; color: #000; font-weight: bold; text-transform: uppercase;",
    h3: "font-size: 16px; margin: 30px 0 15px 0; color: #222; font-weight: bold;",
    p: "font-size: 14px; margin-bottom: 24px; text-align: left;",
    a: "color: #333; text-decoration: underline; text-underline-offset: 4px;",
    strong: "font-weight: bold; color: #000;",
    em: "font-style: italic; color: #333;",
    ul: "margin-bottom: 24px; padding-left: 2em; list-style-type: square;",
    ol: "margin-bottom: 24px; padding-left: 2em; list-style-type: decimal;",
    li: "margin-bottom: 10px; font-size: 14px;",
    blockquote: "margin: 30px 0; padding: 15px 20px; border-left: 4px solid #333; color: #444; font-size: 14px; background: rgba(0,0,0,0.02);",
    code: "font-family: ${monoFont}; font-size: 13px; background-color: rgba(0,0,0,0.05); padding: 2px 4px; border: 1px solid rgba(0,0,0,0.1);",
    pre: "background-color: rgba(0,0,0,0.03); padding: 20px; border: 1px solid rgba(0,0,0,0.1); overflow-x: auto; margin-bottom: 24px;",
    hr: "border: 0; border-top: 2px dashed #333; margin: 40px 0;",
    img: "max-width: 100%; height: auto; display: block; margin: 30px auto; filter: sepia(0.3) contrast(1.2); padding: 10px; background: #fff; border: 1px solid #ddd;",
    figure: "margin: 30px 0; text-align: center;",
    figcaption: "font-size: 12px; color: #666; margin-top: 10px; font-family: ${monoFont};",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;",
    th: "border: 1px solid #333; padding: 10px; font-weight: bold; text-align: left; background: rgba(0,0,0,0.05);",
    td: "border: 1px solid #333; padding: 10px;",
  },
  parchment: {
    id: 'parchment',
    name: '羊皮纸',
    container: `background-color: #FDF6E3; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); color: #4A3B2C; padding: 70px 10%; font-family: ${serifFont}; letter-spacing: 0.03em; line-height: 2.1; max-width: 700px; margin: 0 auto; box-shadow: 0 10px 30px rgba(139, 109, 77, 0.15); border-radius: 8px;`,
    h1: "font-size: 30px; text-align: center; margin: 0 0 45px 0; color: #2C1E16; font-weight: 600; font-family: ${serifFont};",
    h2: "font-size: 22px; margin: 40px 0 20px 0; color: #3A2A1E; font-weight: 600;",
    h3: "font-size: 18px; margin: 30px 0 15px 0; color: #4A3B2C; font-weight: 600;",
    p: "font-size: 16px; margin-bottom: 26px; text-align: justify; text-indent: 2em;",
    a: "color: #8B5A2B; text-decoration: none; border-bottom: 1px solid #8B5A2B;",
    strong: "font-weight: 600; color: #2C1E16;",
    em: "font-style: italic; color: #5A4B3C;",
    ul: "margin-bottom: 26px; padding-left: 2em; list-style-type: disc;",
    ol: "margin-bottom: 26px; padding-left: 2em; list-style-type: lower-roman;",
    li: "margin-bottom: 12px; font-size: 16px;",
    blockquote: "margin: 35px 0; padding: 20px 30px; border-left: 3px solid #8B5A2B; color: #5A4B3C; font-size: 15px; font-style: italic; background: rgba(139, 90, 43, 0.05);",
    code: "font-family: monospace; font-size: 14px; background-color: rgba(139, 90, 43, 0.08); padding: 2px 6px; border-radius: 2px; color: #5A3B1C;",
    pre: "background-color: rgba(139, 90, 43, 0.05); padding: 20px; border-radius: 4px; overflow-x: auto; margin-bottom: 26px; border: 1px solid rgba(139, 90, 43, 0.2);",
    hr: "border: 0; height: 1px; background-image: linear-gradient(to right, rgba(139, 90, 43, 0), rgba(139, 90, 43, 0.5), rgba(139, 90, 43, 0)); margin: 45px 0;",
    img: "max-width: 100%; height: auto; display: block; margin: 35px auto; border-radius: 4px; box-shadow: 0 5px 15px rgba(0,0,0,0.08);",
    figure: "margin: 35px 0; text-align: center;",
    figcaption: "font-size: 14px; color: #8B5A2B; margin-top: 12px; font-style: italic;",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 26px; font-size: 15px;",
    th: "border-bottom: 2px solid #8B5A2B; padding: 12px; font-weight: 600; text-align: left; color: #2C1E16;",
    td: "border-bottom: 1px solid rgba(139, 90, 43, 0.2); padding: 12px;",
  },
  grid: {
    id: 'grid',
    name: '方格本',
    container: `background-color: #FAFAFA; background-image: linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px); background-size: 24px 24px; color: #333333; padding: 60px 8%; font-family: ${serifFont}; letter-spacing: 0.05em; line-height: 24px; max-width: 700px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 4px; border: 1px solid #EEEEEE;`,
    h1: "font-size: 24px; text-align: center; margin: 0 0 48px 0; color: #111; font-weight: 600; line-height: 48px; background: #FAFAFA; display: inline-block; padding: 0 16px; position: relative; left: 50%; transform: translateX(-50%);",
    h2: "font-size: 20px; margin: 48px 0 24px 0; color: #222; font-weight: 600; line-height: 24px; background: #FAFAFA; display: inline-block; padding-right: 16px;",
    h3: "font-size: 16px; margin: 24px 0 24px 0; color: #444; font-weight: 600; line-height: 24px; background: #FAFAFA; display: inline-block; padding-right: 16px;",
    p: "font-size: 15px; margin-bottom: 24px; text-align: justify; text-indent: 2em; line-height: 24px;",
    a: "color: #0066CC; text-decoration: none; border-bottom: 1px solid #0066CC;",
    strong: "font-weight: 600; color: #000;",
    em: "font-style: italic; color: #666;",
    ul: "margin-bottom: 24px; padding-left: 2em; list-style-type: disc; line-height: 24px;",
    ol: "margin-bottom: 24px; padding-left: 2em; list-style-type: decimal; line-height: 24px;",
    li: "margin-bottom: 0; font-size: 15px; line-height: 24px;",
    blockquote: "margin: 24px 0; padding: 12px 24px; border-left: 4px solid #CCC; color: #666; font-size: 14px; background: rgba(255,255,255,0.8); line-height: 24px;",
    code: "font-family: monospace; font-size: 13px; background-color: #FFF; padding: 2px 6px; border: 1px solid #E5E5E5; border-radius: 2px; color: #D14;",
    pre: "background-color: #FFF; padding: 24px; border: 1px solid #E5E5E5; overflow-x: auto; margin-bottom: 24px; line-height: 24px;",
    hr: "border: 0; border-top: 2px solid #E5E5E5; margin: 48px 0;",
    img: "max-width: 100%; height: auto; display: block; margin: 24px auto; border: 4px solid #FFF; box-shadow: 0 2px 8px rgba(0,0,0,0.1);",
    figure: "margin: 24px 0; text-align: center; background: #FAFAFA; padding: 8px;",
    figcaption: "font-size: 13px; color: #888; margin-top: 8px;",
    table: "width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; background: #FFF;",
    th: "border: 1px solid #E5E5E5; padding: 11px 8px; font-weight: 600; text-align: left; background: #F5F5F5;",
    td: "border: 1px solid #E5E5E5; padding: 11px 8px;",
  }
};

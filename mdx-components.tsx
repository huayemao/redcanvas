import type { MDXComponents } from 'mdx/types';

// 朴素版深色中性灰阶 MDX 组件（与 project 级保持一致）
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: (props) => (
      <h1
        {...props}
        className="text-4xl font-black text-neutral-50 mb-6 tracking-tight"
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        className="text-2xl font-bold text-neutral-50 mb-4 mt-8 pl-4 border-l-[3px] border-red-500 py-0.5"
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className="text-xl font-semibold text-neutral-100 mb-3 mt-6"
      />
    ),
    p: (props) => (
      <p
        {...props}
        className="text-neutral-200 mb-4 leading-relaxed text-[15px]"
      />
    ),
    a: (props) => (
      <a
        {...props}
        className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
      />
    ),
    strong: (props) => (
      <strong {...props} className="font-bold text-neutral-50" />
    ),
    code: (props) => (
      <code
        {...props}
        className="rounded-md border border-neutral-700 bg-neutral-800 text-neutral-200 px-1.5 py-0.5 text-sm font-mono"
      />
    ),
    pre: (props) => (
      <pre
        {...props}
        className="bg-neutral-950 text-neutral-100 p-4 rounded-xl overflow-x-auto mb-4 border border-neutral-800"
      />
    ),
    ul: (props) => (
      <ul
        {...props}
        className="list-disc pl-5 mb-4 space-y-2 text-neutral-200 marker:text-red-500"
      />
    ),
    ol: (props) => (
      <ol
        {...props}
        className="list-decimal pl-5 mb-4 space-y-2 text-neutral-200 marker:text-red-500 marker:font-bold"
      />
    ),
    li: (props) => (
      <li {...props} className="leading-relaxed pl-1 [&>p]:mb-0 [&>p]:mt-1" />
    ),
    blockquote: (props) => (
      <blockquote
        {...props}
        className="border-l-[3px] border-neutral-500 pl-4 my-5 italic text-neutral-300 bg-neutral-800/60 py-3 rounded-r-lg border border-neutral-800 border-l-0"
      />
    ),
    hr: (props) => (
      <hr {...props} className="border-neutral-800 my-8" />
    ),
    div: (props) => (
      <div {...props} />
    ),
  };
}

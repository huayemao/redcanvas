import type { MDXComponents } from 'mdx/types';

// 深色主题中性灰阶风格（朴素版）
// 文字层次：标题 neutral-50 / 正文 neutral-200 / 辅助 neutral-400
// 背景层次：bg-neutral-900（卡片）/ bg-neutral-950（页面）
// 点缀色：仅在 h2 边框、列表 marker、链接处用少量红色
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    h1: (props) => (
      <h1
        {...props}
        className="text-3xl md:text-4xl font-black tracking-tight leading-[1.2] text-neutral-50 mb-7 mt-10 first:mt-0"
      />
    ),

    h2: (props) => (
      <h2
        {...props}
        className="text-2xl md:text-[28px] font-bold tracking-tight text-neutral-50 mb-5 mt-12 pl-4 border-l-[3px] border-red-500 py-0.5"
      />
    ),

    h3: (props) => (
      <h3
        {...props}
        className="text-xl md:text-2xl font-bold text-neutral-50 mb-4 mt-8 flex items-center gap-3"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        <span>{props.children}</span>
      </h3>
    ),

    h4: (props) => (
      <h4
        {...props}
        className="text-lg font-bold text-neutral-100 mb-3 mt-6"
      />
    ),

    p: (props) => (
      <p
        {...props}
        className="mb-5 text-neutral-200 text-[15px] md:text-[17px] leading-[1.95] font-normal"
      />
    ),

    a: (props) => (
      <a
        {...props}
        className="text-red-400 hover:text-red-300 font-medium underline decoration-red-500/40 underline-offset-4 hover:decoration-red-400 transition-colors break-words"
      />
    ),

    strong: (props) => (
      <strong
        {...props}
        className="font-bold text-neutral-50"
      />
    ),

    code: (props) => {
      const { className, ...rest } = props as any;
      const isBlock = typeof className === 'string' && className.includes('language-');
      if (isBlock) {
        return <code className={className} {...rest} />;
      }
      return (
        <code
          {...props}
          className="rounded-md border border-neutral-700 bg-neutral-800 text-neutral-200 px-1.5 py-0.5 text-[0.88em] font-mono align-baseline whitespace-nowrap"
        />
      );
    },

    pre: (props) => (
      <div className="my-7 rounded-2xl overflow-hidden border border-neutral-800">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] font-bold text-neutral-500 tracking-[0.15em] uppercase">
            Code
          </span>
        </div>
        <pre
          {...props}
          className="!my-0 !rounded-none !bg-neutral-950 !p-5 md:p-6 text-[14px] leading-relaxed text-neutral-100 overflow-x-auto font-mono"
        />
      </div>
    ),

    ul: (props) => (
      <ul
        {...props}
        className="my-5 space-y-2.5 text-neutral-200 pl-0"
      />
    ),

    li: (props) => (
      <li
        {...props}
        className="relative pl-7 leading-[1.9] text-[15px] md:text-[17px]"
      >
        <span className="absolute left-0 top-[0.78em] w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block" />
        {props.children}
      </li>
    ),

    ol: (props) => (
      <ol
        {...props}
        className="my-5 space-y-2.5 text-neutral-200 pl-6 list-decimal marker:text-red-500 marker:font-bold"
      />
    ),

    blockquote: (props) => (
      <blockquote
        {...props}
        className="my-7 rounded-xl border-l-[3px] border-neutral-500 bg-neutral-800/60 border border-neutral-800 px-5 py-4 text-neutral-300 text-[15px] md:text-[17px] leading-[1.9]"
      />
    ),

    hr: (props) => (
      <hr {...props} className="border-neutral-800 my-10" />
    ),

    img: (props) => {
      return (
        <span className="block my-9 rounded-xl overflow-hidden border border-neutral-800 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            {...props}
            className="w-full h-auto block bg-neutral-950"
            loading="lazy"
          />
        </span>
      );
    },

    table: (props) => (
      <div className="my-7 rounded-xl overflow-hidden border border-neutral-800">
        <table
          {...props}
          className="w-full border-collapse text-[14px] text-neutral-200"
        />
      </div>
    ),

    thead: (props) => (
      <thead
        {...props}
        className="bg-neutral-800 text-neutral-100"
      />
    ),

    th: (props) => (
      <th
        {...props}
        className="px-4 py-3 text-left font-bold tracking-wide border-b border-neutral-800"
      />
    ),

    td: (props) => (
      <td
        {...props}
        className="px-4 py-3 border-b border-neutral-800/70 align-top text-neutral-200"
      />
    ),

    div: (props) => {
      const { className = '', ...rest } = props as any;
      // about.mdx 里的赞赏码块
      if (
        typeof className === 'string' &&
        (className.includes('wx_reward') || className.includes('bg-neutral-50'))
      ) {
        return (
          <div
            className="relative my-9 rounded-2xl border border-neutral-800 bg-neutral-900 p-7 md:p-9 flex flex-col items-center gap-5 text-center shadow-xl"
            {...rest}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[11px] font-bold tracking-[0.15em] uppercase text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              支持创作者
            </div>
            <div className="contents">{props.children}</div>
          </div>
        );
      }
      return <div className={className} {...rest} />;
    },
  };
}

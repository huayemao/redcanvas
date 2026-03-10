import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: (props) => (
      <h1 
        {...props} 
        className="text-4xl font-black text-neutral-900 mb-6"
      />
    ),
    h2: (props) => (
      <h2 
        {...props} 
        className="text-2xl font-bold text-neutral-800 mb-4 mt-8"
      />
    ),
    h3: (props) => (
      <h3 
        {...props} 
        className="text-xl font-semibold text-neutral-700 mb-3 mt-6"
      />
    ),
    p: (props) => (
      <p 
        {...props} 
        className="text-neutral-600 mb-4 leading-relaxed"
      />
    ),
    a: (props) => (
      <a 
        {...props} 
        className="text-red-500 hover:text-red-600 transition-colors"
      />
    ),
    code: (props) => (
      <code 
        {...props} 
        className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-sm"
      />
    ),
    pre: (props) => (
      <pre 
        {...props} 
        className="bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto mb-4"
      />
    ),
    ul: (props) => (
      <ul 
        {...props} 
        className="list-disc pl-5 mb-4 space-y-2 text-neutral-600"
      />
    ),
    ol: (props) => (
      <ol 
        {...props} 
        className="list-decimal pl-5 mb-4 space-y-2 text-neutral-600"
      />
    ),
    div: (props) => (
      <div {...props} />
    ),
  };
}

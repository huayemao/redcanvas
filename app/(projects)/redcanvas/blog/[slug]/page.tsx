import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts } from '@/app/(projects)/redcanvas/lib/blog';
import { APP_CONFIG } from '@/app/(projects)/redcanvas/config';
import { ChevronLeft, Sparkles, CalendarDays, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: '文章未找到 - RedCanvas',
      description: 'RedCanvas 博客，分享小红书风格设计技巧、内容创作经验和产品更新动态。',
    };
  }

  return {
    title: `${post.title} - RedCanvas Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} - RedCanvas Blog`,
      description: post.description,
      url: `${APP_CONFIG.baseUrl}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: ['花野猫'],
      tags: ['RedCanvas', '小红书封面', '产品更新'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let PostComponent;
  try {
    PostComponent = await import(`../../content/blog/${slug}.mdx`);
  } catch (error) {
    notFound();
  }

  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // 前后文导航
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const currentIdx = sorted.findIndex((p) => p.slug === slug);
  const prevPost = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextPost = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <article className="relative overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-red-500/40 min-h-[100dvh]">
      <div className="container mx-auto px-5 md:px-6 py-12 md:py-20 max-w-4xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-[13px] font-semibold text-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回博客列表
        </Link>

        {/* Hero 卡片 */}
        <header className="mt-10 mb-10 md:mt-14 md:mb-14 rounded-3xl border border-neutral-800 bg-neutral-900 shadow-xl">
          <div className="p-7 md:p-12">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[11px] font-bold tracking-[0.15em] uppercase text-neutral-300">
                <Sparkles className="w-3 h-3 text-red-500" />
                RedCanvas Journal
              </div>
              <span className="inline-block w-1 h-1 rounded-full bg-neutral-600" />
              <div className="inline-flex items-center gap-1.5 text-[13px] text-neutral-400 font-medium">
                <CalendarDays className="w-4 h-4" />
                {post.date}
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-neutral-50">
              {post.title}
            </h1>

            {post.description && (
              <p className="text-[15px] md:text-lg text-neutral-300 font-medium leading-relaxed max-w-2xl border-l-2 border-red-500 pl-4 py-1">
                {post.description}
              </p>
            )}
          </div>
        </header>

        {/* MDX 正文卡片 */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 shadow-xl">
          <div className="p-6 md:p-14 lg:p-16 text-neutral-200 text-[15px] md:text-[16px] leading-[1.95] antialiased">
            <PostComponent.default />
          </div>
        </div>

        {/* Prev / Next navigation */}
        {(prevPost || nextPost) && (
          <nav className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group relative rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-neutral-500 mb-3">
                  <ChevronLeft className="w-4 h-4 text-red-500" />
                  上一篇
                </div>
                <div className="text-lg font-bold text-neutral-100 group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                  {prevPost.title}
                </div>
              </Link>
            ) : (
              <div aria-hidden />
            )}

            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group relative rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all p-6 md:text-right shadow-lg"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-neutral-500 mb-3 md:justify-end">
                  下一篇
                  <ChevronLeft className="w-4 h-4 text-red-500 rotate-180" />
                </div>
                <div className="text-lg font-bold text-neutral-100 group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                  {nextPost.title}
                </div>
              </Link>
            ) : (
              <div aria-hidden />
            )}
          </nav>
        )}

        <div className="flex items-center justify-center gap-4 mt-16 text-[11px] text-neutral-600 font-medium">
          <span>REDCANVAS · ARTICLE</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Published
          </span>
        </div>
      </div>
    </article>
  );
}

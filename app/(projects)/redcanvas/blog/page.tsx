import Link from 'next/link';
import { getAllPosts } from '@/app/(projects)/redcanvas/lib/blog';
import { ChevronRight, Sparkles, CalendarDays, FileText } from 'lucide-react';

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] text-white selection:bg-red-500/40 min-h-[100dvh]">
      {/* Ambient glow - 与首页保持一致的光晕语言 */}
      <div className="absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-red-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[420px] h-[420px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 py-20 md:py-28 relative z-10 max-w-5xl">
        {/* Header / Hero */}
        <div className="mb-14 md:mb-20 max-w-3xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.22em] ml-2">
              RedCanvas Journal
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
            博客
            <span className="text-red-500">.</span>
            <span className="block md:inline md:ml-3 bg-clip-text text-transparent bg-gradient-to-r from-white/90 via-white/60 to-white/30 mt-2 md:mt-0 text-2xl md:text-3xl md:font-bold">
              产品更新与设计笔记
            </span>
          </h1>
          <p className="text-sm md:text-lg text-white/70 font-medium leading-relaxed max-w-xl">
            这里记录 RedCanvas 的产品更新、封面设计实战心得，以及作为独立开发者踩过的那些坑。
          </p>
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="relative rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-12 text-center">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500/40 rounded-tl-lg pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500/40 rounded-br-lg pointer-events-none" />
            <FileText className="w-10 h-10 text-white/50 mx-auto mb-4" />
            <p className="text-white/75 font-semibold text-lg">暂无博客文章，敬请期待</p>
          </div>
        ) : (
          <ul className="space-y-5 md:space-y-6">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group relative block rounded-[28px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all p-6 md:p-8 overflow-hidden"
                >
                  {/* 四角装饰 - 与首页一致 */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500/40 rounded-tl-lg pointer-events-none transition-opacity group-hover:border-red-500/70" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500/40 rounded-br-lg pointer-events-none transition-opacity group-hover:border-red-500/70" />

                  <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                    {/* 左边：编号小标签 */}
                    <div className="flex items-center gap-4 md:w-16 md:shrink-0 mb-4 md:mb-0">
                      <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-3 py-1 text-[10px] font-black tracking-[0.15em] uppercase text-red-400">
                        <Sparkles className="w-3 h-3" />
                        No. {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* 中间：标题 + 描述 */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-black text-white mb-3 leading-snug tracking-tight group-hover:text-red-400 transition-colors">
                        {post.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-semibold">{post.date}</span>
                        </span>
                        <span className="hidden md:inline w-1 h-1 rounded-full bg-white/25" />
                        <span className="text-white/70 md:max-w-[40ch] truncate font-medium">
                          {post.description}
                        </span>
                      </div>
                    </div>

                    {/* 右边：CTA 箭头 */}
                    <div className="hidden md:flex items-center justify-center shrink-0 ml-4">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all">
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* 移动端 CTA 箭头 */}
                  <div className="flex md:hidden items-center justify-between mt-5 pt-5 border-t border-white/[0.06]">
                    <span className="text-xs text-white/50 font-medium">阅读全文</span>
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white shadow shadow-red-500/30">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Bottom status bar - 呼应首页 footer 上方 status */}
        <div className="flex items-center justify-center gap-4 mt-20 text-[10px] text-white/20 font-medium">
          <span>REDCANVAS · JOURNAL</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {posts.length > 0 ? `${posts.length} 篇文章` : 'Coming Soon'}
          </span>
        </div>
      </div>
    </section>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts } from '@/app/(projects)/redcanvas/lib/blog';
import { APP_CONFIG } from '@/app/(projects)/redcanvas/config';

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
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let PostComponent;
  try {
    PostComponent = await import(`../../content/blog/${slug}.mdx`);
    console.log(PostComponent)
  } catch (error) {
    notFound();
  }

  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6 px-4">
      <Link
        href="/blog"
        className="inline-block text-blue-600 hover:text-blue-800"
      >
        ← 返回博客列表
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-black text-neutral-900 mb-2">
          {post.title}
        </h1>
        <p className="text-gray-500">{post.date}</p>
      </header>

      <PostComponent.default />
    </div>
  );
}

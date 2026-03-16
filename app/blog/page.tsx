import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';


export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">博客</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-600">暂无博客文章</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{post.date}</p>
              <p className="text-gray-600">{post.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

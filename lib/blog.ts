import path from 'path';
import { glob } from 'glob';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
}

function formatDate(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const blogDirectory = path.join(process.cwd(), 'content/blog');
  const files = glob.sync('*.mdx', { cwd: blogDirectory });
  
  const posts = await Promise.all(
    files.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      // 动态导入 MDX 文件
      const { metadata } = await import(`../content/blog/${fileName}`);
      
      return {
        slug,
        title: metadata.title || '',
        date: formatDate(metadata.date),
        description: metadata.description || '',
      };
    })
  );
  
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string) {
  try {
    // 动态导入指定的 MDX 文件
    const { default: content, metadata } = await import(`../content/blog/${slug}.mdx`);
    
    return {
      slug,
      content,
      title: metadata.title,
      date: formatDate(metadata.date),
      description: metadata.description,
    };
  } catch (error) {
    return null;
  }
}

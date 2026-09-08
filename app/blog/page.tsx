import type { Metadata } from 'next';
import BlogListing from './listing';
export const metadata: Metadata = { title: '博客 · zhangboyang', description: 'zhangboyang 的博客文章。' };
export default function BlogPage() {
  return <main className="blog-index" id="blog-content"><BlogListing /></main>;
}

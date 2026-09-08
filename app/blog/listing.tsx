import { articleHref, rowId } from '@/app/entry-navigation';
/* oxlint-disable next/no-html-link-for-pages -- Native links avoid the deployed vinext Link runtime failure. */
import Image from 'next/image';
import SectionMore from '@/app/section-more';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import posts from '@/content/blog/index.generated.json';
export default function BlogListing({ embedded = false }: { embedded?: boolean }) {
  const Heading = embedded ? 'h2' : 'h1';
  const PostHeading = embedded ? 'h3' : 'h2';
  return <>
    <div className="blog-index-heading"><div><p className="blog-kicker">BLOG / 01</p><Heading>博客<span>.</span></Heading></div><span className="blog-total">{posts.length} 篇文章</span></div>
    <div className="post-list">{posts.map((post, i) => <a className="post-row" id={rowId("blog", post.slug)} href={articleHref("blog", post.slug, embedded ? "/" : "/blog")} key={post.slug}>
      <span className="post-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <div className="post-thumbnail">{post.thumbnail ? <Image unoptimized src={post.thumbnail} alt="" width={720} height={480} loading={!embedded && i < 2 ? 'eager' : 'lazy'} /> : <div className="post-no-cover"><BookOpen size={42} strokeWidth={1} aria-hidden="true" /></div>}</div>
      <div className="post-row-copy"><p className="post-meta"><span>{post.category}</span>{post.publishedAt && <time dateTime={post.publishedAt}>{post.publishedAt.replaceAll('-', '.')}</time>}<span>约 {post.minutes} 分钟</span></p><PostHeading>{post.title}</PostHeading></div>
      <ArrowUpRight className="post-arrow" size={24} strokeWidth={1.3} aria-hidden="true" />
    </a>)}</div>
    {embedded && <SectionMore href="/blog" label="展开全部博客" />}
  </>;
}

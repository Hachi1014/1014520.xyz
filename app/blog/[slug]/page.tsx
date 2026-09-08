import { returnToEntry } from '@/app/entry-navigation';
/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed vinext Link runtime failure. */
import type { Metadata } from 'next';

import Image from 'next/image';
import { Info } from 'lucide-react';
import editorial from '@/content/blog/editorial.json';
const articleNotes: Record<string, { publishedAt: string; notice?: string }> = editorial;
import { notFound } from 'next/navigation';
import posts from '@/content/blog/posts.generated.json';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> };
export function generateStaticParams() { return posts.map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find(item => item.slug === slug);
  return { title: post ? `${post.title} · zhangboyang` : '文章未找到 · zhangboyang' };
}
export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const backHref = returnToEntry("blog", slug, from);
  const index = posts.findIndex(post => post.slug === slug);
  if (index === -1) notFound();
  const post = posts[index];
  const next = posts[index + 1];
  const notice = articleNotes[post.slug]?.notice;
  return <main className="article-page" id="blog-content">
    <a className="article-back" href={backHref}>← 返回</a>
    <header className="article-heading"><p className="post-meta"><span>{post.category}</span>{post.publishedAt && <time dateTime={post.publishedAt}>{post.publishedAt.replaceAll('-', '.')}</time>}<span>约 {post.minutes} 分钟</span></p><h1>{post.title}</h1><p className="article-author">zhangboyang</p></header>
    <div className="article-layout">
      <article className="article-body">
        {post.cover && <Image unoptimized className="article-cover" src={post.cover.src} alt="" width={post.cover.width} height={post.cover.height} fetchPriority="high" />}
        {notice && <aside className="article-notice" aria-label="文章说明"><Info size={20} strokeWidth={1.6} aria-hidden="true" /><p>{notice}</p></aside>}
        <div className="article-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="article-end"><a href={backHref}>← 返回</a>{next && <a href={`/blog/${next.slug}`}>下一篇：{next.title} →</a>}</div>
      </article>
      {post.toc.length > 0 && <aside className="article-toc"><nav aria-label="文章目录"><p>文章目录</p>{post.toc.map(heading => <a key={heading.id} href={`#${heading.id}`}>{heading.text}</a>)}</nav></aside>}
    </div>
  </main>;
}

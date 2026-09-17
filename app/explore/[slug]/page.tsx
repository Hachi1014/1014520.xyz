import ArticleBackLink from '@/app/article-back-link';
import ArticleToc from '@/app/article-toc';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native return navigation. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { returnToEntry, articleHref } from '@/app/entry-navigation';
import ThoughtDate from '@/app/thought-date';
import posts from '@/content/explore/posts.generated.json';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> };
export function generateStaticParams() { return posts.map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const post = posts.find(item => item.slug === slug);
  return { title: post ? `${post.title} · 探索 · zhangboyang` : '探索未找到 · zhangboyang' };
}
export default async function ExploreArticle({ params, searchParams }: Props) {
  const { slug } = await params; const { from } = await searchParams;
  const index = posts.findIndex(post => post.slug === slug); if(index < 0) notFound();
  const post = posts[index]; const next = posts[index+1]; const backHref = returnToEntry('explore',slug,from);
  const listUrl = new URL(backHref,'https://local.invalid'); listUrl.searchParams.delete('entry');
  const listOrigin = listUrl.pathname + listUrl.search;
  const showToc = !['hermes-arch-linux-installation', 'dual-boot-installation'].includes(post.slug);
  return <main className="article-page" id="explore-content">
    <div className="article-back"><ArticleBackLink href={backHref} /></div>
    <header className="article-heading"><p className="post-meta"><span>{post.category}</span><ThoughtDate date={post.date} endDate={post.endDate} /><span>约 {post.minutes} 分钟</span></p><h1>{post.title}</h1><p className="article-author">zhangboyang</p></header>
    {showToc && <ArticleToc headings={post.toc} collapsible />}
    <div className="article-layout"><article className="article-body"><div className="article-prose" dangerouslySetInnerHTML={{ __html: post.html }} /><div className="article-end"><ArticleBackLink href={backHref} />{next && <a href={articleHref('explore',next.slug,listOrigin)}>下一篇：{next.title} →</a>}</div></article>
    {showToc && <ArticleToc headings={post.toc} />}</div>
  </main>;
}

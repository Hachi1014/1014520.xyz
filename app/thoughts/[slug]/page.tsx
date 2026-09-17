import ArticleBackLink from '@/app/article-back-link';
import { returnToEntry } from '@/app/entry-navigation';
import ThoughtDate from '@/app/thought-date';
import ThoughtProse from '../prose';
/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed Link runtime failure. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import thoughtsData from '@/content/thoughts.json';
import type { Thought } from '../types';
const thoughts: Thought[] = thoughtsData;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> };
export function generateStaticParams() { return thoughts.map(thought => ({ slug: thought.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const thought = thoughts.find(item => item.id === slug);
  return { title: thought ? `${thought.title} · zhangboyang` : '思考未找到 · zhangboyang' };
}
export default async function ThoughtPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const backHref = returnToEntry("thoughts", slug, from);
  const index = thoughts.findIndex(thought => thought.id === slug);
  if (index === -1) notFound();
  const thought = thoughts[index];
  const next = thoughts[index + 1];
  return <main className="article-page" id="thoughts-content">
    <div className="article-back"><ArticleBackLink href={backHref} /></div>
    <header className="article-heading"><p className="post-meta"><span>{thought.category}</span><ThoughtDate date={thought.date} endDate={thought.endDate} /><span>约 {thought.minutes} 分钟</span></p><h1>{thought.title}</h1><p className="article-author">zhangboyang</p></header>
    <div className="article-layout"><article className="article-body">
      {thought.html ? <div className="article-prose" dangerouslySetInnerHTML={{ __html: thought.html }} /> : <ThoughtProse paragraphs={thought.paragraphs} />}
      <div className="article-end"><ArticleBackLink href={backHref} />{next && <a href={'/thoughts/' + next.id}>下一篇：{next.title} →</a>}</div>
    </article></div>
  </main>;
}

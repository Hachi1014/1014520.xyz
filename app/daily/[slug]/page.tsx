import ArticleBackLink from '@/app/article-back-link';
import { returnToEntry } from '@/app/entry-navigation';
/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed Link runtime failure. */
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import entriesData from '@/content/daily.json';
import type { DailyEntry } from '@/app/daily/types';
const entries: DailyEntry[] = entriesData;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> };
export function generateStaticParams() { return entries.map(entry => ({ slug: entry.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = entries.find(item => item.id === slug);
  return { title: entry ? `${entry.title || entry.date.replaceAll("-", ".")} · 日常 · zhangboyang` : '日常未找到 · zhangboyang' };
}
export default async function DailyEntryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const backHref = returnToEntry("daily", slug, from);
  const entry = entries.find(item => item.id === slug);
  if (!entry) notFound();
  return <main className="article-page" id="daily-content">
    <div className="article-back"><ArticleBackLink href={backHref} /></div>
    <header className="article-heading"><p className="post-meta"><time dateTime={entry.date}>{entry.date.replaceAll('-', '.')}</time></p><h1 className="sr-only">{entry.title || `${entry.date.replaceAll("-", ".")} 日常`}</h1><p className="article-author">zhangboyang</p></header>
    <div className="article-layout"><article className="article-body">
      {entry.html ? <div className="article-prose" dangerouslySetInnerHTML={{ __html: entry.html }} /> : <div className="article-prose">{entry.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{entry.image && <Image unoptimized src={entry.image.src} alt={entry.image.alt} width={entry.image.width} height={entry.image.height} />}</div>}
      <div className="article-end"><ArticleBackLink href={backHref} /></div>
    </article></div>
  </main>;
}

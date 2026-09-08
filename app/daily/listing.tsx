import { articleHref, rowId } from '@/app/entry-navigation';
/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed Link runtime failure. */
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import SectionMore from '@/app/section-more';
import entries from '@/content/daily.json';
export default function DailyListing({ embedded = false }: { embedded?: boolean }) {
  const Heading = embedded ? 'h2' : 'h1';
  const orderedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const visibleEntries = embedded ? orderedEntries.slice(0, 10) : orderedEntries;
  return <>
    <div className="blog-index-heading"><div><p className="blog-kicker">DAILY / 03</p><Heading id="daily-title">日常<span>.</span></Heading></div><span className="blog-total">{entries.length} 条记录</span></div>
    <div className="post-list">{visibleEntries.map((entry, index) => <a className="post-row" id={rowId("daily", entry.id)} href={articleHref("daily", entry.id, embedded ? "/" : "/daily")} key={entry.id}>
      <span className="post-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className="post-thumbnail"><Image unoptimized src={entry.image.src} alt="" width={entry.image.width} height={entry.image.height} loading={embedded ? 'lazy' : 'eager'} /></div>
      <div className="post-row-copy"><p className="post-meta"><time dateTime={entry.date}>{entry.date.replaceAll('-', '.')}</time></p><p className="daily-excerpt">{entry.paragraphs.join(" ")}</p></div>
      <ArrowUpRight className="post-arrow" size={24} strokeWidth={1.3} aria-hidden="true" />
    </a>)}</div>
    {embedded && <SectionMore href="/daily" label="展开全部日常" />}
  </>;
}

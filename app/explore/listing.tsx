"use client";
/* oxlint-disable next/no-html-link-for-pages -- Preserve native article navigation. */
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { articleHref, rowId } from '@/app/entry-navigation';
import ThoughtDate from '@/app/thought-date';
import SectionMore from '@/app/section-more';
import entries from '@/content/explore/index.generated.json';
const categories = [...new Set(entries.map(entry => entry.category))];
type Props = { embedded?: boolean; initialView?: string; initialCategory?: string };
export default function ExploreListing({ embedded = false, initialView, initialCategory }: Props) {
  const [view, setView] = useState(initialView === 'categories' ? 'categories' : 'date');
  const [category, setCategory] = useState(categories.includes(initialCategory ?? '') ? initialCategory! : 'all');
  const ordered = [...entries].sort((a,b) => b.date.localeCompare(a.date));
  const filtered = view === 'categories' && category !== 'all' ? ordered.filter(entry => entry.category === category) : ordered;
  const visible = embedded ? filtered.slice(0,10) : filtered;
  const query = view === 'categories' ? `?view=categories${category !== 'all' ? '&category=' + encodeURIComponent(category) : ''}` : '';
  const fullHref = '/explore' + query;
  const origin = embedded ? (view === 'categories' ? `/?exploreView=categories${category !== 'all' ? '&exploreCategory=' + encodeURIComponent(category) : ''}` : '/') : fullHref;
  const Heading = embedded ? 'h2' : 'h1';
  const ItemHeading = view === 'categories' ? (embedded ? 'h4' : 'h3') : (embedded ? 'h3' : 'h2');
  const GroupHeading = embedded ? 'h3' : 'h2';
  const panelId = embedded ? 'home-explore-results' : 'explore-results';
  const rows = (items: typeof entries) => <div className="post-list">{items.map(entry => <a className="post-row thought-row" id={rowId('explore',entry.slug)} href={articleHref('explore',entry.slug,origin)} key={entry.slug}>
    <span className="post-number" aria-hidden="true">{String(ordered.indexOf(entry)+1).padStart(2,'0')}</span>
    <div className="post-row-copy"><p className="post-meta"><span>{entry.category}</span><ThoughtDate date={entry.date} endDate={entry.endDate} /><span>{entry.status}</span><span>约 {entry.minutes} 分钟</span></p><ItemHeading>{entry.title}</ItemHeading></div>
    <ArrowUpRight className="post-arrow" size={24} strokeWidth={1.3} aria-hidden="true" />
  </a>)}</div>;
  return <>
    <div className="blog-index-heading"><div><p className="blog-kicker">EXPLORE / 04</p><Heading id="explore-title">Explore<span>.</span></Heading></div><span className="blog-total">{entries.length} 篇探索</span></div>
    <fieldset className="thoughts-view-switch" aria-label="探索查看方式"><button type="button" aria-pressed={view === 'date'} aria-controls={panelId} onClick={() => setView('date')}>按发布日期</button><button type="button" aria-pressed={view === 'categories'} aria-controls={panelId} onClick={() => setView('categories')}>按内容分区</button></fieldset>
    {view === 'categories' && <fieldset className="thoughts-categories" aria-label="探索内容分区"><button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>全部<span>{entries.length}</span></button>{categories.map(name => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}<span>{entries.filter(entry => entry.category === name).length}</span></button>)}</fieldset>}
    <div id={panelId}>{view === 'date' ? rows(visible) : categories.map(name => { const items = visible.filter(entry => entry.category === name); return items.length > 0 && <section className="thoughts-group" key={name}><GroupHeading className="thoughts-group-title">{name}</GroupHeading>{rows(items)}</section>; })}</div>
    {embedded && <SectionMore href={fullHref} label="展开全部探索" />}
  </>;
}

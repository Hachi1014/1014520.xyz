"use client";
/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed Link runtime failure. */
import { articleHref, rowId } from '@/app/entry-navigation';
import { useState } from 'react';
import ThoughtDate from '@/app/thought-date';
import SectionMore from '@/app/section-more';
import { ArrowUpRight } from 'lucide-react';
import thoughtsData from '@/content/thoughts-index.json';
import type { ThoughtSummary } from './types';
const thoughts: ThoughtSummary[] = thoughtsData;
import { thoughtGroups } from './groups';

type Props = { embedded?: boolean; initialView?: string; initialCategory?: string };
export default function ThoughtsListing({ embedded = false, initialView, initialCategory }: Props) {
  const [view, setView] = useState(initialView === 'categories' ? 'categories' : 'date');
  const [category, setCategory] = useState(thoughtGroups.some(group => group.id === initialCategory) ? initialCategory! : 'all');
  const activeGroup = thoughtGroups.find(group => group.id === category);
  const filtered = view === 'categories' && activeGroup
    ? thoughts.filter(thought => activeGroup.categories.includes(thought.category))
    : thoughts;
  const visibleThoughts = embedded ? filtered.slice(0, 10) : filtered;
  const Heading = embedded ? 'h2' : 'h1';
  const GroupHeading = embedded ? 'h3' : 'h2';
  const ItemHeading = view === 'categories' ? (embedded ? 'h4' : 'h3') : (embedded ? 'h3' : 'h2');
  const panelId = embedded ? 'home-thoughts-results' : 'thoughts-results';
  const fullListHref = view === 'categories'
    ? `/thoughts?view=categories${activeGroup ? '&category=' + activeGroup.id : ''}`
    : '/thoughts';
  const rows = (items: typeof thoughts) => <div className="post-list">{items.map((thought, index) => <a className="post-row thought-row" id={rowId("thoughts", thought.id)} href={articleHref("thoughts", thought.id, embedded ? fullListHref.replace("/thoughts", "/") : fullListHref)} key={thought.id}>
    <span className="post-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
    <div className="post-row-copy"><p className="post-meta"><span>{thought.category}</span><ThoughtDate date={thought.date} endDate={thought.endDate} /><span>约 {thought.minutes} 分钟</span></p><ItemHeading>{thought.title}</ItemHeading></div>
    <ArrowUpRight className="post-arrow" size={24} strokeWidth={1.3} aria-hidden="true" />
  </a>)}</div>;
  return <>
    <div className="blog-index-heading"><div><p className="blog-kicker">THOUGHTS / 02</p><Heading id="thoughts-title">想法<span>.</span></Heading></div><span className="blog-total">{thoughts.length} 篇思考</span></div>
    {thoughts.length > 0 && <>
    <fieldset className="thoughts-view-switch" aria-label="想法查看方式">
      <button type="button" aria-pressed={view === 'date'} aria-controls={panelId} onClick={() => setView('date')}>按发布日期</button>
      <button type="button" aria-pressed={view === 'categories'} aria-controls={panelId} onClick={() => setView('categories')}>按内容分区</button>
    </fieldset>
    {view === 'categories' && <fieldset className="thoughts-categories" aria-label="内容分区">
      <button type="button" aria-pressed={category === 'all'} aria-controls={panelId} onClick={() => setCategory('all')}>全部<span>{thoughts.length}</span></button>
      {thoughtGroups.map(group => <button type="button" key={group.id} aria-pressed={category === group.id} aria-controls={panelId} onClick={() => setCategory(group.id)}>{group.label}<span>{thoughts.filter(thought => group.categories.includes(thought.category)).length}</span></button>)}
    </fieldset>}
    <div id={panelId}>
      {view === 'date' ? rows(visibleThoughts) : thoughtGroups.map(group => {
        const items = visibleThoughts.filter(thought => group.categories.includes(thought.category));
        return items.length > 0 && <section className="thoughts-group" key={group.id} aria-labelledby={`${panelId}-${group.id}`}>
          <GroupHeading id={`${panelId}-${group.id}`} className="thoughts-group-title">{group.label}</GroupHeading>
          {rows(items)}
        </section>;
      })}
    </div>
    </>}
    {embedded && <SectionMore href={fullListHref} label="展开全部想法" />}
  </>;
}

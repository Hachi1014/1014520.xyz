/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed vinext Link runtime failure. */
'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { ArrowDown, ArrowUpRight, BookOpen, Lightbulb, Coffee, Compass } from 'lucide-react';
import SiteHeader from './site-header';
import FooterContact from './footer-contact';
import FooterCredits from './footer-credits';
import DitherBackground from './dither-background';
import DotField from './how-it-works/dot-field';
import posts from '@/content/blog/index.generated.json';
import thoughts from '@/content/thoughts-index.json';
import daily from '@/content/daily.json';
import explorations from '@/content/explore/index.generated.json';
import { articleHref, type Section } from './entry-navigation';

type RecentEntry = { section: Section; id: string; title: string; date: string; label: string; minutes?: number };
const recentEntries: RecentEntry[] = [
  ...posts.map(post => ({ section: 'blog' as const, id: post.slug, title: post.title, date: post.publishedAt ?? '', label: '博客', minutes: post.minutes })),
  ...thoughts.map(thought => ({ section: 'thoughts' as const, id: thought.id, title: thought.title, date: thought.date, label: '想法', minutes: thought.minutes })),
  ...daily.map(entry => {
    const text = entry.paragraphs.join(' ');
    const characters = Array.from(text);
    return { section: 'daily' as const, id: entry.id, title: characters.length > 48 ? characters.slice(0, 48).join('') + '…' : text, date: entry.date, label: '日常' };
  }),
  ...explorations.map(entry => ({ section: 'explore' as const, id: entry.slug, title: entry.title, date: entry.date, label: '探索', minutes: entry.minutes })),
];
const recentPosts = recentEntries.filter(entry => entry.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);

const chapters = [
  { id: 'blog', number: '01', english: 'BLOG', title: '博客', icon: BookOpen },
  { id: 'thoughts', number: '02', english: 'THOUGHTS', title: '想法', icon: Lightbulb },
  { id: 'daily', number: '03', english: 'DAILY', title: '日常', icon: Coffee },
  { id: 'explore', number: '04', english: 'EXPLORE', title: '探索', icon: Compass },
];


export default function PersonalHome({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState('home');
  useEffect(() => {
    const sections = ['blog', 'thoughts', 'daily', 'explore'].map(id => document.getElementById(id)).filter((section): section is HTMLElement => section !== null);
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!sections.length || !header) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = header.getBoundingClientRect().height + Math.min(160, window.innerHeight * .2);
      const section = sections.find(element => {
        const bounds = element.getBoundingClientRect();
        return bounds.top <= marker && bounds.bottom > marker;
      });
      setCurrentSection(section?.id ?? 'home');
      const progress = Math.min(1, Math.max(0, window.scrollY / 180));
      const opacity = progress * progress * (3 - 2 * progress);
      header.style.setProperty('--header-opacity', opacity.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    sections.forEach(section => observer.observe(section));
    observer.observe(header);
    document.querySelectorAll('.hero, .about-section').forEach(element => observer.observe(element));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return <main className="personal-home" id="home">
    <a className="skip-link" href="#about">跳到正文</a>
    <SiteHeader home><a href="#home" aria-current={currentSection == "home" ? "location" : undefined}>首页</a>{chapters.map(chapter => <a key={chapter.id} href={'#' + chapter.id} aria-current={currentSection === chapter.id ? 'location' : undefined}>{chapter.title}</a>)}</SiteHeader>

    <div className="elastic-page-viewport"><div className="elastic-page-content">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-art"><DitherBackground /></div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">NOTES ON A CURIOUS LIFE</p>
        <h1 id="hero-title">保持好奇<span className="title-period">.</span><br /><span className="second-line">让想法发生</span><span className="title-period">.</span></h1>
        <p className="hero-intro">你好，我是 zhangboyang，一名技术爱好者。<br />研究点技术，琢磨点问题，记录点生活。</p>
      </div>
      <a href="#about" className="scroll-cue" aria-label="向下探索，浏览文字、灵感与生活"><span className="scroll-cue-track" aria-hidden="true" /><span className="scroll-cue-copy" aria-hidden="true"><span>SCROLL TO</span><span>EXPLORE</span></span></a>
      <aside className="hero-window-wrap" aria-label="最近更新">
        <div className="hero-window liquid-surface" data-liquid="true">
          <div className="hero-window-top"><span>最近写下</span><span className="window-mark" aria-hidden="true" /></div>
          {recentPosts.map(post => <a className="hero-recent" key={`${post.section}-${post.id}`} href={articleHref(post.section, post.id, '/')}><div><p>{post.label} · <time dateTime={post.date}>{post.date.replaceAll('-', '.')}</time>{post.minutes != null && <> · 约 {post.minutes} 分钟</>}</p><h2>{post.title}</h2></div><ArrowUpRight size={20} strokeWidth={1.3} aria-hidden="true" /></a>)}
        </div>
      </aside>
      <div className="hero-bottom"><span className="hero-coordinate">STAY CURIOUS, KEEP CREATING.</span><a href="#about" aria-label="向下浏览"><ArrowDown size={18} /></a></div>
    </section>

    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="section-kicker"><span>01 / JOURNAL</span></div>
      <div className="about-heading"><h2 id="about-title">文字、灵感与生活<span>.</span></h2></div>
      <div className="chapter-grid">
        {chapters.map((chapter, index) => <article id={chapter.id + '-card'} key={chapter.number} className="chapter liquid-surface" data-liquid="true" data-active={active === index} onPointerEnter={event => { if (event.pointerType !== 'touch') setActive(index); }} onPointerLeave={() => setActive(null)}>
          <div className="chapter-dots" aria-hidden="true">{active === index && <DotField active index={0} monochrome />}</div>
          <div className="chapter-top"><span>{chapter.number}</span><chapter.icon size={24} strokeWidth={1.3} aria-hidden="true" /></div>
          <div className="chapter-copy"><span className="chapter-english">{chapter.english}</span><h3>{<a className="blog-entry" href={'#' + chapter.id}>{chapter.title}</a>}</h3></div>
        </article>)}
      </div>
    </section>
    {children}
    <footer className="site-footer"><FooterCredits /><span>保持好奇，下次见。</span><FooterContact /><a className="back-top return-control" href="#home">回到顶部</a></footer>
    </div></div>
  </main>;
}

/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed vinext Link runtime failure. */
'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

import { ArrowDown, ArrowUpRight, Moon, Sun, Asterisk, BookOpen, Lightbulb, Coffee, Compass } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ResumeEntry from './resume-entry';
import FooterContact from './footer-contact';
import FooterCredits from './footer-credits';
import DitherBackground from './dither-background';
import DotField from './how-it-works/dot-field';

const chapters = [
  { id: 'blog', number: '01', english: 'BLOG', title: '博客', icon: BookOpen },
  { id: 'thoughts', number: '02', english: 'THOUGHTS', title: '想法', icon: Lightbulb },
  { id: 'daily', number: '03', english: 'DAILY', title: '日常', icon: Coffee },
  { id: 'explore', number: '04', english: 'EXPLORE', title: 'Explore', icon: Compass },
];

function subscribeTheme(update: () => void) {
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
const readTheme = () => document.documentElement.dataset.theme === 'light';
const serverTheme = () => false;

export default function PersonalHome({ children }: { children: ReactNode }) {
  const light = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
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
  function changeTheme(value: boolean) {
    const theme = value ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', !value);
    try { localStorage.setItem('personal-theme', theme); } catch { /* Storage is optional. */ }
  }

  return <main className="personal-home" id="home">
    <a className="skip-link" href="#about">跳到正文</a>
    <header className="site-header">
      <div className="header-brand"><a className="wordmark" href="#home" aria-label="zhangboyang 的个人网站首页"><span className="dot-mark" aria-hidden="true" />zhangboyang<span className="wordmark-period">.</span></a><ResumeEntry /></div>
      <nav className="site-nav" aria-label="主导航"><a href="#home" aria-current={currentSection == "home" ? "location" : undefined}>首页</a>{chapters.map(chapter => <a key={chapter.id} href={'#' + chapter.id} aria-current={currentSection === chapter.id ? 'location' : undefined}>{chapter.title}</a>)}</nav>
      <div className="header-actions"><label className="theme-control" htmlFor="theme-toggle"><Moon size={16} aria-hidden="true" /><Switch id="theme-toggle" className="theme-switch" checked={light} onCheckedChange={changeTheme} aria-label="使用蓝白亮色主题" /><Sun size={17} aria-hidden="true" /></label></div>
    </header>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-art"><DitherBackground /></div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow"><span className="small-dot" />zhangboyang / Tech Enthusiast</p>
        <h1 id="hero-title">保持好奇<span className="title-period">.</span><br /><span className="second-line">让想法发生</span><span className="title-period">.</span></h1>
        <p className="hero-intro">你好，我是 zhangboyang，一名技术爱好者。<br />研究点技术，琢磨点问题，记录点生活。</p>
        <a href="#about" className="explore-link">往下看看<span><ArrowDown size={19} aria-hidden="true" /></span></a>
      </div>
      <div className="hero-bottom"><span className="hero-coordinate">STAY CURIOUS, KEEP CREATING.</span><a href="#about" aria-label="向下浏览"><ArrowDown size={18} /></a></div>
    </section>

    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="section-kicker"><span>01 / JOURNAL</span><Asterisk size={27} strokeWidth={1.4} aria-hidden="true" /></div>
      <div className="about-heading"><h2 id="about-title">文字、灵感与生活<span>.</span></h2><p>长一点的记录，短一点的思考。<br />还有那些平凡却值得记住的日常。</p></div>
      <div className="chapter-grid">
        {chapters.map((chapter, index) => <article id={chapter.id + '-card'} key={chapter.number} className="chapter" data-active={active === index} onPointerEnter={() => setActive(index)} onPointerLeave={() => setActive(null)}>
          <div className="chapter-dots" aria-hidden="true"><DotField active index={0} monochrome /></div>
          <div className="chapter-top"><span>{chapter.number}</span><chapter.icon size={24} strokeWidth={1.3} aria-hidden="true" /></div>
          <div className="chapter-copy"><span className="chapter-english">{chapter.english}</span><h3>{<a className="blog-entry" href={'#' + chapter.id}>{chapter.title}</a>}</h3></div>
        </article>)}
      </div>
      <div className="personal-note"><span className="small-dot" /><p>这个空间，和我一样，持续生长中。</p></div>
    </section>
    {children}
    <footer className="site-footer"><FooterCredits /><span>保持好奇，下次见。</span><FooterContact /><a className="back-top" href="#home">回到顶部<ArrowUpRight size={17} aria-hidden="true" /></a></footer>
  </main>;
}

/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation. */
import type { ReactNode } from 'react';
import BackToTop from './back-to-top';
import FooterContact from './footer-contact';
import FooterCredits from './footer-credits';
import SiteHeader from './site-header';
import './blog/blog.css';

const sections = ['home', 'blog', 'thoughts', 'daily', 'explore'];
const labels = ['首页', '博客', '想法', '日常', '探索'];
const links = {
  blog: ['/', '/blog', '/thoughts', '/daily', '/explore'],
  thoughts: ['/', '/blog', '/thoughts', '/daily', '/explore'],
  daily: ['/', '/blog', '/thoughts', '/daily', '/explore'],
  explore: ['/', '/blog', '/thoughts', '/daily', '/explore'],
};

export default function SectionLayout({ section, children }: { section: keyof typeof links; children: ReactNode }) {
  return <div className="blog-shell"><a className="skip-link" href={`#${section}-content`}>跳到正文</a>
    <SiteHeader>{links[section].map((href, index) => <a href={href} aria-current={sections[index] === section ? 'page' : undefined} key={sections[index]}>{labels[index]}</a>)}</SiteHeader>
    {children}
    <footer className="blog-footer"><FooterCredits /><FooterContact /><BackToTop /></footer>
  </div>;
}

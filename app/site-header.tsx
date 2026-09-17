/* oxlint-disable next/no-html-link-for-pages -- Keep native navigation across deployed routes. */
import type { ReactNode } from 'react';
import ResumeEntry from './resume-entry';
import BlogThemeSwitch from './blog/theme-switch';

export default function SiteHeader({ children, home = false, resumeActive = false }: { children: ReactNode; home?: boolean; resumeActive?: boolean }) {
  return <header className="site-header">
    <div className="header-brand"><a className="wordmark" href={home ? '#home' : '/'} aria-label="zhangboyang 的个人网站首页"><span className="dot-mark" aria-hidden="true" />zhangboyang<span className="wordmark-period">.</span></a>{home && <ResumeEntry active={resumeActive} />}</div>
    <nav className="site-nav liquid-surface" data-liquid="true" aria-label="主导航">{children}</nav>
    <div className="header-actions"><BlogThemeSwitch /></div>
  </header>;
}

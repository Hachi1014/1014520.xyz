import type { Metadata } from 'next';
import './globals.css';
import './glass-fusion.css';
import GlassExperience from './glass-experience';
import RestoreEntryPosition from './restore-entry-position';
import ArticleImageViewer from './article-image-viewer';

export const metadata: Metadata = {
  title: 'ZhangBoyang · Tech Enthusiast',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  icons: { icon: '/favicon.svg?v=child-emperor-face-20260911' },
  description: 'zhangboyang 的个人网站。博客记录技术与学习，想法收藏灵感与思考，日常留住生活的点滴。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className="dark" data-theme="dark" suppressHydrationWarning><head><meta name="color-scheme" content="light dark" /><script dangerouslySetInnerHTML={{ __html: `(function(){
  var root=document.documentElement;
  var system=window.matchMedia('(prefers-color-scheme: dark)');
  function readPreference(){
    var saved=null;
    try { saved=window.sessionStorage.getItem('personal-theme-session'); } catch {}
    if(saved==='dark'||saved==='light') root.dataset.themePreference=saved;
    else delete root.dataset.themePreference;
  }
  function syncTheme(){
    var saved=root.dataset.themePreference;
    var theme=saved==='dark'||saved==='light'?saved:(system.matches?'dark':'light');
    root.dataset.theme=theme;
    root.classList.toggle('dark',theme==='dark');
  }
  readPreference();
  syncTheme();
  system.addEventListener('change',syncTheme);
  // Mobile browsers can suspend the page while system settings are open.
  window.addEventListener('pageshow',syncTheme);
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden) syncTheme();
  });
})()` }} /></head><body className="fusion-theme">{children}<RestoreEntryPosition /><ArticleImageViewer /><GlassExperience /></body></html>;
}

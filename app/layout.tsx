import type { Metadata } from 'next';
import './globals.css';
import RestoreEntryPosition from './restore-entry-position';
import ArticleImageViewer from './article-image-viewer';

export const metadata: Metadata = {
  title: 'zhangboyang · Tech Enthusiast',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  icons: { icon: '/favicon.svg?v=blank' },
  description: 'zhangboyang 的个人网站。博客记录技术与学习，想法收藏灵感与思考，日常留住生活的点滴。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className="dark" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('personal-theme')==='light'?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()` }} /></head><body>{children}<RestoreEntryPosition /><ArticleImageViewer /></body></html>;
}

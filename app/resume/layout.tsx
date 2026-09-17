/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed vinext Link runtime failure. */

import FooterContact from '../footer-contact';
import FooterCredits from '../footer-credits';
import SiteHeader from '../site-header';
import '../blog/blog.css';
import './resume.css';
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <div className="blog-shell"><a className="skip-link" href="#resume-content">跳到正文</a>
    <SiteHeader resumeActive><a href="/">首页</a><a href="/blog">博客</a><a href="/#thoughts">想法</a><a href="/#daily">日常</a><a href="/#explore">探索</a></SiteHeader>
    {children}
    <footer className="blog-footer"><FooterCredits /><a href="/">返回首页</a><FooterContact /><a className="return-control" href="#resume-content">回到顶部</a></footer>
  </div>;
}

import { Mail, ArrowUpRight } from 'lucide-react';
export const metadata = { title: '简历 · zhangboyang' };
const sections = [
  { id: 'profile', title: '个人简介' },
  { id: 'skills', title: '技能与工具' },
  { id: 'projects', title: '项目经历' },
  { id: 'education', title: '教育经历' },
];
export default function ResumePage() {
  return <main className="resume-page" id="resume-content">
    <header className="resume-heading"><p className="blog-kicker">RESUME</p><h1>zhangboyang</h1><p className="resume-role">技术爱好者</p></header>
    <div className="resume-contacts">
      <a href="mailto:hachi1014@foxmail.com"><Mail size={18} strokeWidth={1.5} aria-hidden="true" />hachi1014@foxmail.com</a>
      <a href="https://github.com/Hachi1014" target="_blank" rel="noopener noreferrer" aria-label="GitHub：Hachi1014（在新标签页打开）">GitHub / Hachi1014<ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /></a>
    </div>
    <div className="resume-sections">{sections.map(section => <section className="resume-row" key={section.id} aria-labelledby={'resume-' + section.id}><h2 id={'resume-' + section.id}>{section.title}</h2><p className="resume-placeholder">待补充</p></section>)}</div>
  </main>;
}

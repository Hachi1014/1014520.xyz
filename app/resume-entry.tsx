"use client";
/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed Link runtime failure. */
import { useEffect, useRef } from 'react';
import { FileUser } from 'lucide-react';

export default function ResumeEntry({ active = false }: { active?: boolean }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    let frame = 0;
    let offset = 0;
    const update = () => {
      frame = 0;
      // Keep its layout space, but let the link leave the viewport with the page.
      const bottomAtTop = link.getBoundingClientRect().bottom + offset;
      const scroll = Math.max(0, window.scrollY);
      offset = Math.min(scroll, bottomAtTop);
      link.style.transform = `translateY(${-offset}px)`;
      link.style.visibility = scroll >= bottomAtTop ? 'hidden' : 'visible';
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      link.style.transform = '';
      link.style.visibility = '';
    };
  }, []);
  return <a ref={linkRef} className="resume-entry" href="/resume" aria-label="查看简历" title="简历" aria-current={active ? 'page' : undefined}><FileUser size={20} strokeWidth={1.5} aria-hidden="true" /><span>简历</span></a>;
}

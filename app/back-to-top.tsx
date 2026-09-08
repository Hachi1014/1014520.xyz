"use client";
import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
export default function BackToTop() {
  const anchor = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const slot = anchor.current;
    const control = button.current;
    if (!slot || !control) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = slot.getBoundingClientRect();
      const bottomGap = window.innerWidth <= 640 ? 26 : 36;
      const floatingTop = window.innerHeight - bottomGap - bounds.height;
      // One control follows the viewport until its footer position catches up.
      const surface = Math.min(1, Math.max(0, (bounds.top - floatingTop) / 96));
      const reveal = Math.max(1 - surface, Math.min(1, Math.max(0, (window.scrollY - 180) / 180)));
      control.style.left = `${bounds.left}px`;
      control.style.top = `${Math.min(bounds.top, floatingTop)}px`;
      control.style.width = `${bounds.width}px`;
      control.style.setProperty('--back-surface', String(surface));
      control.style.opacity = String(reveal);
      control.style.pointerEvents = reveal > 0 ? 'auto' : 'none';
      control.tabIndex = reveal > 0 ? 0 : -1;
      control.setAttribute('aria-hidden', String(reveal === 0));
      control.dataset.following = 'true';
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(slot);
    observer.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      delete control.dataset.following;
      control.removeAttribute('style');
      control.removeAttribute('aria-hidden');
      control.tabIndex = 0;
    };
  }, []);
  const goTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const label = <>回到顶部<ArrowUp size={22} strokeWidth={1.4} aria-hidden="true" /></>;
  return <span className="back-to-top-slot" ref={anchor}><span className="back-to-top back-to-top-placeholder" aria-hidden="true">{label}</span><button ref={button} type="button" className="back-to-top back-to-top-control" onClick={goTop}>{label}</button></span>;
}

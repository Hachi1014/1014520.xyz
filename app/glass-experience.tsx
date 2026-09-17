'use client';
import { useEffect } from 'react';
import { softSpring } from './soft-spring';
import { installEdgeElasticity } from './edge-elasticity';

export default function GlassExperience() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const home = document.querySelector<HTMLElement>('.personal-home');
    const elements = [...document.querySelectorAll<HTMLElement>('[data-liquid]')];
    const handlers: (() => void)[] = [];
    let highlightFrame = 0;
    let scrollFrame = 0;
    let scrolling = false;
    let scrollPosition = window.scrollY;
    let scrollVelocity = 0;
    let destination = 0;
    let lastTime = 0;
    let onArrival: (() => void) | null = null;
    const cache = elements.map(element => ({element, rect: null as DOMRect | null, x:0, y:0, pending:false}));
    function drawHighlight() {
      highlightFrame = 0;
      const updates = cache.filter(item => item.pending).map(item => {
        item.pending = false;
        item.rect ??= item.element.getBoundingClientRect();
        return {item,x:item.x - item.rect.left,y:item.y - item.rect.top};
      });
      for (const {item,x,y} of updates) {
        item.element.style.setProperty('--light-x', x + 'px');
        item.element.style.setProperty('--light-y', y + 'px');
      }
    }
    for (const item of cache) {
      const {element} = item;
      const move = (event: PointerEvent) => {
        if (reduced.matches || !finePointer.matches || scrolling) return;
        item.x = event.clientX; item.y = event.clientY; item.pending = true;
        if (!highlightFrame) highlightFrame = requestAnimationFrame(drawHighlight);
      };
      const enter = () => { item.rect = null; };
      const leave = () => { item.pending = false; };
      element.addEventListener('pointermove', move, {passive:true});
      element.addEventListener('pointerenter', enter);
      element.addEventListener('pointerleave', leave);
      handlers.push(() => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerenter', enter);
        element.removeEventListener('pointerleave', leave);
      });

    }

    // One-time entrances. Content is readable even if enhancement never runs.
    const animations = new Set<Animation>();
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal.unobserve(entry.target);
        if (reduced.matches) continue;
        const node = entry.target as HTMLElement;
        const bounds = entry.boundingClientRect;
        if (bounds.top < 120) continue;
        const animation = node.animate(
          [{opacity:.45,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],
          {duration:650,easing:'cubic-bezier(.2,.75,.25,1)',fill:'none'}
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    },{threshold:.12});
    document.querySelectorAll('.about-heading, .blog-index-heading, .post-row').forEach(element => reveal.observe(element));

    function cancelScroll() {
      cancelAnimationFrame(scrollFrame); scrollFrame = 0;
      scrolling = false; onArrival = null;
    }
    function scrollTick(now: number) {
      scrollFrame = 0;
      const dt = Math.min((now - lastTime)/1000,.1);
      lastTime = now;
      const next = softSpring(scrollPosition,scrollVelocity,destination,dt);
      scrollPosition = next.position; scrollVelocity = next.velocity;
      if (Math.abs(scrollPosition-destination)<.25 && Math.abs(scrollVelocity)<3) {
        window.scrollTo({top:destination,behavior:'instant'});
        scrolling = false;
        onArrival?.(); onArrival = null;
        return;
      }
      window.scrollTo({top:scrollPosition,behavior:'instant'});
      scrollFrame = requestAnimationFrame(scrollTick);
    }
    function goTo(top: number, arrival?: () => void) {
      const wasScrolling = scrolling;
      cancelAnimationFrame(scrollFrame);
      resetElasticity();
      destination = Math.max(0,Math.min(document.documentElement.scrollHeight-window.innerHeight,top));
      scrollPosition = window.scrollY;
      if (!wasScrolling) scrollVelocity = 0;
      onArrival = arrival ?? null;
      if (reduced.matches) {
        window.scrollTo({top:destination,behavior:'instant'});
        scrolling = false; onArrival?.(); onArrival = null; return;
      }
      scrolling = true; lastTime = performance.now();
      scrollFrame = requestAnimationFrame(scrollTick);
    }
    function anchorClick(event: MouseEvent) {
      if (!home || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor || anchor.classList.contains('skip-link')) return;
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) return;
      const section = document.getElementById(id);
      if (!section) return;
      resetElasticity();
      const header = document.querySelector('.site-header')?.getBoundingClientRect();
      const offset = id === 'home' ? 0 : (header?.bottom ?? 110) + 24;
      const top = id === 'home' ? 0 : section.getBoundingClientRect().top + window.scrollY - offset;
      event.preventDefault();
      history.pushState(null,'','#' + id);
      goTo(top,() => {
        const oldTabIndex = section.getAttribute('tabindex');
        section.setAttribute('tabindex','-1'); section.focus({preventScroll:true});
        if (oldTabIndex === null) section.removeAttribute('tabindex');
        else section.setAttribute('tabindex',oldTabIndex);
      });
    }
    function nativeInput() {
      cancelScroll(); resetElasticity();
    }
    function keyInput(event: KeyboardEvent) {
      if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) nativeInput();
    }
    function resetBounds() { cache.forEach(item => { item.rect = null; }); }
    function scroll() { resetBounds(); }
    const { reset: resetElasticity, cleanup: cleanupElasticity } = installEdgeElasticity(home, reduced, cancelScroll, resetBounds);
    function motionChange() {
      if (!reduced.matches) return;
      nativeInput();
      animations.forEach(animation => animation.cancel()); animations.clear();
    }
    function visibilityChange() { if(document.hidden) nativeInput(); }
    document.addEventListener('click',anchorClick);
    window.addEventListener('touchstart',nativeInput,{passive:true});
    window.addEventListener('pointerdown',nativeInput,{passive:true});
    window.addEventListener('keydown',keyInput);
    window.addEventListener('scroll',scroll,{passive:true});
    window.addEventListener('resize',resetBounds,{passive:true});
    document.addEventListener('visibilitychange',visibilityChange);
    reduced.addEventListener('change',motionChange);
    return () => {
      cancelAnimationFrame(highlightFrame); cancelScroll(); cleanupElasticity();
      handlers.forEach(cleanup => cleanup()); reveal.disconnect();
      animations.forEach(animation => animation.cancel());
      document.removeEventListener('click',anchorClick);
      window.removeEventListener('touchstart',nativeInput);
      window.removeEventListener('pointerdown',nativeInput); window.removeEventListener('keydown',keyInput);
      window.removeEventListener('resize',resetBounds);
      window.removeEventListener('scroll',scroll); document.removeEventListener('visibilitychange',visibilityChange);
      reduced.removeEventListener('change',motionChange);
    };
  },[]);
  return <div className="fusion-ambient" aria-hidden="true"><div className="fusion-halo fusion-halo-one" /><div className="fusion-halo fusion-halo-two" /></div>;
}

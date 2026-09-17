import { softSpring } from './soft-spring.ts';

export const EDGE_RELEASE_DELAY = 220;
export const EDGE_PULL_LIMIT = 76;

// Only outward input at a document boundary can engage the spring.
export function edgeDirection(scroll: number, maximum: number, delta: number): -1 | 0 | 1 {
  if (maximum <= 1 || !Number.isFinite(delta) || delta === 0) return 0;
  if (scroll <= 1 && delta < 0) return 1;
  if (scroll >= maximum - 1 && delta > 0) return -1;
  return 0;
}

export class EdgePull {
  position = 0;
  velocity = 0;
  target = 0;
  heldUntil = 0;
  direction = 0;
  reset() {
    this.position = this.velocity = this.target = this.heldUntil = this.direction = 0;
  }
  pull(delta: number, direction: -1 | 1, now: number) {
    if (this.direction !== direction) this.reset();
    if (now >= this.heldUntil) {
      this.target = this.position;
      this.velocity = 0;
    }
    this.direction = direction;
    const remaining = Math.max(0, 1 - Math.abs(this.target) / EDGE_PULL_LIMIT);
    this.target += direction * Math.min(Math.abs(delta), 120) * .24 * remaining;
    this.heldUntil = now + EDGE_RELEASE_DELAY;
  }
  step(now: number, dt: number) {
    const held = now < this.heldUntil;
    const next = softSpring(this.position, this.velocity, held ? this.target : 0, dt, held ? 1 : 2.4);
    this.position = Math.max(-EDGE_PULL_LIMIT, Math.min(EDGE_PULL_LIMIT, next.position));
    this.velocity = this.position === next.position ? next.velocity : 0;
    if (!held && Math.abs(this.position) < .1 && Math.abs(this.velocity) < 1) this.reset();
  }
}

export function installEdgeElasticity(
  home: HTMLElement | null,
  reduced: MediaQueryList,
  cancelScroll: () => void,
  resetBounds: () => void,
) {
  const content = home?.querySelector<HTMLElement>('.elastic-page-content');
  const pull = new EdgePull();
  let frame = 0;
  let lastTime = 0;
  function reset() {
    cancelAnimationFrame(frame); frame = 0;
    pull.reset();
    content?.style.removeProperty('transform');
    content?.style.removeProperty('transform-origin');
    home?.style.removeProperty('--edge-offset');
    home?.style.removeProperty('--edge-scale');
    home?.removeAttribute('data-elastic-edge');
    content?.removeAttribute('data-edge-state');
    resetBounds();
  }
  function tick(now: number) {
    frame = 0;
    pull.step(now, Math.min((now - lastTime) / 1000, .05));
    lastTime = now;
    if (!pull.direction || !content) { reset(); return; }
    // Stretch only the backdrop. Foreground content moves without changing glyph proportions.
    const offset = pull.position * .34;
    const scale = 1 + Math.min(Math.abs(offset) / Math.max(innerHeight, 1), .025);
    home!.dataset.elasticEdge = pull.direction > 0 ? 'top' : 'bottom';
    home!.style.setProperty('--edge-offset', `${offset.toFixed(3)}px`);
    home!.style.setProperty('--edge-scale', scale.toFixed(6));
    content.dataset.edgeState = now < pull.heldUntil ? 'held' : 'returning';
    resetBounds();
    frame = requestAnimationFrame(tick);
  }
  function nestedScroller(target: EventTarget | null, delta: number) {
    let node = target instanceof Element ? target : null;
    while (node && node !== home) {
      if (node.matches('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return true;
      if (node instanceof HTMLElement && node.scrollHeight > node.clientHeight + 1) {
        const style = getComputedStyle(node);
        if (/auto|scroll/.test(style.overflowY)) {
          const canMove = delta < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight - 1;
          if (canMove || /contain|none/.test(style.overscrollBehaviorY)) return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }
  function wheel(event: WheelEvent) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
    cancelScroll();
    if (!content || reduced.matches || !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY)) { reset(); return; }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    // Zero-delta events do not end a continuing trackpad gesture.
    if (!delta) return;
    if (!(event.target instanceof Node) || !home?.contains(event.target) || nestedScroller(event.target, delta)) { reset(); return; }
    const maximum = document.documentElement.scrollHeight - innerHeight;
    const direction = edgeDirection(scrollY, maximum, delta);
    if (!direction) { reset(); return; }
    event.preventDefault();
    const now = performance.now();
    pull.pull(delta, direction, now);
    if (!frame) { lastTime = now; frame = requestAnimationFrame(tick); }
  }
  function scroll() {
    if (pull.direction && edgeDirection(scrollY, document.documentElement.scrollHeight - innerHeight, -pull.direction) !== pull.direction) reset();
  }
  window.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('blur', reset);
  return {
    reset,
    cleanup: () => {
      reset();
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', reset);
      window.removeEventListener('blur', reset);
    },
  };
}

'use client';

import { useEffect, useRef } from 'react';

const palettes = [
  ['#ffffff', '#d0d0d0', '#7a7a7a'],
  ['#ffffff', '#d0d0d0', '#7a7a7a'],
  ['#ffd84d', '#ffe98a', '#b8940c'],
  ['#ab55ff', '#c98cff', '#6a1fc9'],
  ['#17de8e', '#5fe8ab', '#0c8a58'],
];
const clamp = (value: number) => Math.max(0, Math.min(1, value));

// The reference's six-pixel grid, radial reveal, and two-frequency shimmer.
// Cache the stationary point data; animate only the active card.
export default function DotField({ active, index, monochrome = false }: { active: boolean; index: number; monochrome?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let colors = palettes[index];
    let frame = 0;
    let width = 1;
    let height = 1;
    let radius = 1;
    let disposed = false;
    let visible = false;
    let nextPaint = 0;
    const started = performance.now();
    let points: { x: number; y: number; seed: number; distance: number; centerShade: number; color: string }[] = [];

    const paint = (now: number) => {
      context.clearRect(0, 0, width, height);
      const progress = motion.matches ? 1 : clamp((now - started) / 420);
      const front = progress * radius;
      const time = motion.matches ? 0.6 : now * 0.001;
      for (const point of points) {
        const reveal = clamp((front - point.distance + 34) / 34);
        if (!reveal) continue;
        const first = Math.sin(point.seed + time * (2.3 + point.seed % 3.7));
        const second = Math.sin(point.seed * 0.37 + time * (4.9 + point.seed % 5.1));
        const shimmer = 0.22 + ((first * 0.55 + second * 0.45) * 0.5 + 0.5) * (motion.matches ? 0.28 : 0.62);
        context.globalAlpha = reveal * point.centerShade * shimmer;
        context.fillStyle = point.color;
        context.fillRect(point.x, point.y, 1.55, 1.55);
      }
      context.globalAlpha = 1;
      canvas.dataset.ready = 'true';
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      radius = Math.hypot(width / 2, height / 2);
      points = [];
      for (let y = 2; y < height - 1; y += 6) {
        for (let x = 2; x < width - 1; x += 6) {
          const distance = Math.hypot(x - width / 2, y - height / 2);
          const seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
          points.push({ x, y, seed, distance, centerShade: 0.38 + clamp((distance - 30) / 54) * 0.62, color: colors[Math.floor(seed) % colors.length] });
        }
      }
      paint(performance.now());
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || document.hidden || !visible) return;
      if (now >= nextPaint || motion.matches) {
        paint(now);
        nextPaint = now + 1000 / 30 - 1;
      }
      if (!motion.matches) frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden && !disposed) tick(performance.now());
    };

    const updatePalette = () => {
      if (!monochrome) return;
      colors = document.documentElement.dataset.theme === 'light' ? ['#1558de', '#3475ec', '#6a98ed'] : ['#eeeeee', '#bbbbbb', '#777777'];
      for (const point of points) point.color = colors[Math.floor(point.seed) % colors.length];
      paint(performance.now());
    };

    if (monochrome) colors = document.documentElement.dataset.theme === 'light' ? ['#1558de', '#3475ec', '#6a98ed'] : palettes[0];
    resize();
    const themeObserver = new MutationObserver(updatePalette);
    if (monochrome) themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    visibilityObserver.observe(canvas);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    motion.addEventListener('change', resume);
    document.addEventListener('visibilitychange', resume);
    resume();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      motion.removeEventListener('change', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [active, index, monochrome]);

  return <canvas ref={canvasRef} className="run-canvas" aria-hidden="true" />;
}

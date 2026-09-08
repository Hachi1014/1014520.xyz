"use client";
/* oxlint-disable next/no-img-element -- The viewer uses the already loaded article image at its native resolution. */
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Dialog } from '@base-ui/react/dialog';
import './article-image-viewer.css';
import { zoomImage, stepImageZoom, type ImagePose } from './image-zoom';

type Picture = { src: string; alt: string; width: number; height: number };

const initialPose: ImagePose = { scale: 1, x: 0, y: 0 };
export default function ArticleImageViewer() {
  const [picture, setPicture] = useState<Picture | null>(null);
  const [open, setOpen] = useState(false);
  const [pose, setPose] = useState(initialPose);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const source = useRef<HTMLImageElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const selector = '.article-body img';
    const originals = new Map<HTMLImageElement, (string | null)[]>();
    const attributes = ['tabindex', 'role', 'aria-label', 'aria-haspopup'];
    const enhance = () => document.querySelectorAll<HTMLImageElement>(selector).forEach(image => {
      if (originals.has(image)) return;
      originals.set(image, attributes.map(name => image.getAttribute(name)));
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', image.alt ? `放大查看：${image.alt}` : '放大查看图片');
      image.setAttribute('aria-haspopup', 'dialog');
    });
    const activate = (event: MouseEvent | KeyboardEvent) => {
      if (!(event.target instanceof HTMLImageElement) || !event.target.matches(selector)) return;
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
      if (event instanceof MouseEvent && event.button !== 0) return;
      event.preventDefault();
      const image = event.target;
      source.current = image;
      setPicture({ src: image.currentSrc || image.src, alt: image.alt, width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
      setPose(initialPose);
      setOpen(true);
    };
    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', activate, true);
    document.addEventListener('keydown', activate, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('click', activate, true);
      document.removeEventListener('keydown', activate, true);
      originals.forEach((values, image) => attributes.forEach((name, index) => values[index] === null ? image.removeAttribute(name) : image.setAttribute(name, values[index]!)));
    };
  }, []);
  useEffect(() => {
    if (!stage) return;
    const measure = () => setSize({ width: stage.clientWidth, height: stage.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const bounds = stage.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.height : 1);
      setPose(previous => zoomImage(previous, Math.exp(-Math.max(-200, Math.min(200, delta)) * .002), x, y));
    };
    stage.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); stage.removeEventListener('wheel', wheel); };
  }, [stage]);
  const changeZoom = (direction: -1 | 1) => setPose(previous => stepImageZoom(previous, direction));
  const fit = picture ? Math.min(1, Math.max(1, size.width * .88) / picture.width, Math.max(1, size.height - 24) / picture.height) : 1;
  return <Dialog.Root open={open} onOpenChange={value => { setOpen(value); drag.current = null; setDragging(false); }}>
    <Dialog.Portal>
    <Dialog.Popup className="article-image-dialog" initialFocus={closeButton} finalFocus={source} style={{ position: 'fixed', inset: 0, width: '100%', height: '100dvh', transform: 'none', translate: 'none' }}>
      <Dialog.Title className="sr-only">图片预览</Dialog.Title>
      <Dialog.Description className="sr-only">滚轮缩放，拖动图片查看；按 Esc 或点击空白处关闭。</Dialog.Description>
      <button ref={closeButton} className="image-viewer-close" type="button" aria-label="关闭图片预览" onClick={() => setOpen(false)}><X size={22} /></button>
      <div className="image-viewer-toolbar">
        <button type="button" aria-label="缩小图片" onClick={() => changeZoom(-1)} disabled={pose.scale <= .5}><Minus size={20} /></button>
        <button className="image-viewer-scale" type="button" aria-label="重置为适应屏幕大小，100%" title="100% 为适应屏幕大小，点击重置" onClick={() => setPose(initialPose)}>{Math.round(pose.scale * 100)}%</button>
        <button type="button" aria-label="放大图片" onClick={() => changeZoom(1)} disabled={pose.scale >= 8}><Plus size={20} /></button>
      </div>
      <div ref={setStage} className="image-viewer-stage">
        <button type="button" className="image-viewer-dismiss" tabIndex={-1} aria-label="关闭图片预览" onClick={() => setOpen(false)} />
        {picture && size.width > 0 && <div className="image-viewer-center"><img className="image-viewer-picture" src={picture.src} alt={picture.alt} draggable={false} style={{ width: picture.width * fit, height: picture.height * fit, transform: `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`, cursor: dragging ? 'grabbing' : 'grab' }}
          onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: pose.x, originY: pose.y }; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerMove={event => { const active = drag.current; if (active?.id === event.pointerId) setPose(previous => ({ ...previous, x: active.originX + event.clientX - active.x, y: active.originY + event.clientY - active.y })); }}
          onPointerUp={event => { if (drag.current?.id === event.pointerId) { drag.current = null; setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId); } }}
          onPointerCancel={() => { drag.current = null; setDragging(false); }} /></div>}
      </div>
    </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}

'use client';
import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
function subscribe(update: () => void) {
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
const snapshot = () => document.documentElement.dataset.theme === 'light';
const serverSnapshot = () => false;
export default function BlogThemeSwitch() {
  const light = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return <label className="theme-control" htmlFor="blog-theme"><Moon size={16} aria-hidden="true" /><Switch id="blog-theme" className="theme-switch" checked={light} aria-label="使用蓝白亮色主题" onCheckedChange={value => {
    const theme = value ? 'light' : 'dark';
    document.documentElement.dataset.themePreference = theme;
    try { window.sessionStorage.setItem('personal-theme-session', theme); } catch { /* Keep the current-page choice when storage is unavailable. */ }
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', !value);
  }} /><Sun size={17} aria-hidden="true" /></label>;
}

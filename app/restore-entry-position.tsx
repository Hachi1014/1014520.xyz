"use client";
import { useLayoutEffect } from 'react';
export default function RestoreEntryPosition() {
  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('entry');
    if (!id || !/^(blog|thoughts|daily|explore)-[a-z0-9-]+$/.test(id)) return;
    const section = id.split('-')[0];
    if (!['/', `/${section}`].includes(url.pathname)) return;
    const row = document.getElementById(id);
    if (!row) return;
    // Restore reading context without fragment navigation, focus, or smooth scrolling.
    const bounds = row.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + bounds.top - (window.innerHeight - bounds.height) / 2, behavior: 'instant' });
  }, []);
  return null;
}

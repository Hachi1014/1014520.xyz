/* oxlint-disable next/no-html-link-for-pages -- Native navigation avoids the deployed Link runtime failure. */
import { ArrowUpRight } from 'lucide-react';
export default function SectionMore({ href, label }: { href: string; label: string }) {
  return <div className="section-more"><a href={href} aria-label={label}>全部展开<ArrowUpRight size={22} strokeWidth={1.3} aria-hidden="true" /></a></div>;
}

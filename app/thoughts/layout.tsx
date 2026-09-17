import type { ReactNode } from 'react';
import SectionLayout from '../section-layout';
export default function Layout({ children }: { children: ReactNode }) {
  return <SectionLayout section="thoughts">{children}</SectionLayout>;
}

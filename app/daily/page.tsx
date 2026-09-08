import DailyListing from './listing';
export const metadata = { title: '日常 · zhangboyang' };
export default function DailyPage() {
  return <main className="blog-index" id="daily-content"><DailyListing /></main>;
}

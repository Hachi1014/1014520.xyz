import PersonalHome from './personal-home';
import ThoughtsSection from './thoughts-section';
import BlogListing from './blog/listing';
import DailyListing from './daily/listing';
import './blog/blog.css';
import ExploreListing from './explore/listing';
export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string; category?: string; exploreView?: string; exploreCategory?: string }> }) {
  const { view, category, exploreView, exploreCategory } = await searchParams;
  return <><link rel="preload" href="/fonts/boyang-display.woff" as="font" type="font/woff" crossOrigin="anonymous" /><PersonalHome><section className="blog-index home-blog" id="blog" aria-label="博客"><BlogListing embedded /></section><ThoughtsSection initialView={view} initialCategory={category} /><section className="blog-index home-blog daily-section" id="daily" aria-labelledby="daily-title"><DailyListing embedded /></section><section className="blog-index home-blog explore-section" id="explore" aria-labelledby="explore-title"><ExploreListing embedded initialView={exploreView} initialCategory={exploreCategory} /></section></PersonalHome></>;
}

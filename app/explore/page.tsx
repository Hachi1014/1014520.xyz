import ExploreListing from './listing';
export const metadata = { title: '探索 · zhangboyang', description: '技术探索、实践过程与问题排查记录。' };
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ view?: string; category?: string }> }) {
  const { view, category } = await searchParams;
  return <main className="blog-index" id="explore-content"><ExploreListing initialView={view} initialCategory={category} /></main>;
}

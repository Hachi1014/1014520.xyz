import ThoughtsListing from './listing';
export const metadata = { title: '想法 · zhangboyang' };
type Props = { searchParams: Promise<{ view?: string; category?: string }> };
export default async function ThoughtsPage({ searchParams }: Props) {
  const { view, category } = await searchParams;
  return <main className="blog-index" id="thoughts-content"><ThoughtsListing initialView={view} initialCategory={category} /></main>;
}

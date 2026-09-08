import ThoughtsListing from './thoughts/listing';
export default function ThoughtsSection({ initialView, initialCategory }: { initialView?: string; initialCategory?: string }) {
  return <section className="blog-index home-blog thoughts-section" id="thoughts" aria-labelledby="thoughts-title"><ThoughtsListing embedded initialView={initialView} initialCategory={initialCategory} /></section>;
}

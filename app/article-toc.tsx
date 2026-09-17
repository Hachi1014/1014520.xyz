type Heading = { id: string; text: string };

export default function ArticleToc({ headings, collapsible = false }: { headings: Heading[]; collapsible?: boolean }) {
  if (!headings.length) return null;
  const links = headings.map(heading => <a key={heading.id} href={`#${heading.id}`}>{heading.text}</a>);
  if (collapsible) return <details className="article-toc-mobile">
    <summary>文章目录</summary>
    <nav aria-label="文章目录">{links}</nav>
  </details>;
  return <aside className="article-toc"><nav aria-label="文章目录"><p>文章目录</p>{links}</nav></aside>;
}

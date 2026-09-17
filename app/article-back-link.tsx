/* oxlint-disable next/no-html-link-for-pages -- Preserve the native return destination. */
export default function ArticleBackLink({ href }: { href: string }) {
  return <a className="article-back-button return-control" href={href}>返回列表</a>;
}

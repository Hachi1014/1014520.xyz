export type Section = 'blog' | 'thoughts' | 'daily' | 'explore';
export function rowId(section: Section, id: string) { return `${section}-${id}`; }
export function articleHref(section: Section, id: string, listPath: string) {
  return `/${section}/${id}?from=${encodeURIComponent(`${listPath}#${rowId(section, id)}`)}`;
}
export function returnToEntry(section: Section, id: string, from?: string | string[]) {
  const fallback = `/${section}?entry=${rowId(section, id)}`;
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return fallback;
  try {
    const url = new URL(from, 'https://local.invalid');
    if (url.origin !== 'https://local.invalid' || !['/', `/${section}`].includes(url.pathname) || url.hash !== `#${rowId(section, id)}`) return fallback;
    url.hash = '';
    url.searchParams.set('entry', rowId(section, id));
    return url.pathname + url.search;
  } catch { return fallback; }
}

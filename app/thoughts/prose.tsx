import type { ReactNode } from 'react';
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : part);
}
export default function ThoughtProse({ paragraphs }: { paragraphs: string[] }) {
  const blocks: ReactNode[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i];
    const ordered = /^\d+\.\s+/.test(text);
    const unordered = /^-\s+/.test(text);
    if (ordered || unordered) {
      const start = i;
      const pattern = ordered ? /^\d+\.\s+/ : /^-\s+/;
      const items: ReactNode[] = [];
      while (i < paragraphs.length && pattern.test(paragraphs[i])) {
        items.push(<li key={i}>{inline(paragraphs[i].replace(pattern, ''))}</li>);
        i++;
      }
      i--;
      blocks.push(ordered ? <ol key={start} start={parseInt(text, 10)}>{items}</ol> : <ul key={start}>{items}</ul>);
    } else if (text.startsWith('> ')) {
      blocks.push(<blockquote key={i}><p>{inline(text.slice(2))}</p></blockquote>);
    } else {
      blocks.push(<p key={i}>{inline(text)}</p>);
    }
  }
  return <div className="article-prose">{blocks}</div>;
}

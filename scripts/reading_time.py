"""Shared browsing-time estimate for rendered blog and exploration articles.

Heuristic: 450 Chinese characters / Latin words per minute, plus 20 seconds
per image, regardless of its dimensions.
This estimates reading, not the time required to perform tutorial steps.
"""
from html.parser import HTMLParser
import argparse
import json
import math
from pathlib import Path
import re


class ArticleContent(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text = []
        self.images = []
        self.video_seconds = 0

    def handle_data(self, data):
        self.text.append(data)

    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            self.images.append(dict(attrs))
        elif tag == 'video':
            try:
                self.video_seconds += max(0, float(dict(attrs).get('data-duration', 0)))
            except (ValueError, TypeError):
                pass


def estimate_minutes(html, cover=None):
    content = ArticleContent()
    content.feed(html)
    words = len(re.findall(r'[\u4e00-\u9fff]|[A-Za-z0-9]+', ' '.join(content.text)))
    seconds = words / 450 * 60 + 20 * len(content.images) + content.video_seconds
    # Blog covers are rendered outside the HTML body; include that display once.
    if cover:
        seconds += 20
    return max(1, math.ceil(seconds / 60))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Update website metadata only')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    for section in ('blog', 'explore'):
        folder = root / 'content' / section
        posts = json.loads((folder / 'posts.generated.json').read_text(encoding='utf-8'))
        index = json.loads((folder / 'index.generated.json').read_text(encoding='utf-8'))
        minutes = {}
        for post in posts:
            minutes[post['slug']] = estimate_minutes(post['html'], post.get('cover'))
            print(f"{section}/{post['slug']}: {post['minutes']} -> {minutes[post['slug']]} min")
            post['minutes'] = minutes[post['slug']]
        for entry in index:
            entry['minutes'] = minutes[entry['slug']]
        if args.write:
            for filename, data in [('posts.generated.json', posts), ('index.generated.json', index)]:
                (folder / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()

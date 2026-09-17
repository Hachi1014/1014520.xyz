from pathlib import Path
from reading_time import estimate_minutes
import argparse, hashlib, io, json, re, sys
from urllib.parse import unquote
from markdown_it import MarkdownIt
from PIL import Image, ImageDraw, ImageChops
import bleach
from media_privacy import strip_metadata

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[1]
args = argparse.ArgumentParser()
args.add_argument('source', help='Read-only directory containing selected exploration articles')
args.add_argument('--selection', type=Path, help='Reviewed selection, source hashes, masks and text redactions')
options = args.parse_args()
SOURCE = Path(options.source).resolve()
assert not ROOT.is_relative_to(SOURCE) and not SOURCE.is_relative_to(ROOT), 'Source and website must be separate'
review = json.loads(options.selection.read_text(encoding='utf-8')) if options.selection else {}
CONTENT = ROOT / 'content/explore'
ASSETS = ROOT / 'public/explore/assets'
PARTS = CONTENT / 'media-parts'
for directory in (CONTENT, ASSETS, PARTS):
    directory.mkdir(parents=True, exist_ok=True)

# Coordinates refer to original pixels. Cover only reviewed private regions.
# The source images are never changed or copied to the website unredacted.
MASKS = {
    'file-20260519064007479.png': [(805,447,982,479),(1240,754,1424,786)],
    'file-20260519064007477.png': [(47,678,270,710)],
    'file-20260530185343157.png': [(260,2801,325,2834)],
    'file-20260530190104205.png': [(600,3138,662,3166),(443,3165,502,3198),(456,4733,520,4765)],
}
SELECTION = [
    ('01-电脑双系统安装.md','dual-boot-installation','电脑双系统安装','系统安装','2026-05-17','2026-07-03','Dates explicitly recorded in article'),
    ('02-Openclaw & Hermes.md','openclaw-and-hermes','OpenClaw & Hermes','智能体实践','2026-02-10','2026-05-19','Start date recorded in article; last image timestamp supplies update date'),
    ('03-用Hermes指挥ArchLinux系统的安装.md','hermes-arch-linux-installation','用 Hermes 指挥 Arch Linux 系统的安装','系统安装','2026-05-29','2026-05-30','Dates inferred from the article image timestamps'),
]
if review:
    SELECTION = review['selection']
    MASKS = review.get('masks', {})

parser = MarkdownIt('commonmark', {'html': False, 'breaks': True}).enable('strikethrough').enable('table')
posts, manifest, media, image_cache = [], [], {}, {}
def load_existing(name, default):
    path = CONTENT / name
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default
existing_posts = load_existing('posts.generated.json', [])
existing_manifest = load_existing('import-manifest.json', {'articles': [], 'assets': [], 'redactions': {}})
existing_media = load_existing('media.generated.json', [])
# Verify the complete reviewed batch before writing any article or media.
for filename, selected_slug, *_ in SELECTION:
    source = (SOURCE / filename).resolve()
    assert source.is_relative_to(SOURCE) and source.is_file()
    refs = re.findall(r'!\[[^\]]*\]\(([^\n]*?)\)', source.read_text(encoding='utf-8-sig'))
    for path in [source] + [(SOURCE / unquote(ref)).resolve() for ref in refs]:
        assert path.is_relative_to(SOURCE) and path.is_file(), 'Invalid source path'
        if review:
            assert hashlib.sha256(path.read_bytes()).hexdigest() == review['sourceHashes'][path.name], 'Source changed since privacy review'
    assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', selected_slug), 'Invalid article slug'
for filename, slug, title, category, date, end_date, evidence in SELECTION:
    source = SOURCE / filename
    original = source.read_bytes()
    raw = original.decode('utf-8-sig')
    for edit in review.get('textRedactions', {}).get(slug, []):
        raw, substitutions = re.subn(edit['pattern'], edit['replacement'], raw)
        assert substitutions, 'Expected privacy text not found'
    images = []
    def replace_image(match):
        alt, ref = match.groups()
        path = (SOURCE / unquote(ref)).resolve()
        assert path.is_relative_to(SOURCE) and path.is_file(), 'Invalid source image path'
        if path not in image_cache:
            source_bytes = path.read_bytes()
            with Image.open(io.BytesIO(source_bytes)) as opened:
                image = opened.convert('RGB')
            width, height = image.size
            rectangles = MASKS.get(path.name, [])
            if rectangles:
                original_pixels = image.copy()
                draw = ImageDraw.Draw(image)
                for x1,y1,x2,y2 in rectangles:
                    assert 0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height
                    draw.rectangle((x1,y1,x2,y2),fill='#7b8490')
                # Confirm that no pixels outside the approved rectangles changed.
                delta = ImageChops.difference(image, original_pixels)
                clear = ImageDraw.Draw(delta)
                for rect in rectangles: clear.rectangle(rect,fill=(0,0,0))
                assert delta.getbbox() is None
            buffer = io.BytesIO()
            image.save(buffer, 'WEBP', lossless=True, method=4)
            data, extension = buffer.getvalue(), '.webp'
            if not rectangles and len(source_bytes) < len(data):
                data, extension = source_bytes, path.suffix.lower()
            data = strip_metadata(data)
            digest = hashlib.sha256(data).hexdigest()
            name = digest[:24] + extension
            (ASSETS / name).write_bytes(data)
            chunks = []
            for offset in range(0,len(data),1_000_000):
                chunk = data[offset:offset+1_000_000]
                chunk_name = hashlib.sha256(chunk).hexdigest()+'.bin'
                (PARTS / chunk_name).write_bytes(chunk)
                chunks.append(chunk_name)
            media[name] = {'name':name,'size':len(data),'sha256':digest,'parts':chunks}
            image_cache[path] = {'src':'/explore/assets/'+name,'width':width,'height':height,'sourceFile':path.name,'sourceHash':hashlib.sha256(source_bytes).hexdigest(),'redactedRegions':len(rectangles)}
            assert path.read_bytes() == source_bytes
        info = image_cache[path]
        images.append(info)
        return '![' + (alt or f'{title} · 步骤截图 {len(images)}') + '](' + info['src'] + ')'
    markdown = re.sub(r'!\[([^\]]*)\]\(([^\n]*?)\)',replace_image,raw)
    tokens = parser.parse(markdown)
    toc = []
    for index, token in enumerate(tokens):
        if token.type == 'heading_open':
            # The article template owns h1; preserve source headings as h2 and below.
            level = min(6, int(token.tag[1]) + 1)
            token.tag = f'h{level}'
            tokens[index+2].tag = token.tag
            anchor = f'section-{len(toc)+1}'
            token.attrSet('id', anchor)
            toc.append({'id':anchor,'text':tokens[index+1].content})
        if token.type == 'paragraph_open' and index+1 < len(tokens):
            label = tokens[index+1].content.split('\n')[0]
            if re.match(r'^(2026/\d+/\d+|第[一二三四五六七八九十]+步|补充：|隔天趁着)',label):
                anchor = f'section-{len(toc)+1}'
                token.attrSet('id',anchor)
                toc.append({'id':anchor,'text':re.sub('==','',label)})
        if token.children:
            for child in token.children:
                if child.type == 'image':
                    info = next(image for image in images if image['src'] == child.attrGet('src'))
                    for key,value in [('loading','lazy'),('decoding','async'),('width',str(info['width'])),('height',str(info['height']))]:
                        child.attrSet(key,value)
    html = parser.renderer.render(tokens,parser.options,{})
    html = bleach.clean(html,tags=['p','br','strong','em','s','h2','h3','h4','h5','h6','ul','ol','li','blockquote','a','img','hr','pre','code','table','thead','tbody','tr','td','th'],attributes={'*':['id'],'a':['href','title'],'img':['src','alt','width','height','loading','decoding'],'ol':['start']},protocols=['http','https','mailto'],strip=True)
    html = bleach.linkify(html,skip_tags=['pre','code'],callbacks=[bleach.callbacks.nofollow,bleach.callbacks.target_blank])
    assert len(re.findall('<img ',html)) == len(images)
    assert not re.search(r'(?:src|href)=[\"\'](?:javascript:|file:)',html)
    assert source.read_bytes() == original
    posts.append({'slug':slug,'title':title,'category':category,'date':date,'endDate':end_date,'status':'已完成','minutes':estimate_minutes(html),'html':html,'toc':toc})
    (CONTENT/(slug+'.md')).write_text(markdown,encoding='utf-8')
    manifest.append({'slug':slug,'sourceFile':filename,'sourceHash':hashlib.sha256(original).hexdigest(),'imageReferences':len(images),'dateEvidence':evidence})
imported_slugs = {post['slug'] for post in posts}
posts = [post for post in existing_posts if post['slug'] not in imported_slugs] + posts
manifest = [entry for entry in existing_manifest['articles'] if entry['slug'] not in imported_slugs] + manifest
all_assets = {(entry['sourceFile'], entry['sourceHash']):entry for entry in existing_manifest['assets']}
all_assets.update({(entry['sourceFile'], entry['sourceHash']):entry for entry in image_cache.values()})
used_assets = {src for post in posts for tag in re.findall(r'<(?:img|video)\b[^>]*>', post['html']) for src in re.findall(r'(?:src|poster)="([^"]+)"', tag)}
all_assets = {key:entry for key,entry in all_assets.items() if entry['src'] in used_assets}
all_media = {entry['name']:entry for entry in existing_media}
all_media.update(media)
media = {name:entry for name,entry in all_media.items() if '/explore/assets/'+name in used_assets}
all_masks = dict(existing_manifest.get('redactions', {}))
all_masks.update(MASKS)
masked_sources = {entry['sourceFile'] for entry in all_assets.values() if entry['redactedRegions']}
all_masks = {name:rects for name,rects in all_masks.items() if name in masked_sources}
posts.sort(key=lambda post:post['date'],reverse=True)
def save(name,value):
    (CONTENT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
save('posts.generated.json',posts)
save('index.generated.json',[{key:value for key,value in post.items() if key not in ('html','toc')} for post in posts])
save('media.generated.json',list(media.values()))
save('import-manifest.json',{'articles':manifest,'assets':list(all_assets.values()),'redactions':all_masks})
print(json.dumps({'articles':len(posts),'images':sum(p['imageReferences'] for p in manifest),'uniqueImages':len(image_cache),'redactedImages':sum(bool(p['redactedRegions']) for p in image_cache.values()),'redactedRegions':sum(p['redactedRegions'] for p in image_cache.values()),'mediaBytes':sum(p['size'] for p in media.values())},ensure_ascii=False))

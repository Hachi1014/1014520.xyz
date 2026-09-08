from pathlib import Path
import argparse, hashlib, io, json, math, re, sys
from urllib.parse import unquote
from markdown_it import MarkdownIt
from PIL import Image, ImageDraw, ImageChops
import bleach
from media_privacy import strip_metadata

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[1]
args = argparse.ArgumentParser()
args.add_argument('source', help='Directory containing the three selected exploration articles')
SOURCE = Path(args.parse_args().source).resolve()
CONTENT = ROOT / 'content/explore'
ASSETS = ROOT / 'public/explore/assets'
PARTS = CONTENT / 'media-parts'
for directory in (CONTENT, ASSETS, PARTS):
    directory.mkdir(parents=True, exist_ok=True)

# Coordinates refer to original pixels. Only credential values are covered.
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
parser = MarkdownIt('commonmark', {'html': False, 'breaks': True}).enable('strikethrough').enable('table')
posts, manifest, media, image_cache = [], [], {}, {}
for filename, slug, title, category, date, end_date, evidence in SELECTION:
    source = SOURCE / filename
    original = source.read_bytes()
    raw = original.decode('utf-8-sig')
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
    plain = re.sub(r'!\[[^\]]*\]\([^)]*\)','',raw)
    count = len(re.findall(r'[\u4e00-\u9fff]|[A-Za-z0-9]+',plain))
    posts.append({'slug':slug,'title':title,'category':category,'date':date,'endDate':end_date,'status':'已完成','minutes':max(1,math.ceil(count/450)),'html':html,'toc':toc})
    (CONTENT/(slug+'.md')).write_text(markdown,encoding='utf-8')
    manifest.append({'slug':slug,'sourceFile':filename,'sourceHash':hashlib.sha256(original).hexdigest(),'imageReferences':len(images),'dateEvidence':evidence})
posts.sort(key=lambda post:post['date'],reverse=True)
def save(name,value):
    (CONTENT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
save('posts.generated.json',posts)
save('index.generated.json',[{key:value for key,value in post.items() if key not in ('html','toc')} for post in posts])
save('media.generated.json',list(media.values()))
save('import-manifest.json',{'articles':manifest,'assets':list(image_cache.values()),'redactions':MASKS})
print(json.dumps({'articles':len(posts),'images':sum(p['imageReferences'] for p in manifest),'uniqueImages':len(image_cache),'redactedImages':sum(bool(p['redactedRegions']) for p in image_cache.values()),'redactedRegions':sum(p['redactedRegions'] for p in image_cache.values()),'mediaBytes':sum(p['size'] for p in media.values())},ensure_ascii=False))

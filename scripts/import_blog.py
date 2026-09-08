from pathlib import Path
import sys, re, json, hashlib, shutil, math, urllib.parse, argparse
from markdown_it import MarkdownIt
import bleach
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
root=Path(__file__).resolve().parents[1]
args_parser=argparse.ArgumentParser()
args_parser.add_argument('source', help='Directory containing the selected blog source files')
args_parser.add_argument('--only')
args=args_parser.parse_args()
source=Path(args.source)
selection=[('一个普通', 'a-students-awakening', '个人成长'), ('电脑装机', 'essential-windows-apps', '效率工具'), ('一个插件', 'tampermonkey-guide', '浏览器工具'), ('从此找资源', 'github-guide', '工具指南'), ('不管在哪', 'save-original-images', '实用技巧'), ('Photoshop最详细', 'photoshop-basics', '图像处理'), ('VPN就是', 'network-basics', '网络知识'), ('ClaudeCode超详细', 'claude-code-guide', '编程工具'), ('AI时代', 'learning-in-the-ai-era', '学习与思考')]
assets=root/'public/blog/assets';assets.mkdir(parents=True,exist_ok=True)
content=root/'content/blog';content.mkdir(parents=True,exist_ok=True)
parser=MarkdownIt('commonmark',{'html':False,'breaks':True}).enable('strikethrough').enable('table')
editorial=json.loads((content/'editorial.json').read_text(encoding='utf-8'))
posts=[];manifest=[];copied={}
if args.only:
    assert args.only in [s[1] for s in selection]
    posts=[p for p in json.loads((content/'posts.generated.json').read_text(encoding='utf-8')) if p['slug']!=args.only]
    previous=json.loads((content/'import-manifest.json').read_text(encoding='utf-8'))
    manifest=[p for p in previous['articles'] if p['slug']!=args.only]
    copied=previous['assets']
for prefix,slug,category in selection:
    if args.only and slug!=args.only: continue
    matches=list(source.glob(prefix+'*.md'));assert len(matches)==1,prefix
    file=matches[0];raw=file.read_text(encoding='utf-8-sig')
    edits=editorial.get(slug,{})
    if edits.get('endBeforeHeading'):
        marker=r'^# '+re.escape(edits['endBeforeHeading'])+r'\s*$'
        pieces=re.split(marker,raw,maxsplit=1,flags=re.M)
        assert len(pieces)==2, 'Missing editorial section: '+slug
        raw=re.sub(r'\n---\s*$','',pieces[0]).rstrip()
    for before,after in edits.get('replacements',[]):
        raw=raw.replace(before,after,1)
    (content/(slug+'.md')).write_text(raw,encoding='utf-8')
    images=[]
    def image_ref(match):
        alt,ref=match.groups();local=(source/urllib.parse.unquote(ref)).resolve()
        assert local.is_relative_to(source.resolve()) and local.is_file(),str(local)
        digest=hashlib.sha256(local.read_bytes()).hexdigest()[:20]
        name=digest+local.suffix.lower();out=assets/name
        if name not in copied:
            shutil.copy2(local,out);copied[name]=str(local.relative_to(source))
        with Image.open(local) as im: w,h=im.size
        item={'src':'/blog/assets/'+name,'width':w,'height':h,'original':ref}
        images.append(item)
        return '!['+alt+']('+item['src']+')'
    md=re.sub(r'!\[([^\]]*)\]\(([^\n]*?)\)',image_ref,raw)
    # Preserve original text; move a leading image into the article cover once.
    cover=images[0] if images and re.match(r'^\s*!\[',md) else None
    body=re.sub(r'^\s*!\[[^\]]*\]\([^\n]*?\)\s*','',md,count=1) if cover else md
    tokens=parser.parse(body)
    toc=[]
    # Article titles own the first heading level; preserve relative section levels.
    levels=[int(t.tag[1:]) for t in tokens if t.type=='heading_open']
    shift=1 if 1 in levels else 0
    for i,t in enumerate(tokens):
        if t.type in ('heading_open','heading_close'):
            t.tag='h'+str(min(6,int(t.tag[1:])+shift))
        if t.type=='heading_open':
            heading='section-'+str(len(toc)+1);t.attrSet('id',heading)
            text=re.sub(r'[*_~`]','',tokens[i+1].content)
            toc.append({'id':heading,'text':text,'level':int(t.tag[1:])})
        if t.children:
            for child in t.children:
                if child.type=='image':
                    info=next(x for x in images if x['src']==child.attrGet('src'))
                    child.attrSet('loading','lazy');child.attrSet('decoding','async')
                    child.attrSet('width',str(info['width']));child.attrSet('height',str(info['height']))
    html=parser.renderer.render(tokens,parser.options,{})
    html=bleach.clean(html,tags=['p','br','strong','em','s','h2','h3','h4','h5','h6','ul','ol','li','blockquote','a','img','hr','pre','code','table','thead','tbody','tr','td','th'],attributes={'*':['id'],'a':['href','title'],'img':['src','alt','width','height','loading','decoding'],'ol':['start']},protocols=['http','https','mailto'],strip=True)
    html=bleach.linkify(html,skip_tags=['pre','code'],callbacks=[bleach.callbacks.nofollow,bleach.callbacks.target_blank])
    assert not re.search(r'(?:src|href)=[\"\'](?:javascript:|file:)',html)
    thumb=None
    if cover:
        with Image.open(root/'public'/cover['src'].lstrip('/')) as im:
            im=im.convert('RGB');im.thumbnail((720,480));thumb='/blog/assets/'+slug+'-cover.webp';im.save(root/'public'/thumb.lstrip('/'),'WEBP',quality=87)
    plain=re.sub(r'!\[[^\]]*\]\([^)]*\)','',raw)
    word_count=len(re.findall(r'[\u4e00-\u9fff]|[A-Za-z0-9]+',plain))
    posts.append({'slug':slug,'title':file.stem,'category':category,'minutes':max(1,math.ceil(word_count/450)),'cover':cover,'thumbnail':thumb,'html':html,'toc':toc,'publishedAt':edits.get('publishedAt')})
    manifest.append({'slug':slug,'sourceFile':file.name,'sourceHash':hashlib.sha256(file.read_bytes()).hexdigest(),'imageReferences':len(images)})
order={item[1]:i for i,item in enumerate(selection)}
posts.sort(key=lambda p:order[p['slug']])
manifest.sort(key=lambda p:order[p['slug']])
(content/'posts.generated.json').write_text(json.dumps(posts,ensure_ascii=False,indent=2),encoding='utf-8')
(content/'index.generated.json').write_text(json.dumps([{k:v for k,v in p.items() if k not in ('html','toc')} for p in posts],ensure_ascii=False,indent=2),encoding='utf-8')
(content/'import-manifest.json').write_text(json.dumps({'articles':manifest,'assets':copied},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'articles':len(posts),'uniqueAssets':len(copied),'renderedImages':sum(p['imageReferences'] for p in manifest),'titles':[p['title'] for p in posts]},ensure_ascii=False))

# Optimize current media and create verified transport chunks.
from optimize_blog_media import optimize
optimize()

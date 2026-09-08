"""Optimize published images and regenerate verified transport chunks."""
from pathlib import Path
from io import BytesIO
import hashlib
import json
from PIL import Image
from media_privacy import strip_metadata

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/blog/assets'
CONTENT = ROOT / 'content/blog'
PARTS = CONTENT / 'media-parts'

def optimize():
    replacements = {}
    before = 0
    documents = {}
    for name in ('posts.generated.json', 'index.generated.json', 'import-manifest.json'):
        documents[name] = (CONTENT / name).read_text(encoding='utf-8')
    # Only process assets referenced by the current articles and their import manifest.
    referenced = {p.name for p in ASSETS.iterdir() if p.is_file() and any(p.name in text for text in documents.values())}
    selected = set()
    for name in sorted(referenced):
        source = ASSETS / name
        data = strip_metadata(source.read_bytes())
        source.write_bytes(data)
        before += len(data)
        with Image.open(source) as image:
            if not getattr(image, 'is_animated', False) and source.suffix.lower() != '.webp':
                output = BytesIO()
                image.save(output, format='WEBP', quality=90, method=6)
                candidate = output.getvalue()
                if len(candidate) < len(data):
                    target_name = hashlib.sha256(candidate).hexdigest()[:20] + '.webp'
                    (ASSETS / target_name).write_bytes(candidate)
                    replacements[name] = target_name
                    name = target_name
        selected.add(name)
    for name, text in documents.items():
        for old, new in replacements.items():
            text = text.replace(old, new)
        (CONTENT / name).write_text(text, encoding='utf-8')
    PARTS.mkdir(exist_ok=True)
    media = []
    keep_parts = set()
    for name in sorted(selected):
        data = (ASSETS / name).read_bytes()
        parts = []
        for start in range(0, len(data), 1_000_000):
            block = data[start:start + 1_000_000]
            part = hashlib.sha256(block).hexdigest() + '.bin'
            (PARTS / part).write_bytes(block)
            parts.append(part)
            keep_parts.add(part)
        media.append(dict(name=name, sha256=hashlib.sha256(data).hexdigest(), size=len(data), parts=parts))
    (CONTENT / 'media.generated.json').write_text(json.dumps(media, indent=2), encoding='utf-8')
    # These two directories contain generated files only. Check each resolved parent.
    for folder, keep in ((ASSETS, selected), (PARTS, keep_parts)):
        assert folder.resolve().is_relative_to(ROOT.resolve())
        for file in folder.iterdir():
            if file.is_file() and file.name not in keep:
                assert file.resolve().parent == folder.resolve()
                file.unlink()
    print(json.dumps(dict(images=len(media), before_bytes=before, after_bytes=sum(m['size'] for m in media), converted=len(replacements))))

if __name__ == '__main__':
    optimize()

"""Remove identifying metadata without re-encoding image pixels."""
import struct

def strip_metadata(data):
    if data.startswith(b'\xff\xd8'):
        result=bytearray(data[:2]); pos=2
        while pos<len(data):
            assert data[pos]==255
            start=pos
            while data[pos]==255:pos+=1
            marker=data[pos];pos+=1
            if marker in (0xda,0xd9):result.extend(data[start:]);break
            if marker in range(0xd0,0xd8) or marker==0x01:result.extend(data[start:pos]);continue
            length=int.from_bytes(data[pos:pos+2],'big');end=pos+length
            assert end<=len(data)
            if marker not in (0xe1,0xed,0xfe):result.extend(data[start:end])
            pos=end
        return bytes(result)
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        result=bytearray(data[:8]);pos=8
        while pos<len(data):
            length=int.from_bytes(data[pos:pos+4],'big');kind=data[pos+4:pos+8];end=pos+12+length
            assert end<=len(data)
            if kind not in (b'tEXt',b'zTXt',b'iTXt',b'eXIf',b'tIME'):result.extend(data[pos:end])
            pos=end
        return bytes(result)
    if data.startswith((b'GIF87a',b'GIF89a')):
        pos=13+(3*(2**((data[10]&7)+1)) if data[10]&128 else 0)
        result=bytearray(data[:pos])
        def blocks(at):
            while data[at]:at+=1+data[at]
            return at+1
        while pos<len(data):
            start=pos;kind=data[pos];pos+=1
            if kind==0x3b:result.extend(data[start:]);break
            if kind==0x21:
                label=data[pos];pos=blocks(pos+1)
                if label!=0xfe:result.extend(data[start:pos])
            elif kind==0x2c:
                flags=data[pos+8];pos+=9
                if flags&128:pos+=3*(2**((flags&7)+1))
                pos=blocks(pos+1);result.extend(data[start:pos])
            else:raise ValueError('Invalid GIF block')
        return bytes(result)
    if data[:4]==b'RIFF' and data[8:12]==b'WEBP':
        result=bytearray(b'WEBP');pos=12
        while pos<len(data):
            kind=data[pos:pos+4];size=int.from_bytes(data[pos+4:pos+8],'little');end=pos+8+size+(size%2)
            if kind not in (b'EXIF',b'XMP '):
                chunk=bytearray(data[pos:end])
                if kind==b'VP8X':chunk[8]&=~12
                result.extend(chunk)
            pos=end
        return b'RIFF'+struct.pack('<I',len(result))+bytes(result)
    return data

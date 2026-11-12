"""Genera index.html cifrado.
Necesita (no se suben al repo): tools/content.html, tools/logos.json y tools/codes.json
codes.json: {"slug": {"name": "Nombre visible", "code": "slug-xxxxxxxx"}, ...}
Uso: python3 tools/build.py"""
import json, os, secrets, base64, hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
here=os.path.dirname(os.path.abspath(__file__)); p=lambda f: os.path.join(here,f)
ITER=250000
codes=json.load(open(p('codes.json'),encoding='utf-8'))
logos=json.load(open(p('logos.json'),encoding='utf-8'))
b=lambda x: base64.b64encode(x).decode()
payload=json.dumps({'html':open(p('content.html'),encoding='utf-8').read(),'logos':logos,'v':1},ensure_ascii=False).encode()
K=AESGCM.generate_key(bit_length=256); iv=secrets.token_bytes(12)
P={'i':b(iv),'c':b(AESGCM(K).encrypt(iv,payload,None))}
E={}
for slug,info in codes.items():
    salt=secrets.token_bytes(16); kek=hashlib.pbkdf2_hmac('sha256',info['code'].encode(),salt,ITER,32); iv2=secrets.token_bytes(12)
    inner=json.dumps({'k':b(K),'n':info['name']},ensure_ascii=False).encode()
    E[slug]={'s':b(salt),'i':b(iv2),'c':b(AESGCM(kek).encrypt(iv2,inner,None))}
shell=open(p('shell.html'),encoding='utf-8').read()
for k,v in {'__CSS__':open(p('css.css'),encoding='utf-8').read(),'__OJLOGO__':json.dumps(logos['oj-horizontal']),'__ENTRIES__':json.dumps(E),
            '__PAYLOAD__':json.dumps(P),'__ITER__':str(ITER),'__GUIDEJS__':open(p('guide2.js'),encoding='utf-8').read()}.items():
    assert shell.count(k)==1,k; shell=shell.replace(k,v)
open(os.path.join(here,'..','index.html'),'w',encoding='utf-8').write(shell)
print('index.html generado')

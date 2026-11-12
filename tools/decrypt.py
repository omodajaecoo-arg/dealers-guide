"""Recupera el contenido de la guia desde index.html usando cualquier codigo valido.
Uso: python3 tools/decrypt.py <codigo>   -> escribe tools/content.html y tools/logos.json (no se suben al repo)"""
import json, re, sys, base64, hashlib, os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
here=os.path.dirname(os.path.abspath(__file__))
html=open(os.path.join(here,'..','index.html'),encoding='utf-8').read()
get=lambda name: json.loads(re.search(r'const '+name+r' = (.*?);\n',html).group(1))
E,P,ITER=get('ENTRIES'),get('PAYLOAD'),int(re.search(r'const ITER = (\d+);',html).group(1))
code=sys.argv[1].strip().lower(); slug=code.split('-')[0]; e=E[slug]; b=base64.b64decode
kek=hashlib.pbkdf2_hmac('sha256',code.encode(),b(e['s']),ITER,32)
inner=json.loads(AESGCM(kek).decrypt(b(e['i']),b(e['c']),None))
data=json.loads(AESGCM(b(inner['k'])).decrypt(b(P['i']),b(P['c']),None))
open(os.path.join(here,'content.html'),'w',encoding='utf-8').write(data['html'])
json.dump(data['logos'],open(os.path.join(here,'logos.json'),'w',encoding='utf-8'),ensure_ascii=False)
print('ok: tools/content.html y tools/logos.json')

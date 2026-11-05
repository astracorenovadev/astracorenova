"""Acceptance checks for the independent business site and its mail-only primary CTA."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote,parse_qs
import json
ROOT=Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.links=[];self.ctas=[];self.meta={};self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='a':
            self.links.append(a.get('href',''))
            if 'persistent-contact'in a.get('class',''):self.ctas.append(a.get('href',''))
        if tag=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content','')

text=(ROOT/'index.html').read_text(encoding='utf-8');page=Page(text)
assert (ROOT/'CNAME').read_bytes()==b'astracorenova.com\n'
assert 'https://astracorenova.com/'in text
assert page.meta['og:url']=='https://astracorenova.com/'
assert 'contact@astracorenova.com'in text
assert 'apps'not in page.ids
for href in page.ctas:
    parsed=urlsplit(href);assert parsed.scheme=='mailto'and parsed.path=='contact@astracorenova.com'
    assert parse_qs(parsed.query)['subject']==['Цифровий працівник для бізнесу']
assert page.ctas
for href in page.links:
    if href.startswith('#'):assert href[1:]in page.ids,href
    if not href or href.startswith(('#','mailto:','http:','https:','tel:')):continue
    assert not href.startswith('/'),href
    assert (ROOT/href.split('#')[0]).exists(),href
for required in ['hero','services','process','security','studio','pricing','faq','contact']:
    assert required in page.ids,required
for path in list(ROOT.rglob('*.html'))+list((ROOT/'assets/js').glob('*.js'))+list((ROOT/'scripts').glob('*.py')):
    if path==Path(__file__).resolve():continue
    content=path.read_text(encoding='utf-8')
    for forbidden in ['astracorenovadev'+'.github.io','astra'+'budget','astra'+'world','hydra'+'scan','apps'+'.html','privacy-'+'policy/','tos'+'/']:
        assert forbidden not in content.lower(),f'{path.relative_to(ROOT)}: {forbidden}'
for file in ['apps'+'.html','astra'+'budget.html','astra'+'world.html','hydra'+'scan.html','app-'+'ads.txt','1212']:
    assert not (ROOT/file).exists(),file
for folder in ['privacy-'+'policy','t'+'os']:assert not(ROOT/folder).exists()
print(f'PASS business: domain+CNAME; mailto subject; {len(page.ids)} anchors; no mobile products or cross-site references; relative internal paths.')

#!/usr/bin/env python3
"""Best-effort import of public HelloFresh FR Recipe JSON-LD. No bypass, no private API.
Run periodically on a server or GitHub Actions; inspect resulting recipes.json.
"""
import json, re, time, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from html import unescape
from pathlib import Path
from html.parser import HTMLParser
ROOT='https://www.hellofresh.fr'
UA='WhatsEatPersonalRecipeReader/1.0 (public pages only)'
LIMIT=250
class Scripts(HTMLParser):
 def __init__(self): super().__init__();self.active=False;self.buf='';self.data=[]
 def handle_starttag(self,tag,attrs):
  if tag=='script' and 'ld+json' in dict(attrs).get('type','').lower():self.active=True;self.buf=''
 def handle_data(self,data):
  if self.active:self.buf+=data
 def handle_endtag(self,tag):
  if tag=='script' and self.active:self.active=False;self.data.append(self.buf)
def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept-Language':'fr-FR,fr;q=0.9'})
 with urllib.request.urlopen(req,timeout=18) as res:
  if res.status!=200:raise RuntimeError(res.status)
  return res.read(5_000_000).decode('utf-8','replace')
def nodes(obj):
 if isinstance(obj,list):
  for x in obj:yield from nodes(x)
 elif isinstance(obj,dict):
  yield obj
  for key in ('@graph','mainEntity','itemListElement'):
   if key in obj:yield from nodes(obj[key])
def text(v):
 if isinstance(v,str):return unescape(re.sub('<[^>]+>','',v)).strip()
 if isinstance(v,dict):return text(v.get('text') or v.get('name') or '')
 return ''
def duration(v):
 m=re.search(r'PT(?:(\d+)H)?(?:(\d+)M)?',str(v or ''))
 return int(m[1] or 0)*60+int(m[2] or 0) if m else 0
def parse_recipe(url):
 p=Scripts();p.feed(get(url))
 for raw in p.data:
  try:obj=json.loads(raw)
  except json.JSONDecodeError:continue
  for item in nodes(obj):
   typ=item.get('@type',[]);typ=[typ] if isinstance(typ,str) else typ
   if 'Recipe' not in typ:continue
   name=text(item.get('name'));ingredients=item.get('recipeIngredient',[])
   if not name or not ingredients:continue
   image=item.get('image','');image=image[0] if isinstance(image,list) and image else image;image=image.get('url','') if isinstance(image,dict) else image
   instructions=item.get('recipeInstructions',[])
   if isinstance(instructions,str):instructions=[instructions]
   steps=[]
   for x in instructions:
    if isinstance(x,dict) and x.get('@type')=='HowToSection':
     instructions2=x.get('itemListElement',[])
     for y in instructions2:steps.append({'text':text(y),'image':''})
    else:steps.append({'text':text(x),'image':''})
   return {'id':url,'title':name,'url':url,'image':image,'minutes':duration(item.get('totalTime') or item.get('cookTime')),'servings':2,'type':'Autre','ingredient':'Autre','items':[{'quantity':'','unit':'','name':text(x)} for x in ingredients],'utensils':[],'steps':[s for s in steps if s['text']]}
 return None
def discover():
 # Public sitemap discovery; may change or be blocked.
 queue=[ROOT+'/robots.txt'];sitemaps=[]
 try:
  robots=get(queue[0]);sitemaps=re.findall(r'(?im)^sitemap:\s*(\S+)',robots)
 except Exception:pass
 if not sitemaps:sitemaps=[ROOT+'/sitemap.xml']
 urls=[];seen=set()
 while sitemaps and len(seen)<80 and len(urls)<LIMIT:
  sitemap=sitemaps.pop(0)
  if sitemap in seen:continue
  seen.add(sitemap)
  try:
   xml=get(sitemap);root=ET.fromstring(xml)
   locs=[x.text for x in root.iter() if x.tag.endswith('loc') and x.text]
   for loc in locs:
    if loc.endswith('.xml') or '.xml?' in loc:sitemaps.append(loc)
    elif '/recipes/' in loc and urllib.parse.urlparse(loc).netloc.endswith('hellofresh.fr'):urls.append(loc)
  except Exception as exc:print('Sitemap inaccessible:',sitemap,exc)
 return list(dict.fromkeys(urls))[:LIMIT]
def main():
 path=Path(__file__).resolve().parents[1]/'recipes.json';existing=[]
 if path.exists():
  try:existing=json.loads(path.read_text()).get('recipes',[])
  except Exception:pass
 recipes={r['url']:r for r in existing if r.get('url')};found=discover();print('URLs publiques trouvées:',len(found))
 for i,url in enumerate(found):
  if url in recipes:
   old=recipes[url]
   old['title']=unescape(old.get('title',''))
   for ing in old.get('items',[]):ing['name']=unescape(ing.get('name',''))
   for step in old.get('steps',[]):step['text']=unescape(step.get('text',''))
   continue
  try:
   r=parse_recipe(url)
   if r:recipes[url]=r;print('Recette',i+1,r['title'])
  except Exception as exc:print('Page ignorée:',url,str(exc)[:100])
  time.sleep(.5)
 # Preserve previously imported data if website is unavailable.
 path.write_text(json.dumps({'recipes':list(recipes.values())},ensure_ascii=False,indent=2)+'\n')
 print('Recettes enregistrées:',len(recipes))
if __name__=='__main__':main()

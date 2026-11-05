#!/usr/bin/env python3
"""Best-effort import of public HelloFresh FR Recipe JSON-LD. No bypass, no private API.
Run periodically on a server or GitHub Actions; inspect resulting recipes.json.
"""
import json, re, time, os, gzip, unicodedata, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from html import unescape
from pathlib import Path
from html.parser import HTMLParser
ROOT='https://www.hellofresh.fr'
UA='WhatsEatPersonalRecipeReader/1.0 (public pages only)'
MAX_NEW_PER_RUN = max(1, int(os.getenv("WHATSEAT_MAX_NEW", "100")))
MAX_SITEMAPS = max(1, int(os.getenv("WHATSEAT_MAX_SITEMAPS", "300")))
MAX_DISCOVERED = max(1000, int(os.getenv("WHATSEAT_MAX_DISCOVERED", "50000")))
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
def canonical(url):
 parsed=urllib.parse.urlparse(url)
 if parsed.scheme not in ('http','https') or parsed.hostname not in ('hellofresh.fr','www.hellofresh.fr'):
  return None
 path=parsed.path.rstrip('/')
 if not re.match(r'^/recipes/[^/]+$',path):return None
 # Ignore category pages and navigation endpoints, retain recipe detail pages.
 slug=path.split('/')[-1]
 if not re.search(r'-[a-f0-9]{12,}$',slug,re.I):return None
 return ROOT+path

def discover():
 # Traverse all publicly advertised sitemaps, not just the first 250 recipes.
 sitemaps=[]
 try:
  robots=get(ROOT+'/robots.txt')
  sitemaps=re.findall(r'(?im)^sitemap:\s*(\S+)',robots)
 except Exception as exc:print('robots.txt inaccessible:',exc)
 if not sitemaps:sitemaps=[ROOT+'/sitemap.xml']
 urls=[];seen_sitemaps=set();seen_urls=set()
 while sitemaps and len(seen_sitemaps)<MAX_SITEMAPS and len(urls)<MAX_DISCOVERED:
  sitemap=sitemaps.pop(0)
  if sitemap in seen_sitemaps:continue
  parsed=urllib.parse.urlparse(sitemap)
  if parsed.hostname not in ('hellofresh.fr','www.hellofresh.fr'):continue
  seen_sitemaps.add(sitemap)
  try:
   req=urllib.request.Request(sitemap,headers={'User-Agent':UA,'Accept-Language':'fr-FR,fr;q=0.9'})
   with urllib.request.urlopen(req,timeout=25) as response:
    payload=response.read(12_000_000)
   if payload[:2]==b'\x1f\x8b':payload=gzip.decompress(payload)
   xml=payload.decode('utf-8','replace')
   doc=ET.fromstring(xml)
   for element in doc.iter():
    if not element.tag.endswith('loc') or not element.text:continue
    loc=element.text.strip()
    if re.search(r'\.xml(?:\.gz)?(?:\?|$)',urllib.parse.urlparse(loc).path,re.I):
     if loc not in seen_sitemaps:sitemaps.append(loc)
    else:
     normalized=canonical(loc)
     if normalized and normalized not in seen_urls:
      seen_urls.add(normalized);urls.append(normalized)
  except Exception as exc:print('Sitemap inaccessible:',sitemap,str(exc)[:140])
 print('Sitemaps inspectés:',len(seen_sitemaps),'URLs de recettes découvertes:',len(urls))
 return urls

def title_key(value):
 text=unicodedata.normalize('NFKD',unescape(str(value or '')).casefold())
 text=''.join(ch for ch in text if not unicodedata.combining(ch))
 return re.sub(r'[^a-z0-9]+','',text)

def ingredient_key(recipe):
 return {title_key(item.get('name','')) for item in recipe.get('items',[]) if isinstance(item,dict) and title_key(item.get('name',''))}

def equivalent(a,b):
 if title_key(a.get('title'))!=title_key(b.get('title')):return False
 aa,bb=ingredient_key(a),ingredient_key(b)
 # Identical normalized titles are duplicates unless both recipes demonstrably differ.
 if aa and bb and len(aa & bb)/max(len(aa),len(bb))<.45:return False
 return True

def deduplicate(recipes):
 kept=[];positions={};removed=[]
 for recipe in recipes:
  key=title_key(recipe.get('title'))
  matches=positions.get(key,[])
  match=next((i for i in matches if equivalent(kept[i],recipe)),None)
  if match is None:
   positions.setdefault(key,[]).append(len(kept));kept.append(recipe);continue
  old=kept[match]
  def quality(r):return (len(r.get('steps') or []),len(r.get('items') or []),bool(r.get('image')),bool(r.get('nutrition')))
  if quality(recipe)>quality(old):kept[match]=recipe;removed.append(old.get('id'))
  else:removed.append(recipe.get('id'))
 return kept,removed

def main():
 path=Path(__file__).resolve().parents[1]/'recipes.json';existing=[]
 if path.exists():
  try:existing=json.loads(path.read_text(encoding='utf-8')).get('recipes',[])
  except Exception as exc:raise RuntimeError('Catalogue existant illisible, arrêt de sécurité') from exc
 # Keep the existing order, IDs, nutrition and every user-facing recipe field.
 recipes,duplicates=deduplicate(list(existing))
 print(f"Doublons existants identifiés : {len(duplicates)}")
 known={canonical(r.get('url','')) for r in recipes if isinstance(r,dict)}
 known.discard(None)
 found=discover()
 new_count=0;failed=0
 for url in found:
  if url in known:continue
  if new_count>=MAX_NEW_PER_RUN:break
  try:
   recipe=parse_recipe(url)
   if recipe:
    
    if any(equivalent(recipe,old) for old in recipes if title_key(old.get('title'))==title_key(recipe.get('title'))):
     known.add(url);print('Doublon ignoré:',recipe['title']);continue
    recipes.append(recipe);known.add(url);new_count+=1
    print('Nouvelle recette',new_count,recipe['title'])
  except Exception as exc:
   failed+=1;print('Page ignorée:',url,str(exc)[:120])
  finally:time.sleep(.5)
 # Never replace the catalogue with an empty result after a failed discovery.
 if new_count or duplicates:
  temp=path.with_suffix('.json.tmp')
  temp.write_text(json.dumps({'recipes':recipes},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  temp.replace(path)
 print(f'Bilan : {len(existing)} au départ, {len(duplicates)} doublons retirés, {new_count} nouvelles, {failed} pages en erreur, {len(recipes)} au total.')
 if not found:print('Aucune URL découverte : catalogue préservé.')
if __name__=='__main__':main()

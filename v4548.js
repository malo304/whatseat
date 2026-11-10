/* Whats'Eat? V4.5.48 — sélection renforcée des recettes de saison. */
'use strict';
(() => {
 if(typeof allRecipes!=='function'||typeof render!=='function'||typeof matches!=='function')return;
 const byMonth={
  1:'betterave,carotte,celeri-rave,chou,chou-fleur,endive,epinard,mache,navet,oignon,panais,poireau,radis noir,topinambour,pomme,poire,kiwi,mandarine,orange,citron',
  2:'betterave,carotte,celeri-rave,chou,chou-fleur,endive,epinard,mache,navet,oignon,panais,poireau,radis noir,topinambour,pomme,poire,kiwi,mandarine,orange,citron',
  3:'asperge,betterave,carotte,celeri,chou,chou-fleur,endive,epinard,mache,navet,oignon,panais,poireau,radis,pomme,poire,kiwi,citron',
  4:'asperge,artichaut,betterave,carotte,chou-fleur,epinard,navet,radis,salade,pomme,fraise,rhubarbe',
  5:'asperge,artichaut,carotte,concombre,courgette,fenouil,petit pois,radis,salade,fraise,rhubarbe,cerise',
  6:'abricot,artichaut,aubergine,cerise,concombre,courgette,fenouil,fraise,framboise,haricot vert,melon,petit pois,poivron,salade,tomate',
  7:'abricot,ail,aubergine,bette,blette,cerise,concombre,courgette,echalote,figue,framboise,groseille,haricot vert,melon,myrtille,nectarine,peche,poivron,prune,tomate',
  8:'abricot,ail,artichaut,aubergine,bette,blette,concombre,courgette,echalote,figue,framboise,haricot vert,melon,mirabelle,myrtille,nectarine,peche,poivron,prune,tomate',
  9:'artichaut,aubergine,betterave,bette,blette,carotte,champignon,chou,concombre,courge,courgette,echalote,figue,haricot vert,mais,melon,mirabelle,poire,pomme,poivron,prune,raisin,tomate',
  10:'betterave,carotte,celeri-rave,champignon,chataigne,chou,courge,endive,epinard,navet,oignon,panais,poire,pomme,poireau,potimarron,potiron,raisin,topinambour',
  11:'betterave,carotte,celeri-rave,champignon,chataigne,chou,chou-fleur,courge,endive,epinard,mache,navet,oignon,panais,poire,poireau,pomme,potimarron,potiron,radis noir,topinambour,kiwi,noix',
  12:'betterave,carotte,celeri-rave,champignon,chataigne,chou,chou-fleur,courge,endive,epinard,mache,navet,oignon,panais,poire,poireau,pomme,potimarron,potiron,radis noir,topinambour,kiwi,noix,mandarine,orange,citron'
 };
 const norm=s=>(typeof fold==='function'?fold(String(s||'')):String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')).replace(/[^a-z0-9]+/g,' ').trim();
 const allProduce=[...new Set(Object.values(byMonth).join(',').split(',').map(norm).filter(Boolean))];
 const produce=(byMonth[new Date().getMonth()+1]||'').split(',').map(norm);
 const nameOf=item=>{if(typeof item==='string')return item;if(!item||typeof item!=='object')return '';try{return typeof splitAmount==='function'?(splitAmount(item).name||item.name||''):(item.name||'')}catch{return item.name||''}};
 const hasIngredient=(name,term)=>(' '+name+' ').includes(' '+term.replace(/-/g,' ')+' ');
 function seasonal(r){
  const ingredients=[...new Set((r.items||[]).map(item=>norm(nameOf(item))).filter(Boolean))];
  const produceIngredients=ingredients.filter(name=>allProduce.some(term=>hasIngredient(name,term)));
  if(produceIngredients.length<2)return false;
  const seasonalIngredients=produceIngredients.filter(name=>produce.some(term=>hasIngredient(name,term)));
  return seasonalIngredients.length>=2 && seasonalIngredients.length/produceIngredients.length>=0.5;
 }
 let active=false,insideRender=false;
 const baseMatches=matches;matches=function(r){return baseMatches(r)&&(!insideRender||!active||seasonal(r))};
 const style=document.createElement('style');
 style.textContent='.we-season-filter{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:8px 13px;border:1px solid #a9c5a6;border-radius:999px;background:#eef5eb;color:#24583a;font:inherit;font-size:13px;font-weight:700}.we-season-filter svg{width:17px;height:17px;flex:none}.we-season-filter[aria-pressed="true"]{background:#24583a;border-color:#24583a;color:#fff}.we-season-filter small{font-size:11px;opacity:.8}.we-season-tag{display:inline-flex;align-items:center;gap:5px;margin:5px 0 0;padding:4px 8px;border-radius:999px;background:#e7f1e2;color:#285c3c;font-size:11px;font-weight:750}.we-season-tag svg{width:12px;height:12px}.we-season-note{margin:8px 0 12px;color:var(--muted,#647568);font-size:12px;line-height:1.45}html[data-we-theme="dark"] .we-season-filter{background:#2b4032;color:#e0eddf;border-color:#506b55}html[data-we-theme="dark"] .we-season-filter[aria-pressed="true"]{background:#43865b;color:#fff;border-color:#6ca77c}html[data-we-theme="dark"] .we-season-tag{background:#304b38;color:#d9eedb}';
 document.head.append(style);
 const advanced=document.getElementById('advancedFilters');
 if(!advanced||document.getElementById('weSeasonFilter'))return;
 const heading=document.createElement('h2');heading.textContent='Saison';
 const label=document.createElement('label');label.className='checkline we-season-option';label.innerHTML='<input id="weSeasonFilter" type="checkbox"><span>Afficher uniquement les recettes de saison <small id="weSeasonCount"></small></span>';
 const note=document.createElement('p');note.className='we-season-note';note.textContent='Repères indicatifs pour les fruits et légumes de saison en France métropolitaine. La disponibilité varie selon les régions et les producteurs.';
 const actions=advanced.querySelector('.filter-actions');
 advanced.insertBefore(heading,actions);advanced.insertBefore(label,actions);advanced.insertBefore(note,actions);
 const baseRender=render;
 render=function(){
  insideRender=true;try{baseRender()}finally{insideRender=false}
  const count=allRecipes().filter(seasonal).length,counter=document.getElementById('weSeasonCount');
  if(counter)counter.textContent='('+count+' disponibles)';
  const seasonControl=document.getElementById('weSeasonFilter');if(seasonControl)seasonControl.checked=active;
  const activeCount=document.getElementById('activeFilterCount');
  if(activeCount){const base=Number((activeCount.textContent.match(/\d+/)||[])[0]||0);const total=base+(active?1:0);activeCount.textContent=total?'('+total+')':'';}
  document.querySelectorAll('#results .recipe[data-open]').forEach(card=>{
   const recipe=allRecipes().find(r=>String(r.id)===card.dataset.open);
   if(!recipe||!seasonal(recipe)||card.querySelector('.we-season-tag'))return;
   const title=card.querySelector('.recipebody h3');if(!title)return;
   const tag=document.createElement('span');tag.className='we-season-tag';
   tag.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z"/><path d="M4 21c3-6 7-9 13-13"/></svg> De saison';
   title.insertAdjacentElement('afterend',tag);
  });
 };
 const seasonControl=document.getElementById('weSeasonFilter');
 seasonControl.addEventListener('change',()=>{active=seasonControl.checked;render()});
 const reset=document.getElementById('resetAdvanced'),oldReset=reset.onclick;
 reset.onclick=function(event){active=false;if(seasonControl)seasonControl.checked=false;if(oldReset)oldReset.call(this,event);else render()};
 render();
 const version=document.querySelector('#settingsView .aboutpanel p');if(version)version.textContent='Version V4.5.48';
})();
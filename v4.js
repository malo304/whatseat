/* Whats'Eat? V4 — extensions non destructives à partir de la V3.4.2 */
'use strict';
const V4EQUIPMENT=['Four','Micro-ondes','Plaques de cuisson','Mixeur / Blender','Air fryer','Robot de cuisine','Cuiseur vapeur','Autocuiseur','Friteuse','Grill'];
state.v4??={weeklyCount:5,weeklyPeople:state.servings||2,equipment:[],nutritionEnabled:false};
const v4=state.v4;
let advancedOpen=false,selectedSlots=new Set(),v4Origin='home',v4Screen='home',v4Navigating=false;
const v4Filter={cal:'all',protein:'all',sort:'default',equipmentOnly:false};
const v4Screens=['home','detail','settings','editor','kitchen','shopping','planning','cook'];
function v4Navigate(screen,replace=false){
 if(!v4Screens.includes(screen))screen='home';
 v4Screen=screen;
 for(const id of v4Screens){const el=$(id+'View');if(el)el.classList.toggle('hidden',id!==screen)}
 document.querySelector('header.top').classList.toggle('hidden',screen!=='home');
 $('searchPanel').classList.toggle('hidden',screen!=='home'||!$('searchPanel').dataset.open);
 document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('nav-active',b.dataset.nav===screen||(screen==='kitchen'&&b.dataset.nav==='home')));
 window.scrollTo(0,0);
 if(!v4Navigating){const info={v4Screen:screen};if(replace)history.replaceState(info,'',location.href);else history.pushState(info,'',location.href)}
}
view=v4Navigate;
function v4GoBack(){if(history.state?.v4Screen&&history.state.v4Screen!=='home'){history.back()}else v4Navigate('home')}
window.addEventListener('popstate',e=>{v4Navigating=true;v4Navigate(e.state?.v4Screen||'home');v4Navigating=false});
history.replaceState({v4Screen:'home'},'',location.href);
function v4ShowHome(){filters.favorites=false;v4Navigate('home');render()}
home=v4ShowHome;
$('searchBtn').onclick=()=>{const el=$('searchPanel');el.dataset.open=el.dataset.open?'':'1';el.classList.toggle('hidden',!el.dataset.open);if(el.dataset.open)$('search').focus()};
$('fridgeBtn').onclick=()=>showKitchen();
$('advancedBtn').onclick=()=>{advancedOpen=!advancedOpen;$('advancedFilters').classList.toggle('hidden',!advancedOpen);$('advancedBtn').setAttribute('aria-expanded',String(advancedOpen))};
$('tabFav').onclick=()=>{filters.favorites=!filters.favorites;render()};
$('quickTimes').innerHTML=[['all','Tous'],['fast','20 min'],['medium','40 min'],['long','60 min et +']].map(([v,t])=>`<button data-quick="${v}">${t}</button>`).join('');
$('quickTimes').onclick=e=>{const b=e.target.closest('[data-quick]');if(b){filters.times=b.dataset.quick;render()}};
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{const id=b.dataset.nav;if(id==='planning')v4ShowPlanning();else if(id==='shopping')showShopping();else v4ShowHome()});
document.querySelectorAll('[data-home]').forEach(b=>b.onclick=v4GoBack);
document.querySelectorAll('[data-settings]').forEach(b=>b.onclick=v4GoBack);
// Le bouton retour est créé seulement lors du rendu de la fiche.
// Modifier le rendu de détail sans casser les événements d'origine.
const originalRenderDetail=renderDetail;
renderDetail=function(){originalRenderDetail();$('detailBack').onclick=v4GoBack;const r=current;const container=$('detailView');container.querySelector('.v4-detail-nutrition')?.remove();const info=document.createElement('div');info.className='v4-detail-nutrition';info.textContent=`🔥 ${v4Nutrition(r,'cal')===null?'Non renseigné':v4Nutrition(r,'cal')+' kcal'} · 💪 ${v4Nutrition(r,'protein')===null?'Non renseigné':v4Nutrition(r,'protein')+' g protéines'} par portion`;const title=container.querySelector('h2,h1');if(title)title.insertAdjacentElement('afterend',info)};
// Conserver la source de navigation lors de l'ouverture d'une fiche depuis le planning.
const originalOpenRecipe=openRecipe;
openRecipe=function(id){const prev=v4Screen;originalOpenRecipe(id);if(v4Screen==='detail'&&prev==='planning')v4Origin='planning';else if(prev!=='detail'&&prev!=='cook')v4Origin=prev};
// Données nutritionnelles : jamais d'estimation inventée.
function v4Nutrition(r,key){const keys=key==='cal'?['kcal','calories','caloriesPerServing']:['protein','proteins','proteinPerServing','protein_g'];for(const k of keys){const n=r[k]??r.nutrition?.[k];if(n!==undefined&&n!==null&&n!==''&&Number.isFinite(Number(n)))return Number(n)}return null}
function v4Range(value,kind,filter){if(filter==='all')return true;if(value===null)return false;if(kind==='cal'){return filter==='lt400'?value<400:filter==='lt600'?value<600:filter==='600-800'?value>=600&&value<=800:value>800}return filter==='lt20'?value<20:filter==='20-40'?value>=20&&value<=40:value>40}
function v4Needs(r){const text=fold([r.type,...(r.utensils||[]),...(r.steps||[]).map(s=>s.text)].join(' '));const patterns=[['Four',/\bfour\b|enfourne/],['Micro-ondes',/micro.onde/],['Plaques de cuisson',/\bpoele\b|\bcasserole\b|\bsauteuse\b|\bfaitout\b/],['Mixeur / Blender',/\bmixeur\b|\bblender\b|\bmixer\b/],['Air fryer',/air.fryer/],['Robot de cuisine',/robot de cuisine/],['Cuiseur vapeur',/cuiseur vapeur/],['Autocuiseur',/autocuiseur|cocotte.minute/],['Friteuse',/\bfriteuse\b/],['Grill',/\bgrill\b/]];return patterns.filter(([,re])=>re.test(text)).map(([n])=>n)}
function v4Compatible(r){return v4Needs(r).every(x=>v4.equipment.includes(x))}
const originalRender=render;
render=function(){originalRender();$('tabFav').classList.toggle('selected',filters.favorites);$('tabFav').textContent=(filters.favorites?'♥':'♡')+' Mes favoris';document.querySelectorAll('[data-quick]').forEach(b=>b.classList.toggle('active',b.dataset.quick===filters.times));$('nutritionFilters').classList.toggle('hidden',!v4.nutritionEnabled);const active=[v4Filter.cal!=='all',v4Filter.protein!=='all',v4Filter.sort!=='default',v4Filter.equipmentOnly,filters.types.length>0,filters.ingredients.length>0].filter(Boolean).length;$('activeFilterCount').textContent=active?`(${active})`:'';
 let recipes=allRecipes().filter(matches).filter(r=>(!v4.nutritionEnabled||(v4Range(v4Nutrition(r,'cal'),'cal',v4Filter.cal)&&v4Range(v4Nutrition(r,'protein'),'protein',v4Filter.protein)))&&(!v4Filter.equipmentOnly||v4Compatible(r)));
 if(v4.nutritionEnabled&&v4Filter.sort!=='default'){const cal=v4Filter.sort.startsWith('cal'),asc=v4Filter.sort.endsWith('Asc');recipes.sort((a,b)=>{const x=v4Nutrition(a,cal?'cal':'protein'),y=v4Nutrition(b,cal?'cal':'protein');return x===null&&y===null?0:x===null?1:y===null?-1:(asc?x-y:y-x)})}else if(v4.equipment.length){recipes.sort((a,b)=>Number(v4Compatible(b))-Number(v4Compatible(a)))}
 $('resultCount').textContent=recipes.length+' recette'+(recipes.length!==1?'s':'');$('results').innerHTML=recipes.length?recipes.map(r=>`<article class="recipe" data-open="${esc(r.id)}">${safeUrl(r.image)?`<img src="${esc(safeUrl(r.image))}" alt="" loading="lazy" onerror="this.style.display='none'">`:'<div class="imageplaceholder">🍽️</div>'}<div class="recipebody"><h3>${esc(r.title)}</h3><div class="recipestatus">${state.made?.[r.id]?'✓ Déjà faite':''} ${state.ratings?.[r.id]?'★ '+state.ratings[r.id]+'/5':''}</div><div class="v4-metrics"><span>⏱ ${esc(r.minutes||'?')} min</span><span>🔥 ${v4Nutrition(r,'cal')===null?'Non renseigné':v4Nutrition(r,'cal')+' kcal'}</span><span>💪 ${v4Nutrition(r,'protein')===null?'Non renseigné':v4Nutrition(r,'protein')+' g'}</span></div>${v4.equipment.length&&!v4Compatible(r)?'<small class="muted">⚠ Équipement manquant : '+esc(v4Needs(r).filter(x=>!v4.equipment.includes(x)).join(', '))+'</small>':''}<div class="recipefoot"><button class="heart" aria-label="Favori" data-fav="${esc(r.id)}">${state.favorites.includes(r.id)?'♥':'♡'}</button></div></div></article>`).join(''):'<div class="empty">Aucune recette ne correspond aux filtres.</div>';
};
// Sélecteurs avancés et paramètres.
for(const [id,key] of [['calFilter','cal'],['proteinFilter','protein'],['nutritionSort','sort']])$(id).onchange=e=>{v4Filter[key]=e.target.value;render()};
$('equipmentOnly').onchange=e=>{v4Filter.equipmentOnly=e.target.checked;render()};
$('resetAdvanced').onclick=()=>{filters.types=[];filters.ingredients=[];v4Filter.cal='all';v4Filter.protein='all';v4Filter.sort='default';v4Filter.equipmentOnly=false;for(const id of ['calFilter','proteinFilter'])$(id).value='all';$('nutritionSort').value='default';$('equipmentOnly').checked=false;render()};
$('nutritionEnabled').checked=!!v4.nutritionEnabled;
$('nutritionEnabled').onchange=e=>{v4.nutritionEnabled=e.target.checked;save();render()};
$('equipmentChoices').innerHTML=V4EQUIPMENT.map(x=>`<label class="checkline"><input type="checkbox" value="${esc(x)}" ${v4.equipment.includes(x)?'checked':''}> ${esc(x)}</label>`).join('');
$('equipmentChoices').onchange=e=>{const x=e.target.value;v4.equipment=e.target.checked?[...new Set([...v4.equipment,x])]:v4.equipment.filter(y=>y!==x);save();render()};
// Conserver les champs nutritionnels des recettes personnelles.
const originalOpenEditor=openEditor;
openEditor=function(r){originalOpenEditor(r);const f=$('recipeForm');f.elements.kcal.value=r?.kcal??'';f.elements.protein.value=r?.protein??''};
// Planning : choix de créneaux, remplacement unitaire et consultation des fiches.
const v4Days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],v4Meals=['Midi','Soir'];
function v4AllSlots(){return v4Days.flatMap(d=>v4Meals.map(m=>d+'-'+m))}
function v4ShowPlanning(){v4Navigate('planning');v4RenderPlanning()}
$('weeklyCount').value=v4.weeklyCount;$('weeklyPeople').value=v4.weeklyPeople;
$('weeklyCount').onchange=e=>{v4.weeklyCount=Math.max(1,Math.min(14,Number(e.target.value)||5));e.target.value=v4.weeklyCount;save();v4RenderPlanning()};
$('weeklyPeople').onchange=e=>{v4.weeklyPeople=Math.max(1,Math.min(20,Number(e.target.value)||2));e.target.value=v4.weeklyPeople;save();v4RenderPlanning()};
function v4RenderPlanning(){const planned=Object.values(state.planner||{}).filter(Boolean).length;$('planningProgress').textContent=`${planned} repas sur ${v4.weeklyCount} souhaités · ${v4.weeklyPeople} personne(s)`;
 $('randomSlots').innerHTML='<div class="slot-grid"><strong>Jour</strong><strong>Midi</strong><strong>Soir</strong>'+v4Days.map(d=>`<strong>${d}</strong>${v4Meals.map(m=>{const key=d+'-'+m;return `<label class="slot-choice"><input type="checkbox" data-slot="${esc(key)}" ${selectedSlots.has(key)?'checked':''} aria-label="${esc(key)}"></label>`}).join('')}`).join('')+'</div>';
 $('planner').innerHTML=v4Days.map(d=>`<div class="plan-day"><h4>${d}</h4>${v4Meals.map(m=>{const key=d+'-'+m,id=state.planner?.[key],r=allRecipes().find(x=>x.id===id);return `<div class="plan-line"><span>${m}</span>${r?`<button class="plan-recipe" data-plan-open="${esc(id)}">${esc(r.title)}</button><button class="plan-change" data-plan-change="${esc(key)}" aria-label="Changer">↻</button><button class="plan-remove" data-plan-remove="${esc(key)}" aria-label="Retirer">×</button>`:'<em>Aucun repas prévu</em>'}</div>`}).join('')}</div>`).join('')};
$('randomSlots').onchange=e=>{if(!e.target.dataset.slot)return;if(e.target.checked)selectedSlots.add(e.target.dataset.slot);else selectedSlots.delete(e.target.dataset.slot)};
$('generatePlan').onclick=()=>{const keys=[...selectedSlots];if(!keys.length)return alert('Sélectionne au moins un créneau.');if(keys.length>v4.weeklyCount)return alert(`Sélectionne au maximum ${v4.weeklyCount} créneaux.`);const existing=keys.filter(k=>state.planner?.[k]);if(existing.length&&!confirm(`Remplacer les ${existing.length} repas déjà prévus sur les créneaux sélectionnés ?`))return;const compatible=allRecipes().filter(r=>v4Compatible(r));const pool=compatible.length?compatible:allRecipes();if(!pool.length)return alert('Aucune recette disponible.');const shuffled=[...pool].sort(()=>Math.random()-.5);state.planner??={};keys.forEach((key,i)=>state.planner[key]=shuffled[i%shuffled.length].id);save();v4RenderPlanning()};
$('planner').onclick=e=>{const open=e.target.closest('[data-plan-open]'),remove=e.target.closest('[data-plan-remove]'),change=e.target.closest('[data-plan-change]');if(open){openRecipe(open.dataset.planOpen);return}if(remove){delete state.planner[remove.dataset.planRemove];save();v4RenderPlanning();return}if(change){const key=change.dataset.planChange,old=state.planner[key],pool=allRecipes().filter(r=>r.id!==old&&(!v4.equipment.length||v4Compatible(r)));if(!pool.length)return alert('Aucune autre recette disponible.');state.planner[key]=pool[Math.floor(Math.random()*pool.length)].id;save();v4RenderPlanning()}};
$('planShopping').onclick=()=>{const ids=Object.values(state.planner||{}).filter(Boolean);if(!ids.length)return alert('Aucun repas programmé.');ids.forEach(id=>{const r=allRecipes().find(x=>x.id===id);if(r)addShopping(r,v4.weeklyPeople)});alert('Ingrédients ajoutés à la liste de courses.')};
// Afficher une seule barre d'en-tête, conserver la navigation de l'historique.
const originalSettings=settings;
settings=function(){originalSettings();document.querySelector('#settingsView [data-home]').onclick=v4GoBack};
const originalRenderCooking=renderCooking;
renderCooking=function(){originalRenderCooking();$('cookBack').onclick=v4GoBack};
// Réparer le filtre temps « 60 min et + » sans modifier les anciens seuils.
const originalMatches=matches;
matches=function(r){if(filters.times!=='long')return originalMatches(r);const prev=filters.times;filters.times='all';const yes=originalMatches(r)&&Number(r.minutes)>=60;filters.times=prev;return yes};
// Écran de lancement : une nouvelle session de document, pas au retour d'arrière-plan.
const splash=$('splash');if(matchMedia('(prefers-reduced-motion: reduce)').matches)splash.classList.add('no-motion');setTimeout(()=>splash.classList.add('splash-done'),2500);
render();v4Navigate('home',true);
// La recherche par ingrédients ne doit jamais modifier la présentation du planning.
showKitchen=function(){v4Navigate('kitchen');$('pantry').value=(state.pantry||[]).join(', ');renderPantry()};
$('settingsBtn').onclick=()=>settings();

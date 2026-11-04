/* Whats'Eat V4.4 — améliorations progressives sur la base stable V4.3 */
'use strict';
// Navigation permanente : la recherche n'est visible que sur l'accueil.
const v44Navigate=v4Navigate;
v4Navigate=function(screen,replace=false){v44Navigate(screen,replace);$('searchPanel').classList.toggle('hidden',screen!=='home');document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('nav-active',b.dataset.nav===screen));};
view=v4Navigate;
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{switch(b.dataset.nav){case 'planning':v4ShowPlanning();break;case 'shopping':showShopping();break;case 'kitchen':showKitchen();break;case 'settings':settings();break;default:v4ShowHome();}});
$('applyAdvanced').onclick=()=>{advancedOpen=false;$('advancedFilters').classList.add('hidden');$('advancedBtn').setAttribute('aria-expanded','false');render();};
// Garder les quatre boutons et les seuils EXACTS de V4.3.
// Rendre les couleurs des libellés plus contrastées.
// Les contributions sont des liens publics Stripe, aucun secret n'est stocké dans l'application.
const DONATIONS=[['🍵 1 thé','0,99 €','https://buy.stripe.com/3cIaEWbi8f3z8ZU9gbcjS00'],['🍵🍵 2 thés','1,99 €','https://buy.stripe.com/8x28wOgCs6x3a3Y9gbcjS01'],['🍵🍵🍵 3 thés','2,99 €','https://buy.stripe.com/7sY28qcmcg7D1xs2RNcjS02'],['🍵 10 thés','9,99 €','https://buy.stripe.com/aFa6oG1Hy2gNekefEzcjS03'],['🍵 Chaque mois','0,99 €/mois','https://buy.stripe.com/7sYcN41Hy8Fb1xsbojcjS04']];
const v441DonationLink=([label,price,url])=>`<a class="donation-link" href="${url}" target="_blank" rel="noopener noreferrer"><span>${label}</span><strong>${price.replace(/\s*€/,'&nbsp;€').replace('/mois',' / mois')}</strong></a>`;
$('donationOptions').innerHTML=`<section class="donation-group"><h4>💚 Soutien ponctuel</h4><p>Un paiement unique, sans abonnement ni renouvellement automatique.</p><div class="donation-oneoff">${DONATIONS.slice(0,4).map(v441DonationLink).join('')}</div></section><section class="donation-group donation-recurring"><h4>🔁 Soutien mensuel — abonnement</h4><p><strong>0,99 € prélevé chaque mois</strong>, avec renouvellement automatique jusqu’à résiliation.</p>${v441DonationLink(DONATIONS[4])}<p class="muted">Vous pouvez gérer ou résilier votre abonnement selon les modalités indiquées lors du paiement.</p></section>`;
// Planning sans créneaux : données conservées dans state.planner pour compatibilité et sauvegarde.
// Préfixe stable pour ne pas toucher aux anciens repas jusqu'à la première génération.
const V44_PREFIX='Recette-';
function v44Entries(){return Object.entries(state.planner||{}).filter(([key,id])=>id).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true}));}
function v44RenderPlanning(){
 const entries=v44Entries();$('planningProgress').textContent=`${entries.length} recette(s) · ${v4.weeklyPeople} personne(s)`;
 $('planner').innerHTML=entries.length?entries.map(([key,id],i)=>{const r=allRecipes().find(x=>x.id===id);if(!r)return '';const photo=safeUrl(r.image);return `<article class="v44-plan-card">${photo?`<img src="${esc(photo)}" alt="" loading="lazy">`:'<div class="v44-plan-placeholder">🍽️</div>'}<div class="v44-plan-body"><strong>${esc(r.title)}</strong><small>⏱ ${esc(r.minutes||'?')} min · ${v4.weeklyPeople} personnes</small><div class="v44-plan-actions"><button data-plan-open="${esc(id)}">Voir</button><button data-plan-select="${esc(key)}">Remplacer</button><button data-plan-remove="${esc(key)}" aria-label="Retirer">×</button></div></div></article>`}).join(''):'<p class="muted">Aucune recette programmée. Choisissez le nombre de recettes, puis générez votre planning.</p>';
}
v4RenderPlanning=v44RenderPlanning;
$('generatePlan').onclick=()=>{const count=Math.max(1,Math.min(14,Number($('weeklyCount').value)||5));v4.weeklyCount=count;const candidates=allRecipes().filter(r=>!v4.equipment.length||v4Compatible(r));if(!candidates.length)return alert('Aucune recette disponible.');if(v44Entries().length&&!confirm('Remplacer le planning actuel par une nouvelle sélection ?'))return;const shuffled=[...candidates];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}state.planner={};shuffled.slice(0,count).forEach((r,i)=>state.planner[V44_PREFIX+String(i+1).padStart(2,'0')]=r.id);save();v44RenderPlanning();};
let v44Replacing=null;
$('planner').onclick=e=>{const open=e.target.closest('[data-plan-open]'),remove=e.target.closest('[data-plan-remove]'),select=e.target.closest('[data-plan-select]');if(open){openRecipe(open.dataset.planOpen);return}if(remove){delete state.planner[remove.dataset.planRemove];save();v44RenderPlanning();return}if(select){v44Replacing=select.dataset.planSelect;v4ShowHome();$('search').focus();const hint=document.getElementById('v44PickHint');if(hint)hint.classList.remove('hidden');}};
const hint=document.createElement('div');hint.id='v44PickHint';hint.className='v44-pick-hint hidden';hint.innerHTML='<span>Choisissez une recette pour remplacer celle du planning.</span><button type="button" id="v44CancelPick">Annuler</button>';$('homeView').insertBefore(hint,$('homeView').firstChild);$('v44CancelPick').onclick=()=>{v44Replacing=null;hint.classList.add('hidden');v4ShowPlanning()};
const v44OpenRecipe=openRecipe;
openRecipe=function(id){if(v44Replacing){state.planner??={};state.planner[v44Replacing]=id;v44Replacing=null;hint.classList.add('hidden');save();v4ShowPlanning();return;}v44OpenRecipe(id)};
// Courses : modifier chaque quantité sans perdre les cases cochées.
renderShopping=function(){const list=state.shopping||[];$('shoppingList').innerHTML=list.length?list.map(x=>`<div class="shoppingrow v44-shopping-row"><input type="checkbox" data-shop="${esc(x.id)}" ${x.done?'checked':''} aria-label="Article acheté"><div class="v44-shop-text"><strong class="${x.done?'crossed':''}">${esc(x.name)}</strong></div><div class="v443-quantity-wrap"><input class="v44-qty" type="number" step="any" min="0" data-qty="${esc(x.id)}" value="${esc(x.quantity??'')}" aria-label="Quantité de ${esc(x.name)}"><span class="v443-unit">${esc(x.unit||'')}</span></div><button data-delshop="${esc(x.id)}" aria-label="Retirer">×</button></div>`).join(''):'<p>Ta liste de courses est vide.</p>';};
$('shoppingList').addEventListener('change',e=>{const id=e.target.dataset.qty;if(!id)return;const x=(state.shopping||[]).find(x=>x.id===id);if(x){const value=Number(e.target.value);if(Number.isFinite(value)&&value>=0){x.quantity=value;save();}else e.target.value=x.quantity;}},true);
$('shareShopping').onclick=async()=>{const lines=(state.shopping||[]).map(x=>`${x.done?'☑':'☐'} ${x.quantity??''} ${x.unit||''} ${x.name}`);const content='Ma liste de courses Whats’Eat\n\n'+lines.join('\n');if(navigator.share){try{await navigator.share({title:'Liste de courses Whats’Eat',text:content});return}catch(err){if(err.name==='AbortError')return;}}try{await navigator.clipboard.writeText(content);alert('Liste copiée : collez-la dans Notes ou une autre application.')}catch{window.prompt('Copiez votre liste :',content)}};
// Etats de boutons de la fiche recette, sans doubler les ajouts à la liste.
const v44RenderDetail=renderDetail;
renderDetail=function(){v44RenderDetail();const r=current;if(!r)return;const shop=$('addToShopping'),plan=$('addToPlanner');if(shop){const added=(state.v44ShoppingRecipes||[]).includes(r.id);shop.textContent=added?'✓ Déjà ajouté aux courses':'🛒 Ajouter aux courses';shop.classList.toggle('v44-added',added);shop.onclick=()=>{state.v44ShoppingRecipes??=[];if(state.v44ShoppingRecipes.includes(r.id)){showShopping();return;}addShopping(r,portions);state.v44ShoppingRecipes.push(r.id);save();shop.textContent='✓ Déjà ajouté aux courses';shop.classList.add('v44-added');};}if(plan){const found=v44Entries().find(([,id])=>id===r.id);if(found){plan.textContent='✓ Planifié · Modifier';plan.classList.add('v44-added');plan.onclick=()=>{v4ShowPlanning();};}}};
// Les anciennes confirmations natives sont conservées temporairement pour les actions destructives.
// Elles ne seront remplacées qu'avec une gestion asynchrone sûre de toutes les confirmations.
// Fenêtres d'information aux couleurs de l'application ; les confirmations restent natives par sécurité.
const v44Dialog=document.createElement('dialog');v44Dialog.id='v44Dialog';v44Dialog.innerHTML='<div class="v44-dialog-body"><h3>Whats’Eat</h3><p id="v44DialogText"></p><button class="primary" id="v44DialogClose">Compris</button></div>';document.body.append(v44Dialog);
$('v44DialogClose').onclick=()=>v44Dialog.close();
const v44NativeAlert=window.alert.bind(window);
window.alert=(message)=>{if(typeof v44Dialog.showModal!=='function')return v44NativeAlert(message);$('v44DialogText').textContent=String(message);if(!v44Dialog.open)v44Dialog.showModal();};
const v44ClearShopping=$('clearShopping').onclick;
$('clearShopping').onclick=()=>{const before=(state.shopping||[]).length;v44ClearShopping();if(before&&!(state.shopping||[]).length){state.v44ShoppingRecipes=[];save();}};
renderShopping();

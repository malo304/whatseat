/* Whats'Eat V4.5 — protections et nouveaux outils */
'use strict';
(function(){
 const el=id=>document.getElementById(id);
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const pantryKey='whatseat-pantry-v45';
 let stock=[];try{stock=JSON.parse(localStorage.getItem(pantryKey)||'[]');if(!Array.isArray(stock))stock=[];}catch{}
 const storeStock=()=>localStorage.setItem(pantryKey,JSON.stringify(stock));
 const format=n=>Number(n||0).toLocaleString('fr-FR');
 const getStock=(name,unit)=>stock.filter(x=>normalize(x.name)===normalize(name)&&normalize(x.unit)===normalize(unit)).reduce((n,x)=>n+Number(x.quantity||0),0);
 const ensurePanel=()=>{
  const root=el('kitchenView');if(!root||el('v45StockPanel'))return;
  const panel=document.createElement('section');panel.id='v45StockPanel';panel.className='panel';
  panel.innerHTML='<h3>Mon garde-manger</h3><p class="muted">Enregistre les produits et leurs quantités. La date est facultative.</p><form id="v45StockForm" class="v45-stock-form"><input name="name" placeholder="Ingrédient" aria-label="Ingrédient" required><input name="quantity" type="number" min="0" step="any" placeholder="Quantité" aria-label="Quantité" required><input name="unit" placeholder="Unité (g, ml, pièce...)" aria-label="Unité"><input name="expiry" type="date" aria-label="Date de péremption facultative"><button class="primary">Ajouter au stock</button></form><div id="v45StockItems"></div>';
  root.insertBefore(panel,root.firstElementChild.nextSibling);
  el('v45StockForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const name=String(f.get('name')||'').trim(),unit=String(f.get('unit')||'').trim(),qty=Number(f.get('quantity'));if(!name||!Number.isFinite(qty)||qty<0)return;stock.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,unit,quantity:qty,expiry:String(f.get('expiry')||'')});storeStock();e.currentTarget.reset();drawStock();};
  panel.addEventListener('click',e=>{const btn=e.target.closest('[data-stock-delete]');if(!btn)return;stock=stock.filter(x=>x.id!==btn.dataset.stockDelete);storeStock();drawStock();});drawStock();
 };
 function drawStock(){const target=el('v45StockItems');if(!target)return;target.innerHTML=stock.length?stock.map(x=>`<div class="v45-stock-item"><span><b>${esc(x.name)}</b> · ${format(x.quantity)} ${esc(x.unit)}${x.expiry?' · jusqu’au '+esc(x.expiry):''}</span><button type="button" data-stock-delete="${esc(x.id)}" aria-label="Supprimer">×</button></div>`).join(''):'<p class="muted">Aucun produit enregistré.</p>';}
 ensurePanel();
 // Full-width inline planning form; do not change the established recipe action buttons.
 const priorDetail=renderDetail;
 renderDetail=function(){priorDetail();const btn=el('addToPlanner'),actions=el('detailView')?.querySelector('.v444-action-grid');if(!btn||!actions||!current)return;
  btn.onclick=()=>{let panel=el('v45PlanForm');if(panel){panel.remove();return;}panel=document.createElement('div');panel.id='v45PlanForm';panel.className='panel v45-plan-form';
   const days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
   panel.innerHTML=`<h3>Ajouter au planning</h3><label>Jour<select id="v45PlanDay">${days.map(d=>`<option>${d}</option>`).join('')}</select></label><label>Repas<select id="v45PlanMeal"><option value="Midi">Déjeuner</option><option value="Soir">Dîner</option></select></label><div class="v45-plan-buttons"><button class="primary" id="v45PlanSave">Ajouter</button><button class="secondary" id="v45PlanCancel">Annuler</button></div>`;
   actions.insertAdjacentElement('afterend',panel);
   el('v45PlanCancel').onclick=()=>panel.remove();
   el('v45PlanSave').onclick=async()=>{const key=el('v45PlanDay').value+'-'+el('v45PlanMeal').value;const existing=state.planner?.[key];if(existing&&existing!==current.id){const ok=window.whatseatDialog?await window.whatseatDialog.confirm('Remplacer le repas déjà prévu ?', {title:'Planning'}):confirm('Remplacer le repas déjà prévu ?');if(!ok)return;}state.planner??={};state.planner[key]=current.id;save();panel.remove();toast('Recette ajoutée au planning !');};
  };
 };
 let toastTimer;
 function toast(message){let t=el('v45Toast');if(!t){t=document.createElement('div');t.id='v45Toast';t.setAttribute('role','status');document.body.append(t);}t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3000);}
 // Show stock next to every shopping item. No automatic deduction.
 const oldRenderShopping=renderShopping;
 renderShopping=function(){oldRenderShopping();el('shoppingList')?.querySelectorAll('.v44-shopping-row').forEach(row=>{const name=row.querySelector('.v44-shop-text strong')?.textContent||'';const unit=row.querySelector('.v443-unit')?.textContent||'';const amount=getStock(name,unit);const tag=document.createElement('small');tag.className='v45-available';tag.textContent=`En stock : ${format(amount)} ${unit}`;row.querySelector('.v44-shop-text')?.append(tag);});};
 const shoppingView=el('shoppingView');if(shoppingView&&!el('v45Finish')){const btn=document.createElement('button');btn.id='v45Finish';btn.className='primary';btn.textContent='✓ Terminer mes courses';shoppingView.querySelector('.rowbuttons')?.insertAdjacentElement('afterend',btn);btn.onclick=async()=>{
  const bought=(state.shopping||[]).filter(x=>x.done);if(!bought.length){toast('Coche les produits achetés avant de terminer.');return;}
  const ok=window.whatseatDialog?await window.whatseatDialog.confirm(`${bought.length} produit(s) coché(s) seront ajoutés au garde-manger et retirés de la liste. Les autres resteront à acheter.`,{title:'Terminer mes courses ?'}):confirm('Ajouter les produits achetés au garde-manger ?');if(!ok)return;
  for(const item of bought){const qty=Number(item.quantity);if(!Number.isFinite(qty)||qty<=0)continue;const found=stock.find(x=>normalize(x.name)===normalize(item.name)&&normalize(x.unit)===normalize(item.unit)&&!x.expiry);if(found)found.quantity=Number(found.quantity)+qty;else stock.push({id:String(Date.now())+Math.random(),name:item.name,unit:item.unit||'',quantity:qty,expiry:''});}
  storeStock();state.shopping=state.shopping.filter(x=>!x.done);state.v44ShoppingRecipes=[];save();renderShopping();drawStock();toast('Courses terminées ! Stock mis à jour.');
 };}
 // Export the remote catalogue from IndexedDB as well as all user data.
 const exportBtn=el('exportBtn');if(exportBtn)exportBtn.onclick=async()=>{let remote=state.remote;try{const cached=await catalogGet();if(cached.length>remote.length)remote=cached;}catch{}const data={...state,remote,pantryV45:stock,exportVersion:'4.5.0',exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='whatseat-sauvegarde-v4.5.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
 const importBtn=el('importBackup');if(importBtn){const oldImport=importBtn.onchange;importBtn.onchange=async e=>{const file=e.target.files?.[0];if(!file)return;let backup;try{backup=JSON.parse(await file.text());if(!Array.isArray(backup.personal)||!Array.isArray(backup.remote)||!Array.isArray(backup.favorites))throw Error('Format incorrect');}catch(err){alert('Sauvegarde invalide : '+err.message);return;}const ok=window.whatseatDialog?await window.whatseatDialog.confirm('Remplacer les données actuelles par cette sauvegarde ?', {title:'Restaurer une sauvegarde ?'}):confirm('Restaurer la sauvegarde ?');if(!ok)return;try{state={...defaults,...backup,syncUrl:'./recipes.json'};await catalogPut(state.remote);stock=Array.isArray(backup.pantryV45)?backup.pantryV45:[];storeStock();save();location.reload();}catch(err){alert('Importation impossible : '+err.message);}};}
 // A cooked recipe only suggests updating stock; never deduct silently.
 const oldDetailMade=renderDetail;
 renderDetail=function(){oldDetailMade();const box=el('madeRecipe');if(!box||!current)return;box.addEventListener('change',()=>{if(!box.checked||!stock.length)return;const recipe=current;const matched=(recipe.items||[]).map(item=>{const name=splitAmount(item).name||item.name;return {name,found:stock.find(x=>normalize(x.name)===normalize(name))};}).filter(x=>x.found);if(!matched.length)return;const ok=confirm('Cette recette est cuisinée. Souhaites-tu vérifier les quantités à retirer de ton garde-manger ?');if(!ok)return;const inputs=matched.map(({name,found})=>{const answer=prompt(`${name} : quantité utilisée (${found.unit||'unités'}) ? Stock : ${found.quantity}`, '0');return {found,used:answer===null?0:Number(answer)};});if(inputs.some(x=>!Number.isFinite(x.used)||x.used<0||x.used>Number(x.found.quantity))){alert('Quantités invalides ou supérieures au stock : aucune déduction.');return;}inputs.forEach(x=>x.found.quantity-=x.used);storeStock();drawStock();toast('Garde-manger mis à jour.');});};
 // Prefer recipes not cooked and previously rated well for random generation.
 const generate=el('generatePlan');if(generate){
  const opts=document.createElement('div');opts.className='v45-plan-preferences';opts.innerHTML='<h4>Personnaliser mes suggestions</h4><label><input type="checkbox" id="v45Avoid" checked> Éviter les recettes déjà cuisinées</label><label><input type="checkbox" id="v45Fav" checked> Privilégier mes favoris et recettes bien notées</label><label><input type="checkbox" id="v45Variety" checked> Varier les types de plats</label><label><input type="checkbox" id="v45Stock" checked> Privilégier les ingrédients disponibles</label>';
  generate.insertAdjacentElement('beforebegin',opts);
  const old=generate.cloneNode(true);generate.replaceWith(old);
  old.onclick=async()=>{
   const count=Math.max(1,Math.min(14,Number(el('weeklyCount').value)||5));v4.weeklyCount=count;
   if(v44Entries().length){const ok=window.whatseatDialog?await window.whatseatDialog.confirm('Remplacer les repas actuellement prévus ?', {title:'Générer mon planning ?'}):confirm('Remplacer les repas prévus ?');if(!ok)return;}
   const pool=allRecipes().filter(r=>!v4.equipment?.length||v4Compatible(r));if(!pool.length){toast('Aucune recette disponible.');return;}
   const avoid=el('v45Avoid').checked,fav=el('v45Fav').checked,variety=el('v45Variety').checked,useStock=el('v45Stock').checked;
   const candidates=pool.map(r=>{let score=Math.random()*4;
    if(avoid&&(state.made||{})[r.id])score-=5;
    if(fav&&state.favorites.includes(r.id))score+=2;
    if(fav&&Number((state.ratings||{})[r.id])>=4)score+=2;
    if(useStock){const ingredients=(r.items||[]).map(x=>normalize(splitAmount(x).name||x.name)).filter(Boolean);if(ingredients.length){const known=ingredients.filter(name=>stock.some(x=>normalize(x.name)===name));score+=3*known.length/ingredients.length;}}
    return {r,score};}).sort((a,b)=>b.score-a.score);
   const chosen=[],types=new Set();for(const item of candidates){if(chosen.length>=count)break;const type=foodTags(item.r).types[0]||'Autre';if(variety&&types.has(type)&&candidates.some(x=>!chosen.includes(x.r)&&!types.has(foodTags(x.r).types[0]||'Autre')))continue;chosen.push(item.r);types.add(type);}
   state.planner={};chosen.forEach((r,i)=>state.planner[V44_PREFIX+String(i+1).padStart(2,'0')]=r.id);save();v44RenderPlanning();toast('Planning personnalisé généré !');
  };
 }
 // Keep the approved splash art untouched.
 const version=el('settingsView')?.querySelector('.aboutpanel p');if(version)version.textContent='Version V4.5.0';
})();

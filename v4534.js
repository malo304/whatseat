/* Whats'Eat? V4.5.35 — allergies and ingredient exclusions. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const definitions = [
    {id:'gluten',label:'Gluten (blé, seigle, orge...)',terms:['gluten','ble','farine de ble','semoule de ble','seigle','orge','epeautre','triticale','malt','chapelure','pain','pates','couscous','boulgour']},
    {id:'crustaces',label:'Crustacés',terms:['crustace','crustaces','crevette','crevettes','crabe','tourteau','homard','langouste','langoustine','ecrevisse','gambas']},
    {id:'oeufs',label:'Œufs',terms:['oeuf','oeufs','blanc doeuf','jaune doeuf','albumine']},
    {id:'poissons',label:'Poissons',terms:['poisson','saumon','thon','cabillaud','morue','sardine','anchois','maquereau','truite','colin','lieu noir','surimi']},
    {id:'arachides',label:'Arachides',terms:['arachide','arachides','cacahuete','cacahuetes','beurre de cacahuete','huile darachide','peanut']},
    {id:'soja',label:'Soja',terms:['soja','tofu','tempeh','edamame','sauce soja','proteine de soja','lecithine de soja']},
    {id:'lait',label:'Lait / lactose',terms:['lait','lactose','creme fraiche','creme liquide','beurre','fromage','yaourt','yogourt','petit suisse','fromage blanc','mascarpone','ricotta','mozzarella','parmesan','emmental','cheddar','lactoserum','caseine','whey']},
    {id:'fruits-coque',label:'Fruits à coque',terms:['amande','amandes','noisette','noisettes','noix','noix de cajou','cajou','pistache','pistaches','pecan','noix de pecan','macadamia','noix du bresil','pignon de pin']},
    {id:'celeri',label:'Céleri',terms:['celeri','branche de celeri','celeri rave']},
    {id:'moutarde',label:'Moutarde',terms:['moutarde','graines de moutarde']},
    {id:'sesame',label:'Sésame',terms:['sesame','graines de sesame','huile de sesame','tahini','tahin']},
    {id:'sulfites',label:'Sulfites',terms:['sulfite','sulfites','dioxyde de soufre','e220','e221','e222','e223','e224','e225','e226','e227','e228']},
    {id:'lupin',label:'Lupin',terms:['lupin','farine de lupin']},
    {id:'mollusques',label:'Mollusques',terms:['mollusque','mollusques','moule','moules','huitre','huitres','calamar','calamars','seiche','seiches','poulpe','escargot','coquille saint jacques','palourde','palourdes','bigorneau']},
    {id:'champignons',label:'Champignons',terms:['champignon','champignons','champignon de paris','pleurote','pleurotes','shiitake','shitake','cepe','cepes','girolle','girolles','morille','morilles','chanterelle','chanterelles','portobello','enoki','bolet','bolets','truffe','truffes']}
  ];
  const DEFAULTS = {selected:[],custom:[],mode:'signal'};
  state.foodSafety = Object.assign({},DEFAULTS,state.foodSafety||{});
  state.foodSafety.selected = Array.isArray(state.foodSafety.selected)?state.foodSafety.selected.filter(id=>definitions.some(x=>x.id===id)):[];
  state.foodSafety.custom = Array.isArray(state.foodSafety.custom)?state.foodSafety.custom.filter(x=>typeof x==='string'&&x.trim()):[];
  if(!['signal','mask'].includes(state.foodSafety.mode))state.foodSafety.mode='signal';
  const settingsData = () => state.foodSafety;
  function recipeText(recipe){
    const parts=[recipe&&recipe.title,...((recipe&&recipe.items)||[]).map(x=>x&&x.name||x),...((recipe&&recipe.steps)||[]).map(x=>x&&x.text||'')];
    return normalize(parts.filter(Boolean).join(' '));
  }
  function containsTerm(text,term){
    const t=normalize(term); if(!t)return false;
    return (' '+text+' ').includes(' '+t+' ');
  }
  function conflicts(recipe){
    const text=recipeText(recipe), found=[];
    for(const def of definitions){
      if(!settingsData().selected.includes(def.id))continue;
      let hit=def.terms.some(term=>containsTerm(text,term));
      if(def.id==='lait'){
        const dairyText=text.replace(/\b(lait de coco|lait d amande|lait de soja|lait d avoine|lait de riz|lait de noisette)\b/g,'');
        hit=def.terms.some(term=>containsTerm(dairyText,term));
      }
      if(hit)found.push(def.label);
    }
    for(const term of settingsData().custom){if(containsTerm(text,term))found.push(term);}
    return [...new Set(found)];
  }
  const oldMatches = matches;
  matches = function(recipe){
    if(!oldMatches(recipe))return false;
    return settingsData().mode!=='mask' || conflicts(recipe).length===0;
  };
  if(typeof v4Compatible==='function'){
    const oldCompatible=v4Compatible;
    v4Compatible=function(recipe){return oldCompatible(recipe)&&(settingsData().mode!=='mask'||conflicts(recipe).length===0)};
  }
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderSafetySettings(){
    const root=$('settingsView'); if(!root || $('weFoodSafetyPanel'))return;
    const panel=document.createElement('section');panel.id='weFoodSafetyPanel';panel.className='panel we-food-safety';
    const checks=definitions.map(d=>'<label class="checkline"><input type="checkbox" data-we-allergen="'+d.id+'" '+(settingsData().selected.includes(d.id)?'checked':'')+'> '+d.label+'</label>').join('');
    panel.innerHTML='<h3>Allergies et ingrédients à éviter</h3><p class="muted">Sélectionne les allergènes à surveiller et ajoute tes propres ingrédients à exclure.</p><h4>Allergènes</h4><div class="we-food-safety-grid">'+checks+'</div><h4>Ingrédients personnalisés</h4><form class="we-food-custom-form" id="weFoodCustomForm"><input id="weFoodCustomInput" maxlength="50" placeholder="Ex. coriandre, champignons..." aria-label="Ingrédient à éviter"><button class="secondary" type="submit">Ajouter</button></form><div id="weFoodCustomList" class="we-food-custom-list"></div><h4>Recettes incompatibles</h4><label class="field">Comportement<select id="weFoodMode"><option value="signal">Signaler les recettes (les laisser visibles)</option><option value="mask">Masquer les recettes incompatibles</option></select></label><p class="we-food-safety-note"><strong>Information importante :</strong> ce contrôle recherche des mots-clés dans les ingrédients et les étapes renseignés. Il peut manquer un allergène, un ingrédient dérivé ou une information absente. Il ne vérifie pas les traces ni les contaminations croisées et ne garantit jamais qu’une recette est sans allergène. En cas d’allergie, vérifie toujours l’étiquette du produit et les informations du fabricant.</p>';
    const serving=root.querySelector('#defaultServings')&&root.querySelector('#defaultServings').closest('.panel');
    if(serving)serving.insertAdjacentElement('afterend',panel);else root.insertBefore(panel,root.firstChild);
    const drawCustom=()=>{
      const target=$('weFoodCustomList');if(!target)return;
      target.innerHTML=settingsData().custom.length?settingsData().custom.map((term,i)=>'<span class="we-food-chip">'+escapeHtml(term)+' <button type="button" data-we-remove="'+i+'" aria-label="Retirer '+escapeHtml(term)+'">×</button></span>').join(''):'<p class="muted">Aucun ingrédient personnalisé.</p>';
    };
    $('weFoodMode').value=settingsData().mode;drawCustom();
    panel.addEventListener('change',e=>{
      const box=e.target.closest('[data-we-allergen]');
      if(box){const id=box.dataset.weAllergen;settingsData().selected=box.checked?[...new Set([...settingsData().selected,id])]:settingsData().selected.filter(x=>x!==id);save();render();return;}
      if(e.target.id==='weFoodMode'){settingsData().mode=e.target.value;save();render();return;}
    });
    $('weFoodCustomForm').addEventListener('submit',e=>{
      e.preventDefault();const input=$('weFoodCustomInput'),term=input.value.trim();
      if(!term)return;
      if(!settingsData().custom.some(x=>normalize(x)===normalize(term)))settingsData().custom.push(term);
      input.value='';save();drawCustom();render();
    });
    $('weFoodCustomList').addEventListener('click',e=>{
      const button=e.target.closest('[data-we-remove]');if(!button)return;
      settingsData().custom.splice(Number(button.dataset.weRemove),1);save();drawCustom();render();
    });
  }
  const oldSettings=settings;
  settings=function(){oldSettings();renderSafetySettings();};
  const oldRender=render;
  render=function(){
    oldRender();
    if(settingsData().mode!=='signal')return;
    document.querySelectorAll('#results [data-open]').forEach(card=>{
      const recipe=allRecipes().find(r=>String(r.id)===card.dataset.open),hits=recipe?conflicts(recipe):[];
      const body=card.querySelector('.recipebody');if(!body||!hits.length)return;
      let warning=body.querySelector('.we-food-card-warning');
      if(!warning){warning=document.createElement('small');warning.className='we-food-card-warning';body.insertBefore(warning,body.querySelector('.recipefoot'));}
      warning.textContent='⚠ À vérifier : '+hits.join(', ');
    });
  };
  const oldDetail=renderDetail;
  renderDetail=function(){
    oldDetail();
    if(!current)return;
    const hits=conflicts(current);if(!hits.length)return;
    const note=document.createElement('aside');note.className='we-food-detail-warning';note.setAttribute('role','alert');
    note.innerHTML='<strong>⚠ Ingrédient(s) à surveiller : </strong>'+escapeHtml(hits.join(', '))+'<p>Vérifie la composition exacte des produits et les risques de traces ou de contamination croisée. Cette détection automatique n’est pas une garantie d’absence d’allergènes.</p>';
    $('detailView').querySelector('.we-food-detail-warning')?.remove();
    $('detailView').insertBefore(note,$('detailView').firstElementChild&&$('detailView').firstElementChild.nextSibling||null);
  };
  const style=document.createElement('style');
  style.textContent='.we-food-safety h4{margin:18px 0 8px;color:var(--text,#173b27);font-size:14px}.we-food-safety-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px}.we-food-custom-form{display:flex;gap:8px;align-items:center}.we-food-custom-form input{flex:1;min-width:0;border:1px solid var(--line,#cbd8cc);border-radius:10px;padding:11px;background:var(--surface,#fff);color:var(--text,#173b27)}.we-food-custom-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.we-food-chip{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:20px;background:var(--surface-2,#edf3ec);color:var(--text,#173b27);font-size:13px}.we-food-chip button{border:0;background:transparent;color:inherit;font-size:18px;line-height:1}.we-food-safety-note{margin-top:16px;padding:12px;border-radius:12px;background:var(--surface-2,#edf3ec);color:var(--text,#173b27);font-size:12px;line-height:1.5}.we-food-card-warning{display:block;margin-top:7px;color:#a05b18;font-weight:700;font-size:12px}.we-food-detail-warning{margin:12px 0;padding:14px;border:1px solid #d5a45b;border-radius:14px;background:#fff5e4;color:#684414;line-height:1.5}.we-food-detail-warning p{margin:7px 0 0;font-size:13px}html[data-we-theme="dark"] .we-food-detail-warning{background:#49391f;color:#f7e5c4;border-color:#80653a}@media(max-width:420px){.we-food-safety-grid{grid-template-columns:1fr}}';
  document.head.append(style);
  const settingsObserver=new MutationObserver(()=>{if(!$('weFoodSafetyPanel')&&$('settingsView')&&!$('settingsView').classList.contains('hidden'))renderSafetySettings()});
  const view=$('settingsView');if(view)settingsObserver.observe(view,{attributes:true,attributeFilter:['class']});
  if(!$('weFoodSafetyPanel') && $('settingsView') && !$('settingsView').classList.contains('hidden'))renderSafetySettings();
  const aboutVersion=$('settingsView')?.querySelector('.aboutpanel p');
  if(aboutVersion)aboutVersion.textContent='Version V4.5.35';
})();

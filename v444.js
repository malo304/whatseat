/* Whats'Eat V4.4.4 — interface et partage de recettes */
'use strict';
(function(){
 const icon=(name)=>`<img src="icons/${name}.svg" alt="" aria-hidden="true">`;
 const detailBefore444=renderDetail;
 function decorate(){
   const root=document.getElementById('detailView');if(!root||!current)return;
   const id=current.id;
   const title=root.querySelector('.detailtitle');
   if(title&&!root.querySelector('.v444-heading')){
     const wrap=document.createElement('div');wrap.className='v444-heading';title.parentNode.insertBefore(wrap,title);wrap.appendChild(title);
     const fav=document.getElementById('detailFav');
     if(fav){fav.classList.add('v444-favorite');fav.innerHTML=state.favorites.includes(id)?'♥':'♡';fav.setAttribute('aria-label',state.favorites.includes(id)?'Retirer des favoris':'Ajouter aux favoris');fav.setAttribute('title','Favoris');wrap.appendChild(fav);}
   }
   const shop=document.getElementById('addToShopping'),plan=document.getElementById('addToPlanner'),cook=document.getElementById('startCooking');
   if(!shop||!plan||!cook)return;
   const oldActions=shop.closest('.rowbuttons');
   if(!oldActions)return;
   oldActions.classList.add('v444-old-actions');
   if(!root.querySelector('.v444-main-action')){
     const main=document.createElement('div');main.className='v444-main-action';
     const secondary=document.createElement('div');secondary.className='v444-action-grid';
     oldActions.parentNode.insertBefore(main,oldActions);
     oldActions.parentNode.insertBefore(secondary,oldActions);
     main.appendChild(cook);cook.textContent='Commencer à cuisiner';cook.classList.add('v444-cook');
     const share=document.createElement('button');share.type='button';share.id='v444ShareRecipe';share.className='v444-action';share.innerHTML=icon('share-recipe')+'<span>Partager</span>';
     share.onclick=async()=>{
       const url=new URL(location.href);url.searchParams.set('recette',current.id);url.hash='';
       const text=`Découvrez « ${current.title} » sur Whats'Eat !`;
       if(navigator.share){try{await navigator.share({title:current.title,text,url:url.href});return;}catch(e){if(e.name==='AbortError')return;}}
       try{await navigator.clipboard.writeText(url.href);alert('Lien de la recette copié !');}
       catch(e){window.prompt('Copiez ce lien :',url.href);}
     };
     for(const [btn,ico,label] of [[shop,'add-courses','Courses'],[plan,'add-planning','Planning']]){
       btn.classList.remove('secondary','v44-added');btn.classList.add('v444-action');btn.innerHTML=icon(ico)+`<span>${label}</span>`;secondary.appendChild(btn);
     }
     secondary.appendChild(share);
     const edit=document.getElementById('editRecipe'),del=document.getElementById('deleteRecipe');
     if(edit||del){const extras=document.createElement('details');extras.className='v444-more';extras.innerHTML='<summary>Autres actions ···</summary>';if(edit)extras.appendChild(edit);if(del)extras.appendChild(del);oldActions.parentNode.insertBefore(extras,oldActions.nextSibling);}
     oldActions.remove();
   }
 }
 renderDetail=function(){detailBefore444();decorate();};
 // The URL is intentionally shareable: on startup open the requested recipe if in catalogue.
 const target=new URLSearchParams(location.search).get('recette');
 if(target){let tries=0;const lookup=setInterval(()=>{const found=allRecipes().some(r=>r.id===target);if(found){clearInterval(lookup);openRecipe(target);}else if(++tries>=25){clearInterval(lookup);}},400);}
})();

/* Whats'Eat V4.5.15 — sauvegarde complète et remise à zéro cohérente. */
'use strict';
(() => {
  const MAIN='whatseat-v2', PANTRY='whatseat-pantry-v45', TIMERS='whatseat-timers-v442', LEGACY='whatseat-active-timer-v342';
  const get=id=>document.getElementById(id);
  const read=(key,fallback)=>{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)};
  const validState=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Array.isArray(x.personal)&&Array.isArray(x.remote)&&Array.isArray(x.favorites);
  const validArray=x=>Array.isArray(x)&&x.length<=100000;
  const validate=backup=>{
    if(!backup||typeof backup!=='object'||Array.isArray(backup))throw Error('Format de sauvegarde incorrect.');
    const version=backup.format==='whatseat-backup'?backup.version:0;
    if(version!==0&&version!==1)throw Error('Version de sauvegarde non prise en charge.');
    const data=version===1?backup.data:backup;
    if(!validState(data))throw Error('Données principales manquantes ou invalides.');
    if(version===1&&(!validArray(backup.pantryStock)||!validArray(backup.timers)))throw Error('Stock ou minuteurs invalides.');
    return {data,pantryStock:version===1?backup.pantryStock:null,timers:version===1?backup.timers:null,version};
  };
  const notify=message=>{const status=get('syncStatus');if(status)status.textContent=message;else alert(message)};
  const exportButton=get('exportBtn'),importInput=get('importBackup'),resetButton=get('resetBtn');
  if(exportButton)exportButton.onclick=async()=>{
    try{
      const main=JSON.parse(JSON.stringify(state));
      // L'état courant peut omettre le catalogue : récupérer la copie IndexedDB.
      if(!Array.isArray(main.remote)||!main.remote.length){
        try{const cached=await catalogGet();if(cached.length)main.remote=cached;}catch(err){console.warn('Catalogue IndexedDB non accessible',err)}
      }
      const payload={format:'whatseat-backup',version:1,exportedAt:new Date().toISOString(),
        data:main,pantryStock:read(PANTRY,[]),timers:read(TIMERS,[])};
      validate(payload);
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='whatseat-sauvegarde-complete.json';document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
      notify('✓ Sauvegarde complète créée (recettes, préférences, stock et minuteurs).');
    }catch(err){notify('⚠ Export impossible : '+err.message)}
  };
  if(importInput)importInput.onchange=async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>50*1024*1024)throw Error('Fichier trop volumineux (50 Mo maximum).');
      const backup=validate(JSON.parse(await file.text()));
      const ask=window.whatseatDialog?.confirm
        ? await window.whatseatDialog.confirm('Remplacer les données actuelles par cette sauvegarde ?'+(backup.version===0?' Ancien format : le stock et les minuteurs actuels seront conservés.':''),{title:'Restaurer Whats’Eat ?',action:'Restaurer'})
        : confirm('Remplacer les données actuelles par cette sauvegarde ?');
      if(!ask)return;
      // Préparer le catalogue avant toute modification des préférences.
      await catalogPut(backup.data.remote);
      const next={...defaults,...backup.data,syncUrl:'./recipes.json'};
      const previous={main:localStorage.getItem(MAIN),pantry:localStorage.getItem(PANTRY),timers:localStorage.getItem(TIMERS)};
      try{
        localStorage.setItem(MAIN,JSON.stringify({...next,remote:[]}));
        if(backup.version===1){
          localStorage.setItem(PANTRY,JSON.stringify(backup.pantryStock));
          localStorage.setItem(TIMERS,JSON.stringify(backup.timers));
          localStorage.removeItem(LEGACY);
        }
      }catch(err){
        for(const [key,value] of [[MAIN,previous.main],[PANTRY,previous.pantry],[TIMERS,previous.timers]]){
          try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch(_){}
        }
        throw err;
      }
      location.reload();
    }catch(err){notify('⚠ Restauration impossible : '+err.message)}
    finally{importInput.value=''}
  };
  if(resetButton)resetButton.onclick=async()=>{
    const first=window.whatseatDialog?.confirm
      ? await window.whatseatDialog.confirm('Effacer les recettes personnelles, favoris, planning, courses, garde-manger, minuteurs et réglages de cet appareil ?', {title:'Réinitialiser Whats’Eat ?',action:'Continuer',danger:true})
      : confirm('Effacer toutes les données Whats’Eat de cet appareil ?');
    if(!first)return;
    const word=window.whatseatDialog?.prompt
      ? await window.whatseatDialog.prompt('Écris EFFACER pour confirmer.',{title:'Dernière confirmation',action:'Effacer',danger:true})
      : prompt('Écris EFFACER pour confirmer.');
    if(word!=='EFFACER')return;
    try{
      const db=await catalogDB();db.close();
      await new Promise((resolve,reject)=>{
        const request=indexedDB.deleteDatabase(CATALOG_DB);
        request.onsuccess=resolve;request.onerror=()=>reject(request.error);
        request.onblocked=()=>reject(Error('Ferme les autres onglets Whats’Eat puis réessaie.'));
      });
      for(const key of [MAIN,PANTRY,TIMERS,LEGACY])localStorage.removeItem(key);
      location.reload();
    }catch(err){notify('⚠ Réinitialisation interrompue : '+err.message)}
  };
})();

/* Whats'Eat? V4.5.27 — scanner de codes-barres et recherche Open Food Facts. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stockForm = $('v45StockForm');
  if (!stockForm || $('weBarcodeButton')) return;

  const style = document.createElement('style');
  style.textContent = `
    .we-barcode-launch{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;margin:0 0 12px;padding:13px 16px;border:1px solid #789b7b;border-radius:13px;background:#edf4eb;color:#173b27;font-weight:750;font-size:15px}
    .we-barcode-launch svg{width:23px;height:23px;flex:none}
    .we-barcode-overlay{position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;padding:16px;background:#07110bd9}
    .we-barcode-dialog{width:min(100%,440px);max-height:92dvh;overflow:auto;padding:20px;border-radius:20px;background:#f7faf5;color:#173b27;box-shadow:0 18px 60px #0006}
    .we-barcode-dialog h3{margin:0 0 8px;font-size:20px;color:#173b27}
    .we-barcode-dialog p{margin:0 0 14px;color:#526756;font-size:14px;line-height:1.45}
    .we-barcode-video-wrap{position:relative;overflow:hidden;min-height:190px;border-radius:14px;background:#101712}
    .we-barcode-video{display:block;width:100%;max-height:42dvh;object-fit:cover}
    .we-barcode-video-wrap:after{content:"";position:absolute;left:12%;right:12%;top:50%;height:2px;background:#a9d5ad;box-shadow:0 0 10px #a9d5ad}
    .we-barcode-status{min-height:22px;margin:10px 0!important}
    .we-barcode-manual{display:flex;gap:8px;margin-top:12px}
    .we-barcode-manual input{flex:1;min-width:0;padding:11px;border:1px solid #b8c9b8;border-radius:10px;background:#fff;color:#173b27}
    .we-barcode-manual button,.we-barcode-close{border:0;border-radius:10px;padding:11px 14px;background:#24583a;color:#fff;font-weight:700}
    .we-barcode-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
    .we-barcode-close{background:#dce8da;color:#173b27}
    html[data-we-theme="dark"] .we-barcode-launch{background:#2b4032!important;color:#e0eddf!important;border-color:#506b55!important}
    html[data-we-theme="dark"] .we-barcode-dialog{background:#24372b!important;color:#e8f0e8!important}
    html[data-we-theme="dark"] .we-barcode-dialog h3{color:#e8f0e8!important}
    html[data-we-theme="dark"] .we-barcode-dialog p{color:#b6c7b9!important}
    html[data-we-theme="dark"] .we-barcode-manual input{background:#17271d!important;color:#e8f0e8!important;border-color:#506b55!important}
    html[data-we-theme="dark"] .we-barcode-close{background:#304b38!important;color:#e0eddf!important}
    @media(prefers-reduced-motion:reduce){.we-barcode-overlay *{transition:none!important}}
  `;
  document.head.append(style);

  const launch=document.createElement('button');
  launch.type='button';launch.id='weBarcodeButton';launch.className='we-barcode-launch';
  launch.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M7 8v8m3-8v8m3-8v8m3-8v8m2-8v8"/></svg><span>Scanner un code-barres</span>';
  stockForm.insertAdjacentElement('beforebegin',launch);

  let overlay=null,reader=null,scannerLoading=null;
  function stopCamera(){
    try{reader?.reset?.();}catch{}
    reader=null;
    if(overlay){const video=overlay.querySelector('video');if(video?.srcObject)video.srcObject.getTracks().forEach(t=>t.stop());}
  }
  function close(){
    stopCamera();
    overlay?.remove();overlay=null;
  }
  function showStatus(message){const node=$('weBarcodeStatus');if(node)node.textContent=message;}
  async function loadScanner(){
    if(window.ZXingBrowser?.BrowserMultiFormatReader)return window.ZXingBrowser;
    if(scannerLoading)return scannerLoading;
    scannerLoading=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js';
      s.onload=()=>window.ZXingBrowser?resolve(window.ZXingBrowser):reject(new Error('Bibliothèque de scan indisponible'));
      s.onerror=()=>reject(new Error('Impossible de charger le lecteur de codes-barres'));
      document.head.append(s);
    });
    try{return await scannerLoading;}finally{scannerLoading=null;}
  }
  async function lookup(code){
    code=String(code||'').replace(/\D/g,'');
    if(!/^(\d{8}|\d{12,14})$/.test(code)){showStatus('Code-barres invalide. Vérifie les chiffres saisis.');return;}
    showStatus('Recherche du produit dans Open Food Facts…');
    try{
      const response=await fetch('https://world.openfoodfacts.org/api/v3/product/'+encodeURIComponent(code)+'.json?fields=product_name,product_name_fr,brands,quantity',{headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Service temporairement indisponible');
      const data=await response.json();
      const p=data.product||{};
      const name=String(p.product_name_fr||p.product_name||'').trim();
      if(Number(data.status)!==1||!name){
        showStatus('Produit introuvable. Tu peux saisir son nom manuellement dans le formulaire du frigo.');
        return;
      }
      const nameInput=stockForm.elements.namedItem('name');
      const qtyInput=stockForm.elements.namedItem('quantity');
      const unitInput=stockForm.elements.namedItem('unit');
      nameInput.value=name;
      if(!qtyInput.value)qtyInput.value='1';
      if(!unitInput.value)unitInput.value='pièce';
      close();
      nameInput.focus();
      const note=document.createElement('p');note.className='muted';note.textContent='Produit reconnu via Open Food Facts. Vérifie le nom, la quantité et ajoute sa date de péremption avant validation.';
      const previous=$('weBarcodeLookupNote');previous?.remove();note.id='weBarcodeLookupNote';
      stockForm.insertAdjacentElement('beforebegin',note);
      setTimeout(()=>note.remove(),9000);
    }catch(error){showStatus(error.message||'La recherche a échoué. Tu peux saisir le produit manuellement.');}
  }
  function open(){
    if(overlay)return;
    overlay=document.createElement('div');overlay.className='we-barcode-overlay';overlay.id='weBarcodeOverlay';
    overlay.innerHTML='<section class="we-barcode-dialog" role="dialog" aria-modal="true" aria-labelledby="weBarcodeTitle"><h3 id="weBarcodeTitle">Scanner un produit</h3><p>Place le code-barres devant la caméra. Le nom sera recherché dans Open Food Facts.</p><div class="we-barcode-video-wrap"><video class="we-barcode-video" id="weBarcodeVideo" muted playsinline></video></div><p class="we-barcode-status" id="weBarcodeStatus" role="status">Préparation de la caméra…</p><div class="we-barcode-manual"><input id="weBarcodeManual" inputmode="numeric" autocomplete="off" placeholder="Ou saisir le code-barres" aria-label="Code-barres manuel"><button type="button" id="weBarcodeSearch">Rechercher</button></div><div class="we-barcode-actions"><button type="button" class="we-barcode-close" id="weBarcodeClose">Fermer</button></div></section>';
    document.body.append(overlay);
    $('weBarcodeClose').addEventListener('click',close);
    $('weBarcodeSearch').addEventListener('click',()=>lookup($('weBarcodeManual').value));
    $('weBarcodeManual').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookup(e.currentTarget.value);}});
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    startCamera();
  }
  async function startCamera(){
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('La caméra nécessite un navigateur compatible et une connexion HTTPS. Tu peux saisir le code-barres ci-dessous.');
      showStatus('Activation de la caméra…');
      const ZX=await loadScanner();
      if(!overlay)return;
      reader=new ZX.BrowserMultiFormatReader();
      await reader.decodeFromVideoDevice(undefined,$('weBarcodeVideo'),(result,error)=>{
        if(result){const code=result.getText();showStatus('Code détecté : '+code);stopCamera();lookup(code);}
      });
      if(overlay)showStatus('Vise le code-barres au centre de l’image.');
    }catch(error){showStatus((error.message||'Caméra indisponible')+' Saisis le code-barres ci-dessous pour continuer.');}
  }
  launch.addEventListener('click',open);
})();
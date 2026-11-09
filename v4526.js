/* Whats'Eat? V4.5.26 — alertes de péremption du garde-manger. */
'use strict';
(() => {
  const STOCK_KEY = 'whatseat-pantry-v45';
  const HORIZON_DAYS = 2;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
    const [y,m,d] = value.split('-').map(Number);
    const date = new Date(y,m-1,d,12,0,0,0);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const startToday = () => { const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12); };
  const dayDiff = (a,b) => Math.round((a.getTime()-b.getTime())/86400000);
  function readStock() {
    try { const list=JSON.parse(localStorage.getItem(STOCK_KEY)||'[]'); return Array.isArray(list)?list:[]; }
    catch { return []; }
  }
  function classify(stock) {
    const today=startToday();
    return stock.filter(x=>x && x.expiry && localDate(x.expiry)).map(x=>{
      const expiry=localDate(x.expiry), days=dayDiff(expiry,today);
      return {...x,days};
    }).filter(x=>x.days<=HORIZON_DAYS).sort((a,b)=>a.days-b.days || String(a.name).localeCompare(String(b.name),'fr'));
  }
  const displayDate = value => { const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : String(value||''); };
  const dateLabel = days => days<0 ? 'Périmé depuis '+Math.abs(days)+' jour(s)' : days===0 ? 'À consommer aujourd’hui' : days===1 ? 'Expire demain' : 'Expire dans 2 jours';
  function ensureUI() {
    if (!$('weExpiryBanner')) {
      const header=document.querySelector('#app > header.top');
      if(header){
        const banner=document.createElement('aside');
        banner.id='weExpiryBanner';banner.className='we-expiry-banner hidden';banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');
        banner.innerHTML='<div class="we-expiry-copy"><strong id="weExpiryTitle">À surveiller</strong><span id="weExpirySummary"></span></div><button type="button" id="weExpiryOpen">Voir mon frigo</button>';
        header.insertAdjacentElement('afterend',banner);
        $('weExpiryOpen').addEventListener('click',()=>{const nav=document.querySelector('[data-nav="kitchen"]');if(nav)nav.click();else document.getElementById('fridgeBtn')?.click();});
      }
    }
    const kitchen=$('kitchenView');
    if(kitchen && !$('weExpiryPanel')){
      const panel=document.createElement('section');panel.id='weExpiryPanel';panel.className='panel we-expiry-panel';
      panel.innerHTML='<h3>Dates à surveiller</h3><p class="muted">Les aliments qui expirent dans les 48 prochaines heures ou qui sont déjà périmés apparaissent ici.</p><div id="weExpiryList"></div>';
      const stockPanel=$('v45StockPanel');
      if(stockPanel) stockPanel.insertAdjacentElement('beforebegin',panel);
      else kitchen.insertBefore(panel,kitchen.firstElementChild?.nextSibling||null);
    }
  }
  function refresh() {
    ensureUI();
    const alerts=classify(readStock());
    const expired=alerts.filter(x=>x.days<0), upcoming=alerts.filter(x=>x.days>=0);
    const banner=$('weExpiryBanner');
    if(banner){
      banner.classList.toggle('hidden',alerts.length===0);
      if(alerts.length){
        $('weExpiryTitle').textContent=expired.length ? expired.length+' aliment(s) périmé(s)' : 'Péremption à surveiller';
        $('weExpirySummary').textContent=upcoming.length+' à consommer bientôt · '+expired.length+' périmé(s)';
      }
    }
    const list=$('weExpiryList');
    if(list){
      list.innerHTML=alerts.length?alerts.map(x=>'<div class="we-expiry-row '+(x.days<0?'is-expired':'is-soon')+'"><div><strong>'+esc(x.name)+'</strong><small>'+esc(dateLabel(x.days))+' · '+esc(displayDate(x.expiry))+'</small></div><span>'+esc(x.quantity)+' '+esc(x.unit)+'</span></div>').join(''):'<p class="muted">Aucun aliment à consommer en priorité. Les alertes apparaîtront ici 48 heures avant la date indiquée.</p>';
    }
  }
  const style=document.createElement('style');
  style.textContent=`
    .we-expiry-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 16px;padding:12px 14px;border:1px solid #d4a65b;border-radius:14px;background:#fff6e6;color:#583b14}
    .we-expiry-banner.hidden{display:none!important}
    .we-expiry-copy{display:flex;flex-direction:column;gap:3px;min-width:0}
    .we-expiry-copy strong{font-size:14px}
    .we-expiry-copy span{font-size:12px}
    .we-expiry-banner button{flex:none;border:0;border-radius:10px;padding:9px 11px;background:#76501f;color:#fff;font-weight:700}
    .we-expiry-panel{border-color:#d8c49f}
    .we-expiry-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--line,#ddd)}
    .we-expiry-row:last-child{border-bottom:0}
    .we-expiry-row>div{display:flex;flex-direction:column;gap:4px;min-width:0}
    .we-expiry-row strong{color:var(--text,#173b27)}
    .we-expiry-row small{font-size:12px;color:var(--muted,#647568)}
    .we-expiry-row>span{font-size:13px;white-space:nowrap}
    .we-expiry-row.is-expired strong,.we-expiry-row.is-expired small{color:#b33d45}
    .we-expiry-row.is-soon strong{color:#96621b}
    html[data-we-theme="dark"] .we-expiry-banner{background:#49391f!important;border-color:#80653a!important;color:#f6e6c6!important}
    html[data-we-theme="dark"] .we-expiry-banner button{background:#a77a36!important;color:#fff!important}
    html[data-we-theme="dark"] .we-expiry-panel{background:#24372b!important;border-color:#80653a!important}
    html[data-we-theme="dark"] .we-expiry-row{border-color:#435d49!important}
    html[data-we-theme="dark"] .we-expiry-row strong{color:#e8f0e8!important}
    html[data-we-theme="dark"] .we-expiry-row.is-expired strong,html[data-we-theme="dark"] .we-expiry-row.is-expired small{color:#ff9b9f!important}
    html[data-we-theme="dark"] .we-expiry-row.is-soon strong{color:#f1c77d!important}
  `;
  document.head.append(style);
  refresh();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.addEventListener('pageshow',refresh);
  window.addEventListener('focus',refresh);
  setInterval(refresh,60000);
})();
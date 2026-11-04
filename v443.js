/* Whats'Eat V4.4.3 — démarrage fiable, sans modifier les données utilisateur. */
'use strict';
(() => {
  const search=document.getElementById('searchPanel');
  if(search){
    const sync=()=>{const home=document.getElementById('homeView');search.classList.toggle('hidden',!home||home.classList.contains('hidden'));};
    sync();
    // L'observateur suit les changements d'écran, y compris les retours de navigation.
    const home=document.getElementById('homeView');
    if(home)new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['class']});
  }
})();

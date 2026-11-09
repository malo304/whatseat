/* Whats'Eat? V4.5.24 — thème clair, sombre et automatique. */
'use strict';
(() => {
  if (typeof state !== 'object' || typeof save !== 'function') return;

  const KEY = 'appearance';
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const style = document.createElement('style');
  style.id = 'weAppearanceStyles';
  style.textContent = `
    #settingsView .we-appearance-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
    #settingsView .we-appearance-option{min-width:0;min-height:104px;padding:12px 5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;border:1px solid #9bb79c;border-radius:12px;background:#f5f8f4;color:#173b27;font-weight:700;font-size:clamp(10px,3vw,13px)}
    #settingsView .we-appearance-icon{width:38px;height:38px;display:block;flex:none}\n    #settingsView .we-appearance-option span{display:block;line-height:1.2}\n    #settingsView .we-appearance-option[aria-pressed="true"]{background:#24583a;border-color:#24583a;color:#fff;box-shadow:0 0 0 2px #a9c5a6}
    #settingsView .we-appearance-option:focus-visible{outline:3px solid #6d9d72;outline-offset:2px}
    html[data-we-theme="dark"]{color-scheme:dark;--bg:#17251c;--card:#24372b;--card2:#2b4032;--line:#435d49;--text:#e8f0e8;--muted:#b2c2b5}
    html[data-we-theme="dark"],html[data-we-theme="dark"] body{background:#17251c!important;color:#e8f0e8!important}
    html[data-we-theme="dark"] body{background:linear-gradient(135deg,#1b2d21 0%,#142219 100%) fixed!important}
    html[data-we-theme="dark"] #app,html[data-we-theme="dark"] #main{color:#e8f0e8}
    html[data-we-theme="dark"] h1,html[data-we-theme="dark"] h2,html[data-we-theme="dark"] h3,html[data-we-theme="dark"] h4,
    html[data-we-theme="dark"] .brand h1,html[data-we-theme="dark"] .detailtitle,html[data-we-theme="dark"] .resultshead h2,
    html[data-we-theme="dark"] .filters h2,html[data-we-theme="dark"] .panel h2,html[data-we-theme="dark"] .panel h3,
    html[data-we-theme="dark"] .panel h4,html[data-we-theme="dark"] #detailView h1,html[data-we-theme="dark"] #detailView h2,
    html[data-we-theme="dark"] #settingsView .field,html[data-we-theme="dark"] #settingsView label,
    html[data-we-theme="dark"] #kitchenView .pantryresult button,html[data-we-theme="dark"] .filters label{color:#e0eddf!important}
    html[data-we-theme="dark"] p,html[data-we-theme="dark"] li,html[data-we-theme="dark"] .meta,
    html[data-we-theme="dark"] .muted,html[data-we-theme="dark"] .status,html[data-we-theme="dark"] .recipefoot,
    html[data-we-theme="dark"] .recipe-source,html[data-we-theme="dark"] .plan-day em{color:#b6c7b9}
     html[data-we-theme="dark"] .donation-group p{color:#c6d7c9!important}
    html[data-we-theme="dark"] .panel,html[data-we-theme="dark"] .recipe,html[data-we-theme="dark"] .filters,
    html[data-we-theme="dark"] .searchbox,html[data-we-theme="dark"] .v44-plan-card,html[data-we-theme="dark"] .donation-group,
    html[data-we-theme="dark"] .donation-panel,html[data-we-theme="dark"] .v442-donation-card,
    html[data-we-theme="dark"] .step,html[data-we-theme="dark"] .slot-choice,html[data-we-theme="dark"] .plan-recipe,
    html[data-we-theme="dark"] .v44-pick-hint,html[data-we-theme="dark"] .empty,html[data-we-theme="dark"] .v442-dialog-inner,
    html[data-we-theme="dark"] #v44Dialog,html[data-we-theme="dark"] #v442Dialog,
    html[data-we-theme="dark"] #v442TimerDock{background:#24372b!important;color:#e8f0e8!important;border-color:#435d49!important}
    html[data-we-theme="dark"] .recipebody,html[data-we-theme="dark"] #detailView,html[data-we-theme="dark"] #cookContent,
    html[data-we-theme="dark"] #editorView{color:#e8f0e8!important}
    html[data-we-theme="dark"] .recipe h3,html[data-we-theme="dark"] .v44-plan-body strong,
    html[data-we-theme="dark"] .v442-dialog-inner h3,html[data-we-theme="dark"] .v442-donation-title{color:#e0eddf!important}
    html[data-we-theme="dark"] .searchbox,html[data-we-theme="dark"] #searchPanel,
    html[data-we-theme="dark"] #searchPanel input,html[data-we-theme="dark"] #settingsView input,
    html[data-we-theme="dark"] #settingsView textarea,html[data-we-theme="dark"] #settingsView select,
    html[data-we-theme="dark"] #editorView #recipeForm,html[data-we-theme="dark"] #editorView #recipeForm input,
    html[data-we-theme="dark"] #editorView #recipeForm textarea,html[data-we-theme="dark"] #editorView #recipeForm select,
    html[data-we-theme="dark"] #pantry,html[data-we-theme="dark"] .field input,
    html[data-we-theme="dark"] .field textarea,html[data-we-theme="dark"] .field select,
    html[data-we-theme="dark"] .v44-qty,html[data-we-theme="dark"] #v442DialogInput,
    html[data-we-theme="dark"] .we-recipe-notes textarea{background:#17271d!important;color:#e8f0e8!important;border-color:#506b55!important}
    html[data-we-theme="dark"] input::placeholder,html[data-we-theme="dark"] textarea::placeholder,
    html[data-we-theme="dark"] #searchPanel input::placeholder{color:#a8b9aa!important}
    html[data-we-theme="dark"] .fridge-cta,html[data-we-theme="dark"] .quick-times button,
    html[data-we-theme="dark"] .v44-plan-actions button,html[data-we-theme="dark"] .plan-change,
    html[data-we-theme="dark"] .plan-remove,html[data-we-theme="dark"] .v444-action,
    html[data-we-theme="dark"] #detailView .v444-favorite{background:#2b4032!important;color:#e0eddf!important;border-color:#506b55!important}
    html[data-we-theme="dark"] .quick-times button.active,html[data-we-theme="dark"] .quick-times button:active{background:#315f40!important;color:#fff!important}
    html[data-we-theme="dark"] #settingsView .we-appearance-option:not([aria-pressed="true"]){background:#2b4032!important;color:#e0eddf!important;border-color:#506b55!important}
    html[data-we-theme="dark"] .favorites-pill{background:#553744!important;color:#ffd8e3!important;border-color:#815365!important}
    html[data-we-theme="dark"] .made-pill{background:#2c4936!important;color:#d8efda!important;border-color:#54775a!important}
    html[data-we-theme="dark"] .recommend-pill{background:#353c5b!important;color:#e1e4ff!important;border-color:#555d83!important}
    html[data-we-theme="dark"] .bottom-nav{background:#182a20!important;box-shadow:0 -3px 14px #0008}
    html[data-we-theme="dark"] .bottom-nav button{color:#b8c9bb}
    html[data-we-theme="dark"] .bottom-nav button.nav-active{background:#31533b!important;color:#e0f4b4!important}
    html[data-we-theme="dark"] .primary,html[data-we-theme="dark"] #applyAdvanced,
    html[data-we-theme="dark"] #editorView #recipeForm button[type="submit"]{background:#43865b!important;color:#fff!important;border-color:#6ca77c!important}
    html[data-we-theme="dark"] .secondary,html[data-we-theme="dark"] .filebutton,
    html[data-we-theme="dark"] #settingsView .rowbuttons .filebutton{background:#304b38!important;color:#e0eddf!important;border-color:#58765e!important}
    html[data-we-theme="dark"] .subtle{background:#304b38!important;color:#d7e8d9!important}
    html[data-we-theme="dark"] .back,html[data-we-theme="dark"] .iconbtn{color:#dcebdc!important;background:#293e30!important;border-color:#506b55!important}
    html[data-we-theme="dark"] .plan-line select,html[data-we-theme="dark"] .shoppingrow,
    html[data-we-theme="dark"] .plan-day,html[data-we-theme="dark"] .checklist li,
    html[data-we-theme="dark"] .v44-shopping-row{border-color:#435d49!important}
    html[data-we-theme="dark"] .v44-plan-card img,html[data-we-theme="dark"] .v44-plan-placeholder{background:#304b38!important}
    html[data-we-theme="dark"] .donation-link,html[data-we-theme="dark"] .donation-recurring,
    html[data-we-theme="dark"] .donation-oneoff{background:#2b4032!important;color:#e0eddf!important;border-color:#506b55!important}
    html[data-we-theme="dark"] .donation-link strong,html[data-we-theme="dark"] .donation-group h4{color:#e0eddf!important}
    html[data-we-theme="dark"] #v442Dialog::backdrop,html[data-we-theme="dark"] #v44Dialog::backdrop{background:#000b}
    html[data-we-theme="dark"] #supportOverlay{background:#17251c!important;color:#e8f0e8!important}
    html[data-we-theme="dark"] #supportOverlay .support-top{background:#243b2b!important}
    html[data-we-theme="dark"] #supportOverlay .card{background:#24372b!important;color:#e8f0e8!important}
    html[data-we-theme="dark"] #supportOverlay .muted,html[data-we-theme="dark"] #supportOverlay small{color:#b6c7b9!important}
    html[data-we-theme="dark"] #supportOverlay a{color:#a9d5ad!important}
    html[data-we-theme="dark"] #supportOverlay input:not([type=checkbox]),html[data-we-theme="dark"] #supportOverlay select,
    html[data-we-theme="dark"] #supportOverlay textarea{background:#17271d!important;color:#e8f0e8!important;border-color:#506b55!important}
    html[data-we-theme="dark"] #supportOverlay .support-back{color:#e0eddf!important}
    html[data-we-theme="dark"] .v442-clock,html[data-we-theme="dark"] .v442-timer small{color:#c5d6c8!important}
    
     /* Audit global de contraste — textes et composants hérités du thème clair. */
     html[data-we-theme="dark"] #detailView .step{background:#24372b!important;border-color:#435d49!important;color:#e8f0e8!important}
     html[data-we-theme="dark"] #detailView .step h4,html[data-we-theme="dark"] #detailView .step p{color:#dce9dd!important}
     html[data-we-theme="dark"] #detailView .we-recipe-notes label.field{color:#e0eddf!important}
     html[data-we-theme="dark"] .v43-more p{color:#c6d7c9!important}
     html[data-we-theme="dark"] .v44-plan-body strong{color:#e0eddf!important}
     html[data-we-theme="dark"] .v44-plan-body small,html[data-we-theme="dark"] .v44-shop-text small,html[data-we-theme="dark"] .v443-unit{color:#b6c7b9!important}
     html[data-we-theme="dark"] .v44-plan-actions button,html[data-we-theme="dark"] .v44-pick-hint button{background:#304b38!important;color:#e0eddf!important;border-color:#58765e!important}
     html[data-we-theme="dark"] .v44-pick-hint{background:#293e30!important;color:#e0eddf!important;border-color:#58765e!important}
     html[data-we-theme="dark"] .v44-added{background:#315b3b!important;color:#e3f1df!important;border-color:#638b68!important}
     html[data-we-theme="dark"] #startTimer{background:#304b38!important;color:#e0eddf!important;border-color:#58765e!important}
     html[data-we-theme="dark"] .v442-plan-day{color:#c6d7c9!important}
     html[data-we-theme="dark"] .v442-done{color:#ffaaa0!important}
     html[data-we-theme="dark"] .v442-donation-card{background:#24372b!important;color:#e8f0e8!important;border-color:#506b55!important}
     html[data-we-theme="dark"] .v442-donation-card p,html[data-we-theme="dark"] .v442-donation-card small{color:#c6d7c9!important}
     html[data-we-theme="dark"] #v442TimerDock .v442-timer button[data-timer-toggle]{background:#304b38!important;color:#e0eddf!important;border-color:#58765e!important}
     html[data-we-theme="dark"] #v442TimerDock .v442-timer button[data-timer-delete]{background:#493238!important;color:#ffc4c4!important;border-color:#80535a!important}
     html[data-we-theme="dark"] #detailView .v444-action{background:#2b4032!important;color:#e0eddf!important;border-color:#506b55!important}
     html[data-we-theme="dark"] #detailView .v444-more{color:#c6d7c9!important}
     html[data-we-theme="dark"] #editorView #recipeForm .field{color:#e0eddf!important}
     html[data-we-theme="dark"] #editorView #recipeForm{background:#24372b!important;border-color:#435d49!important}
     html[data-we-theme="dark"] #editorView #recipeForm input,html[data-we-theme="dark"] #editorView #recipeForm textarea,html[data-we-theme="dark"] #editorView #recipeForm select{background:#17271d!important;color:#e8f0e8!important;border-color:#506b55!important}
     html[data-we-theme="dark"] .planning-controls label,html[data-we-theme="dark"] .checkline,html[data-we-theme="dark"] .equipment-choices label{color:#e0eddf!important}
     html[data-we-theme="dark"] .v45-plan-preferences{background:#293e30!important;color:#e0eddf!important;border:1px solid #435d49}
     html[data-we-theme="dark"] .v45-plan-form label,html[data-we-theme="dark"] .v45-stock-form .v451-expiry-field{color:#e0eddf!important}
     html[data-we-theme="dark"] .v45-stock-item{border-color:#435d49!important;color:#e0eddf!important}
     html[data-we-theme="dark"] .v45-available{color:#b9d9bd!important}
     html[data-we-theme="dark"] .v45-stock-form .v451-expiry-field input[type="date"]{background:#17271d!important;color:#e8f0e8!important;border-color:#506b55!important;color-scheme:dark}
     html[data-we-theme="dark"] .we-food-card-warning{color:#f1c77d!important}
     html[data-we-theme="dark"] .we-season-note{color:#b6c7b9!important}
     html[data-we-theme="dark"] #kitchenView .pantryresult button,html[data-we-theme="dark"] #kitchenView .pantryresult span{color:#e0eddf!important}
@media(prefers-reduced-motion:reduce){html[data-we-theme="dark"] *{transition:none!important}}
  `;
  document.head.append(style);

  function effectiveTheme() {
    const choice = state[KEY] || 'light';
    return choice === 'system' ? (media && media.matches ? 'dark' : 'light') : choice;
  }
  function applyTheme() {
    const theme = effectiveTheme();
    root.dataset.weTheme = theme;
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#17251c' : '#A9C5A6');
    document.querySelectorAll('#weAppearanceOptions .we-appearance-option').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.appearance === (state[KEY] || 'light')));
    });
  }
  function setAppearance(value) {
    if (!['light', 'dark', 'system'].includes(value)) return;
    state[KEY] = value;
    save();
    applyTheme();
  }

  const heading = document.querySelector('#settingsView > h2');
  if (heading && !document.getElementById('weAppearancePanel')) {
    const panel = document.createElement('section');
    panel.id = 'weAppearancePanel';
    panel.className = 'panel';
    panel.innerHTML = '<h3>Apparence</h3><p class="muted">Choisis le thème de Whats’Eat. Le mode automatique suit les réglages d’apparence de ton appareil.</p><div class="we-appearance-options" id="weAppearanceOptions" role="group" aria-label="Thème de l’application"><button type="button" class="we-appearance-option" data-appearance="light" aria-pressed="false"><svg class="we-appearance-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.86 9.86l4.24 4.24m19.8 19.8 4.24 4.24m0-28.28-4.24 4.24m-19.8 19.8-4.24 4.24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg><span>Clair</span></button><button type="button" class="we-appearance-option" data-appearance="dark" aria-pressed="false"><svg class="we-appearance-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M34.5 29.5A17 17 0 0 1 18.5 7.2 17.5 17.5 0 1 0 40.8 29a16.8 16.8 0 0 1-6.3.5Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Sombre</span></button><button type="button" class="we-appearance-option" data-appearance="system" aria-pressed="false"><svg class="we-appearance-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="15" y="4" width="18" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M22 38h4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>Automatique</span></button></div>';
    heading.insertAdjacentElement('afterend', panel);
    panel.addEventListener('click', event => {
      const button = event.target.closest('[data-appearance]');
      if (button) setAppearance(button.dataset.appearance);
    });
  }

  if (media) {
    const onChange = () => { if ((state[KEY] || 'light') === 'system') applyTheme(); };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }
  const version = document.querySelector('#settingsView .aboutpanel p');
  if (version) version.textContent = 'Version V4.5.24';
  applyTheme();
})();
/* Logo d’en-tête éclairci uniquement en mode sombre. */
html[data-we-theme="dark"] .top .brand .wordmark-img{filter:brightness(1.45) saturate(.92)}

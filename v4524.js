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
    #settingsView .we-appearance-option{min-width:0;padding:11px 5px;border:1px solid #9bb79c;border-radius:12px;background:#f5f8f4;color:#173b27;font-weight:700;font-size:13px}
    #settingsView .we-appearance-option[aria-pressed="true"]{background:#24583a;border-color:#24583a;color:#fff;box-shadow:0 0 0 2px #a9c5a6}
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
    panel.innerHTML = '<h3>Apparence</h3><p class="muted">Choisis le thème de Whats’Eat. Le mode automatique suit les réglages d’apparence de ton appareil.</p><div class="we-appearance-options" id="weAppearanceOptions" role="group" aria-label="Thème de l’application"><button type="button" class="we-appearance-option" data-appearance="light" aria-pressed="false">☀️ Clair</button><button type="button" class="we-appearance-option" data-appearance="dark" aria-pressed="false">🌙 Sombre</button><button type="button" class="we-appearance-option" data-appearance="system" aria-pressed="false">📱 Auto</button></div>';
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
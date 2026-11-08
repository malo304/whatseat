/* Whats'Eat V4.5.23 — notes personnelles sur chaque recette. */
'use strict';
(() => {
  if (typeof renderDetail !== 'function' || typeof state !== 'object') return;

  state.recipeNotes = state.recipeNotes && typeof state.recipeNotes === 'object'
    ? state.recipeNotes : {};

  const previousRenderDetail = renderDetail;
  renderDetail = function () {
    previousRenderDetail();
    const recipe = current;
    const detail = document.getElementById('detailView');
    if (!recipe || !detail || detail.querySelector('#weRecipeNotes')) return;

    const id = String(recipe.id);
    const panel = document.createElement('section');
    panel.id = 'weRecipeNotes';
    panel.className = 'panel we-recipe-notes';
    panel.innerHTML = `
      <h3>Mes notes personnelles</h3>
      <p class="muted">Ajoute tes astuces, modifications ou remarques pour cette recette. Cette note reste privée sur cet appareil.</p>
      <label class="field" for="weRecipeNoteText">Ma note
        <textarea id="weRecipeNoteText" maxlength="2000" rows="4" placeholder="Ex. : mettre un peu moins de sel, ajouter du parmesan…"></textarea>
      </label>
      <div class="rowbuttons">
        <button type="button" class="primary" id="weSaveRecipeNote">Enregistrer ma note</button>
        <button type="button" class="secondary" id="weClearRecipeNote">Effacer</button>
      </div>
      <p class="muted" id="weRecipeNoteStatus" role="status" aria-live="polite"></p>
    `;

    const actions = detail.querySelector('.rowbuttons');
    if (actions) actions.insertAdjacentElement('afterend', panel);
    else detail.append(panel);

    const textarea = panel.querySelector('#weRecipeNoteText');
    const status = panel.querySelector('#weRecipeNoteStatus');
    textarea.value = typeof state.recipeNotes[id] === 'string' ? state.recipeNotes[id] : '';

    panel.querySelector('#weSaveRecipeNote').addEventListener('click', () => {
      const value = textarea.value.trim();
      state.recipeNotes = state.recipeNotes || {};
      if (value) state.recipeNotes[id] = value;
      else delete state.recipeNotes[id];
      save();
      status.textContent = value ? '✓ Note enregistrée.' : 'Aucune note à enregistrer.';
    });

    panel.querySelector('#weClearRecipeNote').addEventListener('click', () => {
      textarea.value = '';
      state.recipeNotes = state.recipeNotes || {};
      delete state.recipeNotes[id];
      save();
      status.textContent = 'Note effacée.';
    });
  };

  const style = document.createElement('style');
  style.textContent = `
    #detailView .we-recipe-notes label.field {
      color:#173B27!important;
    }
    #detailView .we-recipe-notes textarea {
      display:block;width:100%;min-height:112px;box-sizing:border-box;
      padding:12px;border:1px solid #9fb7a0;border-radius:12px;
      background:#f8fbf6;color:#24352b;font:inherit;line-height:1.5;
      resize:vertical;
    }
    #detailView .we-recipe-notes .rowbuttons { margin-top:10px; }
    #detailView .we-recipe-notes #weRecipeNoteStatus { min-height:1.2em;margin:9px 0 0; }
  `;
  document.head.append(style);

  const version = document.querySelector('#settingsView .aboutpanel p');
  if (version) version.textContent = 'Version V4.5.23';
})();

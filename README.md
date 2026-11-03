# Whats'Eat? V3.1 — logo officiel et correction du chargement du catalogue

Le logo choisi est utilisé dans l'en-tête, les icônes PWA et l'icône iPhone. La V3 corrige aussi un défaut de la V2 : l'URL relative `./recipes.json` était refusée, ce qui empêchait le chargement du catalogue même s'il était rempli. **Le catalogue livré reste vide**, car l'extracteur HelloFresh n'a pas été vérifié avec succès sur le site réel.

# Whats'Eat? V2 — PWA personnelle

Interface mobile vert forêt inspirée de la capture fournie. Recherche unifiée, filtres, favoris, surprise, fiches recettes, portions ajustables, ingrédients à cocher, étapes, ajout et édition de recettes personnelles via Paramètres, export/import JSON.

## Essai local sur Mac

Depuis le dossier extrait :

```bash
python3 -m http.server 8000
```

Ouvrir `http://localhost:8000` sur le Mac. Pour installer la PWA sur iPhone, publier le dossier sur un **hébergement HTTPS** (par exemple GitHub Pages), puis Safari > Partager > Sur l'écran d'accueil. Un simple fichier `index.html` ouvert en local ne suffit pas pour installer le service worker.

## Synchronisation HelloFresh — limitations importantes

- L'app tente de charger `./recipes.json` au lancement puis, lorsqu'elle revient au premier plan, après 6 h. Elle conserve le dernier catalogue chargé dans le stockage local. Les recettes personnelles restent distinctes en interne mais sont **mélangées dans la recherche et les favoris**.
- Le script `scripts/sync_hellofresh.py` est un **collecteur expérimental** : il découvre des URL via les sitemaps publics du site HelloFresh France et tente de lire les données structurées `Recipe` (JSON-LD) accessibles publiquement. Il ne contourne pas les restrictions d'accès. Le site peut ne pas publier de JSON-LD, bloquer les requêtes, ou modifier sa structure ; dans ce cas le catalogue peut rester vide. **Aucune synchronisation exhaustive n'est garantie.**
- Le collecteur n'invente ni étapes, ni ustensiles, ni images d'étapes. Ces champs restent vides si les pages ne les fournissent pas. Les quantités non structurées ne sont pas ajustables automatiquement.
- Le workflow `.github/workflows/sync.yml` est prévu pour lancer le collecteur chaque jour sur GitHub Actions, **après** publication du projet sur un dépôt GitHub avec les Actions autorisées et les permissions d'écriture nécessaires. Les exécutions planifiées peuvent être retardées ou suspendues par GitHub.
- L'application ne peut pas lancer ce script Python depuis Safari : le collecteur doit tourner sur un serveur ou via GitHub Actions. Dans Paramètres, l'URL du catalogue peut être remplacée par une autre URL HTTPS renvoyant `{ "recipes": [...] }` avec CORS approprié si le serveur est sur un autre domaine.
- Vérifier les conditions d'utilisation du site source et les droits sur les photographies et textes. Usage personnel ne signifie pas automatiquement autorisation de toute copie ou extraction.

### Lancer le collecteur manuellement

```bash
python3 scripts/sync_hellofresh.py
```

Le fichier `recipes.json` est mis à jour uniquement avec les recettes dont les données publiques ont pu être extraites. L'import conserve les anciennes recettes en cas d'échec. Il est normal qu'un premier lancement ne trouve aucune recette.

## Données locales

Les recettes personnelles, favoris et réglages sont sauvegardés dans le `localStorage` du navigateur. Ne pas effacer les données du site sans exporter la sauvegarde depuis Paramètres. Le mode hors ligne concerne l'interface et les données précédemment synchronisées, pas nécessairement les photographies externes.

## Fichiers

- `index.html`, `styles.css`, `app.js` : interface et logique
- `manifest.webmanifest`, `sw.js`, `icons/` : PWA
- `recipes.json` : catalogue public synchronisé (initialement vide)
- `scripts/sync_hellofresh.py` : collecteur expérimental
- `.github/workflows/sync.yml` : tâche quotidienne après installation sur GitHub

## Navigation V2.1

La barre de navigation inférieure a été supprimée. Le bouton maison en haut à droite revient à l’accueil et la roue dentée ouvre les paramètres. La recherche reste en haut de la page d’accueil. Les favoris restent accessibles dans les onglets Suggestions / Mes favoris de l’accueil.

## Guide pas à pas : publication gratuite avec GitHub Pages

1. Créer un compte sur https://github.com/ (ou se connecter).
2. Créer un dépôt nommé `whatseat` et choisir **Public**. Attention : le code et le fichier `recipes.json` seront publiquement visibles. Ne jamais y mettre de secrets ni tes recettes privées.
3. Dans le dépôt, choisir **Add file → Upload files**, puis déposer **le contenu du dossier V3**, pas le fichier ZIP, en gardant les sous-dossiers `icons`, `scripts` et `.github`. Pour les dossiers cachés comme `.github`, le téléversement par navigateur peut être délicat : utiliser GitHub Desktop si nécessaire.
4. Aller dans **Settings → Pages → Build and deployment**, choisir **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis enregistrer.
5. Attendre la publication. Adresse attendue : `https://TON_IDENTIFIANT.github.io/whatseat/`.
6. Sur iPhone, ouvrir cette adresse dans Safari, puis **Partager → Sur l’écran d’accueil**.
7. Pour tester la collecte : **Actions → Synchroniser les recettes publiques → Run workflow**. Vérifier les journaux et `recipes.json`. Si le site bloque ou ne fournit pas les données structurées, aucune recette ne sera récupérée. Les exécutions planifiées sont soumises aux limites GitHub.

**Important** : GitHub Pages est public et ne constitue pas un hébergement privé. Les recettes personnelles ajoutées dans l’application restent dans le navigateur local tant qu’elles ne sont pas exportées, mais une suppression des données Safari peut les effacer. Exporter régulièrement une sauvegarde. Le collecteur n’est pas une intégration officielle HelloFresh ; il faut respecter les conditions du site et les droits sur les contenus.


## V3.2 — iPhone Dynamic Island
Le conteneur principal ajoute désormais `env(safe-area-inset-top)` à son espacement supérieur afin de préserver le bandeau dans la PWA iOS. Le cache du service worker a été incrémenté. Pour mettre à jour GitHub, remplacer `styles.css` et `sw.js` à la racine du dépôt, puis relancer l’application installée.

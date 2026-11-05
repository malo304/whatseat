# Whats’Eat? — V4.5.0 (archive nettoyée)

Application PWA à déployer à la racine de `malo304/whatseat` (branche `main`).

Cette archive reprend la V4.5.0 fournie précédemment, **sans ajouter de nouvelles fonctions**.
Le nettoyage retire les notes de versions historiques, les copies d'icônes à la racine, les caches Python et les scripts de synchronisation en double.

**À conserver impérativement :** `recipes.json`, `.github/workflows/sync.yml`, `scripts/`, `icons/`, `sw.js`, les fichiers JavaScript/CSS des versions précédentes encore référencés par `index.html` et le service worker.

## Déploiement GitHub (sans supprimer le dépôt)

1. Sauvegarder le dépôt actuel (Code > Download ZIP) et exporter les données de l'application depuis ses paramètres.
2. Supprimer dans GitHub les fichiers listés dans `SUPPRESSIONS-GITHUB.txt`, s'ils existent. Ne jamais supprimer `recipes.json` ni `.github/workflows/sync.yml`.
3. Envoyer le **contenu** de cette archive à la racine du dépôt (et non le dossier enveloppe), en conservant les chemins des sous-dossiers. L'interface Upload files de GitHub ne supprime pas les anciens fichiers.
4. Vérifier le déploiement Pages, les images, les recettes et le workflow de synchronisation.

Le nettoyage des fichiers actifs ne réécrit pas l'historique Git.

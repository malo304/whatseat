Whats'Eat? V4.1.3 — Enrichissement nutritionnel

- Conserve les 250 recettes du catalogue fourni, sans inventer les valeurs nutritionnelles.
- Ajoute scripts/enrich_nutrition.py : récupère les calories et protéines PAR PORTION depuis les données JSON-LD Recipe publiquement disponibles chez HelloFresh.
- Le workflow GitHub Actions .github/workflows/sync.yml exécute le script puis publie recipes.json si enrichi.
- Les fiches sans données nutritionnelles publiques exploitables restent « Non renseigné ».
- Retire « Cuisine simple, de saison, sans gaspillage. » et aligne le logo typographique sur l'icône.

INSTALLATION
1. Sauvegarder les données personnelles dans Paramètres > Exporter mes données.
2. Déployer les fichiers du ZIP à la racine de GitHub Pages, en conservant les sous-dossiers .github/workflows, scripts et icons.
3. Sur GitHub, ouvrir Actions > Synchroniser les recettes publiques > Run workflow.
4. Attendre le commit automatique du catalogue. Les pages inaccessibles et les recettes dépourvues de nutrition structurée restent sans valeur : ce n'est pas une erreur de calcul.
5. Relancer l'application pour recharger le catalogue (ou Synchroniser maintenant dans Paramètres).

IMPORTANT : Cette version n'inclut pas de valeurs nutritionnelles vérifiées depuis HelloFresh à ce stade. Le script a été testé localement sur des exemples synthétiques, pas sur les 250 pages en production. L'exécution de GitHub Actions est nécessaire pour tenter de récupérer les valeurs réelles.

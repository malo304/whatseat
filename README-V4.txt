Whats'Eat? V4.0 — PRÉVERSION DE TEST
===================================
Base : V3.4.2 (fichiers de mise à jour) + ressources de V3.3.

Contenu : nouvelle navigation Accueil/Courses/Planning, accès frigo, favoris roses,
filtres de durée compacts (20/40/60+), filtres avancés et nutritionnels, profil équipement,
planning aléatoire avec choix des créneaux, remplacement des recettes, nouveau logo,
splash screen, mise en page vert sauge et photos 4:3.

IMPORTANT :
- Il s'agit d'une préversion à tester sur une URL distincte, PAS d'une version validée pour production.
- La connexion automatique aux comptes Drive n'est PAS implémentée : elle exige des intégrations autorisées.
- Les calories et protéines HelloFresh ne s'affichent que si elles sont fournies par recipes.json.
- Le fichier recipes.json n'était pas présent dans les archives de base ; CONSERVEZ celui de votre dépôt.
- Avant tout déploiement, exportez une sauvegarde depuis la V3.4.2.
- La migration des données utilise la même clé localStorage 'whatseat-v2'.
- Tests de navigation réelle sur Android/iOS et tests de non-régression indispensables.
- Les icônes ont été générées depuis le logo sans texte approuvé.

Déploiement de test recommandé : branche ou dépôt de test séparé, puis contrôle des fonctionnalités
sur iPhone et Samsung. Ne remplacez pas le site public avant validation.

Correctif V4.0.1 : fermeture de secours du splash screen, même en cas d’erreur JavaScript, et actualisation du cache PWA.

V4.0.2 : Splash screen remplacé par le visuel approuvé, suppression de la présentation simplifiée, mise à jour du cache.

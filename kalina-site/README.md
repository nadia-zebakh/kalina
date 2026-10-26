# kalina — site « La cure Fusion Collagène+ »

Site statique : HTML, CSS et JavaScript, sans dépendance ni étape de build.
Il reprend la maquette *Site V3 — DA prune & or* : mêmes couleurs, typographies,
espacements et rayons en desktop, avec des mises en page dédiées tablette et mobile.

```
kalina-site/
├── index.html          la page
├── 404.html            page d'erreur (servie automatiquement par Netlify et Vercel)
├── css/styles.css      styles, une partie par section de la page
├── js/main.js          menu mobile, rituel 4 semaines, bouton d'achat
├── assets/images/      visuels (noms lisibles)
├── favicon.svg
├── netlify.toml        configuration Netlify
├── vercel.json         configuration Vercel
└── SHOPIFY.md          protocole de passage sur Shopify
```

## Prévisualiser en local

Ouvrir `index.html` dans le navigateur suffit. Pour un rendu identique à la mise en ligne :

```bash
cd kalina-site
python -m http.server 8000      # puis ouvrir http://localhost:8000
```

## Déployer sur Netlify

**Le plus rapide (sans compte Git)** : ouvrir <https://app.netlify.com/drop> et glisser le
dossier `kalina-site` dans la page. Le site est en ligne en quelques secondes.

**Avec Git (mises à jour automatiques)** :
1. Pousser le dossier sur GitHub, GitLab ou Bitbucket.
2. Netlify › *Add new site* › *Import an existing project* › choisir le dépôt.
3. *Base directory* : `kalina-site` (ou vide si le dossier est la racine du dépôt).
   *Build command* : vide. *Publish directory* : `.` (déjà indiqué dans `netlify.toml`).

**En ligne de commande** : `npx netlify-cli deploy --dir . --prod` depuis `kalina-site/`.

## Déployer sur Vercel

**Avec Git** : Vercel › *Add New* › *Project* › importer le dépôt.
*Framework Preset* : **Other**. *Root Directory* : `kalina-site`. Laisser *Build Command*
et *Output Directory* vides.

**En ligne de commande** : depuis `kalina-site/`, lancer `npx vercel` (préversion) puis
`npx vercel --prod`.

## Brancher un nom de domaine

Netlify : *Domain management* › *Add a domain*. Vercel : *Settings* › *Domains*.
Chacun indique les enregistrements DNS à créer chez le registraire ; le HTTPS est automatique.
Si la boutique passe ensuite sur Shopify, voir SHOPIFY.md (phase 3) pour la bascule du domaine.

## Avant une mise en ligne publique

Ces éléments viennent de la maquette et ne sont pas encore « vrais » :

- **Chiffres d'efficacité** (−63 %, 92 %…) : marqués « indicatifs de maquette ».
  Les remplacer par les résultats des tests réels avant toute diffusion.
- **Avis client** : marqué « exemple ». À remplacer par de vrais avis.
- **Prix** : 34,90 € −15 % donne 29,67 €, pas 29,90 €. Choisir l'un ou l'autre.
- **Images** : le hero et les vignettes « Le coffret » / « détails » sont extraits des
  maquettes (texte effacé puis remis en HTML) : hero 1 254 px de large, vignettes 230 à 630 px,
  poches de la section Fusion 244 px. Les remplacer par les photos d'origine en haute
  définition (≥ 2 400 px pour le hero, ≥ 1 200 px pour les vignettes) avant le lancement.
- **Boutons sans destination** : loupe, compte et « Être prévenue » sont décoratifs
  tant que la boutique Shopify n'est pas branchée. « Commencer ma cure » affiche
  « La boutique ouvre très bientôt. »
- **Mentions légales, CGV, confidentialité** : obligatoires pour un site marchand en France.
- **Polices** : chargées depuis Google Fonts. Pour éviter tout transfert d'IP vers Google
  (RGPD), les auto-héberger (fichiers `.woff2` dans `assets/`) avant le lancement.

## Remplacer une image

Les images sont mises en cache une semaine par les navigateurs. Pour en changer une,
déposer le nouveau fichier **sous un nouveau nom** et mettre à jour `index.html`.

# Protocole — héberger kalina sur Shopify pour gérer la boutique

## En bref

**Recommandation : transformer le site en thème Shopify (option A).** Shopify héberge
alors tout : la page, le panier, le paiement, les comptes clients et l'abonnement
« Cure de saison ». Le site Netlify/Vercel sert de préversion pendant la construction,
puis il est retiré le jour du lancement.

Si la boutique doit ouvrir avant que le thème soit prêt, l'**option B** (garder le site
sur Netlify/Vercel et envoyer au paiement Shopify) est déjà codée dans `js/main.js` :
il suffit de la configurer. Elle peut servir de transition.

| | **A. Thème Shopify** (recommandé) | **B. Netlify/Vercel + paiement Shopify** |
|---|---|---|
| Hébergement | Shopify | Netlify/Vercel pour la page, Shopify pour le paiement |
| Panier, compte, recherche | natifs | absents (icônes décoratives) |
| Abonnement « Cure de saison » | natif, avec widget et espace client | oui, via la Storefront API (déjà codé) |
| Modifier textes et images | éditeur de thème, sans code | dans le code, puis redéploiement |
| Apps (avis, e-mails, fidélité) | compatibles | souvent limitées |
| Effort (ordre de grandeur) | quelques jours de dev Shopify | une demi-journée après la phase 1 |

Une troisième voie, Hydrogen (le framework headless de Shopify), est surdimensionnée
pour une marque à un produit : elle n'est pas retenue.

---

## Phase 0 — Contenus et obligations (à lancer tout de suite, en parallèle)

Ces points bloquent le lancement quelle que soit l'option.

- **Allégations chiffrées** : les « −63 % de casse », « 92 % »… sont marqués « indicatifs
  de maquette ». Une allégation cosmétique doit être justifiée par des tests
  (règlement UE 655/2013). Récupérer les rapports d'étude et ajuster les chiffres.
- **Avis clients** : l'avis affiché est un exemple. Ne publier que de vrais avis,
  collectés par une app (voir phase 1) ; un faux avis est une pratique commerciale trompeuse.
- **Conformité cosmétique** : personne responsable désignée, dossier d'information
  produit (DIP), notification sur le portail européen CPNP, étiquetage INCI.
- **Prix** : 34,90 € −15 % = 29,67 €, alors que la maquette affiche 29,90 €.
  Choisir entre une remise de 15 % et un prix fixe de 29,90 € (le réglage diffère en phase 1).
- **Pages légales** : mentions légales, CGV (dont droit de rétractation de 14 jours),
  politique de confidentialité, politique de livraison et de retours, médiateur de la consommation.
- **Abonnement « sans engagement »** : depuis le 1er juin 2023, un abonnement souscrit
  en ligne doit pouvoir être résilié en ligne en quelques clics. L'espace client de
  l'app Shopify Subscriptions le permet ; prévoir un lien visible « Gérer mon abonnement ».
- **Visuels haute définition** : hero ≥ 1 600 px de large, poches ≥ 800 px
  (les fichiers actuels font 594 px et 244 px).

## Phase 1 — Configurer la boutique (admin Shopify, sans code)

1. **Créer la boutique** sur shopify.com. Le forfait de base suffit au lancement.
   Langue : français. Devise : EUR. Fuseau : Paris.
2. **Taxes** (*Paramètres › Taxes et droits*) : France, TVA 20 %, cocher
   « Tous les prix incluent les taxes » (prix affichés TTC, comme sur la maquette).
3. **Paiements** (*Paramètres › Paiements*) : activer Shopify Payments (CB, Apple Pay,
   Google Pay), ajouter PayPal si souhaité. Laisser le mode test actif jusqu'à la phase 4.
4. **Expédition** (*Paramètres › Expédition et livraison*) : zone France, tarifs.
   Le bandeau promet « Livraison 48 h » : choisir le transporteur en conséquence
   (Colissimo, Mondial Relay… via une app d'étiquettes comme Boxtal ou Sendcloud).
5. **Produit « La Cure 4 semaines »** (*Produits › Ajouter*) : prix 34,90 €, SKU, poids,
   stock suivi, photos HD, description, champs SEO. Identifiant d'URL conseillé :
   `la-cure-4-semaines`. Ajouter au besoin des métachamps (INCI, mode d'emploi).
6. **Abonnement « Cure de saison »** : installer l'app gratuite **Shopify Subscriptions**,
   créer un plan sur le produit : livraison **tous les 3 mois** (4 cures par an),
   remise de 15 % *ou* prix fixe de 29,90 € (selon la décision de la phase 0),
   sans nombre minimum de livraisons (« sans engagement »).
7. **Comptes clients** (*Paramètres › Comptes clients*) : activer les comptes clients ;
   c'est là que l'abonnée modifie, décale ou résilie sa cure.
8. **Pages légales** (*Paramètres › Politiques*) : Shopify propose des modèles pour
   retours, confidentialité, conditions de vente et livraison. Les relire et compléter ;
   créer une page « Mentions légales ».
9. **Cookies** (*Paramètres › Confidentialité des clients*) : activer la bannière de
   consentement pour l'Union européenne.
10. **Liste d'attente « Être prévenue »** : utiliser l'app gratuite Shopify Forms,
    ou le formulaire client du thème (voir phase 2), avec l'étiquette `liste-attente-gamme`.
11. **Avis clients** : installer une app d'avis (Judge.me par exemple) et programmer
    l'e-mail de demande d'avis environ 5 semaines après la livraison (fin de cure).
12. **E-mails de notification** (*Paramètres › Notifications*) : logo, couleurs prune
    et or, relecture des textes en français.

## Phase 2 — Construire le thème (développeur·se)

### Outils

```bash
npm install -g @shopify/cli@latest     # Shopify CLI (Node.js requis)
shopify version
```

### Point de départ

Partir d'un thème gratuit officiel récent (**Horizon**, ou Dawn) plutôt que de zéro :
il apporte la fiche produit, le panier, la recherche, les pages compte, l'accessibilité
et la compatibilité avec les apps. On y ajoute les sections kalina.

1. Dans l'admin, *Boutique en ligne › Thèmes* : ajouter Horizon, puis le **dupliquer**
   (on travaille toujours sur une copie non publiée).
2. Récupérer le code et le versionner :
   ```bash
   shopify theme pull --store kalina.myshopify.com --theme <ID-de-la-copie>
   git init && git add . && git commit -m "Thème de base"
   ```
3. Prévisualiser en direct pendant le développement :
   ```bash
   shopify theme dev --store kalina.myshopify.com     # http://127.0.0.1:9292
   ```

### Porter le site

- `css/styles.css` → `assets/kalina.css`, chargé dans `layout/theme.liquid` avec
  `{{ 'kalina.css' | asset_url | stylesheet_tag }}`. Les couleurs sont déjà des variables
  CSS (`:root`) : on peut les exposer dans `config/settings_schema.json` si l'on veut
  les régler depuis l'éditeur.
- `js/main.js` → `assets/kalina.js`, chargé avec `defer`. **Supprimer** le bloc
  `SHOPIFY`, `initOffer()` et `createCheckout()` : en thème, le formulaire produit natif
  de Shopify prend le relais.
- Images → téléversées via les réglages de section (type `image_picker`), rendues avec
  `{{ section.settings.image | image_url: width: 1600 | image_tag: loading: 'lazy' }}`
  pour bénéficier du redimensionnement et du WebP automatiques de Shopify.
- Polices → déposer les fichiers `.woff2` de Playfair Display et Jost dans `assets/`
  et les déclarer en `@font-face` (auto-hébergement, conforme RGPD).

### Correspondance des blocs

Chaque bloc commenté dans `index.html` devient une section. Les titres qui contiennent
de l'italique utilisent un réglage `inline_richtext` (qui autorise `<em>`).

| Bloc du site | Fichier du thème | Réglages éditables dans l'éditeur |
|---|---|---|
| En-tête | `sections/kalina-header.liquid` (groupe *header*) | menu `main-menu`, compteur `{{ cart.item_count }}`, liens `routes.search_url`, `routes.account_url`, `routes.cart_url` |
| Hero | `sections/kalina-hero.liquid` | image de fond (desktop + mobile), surtitre, titre, texte, bouton |
| Le coffret | `sections/kalina-coffret.liquid` | 2 grandes vignettes (image, surtitre, titre, texte, bénéfices) + blocs « vignette légendée » |
| Détails | `sections/kalina-details.liquid` | blocs « carte » : image, titre, texte ou liste à puces |
| La Fusion | `sections/kalina-fusion.liquid` | blocs « soin » (image, titre, texte), « actif », « chiffre », note de bas de carte |
| Le rituel | `sections/kalina-rituel.liquid` | 4 blocs « semaine » : nom, actifs, texte, gain, 3 couleurs, image |
| Résultats | `sections/kalina-resultats.liquid` | 2 images, légende ; l'avis vient de l'app d'avis (bloc `@app`) |
| Quand faire la cure | `sections/kalina-saisons.liquid` | blocs « saison » : mois, titre, texte, couleurs |
| Offre | `sections/kalina-offre.liquid` | produit lié, textes ; formulaire natif avec plans d'abonnement (ci-dessous) |
| Gamme à venir | `sections/kalina-teaser.liquid` | textes, image ; formulaire client « Être prévenue » |
| FAQ | `sections/kalina-faq.liquid` | blocs question / réponse |
| Pied de page | `sections/kalina-footer.liquid` (groupe *footer*) | menu légal (mentions, CGV, confidentialité, gérer mon abonnement) |

La page d'accueil (`templates/index.json`) empile ces sections dans l'ordre du site.
Créer aussi `templates/product.cure.json` avec les mêmes sections, et l'assigner au produit :
la fiche produit `/products/la-cure-4-semaines` affiche alors la même page.

### Section Offre : le formulaire produit avec abonnement

C'est la seule partie qui change de logique. Le visuel reste celui du site, mais
le formulaire envoie au panier Shopify, plan d'abonnement compris :

```liquid
{%- liquid
  assign product = section.settings.product | default: product
  assign variant = product.selected_or_first_available_variant
-%}
{%- form 'product', product, class: 'offre__panel' -%}
  <input type="hidden" name="id" value="{{ variant.id }}">
  <fieldset class="plans">
    <legend>Votre formule</legend>
    {%- for group in product.selling_plan_groups -%}
      {%- for plan in group.selling_plans -%}
        {%- assign allocation = variant.selling_plan_allocations | where: 'selling_plan_id', plan.id | first -%}
        <label class="plan">
          <span class="plan__main">
            <input type="radio" name="selling_plan" value="{{ plan.id }}" {% if forloop.parentloop.first and forloop.first %}checked{% endif %}>
            <span class="plan__text">
              <strong class="plan__name">{{ plan.name }}</strong>
              <span class="plan__hint">{{ section.settings.saison_hint }}</span>
            </span>
          </span>
          <span class="plan__price">{{ allocation.price | money }}</span>
        </label>
      {%- endfor -%}
    {%- endfor -%}
    {%- unless product.requires_selling_plan -%}
      <label class="plan">
        <span class="plan__main">
          <input type="radio" name="selling_plan" value="">
          <span class="plan__text"><strong class="plan__name">Achat unique</strong></span>
        </span>
        <span class="plan__price">{{ variant.price | money }}</span>
      </label>
    {%- endunless -%}
  </fieldset>
  <button class="btn btn--dark offre__cta" type="submit" {% unless variant.available %}disabled{% endunless %}>
    {%- if variant.available -%}Commencer ma cure{%- else -%}Bientôt de retour{%- endif -%}
  </button>
{%- endform -%}
```

Variante plus simple : utiliser le bloc d'app fourni par Shopify Subscriptions
dans le formulaire (moins de code, mais un style à reprendre pour coller à la DA).

### Formulaire « Être prévenue »

```liquid
{%- form 'customer', class: 'waitlist' -%}
  <input type="hidden" name="contact[tags]" value="newsletter, liste-attente-gamme">
  <label class="visually-hidden" for="waitlist-email">Adresse e-mail</label>
  <input id="waitlist-email" type="email" name="contact[email]" autocomplete="email" required placeholder="Votre e-mail">
  <button class="btn btn--outline teaser__cta" type="submit">Être prévenue</button>
  {%- if form.posted_successfully? -%}<p role="status">Merci, vous serez prévenue en avant-première.</p>{%- endif -%}
{%- endform -%}
```

### Contrôle et mise en ligne du thème

```bash
shopify theme check                      # erreurs Liquid, accessibilité, performance
shopify theme push --unpublished         # envoie une copie à valider dans l'admin
```

Pour la suite, connecter le dépôt Git au thème (*Thèmes › Ajouter un thème ›
Se connecter depuis GitHub*) : une branche = un thème, chaque commit se synchronise.

## Phase 3 — Domaine et bascule

1. **Pendant la construction** : le site Netlify/Vercel peut occuper le domaine
   (préversion). La boutique Shopify reste protégée par mot de passe
   (*Boutique en ligne › Préférences*).
2. **Le jour du lancement** : *Paramètres › Domaines › Connecter un domaine existant*.
   Chez le registraire, remplacer les enregistrements Netlify/Vercel par ceux que Shopify
   affiche (en général : `A @ → 23.227.38.65` et `CNAME www → shops.myshopify.com`).
   Le certificat HTTPS est émis automatiquement (jusqu'à 48 h de propagation DNS).
3. Retirer le mot de passe de la boutique, puis supprimer ou mettre en pause le site
   Netlify/Vercel.

## Phase 4 — Recette avant ouverture

- [ ] Commande test en achat unique, puis en abonnement (mode test de Shopify Payments).
- [ ] Abonnement : création, report d'une livraison, résiliation depuis l'espace client.
- [ ] E-mails reçus (confirmation, expédition, abonnement) : en français, aux couleurs kalina.
- [ ] Mobile réel : iPhone (Safari) et Android (Chrome) ; menu, rituel, formulaire d'offre.
- [ ] Lighthouse mobile : performance et accessibilité ≥ 90.
- [ ] Bannière cookies, puis suivi Google et Meta via leurs apps officielles (*Paramètres › Événements clients*).
- [ ] Liens du pied de page : mentions légales, CGV, confidentialité, gérer mon abonnement.
- [ ] Google Search Console : déclarer le domaine et le sitemap (`/sitemap.xml`, généré par Shopify).
- [ ] Désactiver le mode test des paiements.

---

## Option B — garder Netlify/Vercel et vendre via Shopify

Le bouton « Commencer ma cure » de `js/main.js` crée un panier Shopify par la
Storefront API et redirige vers le paiement Shopify. Les liens panier simples
(*cart permalinks*) ne gèrent pas les abonnements, d'où ce choix.

1. Faire la **phase 1** (au minimum points 1 à 7).
2. Installer le canal de vente **Headless** (app Shopify), créer un storefront et copier
   le **jeton d'accès public** (*public access token*). Ne jamais utiliser de jeton privé
   ou Admin dans le site.
3. Rendre le produit disponible sur le canal Headless (fiche produit › *Canaux de vente*).
4. Récupérer les identifiants, depuis la console du navigateur :
   ```js
   fetch('https://kalina.myshopify.com/api/2026-10/graphql.json', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': 'JETON_PUBLIC' },
     body: JSON.stringify({ query: '{ product(handle: "la-cure-4-semaines") { variants(first: 5) { nodes { id title } } sellingPlanGroups(first: 5) { nodes { name sellingPlans(first: 5) { nodes { id name } } } } } }' })
   }).then((r) => r.json()).then((d) => console.log(JSON.stringify(d, null, 2)));
   ```
   Garder la partie numérique des identifiants :
   `gid://shopify/ProductVariant/4567` → `4567`, `gid://shopify/SellingPlan/8910` → `8910`.
5. Renseigner le bloc `SHOPIFY` en haut de `js/main.js` (domaine, jeton, `variantId`,
   `sellingPlanId`), puis redéployer.
6. Tester un achat unique et un abonnement jusqu'à la page de paiement.

**Limites** : pas de panier persistant ni de compteur sur le site, loupe et compte
décoratifs, gestion de l'abonnement uniquement dans l'espace client Shopify, statistiques
réparties entre deux domaines. Mettre à jour `apiVersion` une fois par an : Shopify
maintient chaque version de l'API pendant douze mois.

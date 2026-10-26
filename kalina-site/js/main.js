/* kalina — interactions de la page : menu mobile, rituel 4 semaines, offre.
   Aucune dépendance : ce fichier se reprend tel quel dans assets/ d'un thème Shopify. */
(() => {
  'use strict';

  // Connexion boutique (option B de SHOPIFY.md). Tant qu'elle est vide, le bouton
  // « Commencer ma cure » affiche un message d'attente ; une fois remplie, il crée
  // un panier Shopify via la Storefront API et redirige vers le paiement.
  const SHOPIFY = {
    domain: '',          // ex. 'kalina.myshopify.com'
    storefrontToken: '', // jeton d'accès PUBLIC Storefront API (canal « Headless »)
    apiVersion: '2026-10',
    variantId: '',       // ID numérique de la variante « La Cure 4 semaines »
    sellingPlanId: ''    // ID numérique du plan d'abonnement « Cure de saison »
  };

  const AUTOPLAY_MS = 3400;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initNav();
  initRitual();
  initOffer();

  /* ---------- Menu mobile ---------- */

  function initNav() {
    const header = document.querySelector('[data-header]');
    const toggle = header && header.querySelector('[data-nav-toggle]');
    if (!toggle) return;
    const nav = document.getElementById(toggle.getAttribute('aria-controls'));
    const desktop = window.matchMedia('(min-width: 961px)');

    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    const isOpen = () => header.classList.contains('is-open');

    toggle.addEventListener('click', () => {
      setOpen(!isOpen());
      if (isOpen()) nav.querySelector('a').focus();
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
    desktop.addEventListener('change', () => setOpen(false));
  }

  /* ---------- Rituel : onglets semaine par semaine ---------- */

  function initRitual() {
    const root = document.querySelector('[data-ritual]');
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    const steps = Array.from(root.querySelectorAll('[data-step]'));
    const status = root.querySelector('[data-ritual-status]');
    const remaining = root.querySelector('[data-ritual-remaining]');
    const last = tabs.length - 1;
    let week = 0;
    let timer = null;
    let touched = false;

    function render() {
      tabs.forEach((tab, i) => {
        const current = i === week;
        tab.setAttribute('aria-selected', String(current));
        tab.tabIndex = current ? 0 : -1;
        tab.classList.toggle('is-reached', i <= week);
        panels[i].classList.toggle('is-active', current);
      });
      steps.forEach((el) => el.classList.toggle('is-reached', Number(el.dataset.step) <= week));
      const left = last - week;
      status.dataset.state = left === 0 ? 'done' : 'pending';
      remaining.textContent = left === 1 ? '1 semaine' : left + ' semaines';
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      timer = setInterval(() => {
        if (week < last) { week += 1; render(); } else { stop(); }
      }, AUTOPLAY_MS);
    }

    function go(i) {
      touched = true;
      stop();
      week = Math.max(0, Math.min(last, i));
      render();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => go(i));
      tab.addEventListener('keydown', (e) => {
        const target = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: last }[e.key];
        if (target === undefined) return;
        e.preventDefault();
        const next = (target + tabs.length) % tabs.length;
        go(next);
        tabs[next].focus();
      });
    });

    // Précédente / suivante : le panneau change, on garde le focus sur le bouton
    // équivalent du nouveau panneau pour ne pas le perdre au clavier.
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-go]');
      if (btn) {
        const dir = btn.dataset.go;
        go(week + (dir === 'next' ? 1 : -1));
        const same = panels[week].querySelector('[data-go="' + dir + '"]');
        const fallback = panels[week].querySelector('[data-go]:not(:disabled)');
        (same && !same.disabled ? same : fallback).focus({ preventScroll: true });
        return;
      }
      if (e.target.closest('[data-ritual-replay]')) {
        go(0);
        if (!reduceMotion) start();
      }
    });

    render();

    // L'autoplay démarre quand le rituel devient visible, pas au chargement de la page.
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      if (!touched) start();
    }, { threshold: 0.5 });
    io.observe(root.querySelector('.ritual-panels'));
  }

  /* ---------- Offre : passage au paiement ---------- */

  function initOffer() {
    const form = document.querySelector('[data-offer]');
    if (!form) return;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('[data-offer-status]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const subscription = new FormData(form).get('plan') === 'saison';
      const ready = SHOPIFY.domain && SHOPIFY.storefrontToken && SHOPIFY.variantId &&
        (!subscription || SHOPIFY.sellingPlanId);
      if (!ready) {
        status.textContent = 'La boutique ouvre très bientôt.';
        return;
      }
      button.disabled = true;
      status.textContent = 'Préparation de votre panier…';
      try {
        window.location.assign(await createCheckout(subscription));
      } catch (err) {
        console.error('[kalina] cartCreate', err);
        status.textContent = 'Le paiement n’a pas pu s’ouvrir. Réessayez dans un instant.';
        button.disabled = false;
      }
    });

    // Retour arrière depuis le checkout (cache navigateur) : on réactive le bouton.
    window.addEventListener('pageshow', () => {
      button.disabled = false;
      status.textContent = '';
    });
  }

  async function createCheckout(subscription) {
    const line = { merchandiseId: 'gid://shopify/ProductVariant/' + SHOPIFY.variantId, quantity: 1 };
    if (subscription) line.sellingPlanId = 'gid://shopify/SellingPlan/' + SHOPIFY.sellingPlanId;

    const res = await fetch('https://' + SHOPIFY.domain + '/api/' + SHOPIFY.apiVersion + '/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY.storefrontToken
      },
      body: JSON.stringify({
        query: 'mutation ($input: CartInput) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { field message } } }',
        variables: { input: { lines: [line], buyerIdentity: { countryCode: 'FR' } } }
      })
    });
    const json = await res.json();
    const result = json.data && json.data.cartCreate;
    if (!res.ok || json.errors || !result || !result.cart || result.userErrors.length) {
      throw new Error(JSON.stringify(json.errors || (result && result.userErrors) || res.status));
    }
    return result.cart.checkoutUrl;
  }
})();

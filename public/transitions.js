/* Loaded in <head> before first paint: native document transitions retain real
   links, SEO, browser history and normal navigation if the API is unavailable. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let clickedProduct = null;
  let clickedHref = null;
  let intentTimer;
  const productId = value => {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return null;
      return url.pathname.match(/^\/product\/([a-z0-9-]+)-(?:50|100)ml\/$/)?.[1] || null;
    } catch { return null; }
  };
  const visibleArea = el => {
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) *
      Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
  };
  function findProduct(id, preferred) {
    if (!id) return null;
    if (preferred?.dataset.productId === id && preferred.isConnected) return preferred;
    const candidates = [...document.querySelectorAll('[data-product-id]')]
      .filter(el => el.dataset.productId === id && !el.hidden);
    return candidates.find(el => el.matches('.product-detail')) ||
      candidates.sort((a, b) => visibleArea(b) - visibleArea(a))[0] || null;
  }
  function nameParts(product, transition) {
    if (!product) return;
    // Only one product participates, even when the hero and grid repeat a scent.
    const parts = [...product.querySelectorAll('[data-transition-part]')];
    parts.forEach(el => {
      el.style.viewTransitionName = `perfume-${el.dataset.transitionPart}`;
      // A reveal/hover transform must not shrink the shared snapshot.
      el.style.viewTransitionClass = 'perfume-shared';
    });
    root.classList.add('product-transition');
    product.classList.add('transition-selected');
    const clean = () => {
      parts.forEach(el => {
        el.style.removeProperty('view-transition-name');
        el.style.removeProperty('view-transition-class');
      });
      product.classList.remove('transition-selected');
      root.classList.remove('product-transition');
    };
    // Outgoing cleanup also runs when the document is restored from BFCache.
    transition.finished.then(clean, clean);
  }
  function settleHeader() {
    document.querySelector('.site-header')?.classList.toggle('scrolled', scrollY > 30);
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
    clickedProduct = anchor.closest('[data-product-id]');
    clickedHref = anchor.href;
  });
  window.addEventListener('pageswap', event => {
    const transition = event.viewTransition;
    if (!transition) return;
    if (reducedMotion.matches) { transition.skipTransition(); return; }
    settleHeader();
    const destination = event.activation?.entry?.url || clickedHref;
    const destinationId = productId(destination);
    const sourceId = productId(location.href);
    const product = findProduct(destinationId, clickedProduct) || findProduct(sourceId);
    try { sessionStorage.setItem('omario-journey', JSON.stringify({from: location.href, to: destination, at: Date.now()})); } catch {}
    if (product) nameParts(product, transition);
  });
  window.addEventListener('pagereveal', event => {
    const transition = event.viewTransition;
    settleHeader();
    if (!transition) return;
    if (reducedMotion.matches) { transition.skipTransition(); return; }
    const destinationId = productId(location.href);
    let previous = window.navigation?.activation?.from?.url;
    if (!previous) {
      try {
        const journey = JSON.parse(sessionStorage.getItem('omario-journey') || 'null');
        if (journey && Date.now() - journey.at < 15000 && (!journey.to || journey.to === location.href)) previous = journey.from;
      } catch {}
    }
    const sourceId = productId(previous);
    const product = findProduct(destinationId) || findProduct(sourceId);
    if (product) nameParts(product, transition);
    // These pieces wait just long enough to let the image take the lead.
    root.classList.add('page-arriving');
    transition.finished.then(() => root.classList.remove('page-arriving'), () => root.classList.remove('page-arriving'));
  });
  window.addEventListener('pageshow', () => {
    clickedProduct = null;
    clickedHref = null;
  });
  // Intent-based prefetching keeps a click immediate. At most one request per
  // destination per document; save-data connections and touch scrolls skip it.
  const prefetched = new Set();
  function prefetch(anchor) {
    if (!anchor || navigator.connection?.saveData || !productId(anchor.href) || prefetched.has(anchor.href)) return;
    const hint = document.createElement('link');
    hint.rel = 'prefetch'; hint.href = anchor.href;
    document.head.append(hint); prefetched.add(anchor.href);
  }
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    clearTimeout(intentTimer);
    const anchor = event.target.closest('a[href]');
    intentTimer = setTimeout(() => prefetch(anchor), 100);
  });
  document.addEventListener('pointerout', () => clearTimeout(intentTimer));
  document.addEventListener('focusin', event => prefetch(event.target.closest('a[href]')));
})();

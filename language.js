(() => {
  'use strict';
  const key = 'joeynavarro-language';
  const root = document.documentElement;
  const current = root.lang === 'es' ? 'es' : 'en';
  const peers = { en: root.dataset.pageEn, es: root.dataset.pageEs };
  let preferred;
  try { preferred = window.localStorage.getItem(key); } catch (_) { /* Native links still work without storage. */ }
  // An explicit Spanish URL is a language choice; English links can restore the saved Spanish preference.
  if (current === 'es') {
    try { window.localStorage.setItem(key, 'es'); } catch (_) {}
  }
  if (current === 'en' && preferred === 'es' && peers.es) {
    const destination = new URL(peers[preferred], window.location.origin);
    destination.search = window.location.search;
    destination.hash = window.location.hash;
    if (destination.pathname !== window.location.pathname) window.location.replace(destination.href);
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-language]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    try { window.localStorage.setItem(key, link.dataset.language); } catch (_) { /* Storage is optional. */ }
    if (window.location.hash) {
      const destination = new URL(link.href);
      destination.hash = window.location.hash;
      link.href = destination.href;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[data-language]').forEach((link) => {
      if (window.location.hash) {
        const destination = new URL(link.href);
        destination.hash = window.location.hash;
        link.href = destination.href;
      }
    });
    const menu = document.querySelector('.main-nav');
    const menuButton = document.querySelector('.nav__icon-menu');
    document.querySelector('.nav__icon-menu')?.addEventListener('click', () => menuButton?.setAttribute('aria-expanded', 'true'));
    document.querySelector('.nav__icon-close')?.addEventListener('click', () => menuButton?.setAttribute('aria-expanded', 'false'));
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      menu?.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      document.querySelector('.search')?.classList.remove('is-visible');
    });
  });
})();

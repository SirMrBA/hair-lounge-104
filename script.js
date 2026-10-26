'use strict';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const setMenu = (open) => {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  menu.querySelector('span').textContent = open ? '−' : '＋';
};
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
});
document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) setMenu(false); });
matchMedia('(min-width: 761px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const running = new Set();
if ('IntersectionObserver' in window && Element.prototype.animate) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reduced.matches) continue;
      const animation = entry.target.animate(
        [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 700, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
      running.add(animation);
      animation.onfinish = () => running.delete(animation);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}
reduced.addEventListener('change', () => { if (reduced.matches) { running.forEach((animation) => animation.cancel()); running.clear(); } });
// Native details stay usable without JavaScript; opening deep links also reveals their content.
function revealHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target instanceof HTMLDetailsElement) target.open = true;
}
window.addEventListener('hashchange', revealHash);
revealHash();

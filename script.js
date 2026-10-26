'use strict';
const root = document.documentElement;
// Scroll reveals hide content only once this script runs, so a failed load never hides anything.
root.classList.add('motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';

/* Navigation */
const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const setMenu = (open) => {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  menu.querySelector('span').textContent = open ? '−' : '＋';
  if (open) header.classList.remove('is-hidden');
};
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
});
document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) setMenu(false); });
matchMedia('(min-width: 761px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });
header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

// Header hides while scrolling down and returns when scrolling up.
let headerY = scrollY;
let headerTicking = false;
addEventListener('scroll', () => {
  if (headerTicking) return;
  headerTicking = true;
  requestAnimationFrame(() => {
    headerTicking = false;
    const y = scrollY;
    if (Math.abs(y - headerY) < 8) return;
    const hide = y > headerY && y > 420 && menu.getAttribute('aria-expanded') !== 'true' && !header.contains(document.activeElement);
    header.classList.toggle('is-hidden', hide);
    headerY = y;
  });
}, { passive: true });

/* Intro: short logo curtain on the first visit of a session, then the hero builds up */
const startIntro = () => root.classList.add('intro-ready');
let introSeen = false;
try { introSeen = sessionStorage.getItem('hl104-intro') === '1'; sessionStorage.setItem('hl104-intro', '1'); } catch { introSeen = true; }
if (reduced.matches || introSeen || !Element.prototype.animate) {
  requestAnimationFrame(() => requestAnimationFrame(startIntro));
} else {
  const curtain = document.createElement('div');
  curtain.className = 'preloader';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<div class="preloader-logo"></div><p>BOCHUM · SEIT 2008</p>';
  document.body.append(curtain);
  curtain.firstChild.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: EASE_OUT, fill: 'both' });
  curtain.lastChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 200, easing: EASE_OUT, fill: 'both' });
  setTimeout(() => {
    startIntro();
    curtain.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 900, easing: EASE_IN_OUT, fill: 'forwards' })
      .onfinish = () => curtain.remove();
  }, 950);
}

/* Hero: real looks wipe in from below; story bars on the image show and select the look */
const heroVisual = document.querySelector('.hero-visual');
const slides = [...heroVisual.querySelectorAll('.slide')];
const bars = [...heroVisual.querySelectorAll('.story-bars [data-slide]')];
const pauseButton = heroVisual.querySelector('.look-pause');
const lookName = heroVisual.querySelector('.look-name');
const SLIDE_MS = 5600;
let currentSlide = 0;
let slideAnimations = [];
let barAnimation = null;
let userPaused = false;
let heroVisible = true;

function showSlide(next) {
  if (next === currentSlide) return;
  slideAnimations.forEach((animation) => animation.finish());
  const previous = slides[currentSlide];
  const incoming = slides[next];
  currentSlide = next;
  bars.forEach((bar, index) => {
    bar.setAttribute('aria-pressed', String(index === next));
    bar.classList.toggle('is-past', index < next);
  });
  lookName.textContent = incoming.dataset.name;
  incoming.classList.add('is-active');
  if (reduced.matches) {
    previous.classList.remove('is-active');
    slideAnimations = [incoming.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease' })];
    return;
  }
  incoming.style.zIndex = '2';
  const wipe = incoming.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1200, easing: EASE_IN_OUT });
  const settle = incoming.firstElementChild.animate([{ transform: 'scale(1.22) translateY(5%)' }, { transform: 'none' }], { duration: 1800, easing: EASE_OUT });
  const push = previous.firstElementChild.animate([{ transform: 'none' }, { transform: 'scale(1.08) translateY(-7%)' }], { duration: 1200, easing: EASE_IN_OUT });
  const name = lookName.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 300, easing: EASE_OUT, fill: 'backwards' });
  wipe.onfinish = () => { previous.classList.remove('is-active'); incoming.style.zIndex = ''; };
  slideAnimations = [wipe, settle, push, name];
}

function runTimer() {
  barAnimation?.cancel();
  const autoplay = !reduced.matches && !userPaused && Boolean(Element.prototype.animate);
  heroVisual.classList.toggle('is-playing', autoplay);
  if (!autoplay) return;
  const fill = bars[currentSlide].querySelector('i');
  barAnimation = fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: SLIDE_MS, easing: 'linear', fill: 'forwards' });
  if (!heroVisible || document.hidden) barAnimation.pause();
  barAnimation.onfinish = () => { showSlide((currentSlide + 1) % slides.length); runTimer(); };
}

bars.forEach((bar, index) => bar.addEventListener('click', () => { showSlide(index); runTimer(); }));
pauseButton.addEventListener('click', () => {
  userPaused = !userPaused;
  pauseButton.setAttribute('aria-pressed', String(userPaused));
  pauseButton.setAttribute('aria-label', userPaused ? 'Bildwechsel fortsetzen' : 'Bildwechsel pausieren');
  runTimer();
});
const syncTimer = () => {
  if (!barAnimation) return;
  if (heroVisible && !document.hidden) barAnimation.play(); else barAnimation.pause();
};
document.addEventListener('visibilitychange', syncTimer);
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncTimer(); }, { threshold: 0.2 }).observe(heroVisual);
runTimer();

/* Scroll reveals */
const revealTargets = document.querySelectorAll('.reveal, .reveal-clip, .reveal-lines, .footer-wordmark');
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
revealTargets.forEach((element) => revealObserver.observe(element));
addEventListener('beforeprint', () => revealTargets.forEach((element) => element.classList.add('is-in')));

/* Service preview: a real photo follows the pointer over the price list */
const preview = document.querySelector('.service-preview');
const previewImage = preview.querySelector('img');
let previewOn = false;
let previewShown = false;
let previewTicking = false;
const pointer = { x: 0, y: 0 };
const previewPos = { x: 0, y: 0 };
function enablePreview() {
  previewOn = finePointer.matches && !reduced.matches;
  root.classList.toggle('has-preview', previewOn);
}
function movePreview() {
  previewTicking = false;
  if (!previewShown) return;
  previewPos.x += (pointer.x - previewPos.x) * 0.16;
  previewPos.y += (pointer.y - previewPos.y) * 0.16;
  const width = preview.offsetWidth;
  const x = previewPos.x + 36 + width > innerWidth ? previewPos.x - width - 36 : previewPos.x + 36;
  preview.style.translate = `${x.toFixed(1)}px ${(previewPos.y - preview.offsetHeight / 2).toFixed(1)}px`;
  if (Math.abs(pointer.x - previewPos.x) > 0.3 || Math.abs(pointer.y - previewPos.y) > 0.3) requestPreview();
}
function requestPreview() {
  if (previewTicking) return;
  previewTicking = true;
  requestAnimationFrame(movePreview);
}
document.querySelectorAll('.price-list details').forEach((details) => {
  const summary = details.querySelector('summary');
  summary.addEventListener('pointerenter', (event) => {
    if (!previewOn) return;
    if (!previewShown) { previewPos.x = event.clientX; previewPos.y = event.clientY; }
    pointer.x = event.clientX; pointer.y = event.clientY;
    if (previewImage.getAttribute('src') !== details.dataset.preview) previewImage.src = details.dataset.preview;
    preview.classList.add('is-visible');
    previewShown = true;
    requestPreview();
  });
  summary.addEventListener('pointerleave', () => { preview.classList.remove('is-visible'); previewShown = false; });
});
addEventListener('pointermove', (event) => {
  if (!previewShown) return;
  pointer.x = event.clientX; pointer.y = event.clientY;
  requestPreview();
}, { passive: true });

/* Magnetic call button */
const magnet = document.querySelector('.magnetic');
magnet.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || reduced.matches) return;
  const rect = magnet.getBoundingClientRect();
  magnet.style.translate = `${((event.clientX - rect.left - rect.width / 2) * 0.32).toFixed(1)}px ${((event.clientY - rect.top - rect.height / 2) * 0.32).toFixed(1)}px`;
});
magnet.addEventListener('pointerleave', () => { magnet.style.translate = ''; });

/* Living photos: load and play only while visible, never with reduced motion */
const loopObserver = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (isIntersecting && !reduced.matches) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }
}, { rootMargin: '200px 0px' });
document.querySelectorAll('video.loop').forEach((video) => loopObserver.observe(video));

/* Opening status in Bochum time, following the regular hours */
const HOURS = { 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1080], 6: [510, 900] };
const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const statusLine = document.querySelector('.open-status');
const statusText = statusLine.querySelector('.status-text');
const hourRows = [...document.querySelectorAll('.hours [data-days]')];
const clock = (minutes) => (minutes % 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}` : String(minutes / 60));
function updateStatus() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map((part) => [part.type, part.value]));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const hours = HOURS[day];
  let open = false;
  let text;
  if (hours && minutes >= hours[0] && minutes < hours[1]) {
    open = true;
    text = `Jetzt geöffnet · bis ${clock(hours[1])} Uhr`;
  } else if (hours && minutes < hours[0]) {
    text = `Geschlossen · öffnet heute um ${clock(hours[0])} Uhr`;
  } else {
    let next = day;
    let distance = 0;
    do { next = (next + 1) % 7; distance += 1; } while (!HOURS[next]);
    text = `Geschlossen · öffnet ${distance === 1 ? 'morgen' : DAY_NAMES[next]} um ${clock(HOURS[next][0])} Uhr`;
  }
  statusLine.hidden = false;
  statusLine.classList.toggle('is-open', open);
  statusText.textContent = text;
  hourRows.forEach((row) => row.classList.toggle('is-today', row.dataset.days.split(',').map(Number).includes(day)));
}
updateStatus();
setInterval(updateStatus, 60000);

/* Reduced motion can change while the page is open */
reduced.addEventListener('change', () => {
  enablePreview();
  runTimer();
  if (reduced.matches) document.querySelectorAll('video.loop').forEach((video) => video.pause());
});
finePointer.addEventListener('change', enablePreview);

// Native details stay usable without JavaScript; opening deep links also reveals their content.
function revealHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target instanceof HTMLDetailsElement) target.open = true;
}
addEventListener('hashchange', revealHash);
revealHash();
enablePreview();

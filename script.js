'use strict';
const root = document.documentElement;
// Scroll reveals hide content only once this script runs, so a failed load never hides anything.
root.classList.add('motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
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

let headerY = scrollY;
function updateHeader(y) {
  if (Math.abs(y - headerY) < 8) return;
  const hide = y > headerY && y > 420 && menu.getAttribute('aria-expanded') !== 'true' && !header.contains(document.activeElement);
  header.classList.toggle('is-hidden', hide);
  headerY = y;
}

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
  curtain.innerHTML = '<img src="./assets/logo.png" alt="" width="500" height="149"><p>BOCHUM · SEIT 2008</p>';
  document.body.append(curtain);
  curtain.firstChild.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: EASE_OUT, fill: 'both' });
  curtain.lastChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 200, easing: EASE_OUT, fill: 'both' });
  setTimeout(() => {
    startIntro();
    curtain.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 900, easing: EASE_IN_OUT, fill: 'forwards' })
      .onfinish = () => curtain.remove();
  }, 950);
}

/* Hero: real looks wipe in from below; the progress bar under the active look is the timer */
const heroVisual = document.querySelector('.hero-visual');
const slides = [...heroVisual.querySelectorAll('.slide')];
const lookIndex = document.querySelector('.look-index');
const lookButtons = [...lookIndex.querySelectorAll('[data-slide]')];
const pauseButton = lookIndex.querySelector('.look-pause');
const slideCount = heroVisual.querySelector('.slide-count b');
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
  lookButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === next)));
  slideCount.textContent = String(next + 1).padStart(2, '0');
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
  wipe.onfinish = () => { previous.classList.remove('is-active'); incoming.style.zIndex = ''; };
  slideAnimations = [wipe, settle, push];
}

function runTimer() {
  barAnimation?.cancel();
  const autoplay = !reduced.matches && !userPaused && Boolean(Element.prototype.animate);
  lookIndex.classList.toggle('is-playing', autoplay);
  if (!autoplay) return;
  const bar = lookButtons[currentSlide].querySelector('.look-bar i');
  barAnimation = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: SLIDE_MS, easing: 'linear', fill: 'forwards' });
  if (!heroVisible || document.hidden) barAnimation.pause();
  barAnimation.onfinish = () => { showSlide((currentSlide + 1) % slides.length); runTimer(); };
}

lookButtons.forEach((button, index) => button.addEventListener('click', () => { showSlide(index); runTimer(); }));
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

/* Reveals and the year counter */
const yearCount = document.querySelector('.count[data-since]');
const founded = new Date(`${yearCount.dataset.since}T00:00:00`);
const today = new Date();
let years = today.getFullYear() - founded.getFullYear();
if (today < new Date(today.getFullYear(), founded.getMonth(), founded.getDate())) years -= 1;
yearCount.textContent = String(years);

function countUp(element, target) {
  if (reduced.matches) return;
  const start = performance.now();
  const step = (now) => {
    const t = clamp((now - start) / 1600, 0, 1);
    element.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 4))));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
    if (entry.target.contains(yearCount)) countUp(yearCount, years);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal, .reveal-clip, .reveal-lines, .footer-wordmark').forEach((element) => revealObserver.observe(element));
addEventListener('beforeprint', () => document.querySelectorAll('.reveal, .reveal-clip, .reveal-lines, .footer-wordmark').forEach((element) => element.classList.add('is-in')));

/* Statement: words light up while it scrolls through the viewport */
const statement = document.querySelector('.statement');
const statementText = statement.querySelector('.words');
const words = [];
(function splitWords(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.append(part); return; }
        const span = document.createElement('span');
        span.className = 'w';
        span.textContent = part;
        words.push(span);
        fragment.append(span);
      });
      child.replaceWith(fragment);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
      splitWords(child);
    }
  }
})(statementText);

function updateStatement(vh) {
  const rect = statement.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > vh) return;
  const startTop = vh * 0.88;
  const endTop = vh * 0.42 - rect.height / 2;
  const progress = clamp((startTop - rect.top) / (startTop - endTop), 0, 1) * words.length;
  words.forEach((word, index) => { word.style.opacity = String(0.14 + 0.86 * clamp(progress - index, 0, 1)); });
}

/* Parallax: images drift slower than the page inside their frames */
const parallaxItems = [...document.querySelectorAll('.parallax > [data-speed]')].map((element) => ({ element, frame: element.parentElement, speed: Number(element.dataset.speed) }));
function updateParallax(vh) {
  for (const { element, frame, speed } of parallaxItems) {
    const rect = frame.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > vh + 100) continue;
    const limit = rect.height * 0.08;
    const offset = clamp((vh / 2 - (rect.top + rect.height / 2)) * speed, -limit, limit);
    element.style.translate = `0 ${offset.toFixed(1)}px`;
  }
}

/* Looks: on large screens the section pins and vertical scrolling moves the gallery sideways */
const looks = document.querySelector('.looks');
const looksTrack = looks.querySelector('.looks-track');
const looksBar = looks.querySelector('.looks-progress span');
const lookImages = [...looks.querySelectorAll('.look-img img')];
const pinQuery = matchMedia('(min-width: 1000px) and (min-height: 680px)');
let pinned = false;
let trackDistance = 0;
function setupPin() {
  pinned = pinQuery.matches && !reduced.matches;
  looks.classList.toggle('is-pinned', pinned);
  looksTrack.style.transform = '';
  lookImages.forEach((image) => { image.style.translate = ''; });
  looksTrack.tabIndex = pinned ? -1 : 0;
  if (pinned) {
    trackDistance = Math.max(0, looksTrack.offsetWidth - innerWidth);
    looks.style.height = `${innerHeight + trackDistance}px`;
  } else {
    looks.style.height = '';
  }
}
function updateLooks(vh) {
  let progress;
  if (pinned) {
    const rect = looks.getBoundingClientRect();
    progress = clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
    looksTrack.style.transform = `translate3d(${(-progress * trackDistance).toFixed(1)}px, 0, 0)`;
    // Images lag slightly behind their frames for depth
    for (const image of lookImages) {
      const frame = image.parentElement.getBoundingClientRect();
      if (frame.right < 0 || frame.left > innerWidth) continue;
      const shift = clamp((innerWidth / 2 - (frame.left + frame.width / 2)) * 0.07, -frame.width * 0.07, frame.width * 0.07);
      image.style.translate = `${shift.toFixed(1)}px 0`;
    }
  } else {
    progress = looksTrack.scrollLeft / Math.max(1, looksTrack.scrollWidth - looksTrack.clientWidth);
  }
  looksBar.style.transform = `scaleX(${progress.toFixed(4)})`;
}
looksTrack.addEventListener('scroll', () => requestTick(), { passive: true });
looksTrack.addEventListener('focusin', (event) => {
  if (!pinned || !trackDistance) return;
  const card = event.target.closest('.look-card');
  if (!card) return;
  const progress = clamp((card.offsetLeft - innerWidth * 0.3) / trackDistance, 0, 1);
  const top = looks.getBoundingClientRect().top + scrollY;
  scrollTo({ top: top + progress * (looks.offsetHeight - innerHeight), behavior: reduced.matches ? 'auto' : 'smooth' });
});

/* Marquee: speeds up with scroll velocity and follows the scroll direction */
const marqueeAnimation = document.querySelector('.marquee-track').getAnimations?.()[0];
let marqueeBoost = 0;
let marqueeDirection = 1;
function updateMarquee(velocity) {
  if (!marqueeAnimation) return false;
  if (Math.abs(velocity) > 1) marqueeDirection = Math.sign(velocity);
  marqueeBoost = Math.max(marqueeBoost * 0.9, Math.min(Math.abs(velocity) * 0.18, 5));
  if (marqueeBoost < 0.02) marqueeBoost = 0;
  marqueeAnimation.playbackRate = marqueeDirection * (1 + marqueeBoost);
  return marqueeBoost > 0;
}

/* Service preview: a real photo follows the pointer over the price list */
const preview = document.querySelector('.service-preview');
const previewImage = preview.querySelector('img');
let previewOn = false;
let previewShown = false;
const pointer = { x: 0, y: 0 };
const previewPos = { x: 0, y: 0 };
function enablePreview() {
  previewOn = finePointer.matches && !reduced.matches;
  root.classList.toggle('has-preview', previewOn);
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
    requestTick();
  });
  summary.addEventListener('pointerleave', () => { preview.classList.remove('is-visible'); previewShown = false; });
});
addEventListener('pointermove', (event) => {
  if (!previewShown) return;
  pointer.x = event.clientX; pointer.y = event.clientY;
  requestTick();
}, { passive: true });
function updatePreview() {
  if (!previewShown) return false;
  previewPos.x += (pointer.x - previewPos.x) * 0.16;
  previewPos.y += (pointer.y - previewPos.y) * 0.16;
  const width = preview.offsetWidth;
  const x = previewPos.x + 36 + width > innerWidth ? previewPos.x - width - 36 : previewPos.x + 36;
  preview.style.translate = `${x.toFixed(1)}px ${(previewPos.y - preview.offsetHeight / 2).toFixed(1)}px`;
  return Math.abs(pointer.x - previewPos.x) > 0.3 || Math.abs(pointer.y - previewPos.y) > 0.3;
}

/* Magnetic call button */
const magnet = document.querySelector('.magnetic');
magnet.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || reduced.matches) return;
  const rect = magnet.getBoundingClientRect();
  magnet.style.translate = `${((event.clientX - rect.left - rect.width / 2) * 0.32).toFixed(1)}px ${((event.clientY - rect.top - rect.height / 2) * 0.32).toFixed(1)}px`;
});
magnet.addEventListener('pointerleave', () => { magnet.style.translate = ''; });

/* One frame loop, only running while something moves */
let ticking = false;
let lastScroll = scrollY;
function requestTick() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(tick);
}
function tick() {
  ticking = false;
  const y = scrollY;
  const vh = innerHeight;
  const velocity = y - lastScroll;
  lastScroll = y;
  updateHeader(y);
  updateLooks(vh);
  let again = updatePreview();
  if (!reduced.matches) {
    updateParallax(vh);
    updateStatement(vh);
    again = updateMarquee(velocity) || again;
  }
  if (again) requestTick();
}
addEventListener('scroll', requestTick, { passive: true });
addEventListener('resize', () => { setupPin(); requestTick(); });
addEventListener('load', () => { setupPin(); requestTick(); });

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
  setupPin();
  enablePreview();
  runTimer();
  parallaxItems.forEach(({ element }) => { element.style.translate = ''; });
  words.forEach((word) => { word.style.opacity = ''; });
  if (reduced.matches) document.querySelectorAll('video.loop').forEach((video) => video.pause());
  requestTick();
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
setupPin();
requestTick();

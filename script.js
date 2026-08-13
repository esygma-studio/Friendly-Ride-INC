// Coarse equirectangular land grid: 60 cols (lon -180..180, 6deg) x 27 rows (lat 80..-55, 5deg).
// Each row = list of [startCol, endCol] inclusive land ranges.
const LAND = [
  [[20,25]],
  [[2,4],[12,26],[42,56]],
  [[1,19],[21,27],[31,59]],
  [[1,18],[22,25],[31,59]],
  [[1,4],[6,17],[28,28],[31,33],[36,59]],
  [[7,16],[28,58]],
  [[8,17],[28,34],[36,56]],
  [[9,17],[27,48],[52,52]],
  [[9,17],[27,28],[30,40],[43,53]],
  [[10,16],[27,50],[52,52]],
  [[10,13],[15,15],[27,39],[41,49]],
  [[10,15],[27,39],[41,48],[50,50]],
  [[11,13],[15,16],[27,39],[41,51]],
  [[12,14],[27,33],[36,38],[42,43],[46,51]],
  [[14,19],[28,38],[43,43],[46,51]],
  [[15,21],[32,36],[45,50],[52,54]],
  [[14,23],[32,36],[46,55]],
  [[15,23],[32,36],[47,49],[53,55]],
  [[15,23],[32,36],[48,52]],
  [[15,22],[32,37],[47,53]],
  [[16,21],[32,35],[37,37],[47,54]],
  [[16,21],[32,35],[47,54]],
  [[16,20],[32,34],[48,53],[57,57]],
  [[16,19],[49,52],[56,57]],
  [[16,18],[51,51],[56,56]],
  [[16,18]],
  [[16,17]]
];

const BRASS_RGB = '168,137,92';

// Renders at the canvas's actual CSS size (times devicePixelRatio), instead
// of one fixed bitmap that then gets scaled by the browser to fit whatever
// width it lands in. That fixed-bitmap approach is why the dots used to look
// noticeably lighter/softer on mobile than desktop: shrinking a solid,
// opaque, drop-shadowed dot down to a few device pixels blends it with the
// transparent background at scale-dependent ratios, so the same fill color
// rendered differently depending on viewport width. Rendering at native
// resolution removes that dependency, and a fixed (not fully opaque) alpha
// keeps the soft look consistent everywhere.
function drawMap() {
  const cv = document.getElementById('worldMap');
  if (!cv) return;
  const COLS = 60, ROWS = 27;
  const cssWidth = cv.clientWidth || cv.parentElement.clientWidth || 800;
  const S = cssWidth / COLS;
  const cssHeight = S * ROWS;
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(cssWidth * dpr);
  cv.height = Math.round(cssHeight * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  const dotRadius = Math.max(1.6, S * 0.16);
  for (let r = 0; r < ROWS; r++) {
    for (const [a, b] of LAND[r]) {
      for (let c = a; c <= b; c++) {
        const cx = c * S + S / 2, cy = r * S + S / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + BRASS_RGB + ',0.55)';
        ctx.fill();
      }
    }
  }
}

// No city is shown by default — a tooltip only appears once the user
// hovers or clicks/taps a pin. Clicking/tapping makes that city the active
// one, one at a time. Desktop keeps hover as a bonus preview, but a click
// always pins the tooltip open, which is what touch devices need since
// they have no hover state at all.
function setupCityTooltips() {
  const cities = document.querySelectorAll('.city');
  if (!cities.length) return;
  cities.forEach((el) => {
    el.addEventListener('click', () => {
      cities.forEach((c) => c.classList.remove('is-active'));
      el.classList.add('is-active');
    });
  });
}

// Click/tap-driven, not hover — works identically whether the trigger is
// clicked with a mouse or tapped on a touchscreen, and doubles as the
// expand/collapse control for the inline accordion version inside the
// mobile drawer (same markup, same class, CSS just displays it differently
// below the 900px breakpoint).
function setupServicesDropdown() {
  const dropdown = document.querySelector('.nav__dropdown');
  const trigger = document.querySelector('.nav__dropdown-trigger');
  if (!dropdown || !trigger) return;
  const close = () => {
    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !dropdown.classList.contains('is-open');
    dropdown.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  dropdown.querySelectorAll('.nav__dropdown-link').forEach((a) => a.addEventListener('click', close));
}

function setupExperienceReveal() {
  const el = document.querySelector('[data-reveal]');
  if (!el) return;
  if (typeof IntersectionObserver === 'undefined') {
    el.classList.add('is-visible');
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        obs.disconnect();
      }
    });
  }, { threshold: 0.25 });
  obs.observe(el);
}

function setupNavToggle() {
  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;
  const close = () => {
    menu.classList.remove('is-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };
  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
}

// Touch devices have no :hover, so the desktop pattern (hover reveals name,
// click follows the link) would send a tap straight to the partner's site
// with no chance to see who it was. On no-hover devices, the first tap just
// reveals the name/location (same visuals as :hover, via .is-active); only
// a second tap on an already-revealed card follows the link.
function setupPartnerTapReveal() {
  const partners = document.querySelectorAll('.partner');
  if (!partners.length) return;
  if (window.matchMedia('(hover: hover)').matches) return;

  partners.forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!el.classList.contains('is-active')) {
        e.preventDefault();
        partners.forEach((p) => { if (p !== el) p.classList.remove('is-active'); });
        el.classList.add('is-active');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.partner')) {
      partners.forEach((p) => p.classList.remove('is-active'));
    }
  });
}

drawMap();
document.addEventListener('DOMContentLoaded', () => {
  setupCityTooltips();
  setupExperienceReveal();
  setupNavToggle();
  setupServicesDropdown();
  setupPartnerTapReveal();
});
window.addEventListener('resize', drawMap);

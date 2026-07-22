// ---- Footer Year ----
(function () {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ---- Scroll Animations ----
(function () {
  function init() {
    var targets = document.querySelectorAll('.quarto-post, .quarto-grid-item, .presentation-box');
    if (!targets.length || !window.IntersectionObserver) return;
    targets.forEach(function (el, i) {
      el.classList.add('animate-on-scroll');
      el.style.setProperty('--anim-delay', Math.min(i * 60, 300) + 'ms');
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach(function (el) { obs.observe(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---- Intro Button Equalize ----
// When buttons stack, equalizes widths and pins all to the first button's
// left position — so floated images don't shift the lower buttons.
(function () {
  function updateIntroBtns() {
    document.querySelectorAll('.intro-links').forEach(function (container) {
      var btns = Array.from(container.querySelectorAll('.intro-btn'));
      if (btns.length < 2) return;

      // Reset for fresh measurement
      container.style.textAlign = '';
      btns.forEach(function (b) { b.style.width = ''; b.style.marginLeft = ''; });

      // Detect full stacking: every button is on its own row
      var tops = btns.map(function (b) { return Math.round(b.getBoundingClientRect().top); });
      var uniqueTops = tops.filter(function (t, i) { return tops.indexOf(t) === i; });
      var isFullyStacked = uniqueTops.length === btns.length;

      if (isFullyStacked) {
        // Equalize widths
        var maxW = Math.max.apply(null, btns.map(function (b) { return b.offsetWidth; }));
        btns.forEach(function (b) { b.style.width = maxW + 'px'; });

        // Pin all buttons to the first button's left position so they align
        // consistently even when a floated image narrows the container above
        var containerLeft = container.getBoundingClientRect().left;
        var targetLeft = btns[0].getBoundingClientRect().left - containerLeft;
        container.style.textAlign = 'left';
        btns.forEach(function (b) { b.style.marginLeft = targetLeft + 'px'; });
      }
    });
  }
  document.fonts.ready.then(updateIntroBtns);
  window.addEventListener('resize', updateIntroBtns);
})();

// ---- Code Window Language Labels ----
(function () {
  function initCodeWindows() {
    document.querySelectorAll('div.sourceCode').forEach(function (div) {
      var pre = div.querySelector('pre.sourceCode');
      if (!pre) return;
      var lang = Array.from(pre.classList).find(function (c) { return c !== 'sourceCode'; }) || '';
      var label = document.createElement('span');
      label.className = 'code-window-lang';
      label.textContent = lang.toUpperCase();
      div.insertBefore(label, div.firstChild);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeWindows);
  } else {
    initCodeWindows();
  }
})();

// ---- Code Copy Button ----
// Suppress "Copied!" tooltip — checkmark icon is sufficient feedback
document.addEventListener('show.bs.tooltip', function (e) {
  if (e.target.classList.contains('code-copy-button')) e.preventDefault();
});

// Remove focus ring after click
document.addEventListener('click', function (e) {
  if (e.target.closest('.code-copy-button')) e.target.closest('.code-copy-button').blur();
});

// ---- Full-bleed deck: sync --nav-h to the real navbar height ----
// Deck pages (.slide-embed present) render the slide iframe full-bleed beneath
// the fixed navbar, pinned with `inset: var(--nav-h) 0 0 0`. Keep --nav-h equal
// to the actual rendered navbar height across breakpoints and orientation. In
// portrait the whole page is CSS-rotated; offsetHeight is the pre-transform
// layout height, which is exactly what the inset resolves against.
(function () {
  var embed = document.querySelector('.slide-embed');
  if (!embed) return;
  var header = document.querySelector('#quarto-header');
  if (!header) return;
  function syncNavH() {
    var h = header.offsetHeight;
    if (h) document.documentElement.style.setProperty('--nav-h', h + 'px');
  }
  syncNavH();
  window.addEventListener('resize', syncNavH);
  window.addEventListener('orientationchange', syncNavH);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncNavH);
})();

// ---- Full-bleed deck: hand keyboard focus to the slide iframe ----
// Reveal.js binds its keydown handler (arrows, F for fullscreen, etc.) to the
// document INSIDE the iframe, so those keys only work while the iframe window
// holds focus. On load, focus sits on the parent page body, which is why the
// deck needed a click before the keyboard did anything. The parent page and the
// deck are same-origin, so we can just move focus into the iframe directly — no
// synthetic click needed. Re-focus on tab-level refocus (alt-tab back) too; that
// window 'focus' event does not fire on navbar/search clicks, so those still work.
(function () {
  var iframe = document.querySelector('.slide-embed iframe');
  if (!iframe) return;
  function focusDeck() {
    try {
      if (iframe.contentWindow) iframe.contentWindow.focus();
    } catch (e) { /* cross-origin guard; same-origin here so this won't throw */ }
  }
  iframe.addEventListener('load', focusDeck);
  // The lazy iframe may already be loaded by the time this runs.
  try {
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') focusDeck();
  } catch (e) { /* ignore */ }
  window.addEventListener('focus', focusDeck);
})();

// ---- Full-bleed deck: remember slide position for the tab session ----
// Return to the same slide after switching to another site page and back, or
// after a refresh — but start fresh in a new tab. sessionStorage is exactly this
// scope: it lives on the tab (top-level traversable), survives reloads and
// same-tab navigation, and is cleared when the tab closes. The deck runs in a
// same-origin iframe and Quarto exposes reveal.js as `window.Reveal` inside it,
// so the parent reads and drives that instance directly — no deck-side changes.
(function () {
  var iframe = document.querySelector('.slide-embed iframe');
  if (!iframe) return;
  // Key by deck so the three decks track their positions independently.
  var key = 'deckpos:' + (iframe.getAttribute('src') || location.pathname);
  var wired = false;

  function loadPos() {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function savePos(indices) {
    try { sessionStorage.setItem(key, JSON.stringify(indices)); }
    catch (e) { /* storage blocked (private mode): position just won't persist */ }
  }

  // Attach once, as soon as reveal.js inside the iframe is initialized.
  function wire() {
    if (wired) return true;
    var win = iframe.contentWindow;
    var R = win && win.Reveal;
    if (!R || !R.isReady || !R.isReady()) return false;
    wired = true;

    var saved = loadPos();
    if (saved && typeof saved.h === 'number') {
      // Third arg is the fragment (incremental-reveal) index; out-of-range
      // values are clamped by reveal, so an edited deck degrades gracefully.
      R.slide(saved.h, saved.v || 0, saved.f);
    }
    var persist = function () { savePos(R.getIndices()); };
    R.on('slidechanged', persist);
    R.on('fragmentshown', persist);
    R.on('fragmenthidden', persist);
    return true;
  }

  // Reveal initializes asynchronously; poll briefly until it is ready. The
  // `wired` guard keeps the two entry points (immediate + load) from
  // double-attaching listeners.
  function poll(budget) {
    if (wire() || budget <= 0) return;
    setTimeout(function () { poll(budget - 1); }, 100);
  }
  iframe.addEventListener('load', function () { poll(120); }); // ~12s after (re)load
  poll(120); // in case the lazy iframe already finished loading
})();

// ---- Full-bleed deck: home button (jump to the first slide) ----
// A small icon button pinned at the deck's top-left corner. Since positions are
// remembered for the tab session, this lets a student restart the deck at slide
// one on demand. Same-origin iframe, so we drive its Reveal instance directly.
(function () {
  var iframe = document.querySelector('.slide-embed iframe');
  if (!iframe) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'deck-home-btn';
  btn.setAttribute('aria-label', 'Go to the first slide');
  btn.title = 'First slide';
  // Inline Lucide "house" SVG so it does not depend on lucide.createIcons() timing.
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"' +
    ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
    '<polyline points="9 22 9 12 15 12 15 22"/></svg>';
  btn.addEventListener('click', function () {
    try {
      var R = iframe.contentWindow && iframe.contentWindow.Reveal;
      if (R && R.slide) R.slide(0, 0, 0);   // slidechanged then persists position 0
      if (iframe.contentWindow) iframe.contentWindow.focus(); // keep keyboard on deck
    } catch (e) { /* same-origin; ignore */ }
    btn.blur(); // drop the focus ring after a mouse click
  });
  document.body.appendChild(btn);
})();

// ---- GW Seal Logo (navbar far-right) ----
// Inject directly into .navbar-container so `order: 9999` (in CSS) pushes it
// past the search/toggle group, matching how quarto.org places its Posit logo.
(function () {
  function injectGwLogo() {
    var container = document.querySelector('nav.navbar .navbar-container');
    if (!container || container.querySelector('.navbar-gw-link')) return;
    var link = document.createElement('a');
    link.className = 'navbar-gw-link';
    link.href = 'https://www.gwu.edu';
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'The George Washington University');
    var img = document.createElement('img');
    img.src = 'images/gwu-logo.png';
    img.alt = 'The George Washington University';
    link.appendChild(img);
    container.appendChild(link);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGwLogo);
  } else {
    injectGwLogo();
  }
})();

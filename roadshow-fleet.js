(function () {
  'use strict';

  var wrap = document.querySelector('[data-fl-wrap]');
  if (!wrap) return;

  var cur = -1;
  var hold = null;
  var holdY = null;
  var bound = false;

  function bindRail() {
    if (bound) return;
    var rail = document.querySelector('[data-fl-rail]');
    if (!rail) return;
    bound = true;
    rail.addEventListener('mouseover', onOver);
    rail.addEventListener('click', onOver);
  }

  function onOver(e) {
    var row = e.target.closest && e.target.closest('[data-fl-row]');
    if (!row) return;
    hold = Number(row.getAttribute('data-fl-row'));
    holdY = null;
  }

  function scrollY() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function paint(rows, i) {
    wrap.querySelectorAll('[data-fl-img]').forEach(function (el, k) {
      el.classList.toggle('rs-fleet__stage-img--active', k === i);
    });
    rows.forEach(function (el, k) {
      el.classList.toggle('rs-fleet__row--active', k === i);
    });
    var src = rows[i];
    var set = function (sel, val) {
      var el = wrap.querySelector(sel);
      if (el) el.textContent = val;
    };
    set('[data-fl-model="1"]', src.getAttribute('data-fl-model'));
    set('[data-fl-copy="1"]', src.getAttribute('data-fl-copy'));
    set('[data-fl-pax="1"]', src.getAttribute('data-fl-pax'));
    set('[data-fl-bags="1"]', src.getAttribute('data-fl-bags'));
    set('[data-fl-count="1"]', String(i + 1).padStart(2, '0'));
  }

  function tick() {
    bindRail();
    var rows = wrap.querySelectorAll('[data-fl-row]');
    var n = rows.length;
    if (!n) return;
    var y = scrollY();

    if (hold != null) {
      if (holdY == null) holdY = y;
      if (Math.abs(y - holdY) < 30) {
        if (cur !== hold) { cur = hold; paint(rows, hold); }
        return;
      }
      hold = null;
      holdY = null;
    }

    var r = wrap.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
    var i = Math.min(n - 1, Math.max(0, Math.floor(p * n * 0.999)));
    if (i === cur) return;
    cur = i;
    paint(rows, i);
  }

  var raf = null;
  function loop() {
    tick();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
})();

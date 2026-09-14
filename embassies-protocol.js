(function () {
  'use strict';

  var items = document.querySelectorAll('.emb-protocol__item');
  var dots = document.querySelectorAll('.emb-protocol__dot');
  if (!items.length || !dots.length) return;

  var itemList = Array.prototype.slice.call(items);
  var ticking = false;
  var lastActive = -1;

  // Recomputed straight from geometry on every scroll frame, rather than
  // tracked incrementally — this keeps it correct and smooth even through
  // large, fast scroll jumps (trackpad flicks, etc.) since there's no
  // enter/exit state to miss. A stage is "reached" once its dot has
  // crossed the vertical middle of the viewport; every stage at or before
  // that point stays lit, giving the cascading progress-through-the-list
  // feel as the reader scrolls.
  function update() {
    ticking = false;
    var triggerY = window.innerHeight * 0.5;
    var activeIndex = -1;
    for (var i = 0; i < itemList.length; i++) {
      if (itemList[i].getBoundingClientRect().top <= triggerY) activeIndex = i;
    }
    if (activeIndex === lastActive) return;
    lastActive = activeIndex;
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i <= activeIndex);
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

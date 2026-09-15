(function () {
  'use strict';

  var chipsWrap = document.getElementById('fleetChips');
  if (!chipsWrap) return;

  var chips = Array.prototype.slice.call(chipsWrap.querySelectorAll('[data-fleet-chip]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-fleet-sec]'));

  function applySections(cat) {
    sections.forEach(function (s) {
      s.style.display = (cat === 'all' || s.getAttribute('data-fleet-sec') === cat) ? '' : 'none';
    });
  }

  function setActive(cat) {
    chips.forEach(function (chip) {
      chip.classList.toggle('fl-chip--active', chip.getAttribute('data-fleet-chip') === cat);
    });
    applySections(cat);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setActive(chip.getAttribute('data-fleet-chip'));
    });
  });
})();

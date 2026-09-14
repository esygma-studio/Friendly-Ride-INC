(function () {
  'use strict';

  var WHATSAPP_NUMBER = '17182881683'; // +1 718 288 1683, no punctuation, no leading +

  var toggle = document.getElementById('waToggle');
  var panel = document.getElementById('waPanel');
  var closeBtn = document.getElementById('waClose');
  var form = document.getElementById('waForm');
  var input = document.getElementById('waMessage');

  if (!toggle || !panel || !form || !input) return;

  function openPanel() {
    panel.hidden = false;
    toggle.classList.add('is-open');
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    toggle.classList.remove('is-open');
  }

  toggle.addEventListener('click', function () {
    if (panel.hidden) openPanel(); else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim() || 'Hi, I’d like to ask about a reservation.';
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
    input.value = '';
  });
})();

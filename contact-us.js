(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    form: $('ctForm'),
    success: $('ctSuccess'),
    successEmail: $('ctSuccessEmail'),
    resetBtn: $('ctResetBtn'),
    name: $('ctName'),
    company: $('ctCompany'),
    email: $('ctEmail'),
    phone: $('ctPhone'),
    topic: $('ctTopic'),
    message: $('ctMessage'),
    urgent: $('ctUrgent'),
    submitBtn: $('ctSubmitBtn'),
    error: $('ctError'),
  };

  function encodeForm(data) {
    return Object.keys(data)
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); })
      .join('&');
  }

  function submitToNetlify(fields) {
    var payload = {
      'form-name': 'contact',
      'bot-field': '',
      'Full name': fields.name,
      'Company': fields.company,
      'Email': fields.email,
      'Phone': fields.phone,
      'Topic': fields.topic,
      'Message': fields.message,
      'Urgent': fields.urgent ? 'Yes' : 'No',
    };
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForm(payload),
    }).then(function (res) {
      if (!res.ok) {
        console.error('Contact form submission was rejected (HTTP ' + res.status + '). This page is not being served by Netlify, so the inquiry was NOT delivered.');
      }
    }).catch(function (err) {
      console.error('Contact form submission failed to send:', err);
    });
  }

  function submit() {
    var name = el.name.value.trim();
    var email = el.email.value.trim();
    var phone = el.phone.value.trim();
    var message = el.message.value.trim();

    if (!name) { el.error.textContent = 'Please add your name.'; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { el.error.textContent = 'Please add a valid email address.'; return; }
    if (!phone) { el.error.textContent = 'Please add a phone number so dispatch can reach you.'; return; }
    if (message.length < 10) { el.error.textContent = 'Please tell us a little more about what you need.'; return; }

    el.error.textContent = '';

    submitToNetlify({
      name: name,
      company: el.company.value.trim(),
      email: email,
      phone: phone,
      topic: el.topic.value,
      message: message,
      urgent: el.urgent.checked,
    });

    el.successEmail.textContent = email;
    el.form.hidden = true;
    el.success.hidden = false;
    window.scrollTo({ top: el.success.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
  }

  function reset() {
    el.name.value = '';
    el.company.value = '';
    el.email.value = '';
    el.phone.value = '';
    el.topic.selectedIndex = 0;
    el.message.value = '';
    el.urgent.checked = false;
    el.error.textContent = '';
    el.success.hidden = true;
    el.form.hidden = false;
  }

  [el.name, el.company, el.email, el.phone, el.message].forEach(function (input) {
    input.addEventListener('input', function () { el.error.textContent = ''; });
  });

  el.submitBtn.addEventListener('click', submit);
  el.resetBtn.addEventListener('click', reset);
})();

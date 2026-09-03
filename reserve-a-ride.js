(function () {
  'use strict';

  var SERVICES = [
    { id: 'airport', name: 'Airport Transfer', mode: 'transfer', airport: true },
    { id: 'p2p', name: 'Point to Point', mode: 'transfer' },
    { id: 'directed', name: 'As Directed — Hourly', mode: 'hourly' },
  ];

  var VEHICLES = [
    { id: 'sedan', name: 'Mercedes-Benz E-Class', klass: 'Executive Sedan', guests: 3, luggage: 3, tag: 'Most requested', img: 'assets/reserve-veh-sedan.webp' },
    { id: 'suv', name: 'Full-size Luxury SUV', klass: 'First Class SUV', guests: 6, luggage: 6, tag: 'Groups of six', img: 'assets/reserve-veh-suv.webp' },
    { id: 'sclass', name: 'Mercedes-Benz S-Class', klass: 'Luxury Sedan', guests: 3, luggage: 3, tag: 'Flagship', img: 'assets/reserve-veh-sclass.webp' },
    { id: 'maybach', name: 'Mercedes-Maybach', klass: 'Ultra Luxury Sedan', guests: 3, luggage: 2, tag: "Chauffeur's best", img: 'assets/reserve-veh-maybach.webp' },
    { id: 'sprinter', name: 'Executive Sprinter Van', klass: 'Luxury Van', guests: 14, luggage: 14, tag: 'Up to fourteen', img: 'assets/reserve-veh-sprinter.webp' },
  ];

  var AIRPORTS = ['JFK — John F. Kennedy', 'LGA — LaGuardia', 'EWR — Newark Liberty', 'TEB — Teterboro', 'HPN — Westchester County', 'ISP — Long Island MacArthur', 'Private FBO — specify in notes'];

  var SEATS = [
    { key: 'infant', name: 'Infant', note: '0–12 months' },
    { key: 'toddler', name: 'Toddler', note: '1–4 years' },
    { key: 'booster', name: 'Booster', note: '4–8 years' },
  ];

  var EXTRAS = [
    { key: 'greet', name: 'Meet & greet with name placard' },
    { key: 'water', name: 'Bottled water & chilled towels' },
    { key: 'wheelchair', name: 'Wheelchair accessible' },
    { key: 'bilingual', name: 'Bilingual chauffeur' },
  ];

  var STEP_TITLES = ['Trip', 'Vehicle', 'Details'];

  function todayPlusOne() {
    var d = new Date(Date.now() + 86400000);
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  var state = {
    step: 1,
    service: 'airport',
    direction: 'arrival',
    pickup: '', dropoff: '',
    airport: AIRPORTS[0], airline: '', flight: '',
    stops: [],
    date: todayPlusOne(), time: '09:00',
    hours: '4',
    pax: 2, bags: 2,
    seatsOpen: false, extrasOpen: false,
    seats: { infant: 0, toddler: 0, booster: 0 },
    extras: {},
    vehicle: '',
    authMode: 'guest', authEmail: '', authPass: '', authConfirm: '', authStatus: '', saveProfile: true,
    first: '', last: '', email: '', phone: '', notes: '',
    hint: '', reference: '',
  };

  function setState(patch) {
    Object.assign(state, patch);
    render();
  }

  function svc() {
    var found = null;
    SERVICES.forEach(function (s) { if (s.id === state.service) found = s; });
    return found || SERVICES[0];
  }

  function shape() {
    var sv = svc();
    if (sv.airport) {
      return state.direction === 'arrival'
        ? { pickup: 'airport', drop: 'address' }
        : { pickup: 'address', drop: 'airport' };
    }
    if (sv.mode === 'hourly') return { pickup: 'address', drop: 'none' };
    return { pickup: 'address', drop: 'address' };
  }

  function tripError() {
    var sh = shape();
    if (sh.pickup === 'address' && !state.pickup.trim()) return 'Add a pickup address.';
    if (sh.drop === 'address' && !state.dropoff.trim()) return 'Add a drop-off address.';
    return '';
  }

  function fmtDate() {
    var parts = (state.date || '').split('-').map(Number);
    var y = parts[0], m = parts[1], dd = parts[2];
    if (!y) return '—';
    return new Date(y, m - 1, dd).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function fmtTime() {
    var parts = (state.time || '').split(':').map(Number);
    var hh = parts[0], mm = parts[1];
    if (isNaN(hh)) return '';
    var ap = hh < 12 ? 'AM' : 'PM';
    var h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ':' + String(mm).padStart(2, '0') + ' ' + ap;
  }

  function goTo(n) {
    if (n === state.step) return;
    if (n > 1) {
      var err = tripError();
      if (err) return setState({ step: 1, hint: err });
    }
    if (n > 2 && !state.vehicle) return setState({ step: 2, hint: 'Select a vehicle.' });
    if (n === 4 && !state.reference) return setState({ step: 3, hint: 'Submit the inquiry to finish.' });
    setState({ step: n, hint: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function next2() {
    var sh = shape();
    if (sh.pickup === 'address' && !state.pickup.trim()) return setState({ hint: 'Add a pickup address.' });
    if (sh.drop === 'address' && !state.dropoff.trim()) return setState({ hint: 'Add a drop-off address.' });
    setState({ step: 2, hint: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function next3() {
    if (!state.vehicle) return setState({ hint: 'Select a vehicle.' });
    setState({ step: 3, hint: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit() {
    if (!state.first.trim() || !state.email.trim() || !state.phone.trim()) {
      return setState({ hint: 'Name, email and mobile are required.' });
    }
    setState({ step: 4, hint: '', reference: 'FRL-' + Math.random().toString(36).slice(2, 7).toUpperCase() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setState({ step: 1, vehicle: '', pickup: '', dropoff: '', stops: [], notes: '', hint: '', reference: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- DOM refs ----------
  var $ = function (id) { return document.getElementById(id); };

  var el = {
    steps: $('rsvSteps'),
    fService: $('fService'),
    dirToggleWrap: $('dirToggleWrap'), dirArrival: $('dirArrival'), dirDeparture: $('dirDeparture'),
    pickupAirportWrap: $('pickupAirportWrap'), fPickupAirport: $('fPickupAirport'),
    pickupAddressWrap: $('pickupAddressWrap'), fPickup: $('fPickup'),
    dropAddressWrap: $('dropAddressWrap'), fDropoff: $('fDropoff'),
    dropAirportWrap: $('dropAirportWrap'), fDropAirport: $('fDropAirport'),
    flightWrap: $('flightWrap'), fAirline: $('fAirline'), fFlight: $('fFlight'),
    hourlyNote: $('hourlyNote'),
    stopsWrap: $('stopsWrap'), addStopBtn: $('addStopBtn'),
    fDate: $('fDate'), fTime: $('fTime'),
    hoursWrap: $('hoursWrap'), fHours: $('fHours'),
    paxVal: $('paxVal'), paxUp: $('paxUp'), paxDown: $('paxDown'),
    bagVal: $('bagVal'), bagUp: $('bagUp'), bagDown: $('bagDown'),
    showSeatsBtn: $('showSeatsBtn'), hideSeatsBtn: $('hideSeatsBtn'), seatsPanel: $('seatsPanel'), seatGrid: $('seatGrid'),
    showExtrasBtn: $('showExtrasBtn'), hideExtrasBtn: $('hideExtrasBtn'), extrasPanel: $('extrasPanel'), extraGrid: $('extraGrid'),
    toStep2Btn: $('toStep2Btn'), hint1: $('hint1'),
    panel1: $('panel1'), panel2: $('panel2'), panel3: $('panel3'), panel4: $('panel4'),
    vehicleList: $('vehicleList'), backTo1Btn: $('backTo1Btn'), toStep3Btn: $('toStep3Btn'), hint2: $('hint2'),
    authTabs: $('authTabs'), signinPanel: $('signinPanel'), createPanel: $('createPanel'),
    authEmail1: $('authEmail1'), authPass1: $('authPass1'), signInBtn: $('signInBtn'), authStatus1: $('authStatus1'),
    authEmail2: $('authEmail2'), authPass2: $('authPass2'), authConfirm2: $('authConfirm2'),
    saveProfileToggle: $('saveProfileToggle'), saveProfileBox: $('saveProfileBox'), authStatus2: $('authStatus2'),
    fFirst: $('fFirst'), fLast: $('fLast'), fEmail: $('fEmail'), fPhone: $('fPhone'), fNotes: $('fNotes'),
    backTo2Btn: $('backTo2Btn'), submitBtn: $('submitBtn'), hint3: $('hint3'),
    referenceCode: $('referenceCode'), newReservationBtn: $('newReservationBtn'),
    summaryBody: $('summaryBody'),
  };

  // ---------- static option lists (built once) ----------
  AIRPORTS.forEach(function (a) {
    el.fPickupAirport.appendChild(new Option(a, a));
    el.fDropAirport.appendChild(new Option(a, a));
  });

  // ---------- render ----------
  function render() {
    var sv = svc();
    var sh = shape();
    var isHourly = sv.mode === 'hourly';

    // step tracker
    var stepBtns = el.steps.querySelectorAll('.rsv-step');
    stepBtns.forEach(function (btn, i) {
      var n = i + 1;
      btn.classList.toggle('is-active', state.step === n);
      btn.classList.toggle('is-done', state.step > n);
    });

    // panels
    el.panel1.hidden = state.step !== 1;
    el.panel2.hidden = state.step !== 2;
    el.panel3.hidden = state.step !== 3;
    el.panel4.hidden = state.step !== 4;

    // step 1 field shape
    el.dirToggleWrap.hidden = !sv.airport;
    el.dirArrival.classList.toggle('is-active', state.direction === 'arrival');
    el.dirDeparture.classList.toggle('is-active', state.direction === 'departure');

    el.pickupAirportWrap.hidden = sh.pickup !== 'airport';
    el.pickupAddressWrap.hidden = sh.pickup !== 'address';
    el.dropAddressWrap.hidden = sh.drop !== 'address';
    el.dropAirportWrap.hidden = sh.drop !== 'airport';
    el.flightWrap.hidden = !sv.airport;
    el.hourlyNote.hidden = !isHourly;
    el.hoursWrap.hidden = !isHourly;

    if (el.fService.value !== state.service) el.fService.value = state.service;
    if (el.fPickup.value !== state.pickup) el.fPickup.value = state.pickup;
    if (el.fDropoff.value !== state.dropoff) el.fDropoff.value = state.dropoff;
    if (el.fPickupAirport.value !== state.airport) el.fPickupAirport.value = state.airport;
    if (el.fDropAirport.value !== state.airport) el.fDropAirport.value = state.airport;
    if (el.fAirline.value !== state.airline) el.fAirline.value = state.airline;
    if (el.fFlight.value !== state.flight) el.fFlight.value = state.flight;
    if (el.fDate.value !== state.date) el.fDate.value = state.date;
    if (el.fTime.value !== state.time) el.fTime.value = state.time;
    if (el.fHours.value !== state.hours) el.fHours.value = state.hours;

    // stops
    el.stopsWrap.innerHTML = '';
    state.stops.forEach(function (v, i) {
      var row = document.createElement('div');
      row.className = 'rsv-stop-row';

      var field = document.createElement('div');
      field.className = 'rsv-field';
      var label = document.createElement('label');
      label.className = 'rsv-label';
      label.textContent = 'Stop ' + (i + 1);
      var input = document.createElement('input');
      input.className = 'rsv-input';
      input.placeholder = 'Intermediate address';
      input.value = v;
      input.addEventListener('input', function (e) {
        var arr = state.stops.slice();
        arr[i] = e.target.value;
        state.stops = arr;
      });
      field.appendChild(label);
      field.appendChild(input);

      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'rsv-stop-remove';
      rm.textContent = 'Remove';
      rm.addEventListener('click', function () {
        setState({ stops: state.stops.filter(function (_, j) { return j !== i; }) });
      });

      row.appendChild(field);
      row.appendChild(rm);
      el.stopsWrap.appendChild(row);
    });

    // pax / bags
    el.paxVal.textContent = state.pax;
    el.bagVal.textContent = state.bags;
    el.paxDown.disabled = state.pax <= 1;
    el.paxUp.disabled = state.pax >= 14;
    el.bagDown.disabled = state.bags <= 0;
    el.bagUp.disabled = state.bags >= 20;

    // seats panel
    el.seatsPanel.hidden = !state.seatsOpen;
    el.showSeatsBtn.hidden = state.seatsOpen;
    if (state.seatsOpen) {
      el.seatGrid.innerHTML = '';
      SEATS.forEach(function (c) {
        var card = document.createElement('div');
        card.className = 'rsv-option-card';
        card.innerHTML =
          '<div class="rsv-option-card__name">' + c.name + '</div>' +
          '<div class="rsv-option-card__note">' + c.note + '</div>';
        var counter = document.createElement('div');
        counter.className = 'rsv-option-card__counter';
        var down = document.createElement('button');
        down.type = 'button'; down.className = 'rsv-counter__btn'; down.textContent = '−';
        down.addEventListener('click', function () { bumpSeat(c.key, -1); });
        var val = document.createElement('span');
        val.className = 'rsv-counter__val'; val.textContent = state.seats[c.key];
        var up = document.createElement('button');
        up.type = 'button'; up.className = 'rsv-counter__btn'; up.textContent = '+';
        up.addEventListener('click', function () { bumpSeat(c.key, 1); });
        counter.appendChild(down); counter.appendChild(val); counter.appendChild(up);
        card.appendChild(counter);
        el.seatGrid.appendChild(card);
      });
    }

    // extras panel
    el.extrasPanel.hidden = !state.extrasOpen;
    el.showExtrasBtn.hidden = state.extrasOpen;
    if (state.extrasOpen) {
      el.extraGrid.innerHTML = '';
      EXTRAS.forEach(function (x) {
        var on = !!state.extras[x.key];
        var card = document.createElement('div');
        card.className = 'rsv-extra-card' + (on ? ' is-selected' : '');
        var box = document.createElement('span');
        box.className = 'rsv-checkbox' + (on ? ' is-checked' : '');
        var label = document.createElement('span');
        label.className = 'rsv-extra-card__label';
        label.textContent = x.name;
        card.appendChild(box);
        card.appendChild(label);
        card.addEventListener('click', function () { toggleExtra(x.key); });
        el.extraGrid.appendChild(card);
      });
    }

    el.hint1.textContent = state.step === 1 ? state.hint : '';

    // step 2: vehicles
    el.vehicleList.innerHTML = '';
    VEHICLES.forEach(function (v) {
      var on = v.id === state.vehicle;
      var small = v.guests < state.pax;
      var tag = small ? 'Too small' : v.tag;
      var card = document.createElement('div');
      card.className = 'rsv-vehicle-card' + (on ? ' is-selected' : '');
      card.innerHTML =
        '<img class="rsv-vehicle-card__img" src="' + v.img + '" alt="' + v.name + '" style="filter:' + (small ? 'grayscale(.8) brightness(.8)' : 'none') + '">' +
        '<div style="min-width:0">' +
          '<div class="rsv-vehicle-card__top">' +
            '<div class="rsv-vehicle-card__klass">' + v.klass + '</div>' +
            '<div class="rsv-vehicle-card__tag"' + (small ? ' style="color:#B4705A;border-color:rgba(180,112,90,.5)"' : '') + '>' + tag + '</div>' +
          '</div>' +
          '<div class="rsv-vehicle-card__name">' + v.name + '</div>' +
          '<div class="rsv-vehicle-card__capacity">Up to ' + v.guests + ' guests &middot; ' + v.luggage + ' bags</div>' +
        '</div>';
      card.addEventListener('click', function () { setState({ vehicle: v.id, hint: '' }); });
      el.vehicleList.appendChild(card);
    });
    el.hint2.textContent = state.step === 2 ? state.hint : '';

    // step 3: auth tabs
    el.authTabs.querySelectorAll('.rsv-auth-tab').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.mode === state.authMode);
    });
    el.signinPanel.hidden = state.authMode !== 'signin';
    el.createPanel.hidden = state.authMode !== 'create';
    el.authStatus1.textContent = state.authStatus || 'Signing in fills your saved addresses and billing reference.';
    el.saveProfileBox.classList.toggle('is-checked', state.saveProfile);

    if (el.authEmail1.value !== state.authEmail) el.authEmail1.value = state.authEmail;
    if (el.authPass1.value !== state.authPass) el.authPass1.value = state.authPass;
    if (el.authEmail2.value !== state.authEmail) el.authEmail2.value = state.authEmail;
    if (el.authPass2.value !== state.authPass) el.authPass2.value = state.authPass;
    if (el.authConfirm2.value !== state.authConfirm) el.authConfirm2.value = state.authConfirm;

    if (el.fFirst.value !== state.first) el.fFirst.value = state.first;
    if (el.fLast.value !== state.last) el.fLast.value = state.last;
    if (el.fEmail.value !== state.email) el.fEmail.value = state.email;
    if (el.fPhone.value !== state.phone) el.fPhone.value = state.phone;
    if (el.fNotes.value !== state.notes) el.fNotes.value = state.notes;

    el.hint3.textContent = state.step === 3 ? state.hint : '';

    // step 4
    el.referenceCode.textContent = state.reference;

    // sidebar summary
    var veh = null;
    VEHICLES.forEach(function (v) { if (v.id === state.vehicle) veh = v; });
    var pickupText = sh.pickup === 'airport' ? state.airport : (state.pickup.trim() || 'Not set');
    var dropText = sh.drop === 'none' ? 'As directed' : sh.drop === 'airport' ? state.airport : (state.dropoff.trim() || 'Not set');

    var summary = [
      { k: 'Service', v: sv.name },
      { k: 'When', v: fmtDate() + ' · ' + fmtTime() + (isHourly ? ' · ' + state.hours + ' hrs' : '') },
      { k: 'From', v: pickupText },
      { k: 'To', v: dropText },
    ];
    var liveStops = state.stops.filter(function (x) { return x.trim(); });
    if (liveStops.length) summary.push({ k: 'Stops', v: liveStops.join(' → ') });
    if (sv.airport && (state.airline || state.flight)) summary.push({ k: 'Flight', v: [state.airline, state.flight].filter(Boolean).join(' ') });
    summary.push({ k: 'Party', v: state.pax + ' pax · ' + state.bags + ' bags' });
    summary.push({ k: 'Vehicle', v: veh ? veh.name : 'Not selected' });
    var seatList = SEATS.filter(function (c) { return state.seats[c.key]; }).map(function (c) { return state.seats[c.key] + '× ' + c.name; });
    if (seatList.length) summary.push({ k: 'Child seats', v: seatList.join(', ') });
    var exList = EXTRAS.filter(function (x) { return state.extras[x.key]; }).map(function (x) { return x.name; });
    if (exList.length) summary.push({ k: 'Requests', v: exList.join(' · ') });

    el.summaryBody.innerHTML = '';
    summary.forEach(function (row) {
      var r = document.createElement('div');
      r.className = 'rsv-sidebar__row';
      r.innerHTML = '<span class="rsv-sidebar__row-label">' + row.k + '</span><span class="rsv-sidebar__row-val">' + row.v + '</span>';
      el.summaryBody.appendChild(r);
    });
  }

  function bumpSeat(key, d) {
    var next = Math.max(0, Math.min(4, state.seats[key] + d));
    state.seats = Object.assign({}, state.seats, (function () { var o = {}; o[key] = next; return o; })());
    render();
  }

  function toggleExtra(key) {
    var next = Object.assign({}, state.extras);
    next[key] = !next[key];
    state.extras = next;
    render();
  }

  // ---------- events ----------
  el.fService.addEventListener('change', function (e) { setState({ service: e.target.value, vehicle: '', hint: '' }); });
  el.dirArrival.addEventListener('click', function () { setState({ direction: 'arrival', hint: '' }); });
  el.dirDeparture.addEventListener('click', function () { setState({ direction: 'departure', hint: '' }); });

  el.fPickup.addEventListener('input', function (e) { state.pickup = e.target.value; state.hint = ''; });
  el.fDropoff.addEventListener('input', function (e) { state.dropoff = e.target.value; state.hint = ''; });
  el.fPickupAirport.addEventListener('change', function (e) { state.airport = e.target.value; });
  el.fDropAirport.addEventListener('change', function (e) { state.airport = e.target.value; });
  el.fAirline.addEventListener('input', function (e) { state.airline = e.target.value; });
  el.fFlight.addEventListener('input', function (e) { state.flight = e.target.value; });
  el.fDate.addEventListener('change', function (e) { state.date = e.target.value; });
  el.fTime.addEventListener('change', function (e) { state.time = e.target.value; });
  el.fHours.addEventListener('change', function (e) { state.hours = e.target.value; });

  el.addStopBtn.addEventListener('click', function () { setState({ stops: state.stops.concat('') }); });

  el.paxUp.addEventListener('click', function () { setState({ pax: Math.min(14, state.pax + 1) }); });
  el.paxDown.addEventListener('click', function () { setState({ pax: Math.max(1, state.pax - 1) }); });
  el.bagUp.addEventListener('click', function () { setState({ bags: Math.min(20, state.bags + 1) }); });
  el.bagDown.addEventListener('click', function () { setState({ bags: Math.max(0, state.bags - 1) }); });

  el.showSeatsBtn.addEventListener('click', function () { setState({ seatsOpen: true }); });
  el.hideSeatsBtn.addEventListener('click', function () { setState({ seatsOpen: false, seats: { infant: 0, toddler: 0, booster: 0 } }); });
  el.showExtrasBtn.addEventListener('click', function () { setState({ extrasOpen: true }); });
  el.hideExtrasBtn.addEventListener('click', function () { setState({ extrasOpen: false, extras: {} }); });

  el.toStep2Btn.addEventListener('click', next2);
  el.backTo1Btn.addEventListener('click', function () { goTo(1); });
  el.toStep3Btn.addEventListener('click', next3);
  el.backTo2Btn.addEventListener('click', function () { goTo(2); });
  el.submitBtn.addEventListener('click', submit);
  el.newReservationBtn.addEventListener('click', resetForm);

  el.steps.querySelectorAll('.rsv-step').forEach(function (btn) {
    btn.addEventListener('click', function () { goTo(Number(btn.dataset.step)); });
  });

  el.authTabs.querySelectorAll('.rsv-auth-tab').forEach(function (btn) {
    btn.addEventListener('click', function () { setState({ authMode: btn.dataset.mode, authStatus: '' }); });
  });
  el.authEmail1.addEventListener('input', function (e) { state.authEmail = e.target.value; });
  el.authPass1.addEventListener('input', function (e) { state.authPass = e.target.value; });
  el.authEmail2.addEventListener('input', function (e) { state.authEmail = e.target.value; });
  el.authPass2.addEventListener('input', function (e) { state.authPass = e.target.value; });
  el.authConfirm2.addEventListener('input', function (e) { state.authConfirm = e.target.value; });
  el.signInBtn.addEventListener('click', function () {
    var ok = state.authEmail.trim() && state.authPass;
    setState({
      authStatus: ok ? 'Signed in as ' + state.authEmail.trim() + '.' : 'Enter your email and password to sign in.',
      email: ok ? state.authEmail.trim() : state.email,
    });
  });
  el.saveProfileToggle.addEventListener('click', function () { setState({ saveProfile: !state.saveProfile }); });

  el.fFirst.addEventListener('input', function (e) { state.first = e.target.value; });
  el.fLast.addEventListener('input', function (e) { state.last = e.target.value; });
  el.fEmail.addEventListener('input', function (e) { state.email = e.target.value; });
  el.fPhone.addEventListener('input', function (e) { state.phone = e.target.value; });
  el.fNotes.addEventListener('input', function (e) { state.notes = e.target.value; });

  render();
})();

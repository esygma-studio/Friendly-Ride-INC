(function () {
  'use strict';

  var PLACE_ID = 'ChIJZanh-0VfwokRjLg_MhyxGWs';
  var MAX_CHARS = 230;
  var MOBILE_BREAKPOINT = 640;

  var grid = document.getElementById('testimonialsGrid');
  var ratingWrap = document.getElementById('testimonialsRating');
  var ratingStars = document.getElementById('testimonialsRatingStars');
  var ratingText = document.getElementById('testimonialsRatingText');
  var attribution = document.getElementById('testimonialsAttribution');
  var prevBtn = document.getElementById('testimonialsPrev');
  var nextBtn = document.getElementById('testimonialsNext');
  var dotsWrap = document.getElementById('testimonialsDots');

  if (!grid) return;

  // ---------- carousel ----------
  var carouselIndex = 0;

  function visibleCount() {
    return window.innerWidth <= MOBILE_BREAKPOINT ? 1 : 3;
  }

  function cardStep() {
    var card = grid.querySelector('.testimonial');
    if (!card) return 0;
    var gap = parseFloat(getComputedStyle(grid).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function maxIndex() {
    return Math.max(0, grid.children.length - visibleCount());
  }

  function updateCarousel() {
    var total = grid.children.length;
    var vc = visibleCount();
    carouselIndex = Math.min(carouselIndex, maxIndex());
    grid.style.transform = 'translateX(-' + (carouselIndex * cardStep()) + 'px)';

    var needsNav = total > vc;
    prevBtn.hidden = !needsNav;
    nextBtn.hidden = !needsNav;
    prevBtn.disabled = carouselIndex <= 0;
    nextBtn.disabled = carouselIndex >= maxIndex();

    var dotCount = maxIndex() + 1;
    dotsWrap.innerHTML = '';
    if (!needsNav || dotCount <= 1) {
      dotsWrap.hidden = true;
    } else {
      dotsWrap.hidden = false;
      for (var i = 0; i < dotCount; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'testimonials__dot' + (i === carouselIndex ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
        dot.addEventListener('click', (function (idx) {
          return function () { carouselIndex = idx; updateCarousel(); };
        })(i));
        dotsWrap.appendChild(dot);
      }
    }
  }

  function resetCarousel() {
    carouselIndex = 0;
    updateCarousel();
  }

  prevBtn.addEventListener('click', function () {
    carouselIndex = Math.max(0, carouselIndex - 1);
    updateCarousel();
  });
  nextBtn.addEventListener('click', function () {
    carouselIndex = Math.min(maxIndex(), carouselIndex + 1);
    updateCarousel();
  });
  window.addEventListener('resize', updateCarousel);

  resetCarousel(); // sets up nav for the static fallback cards already in the HTML

  // ---------- live Google reviews ----------
  function starsSvg(filled) {
    var path = 'M12 2.5l2.9 6 6.6.8-4.8 4.6 1.2 6.6L12 17l-5.9 3.5 1.2-6.6L2.5 9.3l6.6-.8z';
    var color = filled ? '#A8895C' : 'rgba(168,137,92,.28)';
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + color + '"><path d="' + path + '"></path></svg>';
  }

  function renderStars(rating) {
    var rounded = Math.round(rating * 2) / 2;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += starsSvg(i <= rounded);
    }
    return html;
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function truncate(text) {
    if (text.length <= MAX_CHARS) return text;
    var cut = text.slice(0, MAX_CHARS);
    var lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 0) cut = cut.slice(0, lastSpace);
    return cut + '…';
  }

  function buildCard(review) {
    var author = review.authorAttribution || {};
    var name = author.displayName || 'Google user';
    var text = truncate((review.text || '').trim());
    if (!text) return null;

    var avatarHtml = author.photoURI
      ? '<img src="' + author.photoURI + '" alt="" class="testimonial__avatar testimonial__avatar--photo" referrerpolicy="no-referrer">'
      : '<div class="testimonial__avatar">' + escapeHtml(initials(name)) + '</div>';

    var nameHtml = author.uri
      ? '<a href="' + author.uri + '" target="_blank" rel="noopener" class="testimonial__name">' + escapeHtml(name) + '</a>'
      : '<span class="testimonial__name">' + escapeHtml(name) + '</span>';

    var card = document.createElement('div');
    card.className = 'testimonial';
    card.innerHTML =
      '<div class="testimonial__stars">' + renderStars(review.rating || 5) + '</div>' +
      '<p class="testimonial__text">' + escapeHtml(text) + '</p>' +
      '<div class="testimonial__author">' +
        avatarHtml +
        '<div>' + nameHtml +
          '<div class="testimonial__meta">Google review &middot; ' + escapeHtml(review.relativePublishTimeDescription || '') + '</div>' +
        '</div>' +
      '</div>';
    return card;
  }

  async function loadReviews() {
    if (!window.google || !google.maps || !google.maps.importLibrary) {
      console.warn('Google Maps API failed to load — showing fallback testimonials.');
      return;
    }

    var Place;
    try {
      ({ Place } = await google.maps.importLibrary('places'));
    } catch (err) {
      console.warn('Google Places library failed to load — showing fallback testimonials.', err);
      return;
    }

    var place = new Place({ id: PLACE_ID });
    try {
      await place.fetchFields({ fields: ['displayName', 'rating', 'userRatingCount', 'reviews'] });
    } catch (err) {
      console.warn('Google Place Details request failed — showing fallback testimonials.', err);
      return;
    }

    // Google's Place Details endpoint caps this at 5 reviews total (its own
    // "most relevant" selection, not the full list) — there is no request
    // parameter to raise that. We show whichever of those 5 are 5-star,
    // newest first; it will rarely be more than 5 cards.
    var reviews = (place.reviews || []).filter(function (r) { return r.rating === 5; });
    reviews.sort(function (a, b) {
      var ta = a.publishTime ? new Date(a.publishTime).getTime() : 0;
      var tb = b.publishTime ? new Date(b.publishTime).getTime() : 0;
      return tb - ta;
    });

    var cards = [];
    for (var i = 0; i < reviews.length; i++) {
      var card = buildCard(reviews[i]);
      if (card) cards.push(card);
    }

    if (!cards.length) {
      console.warn('No usable 5-star Google reviews returned — showing fallback testimonials.');
      return;
    }

    var moreCard = document.getElementById('testimonialsMoreCard');
    grid.innerHTML = '';
    cards.forEach(function (c) { grid.appendChild(c); });
    if (moreCard) grid.appendChild(moreCard); // re-append the "see more on Google" slide, wiped by innerHTML=''
    resetCarousel();

    if (typeof place.rating === 'number') {
      ratingStars.innerHTML = renderStars(place.rating);
      var count = place.userRatingCount;
      ratingText.textContent = place.rating.toFixed(1) + (count ? ' from ' + count + ' Google reviews' : ' on Google');
      ratingWrap.hidden = false;
    }

    attribution.hidden = false;
  }

  loadReviews();
})();

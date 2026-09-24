(() => {
  const track = document.getElementById('hotelCarouselTrack');
  if (!track) return;

  const prevBtn = document.getElementById('hotelCarouselPrev');
  const nextBtn = document.getElementById('hotelCarouselNext');
  const dotsWrap = document.getElementById('hotelCarouselDots');
  const cards = Array.from(track.querySelectorAll('.hotel-carousel__card'));

  // Build one dot per card
  const dots = cards.map((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hotel-carousel__dot';
    dot.setAttribute('aria-label', 'Scroll to ' + (card.querySelector('.hotel-carousel__name')?.textContent || 'property ' + (i + 1)));
    dot.addEventListener('click', () => {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  // Highlight only the single card nearest the center of the track (hover still
  // works independently via CSS :hover) — recalculated as the user scrolls.
  let hovering = false;
  function updateActiveByScroll() {
    if (hovering) return;
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    cards.forEach((card, i) => card.classList.toggle('is-active', i === closest));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === closest));
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      hovering = true;
      cards.forEach((c) => c.classList.remove('is-active'));
      dots.forEach((d) => d.classList.remove('is-active'));
      const i = cards.indexOf(card);
      card.classList.add('is-active');
      dots[i]?.classList.add('is-active');
    });
    card.addEventListener('mouseleave', () => {
      hovering = false;
      updateActiveByScroll();
    });
  });

  function cardStep() {
    const card = cards[0];
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '22');
    return card.getBoundingClientRect().width + gap;
  }

  function updateArrows() {
    const max = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= max;
  }

  prevBtn?.addEventListener('click', () => {
    track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  });
  nextBtn?.addEventListener('click', () => {
    track.scrollBy({ left: cardStep(), behavior: 'smooth' });
  });

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateArrows();
        updateActiveByScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateArrows();
    updateActiveByScroll();
  });

  updateArrows();
  updateActiveByScroll();
})();

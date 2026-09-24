(() => {
  const track = document.getElementById('hotelCarouselTrack');
  if (!track) return;

  const prevBtn = document.getElementById('hotelCarouselPrev');
  const nextBtn = document.getElementById('hotelCarouselNext');
  const cards = Array.from(track.querySelectorAll('.hotel-carousel__card'));

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
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateArrows);
  updateArrows();
})();

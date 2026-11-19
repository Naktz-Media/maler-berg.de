(() => {
  // Header border once the page scrolls
  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Enquiry form: build a mailto with the fields filled in
  const form = document.getElementById('ask');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const body = [
      `Name: ${f.get('name') || ''}`,
      `Telefon: ${f.get('tel') || ''}`,
      `Leistung: ${f.get('was') || ''}`,
      '',
      f.get('text') || '',
    ].join('\n');
    location.href = `mailto:info@maler-berg.de?subject=${encodeURIComponent('Angebotsanfrage: ' + f.get('was'))}&body=${encodeURIComponent(body)}`;
  });

  // Service slider arrows
  const track = document.getElementById('track');
  document.querySelectorAll('.slider__nav .round').forEach((b) => b.addEventListener('click', () => {
    const card = track.querySelector('.card');
    track.scrollBy({ left: (card.offsetWidth + 20) * Number(b.dataset.dir), behavior: 'smooth' });
  }));

  // Process steps: one open at a time
  const steps = [...document.querySelectorAll('#steps li')];
  steps.forEach((li) => li.querySelector('button').addEventListener('click', () => {
    steps.forEach((o) => { const on = o === li; o.classList.toggle('is-on', on); o.querySelector('button').setAttribute('aria-expanded', on); });
  }));

  // Reveal on scroll
  const els = document.querySelectorAll('.services__head, .card, .process__left, .steps, .area, .crew h2, .crew__row, .why__grid, .cta, .faq__list, .foot');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((list) => list.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); setTimeout(() => en.target.classList.remove('rise', 'in'), 1000); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('rise'); io.observe(el); } });
})();

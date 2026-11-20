(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Header border once the page scrolls
  const top = $('.top');
  if (top) {
    const onScroll = () => top.classList.toggle('is-scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // Phone menu: the button opens the pages as a list
  const burger = $('.burger');
  if (top && burger) {
    const setOpen = (on) => {
      top.classList.toggle('is-open', on);
      burger.setAttribute('aria-expanded', on);
      burger.setAttribute('aria-label', on ? 'Menü schließen' : 'Menü öffnen');
    };
    burger.addEventListener('click', () => setOpen(!top.classList.contains('is-open')));
    $$('.top__nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 721px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  // Enquiry form: build a mailto with the fields filled in
  const form = $('#ask');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const body = [`Name: ${f.get('name') || ''}`, `Telefon: ${f.get('tel') || ''}`, `Leistung: ${f.get('was') || ''}`, '', f.get('text') || ''].join('\n');
    location.href = `mailto:info@maler-berg.de?subject=${encodeURIComponent('Angebotsanfrage: ' + f.get('was'))}&body=${encodeURIComponent(body)}`;
  });

  // Service slider arrows
  const track = $('#track');
  if (track) $$('.slider__nav .round').forEach((b) => b.addEventListener('click', () => {
    const card = $('.card', track);
    track.scrollBy({ left: (card.offsetWidth + 20) * Number(b.dataset.dir), behavior: 'smooth' });
  }));

  // Process steps: one open at a time
  const steps = $$('#steps li');
  steps.forEach((li) => $('button', li).addEventListener('click', () => {
    steps.forEach((o) => { const on = o === li; o.classList.toggle('is-on', on); $('button', o).setAttribute('aria-expanded', on); });
  }));

  // Lightbox: any [data-gallery][data-src] opens it; items with the same gallery name form one set
  const lb = $('#lb');
  if (lb && lb.showModal) {
    const img = $('img', lb), cap = $('figcaption', lb);
    let set = [], i = 0;
    const show = () => { const it = set[i]; img.src = it.dataset.src; img.alt = it.dataset.caption || ''; cap.textContent = it.dataset.caption || ''; lb.classList.toggle('is-single', set.length < 2); };
    const go = (d) => { i = (i + d + set.length) % set.length; show(); };
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-gallery][data-src]');
      if (!t) return;
      e.preventDefault();
      set = $$(`[data-gallery="${t.dataset.gallery}"][data-src]`);
      i = set.indexOf(t); show(); lb.showModal();
    });
    $('.lb__x', lb).addEventListener('click', () => lb.close());
    $('.lb__prev', lb).addEventListener('click', () => go(-1));
    $('.lb__next', lb).addEventListener('click', () => go(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0 = null; });
    lb.addEventListener('close', () => { img.removeAttribute('src'); });
  }

  // Reference filters
  const chips = $$('.chips button');
  chips.forEach((c) => c.addEventListener('click', () => {
    const f = c.dataset.f;
    chips.forEach((o) => o.setAttribute('aria-pressed', o === c));
    $$('#refs .ref').forEach((r) => { r.hidden = f !== 'alle' && !r.dataset.tags.split(' ').includes(f); });
  }));

  // Reveal on scroll
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = $$('.services__head, .card, .reviews__head, .quotes, .certs__head, .docs, .badges, .process__left, .steps, .area, .crew h2, .crew__row, .why__grid, .cta, .faq__list, .foot, .svc, .ref, .aq, .about article, .jobs, .pr, .clients, .partners');
  const io = new IntersectionObserver((list) => list.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); setTimeout(() => en.target.classList.remove('rise', 'in'), 1000); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('rise'); io.observe(el); } });
})();

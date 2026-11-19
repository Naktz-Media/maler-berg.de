(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Schließen' : 'Menü';
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a') && nav.classList.contains('open')) toggle.click();
    });
  }

  /* Hero: the window opens to the edges as the page scrolls */
  const hero = document.querySelector('.hero');
  const pic = hero && hero.querySelector('.hero__pic');
  const img = pic && pic.querySelector('img');
  if (hero && pic && !reduce) {
    let ticking = false;
    const frame = () => {
      ticking = false;
      const vw = innerWidth, vh = innerHeight;
      const phone = vw <= 760;
      // start opening: portrait window, centred
      const w0 = phone ? vw * 0.78 : Math.min(vw * 0.36, vh * 0.8 * 0.8);
      const h0 = w0 * 1.25;
      const top0 = phone ? vh * 0.3 : (vh - h0) / 2;
      const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / (vh * (phone ? 0.7 : 1))));
      const e = 1 - Math.pow(1 - p, 2);
      const ix = ((vw - w0) / 2) * (1 - e);
      const it = top0 * (1 - e);
      const ib = (vh - top0 - h0) * (1 - e);
      pic.style.clipPath = `inset(${it}px ${ix}px ${ib}px ${ix}px)`;
      hero.style.setProperty('--p', p.toFixed(3));
      // camera pulls back: the opening first frames the turquoise wall and the window
      const k = phone ? 0 : 1 - e;
      img.style.transform = `translateX(${(26 * k).toFixed(2)}vw) scale(${(1 + 0.6 * k).toFixed(3)})`;
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    frame();
  }

  /* Specials: pinned story, the active line steps down as markers pass */
  const specials = document.querySelector('.specials');
  if (specials) {
    const items = specials.querySelectorAll('.specials__list li');
    const panels = specials.querySelectorAll('.special');
    const set = (i) => {
      items.forEach((li) => li.classList.toggle('is-on', li.dataset.i === String(i)));
      panels.forEach((p) => p.classList.toggle('is-on', p.dataset.i === String(i)));
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) set(en.target.dataset.i); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    specials.querySelectorAll('.specials__markers i').forEach((m) => io.observe(m));
    items.forEach((li) => {
      li.tabIndex = 0;
      li.addEventListener('click', () => set(li.dataset.i));
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(li.dataset.i); } });
    });
  }

  /* Live: paint the wall */
  const wall = document.querySelector('.room__wall');
  const swatches = document.querySelectorAll('.swatch');
  const picker = document.querySelector('.picker input');
  const mail = document.getElementById('try-mail');
  const paint = (colour, name) => {
    if (!wall) return;
    wall.setAttribute('fill', colour);
    if (mail) {
      const subject = `Anfrage Farbton ${name}`;
      const body = `Guten Tag Herr Berg,\n\nich interessiere mich für einen Anstrich im Farbton „${name}“ (${colour}).\nOrt / Stadtteil: \nRaum / Fläche: \n\nViele Grüße`;
      mail.href = `mailto:info@maler-berg.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  swatches.forEach((b) => b.addEventListener('click', () => {
    swatches.forEach((s) => s.setAttribute('aria-pressed', String(s === b)));
    paint(b.dataset.c, b.querySelector('span:last-child').firstChild.textContent.trim());
  }));
  if (picker) picker.addEventListener('input', () => {
    swatches.forEach((s) => s.setAttribute('aria-pressed', 'false'));
    paint(picker.value, `eigener Ton ${picker.value}`);
  });

  /* Entrances: heading, then text, then picture. Checked on every scroll,
     so a jump (anchor link, restored position) reveals everything above it too. */
  const rise = [...document.querySelectorAll('.rise')];
  const drift = [...document.querySelectorAll('[data-drift]')];
  if (reduce) {
    rise.forEach((el) => el.classList.add('in'));
  } else {
    let pending = false;
    const check = () => {
      pending = false;
      const vh = innerHeight;
      for (let i = rise.length - 1; i >= 0; i--) {
        if (rise[i].getBoundingClientRect().top < vh * 0.92) { rise[i].classList.add('in'); rise.splice(i, 1); }
      }
      drift.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const t = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1 around the centre
        el.style.transform = `translateY(${(t * -4).toFixed(2)}%) scale(1.1)`;
      });
    };
    const req = () => { if (!pending) { pending = true; requestAnimationFrame(check); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    check();
  }
})();

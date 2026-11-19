(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Phone menu */
  const top = document.querySelector('.top');
  const menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', () => {
      const open = top.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? 'Schließen' : 'Menü';
    });
    top.addEventListener('click', (e) => { if (e.target.closest('.top__links a, .top__cta') && top.classList.contains('open')) menu.click(); });
  }

  /* The live thing: paint the page with a chip */
  const chips = document.querySelectorAll('.chips button');
  const label = document.getElementById('chip-name');
  const ask = document.getElementById('ask');
  const setAsk = (name) => {
    if (!ask) return;
    const body = `Guten Tag Herr Berg,\n\nich interessiere mich für einen Anstrich, gern im Farbton „${name}“.\nOrt / Stadtteil: \nRaum / Fläche (ca. m²): \nWunschtermin: \n\nViele Grüße`;
    ask.href = `mailto:info@maler-berg.de?subject=${encodeURIComponent('Angebotsanfrage – ' + name)}&body=${encodeURIComponent(body)}`;
  };
  const paint = (btn, save) => {
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    root.style.setProperty('--chip', btn.dataset.c);
    root.style.setProperty('--on-chip', btn.dataset.o);
    const name = btn.getAttribute('aria-label');
    if (label) label.textContent = name;
    setAsk(name);
    if (save) { try { localStorage.setItem('mb-chip', JSON.stringify({ c: btn.dataset.c, o: btn.dataset.o })); } catch (e) { /* storage off */ } }
  };
  chips.forEach((b) => b.addEventListener('click', () => paint(b, true)));
  try {
    const saved = JSON.parse(localStorage.getItem('mb-chip') || 'null');
    const match = saved && [...chips].find((b) => b.dataset.c === saved.c);
    paint(match || chips[0], false);
  } catch (e) { if (chips[0]) paint(chips[0], false); }

  /* Accordion of stages */
  const stages = document.querySelectorAll('.stage');
  stages.forEach((s) => {
    const btn = s.querySelector('.stage__name');
    btn.addEventListener('click', () => {
      stages.forEach((o) => {
        const on = o === s;
        o.classList.toggle('is-open', on);
        o.querySelector('.stage__name').setAttribute('aria-expanded', String(on));
      });
    });
  });

  /* One photograph cut across the board: each piece shows its own part of it */
  const cut = document.querySelector('.cut');
  const fitPieces = () => {
    if (!cut) return;
    const box = cut.getBoundingClientRect();
    const cs = getComputedStyle(cut);
    const pl = parseFloat(cs.paddingLeft), pt = parseFloat(cs.paddingTop), pr = parseFloat(cs.paddingRight);
    const w = box.width - pl - pr, h = box.height - pt;
    cut.querySelectorAll('.piece i').forEach((i) => {
      const r = i.parentElement.getBoundingClientRect();
      i.style.backgroundSize = `${w}px ${h}px`;
      i.style.backgroundPosition = `${-(r.left - box.left - pl)}px ${-(r.top - box.top - pt)}px`;
    });
  };
  fitPieces();
  addEventListener('resize', fitPieces);
  addEventListener('load', fitPieces);

  /* Services deck: each scroll step slides the next card in and folds the earlier ones into spines */
  const deck = document.querySelector('.deck');
  const cards = deck ? [...deck.querySelectorAll('.card')] : [];
  let forced = null;
  const layoutDeck = (step) => {
    const band = deck.querySelector('.deck__band');
    const W = band.clientWidth, n = cards.length;
    const spine = Math.min(120, W * 0.09);
    const cw = W - (n - 1) * spine;                       // the open card fills what the spines leave
    cards.forEach((c, i) => {
      const x = i <= step ? i * spine : W - (n - i) * spine; // folded at the left, waiting at the right
      c.style.setProperty('--open-px', `${cw}px`);
      c.style.setProperty('--cw', `${i === step ? cw : spine}px`);   // spines show only their first letters
      c.style.setProperty('--tx', `${x}px`);
      c.style.zIndex = String(i === step ? n + 1 : i < step ? i : n - i);
      c.setAttribute('aria-current', i === step ? 'true' : 'false');
    });
  };
  const deckStep = () => {
    if (!deck || innerWidth <= 760 || reduce) return;
    const r = deck.getBoundingClientRect();
    const span = deck.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / span));
    const step = forced ?? Math.min(cards.length - 1, Math.floor(p * cards.length));
    layoutDeck(step);
  };
  cards.forEach((c, i) => c.addEventListener('click', (e) => { if (e.target.closest('a')) return; forced = i; deckStep(); }));

  /* Entrances, shutters, and the deck — one scroll handler */
  const ups = [...document.querySelectorAll('.up, .shutter')];
  let pending = false, lastY = scrollY;
  const tick = () => {
    pending = false;
    if (Math.abs(scrollY - lastY) > 40) forced = null;
    lastY = scrollY;
    const vh = innerHeight;
    for (let i = ups.length - 1; i >= 0; i--) {
      const el = ups[i];
      if (el.getBoundingClientRect().top < vh * 0.92) { el.classList.add(el.classList.contains('shutter') ? 'is-in' : 'in'); ups.splice(i, 1); }
    }
    deckStep();
  };
  const req = () => { if (!pending) { pending = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  if (reduce) ups.forEach((el) => el.classList.add('in', 'is-in'));
  tick();
})();

(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // animation frames, kept running even when the tab is in the background
  const raf = (f) => (document.hidden ? setTimeout(() => f(performance.now()), 16) : requestAnimationFrame(f));

  /* ---------- Paint colour: one pot for the whole page ---------- */
  let paint = '#32c9c9', paintName = 'Berg-Türkis';
  const pots = $$('.pots button');
  const ask = $('#ask');
  const setPot = (b, save) => {
    pots.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    paint = b.dataset.p; paintName = b.getAttribute('aria-label');
    root.style.setProperty('--paint', paint);
    if (ask) ask.href = `mailto:info@maler-berg.de?subject=${encodeURIComponent('Angebotsanfrage – ' + paintName)}&body=${encodeURIComponent(`Guten Tag Herr Berg,\n\nich möchte etwas streichen lassen, gern in ${paintName}.\nOrt / Stadtteil: \nRaum / Fläche (ca. m²): \nWunschtermin: \n\nViele Grüße`)}`;
    if (save) { try { localStorage.setItem('mb-pot', paint); } catch (e) { /* storage off */ } }
  };
  pots.forEach((b) => b.addEventListener('click', () => setPot(b, true)));
  try { const s = localStorage.getItem('mb-pot'); setPot(pots.find((b) => b.dataset.p === s) || pots[0], false); } catch (e) { setPot(pots[0], false); }

  /* ---------- 1. The wall ---------- */
  const wall = $('#wall');
  const pc = $('#paint'), fc = $('#film');
  const px = pc.getContext('2d'), fx = fc.getContext('2d');
  const roller = $('#roller'), hint = $('#hint'), peelBtn = $('#peel');
  let W = 0, H = 0, dpr = 1, letters = null, travel = 0, peeled = false, busy = false;

  const fit = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    const r = wall.getBoundingClientRect();
    const keep = W && !peeled ? px.getImageData(0, 0, pc.width, pc.height) : null;
    W = r.width; H = r.height;
    for (const c of [pc, fc]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    px.setTransform(dpr, 0, 0, dpr, 0, 0); fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (keep) px.putImageData(keep, 0, 0);
    layoutLetters();
    if (peeled) { peeled = false; px.clearRect(0, 0, W, H); travel = 0; peelBtn.textContent = 'Folie abziehen ↗'; }
    drawFilm();
  };

  // "MALER" over "BERG", as big as the wall allows
  const layoutLetters = () => {
    const words = ['MALER', 'BERG'];
    let size = 400;
    px.font = `800 ${size}px Stencil, Impact, sans-serif`;
    const widest = Math.max(...words.map((w) => px.measureText(w).width));
    size = Math.min(size * (W * .9) / widest, H * .34);
    px.font = `800 ${size}px Stencil, Impact, sans-serif`;
    const asc = px.measureText('MALER').actualBoundingBoxAscent || size * .8;
    const lh = asc * 1.12;
    const block = asc + lh;                               // two lines of capitals
    const top = Math.max(96, H * .46 - block / 2) + asc;  // first baseline, clear of the bar
    letters = { size, asc, lines: words.map((w, i) => ({ w, x: W / 2, y: top + i * lh })) };
  };
  const drawLetters = (ctx) => {
    ctx.font = `800 ${letters.size}px Stencil, Impact, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    letters.lines.forEach((l) => ctx.fillText(l.w, l.x, l.y));
  };
  // The film: a faint blue sheen with a crisp cut edge
  const drawFilm = () => {
    fx.clearRect(0, 0, W, H);
    if (peeled) return;
    fx.save();
    fx.fillStyle = 'rgba(120, 150, 200, .16)';
    drawLetters(fx);
    fx.lineWidth = 1.5; fx.strokeStyle = 'rgba(16, 24, 90, .45)';
    fx.font = `800 ${letters.size}px Stencil, Impact, sans-serif`;
    letters.lines.forEach((l) => fx.strokeText(l.w, l.x, l.y));
    fx.translate(-1.5, -1.5); fx.strokeStyle = 'rgba(255, 255, 255, .8)';
    letters.lines.forEach((l) => fx.strokeText(l.w, l.x, l.y));
    fx.restore();
  };

  // A roller stamp: one row of nap, uneven like a real roller
  const RW = 150, RH = 8;
  const stamps = {};
  const stampFor = (col) => {
    if (stamps[col]) return stamps[col];
    const c = document.createElement('canvas'); c.width = RW; c.height = RH;
    const g = c.getContext('2d');
    let n = .8;
    for (let x = 0; x < RW; x++) {
      n += (Math.random() - .5) * .18; n = Math.min(1, Math.max(.45, n));
      const edge = Math.min(1, Math.min(x, RW - x) / 8);
      g.globalAlpha = n * edge; g.fillStyle = col; g.fillRect(x, 0, 1, RH);
    }
    return (stamps[col] = c);
  };
  let last = null, ang = 0, load = 1;
  const roll = (x, y) => {
    if (!last) { last = { x, y }; return; }
    const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
    if (d < 1) return;
    // a roller is held one of two ways: axis across for up-and-down strokes, upright for sideways ones
    if (Math.abs(dy) > Math.abs(dx) * 1.4) ang = 0;
    else if (Math.abs(dx) > Math.abs(dy) * 1.4) ang = Math.PI / 2;
    const st = stampFor(paint);
    for (let s = 0; s < d; s += 2.5) {
      const t = s / d;
      px.save();
      px.translate(last.x + dx * t, last.y + dy * t); px.rotate(ang);
      px.globalAlpha = .55 * load;
      px.drawImage(st, -RW / 2, -RH / 2);
      px.restore();
      load = Math.max(.25, load - .00045);
    }
    travel += d;
    last = { x, y };
    if (travel > 300 && hint) hint.classList.add('gone');
    if (travel > W * 2.2) peelBtn.classList.add('ready');
  };
  const dip = () => { last = null; load = 1; };

  const local = (e) => { const r = wall.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  wall.addEventListener('pointermove', (e) => {
    if (busy || e.target.closest('.wall__tools')) { roller.classList.remove('on'); dip(); return; }
    const p = local(e);
    if (e.pointerType === 'mouse') {
      roller.classList.add('on');
      roller.style.transform = `translate(${p.x}px, ${p.y}px)`;
      roll(p.x, p.y);
    } else if (e.buttons || e.pressure) roll(p.x, p.y);
  });
  wall.addEventListener('pointerleave', () => { roller.classList.remove('on'); dip(); });
  wall.addEventListener('pointerup', dip);
  wall.addEventListener('pointerdown', (e) => { if (!e.target.closest('.wall__tools')) { dip(); const p = local(e); roll(p.x, p.y); } });

  // Up and down across the letters, like a painter would
  const autoRoll = (ms) => new Promise((done) => {
    busy = true; dip();
    const top = letters.lines[0].y - letters.asc - 20, bot = letters.lines[1].y + 20;
    const left = W * .04, right = W * .96, step = RW * .7;
    const pts = [];
    for (let x = left, down = true; x <= right + step; x += step, down = !down) { pts.push([x, down ? top : bot], [x, down ? bot : top]); }
    const t0 = performance.now();
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / ms), f = k * (pts.length - 1), i = Math.floor(f), t = f - i;
      const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      roller.classList.add('on'); roller.style.transform = `translate(${x}px, ${y}px)`;
      roll(x, y); load = Math.max(load, .8);
      if (k < 1) raf(frame); else { roller.classList.remove('on'); busy = false; dip(); done(); }
    };
    raf(frame);
  });

  const peel = async () => {
    if (busy) return;
    if (peeled) { // start again
      peeled = false; travel = 0; px.clearRect(0, 0, W, H); drawFilm();
      peelBtn.textContent = 'Folie abziehen ↗'; peelBtn.classList.remove('ready');
      return;
    }
    if (travel < W * 2.2) await autoRoll(reduce ? 10 : 1400);
    busy = true;
    const t0 = performance.now(), ms = reduce ? 1 : 1100;
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3), xEdge = e * W;
      px.save(); px.beginPath(); px.rect(0, 0, xEdge, H); px.clip();
      px.globalCompositeOperation = 'destination-out'; px.fillStyle = '#000'; drawLetters(px);
      px.restore();
      fx.clearRect(0, 0, xEdge, H);
      if (k < 1) raf(frame);
      else { peeled = true; busy = false; peelBtn.classList.remove('ready'); peelBtn.textContent = 'Nochmal streichen ↺'; }
    };
    raf(frame);
  };
  peelBtn.addEventListener('click', peel);

  const start = () => {
    fit();
    addEventListener('resize', () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 150); });
    // Nobody painting? Show them how, then pull the film.
    setTimeout(async () => {
      if (travel > 0 || busy || scrollY > H * .5) return;
      await autoRoll(reduce ? 10 : 2600);
      if (hint) hint.classList.add('gone');
      setTimeout(() => { if (!peeled) peel(); }, reduce ? 0 : 700);
    }, 2200);
  };
  (document.fonts ? document.fonts.load('800 100px Stencil').then(() => document.fonts.ready) : Promise.resolve()).then(start, start);

  /* ---------- 4. The shelf ---------- */
  const tins = $$('.tin');
  const spills = $$('#spill article');
  const light = ['#f0eee8', '#f2b134', '#7cc6a6', '#32c9c9'];
  const openTin = (t) => {
    const i = Number(t.dataset.i);
    tins.forEach((o) => { o.classList.toggle('open', o === t); o.setAttribute('aria-expanded', String(o === t)); });
    spills.forEach((s, j) => { s.hidden = j !== i; });
    const col = t.style.getPropertyValue('--t').trim();
    const sp = $('#spill');
    sp.style.setProperty('--spill', col);
    sp.style.setProperty('--spill-ink', light.includes(col) ? '#12152e' : '#fff');
  };
  tins.forEach((t) => t.addEventListener('click', () => openTin(t)));
  if (tins[0]) openTin(tins[0]);

  /* ---------- 5. The fan deck ---------- */
  const fan = $('.fan');
  const blades = $$('.blade');
  blades.forEach((b, i) => b.style.setProperty('--i', String(i)));
  const fanStep = () => {
    if (!fan || innerWidth <= 860) return;
    const r = fan.getBoundingClientRect();
    const p = reduce ? 1 : Math.min(1, Math.max(0, -r.top / (fan.offsetHeight - innerHeight) * 1.25));
    blades.forEach((b, i) => b.style.setProperty('--k', String(p * (blades.length - 1 - i) * 17)));
  };

  /* ---------- 7. The graffiti wall ---------- */
  const brick = $('.brick'), tag = $('#tag'), washBtn = $('#wash');
  let washed = false;
  const wash = () => {
    if (washed) return; washed = true;
    brick.classList.add('washing');
    const t0 = performance.now(), ms = reduce ? 1 : 1800;
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const w = `${(k * 104).toFixed(1)}%`;
      tag.style.setProperty('--w', w); $('#spray').style.setProperty('--w', w);
      if (k < 1) raf(frame); else { brick.classList.remove('washing'); brick.classList.add('clean'); }
    };
    raf(frame);
  };
  washBtn.addEventListener('click', wash);
  if ('IntersectionObserver' in window) {
    let timer;
    new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) timer = setTimeout(wash, 4000);   // nobody washing? we do it for them
    }, { threshold: .6 }).observe(brick);
  }

  /* ---------- Things that pop onto the wall ---------- */
  const popEls = $$('.pin, .note, .stamp, .names__tape li, .tin, .names__nums p, .spill');
  popEls.forEach((el) => el.classList.add('pop'));
  const tick = () => {
    for (let i = popEls.length - 1; i >= 0; i--) {
      if (popEls[i].getBoundingClientRect().top < innerHeight * .9) { const el = popEls[i]; el.classList.add('in'); setTimeout(() => el.classList.remove('pop', 'in'), 950); popEls.splice(i, 1); }
    }
    fanStep();
  };
  let pend = false;
  addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; tick(); }); } }, { passive: true });
  addEventListener('resize', tick);
  tick();
})();

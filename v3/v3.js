(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The colour meter: read the colour under the ring, as the Brillux MF 100 reads a wall */
  const pic = document.getElementById('pic');
  const img = document.getElementById('pic-img');
  const ring = document.getElementById('ring');
  const sw = document.getElementById('sw');
  const nameEl = document.getElementById('tone-name');
  const hexEl = document.getElementById('tone-hex');
  const rgbEl = document.getElementById('tone-rgb');
  const askTone = document.getElementById('tone-ask');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let pos = { x: .12, y: .45 };

  const hues = [[15, 'Rot'], [40, 'Orange'], [65, 'Ocker'], [80, 'Gelb'], [160, 'Grün'], [195, 'Türkis'], [250, 'Blau'], [290, 'Violett'], [335, 'Magenta'], [360, 'Rot']];
  const describe = (r, g, b) => {
    const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d) {
      const R = r / 255, G = g / 255, B = b / 255;
      h = mx === R ? 60 * (((G - B) / d) % 6) : mx === G ? 60 * ((B - R) / d + 2) : 60 * ((R - G) / d + 4);
      if (h < 0) h += 360;
    }
    const light = l < .22 ? 'sehr dunkel' : l < .4 ? 'dunkel' : l < .62 ? 'mittel' : l < .82 ? 'hell' : 'sehr hell';
    if (s < .12) return l > .9 ? 'Weiß' : l < .1 ? 'Schwarz' : `Grau, ${light}`;
    if (s < .3 && h > 20 && h < 60) return `Beige, ${light}`;
    const name = hues.find(([lim]) => h < lim)[1];
    return `${name}, ${light}`;
  };
  const hex = (v) => v.toString(16).padStart(2, '0');

  const draw = () => {
    const w = pic.clientWidth, h = pic.clientHeight;
    if (!img.naturalWidth || !w) return false;
    canvas.width = w; canvas.height = h;
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);   // the same crop as object-fit: cover
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return true;
  };
  const read = () => {
    if (!canvas.width && !draw()) return;
    const x = Math.round(pos.x * (canvas.width - 1)), y = Math.round(pos.y * (canvas.height - 1));
    const x0 = Math.max(0, x - 3), y0 = Math.max(0, y - 3);
    const d = ctx.getImageData(x0, y0, 7, 7).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    const code = `#${hex(r)}${hex(g)}${hex(b)}`;
    const name = describe(r, g, b);
    sw.style.setProperty('--tone', code);
    nameEl.textContent = name;
    hexEl.textContent = code;
    rgbEl.textContent = `R ${r} G ${g} B ${b}`;
    const body = `Guten Tag Herr Berg,\n\nich interessiere mich für einen Anstrich in diesem Ton: ${name} (${code}).\nOrt / Stadtteil: \nRaum / Fläche (ca. m²): \nWunschtermin: \n\nViele Grüße`;
    askTone.href = `mailto:info@maler-berg.de?subject=${encodeURIComponent('Angebotsanfrage – Farbton ' + code)}&body=${encodeURIComponent(body)}`;
  };
  const place = () => { ring.style.left = `${pos.x * 100}%`; ring.style.top = `${pos.y * 100}%`; read(); };

  if (pic) {
    let drag = false;
    const toPos = (e) => {
      const r = pic.getBoundingClientRect();
      pos = { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
      place();
    };
    pic.addEventListener('pointerdown', (e) => { drag = true; pic.setPointerCapture(e.pointerId); toPos(e); });
    pic.addEventListener('pointermove', (e) => { if (drag) toPos(e); });
    pic.addEventListener('pointerup', () => { drag = false; });
    pic.addEventListener('pointercancel', () => { drag = false; });
    ring.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? .1 : .02;
      const k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!k) return;
      e.preventDefault();
      pos = { x: Math.min(1, Math.max(0, pos.x + k[0])), y: Math.min(1, Math.max(0, pos.y + k[1])) };
      place();
    });
    const ready = () => { canvas.width = 0; draw(); read(); };
    if (img.complete) ready(); else img.addEventListener('load', ready);
    addEventListener('resize', () => { canvas.width = 0; read(); });
    document.querySelectorAll('.meter__pics button').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('.meter__pics button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      img.addEventListener('load', ready, { once: true });
      img.alt = b.dataset.alt;
      img.src = b.dataset.src;
    }));
  }

  /* The room: statements step down as the reader scrolls; the light in the room changes with them */
  const scene = document.querySelector('.room');
  const items = scene ? [...scene.querySelectorAll('li')] : [];
  const bgs = scene ? [...scene.querySelectorAll('.room__bg img')] : [];
  const pairs = scene ? [...scene.querySelectorAll('.room__pair img')] : [];
  let current = -1;
  const setScene = (i) => {
    if (i === current) return;
    current = i;
    items.forEach((li, j) => li.classList.toggle('is-on', j === i));
    const bg = Number(items[i].dataset.bg);
    bgs.forEach((b, j) => b.classList.toggle('on', j === bg));
    pairs.forEach((p) => p.classList.toggle('on', Number(p.dataset.i) === i));
  };
  const sceneStep = () => {
    if (!scene || reduce) return;
    const r = scene.getBoundingClientRect();
    const span = scene.offsetHeight - innerHeight;
    const p = Math.min(.999, Math.max(0, -r.top / span));
    setScene(Math.floor(p * items.length));
  };
  if (scene) {
    if (reduce) { items.forEach((li) => li.classList.add('is-on')); }
    else setScene(0);
  }

  /* Proof: one name at a time is lit */
  const names = [...document.querySelectorAll('.proof__s .n')];
  let lit = 0;
  const light = () => { names.forEach((n, j) => n.classList.toggle('on', j === lit)); lit = (lit + 1) % names.length; };
  if (names.length && !reduce) {
    light();
    let t = setInterval(light, 2000);
    document.addEventListener('visibilitychange', () => { clearInterval(t); if (!document.hidden) t = setInterval(light, 2000); });
  }

  /* Entrances and the room, from one scroll handler */
  const rises = [...document.querySelectorAll('.rise')];
  let pending = false;
  const tick = () => {
    pending = false;
    const vh = innerHeight;
    for (let i = rises.length - 1; i >= 0; i--) {
      if (rises[i].getBoundingClientRect().top < vh * .92) { rises[i].classList.add('in'); rises.splice(i, 1); }
    }
    sceneStep();
  };
  const req = () => { if (!pending) { pending = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  if (reduce) rises.forEach((el) => el.classList.add('in'));
  tick();
})();

/* Motion layer: click feedback, cursor, reveals, tilt, theme wipe and dialog transitions.
   Everything here is progressive enhancement — the site works the same without it. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const EASE = 'cubic-bezier(.22,.8,.26,1)';
  const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
  const still = () => reduce.matches;
  document.documentElement.classList.add('motion-ready');

  /* ---------- 1. Ripple on every clickable control ---------- */
  const RIPPLE = '.pill,.round,.filters button,.steps button,.theme-toggle,.menu-toggle,.service-chip,.project-card,.back-top';
  function ripple(el, e) {
    const r = el.getBoundingClientRect();
    const size = Math.hypot(r.width, r.height) * 2;
    const x = (e.clientX || r.left + r.width / 2) - r.left;
    const y = (e.clientY || r.top + r.height / 2) - r.top;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('has-ripple');
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
    el.append(dot);
    dot.animate([{ transform: 'scale(0)', opacity: .45 }, { transform: 'scale(1)', opacity: 0 }],
      { duration: 650, easing: 'cubic-bezier(.2,.6,.3,1)' }).onfinish = () => dot.remove();
  }

  /* ---------- 2. Particle burst at the click point ---------- */
  const COLORS = ['#ffcb05', '#ffcb05', '#171811', '#fff0ae'];
  function burst(x, y) {
    const ring = document.createElement('span');
    ring.className = 'click-ring';
    ring.style.left = x + 'px'; ring.style.top = y + 'px';
    document.body.append(ring);
    ring.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }],
      { duration: 520, easing: EASE }).onfinish = () => ring.remove();
    const count = 9;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'click-spark';
      const angle = (Math.PI * 2 * i) / count + Math.random() * .5;
      const dist = 26 + Math.random() * 26;
      const s = 4 + Math.random() * 4;
      p.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${COLORS[i % COLORS.length]}`;
      document.body.append(p);
      p.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }
      ], { duration: 560 + Math.random() * 200, easing: 'cubic-bezier(.15,.7,.3,1)' }).onfinish = () => p.remove();
    }
  }

  document.addEventListener('pointerdown', e => {
    if (still() || e.button !== 0) return;
    const target = e.target.closest(RIPPLE);
    if (target) ripple(target, e);
    if (!e.target.closest('dialog, input, textarea, .cards')) burst(e.clientX, e.clientY);
  });

  /* Springy "press" pop for toggles and filters */
  document.addEventListener('click', e => {
    if (still()) return;
    const el = e.target.closest('.filters button,.steps button,.theme-toggle,#prev,#next');
    if (!el) return;
    el.animate([{ scale: '1' }, { scale: '.9' }, { scale: '1.06' }, { scale: '1' }], { duration: 420, easing: 'ease-out' });
    if (el.id === 'prev' || el.id === 'next') {
      const card = document.querySelector('.project-card.current');
      const dir = el.id === 'next' ? 1 : -1;
      card?.animate([{ rotate: `${dir * 3}deg` }, { rotate: '0deg' }], { duration: 520, easing: SPRING });
    }
  });

  /* ---------- 3. Cursor follower (desktop only) ---------- */
  if (finePointer.matches && !still()) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span class="cursor-label"></span>';
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.append(ring, dot);
    const label = ring.firstChild;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, shown = false;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      dot.style.translate = `${mx}px ${my}px`;
      if (!shown) { shown = true; rx = mx; ry = my; document.body.classList.add('cursor-on'); }
      const hit = e.target.closest?.('a,button,[role=tab],.project-card');
      const card = e.target.closest?.('.project-card');
      ring.classList.toggle('is-hover', !!hit);
      ring.classList.toggle('is-play', !!card);
      label.textContent = card ? (card.classList.contains('current') ? 'Play' : 'View') : '';
    }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; document.body.classList.remove('cursor-on'); });
    addEventListener('pointerdown', () => ring.classList.add('is-down'));
    addEventListener('pointerup', () => ring.classList.remove('is-down'));
    (function loop() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.translate = `${rx}px ${ry}px`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 4. Magnetic buttons ---------- */
  if (finePointer.matches && !still()) {
    document.querySelectorAll('.pill,.gallery-bottom .round,.theme-toggle').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * .22;
        const dy = (e.clientY - (r.top + r.height / 2)) * .3;
        el.style.translate = `${dx}px ${dy}px`;
      });
      el.addEventListener('pointerleave', () => {
        el.animate([{ translate: el.style.translate || '0 0' }, { translate: '0 0' }], { duration: 500, easing: SPRING });
        el.style.translate = '';
      });
    });
  }

  /* ---------- 5. Tilt + glare on portrait, process board and the active card ---------- */
  function tilt(el, max, layer = el) {
    if (!finePointer.matches || still()) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      layer.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
      el.style.setProperty('--gx', `${(px + .5) * 100}%`);
      el.style.setProperty('--gy', `${(py + .5) * 100}%`);
      el.classList.add('is-tilting');
    });
    el.addEventListener('pointerleave', () => {
      const from = layer.style.transform;
      layer.style.transform = '';
      el.classList.remove('is-tilting');
      if (from) layer.animate([{ transform: from }, { transform: 'perspective(900px) rotateX(0) rotateY(0)' }], { duration: 600, easing: SPRING });
    });
  }
  const portrait = document.querySelector('.portrait-art');
  if (portrait) { portrait.classList.add('glare'); tilt(portrait, 8, portrait.querySelector('img')); }
  const board = document.querySelector('.process-board');
  if (board) { board.classList.add('glare'); tilt(board, 7); }
  document.querySelector('#cards')?.addEventListener('pointermove', e => {
    const card = e.target.closest('.project-card.current');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
    card.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
  });

  /* ---------- 6. Hero headline: word-by-word reveal ---------- */
  const h1 = document.querySelector('.hero h1');
  if (h1 && !still()) {
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.style.setProperty('--i', i++);
            w.textContent = part;
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') wrap(child);
      });
    };
    wrap(h1);
    h1.classList.add('split');
  }

  /* ---------- 7. Staggered scroll reveals ---------- */
  if (!still()) {
    const groups = [
      ['.skills span', 12], ['.tools-row > *', 18], ['.steps button', 14],
      ['.footer-links > *', 14], ['.filters button', 10], ['.hero .actions .pill', 12], ['.contact-intro .contact-chip', 12]
    ];
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.animate([{ opacity: 0, translate: `0 ${el.dataset.rise}px`, scale: '.94' }, { opacity: 1, translate: '0 0', scale: '1' }],
        { duration: 620, delay: Number(el.dataset.delay), easing: EASE, fill: 'backwards' });
      io.unobserve(el);
    }), { threshold: .15 });
    groups.forEach(([sel, rise]) => document.querySelectorAll(sel).forEach((el, n) => {
      el.dataset.rise = rise; el.dataset.delay = Math.min(n, 10) * 60;
      io.observe(el);
    }));
    // Big headings slide their yellow full-stop in
    document.querySelectorAll('h2 > span:last-child').forEach(dot => {
      const o = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        dot.animate([{ transform: 'translateY(-40px) scale(0)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }],
          { duration: 700, delay: 250, easing: SPRING, fill: 'backwards' });
        o.disconnect();
      }, { threshold: .6 });
      dot.style.display = 'inline-block';
      o.observe(dot);
    });
  }

  /* Process board list: re-stagger whenever the step changes */
  const list = document.querySelector('#board-list');
  if (list) new MutationObserver(() => {
    if (still()) return;
    [...list.children].forEach((li, n) => li.animate(
      [{ opacity: 0, translate: '-18px 0' }, { opacity: 1, translate: '0 0' }],
      { duration: 450, delay: 120 + n * 70, easing: EASE, fill: 'backwards' }));
    const mark = document.querySelector('#step-number');
    mark?.animate([{ rotate: '-90deg', scale: '.4' }, { rotate: '0deg', scale: '1' }], { duration: 600, easing: SPRING });
  }).observe(list, { childList: true });

  /* ---------- 8. Sticky header, scroll progress, back-to-top ---------- */
  const header = document.querySelector('.header');
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  const top = document.createElement('a');
  top.className = 'back-top';
  top.href = '#home';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="track" cx="24" cy="24" r="21"/><circle class="meter" cx="24" cy="24" r="21"/></svg><span aria-hidden="true">↑</span>';
  document.body.append(bar, top);
  const meter = top.querySelector('.meter');
  const C = 2 * Math.PI * 21;
  meter.style.strokeDasharray = C;
  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    bar.style.transform = `scaleX(${p})`;
    meter.style.strokeDashoffset = C * (1 - p);
    header.classList.toggle('is-scrolled', y > 10);
    const menuOpen = header.dataset.menuOpen === 'true';
    header.classList.toggle('is-hidden', !menuOpen && y > 300 && y > lastY + 4);
    if (y < lastY - 4 || y < 300) header.classList.remove('is-hidden');
    top.classList.toggle('is-visible', y > 600);
    lastY = y; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Active nav link follows the section in view */
  const links = [...document.querySelectorAll('#site-navigation > a[href^="#"]:not(.pill)')];
  const sectionIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'work', 'process'].forEach(id => { const s = document.getElementById(id); if (s) sectionIO.observe(s); });

  /* ---------- 9. Dialog open / close transitions ---------- */
  const dialog = document.querySelector('#project-dialog');
  let origin = null;
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('.project-card.current, #view-project')) origin = { x: e.clientX, y: e.clientY };
  }, true);
  window.motionOpenDialog = d => {
    if (still()) return;
    const r = d.getBoundingClientRect();
    const ox = origin ? origin.x - r.left : r.width / 2, oy = origin ? origin.y - r.top : r.height / 2;
    d.style.transformOrigin = `${ox}px ${oy}px`;
    d.animate([{ opacity: 0, transform: 'scale(.6)', filter: 'blur(6px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }],
      { duration: 520, easing: SPRING });
    d.querySelectorAll('.eyebrow,h2,.youtube-player,p,.dialog-actions').forEach((el, n) =>
      el.animate([{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }],
        { duration: 450, delay: 120 + n * 60, easing: EASE, fill: 'backwards' }));
    origin = null;
  };
  let closing = false;
  window.motionCloseDialog = d => {
    if (closing || !d.open) return;
    if (still()) { d.close(); return; }
    closing = true;
    d.classList.add('is-closing');
    d.animate([{ opacity: 1, transform: 'scale(1) translateY(0)' }, { opacity: 0, transform: 'scale(.92) translateY(20px)' }],
      { duration: 260, easing: 'cubic-bezier(.4,0,1,1)' }).onfinish = () => {
        d.close(); d.classList.remove('is-closing'); closing = false;
      };
  };
  dialog?.addEventListener('cancel', e => { e.preventDefault(); window.motionCloseDialog(dialog); });

  /* ---------- 10. Circular theme wipe from the toggle ---------- */
  window.motionTheme = (apply, button) => {
    if (still() || !document.startViewTransition) { apply(); return; }
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.classList.add('theme-wipe');
    const t = document.startViewTransition(apply);
    t.ready.then(() => document.documentElement.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }));
    t.finished.finally(() => document.documentElement.classList.remove('theme-wipe'));
  };
})();

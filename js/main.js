/* DGOLD PAY — interações da landing page */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fallback de imagens (nunca mostrar imagem quebrada) ---------- */
  const markFail = (img) => (img.closest('.imgbox') || img.parentElement).classList.add('img-fail');
  $$('img').forEach((img) => {
    img.addEventListener('error', () => markFail(img));
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) markFail(img);
  });

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastT;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 3200);
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-soon]');
    if (!el) return;
    e.preventDefault();
    say(el.dataset.soon);
  });

  /* ---------- Cabeçalho: encolhe e esconde ao rolar ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 40);
    const goingDown = y > lastY + 4, goingUp = y < lastY - 4;
    if (y > 420 && goingDown && !document.body.classList.contains('lock')) header.classList.add('hide');
    else if (goingUp || y < 420) header.classList.remove('hide');
    toTop.classList.toggle('show', y > 900);
    lastY = y;
    parallax(y);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- Parallax leve (somente desktop) ---------- */
  const px = $$('[data-parallax]');
  function parallax(y) {
    if (reduce || innerWidth < 981) return;
    px.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      el.style.translate = `0 ${(y * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
    });
  }
  onScroll();

  /* ---------- Mega menu ---------- */
  const items = $$('#menu > li').filter((li) => $('.mega', li));
  let closeT;
  const closeAll = () => items.forEach((li) => { li.classList.remove('open'); $('button', li).setAttribute('aria-expanded', 'false'); });
  const openItem = (li) => {
    clearTimeout(closeT);
    items.forEach((o) => { if (o !== li) { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); } });
    li.classList.add('open');
    $('button', li).setAttribute('aria-expanded', 'true');
  };
  items.forEach((li) => {
    const btn = $('button', li);
    li.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && openItem(li));
    li.addEventListener('mouseleave', () => { closeT = setTimeout(closeAll, 180); });
    btn.addEventListener('click', () => (li.classList.contains('open') ? closeAll() : openItem(li)));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#menu')) closeAll(); });

  /* ---------- Drawer mobile ---------- */
  const drawer = $('#drawer'), burger = $('#burger');
  const setDrawer = (open) => {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('lock', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('#drawerClose').focus();
  };
  burger.addEventListener('click', () => setDrawer(true));
  $('#drawerClose').addEventListener('click', () => setDrawer(false));
  $$('#drawer a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));

  /* ---------- Abas de Pessoa Física ---------- */
  const tabs = $$('#pfTabs .tab');
  const pfImgs = $$('#pfImgs img');
  const setTab = (i) => {
    tabs.forEach((t, k) => {
      t.classList.toggle('active', k === i);
      $('.tab__btn', t).setAttribute('aria-expanded', String(k === i));
    });
    pfImgs.forEach((im, k) => im.classList.toggle('on', k === i));
  };
  tabs.forEach((t, i) => $('.tab__btn', t).addEventListener('click', () => setTab(i)));
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => { setTab(+a.dataset.tab); closeAll(); }));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal, .reveal-l, .reveal-r');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
    // Garantia: se algo não revelar (ex.: salto por âncora), revela após o carregamento
    setTimeout(() => revealEls.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }), 1800);
  } else revealEls.forEach((el) => el.classList.add('in'));

  /* ---------- Carrossel de campanhas ---------- */
  const car = $('#carousel');
  if (car) {
    const track = $('.carousel__track', car), slides = $$('.slide', car), dots = $$('.dot', car);
    let cur = 0, sx = null;
    const go = (n) => {
      cur = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-100 * cur}%)`;
      slides.forEach((s, i) => { s.classList.toggle('active', i === cur); s.setAttribute('aria-hidden', String(i !== cur)); });
      dots.forEach((d, i) => { d.classList.toggle('active', i === cur); d.setAttribute('aria-selected', String(i === cur)); });
    };
    $('#next').addEventListener('click', () => go(cur + 1));
    $('#prev').addEventListener('click', () => go(cur - 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    // O avanço automático é guiado pela barra de progresso (pausa junto com ela)
    car.addEventListener('animationend', (e) => { if (!reduce && e.target.matches('.dot.active i')) go(cur + 1); });
    const pause = (p) => car.classList.toggle('paused', p);
    car.addEventListener('mouseenter', () => pause(true));
    car.addEventListener('mouseleave', () => pause(false));
    car.addEventListener('focusin', () => pause(true));
    car.addEventListener('focusout', () => pause(false));
    document.addEventListener('visibilitychange', () => pause(document.hidden));
    car.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; pause(true); }, { passive: true });
    car.addEventListener('touchend', (e) => {
      if (sx !== null) { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); }
      sx = null; pause(false);
    });
    car.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
    go(0);
  }

  /* ---------- Inclinação do smartphone com o mouse ---------- */
  const phone = $('#phone1');
  if (phone && !reduce && matchMedia('(hover:hover)').matches) {
    const host = phone.parentElement;
    host.addEventListener('mousemove', (e) => {
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      phone.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    });
    host.addEventListener('mouseleave', () => { phone.style.transform = ''; });
  }

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAll(); if (drawer.classList.contains('open')) setDrawer(false); }
  });

  /* FAQ: um item aberto por vez */
  $$('.faq details').forEach((d) => d.addEventListener('toggle', () => { if (d.open) $$('.faq details').forEach((o) => { if (o !== d) o.open = false; }); }));

  /* Links "#" sem destino não devem rolar para o topo */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a && !a.hasAttribute('data-soon')) e.preventDefault();
  });
})();

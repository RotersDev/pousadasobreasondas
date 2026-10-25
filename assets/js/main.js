/* Pousada Sobre as Ondas — interações */
(function () {
  'use strict';

  var WHATSAPP = '5541999021861';
  var EMAIL = 'contato@pousadasobreasondas.com.br';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Preloader ---------- */
  function markLoaded() { document.body.classList.add('is-loaded'); }
  window.addEventListener('load', function () { setTimeout(markLoaded, 300); });
  setTimeout(markLoaded, 2500); // fallback

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: scrolled / hide on scroll down ---------- */
  var lastY = 0;
  var waFloat = $('.wa-float');
  function onScroll() {
    var y = window.scrollY;
    document.body.classList.toggle('is-scrolled', y > 60);
    if (waFloat) waFloat.classList.toggle('is-visible', y > 500);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger');
  var mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', !open);
  }
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('a', mobileMenu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.nav-links a');
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(function (a) {
    var s = $(a.getAttribute('href'));
    if (s) sectionObserver.observe(s);
  });

  /* ---------- Hero carousel ---------- */
  var hero = $('.hero');
  var slides = $$('.hero__slide');
  var titles = $$('.hero__title');
  var dotsWrap = $('.hero__dots');
  var current = $('.hero__current');
  var DURATION = 7000;
  var idx = 0, timer = null;
  hero.style.setProperty('--dur', DURATION + 'ms');
  $('.hero__total').textContent = String(slides.length).padStart(2, '0');

  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
    b.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(b);
  });
  var dots = $$('button', dotsWrap);

  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
    titles.forEach(function (t, i) { t.classList.toggle('is-active', i === idx % titles.length); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    current.textContent = String(idx + 1).padStart(2, '0');
    restart();
  }
  function restart() {
    clearTimeout(timer);
    hero.classList.remove('is-playing');
    void hero.offsetWidth; // reinicia a barra de progresso
    hero.classList.add('is-playing');
    timer = setTimeout(function () { go(idx + 1); }, DURATION);
  }
  $('.hero__prev').addEventListener('click', function () { go(idx - 1); });
  $('.hero__next').addEventListener('click', function () { go(idx + 1); });

  // swipe no celular
  var touchX = null;
  hero.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearTimeout(timer); else restart();
  });
  go(0);

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealObserver.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // escalona elementos irmãos
  $$('.reveal').forEach(function (el) {
    var siblings = $$(':scope > .reveal', el.parentElement);
    var i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 0.08, 0.4) + 's';
    revealObserver.observe(el);
  });
  $$('.about__media').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Counters ---------- */
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      var el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = end + suffix; return; }
      var start = performance.now(), dur = 1800;
      (function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { counterObserver.observe(el); });

  /* ---------- Parallax ---------- */
  var parallaxBgs = $$('[data-parallax-bg]');
  var parallaxEls = $$('[data-parallax]');
  if (!reduceMotion && (parallaxBgs.length || parallaxEls.length)) {
    var ticking = false;
    function parallax() {
      var vh = window.innerHeight;
      parallaxBgs.forEach(function (bg) {
        var r = bg.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        bg.style.transform = 'translate3d(0,' + (progress * -30).toFixed(2) + '%,0)';
      });
      var wide = window.innerWidth > 1024;
      parallaxEls.forEach(function (el) {
        if (!wide) { el.style.transform = ''; return; }
        var r = el.getBoundingClientRect();
        var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------- Horizontal carousels (arrastar + setas) ---------- */
  $$('[data-carousel]').forEach(function (car) {
    var name = car.dataset.carousel;
    var track = $('.carousel__track', car);
    var prev = $('[data-carousel-prev="' + name + '"]');
    var next = $('[data-carousel-next="' + name + '"]');

    function step() {
      var first = track.children[0];
      return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300;
    }
    function update() {
      if (!prev) return;
      prev.disabled = track.scrollLeft < 5;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // arrastar com o mouse
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('mousedown', function (e) {
      down = true; moved = false; startX = e.pageX; startLeft = track.scrollLeft;
    });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('mouseup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
      // volta a encaixar no card mais próximo
      var s = step();
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s });
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* ---------- Gallery filters + lightbox ---------- */
  var items = $$('.g-item');
  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      var f = chip.dataset.filter;
      items.forEach(function (it) { it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f); });
    });
  });

  var lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), lbIndex = 0;
  function visibleItems() { return items.filter(function (it) { return !it.classList.contains('is-hidden'); }); }
  function showLb(i) {
    var list = visibleItems();
    lbIndex = (i + list.length) % list.length;
    var a = list[lbIndex], img = $('img', a);
    lbImg.src = a.getAttribute('href');
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt + '  ·  ' + (lbIndex + 1) + ' / ' + list.length;
  }
  function openLb(i) {
    showLb(i);
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('.lightbox__close').focus();
  }
  function closeLb() {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }
  items.forEach(function (it) {
    it.addEventListener('click', function (e) { e.preventDefault(); openLb(visibleItems().indexOf(it)); });
  });
  $('.lightbox__close').addEventListener('click', closeLb);
  $('.lightbox__prev').addEventListener('click', function () { showLb(lbIndex - 1); });
  $('.lightbox__next').addEventListener('click', function () { showLb(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); if (document.body.classList.contains('menu-open')) setMenu(false); }
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });

  /* ---------- Booking: calendário + hóspedes → WhatsApp ---------- */
  function openWhatsApp(text) {
    window.open('https://api.whatsapp.com/send?phone=' + WHATSAPP + '&text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  var form = $('#booking-form');
  var pickDates = $('#picker-dates'), pickGuests = $('#picker-guests');
  var holidaysEl = $('#picker-holidays');
  var monthsEl = $('#picker-months'), hintEl = $('#picker-hint'), nightsEl = $('#picker-nights');
  var fieldIn = $('[data-target="in"]', form), fieldOut = $('[data-target="out"]', form), fieldGuests = $('[data-open="guests"]', form);
  var backdrop = document.createElement('div');
  backdrop.className = 'picker-backdrop';
  form.appendChild(backdrop);

  var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var DOW_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  var today0 = new Date(); today0.setHours(0, 0, 0, 0);
  var state = { start: null, end: null, target: 'in', view: new Date(today0.getFullYear(), today0.getMonth(), 1), adults: 2, kids: 0, ages: [] };
  var openPicker = null;

  function sameDay(a, b) { return a && b && a.getTime() === b.getTime(); }
  function dmy(d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
  function short(d) { return d.getDate() + ' ' + MON[d.getMonth()]; }
  function nights() { return state.start && state.end ? Math.round((state.end - state.start) / 864e5) : 0; }
  function isMobile() { return window.innerWidth <= 720; }

  /* Feriados nacionais (fixos + móveis calculados pela Páscoa), vésperas e emendas */
  var holidayCache = {};
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }
  function key(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function holidaysOf(y) {
    if (holidayCache[y]) return holidayCache[y];
    var map = {};
    function hol(d, name) { map[key(d)] = { type: 'holiday', name: name }; }
    [[0, 1, 'Confraternização Universal'], [3, 21, 'Tiradentes'], [4, 1, 'Dia do Trabalho'],
     [8, 7, 'Independência do Brasil'], [9, 12, 'Nossa Senhora Aparecida'], [10, 2, 'Finados'],
     [10, 15, 'Proclamação da República'], [10, 20, 'Consciência Negra'], [11, 25, 'Natal']]
      .forEach(function (h) { hol(new Date(y, h[0], h[1]), h[2]); });
    var e = easter(y);
    for (var i = -50; i <= -47; i++) hol(addDays(e, i), 'Carnaval');
    hol(addDays(e, -2), 'Sexta-feira Santa');
    hol(e, 'Páscoa');
    hol(addDays(e, 60), 'Corpus Christi');
    // vésperas e emendas
    Object.keys(map).forEach(function (k) {
      var p = k.split('-'), d = new Date(+p[0], +p[1], +p[2]), name = map[k].name;
      var eve = addDays(d, -1);
      if (!map[key(eve)]) map[key(eve)] = { type: 'eve', name: 'Véspera de ' + name };
      if (d.getDay() === 2 && !map[key(addDays(d, -1))]) map[key(addDays(d, -1))] = { type: 'eve', name: 'Emenda de ' + name };
      if (d.getDay() === 4) { var f = addDays(d, 1); if (!map[key(f)] || map[key(f)].type !== 'holiday') map[key(f)] = { type: 'eve', name: 'Emenda de ' + name }; }
    });
    map[y + '-11-24'] = { type: 'eve', name: 'Véspera de Natal' };
    map[y + '-11-31'] = { type: 'eve', name: 'Réveillon' };
    return (holidayCache[y] = map);
  }
  function holidayOf(d) { return holidaysOf(d.getFullYear())[key(d)] || null; }

  function renderMonth(year, month) {
    var first = new Date(year, month, 1);
    var days = new Date(year, month + 1, 0).getDate();
    var html = '<div class="cal"><p class="cal__title">' + MONTHS[month] + ' ' + year + '</p><div class="cal__grid">';
    DOW.forEach(function (d) { html += '<span class="cal__dow">' + d + '</span>'; });
    for (var i = 0; i < first.getDay(); i++) html += '<span class="cal__day is-blank"></span>';
    for (var d = 1; d <= days; d++) {
      var date = new Date(year, month, d);
      var past = date < today0;
      var hd = holidayOf(date);
      html += '<button type="button" class="cal__day' + (sameDay(date, today0) ? ' is-today' : '') +
        (hd ? (hd.type === 'holiday' ? ' is-holiday' : ' is-eve') : '') + '" data-time="' + date.getTime() + '"' +
        (hd ? ' title="' + hd.name + '" data-holiday="' + hd.name + '"' : '') +
        (past ? ' disabled' : '') + ' aria-label="' + d + ' de ' + MONTHS[month] + ' de ' + year + (hd ? ', ' + hd.name : '') + '"><span>' + d + '</span></button>';
    }
    return html + '</div></div>';
  }

  function renderCalendar() {
    var v = state.view;
    var next = new Date(v.getFullYear(), v.getMonth() + 1, 1);
    monthsEl.innerHTML = renderMonth(v.getFullYear(), v.getMonth()) + renderMonth(next.getFullYear(), next.getMonth());
    // lista dos feriados dos meses visíveis
    var list = [], seen = {};
    [v, next].slice(0, isMobile() ? 1 : 2).forEach(function (m) {
      var days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= days; d++) {
        var date = new Date(m.getFullYear(), m.getMonth(), d), hd = holidayOf(date);
        if (hd && hd.type === 'holiday') {
          var k = hd.name + m.getMonth();
          if (seen[k]) seen[k].last = d;
          else { seen[k] = { first: d, last: d, mon: m.getMonth(), name: hd.name }; list.push(seen[k]); }
        }
      }
    });
    holidaysEl.innerHTML = list.length ? list.map(function (h) {
      return '<li><b>' + h.first + (h.last !== h.first ? '–' + h.last : '') + ' ' + MON[h.mon] + '</b> ' + h.name + '</li>';
    }).join('') : '<li class="is-empty">Sem feriados nacionais neste período</li>';
    $('[data-cal="prev"]', pickDates).disabled = v <= new Date(today0.getFullYear(), today0.getMonth(), 1);
    paint(null);
  }

  function paint(hover) {
    var s = state.start, e = state.end || (s && hover && hover > s ? hover : null);
    $$('.cal__day[data-time]', monthsEl).forEach(function (b) {
      var t = +b.dataset.time;
      b.classList.toggle('is-start', !!s && t === s.getTime());
      b.classList.toggle('has-end', !!e);
      b.classList.toggle('is-end', !!e && t === e.getTime());
      b.classList.toggle('in-range', !!s && !!e && t > s.getTime() && t < e.getTime());
    });
  }

  function baseHint() { return state.target === 'in' || !state.start ? 'Selecione a data de check-in' : 'Agora, a data de check-out'; }

  function updateFields() {
    function set(field, idText, idSub, d) {
      $(idText).innerHTML = d ? short(d) + ' <small style="font-family:var(--sans);font-size:.55em;color:var(--muted)">' + d.getFullYear() + '</small>' : '<em>Selecione</em>';
      $(idSub).textContent = d ? DOW_LONG[d.getDay()] : 'Escolha a data';
      field.classList.remove('is-invalid');
    }
    set(fieldIn, '#b-in-text', '#b-in-sub', state.start);
    set(fieldOut, '#b-out-text', '#b-out-sub', state.end);
    var n = nights();
    var inRange = [];
    if (n) for (var dd = state.start; dd <= state.end; dd = addDays(dd, 1)) {
      var hh = holidayOf(dd);
      if (hh && hh.type === 'holiday' && inRange.indexOf(hh.name) < 0) inRange.push(hh.name);
    }
    nightsEl.innerHTML = n ? '<strong>' + n + (n > 1 ? ' noites' : ' noite') + '</strong> · ' + short(state.start) + ' → ' + short(state.end) +
      (inRange.length ? '<span class="picker__badge">Inclui feriado: ' + inRange.join(', ') + '</span>' : '') : '';
    hintEl.textContent = baseHint();
    fieldIn.setAttribute('aria-expanded', openPicker === pickDates && state.target === 'in');
    fieldOut.setAttribute('aria-expanded', openPicker === pickDates && state.target === 'out');
  }

  function ageLabel(a) { return a === 0 ? 'menos de 1 ano' : a === 1 ? '1 ano' : a + ' anos'; }
  function joinPt(list) { return list.length > 1 ? list.slice(0, -1).join(', ') + ' e ' + list[list.length - 1] : list[0] || ''; }
  function agesText() {
    var labels = [];
    for (var i = 0; i < state.kids; i++) {
      if (typeof state.ages[i] !== 'number') return '';
      labels.push(ageLabel(state.ages[i]));
    }
    return joinPt(labels);
  }
  var kidsAges = $('#kids-ages');
  function renderAges() {
    state.ages.length = state.kids;
    kidsAges.hidden = !state.kids;
    var html = state.kids ? '<p class="kids-ages__title">Idade das crianças <small>(no dia do check-in)</small></p><div class="kids-ages__grid">' : '';
    for (var i = 0; i < state.kids; i++) {
      var v = state.ages[i];
      html += '<label class="age-select' + (v === null || v === undefined ? ' is-empty' : '') + '"><span>Criança ' + (i + 1) + '</span>' +
        '<select data-age="' + i + '"><option value="" disabled' + (v == null ? ' selected' : '') + '>Idade</option>';
      for (var a = 0; a <= 17; a++) html += '<option value="' + a + '"' + (v === a ? ' selected' : '') + '>' + (a === 0 ? '< 1 ano' : a + (a === 1 ? ' ano' : ' anos')) + '</option>';
      html += '</select></label>';
    }
    kidsAges.innerHTML = html + (state.kids ? '</div>' : '');
  }
  kidsAges.addEventListener('change', function (e) {
    var s = e.target.closest('select[data-age]');
    if (!s) return;
    state.ages[+s.dataset.age] = +s.value;
    s.parentElement.classList.remove('is-empty', 'is-invalid');
    updateGuests();
  });

  function updateGuests() {
    $('#b-adults').textContent = state.adults;
    $('#b-kids').textContent = state.kids;
    $('#b-guests-text').textContent = state.adults + (state.adults > 1 ? ' adultos' : ' adulto');
    var at = agesText();
    $('#b-guests-sub').textContent = state.kids ? state.kids + (state.kids > 1 ? ' crianças' : ' criança') + (at ? ' (' + at + ')' : '') : 'Sem crianças';
    var total = state.adults + state.kids;
    $('[data-step="adults"][data-dir="-1"]').disabled = state.adults <= 1;
    $('[data-step="kids"][data-dir="-1"]').disabled = state.kids <= 0;
    $$('[data-dir="1"]', pickGuests).forEach(function (b) { b.disabled = total >= 8; });
  }

  function position(picker, field) {
    picker.style.left = '';
    if (isMobile()) return;
    var max = form.clientWidth - picker.offsetWidth;
    picker.style.left = Math.max(0, Math.min(field.offsetLeft, max)) + 'px';
    picker.style.right = 'auto';
  }

  function open(picker, field) {
    if (openPicker && openPicker !== picker) close(true);
    openPicker = picker;
    picker.hidden = false;
    position(picker, field);
    document.body.classList.add('picker-open');
    if (isMobile()) { backdrop.classList.add('is-open'); document.body.classList.add('is-locked'); }
    requestAnimationFrame(function () { picker.classList.add('is-open'); });
    fieldGuests.setAttribute('aria-expanded', picker === pickGuests);
    updateFields();
  }
  function close(instant) {
    if (!openPicker) return;
    var p = openPicker;
    openPicker = null;
    p.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('picker-open', 'is-locked');
    $$('.booking__field', form).forEach(function (f) { f.setAttribute('aria-expanded', 'false'); });
    if (instant) p.hidden = true; else setTimeout(function () { if (openPicker !== p) p.hidden = true; }, 300);
  }

  $$('[data-open="dates"]', form).forEach(function (field) {
    field.addEventListener('click', function () {
      state.target = field.dataset.target === 'out' && state.start ? 'out' : 'in';
      var focus = state.target === 'out' && state.end ? state.end : state.start;
      if (focus) state.view = new Date(focus.getFullYear(), focus.getMonth() - (state.target === 'out' && !isMobile() && state.end && state.end.getMonth() !== state.start.getMonth() ? 1 : 0), 1);
      if (state.view < new Date(today0.getFullYear(), today0.getMonth(), 1)) state.view = new Date(today0.getFullYear(), today0.getMonth(), 1);
      if (openPicker === pickDates) { updateFields(); return; }
      renderCalendar();
      open(pickDates, fieldIn);
    });
  });
  fieldGuests.addEventListener('click', function () {
    if (openPicker === pickGuests) { close(); return; }
    open(pickGuests, fieldGuests);
  });

  monthsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.cal__day[data-time]');
    if (!b || b.disabled) return;
    var d = new Date(+b.dataset.time);
    if (state.target === 'in' || !state.start || d <= state.start) {
      state.start = d; state.end = null; state.target = 'out';
    } else {
      state.end = d;
      paint(null); updateFields();
      setTimeout(function () { close(); }, 450);
      return;
    }
    paint(null); updateFields();
  });
  monthsEl.addEventListener('mouseover', function (e) {
    var b = e.target.closest('.cal__day[data-time]');
    if (state.start && !state.end && b) paint(new Date(+b.dataset.time));
    hintEl.textContent = b && b.dataset.holiday ? short(new Date(+b.dataset.time)) + ' · ' + b.dataset.holiday : baseHint();
    hintEl.classList.toggle('is-holiday', !!(b && b.dataset.holiday));
  });
  monthsEl.addEventListener('mouseleave', function () { paint(null); hintEl.textContent = baseHint(); hintEl.classList.remove('is-holiday'); });

  pickDates.addEventListener('click', function (e) {
    var act = e.target.closest('[data-cal]');
    if (!act) return;
    var a = act.dataset.cal, v = state.view;
    if (a === 'prev') { state.view = new Date(v.getFullYear(), v.getMonth() - 1, 1); renderCalendar(); }
    if (a === 'next') { state.view = new Date(v.getFullYear(), v.getMonth() + 1, 1); renderCalendar(); }
    if (a === 'clear') { state.start = state.end = null; state.target = 'in'; paint(null); updateFields(); }
    if (a === 'done') close();
  });

  pickGuests.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]');
    if (b) {
      state[b.dataset.step] += +b.dataset.dir;
      if (b.dataset.step === 'kids') renderAges();
      updateGuests();
    }
    if (e.target.closest('[data-guests="done"]')) {
      if (state.kids && !agesText()) {
        $$('.age-select.is-empty', kidsAges).forEach(function (l) { l.classList.remove('is-invalid'); void l.offsetWidth; l.classList.add('is-invalid'); });
        return;
      }
      close();
    }
  });

  backdrop.addEventListener('click', function () { close(); });
  document.addEventListener('click', function (e) {
    if (openPicker && e.composedPath().indexOf(form) < 0) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () {
    if (!openPicker) return;
    position(openPicker, openPicker === pickGuests ? fieldGuests : fieldIn);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!state.start || !state.end) {
      var bad = !state.start ? fieldIn : fieldOut;
      bad.classList.remove('is-invalid'); void bad.offsetWidth; bad.classList.add('is-invalid');
      bad.click();
      return;
    }
    if (state.kids && !agesText()) {
      if (openPicker !== pickGuests) fieldGuests.click();
      $$('.age-select.is-empty', kidsAges).forEach(function (l) { l.classList.remove('is-invalid'); void l.offsetWidth; l.classList.add('is-invalid'); });
      return;
    }
    var n = nights();
    var msg = 'Olá! Gostaria de consultar disponibilidade na Pousada Sobre as Ondas.\n\n' +
      '• Check-in: ' + dmy(state.start) + ' (' + DOW_LONG[state.start.getDay()] + ')\n' +
      '• Check-out: ' + dmy(state.end) + ' (' + DOW_LONG[state.end.getDay()] + ')\n' +
      '• ' + n + (n > 1 ? ' noites' : ' noite') + '\n' +
      '• Adultos: ' + state.adults + '\n' +
      '• Crianças: ' + (state.kids ? state.kids + ' (' + agesText() + ')' : '0');
    openWhatsApp(msg);
  });

  updateGuests();
  updateFields();

  /* ---------- Contact form → WhatsApp ou e-mail ---------- */
  var contactForm = $('#contact-form');
  var via = 'wa';
  $$('button[type="submit"]', contactForm).forEach(function (b) {
    b.addEventListener('click', function () { via = b.dataset.via; });
  });
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#c-name').value.trim();
    var phone = $('#c-phone').value.trim();
    var email = $('#c-email').value.trim();
    var msg = $('#c-msg').value.trim();
    var body = msg + '\n\n— ' + name + (phone ? '\nTelefone: ' + phone : '') + (email ? '\nE-mail: ' + email : '');
    if (via === 'mail') {
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Contato pelo site — ' + name) + '&body=' + encodeURIComponent(body);
    } else {
      openWhatsApp('Olá! Meu nome é ' + name + '.\n\n' + body);
    }
  });
})();

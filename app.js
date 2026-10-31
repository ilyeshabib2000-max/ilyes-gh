(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* أمان الروابط الخارجية: أي رابط يفتح نافذة جديدة يحصل على rel آمن */
  $$('a[target="_blank"]').forEach(function (a) {
    a.setAttribute('rel', 'noopener noreferrer nofollow');
  });

  /* البريد: يُركَّب هنا فقط (حماية من جامعي الإيميلات) */
  (function () {
    var t = $('#mailText'), b = $('#mailBtn');
    if (!t || !b) return;
    var addr = t.getAttribute('data-u') + '@' + t.getAttribute('data-h');
    t.textContent = addr;
    b.setAttribute('href', 'mailto:' + addr);
  })();

  /* عنوان الصفحة: ظهور الكلمات واحدة واحدة (بدون innerHTML) */
  (function () {
    var h = $('#h1'), i = 0;
    if (!h) return;
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = t;
            s.style.animationDelay = (0.15 + i++ * 0.11) + 's';
            f.appendChild(s);
          });
          node.replaceChild(f, n);
        } else if (n.nodeType === 1) { wrap(n); }
      });
    }
    wrap(h);
  })();

  /* الشريط المتحرك */
  (function () {
    var track = $('#track');
    if (!track) return;
    var words = ['دروس', 'تمارين', 'امتحانات', 'حساب المعدل', 'تنظيم المهام', 'دليل الطالب', 'Talib DZ'];
    for (var k = 0; k < 4; k++) {
      words.forEach(function (w) {
        var a = document.createElement('span'); a.textContent = w; track.appendChild(a);
        var b = document.createElement('span'); b.textContent = '✦'; track.appendChild(b);
      });
    }
  })();

  /* القائمة: المؤشر المنزلق */
  var links = $$('#navLinks a'), pill = $('#pill'), nl = $('#navLinks');
  function movePill(a) {
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.right = (nl.offsetWidth - a.offsetLeft - a.offsetWidth) + 'px';
  }
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) movePill(a);
    });
  }
  window.addEventListener('load', function () { setActive('home'); });
  window.addEventListener('resize', function () { var a = $('#navLinks a.active'); if (a) movePill(a); });

  /* قائمة الجوال */
  var burger = $('#burger'), sheet = $('#sheet');
  function toggle(force) {
    var o = typeof force === 'boolean' ? force : !sheet.classList.contains('open');
    sheet.classList.toggle('open', o);
    burger.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', String(o));
    document.body.style.overflow = o ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { toggle(); });
  $$('#sheet a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });

  /* السكرول */
  var ids = ['home', 'features', 'partnership', 'founder', 'contact'];
  function onScroll() {
    var h = document.documentElement, sc = h.scrollTop, max = h.scrollHeight - h.clientHeight;
    $('#progress').style.width = (max > 0 ? sc / max * 100 : 0) + '%';
    $('#navbar').classList.toggle('scrolled', sc > 30);
    $('#dock').classList.toggle('show', sc > 500 && (max - sc) > 400);
    var cur = 'home';
    ids.forEach(function (id) {
      var e = document.getElementById(id);
      if (e && e.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id;
    });
    setActive(cur);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* العدادات (textContent فقط) */
  function count(el) {
    var n = parseFloat(el.getAttribute('data-n')), d = parseInt(el.getAttribute('data-d') || '0', 10), t0 = null;
    if (reduce || isNaN(n)) return;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1600, 1);
      el.textContent = (n * (1 - Math.pow(1 - p, 3))).toFixed(d);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* المهام: تُنجز واحدة واحدة */
  var tasksOn = false;
  function tick() {
    if (tasksOn) return; tasksOn = true;
    var ts = $$('#tasks .task');
    function cycle() {
      ts.forEach(function (t) { t.classList.remove('done'); });
      ts.forEach(function (t, i) { setTimeout(function () { t.classList.add('done'); }, 900 + i * 900); });
      setTimeout(cycle, 6200);
    }
    cycle();
  }

  /* الظهور عند التمرير */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.style.transitionDelay = (Math.min(i, 5) * 90) + 'ms';
        t.classList.add('in');
        $$('[data-n]').forEach(function (c) { if (t.contains(c) && !c._d) { c._d = 1; count(c); } });
        if (t.querySelector('#tasks')) tick();
        io.unobserve(t);
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
    tick();
  }

  /* إمالة البطاقات */
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    $$('.bx').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateY(' + (x * -6) + 'deg) rotateX(' + (y * -6) + 'deg) translateY(-6px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* شاشة الهاتف */
  var q = ['مقياس الجبر 1...', 'امتحان الإحصاء 2024...', 'ملخص الفيزياء...'], qi = 0, ci = 0, typed = $('#typed');
  function type() {
    var w = q[qi];
    if (ci <= w.length) { typed.textContent = w.slice(0, ci++); setTimeout(type, 90); }
    else { setTimeout(function () { ci = 0; qi = (qi + 1) % q.length; type(); }, 1600); }
  }
  if (typed && !reduce) type();

  var tiles = $$('#tiles .tile'), ti = 0;
  if (!reduce) setInterval(function () {
    tiles[ti].classList.remove('on'); ti = (ti + 1) % tiles.length; tiles[ti].classList.add('on');
  }, 1800);

  var tgt = 14.62, bar = $('#avgBar'), num = $('#avgNum');
  function runAvg() {
    var t0 = null;
    bar.style.width = '0';
    setTimeout(function () { bar.style.width = (tgt / 20 * 100) + '%'; }, 100);
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1600, 1);
      num.textContent = (tgt * (1 - Math.pow(1 - p, 3))).toFixed(2);
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  if (bar && num) {
    if (reduce) { bar.style.width = (tgt / 20 * 100) + '%'; }
    else {
      runAvg();
      setInterval(function () { tgt = [14.62, 12.85, 15.4, 13.7][Math.floor(Math.random() * 4)]; runAvg(); }, 6000);
    }
  }
})();

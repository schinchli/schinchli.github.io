(function () {
  var doc = document.documentElement;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = doc.dataset.motion || 'mid'; // 'low' keeps scroll reveal off
  var nav = document.getElementById('nav');

  // close the mobile menu after choosing a link (Bootstrap collapse)
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && nav.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(nav).hide();
  });

  // topic filter for talks. ponytail: keyword inference over entry text; add data-tags if topics get fuzzy.
  var TOPICS = [['GenAI and agents', /bedrock|agent|genai|amazon q|duo|chatbot|memory layer|summarizer/i], ['Security', /security|zero trust|fortif/i], ['DevSecOps and Kubernetes', /gitops|gitlab|kubernetes|devsecops|duo/i]];
  var rows = [].slice.call(document.querySelectorAll('#speaking .talk')), bar = document.getElementById('filters'), years = [].slice.call(document.querySelectorAll('#speaking .year:not(#also)'));
  rows.forEach(function (r) { r._t = TOPICS.map(function (t, i) { return t[1].test(r.textContent) ? i : -1; }).filter(function (i) { return i >= 0; }); });
  function show(i) {
    rows.forEach(function (r) { r.hidden = i >= 0 && r._t.indexOf(i) < 0; });
    years.forEach(function (y) { y.hidden = !y.querySelector('.talk:not([hidden])'); });
    [].forEach.call(bar.children, function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === i)); });
  }
  [['All', -1, rows.length]].concat(TOPICS.map(function (t, i) { return [t[0], i, rows.filter(function (r) { return r._t.indexOf(i) >= 0; }).length]; })).forEach(function (d) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.i = d[1];
    b.innerHTML = d[0] + '<span class="n">' + d[2] + '</span>'; b.addEventListener('click', function () { show(d[1]); }); bar.appendChild(b);
  });
  show(-1);

  // scroll-spy
  if ('IntersectionObserver' in window) {
    var links = {}; nav.querySelectorAll('a.nav-link[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && links[e.target.id]) {
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === e.target.id); }); } }); }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('section.block[id]').forEach(function (sec) { spy.observe(sec); });
  }

  // reading progress + back to top
  var bar2 = document.getElementById('progress'), topBtn = document.querySelector('.to-top'), tick = false;
  function prog() { var h = doc.scrollHeight - innerHeight; bar2.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; topBtn.classList.toggle('show', scrollY > 900); tick = false; }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

  // reveal on scroll, top down, once
  if ('IntersectionObserver' in window && !calm && motion !== 'low') {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.block h2, .block .intro, .prose > *, .nav-tabs, .entries > .entry, .row.g-3 > .col, .row.g-4 > .col, .panel, .line, .feature > *, .year > h3, .chips').forEach(function (el) {
      var i = [].indexOf.call(el.parentNode.children, el); el.style.setProperty('--i', Math.min(i, 5)); el.classList.add('rv'); io.observe(el);
    });
  }
  // count-up for the at-a-glance numbers
  if ('IntersectionObserver' in window && !calm) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, m = el.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/); if (!m) return;
      var end = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, t0 = performance.now();
      (function step(t) { var p = Math.min(1, (t - t0) / 900), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = v.toFixed(dec) + m[2]; if (p < 1) requestAnimationFrame(step); })(t0);
    }); }, { threshold: 1 });
    document.querySelectorAll('.stat strong').forEach(function (el) { cio.observe(el); });
  }

  // tabs (Bootstrap): deep links like #videos open the right tab
  var ids = ['articles', 'videos', 'open-source'];
  function fromHash(first) {
    var id = location.hash.slice(1);
    if (ids.indexOf(id) < 0) return;
    bootstrap.Tab.getOrCreateInstance(document.getElementById('tab-' + id)).show();
    document.getElementById('writing').scrollIntoView({ behavior: first ? 'instant' : 'smooth', block: 'start' });
  }
  fromHash(true); addEventListener('hashchange', function () { fromHash(false); });

  // split-flap board: each tile flips through a few characters, lands on the event name, holds, then moves on.
  // Static list shows instead when motion is reduced.
  var board = document.querySelector('.board'), names = [].map.call(document.querySelectorAll('.events li'), function (l) { return l.textContent; });
  if (board && !calm && names.length) {
    var SEQ = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.-&/', COLS = 18, ROWS = 2, cells = [], seen = true;
    for (var r = 0; r < ROWS; r++) {
      var ln = document.createElement('div'); ln.className = 'ln';
      for (var k = 0; k < COLS; k++) { var el = document.createElement('span'); el.className = 'c'; el.appendChild(document.createElement('span')); ln.appendChild(el); cells.push({ el: el, ch: ' ' }); }
      board.appendChild(ln);
    }
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(board);
    var put = function (cell, ch) { cell.ch = ch; cell.el.firstChild.textContent = ch === ' ' ? '' : ch; cell.el.classList.remove('f'); void cell.el.offsetWidth; cell.el.classList.add('f'); };
    var wrap = function (s) {
      var out = ['']; s.toUpperCase().split(' ').forEach(function (w) { var l = out[out.length - 1], n = l ? l + ' ' + w : w; if (n.length <= COLS) out[out.length - 1] = n; else out.push(w); });
      return out.slice(0, ROWS);
    };
    var flip = function (s) {
      var L = wrap(s), longest = 0;
      cells.forEach(function (cell, i) {
        var row = Math.floor(i / COLS), col = i % COLS, to = (L[row] || '').padEnd(COLS, ' ')[col];
        if (cell.ch === to) return;
        var end = SEQ.indexOf(to), steps = end < 0 ? 1 : 3 + Math.floor(Math.random() * 6), delay = col * 26 + row * 70;
        for (var n = 1; n <= steps; n++) (function (n) {
          var ch = end < 0 ? to : SEQ[(end - steps + n + SEQ.length * 2) % SEQ.length];
          setTimeout(function () { put(cell, ch); }, delay + n * 60);
        })(n);
        longest = Math.max(longest, delay + steps * 60);
      });
      return longest;
    };
    var i = 0;
    (function next() {
      if (!seen || document.hidden) return setTimeout(next, 500);
      var ms = flip(names[i]); i = (i + 1) % names.length; setTimeout(next, ms + 2600);
    })();
  }
})();

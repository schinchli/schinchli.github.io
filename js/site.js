(function () {
  var doc = document.documentElement;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = doc.dataset.motion || 'mid'; // 'low' keeps scroll reveal off
  var nav = document.getElementById('nav');

  // close the mobile menu after choosing a link (Bootstrap collapse)
  nav.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link || !(nav.classList.contains('show') || nav.classList.contains('collapsing'))) return;
    e.preventDefault();
    var collapse = bootstrap.Collapse.getOrCreateInstance(nav);
    nav.addEventListener('hidden.bs.collapse', function () {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        history.replaceState(null, '', link.getAttribute('href'));
        window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - document.querySelector('.site-nav').offsetHeight - 20, behavior: 'instant' });
      }
    }, { once: true });
    if (nav.classList.contains('collapsing')) {
      nav.addEventListener('shown.bs.collapse', function () { collapse.hide(); }, { once: true });
    } else collapse.hide();
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

  var navLinks = Array.from(nav.querySelectorAll('a.nav-link[href^="#"]'));
  function updateNavigation() {
    var current = null;
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section && section.getBoundingClientRect().top <= 160) current = link;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link === current);
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  // reading progress + back to top
  var bar2 = document.getElementById('progress'), topBtn = document.querySelector('.to-top'), tick = false;
  function prog() { var h = doc.scrollHeight - innerHeight; bar2.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; topBtn.classList.toggle('show', scrollY > 900); updateNavigation(); tick = false; }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

  // reveal on scroll, top down, once
  if ('IntersectionObserver' in window && !calm && motion !== 'low') {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.block h2, .block .intro, .prose > *, .nav-tabs, .entries > .entry, .row.g-3 > .col, .row.g-4 > .col, .panel, .line, .feature > *, .year > h3, .chips').forEach(function (el) {
      var i = [].indexOf.call(el.parentNode.children, el); el.style.setProperty('--i', Math.min(i, 5)); el.classList.add('rv'); io.observe(el);
    });
  }
  // tabs (Bootstrap): deep links like #videos open the right tab
  var ids = ['articles', 'videos', 'open-source'];
  function fromHash(first) {
    var id = location.hash.slice(1);
    var destination = document.getElementById(id);
    var archive = destination && destination.closest('details');
    if (archive) archive.open = true;
    if (ids.indexOf(id) < 0) return;
    bootstrap.Tab.getOrCreateInstance(document.getElementById('tab-' + id)).show();
    document.getElementById('writing').scrollIntoView({ behavior: first ? 'instant' : 'smooth', block: 'start' });
  }
  fromHash(true); addEventListener('hashchange', function () { fromHash(false); });

})();

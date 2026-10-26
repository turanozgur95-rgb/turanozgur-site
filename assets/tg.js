/* Tamakala Games - site davranışları. Çerez yok, dışarıya veri gönderilmez. */
(function () {
  var d = document, h = d.documentElement;

  // Üst menü: kaydırınca çizgi, mobilde aç/kapa
  var nav = d.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var mb = d.querySelector('.menubtn');
    if (mb) mb.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o);
    });
    nav.querySelectorAll('.links a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }
  d.querySelectorAll('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', function () { window.toggleLang(); }); });

  // Görünürken belirme (ekran görüntüsü için ?static=1 hepsini hemen gösterir)
  var rv = d.querySelectorAll('.rv');
  if (/[?&]static=1/.test(location.search)) { h.classList.add('static'); rv.forEach(function (el) { el.classList.add('in'); }); rv = []; }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Video: tıklanana kadar YouTube yüklenmez (youtube-nocookie)
  d.querySelectorAll('.vbox button[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true; f.title = b.getAttribute('aria-label') || 'Video';
      b.parentNode.appendChild(f); b.remove();
    });
  });
  d.querySelectorAll('[data-play-video]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var vis = Array.prototype.filter.call(d.querySelectorAll('.vbox button[data-yt]'), function (x) { return x.offsetParent; });
      if (vis[0]) { e.preventDefault(); vis[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); vis[0].click(); }
    });
  });

  // Ekran görüntüsü galerisi + ışık kutusu
  var lb = d.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<img alt=""><button class="x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<button class="p" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<button class="n" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>';
  d.body.appendChild(lb);
  var cur = [], ci = 0, li = lb.querySelector('img');
  function show(i) { ci = (i + cur.length) % cur.length; li.src = cur[ci].getAttribute('data-full'); li.alt = cur[ci].querySelector('img').alt; }
  function close() { lb.classList.remove('on'); d.body.style.overflow = ''; }
  d.querySelectorAll('.gallery').forEach(function (g) {
    var items = g.querySelectorAll('button[data-full]');
    items.forEach(function (b, i) { b.addEventListener('click', function () { cur = items; show(i); lb.classList.add('on'); d.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }); });
  });
  lb.querySelector('.x').onclick = close;
  lb.querySelector('.p').onclick = function () { show(ci - 1); };
  lb.querySelector('.n').onclick = function () { show(ci + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  d.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(ci - 1); else if (e.key === 'ArrowRight') show(ci + 1);
  });
  d.querySelectorAll('.gnav').forEach(function (n) {
    n.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = Array.prototype.filter.call(d.querySelectorAll('.gallery'), function (x) { return x.offsetParent; })[0];
        if (g) g.scrollBy({ left: (b.hasAttribute('data-next') ? 1 : -1) * g.clientWidth * 0.8, behavior: 'smooth' });
      });
    });
  });

  // Metin kopyalama (basın kiti)
  d.querySelectorAll('.copy button').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.parentNode.querySelector('.txt').innerText;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () {
        var o = b.innerHTML; b.textContent = h.lang === 'tr' ? 'Kopyalandı ✓' : 'Copied ✓'; setTimeout(function () { b.innerHTML = o; }, 1600);
      }, function () {});
    });
  });

  // Kampanya bağlantıları: siteye utm_* ile gelindiyse mağaza bağlantıları aynı kampanyayı taşır.
  // Bilgi yalnızca bu sekmede tutulur (sessionStorage), hiçbir yere gönderilmez.
  var q = new URLSearchParams(location.search), keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'], c = {};
  keys.forEach(function (k) { if (q.get(k)) c[k] = q.get(k).slice(0, 60); });
  try {
    if (Object.keys(c).length) sessionStorage.setItem('tg_c', JSON.stringify(c));
    else c = JSON.parse(sessionStorage.getItem('tg_c') || '{}');
  } catch (e) {}
  if (c.utm_source || c.utm_campaign) {
    d.querySelectorAll('a[data-store]').forEach(function (a) {
      var u = new URL(a.href);
      if (a.getAttribute('data-store') === 'play') {
        var r = new URLSearchParams(); r.set('utm_source', c.utm_source || 'tamakalagames.com'); r.set('utm_medium', c.utm_medium || 'website');
        r.set('utm_campaign', c.utm_campaign || a.getAttribute('data-place')); if (c.utm_content) r.set('utm_content', c.utm_content);
        u.searchParams.set('referrer', r.toString());
      } else {
        u.searchParams.set('ct', ((c.utm_source || 'web') + '-' + (c.utm_campaign || a.getAttribute('data-place'))).slice(0, 40));
      }
      a.href = u.toString();
    });
    d.querySelectorAll('a[href^="/go/"]').forEach(function (a) { a.href = a.getAttribute('href').split('?')[0] + '?' + new URLSearchParams(c).toString(); });
  }
})();

/* Dil: ?lang=tr|en > kullanıcının seçimi > tarayıcı dili (Türkçe değilse İngilizce). Tek dilli sayfalar (data-fixed) değişmez. */
(function(){
  var h = document.documentElement;
  h.className += ' js';
  window.toggleLang = function(){};
  if (h.hasAttribute('data-fixed')) return;
  var m = location.search.match(/[?&]lang=(tr|en)\b/), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  if (m) { saved = m[1]; try { localStorage.setItem('lang', saved); } catch (e) {} }
  var l = saved || ((navigator.language || '').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en');
  function apply(){ h.lang = l; var t = h.getAttribute('data-t-' + l); if (t) document.title = t;
    var d = h.getAttribute('data-d-' + l), m = document.querySelector('meta[name="description"]'); if (d && m) m.setAttribute('content', d); }
  apply();
  window.toggleLang = function(){
    l = h.lang === 'tr' ? 'en' : 'tr';
    apply();
    try { localStorage.setItem('lang', l); } catch (e) {}
  };
})();

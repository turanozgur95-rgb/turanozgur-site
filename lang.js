/* Dil: önce kullanıcının seçimi, yoksa tarayıcı dili (Türkçe değilse İngilizce). */
(function(){
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var l = saved || ((navigator.language || '').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en');
  document.documentElement.lang = l;
  window.toggleLang = function(){
    l = l === 'tr' ? 'en' : 'tr';
    document.documentElement.lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
  };
})();

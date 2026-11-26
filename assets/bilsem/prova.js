/* Tamakala Games · BİLSEM sınav provası. <section class="bqs" data-konular='[{"k":"matris","slug":"...","ad":"Matris","vid":"..."}]'>
   Süreli bölümler, 13 konudan rastgele sorular, işaretleme, geri dönme; sonuçta konu/beceri analizi, süre analizi, çözümler.
   Kayıt yalnızca bu cihazda (localStorage). Sunucuya veri gönderilmez. */
(function () {
  "use strict";
  var BQ = window.BQ;
  if (!BQ) return;
  var SV_AD = { 1: "1. sınıf", 2: "2. sınıf", 3: "3. sınıf" };
  var DAKIKA = { 1: 15, 2: 13, 3: 12 }; /* 13 soruluk bir bölümün süresi */
  var GRUP = [
    ["Kural bulma", ["matris", "oruntu", "sifre"]],
    ["Ayırt etme", ["farkli", "sayma"]],
    ["Zihinde çevirme", ["dondurme", "katlama", "yon"]],
    ["Uzamsal görünüm", ["kup", "golge", "parca"]],
    ["Karşılaştırma", ["terazi"]],
    ["Görsel bellek", ["bellek"]]
  ];
  var ANAH = "bqs-gecmis";

  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function btn(cls, html, f) { var b = el("button", cls, html); b.type = "button"; if (f) b.addEventListener("click", f); return b; }
  function tohum() { try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % 2000000000; } catch (e) { return Math.floor(Math.random() * 2e9); } }
  function karistir(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function saat(sn) { sn = Math.max(0, Math.ceil(sn)); return Math.floor(sn / 60) + ":" + ("0" + (sn % 60)).slice(-2); }
  function sureYazi(sn) { sn = Math.round(sn); var d = Math.floor(sn / 60), s = sn % 60; return d ? d + " dk" + (s ? " " + s + " sn" : "") : s + " sn"; }
  function tarih(t) { var d = new Date(t); var ay = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]; return d.getDate() + " " + ay[d.getMonth()] + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function duz(s) { return String(s).replace(/<[^>]+>/g, ""); }

  function kur(kok) {
    var KON = JSON.parse(kok.getAttribute("data-konular"));
    var KM = {};
    KON.forEach(function (x) { KM[x.k] = x; });
    var ayar = ls("bqs-ayar") || { sv: 1, tip: "tam" };
    var S = null, tik = null;
    kok.tabIndex = -1;

    function temizle() { clearInterval(tik); tik = null; kok.innerHTML = ""; }
    function yukari() { var r = kok.getBoundingClientRect(); if (r.top < 0 || r.top > window.innerHeight * 0.6) kok.scrollIntoView({ behavior: "smooth", block: "start" }); }
    window.addEventListener("beforeunload", function (e) { if (S && !S.bitti) { e.preventDefault(); e.returnValue = ""; } });

    /* ------------------------------------------------ başlangıç ekranı */
    function giris() {
      temizle(); S = null;
      var gecmis = ls(ANAH) || [];
      var g = el("div", "bqs-giris");
      g.appendChild(el("div", "bqs-kafa", '<span class="bqp-rozet">Hazırlık provası</span><b>BİLSEM sınav provası</b><small>Tablet düzeninde, süreli, 13 konudan karışık</small>'));
      var ic = el("div", "bqs-ic");
      var sol = el("div", "bqs-ayar");
      sol.appendChild(el("h3", "", "1. Sınıf düzeyi"));
      var sv = el("div", "bqs-secenek"); sv.setAttribute("role", "radiogroup"); sv.setAttribute("aria-label", "Sınıf düzeyi");
      [1, 2, 3].forEach(function (s) {
        var b = btn("", "<b>" + SV_AD[s] + "</b><small>" + ["Isınma", "Orta", "Zor"][s - 1] + "</small>", function () { ayar.sv = s; ls("bqs-ayar", ayar); isaret(); });
        b.setAttribute("role", "radio"); b.dataset.v = s; sv.appendChild(b);
      });
      sol.appendChild(sv);
      sol.appendChild(el("h3", "", "2. Prova türü"));
      var tp = el("div", "bqs-secenek iki"); tp.setAttribute("role", "radiogroup"); tp.setAttribute("aria-label", "Prova türü");
      [["tam", "Tam prova", "2 bölüm · 26 soru"], ["kisa", "Kısa prova", "1 bölüm · 13 soru"]].forEach(function (x) {
        var b = btn("", "<b>" + x[1] + "</b><small class=\"bqs-tp\">" + x[2] + "</small>", function () { ayar.tip = x[0]; ls("bqs-ayar", ayar); isaret(); });
        b.setAttribute("role", "radio"); b.dataset.v = x[0]; tp.appendChild(b);
      });
      sol.appendChild(tp);
      var ozet = el("p", "bqs-ozet");
      sol.appendChild(ozet);
      var bas = btn("bqp-b1 bqs-basla", "Provayı başlat <span aria-hidden=\"true\">→</span>", baslat);
      sol.appendChild(bas);
      ic.appendChild(sol);
      var sag = el("div", "bqs-kural");
      sag.innerHTML = "<h3>Kurallar</h3><ul>" +
        "<li><b>13 konudan karışık sorular.</b> Her provada sorular yeniden üretilir; aynı prova iki kez gelmez.</li>" +
        "<li><b>Süreli bölümler.</b> Süre bitince bölüm kendiliğinden kapanır; boş sorular boş sayılır.</li>" +
        "<li><b>Geri dönebilirsiniz.</b> Bölüm içinde sorular arasında gezinin, emin olmadıklarınızı <span class=\"bqs-bayrak-i\">işaretleyin</span>.</li>" +
        "<li><b>Görsel bellek sorusu</b> resmi yalnız bir kez gösterir.</li>" +
        "<li><b>Cevaplar sonda.</b> Sonuçta konu ve beceri analizi, süre analizi ve yanlışların adım adım çözümü gelir.</li>" +
        "<li><b>Veri gönderilmez.</b> Sonuçlar yalnız bu cihazda saklanır; önceki provalarınızla karşılaştırılır.</li></ul>" +
        "<p class=\"bqs-uyari\">Bu bir hazırlık provasıdır; resmî bir sınav ya da resmî bir sonuç değildir. Sorular Tamakala Games'in özgün sorularıdır.</p>";
      ic.appendChild(sag);
      g.appendChild(ic);
      if (gecmis.length) {
        var son = gecmis[gecmis.length - 1];
        g.appendChild(el("p", "bqs-son", "Son provanız: <b>" + son.d + " / " + son.n + " doğru</b> · " + SV_AD[son.sv] + " · " + (son.tip === "tam" ? "tam" : "kısa") + " prova · " + tarih(son.t) + (gecmis.length > 1 ? " · toplam " + gecmis.length + " prova" : "")));
      }
      kok.appendChild(g);
      function isaret() {
        [].forEach.call(sv.children, function (b) { var on = +b.dataset.v === ayar.sv; b.className = on ? "on" : ""; b.setAttribute("aria-checked", on); });
        [].forEach.call(tp.children, function (b) { var on = b.dataset.v === ayar.tip; b.className = on ? "on" : ""; b.setAttribute("aria-checked", on); });
        var nb = ayar.tip === "tam" ? 2 : 1;
        ozet.innerHTML = "<b>" + SV_AD[ayar.sv] + " · " + (nb * 13) + " soru · " + (nb * DAKIKA[ayar.sv]) + " dakika</b>" + (nb > 1 ? " (2 bölüm × " + DAKIKA[ayar.sv] + " dakika, arada mola)" : "");
      }
      isaret();
    }

    /* ------------------------------------------------ prova kurulumu */
    function baslat() {
      var nb = ayar.tip === "tam" ? 2 : 1;
      S = { sv: ayar.sv, tip: ayar.tip, Q: [], B: [], b: 0, i: 0, bitti: false, t0: Date.now() };
      var anahtarlar = KON.map(function (x) { return x.k; });
      for (var b = 0; b < nb; b++) {
        var sira = karistir(anahtarlar.slice());
        if (sira[0] === "bellek") { sira.push(sira.shift()); }
        var idx = [];
        sira.forEach(function (k) {
          var q;
          try { q = BQ.uret(k, S.sv, tohum()); } catch (e) { return; }
          idx.push(S.Q.length);
          S.Q.push({ q: q, k: k, c: -1, f: false, sn: 0, bg: false, b: b });
        });
        S.B.push({ idx: idx, sure: DAKIKA[S.sv] * 60, kalan: DAKIKA[S.sv] * 60, bitti: false });
      }
      bolumBasla();
    }

    function bolumBasla() {
      temizle();
      S.i = 0;
      var bol = S.B[S.b];
      var son = Date.now();
      sinavEkrani();
      tik = setInterval(function () {
        var simdi = Date.now(), dt = (simdi - son) / 1000; son = simdi;
        bol.kalan -= dt;
        var cur = S.Q[bol.idx[S.i]];
        if (cur) cur.sn += dt;
        zamanYaz();
        if (bol.kalan <= 0) { bol.kalan = 0; bolumBitir(true); }
      }, 250);
    }

    /* ------------------------------------------------ sınav ekranı */
    var E = {};
    function sinavEkrani() {
      var bol = S.B[S.b];
      var ust = el("div", "bqs-ust");
      E.bas = el("div", "bqs-bolum");
      ust.appendChild(E.bas);
      E.saat = el("div", "bqs-saat");
      E.saat.setAttribute("role", "timer");
      E.saat.setAttribute("aria-label", "Kalan süre");
      ust.appendChild(E.saat);
      ust.appendChild(btn("bqs-cik", "Çık", function () { onay("Provadan çıkmak istiyor musunuz? Bu prova kaydedilmez.", "Çık", giris); }));
      kok.appendChild(ust);
      E.ilerle = el("div", "bqs-ilerle", "<i></i>");
      kok.appendChild(E.ilerle);
      E.palet = el("div", "bqs-palet");
      E.palet.setAttribute("aria-label", "Sorular");
      bol.idx.forEach(function (qi, j) {
        var b = btn("", String(j + 1), function () { git(j); });
        b.setAttribute("aria-label", "Soru " + (j + 1));
        E.palet.appendChild(b);
      });
      kok.appendChild(E.palet);
      var sahne = el("div", "bqs-sahne");
      var u = el("div", "bqp-ust");
      E.fig = el("div", "bqp-fig");
      var sag = el("div", "bqp-sag");
      E.soru = el("p", "bqs-soru");
      E.sec = el("div", "bqp-sec");
      sag.appendChild(E.soru); sag.appendChild(E.sec);
      u.appendChild(E.fig); u.appendChild(sag);
      sahne.appendChild(u);
      var alt = el("div", "bqs-alt");
      E.geri = btn("bqp-b2", "<span aria-hidden=\"true\">←</span> Önceki", function () { git(S.i - 1); });
      E.bayrak = btn("bqs-bayrak", "İşaretle", function () { var c = S.Q[bol.idx[S.i]]; c.f = !c.f; durum(); });
      E.ileri = btn("bqp-b1", "", function () { if (S.i < bol.idx.length - 1) git(S.i + 1); else bolumSor(); });
      alt.appendChild(E.geri); alt.appendChild(E.bayrak); alt.appendChild(E.ileri);
      sahne.appendChild(alt);
      kok.appendChild(sahne);
      kok.appendChild(el("p", "bqs-ipucu", "Klavye: 1-4 ile şık seç, ← → ile gezin, İ ile işaretle. Bu bir hazırlık provasıdır; resmî sınav değildir."));
      goster();
      zamanYaz();
    }

    function zamanYaz() {
      if (!E.saat || !S) return;
      var bol = S.B[S.b];
      E.saat.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 9v4l2.5 2M9 2h6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' + saat(bol.kalan);
      E.saat.className = "bqs-saat" + (bol.kalan <= 60 ? " az" : bol.kalan <= 180 ? " orta" : "");
    }

    function git(j) {
      var bol = S.B[S.b];
      if (j < 0 || j >= bol.idx.length || E.bellek) return;
      S.i = j; goster(); yukari();
    }

    function goster() {
      var bol = S.B[S.b], c = S.Q[bol.idx[S.i]], q = c.q;
      E.bas.innerHTML = (S.B.length > 1 ? "<span>" + (S.b + 1) + ". bölüm</span>" : "") + "<b>Soru " + (S.i + 1) + " / " + bol.idx.length + "</b>";
      E.ileri.innerHTML = S.i < bol.idx.length - 1 ? "Sonraki <span aria-hidden=\"true\">→</span>" : "Bölümü bitir";
      E.geri.disabled = S.i === 0;
      if (q.bellek && !c.bg) return bellek(c);
      ciz(c);
      durum();
    }

    function ciz(c) {
      var q = c.q;
      E.fig.innerHTML = q.fig;
      E.soru.innerHTML = '<span class="bqp-tur">' + KM[c.k].ad + "</span>" + q.soru + (q.bellek ? '<small class="bqs-bnot">Bellek resmi yalnız bir kez gösterildi.</small>' : "");
      E.sec.innerHTML = "";
      E.sec.className = "bqp-sec " + (q.tur === "metin" ? "metin" : "svg");
      q.sec.forEach(function (s, i) {
        var b = btn("bqp-o", '<span class="bqp-h">' + BQ.HARF[i] + "</span>" + (q.tur === "metin" ? '<span class="bqp-m">' + s + "</span>" : s), function () { sec(i); });
        b.setAttribute("aria-label", "Şık " + BQ.HARF[i] + (q.tur === "metin" ? ": " + duz(s) : ""));
        E.sec.appendChild(b);
      });
    }

    function bellek(c) {
      var q = c.q, sn = q.bellek.sn, t0 = Date.now();
      E.bellek = true;
      E.fig.innerHTML = q.bellek.fig;
      E.soru.innerHTML = '<span class="bqp-tur">' + KM[c.k].ad + "</span><b>Dikkatle bak ve aklında tut!</b> " + '<span class="bqp-say">' + sn + "</span> saniye";
      E.sec.className = "bqp-sec"; E.sec.innerHTML = "";
      var hz = btn("bqp-b2", "Hazırım", bitir);
      E.sec.appendChild(hz);
      var cubuk = el("div", "bqp-cubuk", "<i></i>");
      E.sec.appendChild(cubuk);
      [E.geri, E.ileri, E.bayrak].forEach(function (b) { b.disabled = true; });
      E.palet.classList.add("kilit");
      var z = setInterval(function () {
        if (!S || S.B[S.b].bitti) { clearInterval(z); return; }
        var g = (Date.now() - t0) / 1000;
        var s = E.soru.querySelector(".bqp-say");
        if (s) s.textContent = Math.max(0, Math.ceil(sn - g));
        cubuk.firstChild.style.width = Math.max(0, 100 - g / sn * 100) + "%";
        if (g >= sn) bitir();
      }, 100);
      function bitir() {
        clearInterval(z);
        if (!E.bellek) return;
        E.bellek = false; c.bg = true;
        E.palet.classList.remove("kilit");
        E.ileri.disabled = false; E.bayrak.disabled = false;
        goster();
      }
    }

    function sec(i) {
      var c = S.Q[S.B[S.b].idx[S.i]];
      c.c = c.c === i ? -1 : i;
      durum();
    }

    function durum() {
      var bol = S.B[S.b], c = S.Q[bol.idx[S.i]];
      [].forEach.call(E.sec.children, function (b, j) { if (b.classList.contains("bqp-o")) { b.classList.toggle("secili", j === c.c); b.setAttribute("aria-pressed", j === c.c); } });
      E.bayrak.classList.toggle("on", c.f);
      E.bayrak.setAttribute("aria-pressed", c.f);
      E.bayrak.textContent = c.f ? "İşaretli" : "İşaretle";
      var dolu = 0;
      [].forEach.call(E.palet.children, function (b, j) {
        var x = S.Q[bol.idx[j]];
        if (x.c >= 0) dolu++;
        b.className = (x.c >= 0 ? "dolu" : "") + (x.f ? " isaret" : "") + (j === S.i ? " simdi" : "");
        b.setAttribute("aria-label", "Soru " + (j + 1) + (x.c >= 0 ? ", cevaplandı" : ", boş") + (x.f ? ", işaretli" : ""));
        if (j === S.i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      E.ilerle.firstChild.style.width = (dolu / bol.idx.length * 100) + "%";
      E.ilerle.setAttribute("aria-label", dolu + " / " + bol.idx.length + " cevaplandı");
    }

    function bolumSor() {
      var bol = S.B[S.b], bos = 0, isr = 0;
      bol.idx.forEach(function (qi) { if (S.Q[qi].c < 0) bos++; if (S.Q[qi].f) isr++; });
      if (!bos && !isr) return bolumBitir(false);
      var m = [];
      if (bos) m.push("<b>" + bos + " soru boş</b>");
      if (isr) m.push("<b>" + isr + " soru işaretli</b>");
      onay(m.join(", ") + ". Kalan süre " + saat(bol.kalan) + ". Bölümü yine de bitirmek istiyor musunuz?", "Bölümü bitir", function () { bolumBitir(false); }, "Sorulara dön");
    }

    function onay(metin, evet, f, hayir) {
      var o = el("div", "bqs-onay");
      o.setAttribute("role", "alertdialog");
      o.setAttribute("aria-modal", "true");
      var k = el("div", "bqs-onay-k");
      k.appendChild(el("p", "", metin));
      var d = el("div", "bqs-onay-d");
      var h = btn("bqp-b2", hayir || "Vazgeç", function () { o.remove(); });
      d.appendChild(h);
      d.appendChild(btn("bqp-b1", evet, function () { o.remove(); f(); }));
      k.appendChild(d); o.appendChild(k);
      kok.appendChild(o);
      h.focus();
    }

    function bolumBitir(sureDoldu) {
      var bol = S.B[S.b];
      if (bol.bitti) return;
      bol.bitti = true; E.bellek = false;
      clearInterval(tik); tik = null;
      if (S.b < S.B.length - 1) return ara(sureDoldu);
      S.bitti = true;
      sonuc(sureDoldu);
    }

    function ara(sureDoldu) {
      temizle();
      var bol = S.B[S.b], dolu = bol.idx.filter(function (qi) { return S.Q[qi].c >= 0; }).length;
      var a = el("div", "bqs-ara");
      a.innerHTML = '<div class="bqs-ara-ik" aria-hidden="true">☕</div><h3>' + (S.b + 1) + ". bölüm tamamlandı" + (sureDoldu ? " (süre doldu)" : "") + "</h3>" +
        "<p>" + dolu + " / " + bol.idx.length + " soruyu cevapladınız. Cevaplar sonuç ekranında gösterilecek.</p>" +
        "<p>Sıradaki: <b>" + (S.b + 2) + ". bölüm · " + S.B[S.b + 1].idx.length + " soru · " + DAKIKA[S.sv] + " dakika</b>. Kısa bir mola verip hazır olduğunuzda başlayın.</p>";
      a.appendChild(btn("bqp-b1", (S.b + 2) + ". bölümü başlat <span aria-hidden=\"true\">→</span>", function () { S.b++; bolumBasla(); yukari(); }));
      kok.appendChild(a);
      yukari();
    }

    /* ------------------------------------------------ sonuç */
    function sonuc(sureDoldu) {
      temizle();
      var N = S.Q.length, d = 0, y = 0, bos = 0, kullan = 0;
      var kk = {};
      KON.forEach(function (x) { kk[x.k] = [0, 0, 0]; });
      S.Q.forEach(function (c) {
        c.ok = c.c === c.q.dogru;
        if (c.c < 0) bos++; else if (c.ok) d++; else y++;
        kk[c.k][1]++; if (c.ok) kk[c.k][0]++;
        kk[c.k][2] += c.sn;
      });
      S.B.forEach(function (b) { kullan += b.sure - b.kalan; });
      var gecmis = ls(ANAH) || [];
      var once = null;
      for (var i = gecmis.length - 1; i >= 0; i--) if (gecmis[i].sv === S.sv && gecmis[i].tip === S.tip) { once = gecmis[i]; break; }
      var kay = { t: Date.now(), sv: S.sv, tip: S.tip, d: d, n: N, sn: Math.round(kullan), k: {} };
      KON.forEach(function (x) { kay.k[x.k] = [kk[x.k][0], kk[x.k][1]]; });
      gecmis.push(kay);
      if (gecmis.length > 30) gecmis = gecmis.slice(-30);
      ls(ANAH, gecmis);

      var r = el("div", "bqs-sonuc");
      /* özet */
      var fark = once ? d - once.d : null;
      var ozet = el("div", "bqs-ozet-kart");
      ozet.innerHTML = halka(d, y, bos, N) +
        '<div class="bqs-ozet-m"><span class="bqp-rozet">Prova sonucu · ' + SV_AD[S.sv] + " · " + (S.tip === "tam" ? "tam" : "kısa") + " prova</span>" +
        "<h3>" + d + " / " + N + " doğru</h3>" +
        '<ul class="bqs-sayi"><li class="d"><b>' + d + "</b> doğru</li><li class=\"y\"><b>" + y + "</b> yanlış</li><li class=\"b\"><b>" + bos + "</b> boş</li><li><b>" + sureYazi(kullan) + "</b> süre</li></ul>" +
        (fark !== null ? '<p class="bqs-fark ' + (fark > 0 ? "art" : fark < 0 ? "eks" : "") + '">' + (fark > 0 ? "Önceki provaya göre <b>" + fark + " doğru daha fazla</b>. Güzel ilerleme!" : fark < 0 ? "Önceki provada " + once.d + " doğru vardı. Zorlanılan konulara aşağıdan bakın." : "Önceki provayla aynı: " + once.d + " doğru.") + "</p>" : '<p class="bqs-fark">İlk provanız kaydedildi. Bir sonraki provada ilerlemeyi burada göreceksiniz.</p>') +
        (sureDoldu ? '<p class="bqs-fark">Süre dolduğu için son bölüm kendiliğinden kapandı.</p>' : "") +
        "</div>";
      r.appendChild(ozet);
      r.appendChild(el("p", "bqs-uyari", "Bu bir hazırlık provasıdır; resmî bir sınav sonucu değildir ve bir sonucu öngörmez. Amaç, hangi soru tiplerinde zorlanıldığını görmek ve çalışmayı ona göre planlamaktır."));

      /* beceri radarı + konu çubukları */
      var ikili = el("div", "bqs-ikili");
      var rad = el("div", "bqs-panel");
      rad.innerHTML = "<h3>Beceri haritası</h3><p class=\"bqs-alt-y\">Konular 6 beceri altında toplandı. Dış çizgiye ne kadar yakınsa o kadar iyi.</p>" + radar(kk);
      ikili.appendChild(rad);
      var cub = el("div", "bqs-panel");
      cub.innerHTML = "<h3>Konu konu sonuç</h3>" + cubuklar(kk);
      ikili.appendChild(cub);
      r.appendChild(ikili);

      /* güçlü / çalışılacak */
      var guclu = [], calis = [];
      KON.forEach(function (x) { var v = kk[x.k]; if (!v[1]) return; if (v[0] === v[1]) guclu.push(x); else calis.push(x); });
      calis.sort(function (a, b) { return kk[a.k][0] / kk[a.k][1] - kk[b.k][0] / kk[b.k][1]; });
      var gc = el("div", "bqs-ikili");
      var g1 = el("div", "bqs-panel bqs-guclu");
      g1.innerHTML = "<h3>Güçlü konular</h3>" + (guclu.length ? '<div class="bqs-etiket">' + guclu.map(function (x) { return "<a href=\"/rehber/bilsem/" + x.slug + "/\">" + x.ad + "</a>"; }).join("") + "</div>" : "<p>Bu provada tamamı doğru olan konu yok. Aşağıdaki konulardan biriyle başlayın; kısa ve düzenli çalışma en iyisi.</p>");
      gc.appendChild(g1);
      var g2 = el("div", "bqs-panel bqs-calis");
      g2.innerHTML = "<h3>Çalışılacak konular</h3>" + (calis.length ? "<ul>" + calis.map(function (x) {
        var v = kk[x.k];
        return "<li><div><b>" + x.ad + "</b><small>" + v[0] + " / " + v[1] + " doğru</small></div><span><a href=\"/rehber/bilsem/" + x.slug + "/#pratik\">Pratik</a><a href=\"/rehber/bilsem/" + x.slug + "/\">Konu anlatımı</a><a href=\"https://www.youtube.com/watch?v=" + x.vid + "\" target=\"_blank\" rel=\"noopener\">Video ders</a></span></li>";
      }).join("") + "</ul>" : "<p>Tüm konularda tam doğru. Bir üst sınıf düzeyini deneyebilirsiniz.</p>");
      gc.appendChild(g2);
      r.appendChild(gc);

      /* süre analizi */
      var sp = el("div", "bqs-panel");
      var ort = 0, cs = 0; S.Q.forEach(function (c) { if (c.c >= 0) { ort += c.sn; cs++; } });
      ort = cs ? ort / cs : 0;
      var yavas = KON.filter(function (x) { return kk[x.k][1]; }).sort(function (a, b) { return kk[b.k][2] / kk[b.k][1] - kk[a.k][2] / kk[a.k][1]; });
      sp.innerHTML = "<h3>Süre analizi</h3><p class=\"bqs-alt-y\">Soru başına ortalama <b>" + sureYazi(ort) + "</b> (cevaplanan sorular). En çok zaman alan konular: <b>" + yavas.slice(0, 3).map(function (x) { return x.ad; }).join(", ") + "</b>. Çubuk yüksekliği soruya harcanan süreyi gösterir.</p>" + sureGrafik();
      r.appendChild(sp);

      /* geçmiş */
      if (gecmis.length > 1) {
        var gp = el("div", "bqs-panel");
        gp.innerHTML = "<h3>Önceki provalarla karşılaştırma</h3>" + gecmisHtml(gecmis);
        r.appendChild(gp);
      }

      /* yanlışların çözümü */
      var yan = S.Q.filter(function (c) { return !c.ok; });
      var cp = el("div", "bqs-panel");
      cp.innerHTML = "<h3>Yanlış ve boş soruların çözümü</h3>" + (yan.length ? "<p class=\"bqs-alt-y\">" + yan.length + " soru. Önce çocuğunuz yeniden denesin, sonra çözümü birlikte açın.</p>" + yan.map(cozumKart).join("") : "<p>Tüm sorular doğru. Tebrikler!</p>");
      r.appendChild(cp);

      var dg = el("div", "bqs-son-d");
      dg.appendChild(btn("bqp-b1", "Yeni sorularla tekrar dene", function () { baslat(); yukari(); }));
      dg.appendChild(btn("bqp-b2", "Ayarları değiştir", function () { giris(); yukari(); }));
      dg.appendChild(btn("bqp-b2", "Yazdır", function () { window.print(); }));
      r.appendChild(dg);
      kok.appendChild(r);
      yukari();
    }

    function halka(d, y, b, n) {
      var R = 52, C = 2 * Math.PI * R, o = 0, s = "";
      [[d, "#1fa866"], [y, "#ef6a4d"], [b, "#c9d2e3"]].forEach(function (x) {
        if (!x[0]) return;
        var L = x[0] / n * C;
        s += '<circle cx="64" cy="64" r="' + R + '" fill="none" stroke="' + x[1] + '" stroke-width="16" stroke-dasharray="' + L.toFixed(2) + " " + (C - L).toFixed(2) + '" stroke-dashoffset="' + (-o).toFixed(2) + '" transform="rotate(-90 64 64)"/>';
        o += L;
      });
      return '<svg class="bqs-halka" viewBox="0 0 128 128" role="img" aria-label="' + d + " doğru, " + y + " yanlış, " + b + ' boş"><circle cx="64" cy="64" r="' + R + '" fill="none" stroke="#eef3fb" stroke-width="16"/>' + s +
        '<text x="64" y="62" text-anchor="middle" font-size="30" font-weight="900" fill="#1d2742">' + d + '</text><text x="64" y="84" text-anchor="middle" font-size="13" font-weight="800" fill="#5b6785">/ ' + n + "</text></svg>";
    }

    function radar(kk) {
      var W = 360, H = 300, cx = 180, cy = 152, R = 104, n = GRUP.length, s = "", nok = [], deg = [];
      function p(i, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
      [0.25, 0.5, 0.75, 1].forEach(function (f) {
        s += '<polygon points="' + GRUP.map(function (g, i) { return p(i, R * f).map(function (v) { return v.toFixed(1); }).join(","); }).join(" ") + '" fill="' + (f === 1 ? "#f6f8fd" : "none") + '" stroke="#dfe6f3" stroke-width="1.2"/>';
      });
      GRUP.forEach(function (g, i) {
        var dd = 0, nn = 0;
        g[1].forEach(function (k) { if (kk[k]) { dd += kk[k][0]; nn += kk[k][1]; } });
        var v = nn ? dd / nn : 0;
        deg.push([dd, nn]);
        var e = p(i, R);
        s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '" stroke="#dfe6f3" stroke-width="1.2"/>';
        nok.push(p(i, Math.max(0.04, v) * R));
      });
      s += '<polygon points="' + nok.map(function (v) { return v[0].toFixed(1) + "," + v[1].toFixed(1); }).join(" ") + '" fill="#1aa9bd40" stroke="#1a8fae" stroke-width="3" stroke-linejoin="round"/>';
      nok.forEach(function (v) { s += '<circle cx="' + v[0].toFixed(1) + '" cy="' + v[1].toFixed(1) + '" r="5" fill="#2a3d8f" stroke="#fff" stroke-width="2"/>'; });
      GRUP.forEach(function (g, i) {
        var e = p(i, R + 22), an = Math.abs(e[0] - cx) < 8 ? "middle" : e[0] < cx ? "end" : "start";
        var yy = e[1] + (e[1] < cy - 20 ? -4 : e[1] > cy + 20 ? 12 : 4);
        s += '<text x="' + e[0].toFixed(1) + '" y="' + yy.toFixed(1) + '" text-anchor="' + an + '" font-size="13.5" font-weight="900" fill="#1d2742">' + g[0] + '</text><text x="' + e[0].toFixed(1) + '" y="' + (yy + 15).toFixed(1) + '" text-anchor="' + an + '" font-size="12" font-weight="800" fill="#5b6785">' + deg[i][0] + " / " + deg[i][1] + "</text>";
      });
      var et = GRUP.map(function (g, i) { return g[0] + " " + deg[i][0] + " / " + deg[i][1]; }).join(", ");
      return '<svg class="bqs-radar" viewBox="-20 -6 ' + (W + 40) + " " + (H + 20) + '" role="img" aria-label="Beceri haritası: ' + et + '">' + s + "</svg>";
    }

    function cubuklar(kk) {
      return '<ul class="bqs-cubuklar">' + KON.map(function (x) {
        var v = kk[x.k], par = "";
        S.Q.forEach(function (c) { if (c.k === x.k) par += '<i class="' + (c.c < 0 ? "b" : c.ok ? "d" : "y") + '"></i>'; });
        var et = v[0] === v[1] ? "Güçlü" : v[0] === 0 ? "Çalışılacak" : "Gelişiyor";
        return '<li><a href="/rehber/bilsem/' + x.slug + '/">' + x.ad + '</a><span class="bqs-par" aria-hidden="true">' + par + '</span><b>' + v[0] + " / " + v[1] + '</b><em class="' + (v[0] === v[1] ? "g" : v[0] === 0 ? "c" : "o") + '">' + et + "</em></li>";
      }).join("") + '</ul><p class="bqs-lejant"><i class="d"></i>doğru <i class="y"></i>yanlış <i class="b"></i>boş</p>';
    }

    function sureGrafik() {
      var n = S.Q.length, W = 640, H = 170, ust = 16, alt = 26, mx = 30;
      S.Q.forEach(function (c) { mx = Math.max(mx, c.sn); });
      mx = Math.ceil(mx / 30) * 30;
      var bw = (W - 40) / n, s = "";
      for (var t = 0; t <= mx; t += mx / 3) {
        var yy = H - alt - (t / mx) * (H - alt - ust);
        s += '<line x1="36" x2="' + W + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="#eef3fb"/><text x="30" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="#5b6785">' + Math.round(t) + " sn</text>";
      }
      S.Q.forEach(function (c, i) {
        var h = Math.max(2, (c.sn / mx) * (H - alt - ust)), x = 40 + i * bw;
        var renk = c.c < 0 ? "#c9d2e3" : c.ok ? "#1fa866" : "#ef6a4d";
        s += '<rect x="' + (x + bw * 0.14).toFixed(1) + '" y="' + (H - alt - h).toFixed(1) + '" width="' + (bw * 0.72).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + renk + '"><title>Soru ' + (i + 1) + " · " + KM[c.k].ad + " · " + sureYazi(c.sn) + "</title></rect>";
        if (n <= 13 || i % 2 === 0) s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#5b6785">' + (i + 1) + "</text>";
      });
      if (S.B.length > 1) { var xb = 40 + S.B[0].idx.length * bw; s += '<line x1="' + xb.toFixed(1) + '" x2="' + xb.toFixed(1) + '" y1="' + ust + '" y2="' + (H - alt) + '" stroke="#2a3d8f" stroke-dasharray="4 4"/><text x="' + (xb + 6).toFixed(1) + '" y="' + (ust + 2) + '" font-size="11" font-weight="800" fill="#2a3d8f">2. bölüm</text>'; }
      return '<svg class="bqs-sure" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Soru başına süre grafiği">' + s + "</svg>";
    }

    function gecmisHtml(g) {
      var son = g.slice(-8), W = 640, H = 150, s = "", ust = 18, alt = 30;
      var pts = son.map(function (x, i) { var oran = x.n ? x.d / x.n : 0; return [50 + i * ((W - 90) / Math.max(1, son.length - 1)), H - alt - oran * (H - alt - ust), x]; });
      if (son.length === 1) pts[0][0] = W / 2;
      [0, 0.5, 1].forEach(function (f) { var yy = H - alt - f * (H - alt - ust); s += '<line x1="40" x2="' + (W - 20) + '" y1="' + yy + '" y2="' + yy + '" stroke="#eef3fb"/>'; });
      s += '<polyline points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="none" stroke="#1a8fae" stroke-width="3" stroke-linejoin="round"/>';
      pts.forEach(function (p, i) {
        var son1 = i === pts.length - 1;
        s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (son1 ? 7 : 5) + '" fill="' + (son1 ? "#ffc233" : "#2a3d8f") + '" stroke="#fff" stroke-width="2"/>' +
          '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] - 12).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="900" fill="#1d2742">' + p[2].d + "/" + p[2].n + "</text>" +
          '<text x="' + p[0].toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="10.5" fill="#5b6785">' + tarih(p[2].t).split(" ").slice(0, 2).join(" ") + "</text>";
      });
      var tablo = "<table class=\"bqs-tablo\"><thead><tr><th>Tarih</th><th>Düzey</th><th>Tür</th><th>Doğru</th><th>Süre</th></tr></thead><tbody>" +
        g.slice(-8).reverse().map(function (x, i) { return "<tr" + (i === 0 ? ' class="yeni"' : "") + "><td>" + tarih(x.t) + "</td><td>" + SV_AD[x.sv] + "</td><td>" + (x.tip === "tam" ? "Tam" : "Kısa") + "</td><td><b>" + x.d + " / " + x.n + "</b></td><td>" + sureYazi(x.sn) + "</td></tr>"; }).join("") + "</tbody></table>";
      return '<svg class="bqs-gecmis" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Son provalardaki doğru sayıları">' + s + "</svg>" + tablo +
        '<p class="bqs-alt-y">Farklı düzey ve türdeki provalar aynı grafikte; karşılaştırırken düzeye dikkat edin. Kayıtlar yalnız bu cihazda tutulur. <button type="button" class="bqs-sil">Kayıtları sil</button></p>';
    }

    function cozumKart(c) {
      var q = c.q, i = S.Q.indexOf(c), x = KM[c.k];
      var sec = q.sec.map(function (s, j) {
        var cls = j === q.dogru ? " dogru" : j === c.c ? " yanlis" : "";
        return '<div class="bqs-o' + cls + '"><b>' + BQ.HARF[j] + "</b>" + (q.tur === "metin" ? "<span>" + s + "</span>" : s) + (j === c.c ? '<em>' + (j === q.dogru ? "" : "Seçilen") + "</em>" : "") + "</div>";
      }).join("");
      return '<details class="bqs-coz"' + (i < 0 ? "" : "") + "><summary><span class=\"bqs-no\">" + (i + 1) + "</span><b>" + x.ad + "</b><small>" + (c.c < 0 ? "Boş bırakıldı" : "Seçilen " + BQ.HARF[c.c] + ", doğru " + BQ.HARF[q.dogru]) + " · " + sureYazi(c.sn) + "</small></summary>" +
        '<div class="bqs-coz-ic">' + (q.bellek ? '<p class="bqs-k">Bellek resmi:</p><div class="bqs-cf">' + q.bellek.fig + "</div>" : "") +
        '<div class="bqs-coz-ust"><div class="bqs-cf">' + q.fig + '</div><div><p class="bqs-k">' + q.soru + '</p><div class="bqs-osec' + (q.tur === "metin" ? " metin" : "") + '">' + sec + "</div></div></div>" +
        '<div class="bqp-coz">' + (q.cozumFig ? '<div class="bqp-cf">' + q.cozumFig + "</div>" : "") + "<ol>" + q.adim.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ol></div>" +
        '<p class="bqs-git"><a href="/rehber/bilsem/' + x.slug + '/#pratik">' + x.ad + ' pratiği</a> · <a href="/rehber/bilsem/' + x.slug + '/">Konu anlatımı</a> · <a href="https://www.youtube.com/watch?v=' + x.vid + '" target="_blank" rel="noopener">Video ders</a></p></div></details>';
    }

    kok.addEventListener("click", function (e) {
      if (e.target.classList && e.target.classList.contains("bqs-sil")) {
        onay("Bu cihazdaki tüm prova kayıtları silinsin mi?", "Sil", function () { try { localStorage.removeItem(ANAH); } catch (x) { } giris(); });
      }
    });
    kok.addEventListener("keydown", function (e) {
      if (!S || S.bitti || !E.sec || kok.querySelector(".bqs-onay") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!kok.querySelector(".bqs-palet")) return;
      var n = "1234".indexOf(e.key); if (n < 0) n = "abcd".indexOf((e.key || "").toLowerCase());
      if (n >= 0 && E.sec.children[n] && E.sec.children[n].classList.contains("bqp-o")) { e.preventDefault(); sec(n); }
      else if (e.key === "ArrowRight") { e.preventDefault(); git(S.i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); git(S.i - 1); }
      else if ((e.key === "i" || e.key === "İ" || e.key === "I") && !E.bellek) { e.preventDefault(); E.bayrak.click(); }
    });
    giris();
  }

  function basla() { [].forEach.call(document.querySelectorAll(".bqs[data-konular]"), kur); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();

/* Tamakala Games · BİLSEM sınırsız pratik modülü. <section class="bqp" data-konu="matris|karma" data-seviye="1"> */
(function () {
  "use strict";
  var BQ = window.BQ;
  var SV_AD = { 1: "1. sınıf", 2: "2. sınıf", 3: "3. sınıf" };
  var OVGU = ["Harika!", "Süper!", "Aferin!", "Çok iyi!", "Tam isabet!", "Bravo!"];
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function tohum() { try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % 2000000000; } catch (e) { return Math.floor(Math.random() * 2e9); } }

  function kur(kok) {
    var konu = kok.getAttribute("data-konu");
    var karma = konu === "karma";
    var ad = karma ? "Karma deneme" : (BQ.T[konu] && BQ.T[konu].ad) || konu;
    var anah = "bqp-" + konu;
    var kayit = ls(anah) || { sv: +(kok.getAttribute("data-seviye") || 1), d: 0, t: 0, seri: 0, en: 0 };
    var q = null, cevaplandi = false, zaman = null;

    kok.innerHTML = "";
    var bas = el("div", "bqp-bas");
    bas.appendChild(el("div", "bqp-baslik", '<span class="bqp-rozet">Sınırsız pratik</span><b>' + ad + "</b>"));
    var sekme = el("div", "bqp-sv");
    sekme.setAttribute("role", "radiogroup");
    sekme.setAttribute("aria-label", "Seviye");
    [1, 2, 3].forEach(function (s) {
      var b = el("button", "", SV_AD[s]);
      b.type = "button"; b.setAttribute("role", "radio"); b.dataset.sv = s;
      b.addEventListener("click", function () { kayit.sv = s; ls(anah, kayit); isaretle(); yeni(); });
      sekme.appendChild(b);
    });
    bas.appendChild(sekme);
    var skor = el("div", "bqp-skor");
    skor.setAttribute("aria-live", "polite");
    bas.appendChild(skor);
    kok.appendChild(bas);

    var sahne = el("div", "bqp-sahne");
    var ust = el("div", "bqp-ust");
    var fig = el("div", "bqp-fig");
    var sag = el("div", "bqp-sag");
    var soruM = el("p", "bqp-soru");
    var sec = el("div", "bqp-sec");
    sag.appendChild(soruM); sag.appendChild(sec);
    ust.appendChild(fig); ust.appendChild(sag);
    sahne.appendChild(ust);
    var geri = el("div", "bqp-geri");
    geri.setAttribute("role", "status");
    geri.setAttribute("aria-live", "polite");
    sahne.appendChild(geri);
    var dugme = el("div", "bqp-dug");
    var bCoz = el("button", "bqp-b2", "Çözümü göster");
    bCoz.type = "button";
    var bYeni = el("button", "bqp-b1", "Yeni soru <span aria-hidden=\"true\">→</span>");
    bYeni.type = "button";
    dugme.appendChild(bCoz); dugme.appendChild(bYeni);
    sahne.appendChild(dugme);
    var coz = el("div", "bqp-coz");
    coz.hidden = true;
    sahne.appendChild(coz);
    kok.appendChild(sahne);
    kok.appendChild(el("p", "bqp-not", "Sorular her seferinde yeniden üretilir; hepsi Tamakala Games'in özgün hazırlık sorularıdır. Klavye: 1-4 ile cevap, Enter ile yeni soru."));

    function isaretle() {
      [].forEach.call(sekme.children, function (b) { var on = +b.dataset.sv === kayit.sv; b.className = on ? "on" : ""; b.setAttribute("aria-checked", on ? "true" : "false"); });
    }
    function skorYaz() {
      skor.innerHTML = '<span title="Doğru / toplam"><b>' + kayit.d + "</b> / " + kayit.t + " doğru</span>" + (kayit.seri >= 2 ? '<span class="bqp-seri">' + kayit.seri + " seri</span>" : "");
    }
    function yeni() {
      clearInterval(zaman);
      cevaplandi = false;
      var k = konu;
      if (karma) { var ks = BQ.SIRA.filter(function (x) { return x !== "bellek"; }); k = ks[Math.floor(Math.random() * ks.length)]; }
      try { q = BQ.uret(k, kayit.sv, tohum()); } catch (e) { geri.textContent = "Soru üretilemedi, yeniden deneyin."; return; }
      geri.className = "bqp-geri"; geri.innerHTML = "";
      coz.hidden = true; coz.innerHTML = "";
      bCoz.hidden = false; bCoz.disabled = false; bCoz.textContent = "Çözümü göster";
      sahne.classList.remove("bqp-bitti");
      if (karma) soruM.innerHTML = '<span class="bqp-tur">' + BQ.T[k].ad + "</span>" + q.soru; else soruM.textContent = q.soru;
      if (q.bellek) return bellekGoster();
      ciz();
    }
    function ciz() {
      fig.innerHTML = q.fig;
      sec.innerHTML = "";
      sec.className = "bqp-sec " + (q.tur === "metin" ? "metin" : "svg") + (q.sec.length > 4 ? " bes" : "");
      q.sec.forEach(function (s, i) {
        var b = el("button", "bqp-o", '<span class="bqp-h">' + BQ.HARF[i] + "</span>" + (q.tur === "metin" ? '<span class="bqp-m">' + s + "</span>" : s));
        b.type = "button";
        b.setAttribute("aria-label", "Şık " + BQ.HARF[i] + (q.tur === "metin" ? ": " + s.replace(/<[^>]+>/g, "") : ""));
        b.addEventListener("click", function () { cevapla(i); });
        sec.appendChild(b);
      });
    }
    function bellekGoster() {
      var sn = q.bellek.sn;
      fig.innerHTML = q.bellek.fig;
      soruM.innerHTML = "<b>Dikkatle bak ve aklında tut!</b> " + '<span class="bqp-say">' + sn + "</span> saniye";
      sec.className = "bqp-sec"; sec.innerHTML = "";
      var hz = el("button", "bqp-b2", "Hazırım");
      hz.type = "button";
      hz.addEventListener("click", function () { bitir(); });
      sec.appendChild(hz);
      var cubuk = el("div", "bqp-cubuk", "<i></i>");
      sec.appendChild(cubuk);
      var bas = Date.now();
      bCoz.hidden = true;
      function bitir() { clearInterval(zaman); soruM.textContent = q.soru; bCoz.hidden = false; ciz(); }
      zaman = setInterval(function () {
        var g = (Date.now() - bas) / 1000;
        var s = soruM.querySelector(".bqp-say");
        if (s) s.textContent = Math.max(0, Math.ceil(sn - g));
        cubuk.firstChild.style.width = Math.max(0, 100 - g / sn * 100) + "%";
        if (g >= sn) bitir();
      }, 100);
    }
    function cevapla(i) {
      if (cevaplandi || !q) return;
      cevaplandi = true;
      var ok = i === q.dogru;
      kayit.t++;
      if (ok) { kayit.d++; kayit.seri++; kayit.en = Math.max(kayit.en, kayit.seri); } else kayit.seri = 0;
      ls(anah, kayit); skorYaz();
      [].forEach.call(sec.children, function (b, j) {
        b.disabled = true;
        if (j === q.dogru) b.classList.add("dogru");
        else if (j === i) b.classList.add("yanlis");
      });
      sahne.classList.add("bqp-bitti");
      geri.className = "bqp-geri " + (ok ? "iyi" : "kotu");
      geri.innerHTML = ok ? "<b>" + OVGU[Math.floor(Math.random() * OVGU.length)] + "</b> Doğru cevap " + BQ.HARF[q.dogru] + "." + (kayit.seri >= 3 ? " Art arda " + kayit.seri + " doğru!" : "")
        : "<b>Bu sefer olmadı.</b> Doğru cevap " + BQ.HARF[q.dogru] + ". Çözüme birlikte bakalım.";
      if (!ok) cozumAc();
      bYeni.focus({ preventScroll: true });
    }
    function cozumAc() {
      if (!coz.hidden) { coz.hidden = true; bCoz.textContent = "Çözümü göster"; return; }
      coz.innerHTML = (q.cozumFig ? '<div class="bqp-cf">' + q.cozumFig + "</div>" : "") + "<ol>" + q.adim.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ol>";
      coz.hidden = false;
      bCoz.textContent = "Çözümü gizle";
    }
    bCoz.addEventListener("click", function () {
      if (!cevaplandi) {
        cevaplandi = true; kayit.t++; kayit.seri = 0; ls(anah, kayit); skorYaz();
        [].forEach.call(sec.children, function (b, j) { b.disabled = true; if (j === q.dogru) b.classList.add("dogru"); });
        sahne.classList.add("bqp-bitti");
      }
      cozumAc();
    });
    bYeni.addEventListener("click", function () { yeni(); kok.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
    kok.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT") return;
      var n = "1234".indexOf(e.key); if (n < 0) n = "abcd".indexOf((e.key || "").toLowerCase());
      if (n >= 0 && !cevaplandi && sec.children[n] && sec.children[n].classList.contains("bqp-o")) { e.preventDefault(); cevapla(n); }
      else if (e.key === "Enter" && cevaplandi && e.target === bYeni) { /* buton kendisi işler */ }
    });
    kok.tabIndex = -1;
    isaretle(); skorYaz(); yeni();
  }

  function basla() { [].forEach.call(document.querySelectorAll(".bqp[data-konu]"), kur); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();

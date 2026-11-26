/* Dengedeki teraziler — şekillerin ağırlıklarını karşılaştırma.
   Çözücü: her şekle 1..12 ağırlık atayıp tüm terazileri sağlayan atamaları kaba kuvvetle bulur; sorulan oran tek olmalı. */
(function (BQ) {
  "use strict";
  var SK = [["kare", "mavi"], ["daire", "kırmızı"], ["üçgen", "yeşil"], ["yıldız", "sarı"], ["kalp", "pembe"], ["altıgen", "mor"]];
  var KW = 260, KH = 204, AR = 12;

  // ---------------------------------------------------------------- bağımsız çözücü
  function agirlik(kefe, w) { var t = 0; for (var k in kefe) t += kefe[k] * w[k]; return t; }
  function coz(d) {
    var ids = Object.keys(d.sekiller), w = {}, oran = null, n = 0;
    (function dene(i) {
      if (i === ids.length) {
        if (!d.teraziler.every(function (t) { return agirlik(t.sol, w) === agirlik(t.sag, w); })) return;
        var r = agirlik(d.soru.sol, w) / w[d.soru.birim];
        n++;
        if (oran === null) oran = r; else if (Math.abs(oran - r) > 1e-9) throw new Error("oran belirsiz");
        return;
      }
      for (var v = 1; v <= 12; v++) { w[ids[i]] = v; dene(i + 1); }
    })(0);
    if (!n) throw new Error("çözüm yok");
    if (Math.abs(oran - Math.round(oran)) > 1e-9) throw new Error("tam sayı değil");
    return Math.round(oran);
  }

  // ---------------------------------------------------------------- çizim
  function kefeIc(kefe, sekiller, cx, ust) {
    var l = [];
    Object.keys(kefe).sort().forEach(function (k) { for (var i = 0; i < kefe[k]; i++) l.push(k); });
    var g = "", sira = [];
    for (var i = 0; i < l.length; i += 4) sira.push(l.slice(i, i + 4));
    sira.forEach(function (row, ri) {
      var y = ust - AR - 2 - ri * (2 * AR + 3);
      row.forEach(function (k, j) {
        var x = cx + (j - (row.length - 1) / 2) * (2 * AR + 2);
        var s = sekiller[k];
        g += BQ.sekil(s[0], x, y + (s[0] === "üçgen" ? 2 : 0), AR, s[1], 0, { sw: 1.8 });
      });
    });
    return g;
  }
  function terazi(x0, y0, t, sekiller, o) {
    o = o || {};
    var cx = x0 + KW / 2, L = x0 + 62, R = x0 + KW - 62, py = y0 + 146, plate = y0 + 128;
    var g = '<rect x="' + x0 + '" y="' + y0 + '" width="' + KW + '" height="' + KH + '" rx="18" fill="' + (o.soru ? BQ.SORU : "#fff") + '" stroke="' + (o.soru ? "#f0d27a" : "#cbd4e6") + '" stroke-width="2.2"/>';
    // etiket
    g += '<circle cx="' + (x0 + 22) + '" cy="' + (y0 + 22) + '" r="13" fill="' + (o.soru ? "#e2a000" : BQ.CIZ) + '"/>' + BQ.yazi(x0 + 22, y0 + 28, o.etiket, { boy: 16, kalin: 900, renk: "#fff" });
    // ayak ve direk
    g += '<rect x="' + (cx - 46) + '" y="' + (y0 + 184) + '" width="92" height="10" rx="5" fill="#5b6b8c" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    g += '<rect x="' + (cx - 5) + '" y="' + (py + 2) + '" width="10" height="' + (184 - 146 - 2) + '" fill="#7d8bab" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    // kol
    g += '<rect x="' + (L - 6) + '" y="' + (py - 4) + '" width="' + (R - L + 12) + '" height="8" rx="4" fill="#7d8bab" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    // kefe sapları ve kefeler
    [L, R].forEach(function (x) {
      g += '<rect x="' + (x - 3) + '" y="' + (plate + 6) + '" width="6" height="' + (py - plate - 8) + '" fill="#7d8bab" stroke="' + BQ.CIZ + '" stroke-width="1.5"/>';
      g += '<path d="M' + (x - 50) + "," + plate + " L" + (x + 50) + "," + plate + " Q" + (x + 44) + "," + (plate + 10) + " " + (x + 34) + "," + (plate + 10) + " L" + (x - 34) + "," + (plate + 10) + " Q" + (x - 44) + "," + (plate + 10) + " " + (x - 50) + "," + plate + 'Z" fill="#ffd166" stroke="' + BQ.CIZ + '" stroke-width="1.8" stroke-linejoin="round"/>';
    });
    g += '<circle cx="' + cx + '" cy="' + py + '" r="7" fill="#ffd166" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    g += kefeIc(t.sol, sekiller, L, plate);
    if (o.soru) {
      var b = o.birim, s = sekiller[b];
      g += BQ.kutu(R - 38, plate - 40, 36, "", { soru: true });
      g += BQ.sekil(s[0], R + 20, plate - 20 + (s[0] === "üçgen" ? 2 : 0), AR, s[1], 0, { sw: 1.8 });
    } else g += kefeIc(t.sag, sekiller, R, plate);
    return g;
  }
  function fig(d, o) {
    o = o || {};
    var G = d.teraziler.length, W = 2 * KW + 36, g = "", H;
    if (G === 1) {
      H = KH + 24;
      g += terazi(12, 12, d.teraziler[0], d.sekiller, { etiket: "1" });
      g += terazi(24 + KW, 12, d.soru, d.sekiller, { etiket: "?", soru: true, birim: d.soru.birim });
    } else {
      H = 2 * KH + 36;
      d.teraziler.forEach(function (t, i) { g += terazi(12 + i * (KW + 12), 12, t, d.sekiller, { etiket: String(i + 1) }); });
      g += terazi((W - KW) / 2, 24 + KH, d.soru, d.sekiller, { etiket: "?", soru: true, birim: d.soru.birim });
    }
    return BQ.svg(W, H, '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>' + g, o.etiket || "Dengedeki teraziler");
  }

  // ---------------------------------------------------------------- metin yardımcıları
  function adSay(n, id, d) { return n + " " + d.sekiller[id][0]; }
  function kefeMetin(k, d) { return Object.keys(k).sort().map(function (id) { return adSay(k[id], id, d); }).join(" + "); }
  function sayi(k) { var t = 0; for (var x in k) t += k[x]; return t; }

  // ---------------------------------------------------------------- üretici
  function gen(rnd, sv) {
    var sec = rnd.sample(SK, 3), sk = { A: sec[0], B: sec[1], C: sec[2] };
    var d = { sekiller: sk, teraziler: [], soru: null }, ans, celd, adim = [];
    var nA = sk.A[0], nB = sk.B[0], nC = sk.C[0];
    if (sv === 1) {
      var r = rnd.int(2, 4), n = rnd.int(2, 3);
      if (n * r > 12) return null;
      d.teraziler.push({ sol: { A: 1 }, sag: { B: r } });
      d.soru = { sol: { A: n }, birim: "B" };
      ans = n * r;
      celd = [r, n + r].concat(rnd.shuffle([ans + 1, ans - 1, ans + 2, ans - 2]));
      adim = ["1. terazi dengede: <b>1 " + nA + " = " + r + " " + nB + "</b>.",
        "Soru terazisinde " + n + " " + nA + " var. Her " + nA + " yerine " + r + " " + nB + " koy.",
        n + " × " + r + " = <b>" + ans + "</b> " + nB + ". (" + r + " diyen yalnız bir " + nA + " düşünmüş olur.)"];
    } else if (sv === 2) {
      var a = rnd.int(2, 3), b = rnd.int(2, 4), m = rnd.chance(0.25) && a * b <= 6 ? 2 : 1;
      d.teraziler.push({ sol: { A: 1 }, sag: { B: a } }, { sol: { B: 1 }, sag: { C: b } });
      d.soru = { sol: { A: m }, birim: "C" };
      ans = m * a * b;
      celd = [a + b, m === 2 ? a * b : b * m + a].concat(rnd.shuffle([ans + 1, ans - 1, ans + 2, ans - 2]), [a, b]);
      adim = ["1. terazi: <b>1 " + nA + " = " + a + " " + nB + "</b>. 2. terazi: <b>1 " + nB + " = " + b + " " + nC + "</b>.",
        "1 " + nA + " yerine " + a + " " + nB + " koy; her " + nB + " de " + b + " " + nC + " eder: " + a + " × " + b + " = <b>" + (a * b) + "</b> " + nC + ".",
        (m === 2 ? "Soruda 2 " + nA + " var: 2 × " + (a * b) + " = <b>" + ans + "</b> " + nC + ". " : "") + "Sayıları toplayan " + (a + b) + " der; ama her " + nB + " " + b + " " + nC + " ettiği için çarpmak gerekir."];
    } else {
      var a3 = rnd.int(2, 4), b3 = rnd.int(a3 + 1, 9), p = rnd.int(1, 2), q = rnd.int(0, 1);
      if (p * a3 + q > 7) p = 1;
      var t1 = { sol: { B: p }, sag: { C: p * a3 + q } };
      if (q) t1.sol.C = q;
      var q2 = rnd.int(0, 1), tB = rnd.int(1, Math.max(1, Math.floor((b3 + q2) / a3))), u = b3 + q2 - tB * a3;
      if (u < 0 || tB + u > 6 || tB < 1) return null;
      if (q2 && u === 0 && rnd.chance(0.5)) return null;
      var t2 = { sol: { A: 1 }, sag: { B: tB } };
      if (q2) t2.sol.C = q2;
      if (u) t2.sag.C = u;
      if (q2 && u && rnd.chance(0.7)) return null; // iki kefede de daire olması nadir olsun
      var hedef = rnd.pick([{ A: 1 }, { A: 1, B: 1 }, { A: 2 }]);
      ans = (hedef.A || 0) * b3 + (hedef.B || 0) * a3;
      if (ans > 12) return null;
      var ilk = rnd.chance(0.5);
      d.teraziler = ilk ? [t1, t2] : [t2, t1];
      d.soru = { sol: hedef, birim: "C" };
      var i1 = ilk ? 1 : 2, i2 = ilk ? 2 : 1;
      var yanlis = (hedef.A || 0) * (tB + u - q2) + (hedef.B || 0) * (p * a3 + q);
      celd = [yanlis, ans - a3 + 1].concat(rnd.shuffle([ans + 1, ans - 1, ans + 2, ans - 2]));
      var s1 = i1 + ". terazi: " + kefeMetin(t1.sol, d) + " = " + kefeMetin(t1.sag, d) + ".";
      s1 += q ? " İki kefeden de 1 " + nC + " çıkarırsan denge bozulmaz: " + p + " " + nB + " = " + (p * a3) + " " + nC + "." : "";
      s1 += p > 1 ? " Yarısı: <b>1 " + nB + " = " + a3 + " " + nC + "</b>." : " Yani <b>1 " + nB + " = " + a3 + " " + nC + "</b>.";
      var s2 = i2 + ". terazi: " + kefeMetin(t2.sol, d) + " = " + kefeMetin(t2.sag, d) + ". Her " + nB + " yerine " + a3 + " " + nC + " koy: sağ kefe " + tB + " × " + a3 + (u ? " + " + u : "") + " = " + (tB * a3 + u) + " " + nC + ".";
      s2 += q2 ? " İki kefeden de 1 " + nC + " çıkar: <b>1 " + nA + " = " + b3 + " " + nC + "</b>." : " Yani <b>1 " + nA + " = " + b3 + " " + nC + "</b>.";
      adim = ["En hafif şekli birim al: her şeyi " + nC + " cinsinden yaz. Önce yalnız " + nB + " ve " + nC + " olan teraziden başla.", s1, s2,
        "Soru kefesi: " + kefeMetin(hedef, d) + " = " + (hedef.A === 2 ? "2 × " + b3 : hedef.B ? b3 + " + " + a3 : String(b3)) + " = <b>" + ans + "</b> " + nC + "."];
    }
    celd = celd.filter(function (v) { return v >= 1 && v !== ans; }).map(String);
    var s = BQ.siklar(rnd, String(ans), celd);
    if (!s) return null;
    d.siklar = s.liste;
    if (d.teraziler.some(function (t) { return sayi(t.sol) > 8 || sayi(t.sag) > 8; })) return null;
    var cz = Object.assign({}, d, { soru: Object.assign({}, d.soru) });
    var cevapFig = fig(d).replace(/<rect x="[\d.]+" y="[\d.]+" width="36" height="36"[^>]*\/><text[^>]*>\?<\/text>/, function (m) {
      var x = +/x="([\d.]+)"/.exec(m)[1], y = +/y="([\d.]+)"/.exec(m)[1];
      return '<rect x="' + x + '" y="' + y + '" width="36" height="36" rx="3.2" fill="#e6f8ef" stroke="#1fa866" stroke-width="3"/>' + BQ.yazi(x + 18, y + 26, String(ans), { boy: 22, kalin: 900, renk: "#1fa866" });
    });
    adim.push("Doğru cevap <b>" + BQ.HARF[s.dogru] + "</b>.");
    return {
      soru: "Teraziler dengede. Soru işaretli kefeye kaç " + sk[d.soru.birim][0] + " koymalısın?",
      fig: fig(d),
      tur: "metin",
      sec: s.liste,
      dogru: s.dogru,
      data: cz,
      cozumFig: cevapFig,
      adim: adim
    };
  }

  BQ.reg("terazi", {
    ad: "Terazi",
    gen: gen,
    coz: function (q) {
      var v = coz(q.data);
      var es = q.data.siklar.map(function (s, i) { return +s === v ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

/* Şifre — (a) şekil-sayı denklemleri (şekiller 1..9 arası birer rakam), (b) şekil→rakam anahtarıyla kod çözme.
   Çözücü (a): tüm şekillere 1..9 kaba kuvvet; tek çözüm şart. (b): anahtarla çözer, anahtar birebir olmalı. */
(function (BQ) {
  "use strict";
  var HAVUZ = ["daire", "kare", "üçgen", "yıldız", "baklava", "kalp", "altıgen", "beşgen", "hilal", "artı"];
  var RENKLER = ["kırmızı", "mavi", "yeşil", "sarı", "mor", "turuncu", "pembe", "turkuaz"];
  var OPS = { "+": "+", "-": "−", "*": "×" };

  // ---------------------------------------------------------------- değerlendirme ve çözücü
  function deger(tok, v) {
    var terim = [], t = null, op = "+";
    function al(x) { return typeof x === "number" ? x : v[x]; }
    for (var i = 0; i < tok.length; i += 2) {
      var x = al(tok[i]);
      if (i > 0 && tok[i - 1] === "*") t *= x;
      else { if (t !== null) terim.push([op, t]); op = i > 0 ? tok[i - 1] : "+"; t = x; }
    }
    terim.push([op, t]);
    return terim.reduce(function (s, p) { return p[0] === "-" ? s - p[1] : s + p[1]; }, 0);
  }
  function cozumler(d) {
    var ids = Object.keys(d.sekiller), v = {}, l = [];
    (function dene(i) {
      if (i === ids.length) { if (d.denk.every(function (e) { return deger(e.sol, v) === e.sag; })) l.push(Object.assign({}, v)); return; }
      for (var x = 1; x <= 9; x++) { v[ids[i]] = x; dene(i + 1); }
    })(0);
    return l;
  }
  function kodCoz(d) {
    var a = {}, r = {};
    d.anahtar.forEach(function (p) {
      if (p[0] in a || p[1] in r) throw new Error("anahtar birebir değil");
      a[p[0]] = p[1]; r[p[1]] = p[0];
    });
    var sayilar = d.dizi.map(function (dz) {
      return +dz.map(function (id) { if (!(id in a)) throw new Error("anahtarda yok"); return a[id]; }).join("");
    });
    return d.islem === "+" ? sayilar[0] + sayilar[1] : sayilar[0];
  }

  // ---------------------------------------------------------------- çizim
  var SW = 46, OW = 30, R = 17;
  function tokW(x) { return typeof x === "number" ? String(x).length * 17 + 14 : x in OPS ? OW : SW; }
  function tokCiz(x, cx, cy, sk) {
    if (typeof x === "number") return BQ.yazi(cx, cy + 11, String(x), { boy: 32, kalin: 900 });
    if (x in OPS) return BQ.yazi(cx, cy + 10, OPS[x], { boy: 30, kalin: 900, renk: "#5b6b8c" });
    return BQ.sekil(sk[x][0], cx, cy + (sk[x][0] === "üçgen" ? 3 : 0), R, sk[x][1], 0, { sw: 2 });
  }
  function satirW(tok) { return tok.reduce(function (s, x) { return s + tokW(x); }, 0); }
  function denkFig(d, cevap) {
    var satirlar = d.denk.map(function (e) { return { sol: e.sol, sag: String(e.sag) }; }).concat([{ sol: d.hedef, sag: cevap === undefined ? null : String(cevap), soru: true }]);
    var maxL = Math.max.apply(0, satirlar.map(function (s) { return satirW(s.sol); }));
    var RH = 62, pad = 20, eqX = pad + 18 + maxL + 22, W = Math.max(320, eqX + 22 + 86 + pad), H = satirlar.length * RH + 2 * pad;
    var g = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    satirlar.forEach(function (s, i) {
      var y = pad + i * RH, cy = y + RH / 2;
      g += '<rect x="' + (pad - 6) + '" y="' + (y + 4) + '" width="' + (W - 2 * pad + 12) + '" height="' + (RH - 8) + '" rx="14" fill="' + (s.soru ? BQ.SORU : "#fff") + '" stroke="' + (s.soru ? "#f0d27a" : "#cbd4e6") + '" stroke-width="2"/>';
      var x = eqX - 22 - satirW(s.sol);
      s.sol.forEach(function (t) { var w = tokW(t); g += tokCiz(t, x + w / 2, cy, d.sekiller); x += w; });
      g += BQ.yazi(eqX, cy + 10, "=", { boy: 30, kalin: 900, renk: "#5b6b8c" });
      if (s.sag === null) g += BQ.kutu(eqX + 24, cy - 21, 42, "", { soru: true });
      else if (s.soru) g += '<rect x="' + (eqX + 22) + '" y="' + (cy - 21) + '" width="' + (s.sag.length * 18 + 26) + '" height="42" rx="8" fill="#e6f8ef" stroke="#1fa866" stroke-width="3"/>' + BQ.yazi(eqX + 22 + (s.sag.length * 18 + 26) / 2, cy + 11, s.sag, { boy: 32, kalin: 900, renk: "#1fa866" });
      else g += BQ.yazi(eqX + 24, cy + 11, s.sag, { boy: 32, kalin: 900, anchor: "start" });
    });
    return BQ.svg(W, H, g, "Şekilli işlemler");
  }
  function kodFig(d, cevap) {
    var n = d.anahtar.length, CW = 58, pad = 18;
    var kW = n * CW, dz = d.dizi, sW = dz.reduce(function (s, a) { return s + a.length * 52; }, 0) + (dz.length > 1 ? 40 : 0) + 40 + 110;
    var W = Math.max(330, kW + 2 * pad + 24, sW + 2 * pad), H = 2 * pad + 30 + 104 + 18 + 76;
    var g = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    g += BQ.yazi(W / 2, pad + 18, "ANAHTAR", { boy: 16, kalin: 900, renk: "#5b6b8c" });
    var x0 = (W - kW) / 2, y0 = pad + 30;
    g += '<rect x="' + x0 + '" y="' + y0 + '" width="' + kW + '" height="104" rx="14" fill="#fff" stroke="#cbd4e6" stroke-width="2.2"/>';
    g += '<line x1="' + x0 + '" y1="' + (y0 + 56) + '" x2="' + (x0 + kW) + '" y2="' + (y0 + 56) + '" stroke="#cbd4e6" stroke-width="2"/>';
    d.anahtar.forEach(function (p, i) {
      var cx = x0 + (i + 0.5) * CW, s = d.sekiller[p[0]];
      if (i) g += '<line x1="' + (x0 + i * CW) + '" y1="' + y0 + '" x2="' + (x0 + i * CW) + '" y2="' + (y0 + 104) + '" stroke="#e1e7f2" stroke-width="2"/>';
      g += BQ.sekil(s[0], cx, y0 + 28 + (s[0] === "üçgen" ? 3 : 0), 17, s[1], 0, { sw: 2 });
      g += BQ.yazi(cx, y0 + 92, String(p[1]), { boy: 28, kalin: 900 });
    });
    var y1 = y0 + 104 + 18, x = (W - sW) / 2 + 20;
    g += '<rect x="' + (x - 14) + '" y="' + y1 + '" width="' + (sW - 12) + '" height="64" rx="14" fill="' + BQ.SORU + '" stroke="#f0d27a" stroke-width="2"/>';
    dz.forEach(function (a, k) {
      if (k) { g += BQ.yazi(x + 20, y1 + 43, "+", { boy: 32, kalin: 900, renk: "#5b6b8c" }); x += 40; }
      a.forEach(function (id) { var s = d.sekiller[id]; g += BQ.sekil(s[0], x + 26, y1 + 32 + (s[0] === "üçgen" ? 3 : 0), 18, s[1], 0, { sw: 2 }); x += 52; });
    });
    g += BQ.yazi(x + 20, y1 + 43, "=", { boy: 32, kalin: 900, renk: "#5b6b8c" });
    x += 40;
    if (cevap === undefined) g += BQ.kutu(x + 4, y1 + 11, 42, "", { soru: true });
    else g += BQ.yazi(x + 4, y1 + 44, String(cevap), { boy: 32, kalin: 900, renk: "#1fa866", anchor: "start" });
    return BQ.svg(W, H, g, "Şekil anahtarı ve şifreli sayı");
  }

  // ---------------------------------------------------------------- yardımcılar
  function sekilSec(rnd, n) {
    var a = rnd.sample(HAVUZ, n), r = rnd.sample(RENKLER, n), sk = {};
    "ABCDEF".slice(0, n).split("").forEach(function (id, i) { sk[id] = [a[i], r[i]]; });
    return sk;
  }
  function metin(tok, sk, v) {
    return tok.map(function (x) { return typeof x === "number" ? String(x) : x in OPS ? OPS[x] : v && x in v ? String(v[x]) : sk[x][0]; }).join(" ");
  }
  function sikla(rnd, ans, celd) {
    celd = celd.filter(function (x) { return x >= 0 && x !== ans; }).map(String);
    return BQ.siklar(rnd, String(ans), celd);
  }

  // ---------------------------------------------------------------- (a) denklemler
  function genDenk(rnd, sv) {
    var nU = sv, sk = sekilSec(rnd, nU), ids = Object.keys(sk), v = {};
    ids.forEach(function (id) { v[id] = rnd.int(sv === 3 ? 2 : 1, 9); });
    var A = "A", B = "B", C = "C", denk = [], kal;
    function e(tok) { var s = deger(tok, v); return { sol: tok, sag: s }; }
    var f1 = sv === 1 ? [[A, "+", A], [A, "+", A, "+", A], [A, "+", rnd.int(1, 6)]] :
      sv === 2 ? [[A, "+", A], [A, "+", A, "+", A]] : [[A, "*", A], [A, "+", A, "+", A], [A, "*", 3]];
    denk.push(e(rnd.pick(f1)));
    if (sv >= 2) {
      var f2 = sv === 2 ? [[A, "+", B], [B, "-", A], [B, "+", B, "+", A], [A, "+", B, "+", B]] : [[B, "-", A], [A, "*", B], [B, "+", B, "-", A], [A, "*", 2, "+", B]];
      denk.push(e(rnd.pick(f2)));
    }
    if (sv === 3) denk.push(e(rnd.pick([[C, "-", B], [B, "+", C, "+", A], [C, "+", C, "-", B], [C, "*", A, "-", B], [C, "-", A, "+", B]])));
    if (denk.some(function (x) { return x.sag < 1 || x.sag > 81; })) return null;
    var hedef = sv === 1 ? [A] : sv === 2 ? rnd.pick([[B], [B], [A, "+", B]]) : rnd.pick([[C], [C, "+", A], [B, "*", C], [C, "+", B, "-", A]]);
    var ans = deger(hedef, v);
    if (ans < 1 || ans > 81) return null;
    var d = { tip: "denk", sekiller: sk, denk: denk, hedef: hedef };
    var cz = cozumler(d);
    if (cz.length !== 1) return null;
    kal = ids.map(function (id) { return v[id]; });
    var s = sikla(rnd, ans, kal.concat(rnd.shuffle([ans + 1, ans - 1, ans + 2, ans - 2])));
    if (!s) return null;
    d.siklar = s.liste;
    // açıklama: satır satır, her satırda tek yeni bilinmeyen
    var bil = {}, adim = ["Her şekil 1 ile 9 arasında bir sayının yerini tutuyor. Aynı şekil her yerde aynı sayıdır. İçinde tek bilinmeyen olan satırdan başla."];
    denk.forEach(function (x, i) {
      var yeni = ids.filter(function (id) { return x.sol.indexOf(id) >= 0 && !(id in bil); })[0];
      var ara = Object.keys(bil).length && x.sol.some(function (t) { return t in bil; }) ? " Bildiklerini yerine koy: " + metin(x.sol, sk, bil) + " = " + x.sag + "." : "";
      bil[yeni] = v[yeni];
      adim.push((i + 1) + ". satır: " + metin(x.sol, sk) + " = " + x.sag + "." + ara + " Buradan <b>" + sk[yeni][0] + " = " + v[yeni] + "</b> (kontrol: " + metin(x.sol, sk, v) + " = " + x.sag + ").");
    });
    adim.push("Son satır: " + metin(hedef, sk) + " = " + metin(hedef, sk, v) + " = <b>" + ans + "</b>." + (hedef.length === 1 ? "" : " (İşlemde önce çarpma, sonra toplama ve çıkarma yapılır.)"));
    adim.push("Doğru cevap <b>" + BQ.HARF[s.dogru] + "</b>.");
    return { soru: "Her şekil bir sayıdır. Soru işaretinin yerine hangi sayı gelmeli?", fig: denkFig(d), cozumFig: denkFig(d, ans), tur: "metin", sec: s.liste, dogru: s.dogru, data: d, adim: adim };
  }

  // ---------------------------------------------------------------- (b) kod tablosu
  function genKod(rnd, sv) {
    var n = sv === 1 ? 4 : sv === 2 ? 5 : 6, sk = sekilSec(rnd, n), ids = Object.keys(sk);
    var rak = rnd.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], n), anahtar = ids.map(function (id, i) { return [id, rak[i]]; });
    var a = {};
    anahtar.forEach(function (p) { a[p[0]] = p[1]; });
    var dizi = sv === 1 ? [rnd.sample(ids, 3)] : sv === 2 ? [[0, 1, 2, 3].map(function () { return rnd.pick(ids); })] : [rnd.sample(ids, 2), rnd.sample(ids, 2)];
    var sayi = dizi.map(function (dz) { return +dz.map(function (id) { return a[id]; }).join(""); });
    var ans = sv === 3 ? sayi[0] + sayi[1] : sayi[0];
    function ters(x) { return +String(x).split("").reverse().join(""); }
    var celd;
    if (sv < 3) {
      var st = String(ans), sw = st.length - 2 > 0 ? rnd.int(0, st.length - 2) : 0;
      var takas = st.slice(0, sw) + st[sw + 1] + st[sw] + st.slice(sw + 2);
      var kom = String(ans).split(""), j = rnd.int(0, kom.length - 1), yan = anahtar[(rak.indexOf(+kom[j]) + 1) % n][1];
      kom[j] = String(yan);
      celd = [ters(ans), +takas, +kom.join("")];
      celd = celd.concat([ans + 1, ans + 10, ans - 1]);
    } else celd = [ters(sayi[0]) + sayi[1], sayi[0] + ters(sayi[1]), ans + 10, ans - 10, ans + 1, ans - 1];
    var d = { tip: "kod", sekiller: sk, anahtar: anahtar, dizi: dizi, islem: sv === 3 ? "+" : null };
    var s = sikla(rnd, ans, celd.filter(function (x) { return String(x).length >= String(ans).length - (sv === 3 ? 1 : 0); }));
    if (!s) return null;
    d.siklar = s.liste;
    function oku(dz) { return dz.map(function (id) { return sk[id][0] + " → " + a[id]; }).join(", "); }
    var adim = ["Anahtarda her şeklin altında bir rakam yazıyor. Şekilleri <b>soldan sağa</b> sırayla rakama çevir."];
    if (sv < 3) {
      adim.push("Çevir: " + oku(dizi[0]) + ". Sayı: <b>" + ans + "</b>.");
      adim.push("Dikkat: sırayı sağdan sola okuyan " + ters(ans) + " der; iki şekli karıştıran yanlış sayı bulur.");
    } else {
      adim.push("Birinci sayı: " + oku(dizi[0]) + " → <b>" + sayi[0] + "</b>.");
      adim.push("İkinci sayı: " + oku(dizi[1]) + " → <b>" + sayi[1] + "</b>.");
      adim.push("Topla: " + sayi[0] + " + " + sayi[1] + " = <b>" + ans + "</b>.");
    }
    adim.push("Doğru cevap <b>" + BQ.HARF[s.dogru] + "</b>.");
    return {
      soru: sv === 3 ? "Anahtara göre şifreleri sayıya çevir ve topla. Sonuç kaç?" : "Anahtara göre şekiller hangi sayıyı gösteriyor?",
      fig: kodFig(d), cozumFig: kodFig(d, ans), tur: "metin", sec: s.liste, dogru: s.dogru, data: d, adim: adim
    };
  }

  BQ.reg("sifre", {
    ad: "Şifre",
    gen: function (rnd, sv) { return rnd.chance(0.6) ? genDenk(rnd, sv) : genKod(rnd, sv); },
    coz: function (q) {
      var d = q.data, ans;
      if (d.tip === "denk") {
        var l = cozumler(d);
        if (l.length !== 1) throw new Error("çözüm sayısı " + l.length);
        ans = deger(d.hedef, l[0]);
      } else ans = kodCoz(d);
      var es = d.siklar.map(function (s, i) { return +s === ans ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

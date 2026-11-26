/* Gölge — renkli şekil kompozisyonunun gölgesini (silüetini) bul.
   Ders: gölgede yalnızca renk kaybolur; şekil, büyüklük ve yer aynı kalır. */
(function (BQ) {
  "use strict";
  var f1 = BQ.f1, GOLGE = "#27306a", R = 64;
  var TURLER = ["daire", "kare", "dikdortgen", "ucgen", "baklava", "altigen", "yildiz", "yarim"];
  var TUR_AD = { daire: "daire", kare: "kare", dikdortgen: "dikdörtgen", ucgen: "üçgen", baklava: "baklava", altigen: "altıgen", yildiz: "yıldız", yarim: "yarım daire" };

  // ---------------------------------------------------------------- geometri (0..100 tuval)
  function yap(tur, x, y, s, rot) {  // s: boy (yaklaşık çap)
    if (tur === "daire") return { t: "daire", x: x, y: y, r: s / 2 };
    var p = [], i, a;
    if (tur === "kare") p = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [q[0] * s * 0.42, q[1] * s * 0.42]; });
    else if (tur === "dikdortgen") p = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [q[0] * s * 0.62, q[1] * s * 0.3]; });
    else if (tur === "ucgen") for (i = 0; i < 3; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / 3; p.push([s * 0.6 * Math.cos(a), s * 0.6 * Math.sin(a) + s * 0.12]); }
    else if (tur === "baklava") p = [[0, -s * 0.58], [s * 0.38, 0], [0, s * 0.58], [-s * 0.38, 0]];
    else if (tur === "altigen") for (i = 0; i < 6; i++) { a = i * Math.PI / 3; p.push([s * 0.5 * Math.cos(a), s * 0.5 * Math.sin(a)]); }
    else if (tur === "yildiz") for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; var rr = i % 2 ? s * 0.27 : s * 0.6; p.push([rr * Math.cos(a), rr * Math.sin(a)]); }
    else if (tur === "yarim") for (i = 0; i <= 16; i++) { a = Math.PI + i * Math.PI / 16; p.push([s * 0.6 * Math.cos(a), s * 0.6 * Math.sin(a) + s * 0.25]); }
    var c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
    return { t: "poly", p: p.map(function (q) { return [f1(x + q[0] * c - q[1] * sn), f1(y + q[0] * sn + q[1] * c)]; }) };
  }
  function kutuSinir(g) {
    if (g.t === "daire") return [g.x - g.r, g.y - g.r, g.x + g.r, g.y + g.r];
    var xs = g.p.map(function (q) { return q[0]; }), ys = g.p.map(function (q) { return q[1]; });
    return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
  }
  function icinde(g, x, y) {
    if (g.t === "daire") return (x - g.x) * (x - g.x) + (y - g.y) * (y - g.y) <= g.r * g.r;
    var ic = false, p = g.p;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) ic = !ic;
    }
    return ic;
  }
  function raster(geo) {  // 64×64 örnekleme, piksel merkezleri
    var b = new Uint8Array(R * R);
    geo.forEach(function (g) {
      var k = kutuSinir(g), i0 = Math.max(0, Math.floor(k[0] * R / 100) - 1), i1 = Math.min(R - 1, Math.ceil(k[2] * R / 100) + 1),
        j0 = Math.max(0, Math.floor(k[1] * R / 100) - 1), j1 = Math.min(R - 1, Math.ceil(k[3] * R / 100) + 1);
      for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) if (icinde(g, (i + 0.5) * 100 / R, (j + 0.5) * 100 / R)) b[j * R + i] = 1;
    });
    return b;
  }
  function say(b) { var n = 0; for (var i = 0; i < b.length; i++) n += b[i]; return n; }
  function fark(a, b) { var n = 0; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; }
  function kesisim(a, b) { var n = 0; for (var i = 0; i < a.length; i++) if (a[i] && b[i]) n++; return n; }

  function parcaGeo(p) { return yap(p.tur, p.x, p.y, p.s, p.rot); }
  function geoListe(parcalar) { return parcalar.map(parcaGeo); }
  function aynala(p) { return Object.assign({}, p, { x: 100 - p.x, rot: -p.rot }); }

  // ---------------------------------------------------------------- çizim
  var Z = 1;  // soru başına ortak yakınlaştırma (resim ve şıklar aynı ölçekte)
  function zx(v) { return 50 + (v - 50) * Z; }
  function ciz(g, ox, oy, k, dolgu, cizgi, sw) {
    var st = ' fill="' + dolgu + '" stroke="' + cizgi + '" stroke-width="' + sw + '" stroke-linejoin="round"';
    if (g.t === "daire") return '<circle cx="' + f1(ox + zx(g.x) * k) + '" cy="' + f1(oy + zx(g.y) * k) + '" r="' + f1(g.r * Z * k) + '"' + st + "/>";
    return '<polygon points="' + BQ.poly(g.p.map(function (q) { return [ox + zx(q[0]) * k, oy + zx(q[1]) * k]; })) + '"' + st + "/>";
  }
  function yakinlik(listeler) {
    var m = 1;
    listeler.forEach(function (l) { l.forEach(function (p) { var k = kutuSinir(parcaGeo(p)); m = Math.max(m, 50 - k[0], 50 - k[1], k[2] - 50, k[3] - 50); }); });
    return Math.min(1.6, 46 / m);
  }
  function renkli(parcalar, ox, oy, k, op) {
    return parcalar.map(function (p) { return op ? ciz(parcaGeo(p), ox, oy, k, "none", BQ.RENK[p.renk], 2.6) : ciz(parcaGeo(p), ox, oy, k, BQ.RENK[p.renk], BQ.CIZ, 2.2); }).join("");
  }
  function golge(parcalar, ox, oy, k) { return parcalar.map(function (p) { return ciz(parcaGeo(p), ox, oy, k, GOLGE, GOLGE, 1.4); }).join(""); }
  function fig(parcalar, cozum, etiket) {
    var W = 430, H = 214, B = 182, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    s += BQ.kutu(16, 16, B, "") + renkli(parcalar, 16 + 4, 16 + 4, (B - 8) / 100);
    // ışık ve ok
    var ax = 16 + B + 12, bx = W - 16 - 150 - 12, y = H / 2;
    s += '<line x1="' + ax + '" y1="' + y + '" x2="' + (bx - 8) + '" y2="' + y + '" stroke="#9aa7c0" stroke-width="3" stroke-linecap="round"/><polygon points="' + BQ.poly([[bx, y], [bx - 11, y - 7], [bx - 11, y + 7]]) + '" fill="#9aa7c0"/>';
    s += BQ.yazi((ax + bx) / 2, y - 12, "gölgesi", { boy: 13, renk: "#55617d" });
    var qx = W - 16 - 150, qy = (H - 150) / 2;
    if (cozum) s += BQ.kutu(qx, qy, 150, "", { vurgu: "#1fa866" }) + golge(parcalar, qx + 4, qy + 4, 1.42) + renkli(parcalar, qx + 4, qy + 4, 1.42, true);
    else s += BQ.kutu(qx, qy, 150, "", { soru: true });
    return BQ.svg(W, H, s, etiket);
  }
  function sikCiz(parcalar) { return BQ.tekKutu(golge(parcalar, 9, 9, 0.9), 100); }

  // ---------------------------------------------------------------- üretici
  var SEV = { 1: { n: 2, s: [36, 46], esik: 0.1 }, 2: { n: 3, s: [28, 38], esik: 0.08 }, 3: { n: 4, s: [24, 33], esik: 0.065 } };
  function gen(rnd, sv) {
    var S = SEV[sv], renk = rnd.sample(Object.keys(BQ.RENK).filter(function (r) { return r !== "turkuaz"; }), S.n), turler = rnd.sample(TURLER, S.n), parcalar = [];
    for (var i = 0; i < S.n; i++) {
      var ok = false;
      for (var den = 0; den < 30 && !ok; den++) {
        var s = rnd.int(S.s[0], S.s[1]), rot = turler[i] === "daire" ? 0 : rnd.pick([0, 0, 15, 30, 45, 90, 180, -20]), p;
        if (!i) p = { tur: turler[i], x: 50 + rnd.int(-6, 6), y: 50 + rnd.int(-6, 6), s: s + 6, rot: rot, renk: renk[i] };
        else {
          var A = rnd.pick(parcalar), a = rnd() * Math.PI * 2, d = (A.s + s) / 2 * (0.55 + rnd() * 0.25);
          p = { tur: turler[i], x: f1(A.x + d * Math.cos(a)), y: f1(A.y + d * Math.sin(a)), s: s, rot: rot, renk: renk[i] };
        }
        var k = kutuSinir(parcaGeo(p));
        if (k[0] >= 4 && k[1] >= 4 && k[2] <= 96 && k[3] <= 96) { parcalar.push(p); ok = true; }
      }
      if (!ok) return null;
    }
    // ortala
    var bb = [100, 100, 0, 0];
    parcalar.forEach(function (p) { var k = kutuSinir(parcaGeo(p)); bb = [Math.min(bb[0], k[0]), Math.min(bb[1], k[1]), Math.max(bb[2], k[2]), Math.max(bb[3], k[3])]; });
    var dx = 50 - (bb[0] + bb[2]) / 2, dy = 50 - (bb[1] + bb[3]) / 2;
    parcalar.forEach(function (p) { p.x = f1(p.x + dx); p.y = f1(p.y + dy); });
    var tum = raster(geoListe(parcalar)), alan = say(tum), esik = Math.max(S.n > 2 ? 55 : 70, Math.round(alan * S.esik));
    // her parça gölgeye gözle görülür katkı yapmalı ve diğerlerine değmeli
    for (i = 0; i < S.n; i++) {
      var digerleri = parcalar.filter(function (x, j) { return j !== i; });
      var bu = raster([parcaGeo(parcalar[i])]), dig = raster(geoListe(digerleri));
      if (alan - say(dig) < esik) return null;
      if (kesisim(bu, dig) < 4) return null;
    }
    // çeldiriciler
    var adaylar = [], tipler = sv === 1 ? ["eksik", "farkli", "ayna", "yer"] : sv === 2 ? rnd.shuffle(["eksik", "farkli", "yer", "ayna"]) : rnd.shuffle(["boy", "yer", "farkli", "ayna"]).concat(["eksik"]);
    var secilen = [];
    function uygun(l) {
      var r = raster(geoListe(l));
      if (fark(r, tum) < esik) return false;
      for (var t = 0; t < secilen.length; t++) if (fark(r, secilen[t].r) < esik) return false;
      return r;
    }
    tipler.forEach(function (tip) {
      if (secilen.length >= 3) return;
      for (var den = 0; den < 12; den++) {
        var j = rnd.int(0, S.n - 1), l = parcalar.map(function (p) { return Object.assign({}, p); }), not = { tip: tip, p: parcalar[j] };
        if (tip === "eksik") l.splice(j, 1);
        else if (tip === "farkli") { var yt = rnd.pick(TURLER.filter(function (t) { return t !== l[j].tur; })); not.yeni = yt; l[j].tur = yt; if (yt === "daire") l[j].rot = 0; }
        else if (tip === "boy") { var kat = rnd.pick([0.6, 1.45]); not.buyuk = kat > 1; l[j].s = f1(l[j].s * kat); }
        else if (tip === "yer") {
          var A2 = rnd.pick(parcalar.filter(function (x, q) { return q !== j; })), a2 = rnd() * Math.PI * 2, d2 = (A2.s + l[j].s) / 2 * 0.7;
          l[j].x = f1(A2.x + d2 * Math.cos(a2)); l[j].y = f1(A2.y + d2 * Math.sin(a2));
          var dig2 = raster(geoListe(l.filter(function (x, q) { return q !== j; })));
          if (kesisim(raster([parcaGeo(l[j])]), dig2) < 4) continue;
        } else if (tip === "ayna") l = l.map(aynala);
        if (l.some(function (p) { var k = kutuSinir(parcaGeo(p)); return k[0] < 2 || k[1] < 2 || k[2] > 98 || k[3] > 98; })) continue;
        var r = uygun(l);
        if (!r) continue;
        secilen.push({ l: l, r: r, not: not });
        break;
      }
    });
    if (secilen.length < 3) return null;
    var dogru = { l: parcalar, not: { tip: "dogru" } };
    var sk = BQ.siklar(rnd, dogru, secilen, function (x) { return JSON.stringify(x.l); });
    if (!sk) return null;
    Z = yakinlik([parcalar].concat(secilen.map(function (x) { return x.l; })));
    var q = {
      soru: "Bu şekillerin gölgesi hangisi?",
      fig: fig(parcalar, false, S.n + " renkli şekilden oluşan bir resim ve gölgesi için soru işaretli kutu"),
      tur: "svg",
      sec: sk.liste.map(function (x) { return sikCiz(x.l); }),
      dogru: sk.dogru,
      data: { parcalar: parcalar, siklar: sk.liste.map(function (x) { return x.l; }) },
      cozumFig: fig(parcalar, true, "Resim ve gölgesi üst üste")
    };
    q.adim = aciklama(parcalar, sk.liste, sk.dogru);
    return q;
  }
  function pAd(p) { return p.renk + " " + TUR_AD[p.tur]; }
  function aciklama(parcalar, sik, dg) {
    var a = [];
    a.push("Gölgede <b>yalnızca renk kaybolur</b>; şekil, büyüklük ve yer aynı kalır.");
    a.push("Resimdeki parçalar: " + parcalar.map(function (p) { return "<b>" + pAd(p) + "</b>"; }).join(", ") + ". Doğru gölgede bu " + parcalar.length + " parça aynı yerde ve aynı boyda olmalı.");
    a.push("İpucu: en dikkat çekici parçayı (sivri uçlar, köşeler) gölgede ara, sonra komşularına bak.");
    var el = [];
    sik.forEach(function (x, i) {
      if (i === dg) return;
      var n = x.not, t = n.tip === "eksik" ? pAd(n.p) + " eksik" : n.tip === "farkli" ? pAd(n.p) + " yerine " + TUR_AD[n.yeni] + " var" : n.tip === "boy" ? pAd(n.p) + " daha " + (n.buyuk ? "büyük" : "küçük")
        : n.tip === "yer" ? pAd(n.p) + " yer değiştirmiş" : "resim aynalanmış, sağ ile sol yer değiştirmiş";
      el.push(BQ.HARF[i] + ": " + t);
    });
    a.push("Yanlış şıklar: " + el.join("; ") + ".");
    a.push("Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  BQ.reg("golge", {
    ad: "Gölge",
    gen: gen,
    coz: function (q) {
      // resmi ve her şıkkı 64×64 örnekle; tam bir şık eşleşmeli, diğerleri gözle görülür farklı olmalı
      var hedef = raster(geoListe(q.data.parcalar)), alan = say(hedef);
      var f = q.data.siklar.map(function (l, i) { return { i: i, d: fark(raster(geoListe(l)), hedef) }; }).sort(function (a, b) { return a.d - b.d; });
      if (f[0].d > 2) throw new Error("eşleşen gölge yok");
      if (f[1].d < Math.max(40, alan * 0.05)) throw new Error("çeldirici çok benzer " + f[1].d);
      return f[0].i;
    }
  });
})(window.BQ);

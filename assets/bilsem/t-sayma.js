/* Şekil sayma — "Şekilde kaç üçgen / kare / dikdörtgen var?"
   Çizim doğru parçalarından oluşur; çözücü tüm nokta üçlülerini / dörtlülerini kaba kuvvetle dener. */
(function (BQ) {
  "use strict";
  var E = 1e-6;
  var DOLGU = ["#e3f0ff", "#e6f8ef", "#fff3d6", "#f1e9ff", "#ffe8ef", "#e2f7f9"];

  // ---------------------------------------------------------------- geometri (kaba kuvvet)
  function kes(s, t) {
    var x1 = s[0], y1 = s[1], x2 = s[2], y2 = s[3], x3 = t[0], y3 = t[1], x4 = t[2], y4 = t[3];
    var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(d) < E) return null;
    var a = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d, b = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;
    if (a < -E || a > 1 + E || b < -E || b > 1 + E) return null;
    return [x1 + a * (x2 - x1), y1 + a * (y2 - y1)];
  }
  function ustunde(p, s) {
    var dx = s[2] - s[0], dy = s[3] - s[1], L = Math.hypot(dx, dy);
    if (Math.abs((p[0] - s[0]) * dy - (p[1] - s[1]) * dx) / L > 1e-4) return false;
    var t = ((p[0] - s[0]) * dx + (p[1] - s[1]) * dy) / (L * L);
    return t > -1e-6 && t < 1 + 1e-6;
  }
  function noktalar(seg) {
    var l = [], gor = {};
    function ek(p) { var k = Math.round(p[0] * 1000) + "," + Math.round(p[1] * 1000); if (!gor[k]) { gor[k] = 1; l.push(p); } }
    seg.forEach(function (s) { ek([s[0], s[1]]); ek([s[2], s[3]]); });
    for (var i = 0; i < seg.length; i++) for (var j = i + 1; j < seg.length; j++) { var p = kes(seg[i], seg[j]); if (p) ek(p); }
    return l;
  }
  function analiz(seg) {
    var P = noktalar(seg), n = P.length, bag = [];
    for (var i = 0; i < n; i++) { bag.push([]); for (var j = 0; j < n; j++) bag[i].push(i !== j && seg.some(function (s) { return ustunde(P[i], s) && ustunde(P[j], s); })); }
    var uc = [], dort = [];
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) if (bag[i][j]) for (var k = j + 1; k < n; k++) if (bag[i][k] && bag[j][k]) {
      var A = (P[j][0] - P[i][0]) * (P[k][1] - P[i][1]) - (P[j][1] - P[i][1]) * (P[k][0] - P[i][0]);
      if (Math.abs(A) > 1e-3) uc.push([P[i], P[j], P[k]]);
    }
    function dik(a, b, c) { var ux = a[0] - b[0], uy = a[1] - b[1], vx = c[0] - b[0], vy = c[1] - b[1]; return Math.abs(ux * vx + uy * vy) < 1e-3 * (Math.hypot(ux, uy) * Math.hypot(vx, vy)); }
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) for (k = j + 1; k < n; k++) for (var m = k + 1; m < n; m++) {
      [[i, j, k, m], [i, j, m, k], [i, k, j, m]].forEach(function (o) {
        var q = o.map(function (x) { return P[x]; });
        for (var t = 0; t < 4; t++) if (!bag[o[t]][o[(t + 1) % 4]]) return;
        for (t = 0; t < 4; t++) if (!dik(q[(t + 3) % 4], q[t], q[(t + 1) % 4])) return;
        var a = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), b = Math.hypot(q[2][0] - q[1][0], q[2][1] - q[1][1]);
        dort.push({ p: q, kare: Math.abs(a - b) < 1e-3 * Math.max(a, b) });
      });
    }
    return { uc: uc, kare: dort.filter(function (d) { return d.kare; }), dik: dort };
  }
  function say(seg, tur) {
    var a = analiz(seg);
    if (tur === "üçgen") return a.uc.length;
    if (tur === "kare") return a.kare.length;
    if (a.kare.length) throw new Error("dikdörtgen sorusunda kare var: belirsiz");
    return a.dik.length;
  }
  function icinde(pt, sh) {
    if (sh.length === 3) {
      var s = 0;
      for (var i = 0; i < 3; i++) { var a = sh[i], b = sh[(i + 1) % 3], c = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]); if (Math.abs(c) < 1e-6) return false; s += c > 0 ? 1 : -1; }
      return Math.abs(s) === 3;
    }
    var xs = sh.map(function (p) { return p[0]; }), ys = sh.map(function (p) { return p[1]; });
    return pt[0] > Math.min.apply(0, xs) && pt[0] < Math.max.apply(0, xs) && pt[1] > Math.min.apply(0, ys) && pt[1] < Math.max.apply(0, ys);
  }

  // ---------------------------------------------------------------- figür kurucular (seg, en küçük parça merkezleri)
  function izgara(nr, nc, cw, ch) {
    var seg = [], mer = [], i, j;
    for (i = 0; i <= nr; i++) seg.push([0, i * ch, nc * cw, i * ch]);
    for (j = 0; j <= nc; j++) seg.push([j * cw, 0, j * cw, nr * ch]);
    for (i = 0; i < nr; i++) for (j = 0; j < nc; j++) mer.push([(j + 0.5) * cw, (i + 0.5) * ch]);
    return { seg: seg, mer: mer, dis: [[0, 0], [nc * cw, 0], [nc * cw, nr * ch], [0, nr * ch]] };
  }
  // tepe noktasından tabana k iç çizgi (yelpaze), istenirse yatay çizgiler (oranlar yk)
  function yelpaze(rnd, k, yk) {
    var W = 300, H = 230, ax = rnd.int(110, 190), A = [ax, 0], L = [0, H], R = [W, H];
    var tab = [0, W], i;
    for (var t = 0; t < 50 && tab.length < k + 2; t++) {
      var x = rnd.int(4, 26) * 10 + rnd.int(-2, 2);
      if (tab.every(function (v) { return Math.abs(v - x) >= 46; })) tab.push(x);
    }
    if (tab.length < k + 2) return null;
    tab.sort(function (a, b) { return a - b; });
    var seg = [[A[0], A[1], L[0], L[1]], [A[0], A[1], R[0], R[1]], [L[0], L[1], R[0], R[1]]];
    for (i = 1; i < tab.length - 1; i++) seg.push([A[0], A[1], tab[i], H]);
    var kat = [0].concat(yk || []).concat([1]), mer = [];
    (yk || []).forEach(function (f) { var y = H * f; seg.push([ax - ax * f, y, ax + (W - ax) * f, y]); });
    for (var a = 0; a < kat.length - 1; a++) for (i = 0; i < tab.length - 1; i++) {
      var f = a === 0 ? kat[1] * (kat.length === 2 ? 0.74 : 0.7) : (kat[a] + kat[a + 1]) / 2, xm = ax + (((tab[i] + tab[i + 1]) / 2) - ax) * f;
      mer.push([xm, H * f]);
    }
    return { seg: seg, mer: mer, dis: [A, R, L] };
  }
  function capraz(w) { // iki köşegenli kare
    var seg = [[0, 0, w, 0], [w, 0, w, w], [w, w, 0, w], [0, w, 0, 0], [0, 0, w, w], [w, 0, 0, w]];
    return { seg: seg, mer: [[w / 2, w * 0.2], [w * 0.8, w / 2], [w / 2, w * 0.8], [w * 0.2, w / 2]], dis: [[0, 0], [w, 0], [w, w], [0, w]] };
  }
  function donustur(f, rnd, izin) {
    var ay = izin && rnd.chance(0.5), dy = izin === 2 && rnd.chance(0.3);
    var xs = [], ys = [];
    f.seg.forEach(function (s) { xs.push(s[0], s[2]); ys.push(s[1], s[3]); });
    var mx = Math.max.apply(0, xs), my = Math.max.apply(0, ys);
    function T(p) { return [ay ? mx - p[0] : p[0], dy ? my - p[1] : p[1]]; }
    return {
      seg: f.seg.map(function (s) { var a = T([s[0], s[1]]), b = T([s[2], s[3]]); return [a[0], a[1], b[0], b[1]]; }),
      mer: f.mer.map(T), dis: f.dis.map(T)
    };
  }

  // ---------------------------------------------------------------- seviye şablonları
  function sablon(rnd, sv) {
    var r = rnd.int(0, 3);
    var dk = function (nr, nc) { var cw = rnd.pick([88, 96, 104]), ch = Math.round(cw / rnd.pick([1.7, 1.8, 1.9])); return { f: izgara(nr, nc, cw, ch), tur: "dikdörtgen" }; };
    if (sv === 1) {
      if (r === 0) return { f: izgara(2, 2, 90, 90), tur: "kare" };
      if (r === 1) return { f: yelpaze(rnd, 1), tur: "üçgen", izin: 2 };
      if (r === 2) return dk(1, rnd.pick([2, 3]));
      return { f: yelpaze(rnd, 1), tur: "üçgen", izin: 2 };
    }
    if (sv === 2) {
      if (r === 0) return { f: izgara(3, 3, 74, 74), tur: "kare" };
      if (r === 1) return { f: yelpaze(rnd, rnd.pick([2, 3])), tur: "üçgen", izin: 2 };
      if (r === 2) return rnd.chance(0.5) ? dk(2, 2) : dk(1, 4);
      return { f: capraz(rnd.pick([200, 210, 220])), tur: "üçgen" };
    }
    if (r === 0) return { f: yelpaze(rnd, rnd.pick([1, 2, 3]), [rnd.pick([0.45, 0.5, 0.55])]), tur: "üçgen", izin: 2 };
    if (r === 1) return rnd.chance(0.5) ? dk(2, 3) : dk(3, 2);
    if (r === 2) return rnd.chance(0.5) ? { f: izgara(2, 3, 70, 70), tur: "kare" } : { f: izgara(3, 4, 60, 60), tur: "kare" };
    return { f: yelpaze(rnd, rnd.pick([1, 2]), [0.4, 0.7].map(function (v) { return v + rnd.int(-1, 1) * 0.03; })), tur: "üçgen", izin: 2 };
  }

  // ---------------------------------------------------------------- çizim
  function cizim(f, o) {
    o = o || {};
    var xs = [], ys = [];
    f.seg.forEach(function (s) { xs.push(s[0], s[2]); ys.push(s[1], s[3]); });
    var mx = Math.max.apply(0, xs), my = Math.max.apply(0, ys);
    var hedef = o.boy || 260, sc = Math.min(hedef / mx, hedef / my, 1.6), pad = 26;
    var W = Math.max(o.minW || 300, mx * sc + 2 * pad), H = my * sc + 2 * pad;
    var ox = (W - mx * sc) / 2, oy = pad;
    function T(p) { return [ox + p[0] * sc, oy + p[1] * sc]; }
    var g = '<rect width="' + BQ.f1(W) + '" height="' + BQ.f1(H) + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    g += '<polygon points="' + BQ.poly(f.dis.map(T)) + '" fill="' + (o.dolgu || "#fff") + '"/>';
    f.seg.forEach(function (s) {
      var a = T([s[0], s[1]]), b = T([s[2], s[3]]);
      g += '<line x1="' + BQ.f1(a[0]) + '" y1="' + BQ.f1(a[1]) + '" x2="' + BQ.f1(b[0]) + '" y2="' + BQ.f1(b[1]) + '" stroke="' + BQ.CIZ + '" stroke-width="3.2" stroke-linecap="round"/>';
    });
    if (o.numara) {
      var lp = f.mer.map(T), sik = lp.some(function (p, i) { return lp.some(function (r, j) { return j > i && Math.hypot(p[0] - r[0], p[1] - r[1]) < 24; }); });
      if (!sik) lp.forEach(function (q, i) { g += BQ.yazi(q[0], q[1] + 6, String(i + 1), { boy: 17, kalin: 900, renk: "#3d7ff2" }); });
    }
    return { g: g, W: W, H: H };
  }

  function gen(rnd, sv) {
    var sb = sablon(rnd, sv);
    if (!sb.f) return null;
    var f = donustur(sb.f, rnd, sb.izin), tur = sb.tur, a;
    try { a = analiz(f.seg); } catch (e) { return null; }
    var sekiller = tur === "üçgen" ? a.uc : tur === "kare" ? a.kare.map(function (d) { return d.p; }) : a.dik.map(function (d) { return d.p; });
    var N;
    try { N = say(f.seg, tur); } catch (e) { return null; }
    // gruplar: her şekil kaç küçük parçadan oluşuyor
    var grup = {};
    sekiller.forEach(function (sh) { var c = f.mer.filter(function (p) { return icinde(p, sh); }).length; grup[c] = (grup[c] || 0) + 1; });
    var gk = Object.keys(grup).map(Number).sort(function (x, y) { return x - y; });
    if (gk[0] !== 1) return null;
    var kucuk = grup[1];
    var celd = [kucuk].concat(rnd.shuffle([N + 1, N - 1, N + 2, N - 2])).filter(function (v) { return v > 0 && v !== N; }).map(String);
    var sk = BQ.siklar(rnd, String(N), celd);
    if (!sk) return null;
    var dolgu = rnd.pick(DOLGU), c1 = cizim(f, { dolgu: dolgu });
    // çözüm figürü: numaralı parçalar + grup tablosu
    var c2 = cizim(f, { dolgu: dolgu, numara: true, boy: 220, minW: 240 }), satir = gk.map(function (k) { return [k === 1 ? "1 parçalı" : k + " parçalı", grup[k]]; });
    var tw = 190, th = Math.max(c2.H, 34 * (satir.length + 1) + 24), cg = c2.g;
    cg = '<rect width="' + BQ.f1(c2.W + tw) + '" height="' + BQ.f1(th) + '" rx="18" fill="' + BQ.ZEMIN + '"/>' + cg;
    var y0 = (th - 34 * (satir.length + 1)) / 2 + 24;
    satir.forEach(function (s, i) {
      cg += BQ.yazi(c2.W + 10, y0 + i * 34, s[0] + ":", { anchor: "start", boy: 20, kalin: 800 }) + BQ.yazi(c2.W + tw - 22, y0 + i * 34, String(s[1]), { anchor: "end", boy: 22, kalin: 900, renk: "#3d7ff2" });
    });
    cg += '<line x1="' + BQ.f1(c2.W + 10) + '" y1="' + BQ.f1(y0 + (satir.length - 1) * 34 + 12) + '" x2="' + BQ.f1(c2.W + tw - 18) + '" y2="' + BQ.f1(y0 + (satir.length - 1) * 34 + 12) + '" stroke="' + BQ.CIZ + '" stroke-width="2"/>';
    cg += BQ.yazi(c2.W + 10, y0 + satir.length * 34 + 4, "Toplam:", { anchor: "start", boy: 21, kalin: 900 }) + BQ.yazi(c2.W + tw - 22, y0 + satir.length * 34 + 4, String(N), { anchor: "end", boy: 24, kalin: 900, renk: "#1fa866" });
    var q = {
      soru: "Şekilde kaç " + tur + " var?",
      fig: BQ.svg(c1.W, c1.H, c1.g, tur + " sayma şekli"),
      tur: "metin",
      sec: sk.liste,
      dogru: sk.dogru,
      data: { seg: f.seg, sekil: tur, siklar: sk.liste },
      cozumFig: BQ.svg(c2.W + tw, th, cg)
    };
    var buyukler = gk.filter(function (k) { return k > 1; });
    var adim = ["Yalnız en küçük parçaları sayma! Küçük parçalar birleşince yeni ve daha büyük " + (tur === "kare" ? "kareler" : tur === "üçgen" ? "üçgenler" : "dikdörtgenler") + " oluşur. Düzenli say: önce teker teker, sonra ikişer, üçer birleşenler.",
      "Tek parçalı (en küçük) " + tur + ": <b>" + kucuk + "</b> tane."];
    if (tur === "dikdörtgen") adim[0] += " (Bu şekildeki dikdörtgenlerin hiçbiri kare değil.)";
    if (buyukler.length) adim.push("Birleşerek oluşanlar: " + buyukler.map(function (k) { return k + " parçalı <b>" + grup[k] + "</b>"; }).join(", ") + ".");
    adim.push("Hepsini topla: " + gk.map(function (k) { return grup[k]; }).join(" + ") + " = <b>" + N + "</b>. Yalnız küçük parçaları sayan " + kucuk + " der; bu eksik olur.");
    adim.push("Doğru cevap <b>" + BQ.HARF[sk.dogru] + "</b>.");
    q.adim = adim;
    return q;
  }

  BQ.reg("sayma", {
    ad: "Şekil sayma",
    gen: gen,
    coz: function (q) {
      var N = say(q.data.seg, q.data.sekil);
      var es = q.data.siklar.map(function (s, i) { return +s === N ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

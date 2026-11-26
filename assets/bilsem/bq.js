/* Tamakala Games · BİLSEM hazırlık soru motoru (özgün, kodla üretilen sorular).
   BQ.reg(anahtar, {ad, gen(rnd, seviye) -> Soru, coz(Soru) -> doğru şık indeksi (bağımsız çözücü)})
   Soru = {seviye, soru: "metin", fig: "<svg>", sec: ["<svg>" | "metin"], tur: "svg"|"metin", dogru: i, adim: ["html"], data: {...},
           bellek?: {fig: "<svg>", sn: 6}}   // bellek: önce gösterilir, sonra gizlenir */
(function (G) {
  "use strict";
  var BQ = { T: {}, SIRA: [] };

  // ---------------------------------------------------------------- tohumlu rastgele
  BQ.rnd = function (seed) {
    var a = seed >>> 0;
    function f() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    f.int = function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.shuffle = function (arr) { var b = arr.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
    f.sample = function (arr, n) { return f.shuffle(arr).slice(0, n); };
    f.chance = function (p) { return f() < p; };
    return f;
  };

  // ---------------------------------------------------------------- renkler ve çizim
  BQ.RENK = { "kırmızı": "#ef4d56", "mavi": "#3d7ff2", "yeşil": "#1fa866", "sarı": "#f5b700", "mor": "#8b5cf6", "turuncu": "#f5821f", "pembe": "#ec5fa6", "turkuaz": "#16b6c8" };
  BQ.RENKLER = ["kırmızı", "mavi", "yeşil", "sarı", "mor"];
  BQ.CIZ = "#1d2742";
  BQ.ZEMIN = "#eef3fb";
  BQ.KUTU = "#ffffff";
  BQ.SORU = "#fff6d1";
  BQ.SEKILLER = ["daire", "kare", "üçgen", "yıldız", "baklava", "kalp", "altıgen"];
  BQ.SEKIL_AD = { daire: "daire", kare: "kare", "üçgen": "üçgen", "yıldız": "yıldız", baklava: "baklava", kalp: "kalp", "altıgen": "altıgen", ok: "ok", "beşgen": "beşgen", hilal: "hilal", "artı": "artı" };

  function f1(x) { return Math.round(x * 10) / 10; }
  BQ.f1 = f1;
  function poly(pts) { return pts.map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" "); }
  BQ.poly = poly;
  BQ.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };

  BQ.svg = function (w, h, ic, etiket) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + f1(w) + " " + f1(h) + '" role="img"' + (etiket ? ' aria-label="' + BQ.esc(etiket) + '"' : ' aria-hidden="true"') + ">" + ic + "</svg>";
  };

  /* Tek şekil. o: {bos: true (içi boş), sw: çizgi kalınlığı, dolgu: renk kodu (ham)} */
  BQ.sekil = function (ad, cx, cy, r, renk, rot, o) {
    o = o || {};
    var fill = o.bos ? "none" : (o.dolgu || BQ.RENK[renk] || renk);
    var sw = o.sw || Math.max(1.6, r * 0.09);
    var st = 'fill="' + fill + '" stroke="' + (o.cizgi || BQ.CIZ) + '" stroke-width="' + f1(sw) + '" stroke-linejoin="round"';
    var tr = rot ? ' transform="rotate(' + rot + " " + f1(cx) + " " + f1(cy) + ')"' : "";
    var i, pts = [], a;
    switch (ad) {
      case "daire": return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r * 0.9) + '" ' + st + "/>";
      case "kare": var s = r * 1.6; return '<rect x="' + f1(cx - s / 2) + '" y="' + f1(cy - s / 2) + '" width="' + f1(s) + '" height="' + f1(s) + '" rx="' + f1(r * 0.14) + '" ' + st + tr + "/>";
      case "üçgen": return '<polygon points="' + poly([[cx, cy - r], [cx + r * 0.97, cy + r * 0.74], [cx - r * 0.97, cy + r * 0.74]]) + '" ' + st + tr + "/>";
      case "baklava": return '<polygon points="' + poly([[cx, cy - r], [cx + r * 0.72, cy], [cx, cy + r], [cx - r * 0.72, cy]]) + '" ' + st + tr + "/>";
      case "yıldız":
        for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; var rr = i % 2 ? r * 0.46 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
        return '<polygon points="' + poly(pts) + '" ' + st + tr + "/>";
      case "altıgen":
        for (i = 0; i < 6; i++) { a = Math.PI / 6 + i * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
        return '<polygon points="' + poly(pts) + '" ' + st + tr + "/>";
      case "beşgen":
        for (i = 0; i < 5; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / 5; pts.push([cx + r * Math.cos(a), cy + r * 0.98 * Math.sin(a) + r * 0.08]); }
        return '<polygon points="' + poly(pts) + '" ' + st + tr + "/>";
      case "ok":
        var w = r * 0.38;
        return '<polygon points="' + poly([[cx, cy - r], [cx + r * 0.82, cy - r * 0.08], [cx + w, cy - r * 0.08], [cx + w, cy + r], [cx - w, cy + r], [cx - w, cy - r * 0.08], [cx - r * 0.82, cy - r * 0.08]]) + '" ' + st + tr + "/>";
      case "artı":
        var t = r * 0.36;
        return '<polygon points="' + poly([[cx - t, cy - r], [cx + t, cy - r], [cx + t, cy - t], [cx + r, cy - t], [cx + r, cy + t], [cx + t, cy + t], [cx + t, cy + r], [cx - t, cy + r], [cx - t, cy + t], [cx - r, cy + t], [cx - r, cy - t], [cx - t, cy - t]]) + '" ' + st + tr + "/>";
      case "hilal":
        return '<path d="M' + f1(cx + r * 0.35) + "," + f1(cy - r * 0.86) + " A" + f1(r * 0.92) + "," + f1(r * 0.92) + " 0 1 0 " + f1(cx + r * 0.35) + "," + f1(cy + r * 0.86) + " A" + f1(r * 0.7) + "," + f1(r * 0.7) + " 0 1 1 " + f1(cx + r * 0.35) + "," + f1(cy - r * 0.86) + 'Z" ' + st + tr + "/>";
      case "kalp":
        var k = r / 10;
        var d = "M" + f1(cx) + "," + f1(cy + 9 * k) + " C" + f1(cx - 12 * k) + "," + f1(cy + k) + " " + f1(cx - 11 * k) + "," + f1(cy - 9 * k) + " " + f1(cx - 5 * k) + "," + f1(cy - 9 * k) +
          " C" + f1(cx - 2 * k) + "," + f1(cy - 9 * k) + " " + f1(cx) + "," + f1(cy - 7 * k) + " " + f1(cx) + "," + f1(cy - 5 * k) + " C" + f1(cx) + "," + f1(cy - 7 * k) + " " + f1(cx + 2 * k) + "," + f1(cy - 9 * k) + " " + f1(cx + 5 * k) + "," + f1(cy - 9 * k) +
          " C" + f1(cx + 11 * k) + "," + f1(cy - 9 * k) + " " + f1(cx + 12 * k) + "," + f1(cy + k) + " " + f1(cx) + "," + f1(cy + 9 * k) + "Z";
        return '<path d="' + d + '" ' + st + tr + "/>";
    }
    throw new Error("şekil? " + ad);
  };

  // hücre içinde n şeklin yerleşimi
  BQ.YER = { 1: [[.5, .5]], 2: [[.3, .5], [.7, .5]], 3: [[.5, .28], [.27, .7], [.73, .7]], 4: [[.3, .3], [.7, .3], [.3, .7], [.7, .7]],
    5: [[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]], 6: [[.27, .3], [.5, .3], [.73, .3], [.27, .7], [.5, .7], [.73, .7]] };

  /* h: {sekil, renk, sayi, rot, boy, bos} */
  BQ.hucre = function (h, x, y, w) {
    var n = h.sayi || 1, out = "";
    var r = w * (n === 1 ? 0.3 : n === 2 ? 0.17 : n <= 4 ? 0.135 : 0.115) * (h.boy || 1);
    BQ.YER[n].forEach(function (p) { out += BQ.sekil(h.sekil, x + p[0] * w, y + p[1] * w, r, h.renk, h.rot || 0, { bos: h.bos }); });
    return out;
  };

  BQ.kutu = function (x, y, w, ic, o) {
    o = o || {};
    var s = '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(o.h || w) + '" rx="' + f1(w * 0.09) + '" fill="' + (o.soru ? BQ.SORU : o.zemin || BQ.KUTU) +
      '" stroke="' + (o.vurgu || "#cbd4e6") + '" stroke-width="' + (o.vurgu ? 4 : 2.2) + '"/>';
    if (o.soru) s += '<text x="' + f1(x + w / 2) + '" y="' + f1(y + (o.h || w) * 0.5 + w * 0.17) + '" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="' + f1(w * 0.48) + '" fill="#e2a000">?</text>';
    return s + (ic || "");
  };

  /* ızgara: satır dizisi, hücre null = soru kutusu. hf: hücre çizici (varsayılan BQ.hucre) */
  BQ.izgara = function (iz, o) {
    o = o || {};
    var n = iz.length, m = iz[0].length, hc = o.hucre || 104, ara = o.ara || 10, hf = o.hf || BQ.hucre;
    var W = m * hc + (m + 1) * ara, H = n * hc + (n + 1) * ara, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) {
      var x = ara + c * (hc + ara), y = ara + r * (hc + ara), v = o.vurgu && o.vurgu[r + "," + c];
      s += iz[r][c] === null ? BQ.kutu(x, y, hc, "", { soru: true, vurgu: v }) : BQ.kutu(x, y, hc, hf(iz[r][c], x, y, hc), { vurgu: v });
    }
    return BQ.svg(W, H, s, o.etiket);
  };

  /* Tek seçenek kutusu (şıklar için) */
  BQ.tekKutu = function (ic, w, h) {
    w = w || 100; h = h || w;
    return BQ.svg(w + 8, h + 8, '<rect x="4" y="4" width="' + w + '" height="' + h + '" rx="' + f1(w * 0.1) + '" fill="#fff"/>' + ic);
  };

  BQ.yazi = function (x, y, t, o) {
    o = o || {};
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-family="Nunito,Arial,sans-serif" font-weight="' + (o.kalin || 800) + '" font-size="' + (o.boy || 24) + '" fill="' + (o.renk || BQ.CIZ) + '">' + BQ.esc(t) + "</text>";
  };

  /* Şıkları karıştır: dogru + çeldiriciler (anahtar fonksiyonuyla eşsiz). Dönüş {liste, dogru} ya da null */
  BQ.siklar = function (rnd, dogru, celd, anahtar, n) {
    n = n || 4;
    var k = anahtar || function (x) { return JSON.stringify(x); };
    var gor = {}, l = [dogru];
    gor[k(dogru)] = 1;
    for (var i = 0; i < celd.length && l.length < n; i++) { var kk = k(celd[i]); if (!gor[kk]) { gor[kk] = 1; l.push(celd[i]); } }
    if (l.length < n) return null;
    var s = rnd.shuffle(l);
    return { liste: s, dogru: s.indexOf(dogru) };
  };

  BQ.HARF = "ABCDE";
  BQ.reg = function (key, t) { t.key = key; BQ.T[key] = t; if (BQ.SIRA.indexOf(key) < 0) BQ.SIRA.push(key); };

  /* Tek giriş noktası: soru üret (tohum + seviye). Hata olursa sonraki tohumu dener. */
  BQ.uret = function (key, seviye, tohum) {
    var t = BQ.T[key];
    for (var k = 0; k < 400; k++) {
      var rnd = BQ.rnd((tohum >>> 0) + k * 7919);
      var q = t.gen(rnd, seviye);
      if (q) { q.konu = key; q.seviye = seviye; q.tohum = tohum; return q; }
    }
    throw new Error("üretilemedi " + key + " " + seviye);
  };

  /* Test: n tohum × 3 seviye; bağımsız çözücü doğru şıkkı bulmalı, şıklar eşsiz olmalı */
  BQ.test = function (key, n) {
    var t = BQ.T[key], hata = [], say = 0;
    for (var sv = 1; sv <= 3; sv++) for (var i = 0; i < n; i++) {
      var q;
      try { q = BQ.uret(key, sv, i * 104729 + sv); } catch (e) { hata.push("uretim " + sv + "/" + i + ": " + e.message); continue; }
      say++;
      var c;
      try { c = t.coz(q); } catch (e) { hata.push("coz " + sv + "/" + i + ": " + e.message); continue; }
      if (c !== q.dogru) hata.push("cevap " + sv + "/" + i + ": uretici " + q.dogru + " cozucu " + c);
      var tek = {};
      q.sec.forEach(function (s) { tek[s] = 1; });
      if (Object.keys(tek).length !== q.sec.length) hata.push("ayni-sik " + sv + "/" + i);
      if (!q.adim || q.adim.length < 2) hata.push("aciklama " + sv + "/" + i);
      if (hata.length > 20) break;
    }
    return { konu: key, soru: say, hata: hata };
  };

  G.BQ = BQ;
})(typeof window !== "undefined" ? window : this);

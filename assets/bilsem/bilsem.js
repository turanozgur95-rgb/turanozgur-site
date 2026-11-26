/* Tamakala Games · BİLSEM hazırlık (c) 2026 — özgün soru üreticileri */
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

;/* Bellek — (a) görsel bellek: ızgaradaki şekiller birkaç saniye gösterilir, sonra "Bu kutuda hangi şekil vardı?" / "Hangi şekil yoktu?"
            (b) sayı dizisi: rakam kartları gösterilir, sonra doğru sıra (3. seviyede bazen tersten) sorulur. */
(function (BQ) {
  "use strict";
  function f1(x) { return Math.round(x * 10) / 10; }
  var SN = { 1: 6, 2: 5, 3: 4 };
  function key(h) { return h.sekil + "|" + h.renk; }
  function adi(h) { return h.renk + " " + h.sekil; }

  // ---------------------------------------------------------------- (a) görsel bellek
  function izgaraCiz(iz, o) {
    o = o || {};
    return BQ.izgara(iz.map(function (row) { return row.map(function (h) { return h || {}; }); }), {
      hucre: 86, ara: 10, vurgu: o.vurgu, etiket: o.etiket,
      hf: function (h, x, y, w) {
        if (o.bosalt) return "";
        return h.sekil ? BQ.sekil(h.sekil, x + w / 2, y + w / 2, w * 0.3, h.renk, 0) : "";
      }
    });
  }
  function soruIzgara(n, m, hedef, o) {
    // boş ızgara; hedef kutu soru işaretli
    o = o || {};
    var hc = 86, ara = 10, W = m * hc + (m + 1) * ara, H = n * hc + (n + 1) * ara;
    var s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) {
      var x = ara + c * (hc + ara), y = ara + r * (hc + ara);
      s += hedef && hedef[0] === r && hedef[1] === c ? BQ.kutu(x, y, hc, "", { soru: true, vurgu: "#f5b700" }) : BQ.kutu(x, y, hc, "", { zemin: "#f8fafe" });
    }
    return BQ.svg(W, H, s, o.etiket);
  }

  function genGorsel(rnd, sv) {
    var n = sv === 1 ? 2 : 3, m = 3, adet = sv === 1 ? rnd.int(3, 4) : sv === 2 ? rnd.int(4, 5) : rnd.int(5, 6);
    var sekiller = BQ.SEKILLER, renkler = BQ.RENKLER.concat(["turuncu"]), ogeler = [], gor = {};
    // 1. seviye: şekiller ve renkler hep farklı; 2-3. seviye: aynı şekil farklı renkte tekrar edebilir (dikkat ister)
    var sk = rnd.sample(sekiller, sv === 1 ? adet : Math.max(3, adet - (sv === 3 ? 2 : 1))), rk = rnd.sample(renkler, sv === 1 ? adet : Math.min(renkler.length, adet));
    for (var i = 0; i < adet; i++) {
      var h = { sekil: sk[i % sk.length], renk: rk[sv === 1 ? i : rnd.int(0, rk.length - 1)] };
      if (gor[key(h)]) return null;
      gor[key(h)] = 1; ogeler.push(h);
    }
    var hucreler = [];
    for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) hucreler.push([r, c]);
    var yer = rnd.sample(hucreler, adet), iz = [];
    for (r = 0; r < n; r++) { iz.push([]); for (c = 0; c < m; c++) iz[r].push(null); }
    yer.forEach(function (p, j) { iz[p[0]][p[1]] = ogeler[j]; });
    var tip = sv === 1 ? (rnd.chance(0.7) ? "yer" : "yok") : rnd.pick(["yer", "yok"]);
    var dogru, celd = [], hedef = null;
    if (tip === "yer") {
      hedef = rnd.pick(yer);
      dogru = iz[hedef[0]][hedef[1]];
      // çeldiriciler: ızgaradaki diğer şekiller (önce komşular), sonra aynı şekil başka renk
      var digerleri = yer.filter(function (p) { return p !== hedef; }).sort(function (a, b) {
        return (Math.abs(a[0] - hedef[0]) + Math.abs(a[1] - hedef[1])) - (Math.abs(b[0] - hedef[0]) + Math.abs(b[1] - hedef[1]));
      }).map(function (p) { return iz[p[0]][p[1]]; });
      var benzer = { sekil: dogru.sekil, renk: rnd.pick(renkler.filter(function (x) { return x !== dogru.renk; })) };
      if (sv > 1) celd.push(benzer);
      celd = celd.concat(sv === 1 ? rnd.shuffle(digerleri) : digerleri);
      if (sv === 1) celd.push(benzer);
    } else {
      // yoktu: üç şık ızgarada var, biri yok
      var yokAday = [];
      if (sv === 1) sekiller.forEach(function (s) { if (!ogeler.some(function (o) { return o.sekil === s; })) yokAday.push({ sekil: s, renk: rnd.pick(renkler) }); });
      else ogeler.forEach(function (o) {
        renkler.forEach(function (rr) { var y = { sekil: o.sekil, renk: rr }; if (!gor[key(y)]) yokAday.push(y); });
        if (sv === 3) sekiller.forEach(function (s) { var y = { sekil: s, renk: o.renk }; if (!gor[key(y)]) yokAday.push(y); });
      });
      if (!yokAday.length) return null;
      dogru = rnd.pick(yokAday);
      celd = rnd.shuffle(ogeler);
      // yakın olanları öne al: aynı şekil ya da aynı renk
      celd.sort(function (a, b) { return ((b.sekil === dogru.sekil) + (b.renk === dogru.renk)) - ((a.sekil === dogru.sekil) + (a.renk === dogru.renk)); });
    }
    var s = BQ.siklar(rnd, dogru, celd, key);
    if (!s) return null;
    var data = { alt: "gorsel", tip: tip, iz: iz, hedef: hedef, siklar: s.liste };
    var q = {
      soru: tip === "yer" ? "Sarı kutuda hangi şekil vardı?" : "Bu şekillerden hangisi ızgarada YOKTU?",
      bellek: { fig: izgaraCiz(iz, { etiket: "Şekilleri ve yerlerini aklında tut" }), sn: SN[sv] },
      fig: soruIzgara(n, m, hedef, { etiket: tip === "yer" ? "Boş ızgara, bir kutu sarı ve soru işaretli" : "Boş ızgara" }),
      tur: "svg",
      sec: s.liste.map(function (h) { return BQ.tekKutu(BQ.sekil(h.sekil, 54, 54, 32, h.renk, 0), 100); }),
      dogru: s.dogru,
      data: data
    };
    var vurgu = {};
    if (hedef) vurgu[hedef[0] + "," + hedef[1]] = "#1fa866";
    q.cozumFig = izgaraCiz(iz, { vurgu: vurgu });
    var a = ["Şekiller görününce her birinin <b>adını ve rengini</b> içinden söyle: \"" + ogeler.slice(0, 2).map(adi).join(", ") + "…\"."];
    if (tip === "yer") {
      var sat = ["üst", n === 3 ? "orta" : "alt", "alt"][hedef[0]], sut = ["sol", "orta", "sağ"][hedef[1]];
      a.push("Yerleri hatırlamak için ızgarayı sıra sıra tara ve kısa cümleler kur: \"üst sırada …, alt sırada …\".");
      a.push("Sarı kutu <b>" + sat + " sıranın " + sut + " kutusu</b>. Orada <b>" + adi(dogru) + "</b> vardı.");
      a.push("Diğer şıklar ya başka kutulardaki şekiller ya da rengi farklı bir şekil; yerine dikkat eden onları eler.");
    } else {
      a.push("Izgarada olanlar: " + ogeler.map(adi).join(", ") + ".");
      a.push(dogru.sekil.charAt(0).toLocaleUpperCase("tr") + dogru.sekil.slice(1) + (ogeler.some(function (o) { return o.sekil === dogru.sekil; }) ? " vardı ama <b>" + dogru.renk + "</b> değildi; şekli kadar rengini de hatırlamak gerekiyor." : " ızgarada hiç yoktu.") + " Yani <b>" + adi(dogru) + "</b> görünmedi.");
    }
    a.push("Doğru cevap <b>" + BQ.HARF[s.dogru] + "</b>.");
    q.adim = a;
    return q;
  }

  // ---------------------------------------------------------------- (b) sayı dizisi
  var KART_RENK = ["#3d7ff2", "#ef4d56", "#1fa866", "#8b5cf6", "#f5821f", "#16b6c8"];
  function kartlar(dizi, kapali, o) {
    o = o || {};
    var kw = 64, kh = 84, g = 12, n = dizi.length, W = n * kw + (n + 1) * g, H = kh + 2 * g;
    var s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    dizi.forEach(function (d, i) {
      var x = g + i * (kw + g), y = g;
      if (kapali) {
        s += '<rect x="' + x + '" y="' + y + '" width="' + kw + '" height="' + kh + '" rx="10" fill="#c9d6f2" stroke="#9fb2dd" stroke-width="2"/>';
        s += '<rect x="' + (x + 7) + '" y="' + (y + 7) + '" width="' + (kw - 14) + '" height="' + (kh - 14) + '" rx="7" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>';
        s += BQ.yazi(x + kw / 2, y + kh / 2 + 11, "?", { boy: 32, kalin: 900, renk: "#fff" });
      } else {
        var rk = KART_RENK[i % KART_RENK.length];
        s += '<rect x="' + x + '" y="' + y + '" width="' + kw + '" height="' + kh + '" rx="10" fill="#fff" stroke="' + rk + '" stroke-width="3"/>';
        s += '<rect x="' + x + '" y="' + y + '" width="' + kw + '" height="12" rx="6" fill="' + rk + '"/>';
        s += BQ.yazi(x + kw / 2, y + kh / 2 + 18, String(d), { boy: 46, kalin: 900, renk: BQ.CIZ });
      }
    });
    return BQ.svg(W, H, s, o.etiket);
  }
  function yaz(d) { return d.join(" "); }
  function genRakam(rnd, sv) {
    var n = sv === 1 ? rnd.int(3, 4) : sv === 2 ? rnd.int(4, 5) : rnd.int(5, 6);
    var dizi = rnd.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], n), ters = sv === 3 && rnd.chance(0.4);
    var hedefD = ters ? dizi.slice().reverse() : dizi.slice();
    var celd = [];
    var j = rnd.int(0, n - 2), sw = hedefD.slice(); var t = sw[j]; sw[j] = sw[j + 1]; sw[j + 1] = t;
    var k = rnd.int(0, n - 1), bir = hedefD.slice(); bir[k] = rnd.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return dizi.indexOf(x) < 0; }));
    var diger = ters ? dizi.slice() : dizi.slice().reverse();
    celd.push(diger, sw, bir);
    var s = BQ.siklar(rnd, yaz(hedefD), celd.map(yaz), String);
    if (!s) return null;
    var q = {
      soru: ters ? "Gördüğün sayıları TERSTEN (sondan başa doğru) hangisi doğru sıralar?" : "Gördüğün sayıları sırayla hangisi doğru gösteriyor?",
      bellek: { fig: kartlar(dizi, false, { etiket: "Rakam kartları: sırayı aklında tut" }), sn: SN[sv] },
      fig: kartlar(dizi, true, { etiket: n + " kapalı kart" }),
      tur: "metin",
      sec: s.liste,
      dogru: s.dogru,
      data: { alt: "rakam", dizi: dizi, ters: ters, siklar: s.liste },
      cozumFig: kartlar(dizi, false)
    };
    var parca = [], i;
    for (i = 0; i < n; i += (n === 4 || n === 6 ? 2 : 3)) parca.push(dizi.slice(i, i + (n === 4 || n === 6 ? 2 : 3)).join(""));
    if (n === 5) parca = [dizi.slice(0, 3).join(""), dizi.slice(3).join("")];
    var a = ["Kartları görünce sayıları <b>gruplara ayırıp</b> içinden tekrar et: " + parca.join(" – ") + ". Gruplar tek tek rakamlardan daha kolay akılda kalır."];
    a.push("Gösterilen sıra: <b>" + yaz(dizi) + "</b>.");
    if (ters) a.push("Tersten söylemek için sondan başla: son kart " + dizi[n - 1] + ", ilk kart " + dizi[0] + ". Ters sıra: <b>" + yaz(hedefD) + "</b>.");
    var el = [];
    s.liste.forEach(function (x, i2) {
      if (i2 === s.dogru) return;
      var neden = x === yaz(diger) ? (ters ? "düz sıra, tersten değil" : "tersten yazılmış") : x === yaz(sw) ? "iki sayının yeri değişmiş" : "bir sayı hiç gösterilmedi";
      el.push(BQ.HARF[i2] + " (" + neden + ")");
    });
    a.push("Şıkları eleyelim: " + el.join("; ") + ". Doğru cevap <b>" + BQ.HARF[s.dogru] + "</b>.");
    q.adim = a;
    return q;
  }

  BQ.reg("bellek", {
    ad: "Bellek",
    gen: function (rnd, sv) { return rnd.chance(0.55) ? genGorsel(rnd, sv) : genRakam(rnd, sv); },
    coz: function (q) {
      var d = q.data, es;
      if (d.alt === "rakam") {
        var h = (d.ters ? d.dizi.slice().reverse() : d.dizi).join(" ");
        es = d.siklar.map(function (x, i) { return x === h ? i : -1; }).filter(function (i) { return i >= 0; });
      } else if (d.tip === "yer") {
        var c = d.iz[d.hedef[0]][d.hedef[1]];
        if (!c) throw new Error("hedef kutu boş");
        es = d.siklar.map(function (x, i) { return key(x) === key(c) ? i : -1; }).filter(function (i) { return i >= 0; });
      } else {
        var var_ = {};
        d.iz.forEach(function (row) { row.forEach(function (x) { if (x) var_[key(x)] = 1; }); });
        es = d.siklar.map(function (x, i) { return var_[key(x)] ? -1 : i; }).filter(function (i) { return i >= 0; });
      }
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Döndürme — ızgara deseni çeyrek / yarım tur döner.
   Ders: yarım turda alt satır tersten okunup üste çıkar; çeyrek turda bir köşeyi takip et. */
(function (BQ) {
  "use strict";
  var f1 = BQ.f1;
  var KLR = [1, 0, 3, 2], KUD = [3, 2, 1, 0];
  var YONSUZ = { kare: 1, daire: 1 };
  var TUR_AD = { kare: "kare", daire: "daire", ucgen: "üçgen" };

  function kt(t, f) {
    if (!t) return null;
    var o = YONSUZ[t.t] ? 0 : t.o;
    if (!YONSUZ[t.t]) o = f === "lr" ? KLR[o] : f === "ud" ? KUD[o] : f === "cw" ? (o + 1) % 4 : f === "ccw" ? (o + 3) % 4 : o;
    return { t: t.t, o: o, r: t.r };
  }
  function gT(g, f) {
    var n = g.length, out = [];
    for (var r = 0; r < n; r++) {
      out.push([]);
      for (var c = 0; c < n; c++) {
        var s = f === "lr" ? g[r][n - 1 - c] : f === "ud" ? g[n - 1 - r][c] : f === "cw" ? g[n - 1 - c][r] : g[c][n - 1 - r];
        out[r].push(kt(s, f));
      }
    }
    return out;
  }
  function don(g, k) { k = ((k % 4) + 4) % 4; for (var i = 0; i < k; i++) g = gT(g, "cw"); return g; }  // k çeyrek tur saat yönünde
  function gk(g) { return g.map(function (row) { return row.map(function (t) { return t ? t.t + (YONSUZ[t.t] ? 0 : t.o) + t.r : "-"; }).join(","); }).join("/"); }
  function dortlu(g) {  // 8 görüntü: 4 dönüş + aynaları
    var l = [];
    for (var k = 0; k < 4; k++) { l.push(don(g, k)); l.push(gT(don(g, k), "lr")); }
    return l;
  }

  function karo(t, x, y, w) {
    if (!t) return "";
    var p = w * 0.12, o = t.o || 0;
    var st = ' fill="' + BQ.RENK[t.r] + '" stroke="' + BQ.CIZ + '" stroke-width="' + f1(Math.max(1.5, w * 0.055)) + '" stroke-linejoin="round"';
    var K = [[x + p, y + p], [x + w - p, y + p], [x + w - p, y + w - p], [x + p, y + w - p]];
    if (t.t === "kare") return '<rect x="' + f1(x + p) + '" y="' + f1(y + p) + '" width="' + f1(w - 2 * p) + '" height="' + f1(w - 2 * p) + '" rx="' + f1(w * 0.1) + '"' + st + "/>";
    if (t.t === "daire") return '<circle cx="' + f1(x + w / 2) + '" cy="' + f1(y + w / 2) + '" r="' + f1(w / 2 - p) + '"' + st + "/>";
    return '<polygon points="' + BQ.poly([K[o], K[(o + 1) % 4], K[(o + 3) % 4]]) + '"' + st + "/>";
  }
  function izgaraCiz(g, x, y, cs, iz) {
    var n = g.length, W = n * cs, s = "", i;
    s += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(W) + '" height="' + f1(W) + '" rx="6" fill="#fff"/>';
    for (i = 1; i < n; i++) s += '<line x1="' + f1(x + i * cs) + '" y1="' + f1(y) + '" x2="' + f1(x + i * cs) + '" y2="' + f1(y + W) + '" stroke="#dde4f0" stroke-width="1.5"/>' +
      '<line x1="' + f1(x) + '" y1="' + f1(y + i * cs) + '" x2="' + f1(x + W) + '" y2="' + f1(y + i * cs) + '" stroke="#dde4f0" stroke-width="1.5"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) s += karo(g[r][c], x + c * cs, y + r * cs, cs);
    if (iz) s += '<rect x="' + f1(x + iz[1] * cs + 1.5) + '" y="' + f1(y + iz[0] * cs + 1.5) + '" width="' + f1(cs - 3) + '" height="' + f1(cs - 3) + '" rx="5" fill="none" stroke="#1fa866" stroke-width="3.5"/>';
    return s + '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(W) + '" height="' + f1(W) + '" rx="6" fill="none" stroke="#9fb0cc" stroke-width="2"/>';
  }
  // dönüş simgesi: kavisli ok + içinde ¼ / ½, altında yön
  function donSimge(cx, cy, adim) {
    var R = 22, cw = adim.yon === "cw", renk = BQ.RENK.mavi, a0 = -100 * Math.PI / 180, sw = 290 * Math.PI / 180;
    var a1 = cw ? a0 + sw : a0 - sw;
    var P0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], P1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
    var t = cw ? [-Math.sin(a1), Math.cos(a1)] : [Math.sin(a1), -Math.cos(a1)], u = 9;
    var H = [[P1[0] + t[0] * 5, P1[1] + t[1] * 5], [P1[0] - t[0] * 4 + t[1] * u * 0.7, P1[1] - t[1] * 4 - t[0] * u * 0.7], [P1[0] - t[0] * 4 - t[1] * u * 0.7, P1[1] - t[1] * 4 + t[0] * u * 0.7]];
    var s = '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + (R + 12) + '" fill="#fff" stroke="#cbd4e6" stroke-width="2"/>';
    s += '<path d="M' + f1(P0[0]) + "," + f1(P0[1]) + " A" + R + "," + R + " 0 1 " + (cw ? 1 : 0) + " " + f1(P1[0]) + "," + f1(P1[1]) + '" fill="none" stroke="' + renk + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<polygon points="' + BQ.poly(H) + '" fill="' + renk + '" stroke="' + renk + '" stroke-width="1.5" stroke-linejoin="round"/>';
    s += BQ.yazi(cx, cy + 8, adim.k === 2 ? "½" : "¼", { boy: 22, kalin: 900 });
    s += BQ.yazi(cx, cy + R + 32, adim.k === 2 ? "yarım tur" : cw ? "saat yönü" : "ters yön", { boy: 13, renk: "#55617d" });
    return s;
  }
  function fig(g, adimlar, sonuc, izO, izS, etiket) {
    var n = g.length, cs = n === 3 ? 40 : 34, gw = n * cs, pad = 16, sw = 84, ara = 6;
    var W = pad + gw + ara + sw * adimlar.length + ara + gw + pad, H = Math.max(gw + 2 * pad, 150), y0 = (H - gw) / 2;
    var s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>' + izgaraCiz(g, pad, y0, cs, izO);
    adimlar.forEach(function (a, i) { s += donSimge(pad + gw + ara + sw * i + sw / 2, H / 2 - 12, a); });
    var qx = pad + gw + ara + sw * adimlar.length + ara;
    s += sonuc ? izgaraCiz(sonuc, qx, y0, cs, izS) + '<rect x="' + f1(qx - 3) + '" y="' + f1(y0 - 3) + '" width="' + f1(gw + 6) + '" height="' + f1(gw + 6) + '" rx="8" fill="none" stroke="#1fa866" stroke-width="3"/>'
      : BQ.kutu(qx, y0, gw, "", { soru: true });
    return BQ.svg(W, H, s, etiket);
  }
  function sikCiz(g) { var n = g.length, cs = n === 3 ? 27 : 21, gw = n * cs; return BQ.tekKutu(izgaraCiz(g, 4 + (100 - gw) / 2, 4 + (100 - gw) / 2, cs), 100); }

  // adim: {yon: "cw"|"ccw", k: 1|2}  (k çeyrek tur)
  var SEV = {
    1: { n: 3, adet: [3, 4], tur: ["kare"], renk: 2 },
    2: { n: 3, adet: [4, 5], tur: ["kare", "kare", "daire", "ucgen"], renk: 3 },
    3: { n: 4, adet: [5, 7], tur: ["kare", "ucgen", "ucgen", "daire"], renk: 3 }
  };
  var L3 = [
    { adimlar: [{ yon: "ccw", k: 1 }], soru: "Desen saat yönünün tersine çeyrek tur dönerse nasıl görünür?" },
    { adimlar: [{ yon: "cw", k: 1 }, { yon: "cw", k: 2 }], soru: "Desen önce saat yönünde çeyrek tur, sonra yarım tur dönerse nasıl görünür?" },
    { adimlar: [{ yon: "cw", k: 2 }, { yon: "ccw", k: 1 }], soru: "Desen önce yarım tur, sonra saat yönünün tersine çeyrek tur dönerse nasıl görünür?" },
    { adimlar: [{ yon: "ccw", k: 1 }, { yon: "ccw", k: 1 }], soru: "Desen saat yönünün tersine iki kez çeyrek tur dönerse nasıl görünür?" }
  ];
  function net(adimlar) { var k = 0; adimlar.forEach(function (a) { k += a.yon === "cw" ? a.k : -a.k; }); return ((k % 4) + 4) % 4; }

  function gen(rnd, sv) {
    var S = SEV[sv], n = S.n, renk = rnd.sample(BQ.RENKLER, S.renk), g = [], hucre = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); for (c = 0; c < n; c++) { g[r].push(null); hucre.push([r, c]); } }
    var ucgen = 0;
    rnd.sample(hucre, rnd.int(S.adet[0], S.adet[1])).forEach(function (h) {
      var t = rnd.pick(S.tur);
      if (t === "ucgen") { if (sv === 2 && ucgen) t = "kare"; else ucgen++; }
      g[h[0]][h[1]] = { t: t, o: YONSUZ[t] ? 0 : rnd.int(0, 3), r: rnd.pick(renk) };
    });
    if (sv === 3 && ucgen < 2) return null;
    // desen ne dönme ne ayna simetrisi taşısın: 8 görüntünün hepsi farklı
    var es = {};
    dortlu(g).forEach(function (x) { es[gk(x)] = 1; });
    if (Object.keys(es).length !== 8) return null;
    var P = sv === 1 ? { adimlar: [{ yon: "cw", k: 2 }], soru: "Desen yarım tur dönerse nasıl görünür?" }
      : sv === 2 ? { adimlar: [{ yon: "cw", k: 1 }], soru: "Desen saat yönünde çeyrek tur dönerse nasıl görünür?" } : rnd.pick(L3);
    var K = net(P.adimlar), dogru = don(g, K), celd;
    if (K === 2) celd = sv === 1 ? rnd.shuffle([{ g: g, ne: "kendi" }, { g: gT(g, "lr"), ne: "aynaLR" }, { g: gT(g, "ud"), ne: "aynaUD" }])
      : [{ g: don(g, 1), ne: "ceyrek" }].concat(rnd.shuffle([{ g: gT(dogru, "lr"), ne: "ayna" }, { g: gT(dogru, "ud"), ne: "ayna" }, { g: don(g, 3), ne: "ceyrek" }]));
    else {
      var ters = { g: don(g, 4 - K), ne: "ters" };
      celd = sv === 2 ? [ters, { g: gT(dogru, "lr"), ne: "ayna" }].concat(rnd.shuffle([{ g: don(g, 2), ne: "yarim" }, { g: g, ne: "kendi" }]))
        : [ters].concat(rnd.shuffle([{ g: gT(dogru, "lr"), ne: "ayna" }, { g: gT(dogru, "ud"), ne: "ayna" }]));
    }
    var sk = BQ.siklar(rnd, { g: dogru, ne: "dogru" }, celd, function (x) { return gk(x.g); });
    if (!sk) return null;
    // takip edilecek parça: köşede (yoksa herhangi) duran, mümkünse yönlü olan
    var aday = [];
    for (r = 0; r < n; r++) for (c = 0; c < n; c++) if (g[r][c]) aday.push({ r: r, c: c, p: ((r === 0 || r === n - 1) && (c === 0 || c === n - 1) ? 2 : 0) + (g[r][c].t === "ucgen" ? 1 : 0) });
    aday.sort(function (a, b) { return b.p - a.p; });
    var iz = aday[0], yeni = [iz.r, iz.c];
    for (var i = 0; i < K; i++) yeni = [yeni[1], n - 1 - yeni[0]];
    var q = {
      soru: P.soru,
      fig: fig(g, P.adimlar, null, null, null, "Renkli ızgara deseni ve dönüş yönünü gösteren kavisli ok"),
      tur: "svg",
      sec: sk.liste.map(function (x) { return sikCiz(x.g); }),
      dogru: sk.dogru,
      data: { desen: g, adimlar: P.adimlar, siklar: sk.liste.map(function (x) { return x.g; }) },
      cozumFig: fig(g, P.adimlar, dogru, [iz.r, iz.c], yeni, "Desen ve döndürülmüş hâli; takip edilen parça yeşil çerçeveli")
    };
    q.adim = aciklama(g, P.adimlar, K, iz, yeni, sk.liste, sk.dogru, ucgen > 0);
    return q;
  }

  function konum(r, c, n) {  // bulunma hâli: "sol üst köşede"
    if ((r === 0 || r === n - 1) && (c === 0 || c === n - 1)) return (c === 0 ? "sol " : "sağ ") + (r === 0 ? "üst" : "alt") + " köşede";
    if (n === 3) return (r === 0 ? "üst" : r === 1 ? "orta" : "alt") + " satırın " + (c === 0 ? "solunda" : c === 1 ? "ortasında" : "sağında");
    return "üstten " + (r + 1) + ". satırda, soldan " + (c + 1) + ". karede";
  }
  function hAd(t) { return t ? t.r + " " + TUR_AD[t.t] : "boş"; }
  function aciklama(g, adimlar, K, iz, yeni, sik, dg, ucgenVar) {
    var n = g.length, a = [];
    if (adimlar.length > 1) a.push("Önce adımları birleştir: " + adimlar.map(function (x) { return x.k === 2 ? "yarım tur" : x.yon === "cw" ? "saat yönünde çeyrek tur" : "ters yönde çeyrek tur"; }).join(" + ") +
      " = <b>" + (K === 2 ? "yarım tur" : K === 1 ? "saat yönünde çeyrek tur" : "saat yönünün tersine çeyrek tur") + "</b>.");
    if (K === 2) {
      a.push("Yarım turda desen baş aşağı olur: <b>alt satır tersten okunup en üste çıkar</b>.");
      a.push("Alt satır soldan sağa: " + g[n - 1].map(hAd).join(", ") + ". Yarım turdan sonra üst satır: <b>" + g[n - 1].slice().reverse().map(hAd).join(", ") + "</b>.");
    } else {
      a.push(K === 1 ? "Saat yönünde çeyrek turda <b>sol sütun, aşağıdan yukarı okunarak üst satır olur</b>." : "Saat yönünün tersine çeyrek turda <b>sağ sütun, yukarıdan aşağı okunarak üst satır olur</b>.");
    }
    a.push("Bir parçayı takip et: <b>" + hAd(g[iz.r][iz.c]) + "</b> şu an " + konum(iz.r, iz.c, n) + "; döndükten sonra <b>" + konum(yeni[0], yeni[1], n) + "</b> olur." +
      (ucgenVar ? " Üçgenlerin sivri köşesi de desenle birlikte döner." : ""));
    var AD = { kendi: "desen hiç dönmemiş", aynaLR: "sağ ile sol yer değiştirmiş; bu ayna görüntüsü, dönme değil", aynaUD: "satırlar ters çevrilmeden yer değiştirmiş; bu ayna görüntüsü, dönme değil",
      ayna: "doğru cevabın aynadaki görüntüsü; dönmede desen ters çevrilmez", ters: "ters yöne döndürülmüş", yarim: "yarım tur döndürülmüş", ceyrek: "yalnızca çeyrek tur döndürülmüş" };
    var el = [];
    sik.forEach(function (x, i) { if (i !== dg) el.push(BQ.HARF[i] + ": " + AD[x.ne]); });
    a.push("Yanlış şıklar: " + el.join("; ") + ".");
    a.push("Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  BQ.reg("dondurme", {
    ad: "Döndürme",
    gen: gen,
    coz: function (q) {
      // adımları sırayla uygula; her çeyrek turda hücre (r,c) → (c, n-1-r), üçgen köşesi bir sonraki köşeye geçer
      var g = q.data.desen, n = g.length;
      q.data.adimlar.forEach(function (a) {
        for (var k = 0; k < (a.yon === "cw" ? a.k : 4 - a.k); k++) {
          var y = [];
          for (var r = 0; r < n; r++) { y.push([]); for (var c = 0; c < n; c++) y[r].push(null); }
          for (r = 0; r < n; r++) for (c = 0; c < n; c++) { var t = g[r][c]; y[c][n - 1 - r] = t ? { t: t.t, o: t.t === "ucgen" ? (t.o + 1) % 4 : 0, r: t.r } : null; }
          g = y;
        }
      });
      var hedef = gk(g), es = [];
      if (hedef === gk(q.data.desen)) throw new Error("desen dönme simetrik");
      q.data.siklar.forEach(function (s, i) { if (gk(s) === hedef) es.push(i); });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Farklı olan ve şekil benzeşimi.
   (a) Dört şekilden biri ortak kuralı bozar (renk, köşe sayısı, içi dolu/boş, yön, nokta sayısı, nokta = köşe).
       Başka hiçbir özellik tek bir şekli ayırmaz; çözücü her özelliği ve ilişkiyi dener.
   (b) Benzeşim: ilk şekil → ikinci şekil; aynı dönüşüm üçüncüye uygulanır (renk, boyut, içi boşalma, sayı ×2 / ÷2, dönme). */
(function (BQ) {
  "use strict";
  function f1(x) { return Math.round(x * 10) / 10; }
  function buyuk(s) { return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1); }

  // ================================================================ (a) farklı olanı bul
  var FORM = {
    "üçgen": { k: 3, p: [[0, -1], [0.95, 0.72], [-0.95, 0.72]], m: [0, 0.22], n: true },
    "dik üçgen": { k: 3, p: [[-0.8, -0.95], [0.85, 0.8], [-0.8, 0.8]], m: [-0.3, 0.3], n: false },
    "sivri üçgen": { k: 3, p: [[0, -1], [0.55, 0.9], [-0.55, 0.9]], m: [0, 0.35], n: false },
    "kare": { k: 4, p: [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]], m: [0, 0], n: true },
    "dikdörtgen": { k: 4, p: [[-0.98, -0.58], [0.98, -0.58], [0.98, 0.58], [-0.98, 0.58]], m: [0, 0], n: true },
    "baklava": { k: 4, p: [[0, -1], [0.78, 0], [0, 1], [-0.78, 0]], m: [0, 0], n: true },
    "yamuk": { k: 4, p: [[-0.5, -0.62], [0.5, -0.62], [0.98, 0.62], [-0.98, 0.62]], m: [0, 0.05], n: true },
    "paralelkenar": { k: 4, p: [[-0.45, -0.62], [0.98, -0.62], [0.45, 0.62], [-0.98, 0.62]], m: [0, 0], n: true },
    "beşgen": { k: 5, p: null, m: [0, 0.08], n: true },
    "ev": { k: 5, p: [[0, -1], [0.85, -0.2], [0.85, 0.85], [-0.85, 0.85], [-0.85, -0.2]], m: [0, 0.3], n: true },
    "etiket": { k: 5, p: [[-0.95, -0.6], [0.35, -0.6], [0.98, 0], [0.35, 0.6], [-0.95, 0.6]], m: [-0.15, 0], n: true },
    "altıgen": { k: 6, p: null, m: [0, 0], n: true },
    "uzun altıgen": { k: 6, p: [[-0.55, -0.64], [0.55, -0.64], [1, 0], [0.55, 0.64], [-0.55, 0.64], [-1, 0]], m: [0, 0], n: true },
    "L": { k: 6, p: [[-0.75, -0.95], [-0.08, -0.95], [-0.08, 0.28], [0.8, 0.28], [0.8, 0.95], [-0.75, 0.95]], m: [-0.4, 0.6], n: false }
  };
  (function () {
    var i, a, p = [];
    for (i = 0; i < 5; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / 5; p.push([Math.cos(a), Math.sin(a) * 0.98 + 0.08]); }
    FORM["beşgen"].p = p; p = [];
    for (i = 0; i < 6; i++) { a = i * Math.PI / 3; p.push([Math.cos(a), Math.sin(a) * 0.92]); }
    FORM["altıgen"].p = p;
  })();
  var KOSE_AD = { 3: "üç", 4: "dört", 5: "beş", 6: "altı", 7: "yedi" };
  function formlar(k) { return Object.keys(FORM).filter(function (f) { return FORM[f].k === k; }); }
  // nokta düzeni (birim)
  var NOK = { 1: [[0, 0]], 2: [[-1, 0], [1, 0]], 3: [[0, -0.9], [-1, 0.75], [1, 0.75]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1.1, -0.9], [0, -0.9], [1.1, -0.9], [-1.1, 0.9], [0, 0.9], [1.1, 0.9]] };

  function ogeCiz(o, cx, cy, r) {
    var renk = BQ.RENK[o.renk], s = "";
    if (o.form === "ok") s += BQ.sekil("ok", cx, cy, r, o.renk, o.rot, o.bos ? { bos: true, cizgi: renk, sw: 4.5 } : { sw: 2.6 });
    else {
      var pts = FORM[o.form].p.map(function (p) { return [cx + p[0] * r, cy + p[1] * r]; });
      s += '<polygon points="' + BQ.poly(pts) + '" fill="' + (o.bos ? "#fff" : renk) + '" stroke="' + (o.bos ? renk : BQ.CIZ) + '" stroke-width="' + (o.bos ? 4.5 : 2.6) + '" stroke-linejoin="round"/>';
    }
    if (o.nokta) {
      var m = FORM[o.form] ? FORM[o.form].m : [0, 0], dx = r * 0.25, dy = r * 0.22;
      NOK[o.nokta].forEach(function (p) {
        s += '<circle cx="' + f1(cx + m[0] * r + p[0] * dx) + '" cy="' + f1(cy + m[1] * r + p[1] * dy) + '" r="' + f1(r * 0.085) + '" fill="' + (o.bos ? BQ.CIZ : "#fff") + '" stroke="' + BQ.CIZ + '" stroke-width="1.4"/>';
      });
    }
    return s;
  }
  function kVal(o) { return o.form === "ok" ? 7 : FORM[o.form].k; }
  var OZ_A = ["form", "k", "renk", "bos", "nokta", "rot", "iliski"];
  function deger(o, oz) {
    if (oz === "k") return kVal(o);
    if (oz === "iliski") return o.nokta > 0 && o.nokta === kVal(o) ? 1 : 0;
    return o[oz];
  }
  // 3+1 düzeni varsa farklı olanın indeksi, yoksa -1
  function tekFarkli(vals) {
    var say = {};
    vals.forEach(function (v) { say[v] = (say[v] || 0) + 1; });
    var k = Object.keys(say);
    if (k.length !== 2) return -1;
    var az = say[k[0]] === 1 ? k[0] : say[k[1]] === 1 ? k[1] : null;
    if (az === null) return -1;
    return vals.map(String).indexOf(az);
  }
  function cozFarkli(ogeler) {
    var bulgu = [];
    OZ_A.forEach(function (oz) {
      var i = tekFarkli(ogeler.map(function (o) { return deger(o, oz); }));
      if (i >= 0) bulgu.push([oz, i]);
    });
    // "form" ve "köşe sayısı" aynı özelliğin iki yüzü: tek bulgu sayılır
    var oz = bulgu.map(function (b) { return b[0]; });
    if (oz.length === 2 && oz.indexOf("form") >= 0 && oz.indexOf("k") >= 0 && bulgu[0][1] === bulgu[1][1]) bulgu = [["k", bulgu[0][1]]];
    if (bulgu.length !== 1) return null;
    return { oz: bulgu[0][0], i: bulgu[0][1] };
  }

  function desenUygula(rnd, ogeler, oz, desen, havuz) {
    var v;
    if (desen === "ayni") { v = rnd.pick(havuz); ogeler.forEach(function (o) { o[oz] = v; }); }
    else if (desen === "22") { v = rnd.sample(havuz, 2); var s = rnd.shuffle([0, 0, 1, 1]); ogeler.forEach(function (o, i) { o[oz] = v[s[i]]; }); }
    else { v = rnd.sample(havuz, 4); ogeler.forEach(function (o, i) { o[oz] = v[i]; }); }
  }

  function genFarkli(rnd, sv) {
    var kurallar = { 1: ["renk", "bos", "sekil"], 2: ["renk", "bos", "kose", "yon", "nokta"], 3: ["kose", "yon", "nokta", "iliski", "bos", "renk"] }[sv];
    var kural = rnd.pick(kurallar), o = [{}, {}, {}, {}], tek = rnd.int(0, 3), i;
    o.forEach(function (x) { x.renk = "mavi"; x.bos = false; x.nokta = 0; x.rot = 0; x.form = "kare"; });
    var serbest = ["renk", "bos", "form"]; // dikkat dağıtan özellikler
    var tumFormlar = Object.keys(FORM);
    if (kural === "yon") { o.forEach(function (x) { x.form = "ok"; }); serbest = ["renk", "bos"]; }
    // temel desen (çeldirici özellikler)
    var nSerbest = sv === 1 ? 0 : sv === 2 ? 1 : 2;
    var secili = rnd.sample(serbest.filter(function (s) { return !(s === kural || (s === "form" && (kural === "sekil" || kural === "kose" || kural === "iliski"))); }), nSerbest);
    desenUygula(rnd, o, "renk", secili.indexOf("renk") >= 0 ? rnd.pick(["22", "hepsi"]) : "ayni", BQ.RENKLER);
    if (secili.indexOf("bos") >= 0) desenUygula(rnd, o, "bos", "22", [true, false]);
    var nokFormlar = tumFormlar.filter(function (f) { return FORM[f].n; });
    if (kural !== "yon") {
      var fh = kural === "nokta" ? nokFormlar : tumFormlar;
      desenUygula(rnd, o, "form", secili.indexOf("form") >= 0 ? rnd.pick(["22", "hepsi"]) : "ayni", fh);
    }
    if (kural === "renk") { var r0 = o[tek].renk; o[tek].renk = rnd.pick(BQ.RENKLER.filter(function (c) { return o.every(function (x) { return x.renk !== c; }); })); if (secili.indexOf("renk") < 0) o.forEach(function (x, j) { if (j !== tek) x.renk = r0; }); }
    if (kural === "renk" && tekFarkli(o.map(function (x) { return x.renk; })) !== tek) return null;
    if (kural === "bos") { var ters = sv > 1 && rnd.chance(0.3); o.forEach(function (x, j) { x.bos = j === tek ? !ters : ters; }); }
    if (kural === "sekil") { var ff = rnd.sample(tumFormlar.filter(function (f) { return f !== "L"; }), 2); if (FORM[ff[0]].k === FORM[ff[1]].k) return null; o.forEach(function (x, j) { x.form = ff[j === tek ? 1 : 0]; }); }
    if (kural === "kose") {
      var ks = rnd.sample([3, 4, 5, 6], 2), fa = rnd.sample(formlar(ks[0]), 3), fb = rnd.pick(formlar(ks[1]));
      if (fa.length < 3) return null;
      var j2 = 0;
      o.forEach(function (x, j) { x.form = j === tek ? fb : fa[j2++]; });
    }
    if (kural === "yon") {
      var r1 = rnd.pick([0, 90, 180, 270]), d = sv === 3 && rnd.chance(0.4) ? rnd.pick([45, 315]) : rnd.pick([90, 180, 270]);
      o.forEach(function (x, j) { x.rot = j === tek ? (r1 + d) % 360 : r1; });
    }
    if (kural === "nokta") {
      var c = rnd.sample([1, 2, 3, 4, 5, 6], 2);
      if (sv === 2 && Math.abs(c[0] - c[1]) > 2) c[1] = c[0] + (c[1] > c[0] ? 1 : -1);
      o.forEach(function (x, j) { x.nokta = j === tek ? c[1] : c[0]; });
    }
    if (kural === "iliski") {
      var fs = rnd.sample(nokFormlar, 4);
      o.forEach(function (x, j) { x.form = fs[j]; x.nokta = FORM[fs[j]].k; });
      var kk = o[tek].nokta + rnd.pick([-1, 1]);
      if (kk > 6) kk = o[tek].nokta - 1;
      o[tek].nokta = kk;
    }
    if (kural === "bos" || kural === "renk") { /* nokta yok */ }
    if (sv === 3 && kural !== "nokta" && kural !== "iliski" && kural !== "yon" && rnd.chance(0.5)) {
      // dikkat dağıtıcı noktalar (2+2)
      if (!o.every(function (x) { return FORM[x.form].n; })) return null;
      desenUygula(rnd, o, "nokta", "22", [1, 2, 3, 4]);
    }
    var cz = cozFarkli(o);
    if (!cz || cz.i !== tek) return null;
    var tekOz = cz.oz;
    // görsel eşleşme: iki öğe birebir aynı olmasın (3+1 desenin "üçlüsü" hariç anlamsız olur)
    var sec = o.map(function (x) { return BQ.tekKutu(ogeCiz(x, 54, 54, 36), 100); });
    var tekl = {};
    sec.forEach(function (s) { tekl[s] = 1; });
    if (Object.keys(tekl).length !== 4) return null;
    var W = 4 * 100 + 5 * 14, H = 100 + 28 + 30, fig = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>', cf = fig;
    o.forEach(function (x, j) {
      var bx = 14 + j * 114;
      var kutu = function (v) { return BQ.kutu(bx, 14, 100, ogeCiz(x, bx + 50, 64, 36), { vurgu: v }); };
      var harf = '<circle cx="' + (bx + 50) + '" cy="' + (H - 20) + '" r="13" fill="#fff" stroke="#cbd4e6" stroke-width="2"/>' + BQ.yazi(bx + 50, H - 14, BQ.HARF[j], { boy: 16, kalin: 900 });
      fig += kutu(null) + harf;
      cf += kutu(j === tek ? "#1fa866" : null) + harf;
    });
    var q = {
      soru: "Hangi şekil diğerlerinden farklı?",
      fig: BQ.svg(W, H, fig, "Dört şekil: A, B, C, D"),
      tur: "svg",
      sec: sec,
      dogru: tek,
      data: { alt: "farkli", ogeler: o },
      cozumFig: BQ.svg(W, H, cf, "Farklı olan işaretli")
    };
    q.adim = aciklamaFarkli(o, tek, tekOz, kural);
    return q;
  }

  var YON8 = { 0: "yukarı", 45: "sağ üst köşeye", 90: "sağa", 135: "sağ alt köşeye", 180: "aşağı", 225: "sol alt köşeye", 270: "sola", 315: "sol üst köşeye" };
  function aciklamaFarkli(o, tek, oz, kural) {
    var H = BQ.HARF[tek], x = o[tek], diger = o.filter(function (_, j) { return j !== tek; })[0];
    var a = ["Şekilleri özellik özellik karşılaştır: <b>renk</b>, <b>köşe sayısı</b>, <b>içi dolu mu boş mu</b>, <b>yön</b>, <b>içindeki noktalar</b>. Her özellikte \"üçü aynı, biri farklı\" olan var mı, bak."];
    if (oz === "renk") a.push("<b>Renk</b>: üç şekil " + diger.renk + ", yalnızca " + H + " " + x.renk + ".");
    else if (oz === "bos") a.push("<b>İçi</b>: üç şeklin içi " + (diger.bos ? "boş" : "dolu (boyalı)") + ", yalnızca " + H + " şeklinin içi " + (x.bos ? "boş" : "dolu") + ".");
    else if (oz === "k") a.push(kural === "sekil" ? "<b>Şekil</b>: üçü " + diger.form + ", yalnızca " + H + " " + x.form + "." :
      "<b>Köşe sayısı</b>: köşeleri tek tek say. Üç şeklin " + KOSE_AD[kVal(diger)] + " köşesi var (biçimleri farklı olsa da!), " + H + " şeklinin ise " + KOSE_AD[kVal(x)] + " köşesi var.");
    else if (oz === "rot") a.push("<b>Yön</b>: üç ok " + YON8[diger.rot] + " bakıyor, yalnızca " + H + " oku " + YON8[x.rot] + " bakıyor.");
    else if (oz === "nokta") a.push("<b>Noktalar</b>: üç şeklin içinde " + diger.nokta + " nokta var, " + H + " şeklinde ise " + x.nokta + " nokta.");
    else if (oz === "iliski") a.push("Burada gizli bir <b>ilişki</b> var: her şeklin içindeki nokta sayısı kendi köşe sayısına eşit (" +
      o.filter(function (_, j) { return j !== tek; }).map(function (y) { return y.form + ": " + kVal(y) + " köşe, " + y.nokta + " nokta"; }).join("; ") + ").",
      H + " şeklinin " + kVal(x) + " köşesi var ama içinde " + x.nokta + " nokta var; kuralı bozan o.");
    var ayni = [];
    if (oz !== "renk") ayni.push(o.every(function (y) { return y.renk === o[0].renk; }) ? "renkler hep aynı" : "renkler karışık, kimseyi tek başına ayırmıyor");
    if (oz !== "bos" && o.some(function (y) { return y.bos; })) ayni.push("dolu/boş şekiller ikişer tane");
    if (oz !== "nokta" && oz !== "iliski" && o.some(function (y) { return y.nokta; })) ayni.push("nokta sayıları ikişer ikişer aynı");
    if (oz !== "k" && oz !== "rot" && o.some(function (y) { return y.form !== o[0].form; })) ayni.push("şekiller farklı biçimlerde ama tek bir şekil öne çıkmıyor");
    if (ayni.length) a.push("Diğer özelliklere de bak: " + ayni.join("; ") + ". Bunlar tek bir şekli ayırmıyor; ipucu yalnızca " + (oz === "k" ? (kural === "sekil" ? "şekilde" : "köşe sayısında") : oz === "rot" ? "yönde" : oz === "renk" ? "renkte" : oz === "bos" ? "doluluk–boşlukta" : oz === "nokta" ? "nokta sayısında" : "nokta–köşe ilişkisinde") + ".");
    a.push("Farklı olan " + H + ". Doğru cevap <b>" + H + "</b>.");
    return a;
  }

  // ================================================================ (b) şekil benzeşimi
  var KIRAL = {
    "L": [[-0.6, -1], [-0.1, -1], [-0.1, 0.45], [0.7, 0.45], [0.7, 1], [-0.6, 1]],
    "bayrak": [[-0.55, -1], [0.85, -0.55], [-0.32, -0.08], [-0.32, 1], [-0.55, 1]]
  };
  var DUZ = ["daire", "kare", "üçgen", "yıldız", "kalp", "altıgen", "baklava"];
  var OZ_B = ["sekil", "renk", "sayi", "boy", "bos", "rot", "ayna"];
  var BOYB = [0.62, 1];
  function anahtarB(h) { return OZ_B.map(function (o) { return h[o]; }).join("|"); }
  function tekSekil(h, cx, cy, r) {
    var renk = BQ.RENK[h.renk];
    if (KIRAL[h.sekil]) {
      var a = h.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
      var pts = KIRAL[h.sekil].map(function (p) { var x = h.ayna ? -p[0] : p[0], y = p[1]; return [cx + (x * ca - y * sa) * r, cy + (x * sa + y * ca) * r]; });
      return '<polygon points="' + BQ.poly(pts) + '" fill="' + (h.bos ? "#fff" : renk) + '" stroke="' + (h.bos ? renk : BQ.CIZ) + '" stroke-width="' + (h.bos ? 4 : 2.4) + '" stroke-linejoin="round"/>';
    }
    return BQ.sekil(h.sekil, cx, cy, r, h.renk, 0, h.bos ? { bos: true, cizgi: renk, sw: 4 } : { sw: 2.4 });
  }
  function ogeB(h, x, y, w) {
    var n = h.sayi, r = w * (n === 1 ? 0.32 : n === 2 ? 0.18 : n <= 4 ? 0.14 : 0.115) * BOYB[h.boy], s = "";
    BQ.YER[n].forEach(function (p) { s += tekSekil(h, x + p[0] * w, y + p[1] * w, r); });
    return s;
  }
  function cozB(A, B, C) {
    var c = {};
    for (var i = 0; i < OZ_B.length; i++) {
      var oz = OZ_B[i];
      if (A[oz] === B[oz]) { c[oz] = C[oz]; continue; }
      if (oz === "sekil") return null;
      if (oz === "rot") { c.rot = (C.rot + ((B.rot - A.rot) % 360 + 360)) % 360; continue; }
      if (C[oz] !== A[oz]) return null; // dönüşüm C'ye tek anlamlı uygulanamaz
      c[oz] = B[oz];
    }
    return c;
  }
  var DON_AD = { renk: "renk", boy: "boyut", bos: "içi", sayi: "sayı", rot: "dönme" };
  function genBenzes(rnd, sv) {
    var havuz = ["renk", "boy", "bos", "sayi"], don;
    if (sv === 1) don = [rnd.pick(havuz)];
    else if (sv === 2) don = rnd.chance(0.3) ? ["rot"] : rnd.sample(havuz, 2);
    else don = rnd.chance(0.65) ? ["rot"].concat(rnd.sample(havuz, rnd.chance(0.4) ? 2 : 1)) : rnd.sample(havuz, 3);
    var rotVar = don.indexOf("rot") >= 0;
    var sekiller = rnd.sample(rotVar ? Object.keys(KIRAL) : DUZ, 2);
    if (rotVar && rnd.chance(0.35)) sekiller[1] = sekiller[0];
    var A = { sekil: sekiller[0], renk: rnd.pick(BQ.RENKLER), sayi: 1, boy: 1, bos: false, rot: rotVar ? rnd.pick([0, 90, 180, 270]) : 0, ayna: false };
    if (don.indexOf("sayi") >= 0) A.sayi = rnd.pick([1, 2, 2, 4]); else if (sv > 1 && rnd.chance(0.3)) A.sayi = 2;
    if (don.indexOf("boy") >= 0) A.boy = rnd.pick([0, 0, 1]);
    if (don.indexOf("bos") >= 0) A.bos = rnd.chance(0.75) ? false : true;
    var B = Object.assign({}, A);
    don.forEach(function (d) {
      if (d === "renk") B.renk = rnd.pick(BQ.RENKLER.filter(function (c) { return c !== A.renk; }));
      if (d === "boy") B.boy = 1 - A.boy;
      if (d === "bos") B.bos = !A.bos;
      if (d === "sayi") B.sayi = A.sayi === 4 ? 2 : A.sayi * 2;
      if (d === "rot") B.rot = (A.rot + (sv === 2 ? rnd.pick([90, 270]) : rnd.pick([90, 180, 270]))) % 360;
    });
    var C = Object.assign({}, A, { sekil: sekiller[1] });
    if (rotVar) C.rot = rnd.pick([0, 90, 180, 270]);
    if (C.sekil === A.sekil && (!rotVar || C.rot === A.rot)) { if (!rotVar) return null; C.renk = rnd.pick(BQ.RENKLER.filter(function (c) { return c !== A.renk; })); if (don.indexOf("renk") >= 0) return null; }
    // dönüşmeyen özelliklerde C, A'dan ayrılabilir (2-3. seviye)
    if (sv > 1 && don.indexOf("renk") < 0 && rnd.chance(0.5)) C.renk = rnd.pick(BQ.RENKLER.filter(function (c) { return c !== A.renk; }));
    var D = cozB(A, B, C);
    if (!D) return null;
    var dogru = D, celd = [];
    function ekle(h) { if (anahtarB(h) !== anahtarB(dogru) && !celd.some(function (x) { return anahtarB(x) === anahtarB(h); })) celd.push(h); }
    rnd.shuffle(don).forEach(function (d) { var h = Object.assign({}, dogru); h[d] = C[d]; ekle(h); });
    if (rotVar) {
      var dd = (B.rot - A.rot + 360) % 360;
      ekle(Object.assign({}, dogru, { rot: (C.rot - dd + 360) % 360 }));
      ekle(Object.assign({}, dogru, { ayna: true }));
    }
    var yedek = [Object.assign({}, B), Object.assign({}, dogru, { renk: rnd.pick(BQ.RENKLER.filter(function (c) { return c !== dogru.renk; })) })];
    if (don.indexOf("sayi") >= 0) yedek.unshift(Object.assign({}, dogru, { sayi: dogru.sayi === 4 ? 3 : dogru.sayi + 1 }));
    rnd.shuffle(yedek).forEach(ekle);
    celd = celd.slice(0, 2).concat(rnd.shuffle(celd.slice(2)));
    var sk = BQ.siklar(rnd, dogru, celd, anahtarB);
    if (!sk) return null;
    // çizim: [A] → [B]  =  [C] → [?]
    var bw = 96, y0 = 12, W = 12 + bw * 4 + 38 * 2 + 52 + 12, H = bw + 24, x = 12, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    function ok(x0) { var cy = y0 + bw / 2; return '<path d="M' + (x0 + 7) + "," + cy + " H" + (x0 + 27) + '" stroke="' + BQ.CIZ + '" stroke-width="3.2" stroke-linecap="round"/><path d="M' + (x0 + 22) + "," + (cy - 7) + " L" + (x0 + 31) + "," + cy + " L" + (x0 + 22) + "," + (cy + 7) + '" fill="none" stroke="' + BQ.CIZ + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'; }
    function esittir(x0) { var cy = y0 + bw / 2; return '<path d="M' + (x0 + 14) + "," + (cy - 6) + " H" + (x0 + 38) + " M" + (x0 + 14) + "," + (cy + 6) + " H" + (x0 + 38) + '" stroke="#8a94ad" stroke-width="3.6" stroke-linecap="round"/>'; }
    function ciz(son, v) {
      var t = s, xx = x;
      t += BQ.kutu(xx, y0, bw, ogeB(A, xx, y0, bw)); xx += bw; t += ok(xx); xx += 38;
      t += BQ.kutu(xx, y0, bw, ogeB(B, xx, y0, bw)); xx += bw; t += esittir(xx); xx += 52;
      t += BQ.kutu(xx, y0, bw, ogeB(C, xx, y0, bw)); xx += bw; t += ok(xx); xx += 38;
      t += son ? BQ.kutu(xx, y0, bw, ogeB(son, xx, y0, bw), { vurgu: v }) : BQ.kutu(xx, y0, bw, "", { soru: true });
      return t;
    }
    var q = {
      soru: "İlk şekil ikinciye nasıl dönüştüyse, üçüncü şekil de öyle dönüşmeli. Soru işaretine hangisi gelir?",
      fig: BQ.svg(W, H, ciz(null), "Benzeşim: birinci şekil ikinciye dönüşüyor; üçüncü şekil neye dönüşür?"),
      tur: "svg",
      sec: sk.liste.map(function (h) { return BQ.tekKutu(ogeB(h, 4, 4, 100), 100); }),
      dogru: sk.dogru,
      data: { alt: "benzes", A: A, B: B, C: C, siklar: sk.liste },
      cozumFig: BQ.svg(W, H, ciz(dogru, "#1fa866"))
    };
    q.adim = aciklamaB(A, B, C, dogru, don, sk);
    return q;
  }
  function donCumle(d, A, B) {
    if (d === "renk") return "<b>Renk</b> değişti: " + A.renk + " → " + B.renk + ".";
    if (d === "boy") return "<b>Boyut</b> değişti: " + (A.boy ? "büyük → küçük" : "küçük → büyük") + ".";
    if (d === "bos") return "<b>İçi</b> " + (A.bos ? "doldu (boş → dolu)" : "boşaldı (dolu → boş)") + ".";
    if (d === "sayi") return "<b>Sayı</b> " + (B.sayi > A.sayi ? "ikiye katlandı" : "yarıya indi") + ": " + A.sayi + " → " + B.sayi + ".";
    var dd = (B.rot - A.rot + 360) % 360;
    return "<b>Dönme</b>: şekil " + (dd === 180 ? "yarım tur döndü" : dd === 90 ? "saat yönünde çeyrek tur döndü" : "saatin tersine çeyrek tur döndü") + " (ters çevrilmedi, yalnızca döndü).";
  }
  function aciklamaB(A, B, C, D, don, sk) {
    var a = ["Önce ilk iki kutuya bak: <b>ne değişti, ne aynı kaldı?</b> Özellik özellik karşılaştır."];
    a.push(don.map(function (d) { return donCumle(d, A, B); }).join(" "));
    var ayni = OZ_B.filter(function (o) { return don.indexOf(o) < 0 && ["sekil", "ayna"].indexOf(o) < 0 && !(o === "rot" && !KIRAL[A.sekil]); }).map(function (o) { return o === "boy" ? "boyut" : o === "bos" ? "doluluk" : o === "sayi" ? "sayı" : o === "rot" ? "yön" : o; });
    if (ayni.length) a.push("Aynı kalanlar: " + ayni.join(", ") + ". Bunlar üçüncü şekilde de olduğu gibi kalır.");
    a.push("Aynı " + (don.length > 1 ? "değişiklikleri" : "değişikliği") + " üçüncü şekle (" + C.sekil + ") uygula. Şekil " + C.sekil + " olarak kalır; yalnızca " + don.map(function (d) { return DON_AD[d]; }).join(" ve ") + " değişir.");
    var el = [];
    sk.liste.forEach(function (h, i) {
      if (i === sk.dogru) return;
      var neden = h.sekil !== D.sekil ? "şekil değişmemeliydi" : h.ayna ? "ters çevrilmiş" :
        OZ_B.filter(function (o) { return h[o] !== D[o]; }).map(function (o) { return o === "rot" ? "yanlış yöne dönmüş" : (don.indexOf(o) >= 0 && h[o] === C[o] ? DON_AD[o] + " değişmemiş" : DON_AD[o] + " yanlış"); }).join(", ");
      el.push(BQ.HARF[i] + " (" + neden + ")");
    });
    a.push("Şıkları eleyelim: " + el.join("; ") + ". Doğru cevap <b>" + BQ.HARF[sk.dogru] + "</b>.");
    return a;
  }

  BQ.reg("farkli", {
    ad: "Farklı olan ve benzeşim",
    gen: function (rnd, sv) { return rnd.chance(0.5) ? genFarkli(rnd, sv) : genBenzes(rnd, sv); },
    coz: function (q) {
      var d = q.data;
      if (d.alt === "farkli") {
        var cz = cozFarkli(d.ogeler);
        if (!cz) throw new Error("farklı olan belirsiz");
        return cz.i;
      }
      var D = cozB(d.A, d.B, d.C);
      if (!D) throw new Error("dönüşüm belirsiz");
      var es = d.siklar.map(function (h, i) { return anahtarB(h) === anahtarB(D) ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Gölge — renkli şekil kompozisyonunun gölgesini (silüetini) bul.
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

;/* Kâğıt katlama ve ayna — (a) aynadaki görüntü, (b) katla, del, aç.
   Ders: çizgiye yakın olan yakında, uzak olan uzakta kalır; kopyalamak değil tersten okumak. */
(function (BQ) {
  "use strict";
  var f1 = BQ.f1;
  var KLR = [1, 0, 3, 2], KUD = [3, 2, 1, 0];
  var YONSUZ = { kare: 1, daire: 1 };
  var TUR_AD = { kare: "kare", daire: "daire", ucgen: "üçgen" };
  var KAGIT = "#fff6df", KAGIT2 = "#f6e2b3", KAT_ALAN = "#fbe9bf";

  // ---------------------------------------------------------------- ızgara (ayna)
  function kt(t, f) {
    if (!t) return null;
    var o = YONSUZ[t.t] ? 0 : t.o;
    if (!YONSUZ[t.t]) o = f === "lr" ? KLR[o] : f === "ud" ? KUD[o] : f === "r180" ? (o + 2) % 4 : o;
    return { t: t.t, o: o, r: t.r };
  }
  // lr/ud/r180: gerçek dönüşüm; klr/kud: yerler aynalanır ama şekiller çevrilmez (kopya tuzağı)
  function gT(g, f) {
    var n = g.length, m = g[0].length, out = [];
    for (var r = 0; r < n; r++) {
      out.push([]);
      for (var c = 0; c < m; c++) {
        var s = (f === "lr" || f === "klr") ? g[r][m - 1 - c] : (f === "ud" || f === "kud") ? g[n - 1 - r][c] : g[n - 1 - r][m - 1 - c];
        out[r].push(f.charAt(0) === "k" ? (s ? { t: s.t, o: s.o, r: s.r } : null) : kt(s, f));
      }
    }
    return out;
  }
  function gk(g) { return g.map(function (row) { return row.map(function (t) { return t ? t.t + (YONSUZ[t.t] ? 0 : t.o) + t.r : "-"; }).join(","); }).join("/"); }

  function karo(t, x, y, w) {
    if (!t) return "";
    var p = w * 0.12, o = t.o || 0;
    var st = ' fill="' + BQ.RENK[t.r] + '" stroke="' + BQ.CIZ + '" stroke-width="' + f1(Math.max(1.5, w * 0.055)) + '" stroke-linejoin="round"';
    var K = [[x + p, y + p], [x + w - p, y + p], [x + w - p, y + w - p], [x + p, y + w - p]];
    if (t.t === "kare") return '<rect x="' + f1(x + p) + '" y="' + f1(y + p) + '" width="' + f1(w - 2 * p) + '" height="' + f1(w - 2 * p) + '" rx="' + f1(w * 0.1) + '"' + st + "/>";
    if (t.t === "daire") return '<circle cx="' + f1(x + w / 2) + '" cy="' + f1(y + w / 2) + '" r="' + f1(w / 2 - p) + '"' + st + "/>";
    return '<polygon points="' + BQ.poly([K[o], K[(o + 1) % 4], K[(o + 3) % 4]]) + '"' + st + "/>";
  }
  function izgaraCiz(g, x, y, cs) {
    var n = g.length, m = g[0].length, W = m * cs, H = n * cs, s = "", i;
    s += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(W) + '" height="' + f1(H) + '" rx="6" fill="#fff"/>';
    for (i = 1; i < m; i++) s += '<line x1="' + f1(x + i * cs) + '" y1="' + f1(y) + '" x2="' + f1(x + i * cs) + '" y2="' + f1(y + H) + '" stroke="#dde4f0" stroke-width="1.5"/>';
    for (i = 1; i < n; i++) s += '<line x1="' + f1(x) + '" y1="' + f1(y + i * cs) + '" x2="' + f1(x + W) + '" y2="' + f1(y + i * cs) + '" stroke="#dde4f0" stroke-width="1.5"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) s += karo(g[r][c], x + c * cs, y + r * cs, cs);
    return s + '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(W) + '" height="' + f1(H) + '" rx="6" fill="none" stroke="#9fb0cc" stroke-width="2"/>';
  }
  function aynaCubuk(x, y, w, h) {
    var s = '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="4" fill="#cfe9fb" stroke="#6fa8d6" stroke-width="2"/>';
    var dik = h > w;
    for (var k = 0; k < 2; k++) {
      var t = 0.25 + k * 0.35;
      s += dik ? '<line x1="' + f1(x + 2) + '" y1="' + f1(y + h * t + 10) + '" x2="' + f1(x + w - 2) + '" y2="' + f1(y + h * t) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'
        : '<line x1="' + f1(x + w * t) + '" y1="' + f1(y + h - 2) + '" x2="' + f1(x + w * t + 10) + '" y2="' + f1(y + 2) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>';
    }
    return s;
  }
  function aynaFig(g, eksen, sag, etiket) {
    var n = g.length, cs = n === 4 ? 38 : 32, gw = n * cs, pad = 16, ara = 14, bar = 12, s, W, H;
    if (eksen === "dikey") {
      W = pad + gw + ara + bar + ara + gw + pad; H = pad + gw + 30;
      var bx = pad + gw + ara, qx = bx + bar + ara;
      s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>' + izgaraCiz(g, pad, pad, cs) + aynaCubuk(bx, pad - 6, bar, gw + 12) +
        BQ.yazi(bx + bar / 2, pad + gw + 24, "ayna", { boy: 14, renk: "#4f7fae" });
      s += sag ? izgaraCiz(sag, qx, pad, cs) + '<rect x="' + f1(qx - 3) + '" y="' + f1(pad - 3) + '" width="' + f1(gw + 6) + '" height="' + f1(gw + 6) + '" rx="8" fill="none" stroke="#1fa866" stroke-width="3.5"/>'
        : BQ.kutu(qx, pad, gw, "", { soru: true });
    } else {
      W = 290; H = pad + gw + ara + bar + ara + gw + pad;
      var x0 = (W - gw) / 2, by = pad + gw + ara, qy = by + bar + ara;
      s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>' + izgaraCiz(g, x0, pad, cs) + aynaCubuk(x0 - 6, by, gw + 12, bar) +
        BQ.yazi(x0 + gw + 12, by + bar / 2 + 5, "ayna", { boy: 14, renk: "#4f7fae", anchor: "start" });
      s += sag ? izgaraCiz(sag, x0, qy, cs) + '<rect x="' + f1(x0 - 3) + '" y="' + f1(qy - 3) + '" width="' + f1(gw + 6) + '" height="' + f1(gw + 6) + '" rx="8" fill="none" stroke="#1fa866" stroke-width="3.5"/>'
        : BQ.kutu(x0, qy, gw, "", { soru: true });
    }
    return BQ.svg(W, H, s, etiket);
  }
  function aynaSik(g) {
    var n = g.length, cs = n === 4 ? 21 : 17, gw = n * cs;
    return BQ.tekKutu(izgaraCiz(g, 4 + (100 - gw) / 2, 4 + (100 - gw) / 2, cs), 100);
  }

  var AYNA_SEV = {
    1: { n: 4, adet: [3, 4], tur: ["kare"], renk: 2 },
    2: { n: 4, adet: [5, 6], tur: ["kare", "kare", "daire"], renk: 3 },
    3: { n: 5, adet: [6, 7], tur: ["kare", "ucgen", "ucgen", "daire"], renk: 3 }
  };
  function aynaGen(rnd, sv) {
    var S = AYNA_SEV[sv], n = S.n, renk = rnd.sample(BQ.RENKLER, S.renk), g = [], hucre = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); for (c = 0; c < n; c++) { g[r].push(null); hucre.push([r, c]); } }
    var ucgen = 0;
    rnd.sample(hucre, rnd.int(S.adet[0], S.adet[1])).forEach(function (h) {
      var t = rnd.pick(S.tur);
      if (t === "ucgen") ucgen++;
      g[h[0]][h[1]] = { t: t, o: YONSUZ[t] ? 0 : rnd.int(0, 3), r: rnd.pick(renk) };
    });
    if (sv === 3 && ucgen < 2) return null;
    // desen her iki yarıya yayılsın (aynaya yakın ve uzak parçalar olsun)
    var eksen = rnd.pick(["dikey", "yatay"]), d = eksen === "dikey" ? "lr" : "ud", y = d === "lr" ? "ud" : "lr";
    var yakin = 0, uzak = 0;
    for (r = 0; r < n; r++) for (c = 0; c < n; c++) if (g[r][c]) { var u = d === "lr" ? c : r; if (u >= n - 2) yakin++; if (u <= 1) uzak++; }
    if (!yakin || !uzak) return null;
    var dogru = gT(g, d);
    var celd = [{ g: g, ne: "kendi" }, { g: gT(g, y), ne: "eksen" }, { g: gT(g, "r180"), ne: "yarim" }];
    if (sv === 3) celd = [{ g: gT(g, "k" + d), ne: "kopya" }].concat(rnd.sample(celd, 2));
    // hepsi birbirinden ve doğrudan farklı; desen eksene göre simetrik olmasın
    var tum = [dogru, g, gT(g, y), gT(g, "r180")].concat(sv === 3 ? [gT(g, "k" + d)] : []), es = {};
    tum.forEach(function (x) { es[gk(x)] = 1; });
    if (Object.keys(es).length !== tum.length) return null;
    var liste = [{ g: dogru, ne: "dogru" }].concat(celd);
    var sk = BQ.siklar(rnd, liste[0], liste.slice(1), function (x) { return gk(x.g); });
    if (!sk) return null;
    var q = {
      soru: eksen === "dikey" ? "Desenin aynadaki görüntüsü hangisi?" : "Desenin alttaki aynada görüntüsü hangisi?",
      fig: aynaFig(g, eksen, null, "Renkli kare deseni ve " + (eksen === "dikey" ? "sağında" : "altında") + " bir ayna; ayna tarafında soru işaretli kutu"),
      tur: "svg",
      sec: sk.liste.map(function (x) { return aynaSik(x.g); }),
      dogru: sk.dogru,
      data: { tip: "ayna", desen: g, eksen: eksen, siklar: sk.liste.map(function (x) { return x.g; }) },
      cozumFig: aynaFig(g, eksen, dogru, "Desen ve aynadaki görüntüsü")
    };
    q.adim = aynaAciklama(g, eksen, sk.liste, sk.dogru, ucgen > 0);
    return q;
  }
  function aynaAciklama(g, eksen, sik, dg, ucgenVar) {
    var n = g.length, a = [], dik = eksen === "dikey", en = null;
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (g[r][c]) {
      var u = dik ? c : r;
      if (!en || u > en.u) en = { u: u, r: r, c: c, t: g[r][c] };
    }
    var k = n - en.u, ad = en.t.r + " " + TUR_AD[en.t.t];
    a.push("Ayna deseni kopyalamaz, <b>tersten</b> gösterir: aynaya yakın olan aynada da yakın, uzak olan uzakta kalır.");
    a.push(dik ? "Aynaya en yakın parça <b>" + ad + "</b> (sağdan " + k + ". sütun). Aynada da aynaya en yakın yerde, <b>soldan " + k + ". sütunda</b> görünür; satırı değişmez."
      : "Aynaya en yakın parça <b>" + ad + "</b> (alttan " + k + ". satır). Aynada da aynaya en yakın yerde, <b>üstten " + k + ". satırda</b> görünür; sütunu değişmez.");
    if (ucgenVar) a.push(dik ? "Üçgenlerin sivri köşeleri de ters döner: sağa bakan köşe aynada <b>sola</b> bakar, yukarı-aşağı değişmez." : "Üçgenlerin sivri köşeleri de ters döner: yukarı bakan köşe aynada <b>aşağı</b> bakar, sağ-sol değişmez.");
    var AD = { kendi: "desenin aynısı, yani kopyalanmış", eksen: dik ? "üst ile alt yer değiştirmiş; yanlış yönde çevrilmiş" : "sağ ile sol yer değiştirmiş; yanlış yönde çevrilmiş", yarim: "desen yarım tur döndürülmüş", kopya: "parçalar doğru yerde ama üçgenler ters çevrilmemiş" };
    var el = [];
    sik.forEach(function (x, i) { if (i !== dg) el.push(BQ.HARF[i] + ": " + AD[x.ne]); });
    a.push("Yanlış şıklar: " + el.join("; ") + ".");
    a.push("Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  // ---------------------------------------------------------------- katla, del, aç
  var N = 4;
  var DLR = [0, 3, 2, 1], DUD = [2, 1, 0, 3];  // üçgen deliğin baktığı yön: 0 yukarı, 1 sağ, 2 aşağı, 3 sol
  function dAyna(h, ek) { return ek === "v" ? { r: h.r, c: N - 1 - h.c, s: h.s, d: h.s === "ucgen" ? DLR[h.d] : 0 } : { r: N - 1 - h.r, c: h.c, s: h.s, d: h.s === "ucgen" ? DUD[h.d] : 0 }; }
  function dAynaYer(h, ek) { return ek === "v" ? { r: h.r, c: N - 1 - h.c, s: h.s, d: h.d } : { r: N - 1 - h.r, c: h.c, s: h.s, d: h.d }; }
  function dKaydir(h, ek) { var y = N / 2; return ek === "v" ? { r: h.r, c: h.c < y ? h.c + y : h.c - y, s: h.s, d: h.d } : { r: h.r < y ? h.r + y : h.r - y, c: h.c, s: h.s, d: h.d }; }
  function ac(H, eksenler, fn) {
    var l = H.slice();
    for (var i = eksenler.length - 1; i >= 0; i--) l = l.concat(l.map(function (h) { return fn(h, eksenler[i]); }));
    return l;
  }
  function dk(l) {
    var s = l.map(function (h) { return h.r + "" + h.c + h.s + (h.s === "ucgen" ? h.d : 0); }), es = {};
    s.forEach(function (x) { es[x] = 1; });
    return Object.keys(es).sort().join("|");
  }
  function bolge(katlar) {
    var b = { r0: 0, r1: N - 1, c0: 0, c1: N - 1 }, y = N / 2;
    katlar.forEach(function (k) {
      if (k.eksen === "v") { if (k.kal === "sol") b.c1 = y - 1; else b.c0 = y; }
      else { if (k.kal === "ust") b.r1 = y - 1; else b.r0 = y; }
    });
    return b;
  }
  function delikCiz(h, cx, cy, cs, dolgu) {
    var st = ' fill="' + dolgu + '" stroke="' + BQ.CIZ + '" stroke-width="' + f1(Math.max(1.5, cs * 0.075)) + '" stroke-linejoin="round"';
    if (h.s === "daire") return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(cs * 0.27) + '"' + st + "/>";
    if (h.s === "kare") { var a = cs * 0.25; return '<rect x="' + f1(cx - a) + '" y="' + f1(cy - a) + '" width="' + f1(2 * a) + '" height="' + f1(2 * a) + '" rx="' + f1(cs * 0.05) + '"' + st + "/>"; }
    var R = cs * 0.33, P = [[0, -R], [R * 0.92, R * 0.72], [-R * 0.92, R * 0.72]], ang = h.d * Math.PI / 2;
    return '<polygon points="' + BQ.poly(P.map(function (p) { return [cx + p[0] * Math.cos(ang) - p[1] * Math.sin(ang), cy + p[0] * Math.sin(ang) + p[1] * Math.cos(ang) + (h.d === 0 ? R * 0.1 : h.d === 2 ? -R * 0.1 : 0)]; })) + '"' + st + "/>";
  }
  // kâğıt parçası: bölge b, sol üst (x,y), hücre cs; kat: katman sayısı; delikler; katlama (dikey/yatay kesikli çizgi + ok)
  function kagit(b, x, y, cs, o) {
    o = o || {};
    var w = (b.c1 - b.c0 + 1) * cs, h = (b.r1 - b.r0 + 1) * cs, s = "";
    if (o.kat > 1) s += '<rect x="' + f1(x + 4) + '" y="' + f1(y + 4) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="3" fill="' + KAGIT2 + '" stroke="' + BQ.CIZ + '" stroke-width="2"/>';
    if (o.kat > 2) s = '<rect x="' + f1(x + 8) + '" y="' + f1(y + 8) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="3" fill="' + KAGIT2 + '" stroke="' + BQ.CIZ + '" stroke-width="2"/>' + s;
    s += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="3" fill="' + KAGIT + '" stroke="' + BQ.CIZ + '" stroke-width="2"/>';
    if (o.kirisik) o.kirisik.forEach(function (e) {
      s += e === "v" ? '<line x1="' + f1(x + w / 2) + '" y1="' + f1(y + 3) + '" x2="' + f1(x + w / 2) + '" y2="' + f1(y + h - 3) + '" stroke="#d9c08a" stroke-width="1.6" stroke-dasharray="4 4"/>'
        : '<line x1="' + f1(x + 3) + '" y1="' + f1(y + h / 2) + '" x2="' + f1(x + w - 3) + '" y2="' + f1(y + h / 2) + '" stroke="#d9c08a" stroke-width="1.6" stroke-dasharray="4 4"/>';
    });
    if (o.katla) {
      var k = o.katla;
      if (k.eksen === "v") {
        var mx = x + w / 2, fx = k.kal === "sol" ? mx : x;
        s += '<rect x="' + f1(fx + 1) + '" y="' + f1(y + 1) + '" width="' + f1(w / 2 - 2) + '" height="' + f1(h - 2) + '" fill="' + KAT_ALAN + '"/>';
        s += '<line x1="' + f1(mx) + '" y1="' + f1(y - 6) + '" x2="' + f1(mx) + '" y2="' + f1(y + h + 6) + '" stroke="' + BQ.CIZ + '" stroke-width="2.2" stroke-dasharray="6 5"/>';
        var sx = k.kal === "sol" ? x + w * 0.75 : x + w * 0.25, ex = k.kal === "sol" ? x + w * 0.27 : x + w * 0.73;
        s += kavisOk([sx, y + h * 0.5], [mx, y - h * 0.12], [ex, y + h * 0.5]);
      } else {
        var my = y + h / 2, fy = k.kal === "ust" ? my : y;
        s += '<rect x="' + f1(x + 1) + '" y="' + f1(fy + 1) + '" width="' + f1(w - 2) + '" height="' + f1(h / 2 - 2) + '" fill="' + KAT_ALAN + '"/>';
        s += '<line x1="' + f1(x - 6) + '" y1="' + f1(my) + '" x2="' + f1(x + w + 6) + '" y2="' + f1(my) + '" stroke="' + BQ.CIZ + '" stroke-width="2.2" stroke-dasharray="6 5"/>';
        var sy = k.kal === "ust" ? y + h * 0.75 : y + h * 0.25, ey = k.kal === "ust" ? y + h * 0.27 : y + h * 0.73;
        s += kavisOk([x + w * 0.5, sy], [x + w * 1.12, my], [x + w * 0.5, ey]);
      }
      s += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="3" fill="none" stroke="' + BQ.CIZ + '" stroke-width="2"/>';
    }
    (o.delik || []).forEach(function (d) { s += delikCiz(d, x + (d.c - b.c0 + 0.5) * cs, y + (d.r - b.r0 + 0.5) * cs, cs, o.delikRenk || BQ.ZEMIN); });
    return s;
  }
  function kavisOk(a, k, b) {
    var renk = BQ.RENK.mavi, d = "M" + f1(a[0]) + "," + f1(a[1]) + " Q" + f1(k[0]) + "," + f1(k[1]) + " " + f1(b[0]) + "," + f1(b[1]);
    var tx = b[0] - k[0], ty = b[1] - k[1], L = Math.sqrt(tx * tx + ty * ty); tx /= L; ty /= L;
    var u = 9, P = [[b[0] + tx * 3, b[1] + ty * 3], [b[0] - tx * u + ty * u * 0.62, b[1] - ty * u - tx * u * 0.62], [b[0] - tx * u - ty * u * 0.62, b[1] - ty * u + tx * u * 0.62]];
    return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + renk + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<polygon points="' + BQ.poly(P) + '" fill="' + renk + '" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>';
  }
  function duzOk(x1, x2, y) {
    return '<line x1="' + f1(x1) + '" y1="' + f1(y) + '" x2="' + f1(x2 - 6) + '" y2="' + f1(y) + '" stroke="#9aa7c0" stroke-width="3" stroke-linecap="round"/>' +
      '<polygon points="' + BQ.poly([[x2, y], [x2 - 10, y - 6.5], [x2 - 10, y + 6.5]]) + '" fill="#9aa7c0"/>';
  }
  function katlaFig(katlar, delik, acik, etiket) {
    var S = 100, cs = S / N, pad = 16, ok = 40, top = 26, mid = top + S / 2, s = "", x = pad, adim = 1;
    var paneller = [], b = { r0: 0, r1: N - 1, c0: 0, c1: N - 1 };
    katlar.forEach(function (k, i) { paneller.push({ b: b, katla: k, kat: Math.pow(2, i), ad: adim++ + ". katla" }); b = bolge(katlar.slice(0, i + 1)); });
    paneller.push({ b: b, kat: Math.pow(2, katlar.length), delik: delik, ad: adim + ". del" });
    paneller.forEach(function (p, i) {
      var w = (p.b.c1 - p.b.c0 + 1) * cs, h = (p.b.r1 - p.b.r0 + 1) * cs;
      if (i) { s += duzOk(x + 4, x + ok - 8, mid); x += ok; }
      s += kagit(p.b, x, mid - h / 2, cs, { kat: p.kat, katla: p.katla, delik: p.delik });
      s += BQ.yazi(x + w / 2, top + S + 30, p.ad, { boy: 14, renk: "#55617d" });
      x += w;
    });
    s += duzOk(x + 4, x + ok - 8, mid); x += ok;
    if (acik) s += kagit({ r0: 0, r1: N - 1, c0: 0, c1: N - 1 }, x, top, cs, { kirisik: katlar.map(function (k) { return k.eksen; }), delik: acik }) +
      '<rect x="' + f1(x - 4) + '" y="' + f1(top - 4) + '" width="' + f1(S + 8) + '" height="' + f1(S + 8) + '" rx="7" fill="none" stroke="#1fa866" stroke-width="3.5"/>';
    else s += BQ.kutu(x, top, S, "", { soru: true });
    s += BQ.yazi(x + S / 2, top + S + 30, acik ? "aç" : "aç", { boy: 14, renk: "#55617d" });
    x += S + pad;
    var W = Math.max(300, x), H = top + S + 44;
    return BQ.svg(W, H, '<rect width="' + f1(W) + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>' + (W > x ? '<g transform="translate(' + f1((W - x) / 2) + ',0)">' + s + "</g>" : s), etiket);
  }
  function katlaSik(katlar, l) {
    return BQ.tekKutu(kagit({ r0: 0, r1: N - 1, c0: 0, c1: N - 1 }, 12, 12, 84 / N, { kirisik: katlar.map(function (k) { return k.eksen; }), delik: l, delikRenk: "#fff" }), 100);
  }

  var KATLA_SEV = { 1: { kat: 1, del: [1, 2], sek: ["daire"] }, 2: { kat: 1, del: [2, 3], sek: ["daire", "kare", "ucgen"] }, 3: { kat: 2, del: [1, 2], sek: ["daire", "ucgen", "kare"] } };
  function katlaGen(rnd, sv) {
    var S = KATLA_SEV[sv], e1 = rnd.pick(["v", "h"]), katlar = [{ eksen: e1, kal: e1 === "v" ? rnd.pick(["sol", "sag"]) : rnd.pick(["ust", "alt"]) }];
    if (S.kat === 2) { var e2 = e1 === "v" ? "h" : "v"; katlar.push({ eksen: e2, kal: e2 === "v" ? rnd.pick(["sol", "sag"]) : rnd.pick(["ust", "alt"]) }); }
    var b = bolge(katlar), hucre = [];
    for (var r = b.r0; r <= b.r1; r++) for (var c = b.c0; c <= b.c1; c++) hucre.push([r, c]);
    var ucgen = 0;
    var delik = rnd.sample(hucre, rnd.int(S.del[0], S.del[1])).map(function (h) {
      var s = rnd.pick(S.sek); if (s === "ucgen") ucgen++;
      return { r: h[0], c: h[1], s: s, d: s === "ucgen" ? rnd.int(0, 3) : 0 };
    });
    if (sv === 3 && !ucgen && rnd.chance(0.5)) return null;
    var eks = katlar.map(function (k) { return k.eksen; });
    var dogru = ac(delik, eks, dAyna), celd;
    if (S.kat === 1) {
      var yan = e1 === "v" ? "h" : "v";
      celd = [
        { l: delik, ne: "yarim" },
        { l: ac(delik, eks, dKaydir), ne: "kaydir" },
        { l: ac(delik, [yan], dAyna), ne: "eksen" },
        { l: ac(delik, [e1, yan], dAyna), ne: "dort" }
      ];
      if (ucgen) celd.push({ l: ac(delik, eks, dAynaYer), ne: "cevirme" });
      celd = rnd.shuffle(celd);
      if (sv === 1) celd.sort(function (a, b) { return (a.ne === "kaydir" ? 0 : 1) - (b.ne === "kaydir" ? 0 : 1); });
      else if (ucgen) celd.sort(function (a, b) { return (a.ne === "cevirme" ? 0 : 1) - (b.ne === "cevirme" ? 0 : 1); });
    } else {
      celd = rnd.shuffle([
        { l: ac(delik, [eks[1]], dAyna), ne: "son" },
        { l: ac(delik, [eks[0]], dAyna), ne: "ilk" },
        { l: ac(delik, eks, dKaydir), ne: "kaydir4" },
        { l: delik.concat(delik.map(function (h) { return dAyna(dAyna(h, "v"), "h"); })), ne: "capraz" }
      ]);
      if (ucgen) celd.unshift({ l: ac(delik, eks, dAynaYer), ne: "cevirme" });
      else celd.sort(function (a, b) { return (a.ne === "kaydir4" ? 0 : 1) - (b.ne === "kaydir4" ? 0 : 1); });
    }
    var sk = BQ.siklar(rnd, { l: dogru, ne: "dogru" }, celd, function (x) { return dk(x.l); });
    if (!sk) return null;
    var q = {
      soru: "Kâğıt açılınca nasıl görünür?",
      fig: katlaFig(katlar, delik, null, "Kare kâğıt " + (katlar.length === 1 ? "bir kez" : "iki kez") + " katlanıyor, katlıyken delik açılıyor"),
      tur: "svg",
      sec: sk.liste.map(function (x) { return katlaSik(katlar, x.l); }),
      dogru: sk.dogru,
      data: { tip: "katla", n: N, katlar: katlar, delik: delik, siklar: sk.liste.map(function (x) { return x.l; }) },
      cozumFig: katlaFig(katlar, delik, dogru, "Kâğıt açılmış hâli")
    };
    q.adim = katlaAciklama(katlar, delik, sk.liste, sk.dogru, ucgen > 0);
    return q;
  }
  function katlaAciklama(katlar, delik, sik, dg, ucgenVar) {
    var a = [], iki = katlar.length === 2;
    a.push("Kâğıdı zihninde geri aç: <b>katlama çizgisi bir ayna gibidir</b>. Delik katlı kâğıdın bütün katlarını birden deler.");
    a.push(iki ? "İki kez katlandığı için önce son katı, sonra ilk katı aç. Her açışta delik sayısı ikiye katlanır: " + delik.length + " delik → <b>" + delik.length * 4 + " delik</b>."
      : "Açınca her deliğin bir eşi çizginin öbür tarafında olur: " + delik.length + " delik → <b>" + delik.length * 2 + " delik</b>.");
    a.push("Çizgiye yakın delik öbür tarafta da çizgiye yakın, uzak olan uzak kalır. Yani delikler kaydırılıp kopyalanmaz, <b>tersten</b> yerleşir." +
      (ucgenVar ? " Üçgen deliklerin sivri ucu da ters döner." : ""));
    var AD = { yarim: "yalnızca katlı hâldeki delikler var, öbür yarı unutulmuş", kaydir: "delikler aynalanmadan kaydırılıp kopyalanmış", eksen: "delikler yanlış çizgiye göre açılmış", dort: "kâğıt iki kez katlanmış gibi fazla delik var",
      cevirme: "delikler doğru yerde ama üçgenlerin ucu ters dönmemiş", son: "yalnızca son kat açılmış", ilk: "yalnızca ilk kat açılmış", kaydir4: "delikler aynalanmadan kaydırılıp kopyalanmış", capraz: "delikler çapraz köşeye taşınmış, yanlara açılmamış" };
    var el = [];
    sik.forEach(function (x, i) { if (i !== dg) el.push(BQ.HARF[i] + ": " + AD[x.ne]); });
    a.push("Yanlış şıklar: " + el.join("; ") + ".");
    a.push("Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  // ---------------------------------------------------------------- kayıt ve bağımsız çözücü
  function gen(rnd, sv) { return rnd.chance(0.5) ? aynaGen(rnd, sv) : katlaGen(rnd, sv); }
  function tekEsle(beklenen, siklar, anahtar) {
    var es = [];
    siklar.forEach(function (s, i) { if (anahtar(s) === beklenen) es.push(i); });
    if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
    return es[0];
  }
  BQ.reg("katlama", {
    ad: "Katlama ve ayna",
    gen: gen,
    coz: function (q) {
      var d = q.data;
      if (d.tip === "ayna") {
        // aynayı hücre hücre yeniden hesapla: sütun (ya da satır) ters çevrilir, üçgen köşeleri aynalanır
        var g = d.desen, n = g.length, m = g[0].length, LR = { 0: 1, 1: 0, 2: 3, 3: 2 }, UD = { 0: 3, 3: 0, 1: 2, 2: 1 }, out = [];
        for (var r = 0; r < n; r++) {
          out.push([]);
          for (var c = 0; c < m; c++) {
            var t = d.eksen === "dikey" ? g[r][m - 1 - c] : g[n - 1 - r][c];
            out[r].push(t ? { t: t.t, o: t.t === "ucgen" ? (d.eksen === "dikey" ? LR : UD)[t.o] : 0, r: t.r } : null);
          }
        }
        if (gk(out) === gk(g)) throw new Error("desen simetrik");
        return tekEsle(gk(out), d.siklar, gk);
      }
      // katla: delikleri kâğıt kâğıt aç (son kattan ilk kata)
      var Nn = d.n, l = d.delik.map(function (h) { return { r: h.r, c: h.c, s: h.s, d: h.d }; });
      for (var i = d.katlar.length - 1; i >= 0; i--) {
        var e = d.katlar[i].eksen;
        l = l.concat(l.map(function (h) {
          return e === "v" ? { r: h.r, c: Nn - 1 - h.c, s: h.s, d: h.s === "ucgen" ? [0, 3, 2, 1][h.d] : 0 } : { r: Nn - 1 - h.r, c: h.c, s: h.s, d: h.s === "ucgen" ? [2, 1, 0, 3][h.d] : 0 };
        }));
      }
      return tekEsle(dk(l), d.siklar, dk);
    }
  });
})(window.BQ);

;/* Küp sayma — izometrik küp yığını. Kural: havada küp durmaz (üstte küp varsa altı doludur).
   Yükseklikler izleyiciye doğru artmaz → her sütunun tepesi görünür, gizli küp belirsizliği yok. */
(function (BQ) {
  "use strict";
  var C = Math.cos(Math.PI / 6);
  var PAL = [
    { ust: "#b4eff4", sol: "#3cc3d4", sag: "#1a8aa0" },
    { ust: "#c6dbff", sol: "#5d93f5", sag: "#3062c7" }
  ];

  // ---------------------------------------------------------------- görünürlük (izometrik üçgen ızgarasında kesin)
  // Her küp yüzü 2 ızgara üçgenidir. Bir üçgenin sahibi, onu örten en öndeki küptür (derinlik X+Y+Z).
  function ucgenler(X, Y, Z) {
    function P(x, y, z) { return [x - y, x + y - 2 * z]; }
    var a = P(X, Y, Z + 1), b = P(X + 1, Y, Z + 1), c = P(X + 1, Y + 1, Z + 1), d = P(X, Y + 1, Z + 1),
      e = P(X + 1, Y, Z), f = P(X + 1, Y + 1, Z), g = P(X, Y + 1, Z);
    function k(p, q, r) { return (p[0] + q[0] + r[0]) + "," + (p[1] + q[1] + r[1]); }
    return [{ k: k(a, b, c), y: "ust" }, { k: k(a, c, d), y: "ust" }, { k: k(e, f, c), y: "sag" }, { k: k(e, c, b), y: "sag" },
      { k: k(g, f, c), y: "sol" }, { k: k(g, c, d), y: "sol" }];
  }
  function gorunum(h) {
    var own = {}, X, Y, Z;
    for (X = 0; X < h.length; X++) for (Y = 0; Y < h[X].length; Y++) for (Z = 0; Z < h[X][Y]; Z++) {
      var id = X + "," + Y + "," + Z, dd = X + Y + Z;
      ucgenler(X, Y, Z).forEach(function (t) {
        var o = own[t.k];
        if (!o || dd > o.d) own[t.k] = { d: dd, id: id, y: t.y, tie: false };
        else if (dd === o.d && o.id !== id) o.tie = true;
      });
    }
    var kup = {};
    Object.keys(own).forEach(function (k) {
      var o = own[k];
      if (o.tie) throw new Error("örtüşme belirsiz");
      (kup[o.id] = kup[o.id] || { ust: 0, sol: 0, sag: 0 })[o.y]++;
    });
    return kup;
  }
  // bağımsız sayım: tepeler görünür mü, kaç küp görünüyor
  function incele(h) {
    var kup = gorunum(h), top = 0;
    for (var X = 0; X < h.length; X++) for (var Y = 0; Y < h[X].length; Y++) {
      var H = h[X][Y];
      if (H < 0) throw new Error("negatif");
      top += H;
      if (H > 0) { var t = kup[X + "," + Y + "," + (H - 1)]; if (!t || t.ust !== 2) throw new Error("tepe görünmüyor " + X + "," + Y); }
    }
    var gor = 0;
    Object.keys(kup).forEach(function (id) {
      var t = kup[id];
      if (t.ust + t.sol + t.sag > 0) {
        gor++;
        if (t.ust < 2 && t.sol < 2 && t.sag < 2) throw new Error("yarım görünen küp " + id);
      }
    });
    return { toplam: top, gorunen: gor };
  }

  // ---------------------------------------------------------------- çizim
  function ciz(h, pal, o) {
    o = o || {};
    var nx = h.length, ny = h[0].length, hm = 0, X, Y, Z;
    h.forEach(function (r) { r.forEach(function (v) { hm = Math.max(hm, v); }); });
    var s = o.s || (nx + ny >= 6 ? 50 : nx + ny === 5 ? 54 : 58);
    var pad = 18, alt = o.yazi ? 46 : 0;
    var gw = (nx + ny) * C * s, W = Math.max(280, gw + 2 * pad);
    var ox = W / 2 + (ny - nx) * C * s / 2, oy = pad + hm * s;
    var H = oy + (nx + ny) * 0.5 * s + pad + alt;
    function P(x, y, z) { return [ox + (x - y) * C * s, oy + (x + y) * 0.5 * s - z * s]; }
    var g = '<rect width="' + BQ.f1(W) + '" height="' + BQ.f1(H) + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    // zemin plakası
    g += '<polygon points="' + BQ.poly([P(0, 0, 0), P(nx, 0, 0), P(nx, ny, 0), P(0, ny, 0)]) + '" fill="#dbe3f0" stroke="#aebbd3" stroke-width="2" stroke-linejoin="round"/>';
    for (X = 1; X < nx; X++) g += '<line x1="' + BQ.f1(P(X, 0, 0)[0]) + '" y1="' + BQ.f1(P(X, 0, 0)[1]) + '" x2="' + BQ.f1(P(X, ny, 0)[0]) + '" y2="' + BQ.f1(P(X, ny, 0)[1]) + '" stroke="#c3cee0" stroke-width="1.4"/>';
    for (Y = 1; Y < ny; Y++) g += '<line x1="' + BQ.f1(P(0, Y, 0)[0]) + '" y1="' + BQ.f1(P(0, Y, 0)[1]) + '" x2="' + BQ.f1(P(nx, Y, 0)[0]) + '" y2="' + BQ.f1(P(nx, Y, 0)[1]) + '" stroke="#c3cee0" stroke-width="1.4"/>';
    var kl = [];
    for (X = 0; X < nx; X++) for (Y = 0; Y < ny; Y++) for (Z = 0; Z < h[X][Y]; Z++) kl.push([X, Y, Z]);
    kl.sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]); });
    var st = ' stroke="' + BQ.CIZ + '" stroke-width="1.8" stroke-linejoin="round"';
    kl.forEach(function (k) {
      var x = k[0], y = k[1], z = k[2];
      g += '<polygon points="' + BQ.poly([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)]) + '" fill="' + pal.ust + '"' + st + "/>";
      g += '<polygon points="' + BQ.poly([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)]) + '" fill="' + pal.sol + '"' + st + "/>";
      g += '<polygon points="' + BQ.poly([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)]) + '" fill="' + pal.sag + '"' + st + "/>";
    });
    if (o.sayilar) {
      for (X = 0; X < nx; X++) for (Y = 0; Y < ny; Y++) if (h[X][Y] > 0) {
        var c = P(X + 0.5, Y + 0.5, h[X][Y]);
        g += '<circle cx="' + BQ.f1(c[0]) + '" cy="' + BQ.f1(c[1]) + '" r="' + BQ.f1(s * 0.27) + '" fill="#fff" stroke="' + BQ.CIZ + '" stroke-width="1.6"/>' +
          BQ.yazi(c[0], c[1] + s * 0.13, String(h[X][Y]), { boy: BQ.f1(s * 0.36), kalin: 900 });
      }
    }
    if (o.yazi) g += BQ.yazi(W / 2, H - pad - 6, o.yazi, { boy: BQ.f1(Math.min(24, (W - 28) / (o.yazi.length * 0.62))), kalin: 900 });
    return BQ.svg(W, H, g, o.etiket);
  }

  // ---------------------------------------------------------------- üretici
  var SEV = {
    1: { boy: [[2, 2], [2, 3], [3, 2]], hm: 2, tip: ["say"], top: [5, 9] },
    2: { boy: [[2, 3], [3, 2], [3, 3]], hm: 3, tip: ["say"], top: [8, 15] },
    3: { boy: [[3, 3]], hm: 4, tip: ["say", "tamamla", "gizli"], top: [13, 24] }
  };
  function sutunlar(h) { var l = []; h.forEach(function (r) { r.forEach(function (v) { if (v > 0) l.push(v); }); }); return l; }

  function gen(rnd, sv) {
    var S = SEV[sv], tip = rnd.pick(S.tip), b = rnd.pick(S.boy), nx = b[0], ny = b[1];
    var hm = tip === "tamamla" ? 3 : S.hm, h = [], X, Y;
    for (X = 0; X < nx; X++) {
      h.push([]);
      for (Y = 0; Y < ny; Y++) {
        var m = hm;
        if (X > 0) m = Math.min(m, h[X - 1][Y]);
        if (Y > 0) m = Math.min(m, h[X][Y - 1]);
        var lo = X === 0 && Y === 0 ? Math.max(2, hm - 1) : Math.max(sv === 1 ? 1 : 0, m - 2);
        h[X].push(m < lo ? m : rnd.int(lo, m));
      }
    }
    // ön köşe boş kalmasın diye en az 2 satır ve 2 sütun dolu olsun
    if (h[nx - 1][0] === 0 || h[0][ny - 1] === 0) return null;
    var iz;
    try { iz = incele(h); } catch (e) { return null; }
    var N = iz.toplam, G = iz.gorunen, gizli = N - G;
    var tr = tip === "tamamla" ? [12, 22] : S.top;
    if (N < tr[0] || N > tr[1]) return null;
    if (gizli < 1) return null;
    if (tip === "gizli" && (gizli < 2 || gizli > 8)) return null;
    var ans, celd, soru;
    if (tip === "say") { ans = N; celd = [G].concat(rnd.shuffle([N + 1, N - 1, N + 2, N - 2])); soru = "Yapıda kaç küp var? (Havada küp durmaz.)"; }
    else if (tip === "tamamla") { ans = 27 - N; celd = [27 - G].concat(rnd.shuffle([ans + 1, ans - 1, ans + 2, ans - 2])); soru = "Bu yapıyı 3×3×3 büyük küpe tamamlamak için kaç küp daha gerekir?"; }
    else { ans = gizli; celd = [G].concat(rnd.shuffle([ans + 1, ans - 1, ans + 2, ans - 2])); soru = "Bu yapıda kaç küp görünmüyor? (Havada küp durmaz.)"; }
    celd = celd.filter(function (v) { return v >= (tip === "say" ? 1 : 0) && v !== ans; }).map(String);
    var sk = BQ.siklar(rnd, String(ans), celd);
    if (!sk) return null;
    var pal = rnd.pick(PAL), sl = sutunlar(h);
    var katlar = [];
    for (var z = 1; z <= 4; z++) { var n = sl.filter(function (v) { return v >= z; }).length; if (n) katlar.push(n); }
    var toplamYazi = sl.join("+") + " = " + N;
    var cyazi = tip === "say" ? toplamYazi : tip === "tamamla" ? "27 − " + N + " = " + ans : N + " − " + G + " görünen = " + ans;
    var q = {
      soru: soru,
      fig: ciz(h, pal, { etiket: "İzometrik küp yapısı, " + nx + "×" + ny + " taban" }),
      tur: "metin",
      sec: sk.liste,
      dogru: sk.dogru,
      data: { h: h, tip: tip, siklar: sk.liste },
      cozumFig: ciz(h, pal, { sayilar: true, yazi: cyazi })
    };
    var a = ["Kural: <b>havada küp durmaz</b>. Üstte bir küp görüyorsan altındaki her yer de doludur; arkada ve altta kalan küpler de sayılır.",
      "Sütun sütun say: her sütunun tepesine bak ve kaç kat yüksek olduğunu bul. Çözüm resminde her tepeye yükseklik yazıldı: " + toplamYazi + ".",
      "Kat kat da sayabilirsin: " + katlar.map(function (n, i) { return (i === 0 ? "zemin katta " : (i + 1) + ". katta ") + n; }).join(", ") + " küp var. Toplam <b>" + N + "</b> küp."];
    if (tip === "say") a.push("Yalnız görünen küpleri sayan <b>" + G + "</b> der; ama " + gizli + " küp arkada ya da altta saklı.");
    else if (tip === "tamamla") a.push("3×3×3 büyük küpte 3 × 3 × 3 = <b>27</b> küp olur. Eksik olan: 27 − " + N + " = <b>" + ans + "</b>.");
    else a.push("Görünen küpler: <b>" + G + "</b>. Görünmeyenler: " + N + " − " + G + " = <b>" + ans + "</b>.");
    a.push("Doğru cevap <b>" + BQ.HARF[sk.dogru] + "</b>.");
    q.adim = a;
    return q;
  }

  BQ.reg("kup", {
    ad: "Küp sayma",
    gen: gen,
    coz: function (q) {
      var d = q.data, h = d.h, iz = incele(h), ans;
      // havada küp durmaz: yükseklik gösterimi zaten bunu sağlar; boyut ve tip kontrolü
      if (d.tip === "say") ans = iz.toplam;
      else if (d.tip === "tamamla") {
        if (h.length !== 3 || h.some(function (r) { return r.length !== 3 || r.some(function (v) { return v > 3; }); })) throw new Error("3×3×3'e sığmıyor");
        ans = 27 - iz.toplam;
      } else if (d.tip === "gizli") ans = iz.toplam - iz.gorunen;
      else throw new Error("tip?");
      var es = d.siklar.map(function (s, i) { return +s === ans ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Matris (eksik parçayı bul) — 3×3 tablo, özellik başına kural: sabit, satır, sütun, latin, latin2, ilerleme */
(function (BQ) {
  "use strict";
  var OZ = ["sekil", "renk", "sayi", "rot"];
  var OZ_AD = { sekil: "şekil", renk: "renk", sayi: "sayı", rot: "yön" };
  var YON = { 0: "yukarı", 90: "sağa", 180: "aşağı", 270: "sola" };
  function ad(oz, v) { return oz === "sayi" ? v + " tane" : oz === "rot" ? YON[((v % 360) + 360) % 360] : v; }
  function buyuk(s) { return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1); }

  // ---------------------------------------------------------------- bağımsız çözücü
  function grupTahmin(gor, f, hedef) {
    var grup = {}, k;
    for (k in gor) { var rc = k.split(",").map(Number), g = f(rc[0], rc[1]); if (g in grup && grup[g] !== gor[k]) return null; grup[g] = gor[k]; }
    var deg = Object.keys(grup).map(function (x) { return grup[x]; });
    var es = {}; deg.forEach(function (v) { es[v] = 1; });
    if (Object.keys(es).length < deg.length && Object.keys(es).length !== 1) return null;
    var hg = f(hedef[0], hedef[1]);
    return hg in grup ? grup[hg] : null;
  }
  function permTahmin(gor, satir, hedef) {
    var hat = {}, k;
    for (k in gor) { var rc = k.split(",").map(Number), key = satir ? rc[0] : rc[1]; (hat[key] = hat[key] || []).push(gor[k]); }
    var tam = Object.keys(hat).map(function (x) { return hat[x]; }).filter(function (v) { return v.length === 3; });
    if (!tam.length) return null;
    var kume = {}; tam[0].forEach(function (v) { kume[v] = 1; });
    if (Object.keys(kume).length !== 3) return null;
    for (k in hat) {
      var vs = hat[k], es = {};
      for (var i = 0; i < vs.length; i++) { if (es[vs[i]] || !kume[vs[i]]) return null; es[vs[i]] = 1; }
    }
    var h = hat[satir ? hedef[0] : hedef[1]], eksik = Object.keys(kume).filter(function (v) { return h.map(String).indexOf(String(v)) < 0; });
    if (eksik.length !== 1) return null;
    var orj = tam[0].filter(function (v) { return String(v) === eksik[0]; })[0];
    return orj === undefined ? (isNaN(+eksik[0]) ? eksik[0] : +eksik[0]) : orj;
  }
  function ilerleme(gor, hedef, mod) {
    function fark(x, y) { var d = y - x; return mod ? ((d % mod) + mod) % mod : d; }
    var bs = {}, ds = {}, k;
    for (k in gor) {
      var rc = k.split(",").map(Number), r = rc[0], c = rc[1];
      if ((r + "," + (c + 1)) in gor) bs[fark(gor[k], gor[r + "," + (c + 1)])] = 1;
      if (((r + 1) + "," + c) in gor) ds[fark(gor[k], gor[(r + 1) + "," + c])] = 1;
    }
    var b = Object.keys(bs), d = Object.keys(ds);
    if (b.length !== 1 || d.length !== 1) return null;
    b = +b[0]; d = +d[0];
    if (b === 0 && d === 0) return null;
    var v = gor["0,0"] + b * hedef[1] + d * hedef[0];
    return mod ? ((v % mod) + mod) % mod : v;
  }
  function coz3(iz) {
    var hedef = [2, 2], cevap = {}, gerekce = {};
    for (var oi = 0; oi < OZ.length; oi++) {
      var oz = OZ[oi], gor = {};
      for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) if (!(r === 2 && c === 2)) gor[r + "," + c] = iz[r][c][oz];
      var vals = Object.keys(gor).map(function (k) { return gor[k]; }), aday = [];
      if (vals.every(function (v) { return v === vals[0]; })) aday.push(["sabit", vals[0]]);
      else {
        [["satir", function (r, c) { return r; }], ["sutun", function (r, c) { return c; }], ["latin", function (r, c) { return (r + c) % 3; }], ["latin2", function (r, c) { return (c - r + 3) % 3; }]].forEach(function (a) {
          var t = grupTahmin(gor, a[1], hedef); if (t !== null) aday.push([a[0], t]);
        });
        [["satir_perm", true], ["sutun_perm", false]].forEach(function (a) { var t = permTahmin(gor, a[1], hedef); if (t !== null) aday.push([a[0], t]); });
        if (oz === "sayi" || oz === "rot") { var t = ilerleme(gor, hedef, oz === "rot" ? 360 : 0); if (t !== null && (oz !== "sayi" || (t >= 1 && t <= 5))) aday.push(["ilerleme", t]); }
      }
      var tah = {}; aday.forEach(function (a) { tah[String(a[1])] = a[1]; });
      var tk = Object.keys(tah);
      if (tk.length !== 1) return null;
      cevap[oz] = tah[tk[0]]; gerekce[oz] = aday;
    }
    return { cevap: cevap, gerekce: gerekce };
  }
  function esit(a, b) { return OZ.every(function (o) { return a[o] === b[o]; }); }

  // ---------------------------------------------------------------- üretici
  var SEV = {
    1: { aile: ["satir", "sutun"], degisen: 1, sayi: false },
    2: { aile: ["satir", "sutun", "latin", "latin2"], degisen: 2, sayi: true },
    3: { aile: ["latin", "latin2", "satir", "sutun", "ilerleme"], degisen: 3, sayi: true }
  };
  function ata(aile, p, r, c) {
    return aile === "sabit" ? p[0] : aile === "satir" ? p[r] : aile === "sutun" ? p[c] : aile === "latin" ? p[(r + c) % 3] : p[(c - r + 3) % 3];
  }
  function gen(rnd, sv) {
    var s = SEV[sv];
    var havuz = ["sekil", "renk"].concat(s.sayi ? ["sayi"] : []);
    if (sv === 3 && rnd.chance(0.3)) havuz = ["renk", "sayi", "rot"];
    if (sv === 2 && rnd.chance(0.15)) havuz = ["renk", "rot"];
    var degisen = rnd.sample(havuz, Math.min(s.degisen, havuz.length));
    var okMu = havuz.indexOf("rot") >= 0;
    var kural = {}, sabSekil = okMu ? "ok" : rnd.pick(BQ.SEKILLER);
    OZ.forEach(function (oz) {
      if (degisen.indexOf(oz) < 0) {
        kural[oz] = ["sabit", [oz === "sekil" ? sabSekil : oz === "renk" ? rnd.pick(BQ.RENKLER) : oz === "sayi" ? (sv > 1 ? rnd.pick([1, 1, 2]) : 1) : 0]];
        return;
      }
      var aile = rnd.pick(s.aile.filter(function (a) { return a !== "ilerleme" || oz === "sayi" || oz === "rot"; }));
      if (oz === "rot") aile = "ilerleme";
      if (aile === "ilerleme") {
        if (oz === "rot") kural[oz] = ["ilerleme", [rnd.pick([0, 90, 180, 270])].concat(sv === 2 ? rnd.pick([[90, 0], [0, 90]]) : rnd.pick([[90, 90], [90, 180], [270, 90], [90, 270]]))];
        else kural[oz] = ["ilerleme", [1].concat(rnd.pick([[1, 1], [1, 2], [0, 1], [1, 0]]))];
      } else {
        var hv = { sekil: BQ.SEKILLER, renk: BQ.RENKLER, sayi: [1, 2, 3, 4], rot: [0, 90, 180] }[oz];
        kural[oz] = [aile, rnd.sample(hv, 3)];
      }
    });
    var zor = degisen.filter(function (o) { return ["latin", "latin2", "ilerleme"].indexOf(kural[o][0]) >= 0; }).length;
    if ((sv === 2 && zor < 1) || (sv === 3 && zor < 2)) return null;
    var iz = [];
    for (var r = 0; r < 3; r++) {
      iz.push([]);
      for (var c = 0; c < 3; c++) {
        var h = {};
        OZ.forEach(function (oz) {
          var k = kural[oz];
          if (k[0] === "ilerleme") { var v = k[1][0] + k[1][1] * c + k[1][2] * r; h[oz] = oz === "rot" ? v % 360 : v; }
          else h[oz] = ata(k[0], k[1], r, c);
        });
        if (h.sayi < 1 || h.sayi > 5) return null;
        iz[r].push(h);
      }
    }
    var dogru = iz[2][2], cz = coz3(iz);
    if (!cz || !esit(cz.cevap, dogru)) return null;
    // çeldiriciler: her biri tek özelliği bozar; tablodaki değerlerden seçilir (yanıltıcı)
    var celd = [], sira = degisen.concat(OZ.filter(function (o) { return degisen.indexOf(o) < 0; }));
    sira.concat(sira).forEach(function (oz) {
      if (celd.length >= 3) return;
      if ((oz === "sekil" && okMu) || (oz === "rot" && !okMu)) return;
      var tablo = [];
      iz.forEach(function (row) { row.forEach(function (x) { if (tablo.indexOf(x[oz]) < 0) tablo.push(x[oz]); }); });
      var ek = { sekil: BQ.SEKILLER, renk: BQ.RENKLER, sayi: [1, 2, 3, 4, 5], rot: [0, 90, 180, 270] }[oz];
      var aday = rnd.shuffle(tablo.filter(function (v) { return v !== dogru[oz]; })).concat(rnd.shuffle(ek.filter(function (v) { return v !== dogru[oz] && tablo.indexOf(v) < 0; })));
      for (var i = 0; i < aday.length; i++) {
        var h = Object.assign({}, dogru); h[oz] = aday[i];
        if (!celd.some(function (x) { return esit(x, h); })) { celd.push(h); break; }
      }
    });
    var sk = BQ.siklar(rnd, dogru, celd, function (h) { return OZ.map(function (o) { return h[o]; }).join("|"); });
    if (!sk) return null;
    var gor = iz.map(function (row, r) { return row.map(function (x, c) { return r === 2 && c === 2 ? null : x; }); });
    var q = {
      soru: "Soru işaretli kutuya hangisi gelmeli?",
      fig: BQ.izgara(gor, { etiket: "3×3 matris, sağ alt kutu boş" }),
      tur: "svg",
      sec: sk.liste.map(function (h) { return BQ.tekKutu(BQ.hucre(h, 4, 4, 100), 100); }),
      dogru: sk.dogru,
      data: { iz: gor, siklar: sk.liste },
      cozumFig: BQ.izgara(iz, { vurgu: { "2,2": "#1fa866" } })
    };
    q.adim = aciklama(iz, kural, sk.liste, sk.dogru);
    return q;
  }

  function kuralCumle(oz, aile, iz) {
    var A = buyuk(OZ_AD[oz]);
    if (aile === "satir") return "<b>" + A + "</b> satır boyunca aynı kalıyor: 3. satırdaki kutuların hepsi <b>" + ad(oz, iz[2][0][oz]) + "</b>.";
    if (aile === "sutun") return "<b>" + A + "</b> sütun boyunca aynı kalıyor: 3. sütundaki kutuların hepsi <b>" + ad(oz, iz[0][2][oz]) + "</b>.";
    if (aile === "latin" || aile === "latin2") {
      var kume = [];
      for (var c = 0; c < 3; c++) kume.push(ad(oz, iz[0][c][oz]));
      return "<b>" + A + "</b>: her satırda ve her sütunda " + kume.join(", ") + " birer kez var. 3. satırda " + ad(oz, iz[2][0][oz]) + " ve " + ad(oz, iz[2][1][oz]) + " kullanılmış; eksik olan <b>" + ad(oz, iz[2][2][oz]) + "</b>.";
    }
    if (oz === "rot") return "<b>Yön</b>: ok her adımda aynı miktarda dönüyor (satırda soldan sağa, sütunda yukarıdan aşağıya). Bu dönüşü sürdürünce son kutuda ok <b>" + ad(oz, iz[2][2][oz]) + "</b> bakar.";
    return "<b>Sayı</b> düzenli artıyor: 1. satır " + [0, 1, 2].map(function (c) { return iz[0][c].sayi; }).join(", ") + "; 3. satır " + iz[2][0].sayi + ", " + iz[2][1].sayi + ", ? Son kutuda <b>" + iz[2][2].sayi + " tane</b> olmalı.";
  }
  function aciklama(iz, kural, sik, dg) {
    var deg = OZ.filter(function (o) { return kural[o][0] !== "sabit"; });
    var sab = OZ.filter(function (o) { return kural[o][0] === "sabit" && o !== "rot" && !(o === "sekil" && iz[0][0].sekil === "ok"); });
    var a = ["Tabloya özellik özellik bakalım. Değişenler: " + deg.map(function (o) { return OZ_AD[o]; }).join(", ") + "."];
    deg.forEach(function (o) { a.push(kuralCumle(o, kural[o][0], iz)); });
    if (sab.length) a.push("Hiç değişmeyenler: " + sab.map(function (o) { return OZ_AD[o] + " (" + ad(o, iz[0][0][o]) + ")"; }).join(", ") + ".");
    var d = iz[2][2];
    a.push("Aradığımız kutu: <b>" + [ad("sayi", d.sayi), d.renk, d.sekil].concat(d.sekil === "ok" ? [ad("rot", d.rot) + " bakan"] : []).join(", ") + "</b>.");
    var el = [];
    sik.forEach(function (h, i) { if (i !== dg) el.push(BQ.HARF[i] + " (" + OZ.filter(function (o) { return h[o] !== d[o]; }).map(function (o) { return OZ_AD[o]; }).join(" ve ") + " yanlış)"); });
    a.push("Şıkları eleyelim: " + el.join("; ") + ". Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  BQ.reg("matris", {
    ad: "Matris",
    gen: gen,
    coz: function (q) {
      // görünen tablodan (soru kutusu boş) kuralları yeniden bul, tek şık eşleşmeli
      var iz = q.data.iz.map(function (row) { return row.map(function (x) { return x ? Object.assign({}, x) : { sekil: "?", renk: "?", sayi: -1, rot: -1 }; }); });
      var cz = coz3(iz);
      if (!cz) throw new Error("kural belirsiz");
      var es = q.data.siklar.map(function (h, i) { return esit(h, cz.cevap) ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Örüntü — bir sıra kutu + "?" kutusu. Her özellik (şekil, renk, sayı, okun yönü, boyut) ayrı kurala uyar.
   3. seviyede bazen sayı örüntüsü (metin şıklı). Çözücü: her özellik için periyot 1..4 ve aritmetik ilerleme dener. */
(function (BQ) {
  "use strict";
  var OZ = ["sekil", "renk", "sayi", "rot", "boy"];
  var OZ_AD = { sekil: "şekil", renk: "renk", sayi: "sayı", rot: "okun yönü", boy: "boyut" };
  var BOY = [0.6, 0.8, 1.02], BOY_AD = ["küçük", "orta", "büyük"];
  var YON = { 0: "yukarı", 45: "sağ üst köşeye", 90: "sağa", 135: "sağ alt köşeye", 180: "aşağı", 225: "sol alt köşeye", 270: "sola", 315: "sol üst köşeye" };
  var KALIP = { AB: [0, 1], ABC: [0, 1, 2], AAB: [0, 0, 1], ABB: [0, 1, 1] };
  var KALIP_SEV = { 1: ["AB", "ABC"], 2: ["AB", "ABC", "AAB", "ABB"], 3: ["ABC", "AAB", "ABB", "AB"] };
  function buyuk(s) { return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1); }
  function ad(oz, v) { return oz === "sayi" ? v + " tane" : oz === "rot" ? YON[v] : oz === "boy" ? BOY_AD[v] : v; }
  function anahtar(h) { return OZ.map(function (o) { return h[o]; }).join("|"); }
  function esit(a, b) { return anahtar(a) === anahtar(b); }

  // ---------------------------------------------------------------- bağımsız çözücü
  function tahmin(oz, seq) {
    var t = {}, n = seq.length, p, i, ok;
    for (p = 1; p <= 4; p++) {
      if (n - p < 2) continue;
      ok = true;
      for (i = p; i < n; i++) if (seq[i] !== seq[i - p]) { ok = false; break; }
      if (ok) t[String(seq[n - p])] = seq[n - p];
    }
    if (oz === "sayi" || oz === "rot") {
      var mod = oz === "rot" ? 360 : 0, d = null;
      ok = true;
      for (i = 1; i < n; i++) {
        var f = seq[i] - seq[i - 1];
        if (mod) f = ((f % mod) + mod) % mod;
        if (d === null) d = f; else if (d !== f) { ok = false; break; }
      }
      if (ok) {
        var v = seq[n - 1] + d;
        if (mod) v = v % mod;
        if (oz === "sayi" && (v < 1 || v > 6)) return null;
        t[String(v)] = v;
      }
    }
    var k = Object.keys(t);
    return k.length === 1 ? t[k[0]] : null;
  }
  function cozGorsel(seq) {
    var c = {};
    for (var i = 0; i < OZ.length; i++) {
      var oz = OZ[i], v = tahmin(oz, seq.map(function (h) { return h[oz]; }));
      if (v === null) return null;
      c[oz] = v;
    }
    return c;
  }
  // sayı dizisi: aritmetik, geometrik, farkı artan, fark döngüsü, farkların oranı, iki öncekinin toplamı
  function cozSayi(d) {
    var t = {}, n = d.length, i, f = [], ok;
    for (i = 1; i < n; i++) f.push(d[i] - d[i - 1]);
    function sabit(a) { for (var j = 1; j < a.length; j++) if (a[j] !== a[0]) return false; return true; }
    if (sabit(f)) t[d[n - 1] + f[0]] = 1;
    if (d.every(function (x) { return x !== 0; })) {
      var r = d[1] / d[0];
      if (r === Math.round(r) && r !== 1 && d.every(function (x, j) { return j === 0 || x === d[j - 1] * r; })) t[d[n - 1] * r] = 1;
    }
    var f2 = [];
    for (i = 1; i < f.length; i++) f2.push(f[i] - f[i - 1]);
    if (f2.length >= 2 && sabit(f2) && f2[0] !== 0) t[d[n - 1] + f[f.length - 1] + f2[0]] = 1;
    if (f.length >= 4 && !sabit(f)) {
      ok = true;
      for (i = 2; i < f.length; i++) if (f[i] !== f[i - 2]) ok = false;
      if (ok) t[d[n - 1] + f[f.length - 2]] = 1;
    }
    if (f.every(function (x) { return x !== 0; }) && !sabit(f)) {
      var q = f[1] / f[0];
      if (q === Math.round(q) && f.every(function (x, j) { return j === 0 || x === f[j - 1] * q; })) t[d[n - 1] + f[f.length - 1] * q] = 1;
    }
    ok = n >= 4;
    for (i = 2; i < n; i++) if (d[i] !== d[i - 1] + d[i - 2]) ok = false;
    if (ok) t[d[n - 1] + d[n - 2]] = 1;
    var k = Object.keys(t);
    return k.length === 1 ? +k[0] : null;
  }

  // ---------------------------------------------------------------- çizim
  function ciz(h, x, y, w) { return BQ.hucre({ sekil: h.sekil, renk: h.renk, sayi: h.sayi, rot: h.rot, boy: BOY[h.boy] }, x, y, w); }
  function sira(seq, soru, o) {
    o = o || {};
    var hc = 68, ara = 8, n = seq.length + 1, W = n * hc + (n + 1) * ara, H = hc + 2 * ara + 18;
    var s = '<rect width="' + W + '" height="' + H + '" rx="16" fill="' + BQ.ZEMIN + '"/>';
    for (var i = 0; i < n; i++) {
      var x = ara + i * (hc + ara), h = i < seq.length ? seq[i] : soru;
      if (h === null) s += BQ.kutu(x, ara, hc, "", { soru: true, vurgu: o.vurgu });
      else s += BQ.kutu(x, ara, hc, o.metin ? BQ.yazi(x + hc / 2, ara + hc / 2 + 10, String(h), { boy: String(h).length > 2 ? 24 : 29, kalin: 900 }) : ciz(h, x, ara, hc), { vurgu: i === seq.length ? o.vurgu : null });
      s += BQ.yazi(x + hc / 2, H - 6, String(i + 1), { boy: 12, kalin: 700, renk: "#8a94ad" });
    }
    return BQ.svg(W, H, s, o.etiket);
  }

  // ---------------------------------------------------------------- üretici (görsel)
  function genGorsel(rnd, sv) {
    var nDeg = sv === 1 ? 1 : sv === 2 ? 2 : (rnd.chance(0.5) ? 3 : 2);
    var havuz = sv === 1 ? ["sekil", "renk", "sayi", "boy"] : ["sekil", "renk", "sayi", "rot", "boy"];
    var deg = rnd.sample(havuz, nDeg);
    if (deg.indexOf("rot") >= 0 && deg.indexOf("sekil") >= 0) return null;
    if (deg.indexOf("boy") >= 0 && deg.indexOf("sayi") >= 0) return null;
    var kural = {}, uzun = false, arit = false;
    deg.forEach(function (oz) {
      if (oz === "rot") {
        var adim = sv === 3 && rnd.chance(0.6) ? 45 : 90;
        kural.rot = { tip: "arit", d: rnd.chance(0.75) ? adim : 360 - adim, bas: rnd.pick([0, 90, 180, 270]) };
        return;
      }
      if (oz === "sayi" && (sv === 1 || rnd.chance(0.5))) {
        arit = true;
        kural.sayi = sv === 1 || rnd.chance(0.6) ? { tip: "arit", d: 1, bas: 1 } : { tip: "arit", d: -1, bas: 6 };
        return;
      }
      var k = rnd.pick(KALIP_SEV[sv]);
      if (KALIP[k].length === 3) uzun = true;
      var hv = { sekil: BQ.SEKILLER, renk: BQ.RENKLER, sayi: [1, 2, 3, 4], boy: [0, 1, 2] }[oz];
      var kac = k === "ABC" ? 3 : 2;
      kural[oz] = { tip: "kalip", k: k, v: rnd.sample(hv, kac) };
    });
    if (uzun && arit) return null;
    var n = arit ? 5 : uzun ? 6 : (sv === 1 ? 5 : 6);
    // 3. seviye en az bir "zor" kural içersin
    if (sv === 3 && nDeg === 2 && !deg.some(function (oz) { var k = kural[oz]; return (k.tip === "kalip" && k.k !== "AB") || (oz === "rot" && k.d % 90 !== 0); })) return null;
    var sabit = {
      sekil: deg.indexOf("rot") >= 0 ? "ok" : rnd.pick(BQ.SEKILLER.filter(function (s) { return s !== "daire" || deg.indexOf("rot") < 0; })),
      renk: rnd.pick(BQ.RENKLER), sayi: sv === 3 && deg.indexOf("boy") < 0 && rnd.chance(0.3) ? 2 : 1, rot: 0, boy: 2
    };
    function deger(oz, i) {
      var k = kural[oz];
      if (!k) return sabit[oz];
      if (k.tip === "arit") return oz === "rot" ? (k.bas + k.d * i) % 360 : k.bas + k.d * i;
      var kl = KALIP[k.k];
      return k.v[kl[i % kl.length]];
    }
    var tum = [];
    for (var i = 0; i <= n; i++) { var h = {}; OZ.forEach(function (oz) { h[oz] = deger(oz, i); }); tum.push(h); }
    var seq = tum.slice(0, n), dogru = tum[n];
    var cz = cozGorsel(seq);
    if (!cz || !esit(cz, dogru)) return null;
    // çeldiriciler: değişen özelliklerden biri yanlış (kalıptaki başka değer, bir eksik/fazla dönüş...)
    var alt = {};
    deg.forEach(function (oz) {
      var k = kural[oz], v = dogru[oz], l = [];
      if (oz === "rot") l = [(v + 360 - k.d) % 360, (v + k.d) % 360, (v + 180) % 360];
      else if (k.tip === "arit") l = [v + 1, v - 1, seq[n - 1].sayi].filter(function (x) { return x >= 1 && x <= 6; });
      else { l = rnd.shuffle(k.v.filter(function (x) { return x !== v; })); l.push(seq[n - 1][oz], tum[n - 2][oz]); }
      alt[oz] = l.filter(function (x) { return x !== v; });
    });
    if (deg.indexOf("renk") < 0) alt.renk = rnd.shuffle(BQ.RENKLER.filter(function (x) { return x !== dogru.renk; }));
    var celd = [], sirala = rnd.shuffle(deg).concat(deg.indexOf("renk") < 0 ? ["renk"] : []), tur = 0;
    while (celd.length < 3 && tur < 4) {
      sirala.forEach(function (oz) {
        if (celd.length >= 3) return;
        var l = alt[oz];
        for (var j = 0; j < l.length; j++) {
          var h2 = Object.assign({}, dogru); h2[oz] = l[j];
          if (!esit(h2, dogru) && !celd.some(function (x) { return esit(x, h2); })) { celd.push(h2); break; }
        }
      });
      tur++;
    }
    // iki özelliği birden yanlış bir çeldirici (2-3. seviye)
    if (celd.length < 3 && deg.length >= 2 && alt[deg[0]].length && alt[deg[1]].length) {
      var h3 = Object.assign({}, dogru); h3[deg[0]] = alt[deg[0]][0]; h3[deg[1]] = alt[deg[1]][0];
      if (!celd.some(function (x) { return esit(x, h3); })) celd.push(h3);
    }
    var sk = BQ.siklar(rnd, dogru, celd, anahtar);
    if (!sk) return null;
    var q = {
      soru: "Örüntüde soru işaretli kutuya hangisi gelmeli?",
      fig: sira(seq, null, { etiket: n + " kutuluk örüntü, sonraki kutu soru işaretli" }),
      tur: "svg",
      sec: sk.liste.map(function (h) { return BQ.tekKutu(ciz(h, 4, 4, 100), 100); }),
      dogru: sk.dogru,
      data: { tip: "gorsel", seq: seq, siklar: sk.liste },
      cozumFig: sira(seq, dogru, { vurgu: "#1fa866" })
    };
    q.adim = aciklamaGorsel(seq, kural, deg, dogru, sk);
    return q;
  }

  function kuralCumle(oz, k, seq, dogru) {
    var A = "<b>" + buyuk(OZ_AD[oz]) + "</b>";
    if (oz === "rot") {
      var yon = k.d < 180 ? "saat yönünde" : "saatin tersine", aci = k.d === 45 || k.d === 315 ? "yarım çeyrek tur (45°)" : "çeyrek tur (90°)";
      return A + ": ok her kutuda " + yon + " " + aci + " dönüyor. Son ok " + YON[seq[seq.length - 1].rot] + " bakıyor; bir dönüş daha yapınca <b>" + YON[dogru.rot] + "</b> bakar.";
    }
    if (k.tip === "arit") return A + ": her kutuda bir " + (k.d > 0 ? "artıyor" : "azalıyor") + " (" + seq.map(function (h) { return h.sayi; }).join(", ") + "). Sıradaki kutuda <b>" + dogru.sayi + " tane</b> olmalı.";
    var kl = KALIP[k.k], grup = kl.map(function (j) { return ad(oz, k.v[j]); });
    return A + ": " + kl.length + "'lü bir grup tekrar ediyor: <b>" + grup.join(" – ") + "</b>. Grubu baştan sayarak devam et; sıradaki <b>" + ad(oz, dogru[oz]) + "</b>.";
  }
  function aciklamaGorsel(seq, kural, deg, dogru, sk) {
    var a = ["Her özelliği ayrı ayrı izle: şekil, renk, sayı" + (dogru.sekil === "ok" ? ", okun yönü" : "") + ", boyut. Bu örüntüde değişenler: " + deg.map(function (o) { return OZ_AD[o]; }).join(", ") + "."];
    deg.forEach(function (oz) { a.push(kuralCumle(oz, kural[oz], seq, dogru)); });
    var sab = OZ.filter(function (o) { return deg.indexOf(o) < 0 && o !== "rot" && !(o === "boy" && dogru.boy === 2); });
    if (sab.length && a.length < 4) a.push("Değişmeyenler: " + sab.map(function (o) { return OZ_AD[o] + " (" + ad(o, dogru[o]) + ")"; }).join(", ") + ".");
    var el = [];
    sk.liste.forEach(function (h, i) { if (i !== sk.dogru) el.push(BQ.HARF[i] + " (" + OZ.filter(function (o) { return h[o] !== dogru[o]; }).map(function (o) { return OZ_AD[o]; }).join(" ve ") + " uymuyor)"); });
    a.push("Şıkları eleyelim: " + el.join("; ") + ". Doğru cevap <b>" + BQ.HARF[sk.dogru] + "</b>.");
    return a;
  }

  // ---------------------------------------------------------------- üretici (sayı dizisi, 3. seviye)
  function genSayi(rnd) {
    var tip = rnd.pick(["arit", "geo", "artan", "dongu", "fib"]), d = [], n = 5, i, a;
    if (tip === "arit") { a = rnd.int(2, 12); var s = rnd.int(3, 9); for (i = 0; i < n; i++) d.push(a + s * i); }
    else if (tip === "geo") { a = rnd.int(1, 5); var r = a <= 2 && rnd.chance(0.3) ? 3 : 2; for (i = 0; i < n; i++) d.push(a * Math.pow(r, i)); }
    else if (tip === "artan") { a = rnd.int(1, 10); var f = rnd.int(1, 3); d.push(a); for (i = 1; i < n; i++) d.push(d[i - 1] + f + i - 1); }
    else if (tip === "dongu") { n = 6; a = rnd.int(3, 12); var p = rnd.int(3, 6), m = rnd.int(1, p - 1); d.push(a); for (i = 1; i < n; i++) d.push(d[i - 1] + (i % 2 ? p : -m)); }
    else { a = rnd.int(1, 4); var b = a + rnd.int(1, 3); d = [a, b]; for (i = 2; i < n; i++) d.push(d[i - 1] + d[i - 2]); }
    var cev = cozSayi(d);
    if (cev === null || cev > 400) return null;
    var son = d[d.length - 1], sf = son - d[d.length - 2];
    var celd = [son + sf, cev + 1, cev - 1, cev + 2, cev - 2, son + sf + 1].filter(function (x) { return x > 0 && x !== cev; });
    celd = rnd.shuffle(celd.slice(0, 3)).concat(celd.slice(3));
    var sk = BQ.siklar(rnd, cev, celd, String);
    if (!sk) return null;
    var q = {
      soru: "Sayılar bir kurala göre dizilmiş. Soru işaretinin yerine hangi sayı gelmeli?",
      fig: sira(d, null, { metin: true, etiket: "Sayı dizisi: " + d.join(", ") + ", ?" }),
      tur: "metin",
      sec: sk.liste.map(String),
      dogru: sk.dogru,
      data: { tip: "sayi", dizi: d, siklar: sk.liste },
      cozumFig: sira(d, cev, { metin: true, vurgu: "#1fa866" })
    };
    var f = [];
    for (i = 1; i < d.length; i++) f.push(d[i] - d[i - 1]);
    var fs = f.map(function (x) { return (x > 0 ? "+" : "−") + Math.abs(x); }).join(", ");
    var a2 = ["Sayılar arasındaki <b>farka</b> bak: " + fs + "."];
    if (tip === "arit") a2.push("Fark hep aynı: her adımda <b>+" + f[0] + "</b> ekleniyor.", "Son sayı " + son + "; " + son + " + " + f[0] + " = <b>" + cev + "</b>.");
    else if (tip === "geo") { var rr = d[1] / d[0]; a2.push("Farklar sabit değil ama her sayı bir öncekinin <b>" + rr + " katı</b>: " + d.slice(0, 3).map(function (x) { return x + " × " + rr + " = " + x * rr; }).join("; ") + "…", "Son sayı " + son + "; " + son + " × " + rr + " = <b>" + cev + "</b>."); }
    else if (tip === "artan") a2.push("Farklar her adımda 1 büyüyor: " + fs + ". Sıradaki fark <b>+" + (sf + 1) + "</b>.", son + " + " + (sf + 1) + " = <b>" + cev + "</b>. Farkı aynı sanıp " + (son + sf) + " diyen yanılır.");
    else if (tip === "dongu") a2.push("İki adım sırayla tekrar ediyor: <b>" + fs.split(", ").slice(0, 2).join(" sonra ") + "</b>.", "Son adım " + (sf > 0 ? "+" : "−") + Math.abs(sf) + " idi; sıradaki adım " + (f[f.length - 2] > 0 ? "+" : "−") + Math.abs(f[f.length - 2]) + ". " + son + (f[f.length - 2] > 0 ? " + " : " − ") + Math.abs(f[f.length - 2]) + " = <b>" + cev + "</b>.");
    else a2.push("Her sayı, kendinden önceki <b>iki sayının toplamı</b>: " + d[0] + " + " + d[1] + " = " + d[2] + ", " + d[1] + " + " + d[2] + " = " + d[3] + "…", d[d.length - 2] + " + " + son + " = <b>" + cev + "</b>.");
    a2.push("Doğru cevap <b>" + BQ.HARF[sk.dogru] + "</b>.");
    q.adim = a2;
    return q;
  }

  BQ.reg("oruntu", {
    ad: "Örüntü",
    gen: function (rnd, sv) { return sv === 3 && rnd.chance(0.3) ? genSayi(rnd) : genGorsel(rnd, sv); },
    coz: function (q) {
      var d = q.data, es;
      if (d.tip === "sayi") {
        var c = cozSayi(d.dizi);
        if (c === null) throw new Error("dizi kuralı belirsiz");
        es = d.siklar.map(function (x, i) { return x === c ? i : -1; }).filter(function (i) { return i >= 0; });
      } else {
        var cz = cozGorsel(d.seq);
        if (!cz) throw new Error("kural belirsiz");
        es = d.siklar.map(function (h, i) { return esit(h, cz) ? i : -1; }).filter(function (i) { return i >= 0; });
      }
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Parça-bütün — karo deseninde eksik parçayı bul.
   Ders: önce desenin kuralı (tekrar mı, ayna mı, yarım tur mu?), sonra eksik parçayı eşinden kopyala / aynala / döndür. */
(function (BQ) {
  "use strict";
  var f1 = BQ.f1;
  var KLR = [1, 0, 3, 2], KUD = [3, 2, 1, 0], KTR = [0, 3, 2, 1], KATR = [2, 1, 0, 3];
  var YONSUZ = { kare: 1 };
  var TUR_AD = { ucgen: "üçgen", ceyrek: "çeyrek daire", kare: "dolu kare" };

  function kt(t, f) {
    if (!t) return null;
    var o = YONSUZ[t.t] ? 0 : t.o;
    if (!YONSUZ[t.t]) o = f === "lr" ? KLR[o] : f === "ud" ? KUD[o] : f === "cw" ? (o + 1) % 4 : f === "r180" ? (o + 2) % 4 : f === "tr" ? KTR[o] : f === "atr" ? KATR[o] : o;
    return { t: t.t, o: o, r: t.r };
  }
  function tk(t) { return t ? t.t + (YONSUZ[t.t] ? 0 : t.o) + t.r : "-"; }
  function gT(g, f) {  // küçük parça dönüşümü (n×m)
    var n = g.length, m = g[0].length, out = [], r, c;
    if (f === "cw") { for (r = 0; r < m; r++) { out.push([]); for (c = 0; c < n; c++) out[r].push(kt(g[n - 1 - c][r], "cw")); } return out; }
    for (r = 0; r < n; r++) { out.push([]); for (c = 0; c < m; c++) out[r].push(kt(f === "lr" ? g[r][m - 1 - c] : f === "ud" ? g[n - 1 - r][c] : g[n - 1 - r][m - 1 - c], f)); }
    return out;
  }
  function gk(g) { return g.map(function (row) { return row.map(tk).join(","); }).join("/"); }

  // ---------------------------------------------------------------- simetri aileleri (çözücü ve üretici ortak tanım)
  // her biri: hücre eşlemesi + karo dönüşümü + mertebe
  function aileler(N) {
    var l = [
      { ad: "lr", m: function (r, c) { return [r, N - 1 - c]; }, f: "lr", k: 2 },
      { ad: "ud", m: function (r, c) { return [N - 1 - r, c]; }, f: "ud", k: 2 },
      { ad: "r180", m: function (r, c) { return [N - 1 - r, N - 1 - c]; }, f: "r180", k: 2 },
      { ad: "r90", m: function (r, c) { return [c, N - 1 - r]; }, f: "cw", k: 4 },
      { ad: "tr", m: function (r, c) { return [c, r]; }, f: "tr", k: 2 },
      { ad: "atr", m: function (r, c) { return [N - 1 - c, N - 1 - r]; }, f: "atr", k: 2 }
    ];
    [1, 2, 3, N].forEach(function (pr) { [1, 2, 3, N].forEach(function (pc) { if ((pr < N || pc < N) && pr <= N && pc <= N) l.push({ ad: "per", pr: pr, pc: pc }); }); });
    return l;
  }
  // görünen tahta (null = eksik) → her eksik hücre için tahmin; tutarsız aile atlanır
  function coz(tahta, eksik) {
    var N = tahta.length, tah = {}, tutarli = [];
    aileler(N).forEach(function (a) {
      var cift = 0, bozuk = false, p = {}, r, c;
      if (a.ad === "per") {
        var sinif = {};
        for (r = 0; r < N && !bozuk; r++) for (c = 0; c < N; c++) {
          if (!tahta[r][c]) continue;
          var key = (r % a.pr) + "," + (c % a.pc), v = tk(tahta[r][c]);
          if (key in sinif) { if (sinif[key].k !== v) { bozuk = true; break; } cift++; } else sinif[key] = { k: v, t: tahta[r][c] };
        }
        if (bozuk || cift < 4) return;
        eksik.forEach(function (e) { var s = sinif[(e[0] % a.pr) + "," + (e[1] % a.pc)]; if (s) p[e] = s.t; });
      } else {
        for (r = 0; r < N && !bozuk; r++) for (c = 0; c < N; c++) {
          if (!tahta[r][c]) continue;
          var h = a.m(r, c), t2 = tahta[h[0]][h[1]];
          if (!t2) continue;
          if (tk(t2) !== tk(kt(tahta[r][c], a.f))) { bozuk = true; break; }
          if (h[0] !== r || h[1] !== c) cift++;
        }
        if (bozuk || cift < 4) return;
        eksik.forEach(function (e) {
          for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
            if (!tahta[r][c] || p[e]) continue;
            var h2 = [r, c], t3 = tahta[r][c];
            for (var k = 1; k < a.k; k++) { h2 = a.m(h2[0], h2[1]); t3 = kt(t3, a.f); if (h2[0] === e[0] && h2[1] === e[1]) { p[e] = t3; break; } }
          }
        });
      }
      tutarli.push(a);
      for (var e in p) { var kk = tk(p[e]); if (e in tah && tk(tah[e]) !== kk) throw new Error("kurallar çelişiyor"); tah[e] = p[e]; }
    });
    eksik.forEach(function (e) { if (!(e in tah)) throw new Error("tahmin edilemeyen karo"); });
    return { tah: tah, aile: tutarli };
  }

  // ---------------------------------------------------------------- çizim
  function karo(t, x, y, w) {
    if (!t) return "";
    var o = t.o || 0, st = ' fill="' + BQ.RENK[t.r] + '" stroke="' + BQ.CIZ + '" stroke-width="1.6" stroke-linejoin="round"';
    var K = [[x, y], [x + w, y], [x + w, y + w], [x, y + w]];
    if (t.t === "kare") return '<rect x="' + f1(x + w * 0.18) + '" y="' + f1(y + w * 0.18) + '" width="' + f1(w * 0.64) + '" height="' + f1(w * 0.64) + '" rx="' + f1(w * 0.08) + '"' + st + "/>";
    if (t.t === "ucgen") return '<polygon points="' + BQ.poly([K[o], K[(o + 1) % 4], K[(o + 3) % 4]]) + '"' + st + "/>";
    var a = K[(o + 1) % 4], b = K[(o + 3) % 4];
    return '<path d="M' + f1(K[o][0]) + "," + f1(K[o][1]) + " L" + f1(a[0]) + "," + f1(a[1]) + " A" + f1(w) + "," + f1(w) + " 0 0 1 " + f1(b[0]) + "," + f1(b[1]) + 'Z"' + st + "/>";
  }
  function bolgeCiz(g, x, y, cs, ciz) {  // ciz(r,c) → çizilsin mi
    var n = g.length, m = g[0].length, s = '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(m * cs) + '" height="' + f1(n * cs) + '" fill="#fff"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) if (!ciz || ciz(r, c)) s += karo(g[r][c], x + c * cs, y + r * cs, cs);
    for (r = 0; r <= n; r++) s += '<line x1="' + f1(x) + '" y1="' + f1(y + r * cs) + '" x2="' + f1(x + m * cs) + '" y2="' + f1(y + r * cs) + '" stroke="#c4cee0" stroke-width="1.2"/>';
    for (c = 0; c <= m; c++) s += '<line x1="' + f1(x + c * cs) + '" y1="' + f1(y) + '" x2="' + f1(x + c * cs) + '" y2="' + f1(y + n * cs) + '" stroke="#c4cee0" stroke-width="1.2"/>';
    return s;
  }
  function fig(tam, blok, cozum, aile, etiket) {
    var N = tam.length, cs = N === 4 ? 50 : 38, bw = N * cs, W = Math.max(280, bw + 36), H = bw + 36, x0 = (W - bw) / 2, y0 = 18;
    var icBlok = function (r, c) { return r >= blok.r && r < blok.r + blok.h && c >= blok.c && c < blok.c + blok.w; };
    var s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    s += bolgeCiz(tam, x0, y0, cs, cozum ? null : function (r, c) { return !icBlok(r, c); });
    var bx = x0 + blok.c * cs, by = y0 + blok.r * cs, bW = blok.w * cs, bH = blok.h * cs;
    if (cozum) {
      if (aile === "lr") s += '<line x1="' + f1(x0 + bw / 2) + '" y1="' + f1(y0 - 8) + '" x2="' + f1(x0 + bw / 2) + '" y2="' + f1(y0 + bw + 8) + '" stroke="' + BQ.RENK.mor + '" stroke-width="2.6" stroke-dasharray="7 5"/>';
      if (aile === "ud") s += '<line x1="' + f1(x0 - 8) + '" y1="' + f1(y0 + bw / 2) + '" x2="' + f1(x0 + bw + 8) + '" y2="' + f1(y0 + bw / 2) + '" stroke="' + BQ.RENK.mor + '" stroke-width="2.6" stroke-dasharray="7 5"/>';
      if (aile === "r180" || aile === "r90") s += '<circle cx="' + f1(x0 + bw / 2) + '" cy="' + f1(y0 + bw / 2) + '" r="6" fill="' + BQ.RENK.mor + '" stroke="#fff" stroke-width="2"/>';
      s += '<rect x="' + f1(bx - 1.5) + '" y="' + f1(by - 1.5) + '" width="' + f1(bW + 3) + '" height="' + f1(bH + 3) + '" rx="4" fill="none" stroke="#1fa866" stroke-width="4"/>';
    } else {
      s += '<rect x="' + f1(bx + 3) + '" y="' + f1(by + 3) + '" width="' + f1(bW - 6) + '" height="' + f1(bH - 6) + '" rx="8" fill="' + BQ.SORU + '" stroke="#e2c46a" stroke-width="2"/>' +
        BQ.yazi(bx + bW / 2, by + bH / 2 + Math.min(bW, bH) * 0.17, "?", { boy: f1(Math.min(bW, bH) * 0.5), kalin: 900, renk: "#e2a000" });
    }
    s += '<rect x="' + f1(x0) + '" y="' + f1(y0) + '" width="' + f1(bw) + '" height="' + f1(bw) + '" rx="3" fill="none" stroke="' + BQ.CIZ + '" stroke-width="2.4"/>';
    return BQ.svg(W, H, s, etiket);
  }
  function sikCiz(p) {
    var n = p.length, m = p[0].length, cs = Math.min(40, 84 / Math.max(n, m)), x = 4 + (100 - m * cs) / 2, y = 4 + (100 - n * cs) / 2;
    return BQ.tekKutu(bolgeCiz(p, x, y, cs) + '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(m * cs) + '" height="' + f1(n * cs) + '" fill="none" stroke="' + BQ.CIZ + '" stroke-width="2"/>', 100);
  }

  // ---------------------------------------------------------------- üretici
  var SEV = {
    1: { N: 4, aile: ["lr", "ud", "per"], tur: ["ucgen", "ucgen", "kare"], renk: 2, blok: [[1, 2], [2, 1]] },
    2: { N: 4, aile: ["lr", "ud", "r180", "per"], tur: ["ucgen", "ceyrek"], renk: 2, blok: [[2, 2]] },
    3: { N: 6, aile: ["lr", "ud", "r180", "r90", "per"], tur: ["ucgen", "ceyrek", "ucgen", "kare"], renk: 3, blok: [[2, 2]] }
  };
  function gen(rnd, sv) {
    var S = SEV[sv], N = S.N, renk = rnd.sample(BQ.RENKLER, S.renk), aileAd = rnd.pick(S.aile), tam = [], r, c;
    function rk() { var t = rnd.pick(S.tur); return { t: t, o: YONSUZ[t] ? 0 : rnd.int(0, 3), r: rnd.pick(renk) }; }
    for (r = 0; r < N; r++) { tam.push([]); for (c = 0; c < N; c++) tam[r].push(null); }
    var per = null;
    if (aileAd === "per") {
      per = N === 4 ? [2, 2] : rnd.pick([[2, 2], [3, 3], [2, 3], [3, 2]]);
      var motif = [];
      for (r = 0; r < per[0]; r++) { motif.push([]); for (c = 0; c < per[1]; c++) motif[r].push(rk()); }
      for (r = 0; r < N; r++) for (c = 0; c < N; c++) tam[r][c] = motif[r % per[0]][c % per[1]];
    } else {
      var A = aileler(N).filter(function (a) { return a.ad === aileAd; })[0];
      for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
        if (tam[r][c]) continue;
        var t = rk(), h = [r, c];
        tam[r][c] = t;
        for (var k = 1; k < A.k; k++) { h = A.m(h[0], h[1]); t = kt(t, A.f); if (!tam[h[0]][h[1]]) tam[h[0]][h[1]] = t; }
      }
    }
    // desen çeşitli olsun: en az 2 renk ve 2 farklı karo
    var cesit = {};
    tam.forEach(function (row) { row.forEach(function (t) { cesit[tk(t)] = 1; }); });
    if (Object.keys(cesit).length < (sv === 3 ? 5 : 3)) return null;
    var bb = rnd.pick(S.blok), blok = { h: bb[0], w: bb[1], r: rnd.int(0, N - bb[0]), c: rnd.int(0, N - bb[1]) };
    var eksik = [], gor = tam.map(function (row) { return row.slice(); });
    for (r = blok.r; r < blok.r + blok.h; r++) for (c = blok.c; c < blok.c + blok.w; c++) { eksik.push([r, c]); gor[r][c] = null; }
    var cz;
    try { cz = coz(gor, eksik); } catch (e) { return null; }
    var parca = [];
    for (r = 0; r < blok.h; r++) { parca.push([]); for (c = 0; c < blok.w; c++) parca[r].push(tam[blok.r + r][blok.c + c]); }
    if (gk(parca) !== gk(blokTahmin(cz.tah, blok))) return null;
    // çeldiriciler
    var celd = [];
    if (aileAd !== "per") {
      // eşini aynalamadan/döndürmeden kopyalamak
      var A2 = aileler(N).filter(function (a) { return a.ad === aileAd; })[0], es = eksik.map(function (e) { return A2.m(e[0], e[1]); });
      var rr = es.map(function (e) { return e[0]; }), cc = es.map(function (e) { return e[1]; }), r0 = Math.min.apply(null, rr), c0 = Math.min.apply(null, cc);
      var kop = [], ok = true;
      for (r = 0; r < blok.h && ok; r++) { kop.push([]); for (c = 0; c < blok.w; c++) { var tt = gor[r0 + r] && gor[r0 + r][c0 + c]; if (!tt) { ok = false; break; } kop[r].push(tt); } }
      if (ok && Math.max.apply(null, rr) - r0 + 1 === blok.h && Math.max.apply(null, cc) - c0 + 1 === blok.w) celd.push({ p: kop, ne: "kopya" });
    }
    var ayna = { p: gT(parca, blok.w > 1 ? "lr" : "ud"), ne: "ayna" };
    var don = { p: blok.h === blok.w && rnd.chance(0.5) ? gT(parca, "cw") : gT(parca, "r180"), ne: "don" };
    var tekp = parca.map(function (row) { return row.slice(); }), ri = rnd.int(0, blok.h - 1), ci = rnd.int(0, blok.w - 1), t0 = tekp[ri][ci];
    tekp[ri][ci] = YONSUZ[t0.t] || rnd.chance(0.4) ? { t: t0.t, o: t0.o, r: rnd.pick(BQ.RENKLER.filter(function (x) { return x !== t0.r; })) } : kt(t0, rnd.pick(["cw", "r180"]));
    var tek = { p: tekp, ne: "tek" };
    celd = celd.concat(sv === 3 ? [tek, ayna, don] : rnd.shuffle([ayna, don, tek]));
    var sk = BQ.siklar(rnd, { p: parca, ne: "dogru" }, celd, function (x) { return gk(x.p); });
    if (!sk) return null;
    var q = {
      soru: "Desendeki boşluğa hangi parça gelmeli?",
      fig: fig(tam, blok, false, aileAd, N + "×" + N + " karo deseni, bir bölümü boş"),
      tur: "svg",
      sec: sk.liste.map(function (x) { return sikCiz(x.p); }),
      dogru: sk.dogru,
      data: { tahta: gor, blok: blok, siklar: sk.liste.map(function (x) { return x.p; }) },
      cozumFig: fig(tam, blok, true, aileAd, "Desen tamamlanmış; eksik parça yeşil çerçeveli")
    };
    q.adim = aciklama(aileAd, per, blok, sk.liste, sk.dogru);
    return q;
  }
  function blokTahmin(tah, blok) {
    var p = [];
    for (var r = 0; r < blok.h; r++) { p.push([]); for (var c = 0; c < blok.w; c++) p[r].push(tah[[blok.r + r, blok.c + c]]); }
    return p;
  }
  function aciklama(aile, per, blok, sik, dg) {
    var a = ["Önce desenin <b>kuralını</b> bul: tekrar mı ediyor, ayna gibi mi, yoksa yarım turda kendisiyle aynı mı?"];
    var K = {
      lr: "Desen <b>sağ-sol aynalı</b>: ortadan dikey bir ayna var. Sol yarı, sağ yarının aynadaki görüntüsü.",
      ud: "Desen <b>üst-alt aynalı</b>: ortadan yatay bir ayna var. Üst yarı, alt yarının aynadaki görüntüsü.",
      r180: "Desen <b>yarım tur</b> dönünce kendisiyle aynı: sol üstteki karo, yarım turla sağ altta görünür.",
      r90: "Desen <b>çeyrek tur</b> dönünce kendisiyle aynı: dört köşe birbirinin döndürülmüş hâli.",
      per: "Desen <b>tekrar ediyor</b>: " + (per ? per[0] + "×" + per[1] : "") + "'lik bir motif yan yana ve alt alta diziliyor."
    };
    a.push(K[aile]);
    a.push(aile === "per" ? "Boşluğun eşini aynı motifin başka bir tekrarında bul ve <b>olduğu gibi kopyala</b>."
      : aile === "r180" || aile === "r90" ? "Boşluğun eşini ortanın karşı tarafında bul. Onu kopyalama, <b>döndür</b>: üçgenlerin ve çeyrek dairelerin yönü de döner."
        : "Boşluğun eşini aynanın öbür tarafında bul. Onu kopyalama, <b>aynala</b>: üçgenlerin ve çeyrek dairelerin yönü de ters döner.");
    var AD = { kopya: "eşi aynalanmadan/döndürülmeden kopyalanmış", ayna: "doğru parçanın ayna görüntüsü", don: "doğru parça döndürülmüş", tek: "bir karosu farklı" };
    var el = [];
    sik.forEach(function (x, i) { if (i !== dg) el.push(BQ.HARF[i] + ": " + AD[x.ne]); });
    a.push("Yanlış şıklar: " + el.join("; ") + ".");
    a.push("Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  BQ.reg("parca", {
    ad: "Parça-bütün",
    gen: gen,
    coz: function (q) {
      // görünen karolarla tutarlı tüm simetri ailelerini dene; tahminler tek parçada birleşmeli, tek şık eşleşmeli
      var d = q.data, b = d.blok, eksik = [];
      for (var r = b.r; r < b.r + b.h; r++) for (var c = b.c; c < b.c + b.w; c++) eksik.push([r, c]);
      var cz = coz(d.tahta, eksik), hedef = gk(blokTahmin(cz.tah, b)), es = [];
      d.siklar.forEach(function (p, i) { if (gk(p) === hedef) es.push(i); });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Şekil sayma — "Şekilde kaç üçgen / kare / dikdörtgen var?"
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

;/* Şifre — (a) şekil-sayı denklemleri (şekiller 1..9 arası birer rakam), (b) şekil→rakam anahtarıyla kod çözme.
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

;/* Dengedeki teraziler — şekillerin ağırlıklarını karşılaştırma.
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

;/* Yön — ızgarada robot ve komut dizisi; "Robot nereye varır?" Harfli kareler (A–D) şık.
   1-2. seviye: ok komutları (↑ → ↓ ←). 3. seviye: robotun baktığı yöne göre "sağa dön / sola dön / N adım ileri".
   Çeldiriciler: sağ-sol karıştırma, bir adım eksik, yukarı-aşağı karıştırma (3. seviyede: dönüşü ekrana göre yapmak). */
(function (BQ) {
  "use strict";
  function f1(x) { return Math.round(x * 10) / 10; }
  var DR = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // 0 yukarı, 1 sağ, 2 aşağı, 3 sol
  var YON_AD = ["yukarı", "sağa", "aşağı", "sola"];
  var OK = ["↑", "→", "↓", "←"];

  // ---------------------------------------------------------------- simülasyon (çözücü ve üretici ortak kullanır)
  // komut: {t:"ok", y:0..3} | {t:"don", y:"sag"|"sol"} | {t:"ileri", n:1..3}
  function yuru(n, bas, yon, komut, o) {
    o = o || {};
    var r = bas[0], c = bas[1], f = yon, yol = [[r, c]], disari = false;
    komut.forEach(function (k) {
      if (k.t === "ok") { var d = DR[k.y]; r += d[0]; c += d[1]; yol.push([r, c]); }
      else if (k.t === "don") {
        if (o.ekran) f = k.y === "sag" ? 1 : 3; // yanlış: dönüşü ekrana göre yapmak
        else f = (f + (k.y === "sag" ? 1 : 3)) % 4;
      } else for (var i = 0; i < k.n; i++) { r += DR[f][0]; c += DR[f][1]; yol.push([r, c]); }
      if (r < 0 || c < 0 || r >= n || c >= n) disari = true;
    });
    return { son: [r, c], yol: yol, disari: disari, yon: f };
  }

  // ---------------------------------------------------------------- çizim
  function robot(cx, cy, s, yon, gosterYon) {
    var w = s * 0.62, h = s * 0.5, x = cx - w / 2, y = cy - h / 2 + s * 0.06, out = "";
    var px = 0, py = 0;
    if (gosterYon) { px = DR[yon][1] * s * 0.035; py = DR[yon][0] * s * 0.035; }
    // anten
    out += '<line x1="' + f1(cx) + '" y1="' + f1(y) + '" x2="' + f1(cx) + '" y2="' + f1(y - s * 0.13) + '" stroke="' + BQ.CIZ + '" stroke-width="2.2" stroke-linecap="round"/>';
    out += '<circle cx="' + f1(cx) + '" cy="' + f1(y - s * 0.15) + '" r="' + f1(s * 0.05) + '" fill="#f5b700" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    // kulaklar
    out += '<rect x="' + f1(x - s * 0.06) + '" y="' + f1(cy - s * 0.04) + '" width="' + f1(s * 0.08) + '" height="' + f1(s * 0.16) + '" rx="' + f1(s * 0.03) + '" fill="#8b5cf6" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    out += '<rect x="' + f1(x + w - s * 0.02) + '" y="' + f1(cy - s * 0.04) + '" width="' + f1(s * 0.08) + '" height="' + f1(s * 0.16) + '" rx="' + f1(s * 0.03) + '" fill="#8b5cf6" stroke="' + BQ.CIZ + '" stroke-width="1.8"/>';
    // kafa
    out += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + f1(s * 0.12) + '" fill="#16b6c8" stroke="' + BQ.CIZ + '" stroke-width="2.2"/>';
    // gözler
    [-1, 1].forEach(function (k) {
      var ex = cx + k * w * 0.22, ey = y + h * 0.42;
      out += '<circle cx="' + f1(ex) + '" cy="' + f1(ey) + '" r="' + f1(s * 0.085) + '" fill="#fff" stroke="' + BQ.CIZ + '" stroke-width="1.6"/>';
      out += '<circle cx="' + f1(ex + px) + '" cy="' + f1(ey + py) + '" r="' + f1(s * 0.04) + '" fill="' + BQ.CIZ + '"/>';
    });
    // gülümseme + yanaklar
    out += '<path d="M' + f1(cx - w * 0.16) + "," + f1(y + h * 0.74) + " Q" + f1(cx) + "," + f1(y + h * 0.92) + " " + f1(cx + w * 0.16) + "," + f1(y + h * 0.74) + '" fill="none" stroke="' + BQ.CIZ + '" stroke-width="2" stroke-linecap="round"/>';
    out += '<circle cx="' + f1(cx - w * 0.36) + '" cy="' + f1(y + h * 0.72) + '" r="' + f1(s * 0.035) + '" fill="#ec5fa6" opacity=".7"/><circle cx="' + f1(cx + w * 0.36) + '" cy="' + f1(y + h * 0.72) + '" r="' + f1(s * 0.035) + '" fill="#ec5fa6" opacity=".7"/>';
    return out;
  }
  // robotun baktığı yönü gösteren turuncu ok (hücrenin kenarında)
  function bakis(cx, cy, s, yon) {
    var d = DR[yon], ux = d[1], uy = d[0], vx = -uy, vy = ux, t = s * 0.5 - 1, b = s * 0.25, g = s * 0.21;
    var p = [[cx + ux * t, cy + uy * t], [cx + ux * b + vx * g, cy + uy * b + vy * g], [cx + ux * b - vx * g, cy + uy * b - vy * g]];
    return '<polygon points="' + BQ.poly(p) + '" fill="#f5821f" stroke="' + BQ.CIZ + '" stroke-width="1.6" stroke-linejoin="round"/>';
  }
  function okIkon(cx, cy, r, y, renk) {
    return BQ.sekil("ok", cx, cy, r, null, y * 90, { dolgu: renk || "#3d7ff2", sw: 1.8 });
  }
  function donIkon(cx, cy, r, sag) {
    // kıvrık ok: yukarı çıkıp sağa/sola döner
    var k = sag ? 1 : -1, x0 = cx - k * r * 0.45, y0 = cy + r * 0.8, yk = cy - r * 0.15, x1 = cx + k * r * 0.55;
    var d = "M" + f1(x0) + "," + f1(y0) + " V" + f1(yk + r * 0.35) + " Q" + f1(x0) + "," + f1(yk) + " " + f1(x0 + k * r * 0.35) + "," + f1(yk) + " H" + f1(x1 - k * r * 0.1);
    var uc = [[x1 + k * r * 0.35, yk], [x1 - k * r * 0.12, yk - r * 0.4], [x1 - k * r * 0.12, yk + r * 0.4]];
    return '<path d="' + d + '" fill="none" stroke="#f5821f" stroke-width="' + f1(r * 0.32) + '" stroke-linecap="round"/><polygon points="' + BQ.poly(uc) + '" fill="#f5821f"/>';
  }

  function sahne(d, o) {
    o = o || {};
    var n = d.n, s = n === 5 ? 54 : 48, pad = 12, G = n * s, gx, gy = pad;
    var goreli = d.komut.some(function (k) { return k.t !== "ok"; });
    var tw = goreli ? 64 : 40, th = goreli ? 64 : 40, tg = 8, nk = d.komut.length;
    var KW = nk * tw + (nk - 1) * tg;
    var W = Math.max(G, KW) + 2 * pad, H = G + pad * 3 + th + 22;
    gx = (W - G) / 2;
    var out = '<rect width="' + f1(W) + '" height="' + f1(H) + '" rx="18" fill="' + BQ.ZEMIN + '"/>';
    out += '<rect x="' + f1(gx - 4) + '" y="' + f1(gy - 4) + '" width="' + f1(G + 8) + '" height="' + f1(G + 8) + '" rx="12" fill="#fff" stroke="#cbd4e6" stroke-width="2.2"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      var x = gx + c * s, y = gy + r * s;
      out += '<rect x="' + f1(x + 2) + '" y="' + f1(y + 2) + '" width="' + (s - 4) + '" height="' + (s - 4) + '" rx="7" fill="' + ((r + c) % 2 ? "#f6f8fd" : "#fff") + '" stroke="#e1e7f2" stroke-width="1.4"/>';
    }
    function merkez(rc) { return [gx + rc[1] * s + s / 2, gy + rc[0] * s + s / 2]; }
    var dogruHarf = o.dogruHarf;
    // yol (çözüm)
    if (o.yol) {
      var pts = o.yol.map(merkez);
      out += '<polyline points="' + BQ.poly(pts) + '" fill="none" stroke="#1fa866" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>';
      pts.slice(1, -1).forEach(function (p) { out += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="4" fill="#1fa866"/>'; });
    }
    ["A", "B", "C", "D"].forEach(function (h) {
      var rc = d.harf[h], m = merkez(rc), v = h === dogruHarf;
      out += '<rect x="' + f1(m[0] - s / 2 + 4) + '" y="' + f1(m[1] - s / 2 + 4) + '" width="' + (s - 8) + '" height="' + (s - 8) + '" rx="8" fill="' + (v ? "#d9f5e6" : BQ.SORU) + '" stroke="' + (v ? "#1fa866" : "#f0c43a") + '" stroke-width="' + (v ? 3 : 2) + '"/>';
      out += BQ.yazi(m[0], m[1] + s * 0.17, h, { boy: Math.round(s * 0.46), kalin: 900, renk: v ? "#12804c" : "#b37a00" });
    });
    var mb = merkez(d.bas);
    if (goreli) {
      // robotu baktığı yönün tersine biraz kaydır, küçült; o kenara turuncu ok koy
      var ox = -DR[d.yon][1] * s * 0.1, oy = -DR[d.yon][0] * s * 0.1;
      out += '<g transform="translate(' + f1(mb[0] + ox) + "," + f1(mb[1] + oy) + ') scale(0.78) translate(' + f1(-mb[0]) + "," + f1(-mb[1]) + ')">' + robot(mb[0], mb[1], s, d.yon, true) + "</g>";
      out += bakis(mb[0], mb[1], s, d.yon);
    } else out += robot(mb[0], mb[1], s, d.yon, false);
    // komut şeridi
    var ky = gy + G + pad * 2, kx = (W - KW) / 2;
    d.komut.forEach(function (k, i) {
      var x = kx + i * (tw + tg);
      out += '<rect x="' + f1(x) + '" y="' + f1(ky) + '" width="' + tw + '" height="' + th + '" rx="9" fill="#fff" stroke="#cbd4e6" stroke-width="2"/>';
      if (k.t === "ok") out += okIkon(x + tw / 2, ky + th / 2, th * 0.33, k.y);
      else if (k.t === "don") {
        out += donIkon(x + tw / 2, ky + th * 0.36, th * 0.24, k.y === "sag");
        out += BQ.yazi(x + tw / 2, ky + th - 9, k.y === "sag" ? "sağa" : "sola", { boy: 14, kalin: 800 });
      } else {
        out += BQ.yazi(x + tw / 2, ky + th * 0.52, String(k.n), { boy: 28, kalin: 900, renk: "#3d7ff2" });
        out += BQ.yazi(x + tw / 2, ky + th - 9, "ileri", { boy: 14, kalin: 800 });
      }
      out += BQ.yazi(x + tw / 2, ky + th + 16, String(i + 1), { boy: 11, kalin: 700, renk: "#8a94ad" });
    });
    return BQ.svg(W, H, out, o.etiket);
  }

  // ---------------------------------------------------------------- üretici
  function tersLR(k) { return k.map(function (x) { return x.t === "ok" && x.y % 2 === 1 ? { t: "ok", y: 4 - x.y } : x.t === "don" ? { t: "don", y: x.y === "sag" ? "sol" : "sag" } : x; }); }
  function tersUD(k) { return k.map(function (x) { return x.t === "ok" && x.y % 2 === 0 ? { t: "ok", y: 2 - x.y } : x; }); }
  function eksik(k, i) {
    var l = k.map(function (x) { return Object.assign({}, x); });
    if (l[i].t === "ileri") { if (l[i].n === 1) l.splice(i, 1); else l[i].n -= 1; } else l.splice(i, 1);
    return l;
  }
  function anahtarRC(rc) { return rc[0] + "," + rc[1]; }

  function gen(rnd, sv) {
    var n = sv === 3 ? 6 : 5, bas = [rnd.int(0, n - 1), rnd.int(0, n - 1)], yon = 0, komut = [], i;
    if (sv < 3) {
      var m = sv === 1 ? rnd.int(3, 4) : rnd.int(5, 7), r = bas[0], c = bas[1];
      for (i = 0; i < m; i++) {
        var ad = [0, 1, 2, 3].filter(function (y) { var rr = r + DR[y][0], cc = c + DR[y][1]; return rr >= 0 && cc >= 0 && rr < n && cc < n; });
        // geri dönüşü (hemen tersine gitmeyi) seyrek tut
        if (komut.length) { var son = komut[komut.length - 1].y, ad2 = ad.filter(function (y) { return y !== (son + 2) % 4; }); if (ad2.length) ad = ad2; }
        var y = rnd.pick(ad);
        komut.push({ t: "ok", y: y }); r += DR[y][0]; c += DR[y][1];
      }
      // 1. seviye: hep aynı yöne giden komutlar (ör. →→→) çok kolay; en az iki yön
      var yonler = {};
      komut.forEach(function (k) { yonler[k.y] = 1; });
      if (Object.keys(yonler).length < 2) return null;
      if (!komut.some(function (k) { return k.y % 2 === 1; }) || !komut.some(function (k) { return k.y % 2 === 0; })) return null;
    } else {
      yon = rnd.int(0, 3);
      var adimSay = rnd.int(3, 4), f = yon, rr2 = bas[0], cc2 = bas[1];
      for (i = 0; i < adimSay; i++) {
        if (i > 0) { var dn = rnd.pick(["sag", "sol"]); komut.push({ t: "don", y: dn }); f = (f + (dn === "sag" ? 1 : 3)) % 4; }
        var maxN = 0;
        for (var k = 1; k <= 3; k++) { var a = rr2 + DR[f][0] * k, b = cc2 + DR[f][1] * k; if (a >= 0 && b >= 0 && a < n && b < n) maxN = k; else break; }
        if (!maxN) return null;
        var st = rnd.int(1, maxN);
        komut.push({ t: "ileri", n: st }); rr2 += DR[f][0] * st; cc2 += DR[f][1] * st;
      }
      if (!komut.some(function (x) { return x.t === "don" && x.y === "sag"; }) && !komut.some(function (x) { return x.t === "don" && x.y === "sol"; })) return null;
    }
    var dog = yuru(n, bas, yon, komut);
    if (dog.disari || anahtarRC(dog.son) === anahtarRC(bas)) return null;
    // çeldiriciler
    var aday = [];
    aday.push({ ad: "lr", k: tersLR(komut) });
    if (sv < 3) aday.push({ ad: "ud", k: tersUD(komut) });
    else aday.push({ ad: "ekran", k: komut, ekran: true });
    var eks = rnd.shuffle(komut.map(function (_, j) { return j; }));
    eks.forEach(function (j) { aday.push({ ad: "eksik", k: eksik(komut, j), j: j }); });
    var hedef = [{ ad: "dogru", son: dog.son }], gor = {};
    gor[anahtarRC(dog.son)] = 1; gor[anahtarRC(bas)] = 1;
    var tur = {};
    aday.forEach(function (a) {
      if (hedef.length >= 4 || tur[a.ad]) return;
      var s = yuru(n, bas, yon, a.k, { ekran: a.ekran });
      if (s.son[0] < 0 || s.son[1] < 0 || s.son[0] >= n || s.son[1] >= n) return;
      var key = anahtarRC(s.son);
      if (gor[key]) return;
      gor[key] = 1; tur[a.ad] = 1;
      hedef.push({ ad: a.ad, son: s.son, j: a.j });
    });
    if (hedef.length < 4) return null;
    var kar = rnd.shuffle(hedef), harf = {}, dogru = -1;
    kar.forEach(function (h, j) { harf[BQ.HARF[j]] = h.son; if (h.ad === "dogru") dogru = j; });
    var d = { n: n, bas: bas, yon: yon, komut: komut, harf: harf, siklar: ["A kutusu", "B kutusu", "C kutusu", "D kutusu"] };
    var q = {
      soru: sv < 3 ? "Robot komutları sırayla uygularsa hangi harfli kareye varır?" : "Robot turuncu okun gösterdiği yöne bakıyor. Komutları sırayla uygularsa hangi harfli kareye varır?",
      fig: sahne(d, { etiket: n + "×" + n + " ızgarada robot, harfli kareler ve " + komut.length + " komut" }),
      tur: "metin",
      sec: d.siklar.slice(),
      dogru: dogru,
      data: d,
      cozumFig: sahne(d, { yol: dog.yol, dogruHarf: BQ.HARF[dogru] })
    };
    q.adim = aciklama(d, dog, kar, dogru, sv);
    return q;
  }

  function aciklama(d, dog, kar, dg, sv) {
    var a = [];
    if (sv < 3) {
      a.push("Parmağını robotun üstüne koy ve her komutta <b>bir kare</b> ilerlet. Okların yönü ekrana göredir: ↑ yukarı, → sağa, ↓ aşağı, ← sola.");
      var sat = 0, sut = 0;
      d.komut.forEach(function (k) { sat += DR[k.y][0]; sut += DR[k.y][1]; });
      var par = [];
      if (sut) par.push(Math.abs(sut) + " kare " + (sut > 0 ? "sağa" : "sola"));
      if (sat) par.push(Math.abs(sat) + " kare " + (sat > 0 ? "aşağı" : "yukarı"));
      a.push("Komutlar: " + d.komut.map(function (k) { return OK[k.y]; }).join(" ") + ". Sağa–sola ve yukarı–aşağı adımları ayrı ayrı topla: sonuçta robot başladığı yerden <b>" + (par.join(" ve ") || "hiç") + "</b> gider.");
    } else {
      a.push("Robotun <b>kendi</b> sağı ve solu önemli. Kendini robotun yerine koy: yüzün turuncu oka dönük. \"sağa\" / \"sola\" kartı robotu olduğu yerde döndürür; sayılı \"ileri\" kartı baktığı yöne o kadar kare yürütür.");
      var f = d.yon, t = [];
      d.komut.forEach(function (k) {
        if (k.t === "don") { f = (f + (k.y === "sag" ? 1 : 3)) % 4; t.push((k.y === "sag" ? "sağa" : "sola") + " dönünce ekranda <b>" + YON_AD[f] + "</b> bakar"); }
        else t.push(k.n + " adım " + YON_AD[f] + " gider");
      });
      a.push("Başta robot ekranda " + YON_AD[d.yon] + " bakıyor. Sonra: " + t.join(", ") + ".");
    }
    var tuzak = { lr: "sağ ile solu karıştıran", ud: "yukarı ile aşağıyı karıştıran", eksik: "bir adımı atlayan", ekran: "dönüşleri robota göre değil ekrana göre yapan" }, el = [];
    kar.forEach(function (h, j) { if (h.ad !== "dogru") el.push(tuzak[h.ad] + " <b>" + BQ.HARF[j] + "</b> karesine gider"); });
    a.push("Robot <b>" + BQ.HARF[dg] + "</b> karesine varır. Yolu çizerek kontrol et.");
    a.push("Dikkat: " + el.join("; ") + ".");
    a.push("Doğru cevap <b>" + BQ.HARF[dg] + "</b>.");
    return a;
  }

  BQ.reg("yon", {
    ad: "Yön",
    gen: gen,
    coz: function (q) {
      var d = q.data, s = yuru(d.n, d.bas, d.yon, d.komut);
      if (s.disari) throw new Error("yol ızgaradan çıkıyor");
      var gor = {};
      Object.keys(d.harf).forEach(function (h) { var k = anahtarRC(d.harf[h]); if (gor[k]) throw new Error("harfli kareler çakışıyor"); gor[k] = 1; });
      if (gor[anahtarRC(d.bas)]) throw new Error("harf robotun karesinde");
      var es = d.siklar.map(function (t, i) { var h = t.charAt(0), rc = d.harf[h]; return rc && rc[0] === s.son[0] && rc[1] === s.son[1] ? i : -1; }).filter(function (i) { return i >= 0; });
      if (es.length !== 1) throw new Error("eşleşen şık " + es.length);
      return es[0];
    }
  });
})(window.BQ);

;/* Tamakala Games · BİLSEM sınırsız pratik modülü. <section class="bqp" data-konu="matris|karma" data-seviye="1"> */
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

;/* Tamakala Games · BİLSEM sınav provası. <section class="bqs" data-konular='[{"k":"matris","slug":"...","ad":"Matris","vid":"..."}]'>
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
    /* Kesin kaydırma: telefonda dokunma kaydırması sürerken de çalışsın diye anında + rAF + iki gecikmeli deneme */
    function ustBosluk() { var n = document.querySelector("body > header, body > nav, .nav, .topbar"); var h = n ? n.getBoundingClientRect() : null; return (h && h.bottom > 0 && h.bottom < 160 && getComputedStyle(n).position !== "static" ? h.bottom : 0) + 12; }
    function kaydir(hedef, odak) {
      hedef = hedef || kok;
      function yap() { var y = hedef.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - ustBosluk(); var t = Math.max(0, Math.round(y)); try { window.scrollTo({ top: t, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, t); } }
      yap();
      if (window.requestAnimationFrame) requestAnimationFrame(yap);
      setTimeout(yap, 150); setTimeout(yap, 500); setTimeout(yap, 1000);
      if (odak) { odak.tabIndex = -1; try { odak.focus({ preventScroll: true }); } catch (e) { } }
    }
    function yukari() { var r = kok.getBoundingClientRect(); if (r.top < 0 || r.top > window.innerHeight * 0.6) kaydir(kok); }
    /* Yarım kalan ve biten prova cihazda saklanır (soru yerine tohum: küçük kayıt, aynı soru yeniden üretilir) */
    function sakla() {
      if (!S) return;
      var o = { sv: S.sv, tip: S.tip, b: S.b, i: S.i, bitti: S.bitti, t0: S.t0, tb: S.tb || 0, sd: !!S.sd,
        B: S.B.map(function (b) { return { idx: b.idx, sure: b.sure, kalan: Math.round(b.kalan * 10) / 10, bitti: b.bitti }; }),
        Q: S.Q.map(function (c) { return { k: c.k, t: c.q.tohum, c: c.c, f: c.f ? 1 : 0, sn: Math.round(c.sn * 10) / 10, bg: c.bg ? 1 : 0, b: c.b }; }) };
      ls(S.bitti ? "bqs-son" : "bqs-aktif", o);
      if (S.bitti) { try { localStorage.removeItem("bqs-aktif"); } catch (e) { } }
    }
    function yukle(o) {
      try {
        var Y = { sv: o.sv, tip: o.tip, b: o.b, i: o.i || 0, bitti: !!o.bitti, t0: o.t0, tb: o.tb, sd: o.sd, B: o.B, Q: [] };
        o.Q.forEach(function (x) { if (!KM[x.k]) throw 0; Y.Q.push({ q: BQ.uret(x.k, o.sv, x.t), k: x.k, c: x.c, f: !!x.f, sn: x.sn || 0, bg: !!x.bg, b: x.b }); });
        return Y;
      } catch (e) { return null; }
    }
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
      var aktif = ls("bqs-aktif"), sonK = ls("bqs-son");
      if ((aktif && aktif.Q) || (sonK && sonK.Q)) {
        var dv = el("div", "bqs-devam");
        if (aktif && aktif.Q) {
          var ab = aktif.B[aktif.b] || {};
          dv.appendChild(btn("bqp-b1", "Yarım kalan provaya devam et <small>" + SV_AD[aktif.sv] + " · " + (aktif.B.length > 1 ? (aktif.b + 1) + ". bölüm · " : "") + "kalan " + saat(ab.kalan || 0) + "</small>", function () {
            var Y = yukle(aktif); if (!Y) { try { localStorage.removeItem("bqs-aktif"); } catch (e) { } return giris(); }
            S = Y; if (S.B[S.b].bitti) { if (S.b < S.B.length - 1) ara(false); else { S.bitti = true; S.tb = Date.now(); sonuc(false); } } else bolumBasla(S.i);
          }));
        }
        if (sonK && sonK.Q) {
          dv.appendChild(btn(aktif && aktif.Q ? "bqp-b2" : "bqp-b1", "Son prova sonucunu gör <small>" + SV_AD[sonK.sv] + " · " + tarih(sonK.tb || sonK.t0) + "</small>", function () {
            var Y = yukle(sonK); if (!Y) { try { localStorage.removeItem("bqs-son"); } catch (e) { } return giris(); }
            S = Y; S.bitti = true; sonuc(S.sd, true);
          }));
        }
        g.insertBefore(dv, g.children[1]);
      }
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

    function bolumBasla(i) {
      temizle();
      S.i = i || 0;
      var say = 0;
      var bol = S.B[S.b];
      var son = Date.now();
      sinavEkrani();
      tik = setInterval(function () {
        var simdi = Date.now(), dt = (simdi - son) / 1000; son = simdi;
        bol.kalan -= dt;
        var cur = S.Q[bol.idx[S.i]];
        if (cur) cur.sn += dt;
        zamanYaz();
        if (++say % 8 === 0) sakla();
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
      ust.appendChild(btn("bqs-cik", "Çık", function () { onay("Provadan çıkmak istiyor musunuz? Bu prova kaydedilmez.", "Çık", function () { clearInterval(tik); S = null; try { localStorage.removeItem("bqs-aktif"); } catch (e) { } giris(); kaydir(kok); }); }));
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
      sakla();
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
      if (kok.querySelector(".bqs-onay")) return;
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
      if (S.b < S.B.length - 1) { sakla(); return ara(sureDoldu); }
      S.bitti = true; S.tb = Date.now(); S.sd = !!sureDoldu;
      sakla();
      sonuc(sureDoldu);
    }

    function ara(sureDoldu) {
      temizle();
      var bol = S.B[S.b], dolu = bol.idx.filter(function (qi) { return S.Q[qi].c >= 0; }).length;
      var a = el("div", "bqs-ara");
      a.innerHTML = '<div class="bqs-ara-ik" aria-hidden="true">☕</div><h3>' + (S.b + 1) + ". bölüm tamamlandı" + (sureDoldu ? " (süre doldu)" : "") + "</h3>" +
        "<p>" + dolu + " / " + bol.idx.length + " soruyu cevapladınız. Cevaplar sonuç ekranında gösterilecek.</p>" +
        "<p>Sıradaki: <b>" + (S.b + 2) + ". bölüm · " + S.B[S.b + 1].idx.length + " soru · " + DAKIKA[S.sv] + " dakika</b>. Kısa bir mola verip hazır olduğunuzda başlayın.</p>";
      a.appendChild(btn("bqp-b1", (S.b + 2) + ". bölümü başlat <span aria-hidden=\"true\">→</span>", function () { S.b++; bolumBasla(); kaydir(kok); }));
      kok.appendChild(a);
      kaydir(kok, a.querySelector("h3"));
    }

    /* ------------------------------------------------ sonuç */
    function sonuc(sureDoldu, eski) {
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
      var tb = S.tb || Date.now();
      for (var i = gecmis.length - 1; i >= 0; i--) if (gecmis[i].sv === S.sv && gecmis[i].tip === S.tip && gecmis[i].t < tb) { once = gecmis[i]; break; }
      var kay = { t: tb, sv: S.sv, tip: S.tip, d: d, n: N, sn: Math.round(kullan), k: {} };
      KON.forEach(function (x) { kay.k[x.k] = [kk[x.k][0], kk[x.k][1]]; });
      if (!gecmis.some(function (x) { return x.t === tb; })) {
        gecmis.push(kay);
        if (gecmis.length > 30) gecmis = gecmis.slice(-30);
        ls(ANAH, gecmis);
      }

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
      dg.appendChild(btn("bqp-b1", "Yeni sorularla tekrar dene", function () { ayar.sv = S.sv; ayar.tip = S.tip; baslat(); kaydir(kok); }));
      dg.appendChild(btn("bqp-b2", "Ayarları değiştir", function () { giris(); kaydir(kok); }));
      dg.appendChild(btn("bqp-b2", "Yazdır", function () { window.print(); }));
      r.appendChild(dg);
      kok.appendChild(r);
      kaydir(kok, r.querySelector(".bqs-ozet-m h3"));
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
      return '<svg class="bqs-radar" viewBox="-80 -6 ' + (W + 160) + " " + (H + 20) + '" role="img" aria-label="Beceri haritası: ' + et + '">' + s + "</svg>";
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

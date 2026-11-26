/* Yön — ızgarada robot ve komut dizisi; "Robot nereye varır?" Harfli kareler (A–D) şık.
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

/* Kâğıt katlama ve ayna — (a) aynadaki görüntü, (b) katla, del, aç.
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

/* Döndürme — ızgara deseni çeyrek / yarım tur döner.
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

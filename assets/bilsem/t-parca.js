/* Parça-bütün — karo deseninde eksik parçayı bul.
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

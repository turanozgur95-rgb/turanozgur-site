/* Matris (eksik parçayı bul) — 3×3 tablo, özellik başına kural: sabit, satır, sütun, latin, latin2, ilerleme */
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

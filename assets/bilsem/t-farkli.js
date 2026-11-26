/* Farklı olan ve şekil benzeşimi.
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

/* Örüntü — bir sıra kutu + "?" kutusu. Her özellik (şekil, renk, sayı, okun yönü, boyut) ayrı kurala uyar.
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

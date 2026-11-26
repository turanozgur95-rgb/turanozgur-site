/* Bellek — (a) görsel bellek: ızgaradaki şekiller birkaç saniye gösterilir, sonra "Bu kutuda hangi şekil vardı?" / "Hangi şekil yoktu?"
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

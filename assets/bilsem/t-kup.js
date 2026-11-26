/* Küp sayma — izometrik küp yığını. Kural: havada küp durmaz (üstte küp varsa altı doludur).
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

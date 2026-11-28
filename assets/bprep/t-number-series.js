/* Number Series (CogAT quantitative style): bead abacus rods side by side. The number of beads follows a pattern;
   pick the next rod. A rod = [red beads, blue beads]. Beads fill ten-frame style: 5 per wire, left wire first. */
(function (BP) {
  "use strict";
  var SHOWN = 5, MAXSUM = 12, RED = "#ef4d56", BLUE = "#3d7ff2";

  // ---------------------------------------------------------------- independent solver
  function predict(v) {
    var out = [], n = v.length, d = [], i;
    for (i = 0; i < n - 1; i++) d.push(v[i + 1] - v[i]);
    function all(f, from, to) { for (var k = from; k < to; k++) if (!f(k)) return false; return true; }
    if (all(function (k) { return d[k] === d[0]; }, 0, d.length)) out.push(v[n - 1] + d[0]);                       // constant step
    if (all(function (k) { return v[k] === v[k - 2]; }, 2, n)) out.push(v[n - 2]);                                // 2-step repeat
    if (n >= 4 && all(function (k) { return v[k] === v[k - 3]; }, 3, n)) out.push(v[n - 3]);                      // 3-step repeat
    if (d.length >= 3 && all(function (k) { return d[k] - d[k - 1] === 1; }, 1, d.length)) out.push(v[n - 1] + d[d.length - 1] + 1); // steps grow by 1
    return out;
  }
  function solve(q) {
    var d = q.data, reds = d.rods.map(function (r) { return r[0]; }), blues = d.rods.map(function (r) { return r[1]; });
    var pr = predict(reds), pb = predict(blues), hit = [];
    d.opts.forEach(function (o, i) { if (pr.indexOf(o[0]) >= 0 && pb.indexOf(o[1]) >= 0) hit.push(i); });
    if (hit.length !== 1) throw new Error("rods fitting: " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function rod(x, y, w, h, beads, nw) {
    var base = y + h * 0.9, top = y + h * 0.05, colw = Math.min(w * 0.84 / nw, w * 0.42), cx = x + w / 2, s = "", i;
    var wires = [];
    for (i = 0; i < nw; i++) wires.push(cx + (i - (nw - 1) / 2) * colw);
    wires.forEach(function (wx) { s += '<line x1="' + BP.f1(wx) + '" y1="' + BP.f1(top) + '" x2="' + BP.f1(wx) + '" y2="' + BP.f1(base) + '" stroke="#8a6a46" stroke-width="' + BP.f1(Math.max(2.5, w * 0.03)) + '" stroke-linecap="round"/>'; });
    var pw = colw * (nw + 0.3);
    s += '<rect x="' + BP.f1(cx - pw / 2) + '" y="' + BP.f1(base) + '" width="' + BP.f1(pw) + '" height="' + BP.f1(h * 0.06) + '" rx="3" fill="#8a6a46"/>';
    var rowh = (base - top) / 5, rad = Math.min(colw * 0.47, rowh * 0.47), k;
    for (k = 0; k < beads[0] + beads[1]; k++) {
      var bx = wires[Math.floor(k / 5)], by = base - rowh * (k % 5 + 0.5);
      s += '<circle cx="' + BP.f1(bx) + '" cy="' + BP.f1(by) + '" r="' + BP.f1(rad) + '" fill="' + (k < beads[0] ? RED : BLUE) + '" stroke="' + BP.INK + '" stroke-width="1.6"/>' +
        '<circle cx="' + BP.f1(bx - rad * 0.33) + '" cy="' + BP.f1(by - rad * 0.33) + '" r="' + BP.f1(rad * 0.25) + '" fill="#fff" opacity="0.5"/>';
    }
    return s;
  }
  function nwFor(rods, opts) {
    var m = 1; rods.concat(opts).forEach(function (r) { m = Math.max(m, r[0] + r[1]); });
    return Math.min(3, Math.ceil(m / 5));
  }
  function figure(rods, ans, nw, label) {
    var bw = 78, gap = 10, h = 140, W = (SHOWN + 1) * bw + (SHOWN + 2) * gap, H = h + 2 * gap, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>', i;
    for (i = 0; i < SHOWN; i++) s += BP.box(gap + i * (bw + gap), gap, bw, rod(gap + i * (bw + gap), gap + 4, bw, h - 8, rods[i], nw), { h: h });
    var x = gap + SHOWN * (bw + gap);
    s += ans ? BP.box(x, gap, bw, rod(x, gap + 4, bw, h - 8, ans, nw), { h: h, mark: "#1fa866" }) : BP.box(x, gap, bw, "", { h: h, ask: true });
    return BP.svg(W, H, s, label);
  }

  // ---------------------------------------------------------------- generator
  function seq(rnd, kind) {
    var out = [], i, s, st, a, b, v;
    switch (kind) {
      case "up1": case "down1": case "up2": case "down2":
        st = { up1: 1, down1: -1, up2: 2, down2: -2 }[kind];
        var span = Math.abs(st) * SHOWN;
        s = st > 0 ? rnd.int(1, MAXSUM - span) : rnd.int(1 + span, MAXSUM);
        for (i = 0; i <= SHOWN; i++) out.push(s + st * i);
        return out;
      case "rep2":
        a = rnd.int(1, 8); b = rnd.int(1, 8); if (a === b) return [];
        for (i = 0; i <= SHOWN; i++) out.push(i % 2 ? b : a);
        return out;
      case "rep3":
        v = [rnd.int(1, 7), rnd.int(1, 7), rnd.int(1, 7)];
        if (v[0] === v[1] || v[1] === v[2] || v[0] === v[2]) return [];
        for (i = 0; i <= SHOWN; i++) out.push(v[i % 3]);
        return out;
      case "grow":
        var x = rnd.int(0, 1);
        for (i = 0; i <= SHOWN; i++) { out.push(x); x += i + 1; }
        return out;
      case "flat":
        v = rnd.int(1, 5);
        for (i = 0; i <= SHOWN; i++) out.push(v);
        return out;
    }
  }
  var WORD = { up1: "1 more each time", down1: "1 fewer each time", up2: "2 more each time", down2: "2 fewer each time",
    rep2: "two numbers that take turns", rep3: "three numbers that repeat", grow: "more each time: the jump grows (+1, +2, +3 ...)", flat: "always the same" };

  function gen(rnd, lv) {
    var rk, bk = "";
    if (lv === 1) rk = rnd.pick(["up1", "down1", "rep2"]);
    else if (lv === 2) { if (rnd.chance(0.4)) { rk = rnd.pick(["up1", "down1"]); bk = "flat"; } else rk = rnd.pick(["up2", "down2", "rep2"]); }
    else if (rnd.chance(0.4)) rk = "rep3";
    else { rk = rnd.pick(["up1", "up2", "down1", "down2"]); bk = rnd.pick(["down1", "up1", "flat", "rep2"]); if (bk === "flat" && /1$/.test(rk)) return null; }
    var red = seq(rnd, rk), blue = bk ? seq(rnd, bk) : null, two = !!bk;
    if (!red.length || (two && !blue.length)) return null;
    var rods = [], i;
    for (i = 0; i <= SHOWN; i++) {
      var r = red[i], b = two ? blue[i] : 0;
      if (r < 0 || b < 0 || r + b < 1 || r + b > MAXSUM) return null;
      rods.push([r, b]);
    }
    var ans = rods[SHOWN], shown = rods.slice(0, SHOWN), last = shown[SHOWN - 1];
    var dis = two ? [[ans[0], ans[1] + 1], [ans[1], ans[0]], last, [ans[0] + 1, ans[1]], [ans[0], ans[1] - 1], [ans[0] - 1, ans[1]], [ans[0] + 1, ans[1] + 1]]
      : [last, [ans[0] + 1, 0], [ans[0] - 1, 0], [ans[0] + 2, 0], shown[0], [ans[0] - 2, 0]];
    dis = rnd.shuffle(dis.filter(function (r) { return r[0] >= 0 && r[1] >= 0 && r[0] + r[1] >= 1 && r[0] + r[1] <= MAXSUM; }));
    var o = BP.options(rnd, ans, dis, null, lv === 3 ? 5 : 4);
    if (!o) return null;
    var nw = nwFor(shown, o.list);
    var rt = shown.map(function (r) { return r[0]; }).join(", "), bt = shown.map(function (r) { return r[1]; }).join(", ");
    var label = "Bead rods in a row. Red beads: " + rt + (two ? ". Blue beads: " + bt : "") + ". Then a question mark";
    var opts = o.list.map(function (r) { return BP.tile(rod(14, 12, 80, 88, r, nw), 100); });
    var steps = [
      "Count the beads on each rod, one rod at a time. " + (two ? "Red beads: <b>" + rt + "</b>. Blue beads: <b>" + bt + "</b>." : "You get: <b>" + rt + "</b>."),
      two ? "Look at each color alone. Red: " + WORD[rk] + ". Blue: " + WORD[bk] + "." : "Find the pattern: " + WORD[rk] + ".",
      "So the next rod has <b>" + ans[0] + " red</b>" + (two ? " and <b>" + ans[1] + " blue</b>" : "") + " beads.",
      "Careful: repeating the last rod (" + last[0] + (two ? " red, " + last[1] + " blue" : "") + ") or being one bead off does not follow the pattern. Count the beads in each choice.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    return { prompt: "Which rod comes next?", speak: "Count the beads on each rod. The beads follow a pattern. Which rod comes next?",
      fig: figure(shown, null, nw, label), kind: "svg", opts: opts, answer: o.answer, steps: steps,
      solutionFig: figure(shown, ans, nw, "Solved: the next rod has " + ans[0] + " red" + (two ? " and " + ans[1] + " blue" : "") + " beads"),
      data: { rods: shown, opts: o.list } };
  }

  BP.reg("number-series", { name: "Number Series", group: "quant", gen: gen, solve: solve });
})(window.BP);

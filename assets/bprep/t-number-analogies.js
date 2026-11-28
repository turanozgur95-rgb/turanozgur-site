/* Number Analogies (CogAT quantitative style): 2×2 number boxes drawn with groups of simple objects.
   A box holds a group (or two groups) of objects. A changes into B by a number rule; apply the same rule to C.
   Rules: +/-k, double, triple, half, share into 2 equal groups. Options are pictures of object groups. */
(function (BP) {
  "use strict";
  var OBJ = [
    { s: "circle", c: "red", n: "red balls" }, { s: "star", c: "yellow", n: "stars" }, { s: "circle", c: "blue", n: "blue beads" },
    { s: "heart", c: "pink", n: "hearts" }, { s: "diamond", c: "purple", n: "gems" }, { s: "hexagon", c: "orange", n: "orange tiles" },
    { s: "triangle", c: "green", n: "green triangles" }, { s: "square", c: "red", n: "red blocks" }];
  var RULES = ["same", "x2", "x3", "half", "third", "split"];
  var k;
  for (k = 1; k <= 9; k++) { RULES.push("+" + k); RULES.push("-" + k); }

  function key(g) { return JSON.stringify(g); }
  function apply(rule, g) {
    if (g.length !== 1) return null;
    var n = g[0], v;
    if (rule === "same") return [n];
    if (rule === "x2") return [n * 2];
    if (rule === "x3") return [n * 3];
    if (rule === "half") return n % 2 === 0 ? [n / 2] : null;
    if (rule === "third") return n % 3 === 0 ? [n / 3] : null;
    if (rule === "split") return n % 2 === 0 ? [n / 2, n / 2] : null;
    v = rule.charAt(0) === "+" ? n + Number(rule.slice(1)) : n - Number(rule.slice(1));
    return v >= 1 ? [v] : null;
  }
  // every prediction for C made by a rule that turns A into B
  function preds(a, b, c) {
    var out = {};
    RULES.forEach(function (r) {
      var x = apply(r, a);
      if (x && key(x) === key(b)) { var p = apply(r, c); if (p) out[key(p)] = p; }
    });
    return out;
  }
  function solve(q) {
    var d = q.data, P = preds(d.a, d.b, d.c), hit = [];
    d.opts.forEach(function (o, i) { if (P[key(o)]) hit.push(i); });
    if (hit.length !== 1) throw new Error("options matching rules: " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function pileOne(n, M, x, y, w, h, o) {
    var bs = 0, bc = 1, c, r, cs, rows, i, out = "";
    for (c = 1; c <= M; c++) { r = Math.ceil(M / c); cs = Math.min(w / c, h / r); if (cs > bs + 0.01) { bs = cs; bc = c; } }
    bs = Math.min(bs, w * 0.5);
    rows = Math.ceil(n / bc);
    var y0 = y + (h - rows * bs) / 2;
    for (i = 0; i < n; i++) {
      var row = Math.floor(i / bc), inRow = Math.min(bc, n - row * bc), x0 = x + (w - inRow * bs) / 2;
      out += BP.shape(o.s, x0 + (i % bc + 0.5) * bs, y0 + (row + 0.5) * bs, bs * 0.42, o.c);
    }
    return out;
  }
  function groupsSvg(g, x, y, w, o, M) {
    var pad = 8, inner;
    if (g.length === 1) inner = pileOne(g[0], M, x + pad, y + pad, w - 2 * pad, w - 2 * pad, o);
    else {
      var hw = (w - 2 * pad) / 2;
      inner = pileOne(g[0], M, x + pad, y + pad, hw, w - 2 * pad, o) + pileOne(g[1], M, x + pad + hw, y + pad, hw, w - 2 * pad, o) +
        '<line x1="' + (x + w / 2) + '" y1="' + (y + 12) + '" x2="' + (x + w / 2) + '" y2="' + (y + w - 12) + '" stroke="#b7c3dc" stroke-width="2.5" stroke-dasharray="5 5"/>';
    }
    return inner;
  }
  function boxSvg(g, x, y, w, o, M, bo) { return BP.box(x, y, w, groupsSvg(g, x, y, w, o, M), bo); }
  function arrow(x, y) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 36) + '" y2="' + y + '" stroke="#7b8bb0" stroke-width="5" stroke-linecap="round"/>' +
      '<polygon points="' + (x + 46) + "," + y + " " + (x + 32) + "," + (y - 10) + " " + (x + 32) + "," + (y + 10) + '" fill="#7b8bb0"/>';
  }
  function figure(a, b, c, d, o1, o2, M, label) {
    var W = 392, H = 358, bw = 150, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>';
    s += boxSvg(a, 14, 14, bw, o1, M) + boxSvg(b, 14 + bw + 64, 14, bw, o1, M);
    s += boxSvg(c, 14, 14 + bw + 30, bw, o2, M);
    s += d ? boxSvg(d, 14 + bw + 64, 14 + bw + 30, bw, o2, M, { mark: "#1fa866" }) : BP.box(14 + bw + 64, 14 + bw + 30, bw, "", { ask: true });
    s += arrow(14 + bw + 9, 14 + bw / 2) + arrow(14 + bw + 9, 14 + bw + 30 + bw / 2);
    return BP.svg(W, H, s, label);
  }

  // ---------------------------------------------------------------- words
  function say(g, o) { return g.length === 1 ? g[0] + " " + o.n : "two groups: " + g[0] + " and " + g[1] + " " + o.n; }
  function words(rule) {
    var n = rule.slice(1);
    if (rule.charAt(0) === "+") return "add " + n + " (" + n + " more)";
    if (rule.charAt(0) === "-") return "take away " + n + " (" + n + " fewer)";
    return { x2: "double it (2 times as many)", x3: "make 3 times as many", half: "take half (share into 2 equal groups, keep one group)", split: "share into 2 equal groups" }[rule];
  }
  function calc(rule, from, to) {
    var f = from[0], n = rule.slice(1);
    if (rule.charAt(0) === "+") return f + " + " + n + " = " + to[0];
    if (rule.charAt(0) === "-") return f + " − " + n + " = " + to[0];
    if (rule === "x2") return f + " + " + f + " = " + to[0];
    if (rule === "x3") return f + " × 3 = " + to[0];
    if (rule === "half") return "half of " + f + " is " + to[0];
    return f + " shared into 2 equal groups is " + to[0] + " and " + to[1];
  }

  // ---------------------------------------------------------------- generator
  function gen(rnd, lv) {
    var pool = lv === 1 ? ["+1", "-1"] : lv === 2 ? ["+2", "-2", "+3", "-3"] : ["x2", "half", "x2", "half", "split", "x3", "+4", "-4"];
    var rule = rnd.pick(pool), hi = lv === 1 ? 6 : lv === 2 ? 8 : 10;
    var a = [rnd.int(1, hi)], c = [rnd.int(1, hi)];
    if (a[0] === c[0]) return null;
    var b = apply(rule, a), d = apply(rule, c);
    if (!b || !d || Math.max(b[0], d[0], b[1] || 0) > 10) return null;
    var i1 = rnd.int(0, OBJ.length - 1), i2 = rnd.int(0, OBJ.length - 1);
    if (OBJ[i1].s === OBJ[i2].s && OBJ[i1].c === OBJ[i2].c || i1 === i2) return null;
    var o1 = OBJ[i1], o2 = OBJ[i2], dv = d.length === 1 ? d[0] : null, dis;
    if (dv !== null) dis = [b, c, [dv + 1], [dv - 1], [dv + 2], [dv - 2]];
    else { var h = d[0]; dis = [c, [h, h + 1], [h + 1, h + 1], [h - 1, h - 1], [h - 1, h + 1], b]; }
    var P = preds(a, b, c);
    dis = rnd.shuffle(dis.filter(function (g) {
      return g.every(function (v) { return v >= 1 && v <= 10; }) && !P[key(g)] && key(g) !== key(d);
    }));
    var o = BP.options(rnd, d, dis, key, 4);
    if (!o) return null;
    var M = 1;
    [a, b, c].concat(o.list).forEach(function (g) { g.forEach(function (v) { M = Math.max(M, v); }); });
    var label = "Number boxes. Top row: " + say(a, o1) + " then " + say(b, o1) + ". Bottom row: " + say(c, o2) + " then a question mark";
    var fig = figure(a, b, c, null, o1, o2, M, label);
    var opts = o.list.map(function (g) { return BP.tile(groupsSvg(g, 4, 4, 100, o2, M), 100); });
    var split = dv === null;
    var steps = [
      "Look at the <b>top row</b>. The first box has <b>" + say(a, o1) + "</b>. The second box has <b>" + say(b, o1) + "</b>.",
      "What happened? " + BP.cap(words(rule)) + ": " + calc(rule, a, b) + ".",
      "Do the <b>same thing</b> in the bottom row. Start with " + say(c, o2) + ": " + words(rule) + ": " + calc(rule, c, d) + ".",
      split ? "Careful: the picture must show <b>two equal groups</b>. A single group, or two unequal groups, does not match the rule."
        : "Careful: " + b[0] + " only copies the top box, and " + c[0] + " changes nothing. The bottom row needs <b>" + dv + "</b>.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    var solutionFig = figure(a, b, c, d, o1, o2, M, "Solved: the empty box shows " + say(d, o2));
    return { prompt: split ? "The top two boxes go together. Which picture goes in the empty box?" : "The top two boxes go together. How many belong in the empty box?",
      speak: "Look at the top two boxes. They go together in a special way. Which picture belongs in the empty box, so the bottom two boxes go together in the same way?",
      fig: fig, kind: "svg", opts: opts, answer: o.answer, steps: steps, solutionFig: solutionFig,
      data: { a: a, b: b, c: c, opts: o.list } };
  }

  BP.reg("number-analogies", { name: "Number Analogies", group: "quant", gen: gen, solve: solve });
})(window.BP);

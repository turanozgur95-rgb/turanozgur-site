/* Pattern Completion (NNAT style): a big coloured pattern with a missing square piece. Which piece fits?
   The pattern follows one rule: mirror left-right (lr), mirror up-down (ud), turn-over symmetry (rot) or a small tile repeating (tile2/tile3). */
(function (BP) {
  "use strict";
  var FILL = { blue: BP.COLOR.blue, yellow: BP.COLOR.yellow, green: BP.COLOR.green, black: BP.COLOR.black, white: "#ffffff" };
  var RULES = ["lr", "ud", "rot", "tile2", "tile3"];
  var RULE_TXT = { lr: "The left side is a mirror picture of the right side.", ud: "The top half is a mirror picture of the bottom half.",
    rot: "If you turn the whole pattern upside down, it looks the same.", tile2: "A small 2 by 2 block repeats again and again.", tile3: "A small 3 by 3 block repeats again and again." };

  // ---------------------------------------------------------------- independent solver
  function partners(rule, n, r, c) {
    var out = [], i, j;
    if (rule === "lr") out.push([r, n - 1 - c]);
    else if (rule === "ud") out.push([n - 1 - r, c]);
    else if (rule === "rot") out.push([n - 1 - r, n - 1 - c]);
    else { var t = rule === "tile2" ? 2 : 3; for (i = r % t; i < n; i += t) for (j = c % t; j < n; j += t) out.push([i, j]); }
    return out;
  }
  function solve(q) {
    var d = q.data, n = d.n, k = d.k, g = d.grid, h = d.hole, preds = [];
    function inHole(r, c) { return r >= h[0] && r < h[0] + k && c >= h[1] && c < h[1] + k; }
    RULES.forEach(function (rule) {
      var ok = true, piece = [];
      for (var r = 0; r < n && ok; r++) for (var c = 0; c < n && ok; c++) {
        if (inHole(r, c)) continue;
        partners(rule, n, r, c).forEach(function (p) { if (!inHole(p[0], p[1]) && g[p[0]][p[1]] !== g[r][c]) ok = false; });
      }
      if (!ok) return;
      for (var i = 0; i < k && ok; i++) { piece.push([]); for (var j = 0; j < k && ok; j++) {
        var seen = {}, cnt = 0;
        partners(rule, n, h[0] + i, h[1] + j).forEach(function (p) { if (!inHole(p[0], p[1])) { seen[g[p[0]][p[1]]] = 1; cnt++; } });
        if (cnt === 0) ok = false; else piece[i].push(Object.keys(seen)[0]);
      } }
      if (ok) preds.push(piece);
    });
    if (!preds.length) throw new Error("no usable rule");
    var hit = [];
    d.opts.forEach(function (o, i) { if (preds.some(function (p) { return JSON.stringify(p) === JSON.stringify(o); })) hit.push(i); });
    if (hit.length !== 1) throw new Error("fits " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function cells(g, x0, y0, cs, hole, k) {
    var s = "";
    for (var r = 0; r < g.length; r++) for (var c = 0; c < g[r].length; c++) {
      if (hole && r >= hole[0] && r < hole[0] + k && c >= hole[1] && c < hole[1] + k) continue;
      s += '<rect x="' + BP.f1(x0 + c * cs) + '" y="' + BP.f1(y0 + r * cs) + '" width="' + BP.f1(cs) + '" height="' + BP.f1(cs) + '" fill="' + FILL[g[r][c]] + '" stroke="#8a93ad" stroke-width="1.2"/>';
    }
    return s;
  }
  function piece(p, x0, y0, S) { return cells(p, x0, y0, S / p.length) + '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + BP.INK + '" stroke-width="2.4"/>'; }
  function big(g, n, hole, k, fillIn) {
    var S = 264, cs = S / n, x0 = 14, y0 = 14, s = '<rect width="292" height="292" rx="18" fill="' + BP.BG + '"/>' + cells(g, x0, y0, cs, hole, k);
    if (fillIn) s += cells(fillIn, x0 + hole[1] * cs, y0 + hole[0] * cs, cs);
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + BP.INK + '" stroke-width="3"/>';
    var hx = x0 + hole[1] * cs, hy = y0 + hole[0] * cs, hs = k * cs;
    if (!fillIn) s += '<rect x="' + hx + '" y="' + hy + '" width="' + hs + '" height="' + hs + '" fill="' + BP.ASK + '" stroke="#e2a000" stroke-width="3" stroke-dasharray="7 5"/>' + BP.text(hx + hs / 2, hy + hs / 2 + hs * 0.18, "?", { size: hs * 0.55, color: "#e2a000", weight: 900 });
    else s += '<rect x="' + hx + '" y="' + hy + '" width="' + hs + '" height="' + hs + '" fill="none" stroke="#1fa866" stroke-width="4"/>';
    return s;
  }
  function flipH(p) { return p.map(function (r) { return r.slice().reverse(); }); }
  function flipV(p) { return p.slice().reverse().map(function (r) { return r.slice(); }); }
  function rot90(p) { var k = p.length; return p.map(function (_, r) { return p.map(function (_2, c) { return p[k - 1 - c][r]; }); }); }
  function key(p) { return p.map(function (r) { return r.join(","); }).join("/"); }

  // ---------------------------------------------------------------- generator
  var DIM = { 1: { n: 4, k: 2, cols: 2, rules: ["lr", "ud", "tile2"] }, 2: { n: 5, k: 2, cols: 3, rules: ["lr", "ud", "rot", "tile2"] }, 3: { n: 6, k: 3, cols: 4, rules: ["lr", "ud", "rot", "tile2", "tile3"] } };
  function gen(rnd, lv) {
    var D = DIM[lv], n = D.n, k = D.k, rule = rnd.pick(D.rules), palette = rnd.sample(BP.NNAT, D.cols), cls = {}, g = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); for (c = 0; c < n; c++) {
      var id = partners(rule, n, r, c).concat([[r, c]]).map(function (p) { return p[0] * n + p[1]; }).sort(function (a, b) { return a - b; })[0];
      if (cls[id] === undefined) cls[id] = rnd.pick(palette);
      g[r].push(cls[id]);
    } }
    var used = {}; g.forEach(function (row) { row.forEach(function (v) { used[v] = 1; }); });
    if (Object.keys(used).length < Math.min(D.cols, 3)) return null;
    var hole = [rnd.int(0, n - k), rnd.int(0, n - k)], ans = [];
    for (r = 0; r < k; r++) { ans.push([]); for (c = 0; c < k; c++) ans[r].push(g[hole[0] + r][hole[1] + c]); }
    if (Object.keys(ans.reduce(function (a, row) { row.forEach(function (v) { a[v] = 1; }); return a; }, {})).length < 2) return null;
    var dis = [flipH(ans), flipV(ans), rot90(ans), rot90(rot90(ans)), rot90(rot90(rot90(ans)))];
    var cand = [];
    for (var t = 0; t < 8; t++) { // change one square of the right piece
      var x = ans.map(function (row) { return row.slice(); }), rr = rnd.int(0, k - 1), cc = rnd.int(0, k - 1);
      x[rr][cc] = rnd.pick(palette.filter(function (v) { return v !== ans[rr][cc]; }));
      cand.push(x);
    }
    var sw = ans.map(function (row) { return row.map(function (v) { var i = palette.indexOf(v); return i < 0 ? v : palette[(i + 1) % palette.length]; }); }); // swapped colors
    dis = rnd.shuffle(dis).slice(0, 3).concat(cand.slice(0, 1), [sw], cand.slice(1));
    var o = BP.options(rnd, ans, dis, key, 5);
    if (!o) return null;
    var q = { prompt: "A piece is missing from the big pattern. Which piece fits the empty spot?",
      speak: "Look at the big pattern. One piece is missing. Which piece fits in the empty spot, so the pattern keeps going?",
      fig: BP.svg(292, 292, big(g, n, hole, k), "A colored square pattern with a missing piece"), kind: "svg",
      opts: o.list.map(function (p) { return BP.tile(piece(p, 14, 14, 76), 100); }), answer: o.answer,
      steps: [], solutionFig: BP.svg(292, 292, big(g, n, hole, k, ans), "The pattern with the piece in place"), data: { n: n, k: k, grid: g.map(function (row, i) { return row.map(function (v, j) { return (i >= hole[0] && i < hole[0] + k && j >= hole[1] && j < hole[1] + k) ? null : v; }); }), hole: hole, opts: o.list } };
    var mir = o.list.map(function (p, i) { return i; }).filter(function (i) { return i !== o.answer && (key(o.list[i]) === key(flipH(ans)) || key(o.list[i]) === key(flipV(ans)) || key(o.list[i]) === key(rot90(ans))); })[0];
    q.steps = [
      "Look at the whole pattern first. Do not look at the pieces yet. <b>Find the rule</b> that the colored squares follow.",
      RULE_TXT[rule] + " " + (rule.indexOf("tile") === 0 ? "Find the same block somewhere else on the pattern." : "Find the squares that match the empty spot on the other side."),
      "Copy the colors into the empty spot, square by square. " + (rule === "lr" ? "Left becomes right (flip it!)." : rule === "ud" ? "Top becomes bottom (flip it!)." : rule === "rot" ? "Turn the matching part upside down." : "The colors stay in the same order.") + " Check each corner of the piece.",
      "Be careful with look-alikes." + (mir !== undefined ? " Choice " + BP.LETTER[mir] + " has the right colors, but they are turned or flipped the wrong way." : " A piece with the right colors in the wrong places does not fit."),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }

  BP.reg("pattern-completion", { name: "Pattern Completion", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

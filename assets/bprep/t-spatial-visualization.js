/* Spatial Visualization (NNAT style). Two kinds of questions:
   "combine": two drawings are put on top of each other (top row shows how), pick the result for the bottom row;
   "turn":    a colored pattern is turned (quarter / half turn), pick how it looks afterwards. 5 options. */
(function (BP) {
  "use strict";
  var FILL = { blue: BP.COLOR.blue, yellow: BP.COLOR.yellow, green: BP.COLOR.green, black: BP.COLOR.black, white: "#ffffff" };
  var PN = ["a horizontal line", "a vertical line", "a slanted line (top-left to bottom-right)", "a slanted line (bottom-left to top-right)", "a ring", "a dot in the top-left corner", "a dot in the top-right corner", "a dot in the bottom-left corner", "a dot in the bottom-right corner", "a small square"];
  function skey(a) { return a.slice().sort(function (x, y) { return x - y; }).join(","); }
  function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function uni(a, b) { return sorted(a.concat(b.filter(function (x) { return a.indexOf(x) < 0; }))); }
  function xor(a, b) { return sorted(a.filter(function (x) { return b.indexOf(x) < 0; }).concat(b.filter(function (x) { return a.indexOf(x) < 0; }))); }

  // ---------------------------------------------------------------- drawing: parts card
  function card(parts, x, y, s) {
    var o = '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="' + s * 0.09 + '" fill="#fff" stroke="#cbd4e6" stroke-width="2.2"/>', p = s * 0.16, i;
    function L(x1, y1, x2, y2, col) { return '<line x1="' + BP.f1(x + x1 * s) + '" y1="' + BP.f1(y + y1 * s) + '" x2="' + BP.f1(x + x2 * s) + '" y2="' + BP.f1(y + y2 * s) + '" stroke="' + col + '" stroke-width="' + BP.f1(s * 0.07) + '" stroke-linecap="round"/>'; }
    var pad = 0.17;
    for (i = 0; i < parts.length; i++) {
      var k = parts[i];
      if (k === 0) o += L(pad, .5, 1 - pad, .5, BP.COLOR.blue);
      if (k === 1) o += L(.5, pad, .5, 1 - pad, BP.COLOR.green);
      if (k === 2) o += L(pad, pad, 1 - pad, 1 - pad, BP.COLOR.black);
      if (k === 3) o += L(pad, 1 - pad, 1 - pad, pad, BP.COLOR.black);
    }
    if (parts.indexOf(4) >= 0) o += '<circle cx="' + BP.f1(x + s / 2) + '" cy="' + BP.f1(y + s / 2) + '" r="' + BP.f1(s * 0.3) + '" fill="none" stroke="' + BP.COLOR.yellow + '" stroke-width="' + BP.f1(s * 0.075) + '"/>';
    if (parts.indexOf(9) >= 0) o += '<rect x="' + BP.f1(x + s * 0.36) + '" y="' + BP.f1(y + s * 0.36) + '" width="' + BP.f1(s * 0.28) + '" height="' + BP.f1(s * 0.28) + '" fill="#fff" stroke="' + BP.COLOR.green + '" stroke-width="' + BP.f1(s * 0.05) + '"/>';
    [[5, .24, .24], [6, .76, .24], [7, .24, .76], [8, .76, .76]].forEach(function (d) { if (parts.indexOf(d[0]) >= 0) o += '<circle cx="' + BP.f1(x + d[1] * s) + '" cy="' + BP.f1(y + d[2] * s) + '" r="' + BP.f1(s * 0.075) + '" fill="' + BP.COLOR.yellow + '" stroke="' + BP.INK + '" stroke-width="' + BP.f1(s * 0.025) + '"/>'; });
    return o;
  }
  // ---------------------------------------------------------------- drawing: colored grid
  function pgrid(g, x, y, s) {
    var n = g.length, cs = s / n, o = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) o += '<rect x="' + BP.f1(x + c * cs) + '" y="' + BP.f1(y + r * cs) + '" width="' + BP.f1(cs) + '" height="' + BP.f1(cs) + '" fill="' + FILL[g[r][c]] + '" stroke="#8a93ad" stroke-width="1.2"/>';
    return o + '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + BP.INK + '" stroke-width="2.4"/>';
  }
  function gkey(g) { return g.map(function (r) { return r.join(","); }).join("/"); }

  // ---------------------------------------------------------------- independent solver
  function turnCell(kind, n, r, c) { return kind === "cw" ? [c, n - 1 - r] : kind === "ccw" ? [n - 1 - c, r] : [n - 1 - r, n - 1 - c]; }
  function solve(q) {
    var d = q.data, hit = [], want, i;
    if (d.mode === "turn") {
      var n = d.grid.length; want = d.grid.map(function (r) { return r.slice(); });
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) { var p = turnCell(d.turn, n, r, c); want[p[0]][p[1]] = d.grid[r][c]; }
      d.opts.forEach(function (o, k) { if (gkey(o) === gkey(want)) hit.push(k); });
    } else {
      var ops = [];
      if (skey(uni(d.top[0], d.top[1])) === skey(d.top[2])) ops.push(uni);
      if (skey(xor(d.top[0], d.top[1])) === skey(d.top[2])) ops.push(xor);
      if (!ops.length) throw new Error("no rule");
      var preds = {}; ops.forEach(function (f) { preds[skey(f(d.bot[0], d.bot[1]))] = 1; });
      if (Object.keys(preds).length !== 1) throw new Error("two answers");
      want = Object.keys(preds)[0];
      d.opts.forEach(function (o, k) { if (skey(o) === want) hit.push(k); });
    }
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator: combine
  function genCombine(rnd, lv) {
    var spec = lv === 1 ? [1, 1, 0] : lv === 2 ? rnd.pick([[2, 1, 0], [2, 2, 0]]) : rnd.pick([[2, 2, 1], [3, 2, 1]]), useX = lv === 3 && rnd.chance(0.5);
    function pair() {
      var pool = rnd.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), a = pool.slice(0, spec[0]), b = a.slice(0, spec[2]).concat(pool.slice(spec[0], spec[0] + spec[1] - spec[2]));
      return [sorted(a), sorted(b)];
    }
    var top = pair(), bot = pair(), f = useX ? xor : uni, C = f(top[0], top[1]), A = f(bot[0], bot[1]);
    if (!C.length || A.length < 2 || A.length > 5) return null;
    top.push(C);
    var dis = [], other = useX ? uni(bot[0], bot[1]) : (spec[2] ? xor(bot[0], bot[1]) : null);
    if (other) dis.push(other);
    dis.push(bot[0], bot[1]);
    A.forEach(function (p) { dis.push(A.filter(function (x) { return x !== p; })); });
    for (var t = 0; t < 6; t++) {
      var extra = rnd.int(0, 9);
      if (A.indexOf(extra) < 0) dis.push(sorted(A.concat([extra])));
      else { var rep = A.filter(function (x) { return x !== extra; }), np = rnd.int(0, 9); if (A.indexOf(np) < 0) dis.push(sorted(rep.concat([np]))); }
    }
    dis = dis.filter(function (x) { return x.length > 0; });
    var o = BP.options(rnd, A, rnd.shuffle(dis.slice(3)).slice(0, 3).concat(dis.slice(0, 3), rnd.shuffle(dis.slice(3))), skey, 5);
    if (!o) return null;
    var S = 92, g = 34, W = 3 * S + 2 * g + 32, s = '<rect width="' + W + '" height="' + (2 * S + 44) + '" rx="18" fill="' + BP.BG + '"/>';
    [[top, 0], [bot, 1]].forEach(function (rw) {
      var y = 16 + rw[1] * (S + 12), row = rw[0];
      s += card(row[0], 16, y, S) + BP.text(16 + S + g / 2, y + S * 0.64, "+", { size: 34 }) + card(row[1], 16 + S + g, y, S) + BP.text(16 + 2 * S + g * 1.5, y + S * 0.64, "=", { size: 34 });
      s += rw[1] === 0 ? card(row[2], 16 + 2 * S + 2 * g, y, S) : BP.box(16 + 2 * S + 2 * g, y, S, "", { ask: true });
    });
    var sol = '<rect width="' + W + '" height="' + (2 * S + 44) + '" rx="18" fill="' + BP.BG + '"/>';
    [[top, 0], [bot.concat([A]), 1]].forEach(function (rw) {
      var y = 16 + rw[1] * (S + 12), row = rw[0];
      sol += card(row[0], 16, y, S) + BP.text(16 + S + g / 2, y + S * 0.64, "+", { size: 34 }) + card(row[1], 16 + S + g, y, S) + BP.text(16 + 2 * S + g * 1.5, y + S * 0.64, "=", { size: 34 }) + card(row[2], 16 + 2 * S + 2 * g, y, S);
    });
    sol += '<rect x="' + (16 + 2 * S + 2 * g) + '" y="' + (16 + S + 12) + '" width="' + S + '" height="' + S + '" rx="8" fill="none" stroke="#1fa866" stroke-width="4"/>';
    var shared = top[0].filter(function (x) { return top[1].indexOf(x) >= 0; });
    var steps = ["Look at the <b>top row</b>. Two drawings go on top of each other and make the third drawing.",
      useX ? "Check the part that both drawings have (" + PN[shared[0]] + "). In the answer it is <b>gone</b>. So the rule is: parts that match <b>cancel out</b>. Only parts that are in just one drawing stay." :
        (shared.length ? "Check the part that both drawings have (" + PN[shared[0]] + "). It shows up <b>once</b> in the answer. So the rule is: put the drawings on top of each other and keep every part." : "Check each part: every part from the first and the second drawing shows up in the third. So the rule is: put the drawings on top of each other and keep every part."),
      "Now do the same with the <b>bottom row</b>. First drawing: " + bot[0].map(function (p) { return PN[p]; }).join(", ") + ". Second drawing: " + bot[1].map(function (p) { return PN[p]; }).join(", ") + ".",
      "Result: " + A.map(function (p) { return PN[p]; }).join(", ") + ". Count the parts: you need <b>" + A.length + "</b>. A choice with a part too many or too few is wrong.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."];
    return { prompt: "The top row shows how two drawings go together. Which picture goes in the empty box?",
      speak: "Look at the top row. Two drawings are put together and make a new drawing. Do the same with the bottom row. Which picture goes in the empty box?",
      fig: BP.svg(W, 2 * S + 44, s, "Two drawings put together, top row complete, bottom row missing its answer"), kind: "svg",
      opts: o.list.map(function (p) { return BP.tile(card(p, 4, 4, 100), 100); }), answer: o.answer, steps: steps, solutionFig: BP.svg(W, 2 * S + 44, sol, "The bottom row solved"),
      data: { mode: "combine", top: top, bot: bot, opts: o.list } };
  }

  // ---------------------------------------------------------------- generator: turn
  function flipH(p) { return p.map(function (r) { return r.slice().reverse(); }); }
  function rot(p, kind) { var n = p.length, o = p.map(function (r) { return r.slice(); }); for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) { var q = turnCell(kind, n, r, c); o[q[0]][q[1]] = p[r][c]; } return o; }
  function genTurn(rnd, lv) {
    var n = lv === 3 ? 4 : 3, turn = lv === 1 ? "cw" : lv === 2 ? rnd.pick(["cw", "half", "ccw"]) : rnd.pick(["cw", "ccw", "half"]), pal = rnd.sample(BP.NNAT, lv === 1 ? 2 : 3), g = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); for (c = 0; c < n; c++) g[r].push(rnd.chance(0.45) ? "white" : rnd.pick(pal)); }
    var ans = rot(g, turn), cw = rot(g, "cw"), half = rot(g, "half"), ccw = rot(g, "ccw");
    if ([cw, half, ccw, flipH(g)].some(function (x) { return gkey(x) === gkey(g); }) || gkey(cw) === gkey(ccw) || gkey(flipH(ans)) === gkey(ans)) return null;
    var wrongTurn = { cw: [ccw, half], ccw: [cw, half], half: [cw, ccw] }[turn];
    var poke = ans.map(function (x) { return x.slice(); }), pr = rnd.int(0, n - 1), pc = rnd.int(0, n - 1); poke[pr][pc] = rnd.pick(["blue", "yellow", "green", "black", "white"].filter(function (v) { return v !== ans[pr][pc]; }));
    var o = BP.options(rnd, ans, [flipH(ans), wrongTurn[0], wrongTurn[1], g, poke, rot(flipH(g), turn).map(function (x) { return x.slice(); })].map(function (x) { return x; }), gkey, 5);
    if (!o) return null;
    var word = { cw: "a quarter turn to the right (clockwise)", ccw: "a quarter turn to the left (counter-clockwise)", half: "a half turn (upside down)" }[turn];
    var label = { cw: "turn right", ccw: "turn left", half: "half turn" }[turn];
    var S = 150, W = 360, s = '<rect width="' + W + '" height="196" rx="18" fill="' + BP.BG + '"/>' + pgrid(g, 16, 22, S);
    var ax = 16 + S + 20, ay = 97;
    s += '<path d="M' + ax + "," + (ay + 20) + " Q" + (ax + 36) + "," + (ay - 40) + " " + (ax + 70) + "," + (ay + 20) + '" fill="none" stroke="#e0562b" stroke-width="4.5" stroke-linecap="round"/>';
    s += turn === "ccw" ? '<polygon points="' + ax + "," + (ay + 30) + " " + (ax - 5) + "," + (ay + 12) + " " + (ax + 14) + "," + (ay + 16) + '" fill="#e0562b"/>' : '<polygon points="' + (ax + 70) + "," + (ay + 30) + " " + (ax + 75) + "," + (ay + 12) + " " + (ax + 56) + "," + (ay + 16) + '" fill="#e0562b"/>';
    s += BP.text(ax + 35, ay + 52, label, { size: 15, color: "#e0562b" }) + BP.box(16 + S + 100, 22, 0 + 70, "", { ask: true, h: 70 }).replace(/<text[^>]*>.*?<\/text>/, BP.text(16 + S + 135, 22 + 50, "?", { size: 36, color: "#e2a000", weight: 900 }));
    var fig = BP.svg(W, 196, s, "A pattern and an arrow showing " + word);
    var solS = '<rect width="360" height="196" rx="18" fill="' + BP.BG + '"/>' + pgrid(g, 12, 38, 150) + BP.text(180, 120, "→", { size: 40, color: "#e0562b" }) + pgrid(ans, 198, 38, 150);
    var wi = o.list.findIndex(function (x) { return gkey(x) === gkey(flipH(ans)); });
    var steps = ["The pattern is going to be turned: " + word + ". The picture does <b>not</b> change. It only turns around.",
      "Pick one square that is easy to find, like the one in the top-left corner. " + (turn === "cw" ? "After a right turn, the top row moves to the right side (the first square goes to the top-right corner)." : turn === "ccw" ? "After a left turn, the top row moves to the left side (the first square goes to the bottom-left corner)." : "After a half turn, the top row becomes the bottom row, upside down (the first square goes to the bottom-right corner)."),
      "Find the choice with that square in the right place. Then check the other colors around it. Tip: turn the page in your head, or turn your paper!",
      "Careful: a <i>flipped</i> picture is not a <i>turned</i> picture." + (wi >= 0 ? " Choice " + BP.LETTER[wi] + " is a mirror picture, so it is wrong." : " Some choices turn the picture the wrong way or too far."),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."];
    return { prompt: "The pattern turns around like the arrow shows. Which picture shows it after the turn?",
      speak: "Look at the pattern and the arrow. The pattern turns around like the arrow shows. Which picture shows the pattern after the turn?",
      fig: fig, kind: "svg", opts: o.list.map(function (p) { return BP.tile(pgrid(p, 14, 14, 76), 100); }), answer: o.answer, steps: steps,
      solutionFig: BP.svg(360, 196, solS, "The pattern before and after the turn"), data: { mode: "turn", turn: turn, grid: g, opts: o.list } };
  }

  function gen(rnd, lv) {
    var q = (lv === 1 ? rnd.chance(0.6) : rnd.chance(0.5)) ? genCombine(rnd, lv) : genTurn(rnd, lv);
    if (!q) return null;
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }
  BP.reg("spatial-visualization", { name: "Spatial Visualization", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

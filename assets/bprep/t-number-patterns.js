/* Number Patterns (NGAT quantitative style): a number series (find the next number) or a 3×3 number grid
   (find the missing number). 5 text options. Levels 1: simple series. 2: bigger steps + easy grid. 3: tricky series + grids. */
(function (BP) {
  "use strict";

  // ---------------------------------------------------------------- independent solver
  function seqPreds(v) {
    var out = [], n = v.length, d = [], i, ok;
    for (i = 0; i < n - 1; i++) d.push(v[i + 1] - v[i]);
    function all(f, a, b) { for (var k = a; k < b; k++) if (!f(k)) return false; return true; }
    if (all(function (k) { return d[k] === d[0]; }, 0, d.length)) out.push(v[n - 1] + d[0]);                      // constant step
    if (d.length >= 4 && all(function (k) { return d[k] === d[k - 2]; }, 2, d.length)) out.push(v[n - 1] + d[d.length - 2]); // two steps take turns
    if (d.length >= 3 && all(function (k) { return d[k] - d[k - 1] === d[1] - d[0]; }, 1, d.length)) out.push(v[n - 1] + d[d.length - 1] + d[1] - d[0]); // steps change evenly
    if (v[0] !== 0 && v[1] % v[0] === 0 && v[1] / v[0] > 1) {                                                         // times the same number
      var r = v[1] / v[0]; ok = all(function (k) { return v[k] === v[k - 1] * r; }, 1, n); if (ok) out.push(v[n - 1] * r);
    }
    return out;
  }
  function gridPreds(cells, m) {
    var rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]], cols = [[0, 3, 6], [1, 4, 7], [2, 5, 8]], out = [];
    [rows, cols].forEach(function (lines) {
      var full = lines.filter(function (l) { return l.indexOf(m) < 0; }), mine = lines.filter(function (l) { return l.indexOf(m) >= 0; })[0];
      var k = mine.indexOf(m), o = mine.filter(function (x) { return x !== m; }).map(function (x) { return cells[x]; });
      var arith = full.every(function (l) { return cells[l[1]] - cells[l[0]] === cells[l[2]] - cells[l[1]]; });
      if (arith) out.push(k === 0 ? 2 * o[0] - o[1] : k === 1 ? (o[0] + o[1]) / 2 : 2 * o[1] - o[0]);
      var sum = full.every(function (l) { return cells[l[0]] + cells[l[1]] === cells[l[2]]; });
      if (sum) out.push(k === 2 ? o[0] + o[1] : o[1] - o[0]);
    });
    return out;
  }
  function solve(q) {
    var d = q.data, P = d.grid ? gridPreds(d.grid, d.miss) : seqPreds(d.seq), hit = [];
    if (!P.length) throw new Error("no rule found");
    P.forEach(function (p) { if (p !== P[0]) throw new Error("two rules disagree"); });
    d.opts.forEach(function (o, i) { if (o === P[0]) hit.push(i); });
    if (hit.length !== 1) throw new Error("options fitting: " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function chip(x, y, w, h, txt, o) { return BP.box(x, y, w, BP.text(x + w / 2, y + h / 2 + 11, String(txt), { size: 32 }), { h: h, mark: o && o.mark }); }
  function seqFig(seq, fill) {
    var cw = 62, gap = 24, n = seq.length + 1, W = n * cw + (n - 1) * gap + 28, H = cw + 28, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>', i;
    for (i = 0; i < n; i++) {
      var x = 14 + i * (cw + gap), y = 14;
      if (i < n - 1) s += chip(x, y, cw, cw, seq[i]);
      else s += fill === undefined ? BP.box(x, y, cw, "", { ask: true }) : chip(x, y, cw, cw, fill, { mark: "#1fa866" });
      if (i < n - 1) s += '<polygon points="' + (x + cw + 6) + "," + (y + cw / 2 - 8) + " " + (x + cw + 18) + "," + (y + cw / 2) + " " + (x + cw + 6) + "," + (y + cw / 2 + 8) + '" fill="#9aa8c6"/>';
    }
    return BP.svg(W, H, s, "Number series: " + seq.join(", ") + ", then a question mark");
  }
  function gridFig(cells, miss, fill) {
    var rows = [0, 1, 2].map(function (r) { return [0, 1, 2].map(function (c) { var i = r * 3 + c; return i === miss ? (fill === undefined ? null : fill) : cells[i]; }); });
    var mark = {}; if (fill !== undefined) mark[Math.floor(miss / 3) + "," + miss % 3] = "#1fa866";
    return BP.grid(rows, { size: 84, mark: mark, draw: function (v, x, y, w) { return BP.text(x + w / 2, y + w / 2 + 12, String(v), { size: 34 }); },
      label: "Number grid: " + cells.map(function (v, i) { return i === miss ? "question mark" : v; }).join(", ") });
  }

  // ---------------------------------------------------------------- generators
  function makeSeq(rnd, lv) {
    var a = [], i, x, s, kind, text;
    if (lv === 1) {
      s = rnd.pick([1, 2, -1, -2]); x = s < 0 ? rnd.int(12, 50) : rnd.int(1, 50);
      for (i = 0; i < 6; i++) a.push(x + s * i);
      text = (s > 0 ? "goes up by " : "goes down by ") + Math.abs(s) + " each time";
    } else if (lv === 2) {
      s = rnd.pick([3, 4, 5, 10, -2, -3, -4, -5]); x = s < 0 ? rnd.int(25, 60) : rnd.int(1, 40);
      for (i = 0; i < 6; i++) a.push(x + s * i);
      text = (s > 0 ? "goes up by " : "goes down by ") + Math.abs(s) + " each time";
    } else {
      kind = rnd.int(0, 3);
      if (kind === 0) { x = rnd.int(1, 3); for (i = 0; i < 6; i++) a.push(x * Math.pow(2, i)); text = "doubles each time (× 2)"; }
      else if (kind === 1) { x = rnd.int(1, 30); a.push(x); for (i = 0; i < 5; i++) a.push(a[i] + i + 1); text = "goes up by 1, then 2, then 3, then 4, then 5: the jump grows by 1"; }
      else if (kind === 2) { x = rnd.int(25, 60); a.push(x); for (i = 0; i < 5; i++) a.push(a[i] - (5 - i)); text = "goes down by 5, then 4, then 3, then 2, then 1: the jump shrinks by 1"; }
      else {
        var p = rnd.int(3, 9), m = rnd.int(1, p - 1); x = rnd.int(1, 30); a.push(x);
        for (i = 0; i < 5; i++) a.push(a[i] + (i % 2 === 0 ? p : -m));
        text = "goes up by " + p + ", then down by " + m + ", and again and again";
      }
    }
    if (a.some(function (v) { return v < 0 || v > 100; })) return null;
    return { a: a, text: text };
  }
  function genSeq(rnd, lv) {
    var m = makeSeq(rnd, lv); if (!m) return null;
    var a = m.a, shown = a.slice(0, 5), ans = a[5], P = seqPreds(shown);
    var dis = [ans + 1, ans - 1, a[4] + (a[4] - a[3]), ans + 2, ans - 2, ans + (a[5] - a[4]), a[4], ans + 10, ans - 10].filter(function (v) { return v >= 0 && v <= 100 && v !== ans && P.indexOf(v) < 0; });
    var o = BP.options(rnd, ans, rnd.shuffle(dis), null, 5);
    if (!o) return null;
    var steps = [
      "Read the numbers from left to right: <b>" + shown.join(", ") + "</b>.",
      "Look at how far each number is from the next one: " + shown.slice(1).map(function (v, i) { return (v - shown[i] >= 0 ? "+" : "−") + Math.abs(v - shown[i]); }).join(", ") + ".",
      "The pattern: the number " + m.text + ".",
      "Keep going: " + shown[4] + " → <b>" + ans + "</b>. (" + a[4] + " is tempting, but it is the number we already have.)",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    return { prompt: "Which number comes next in the pattern?", speak: "Look at the numbers. They follow a pattern. Which number comes next?",
      fig: seqFig(shown), kind: "text", opts: o.list.map(String), answer: o.answer, steps: steps, solutionFig: seqFig(shown, ans), data: { seq: shown, opts: o.list } };
  }
  function genGrid(rnd, lv) {
    var g = [], r, c, kind, text;
    var pool = lv === 2 ? ["add"] : ["sum", "colsum", "grow"];
    kind = rnd.pick(pool);
    if (kind === "add") {
      var a = rnd.int(2, 5), b = rnd.int(2, 10), s = rnd.int(1, 20); if (a === b) return null;
      for (r = 0; r < 3; r++) g.push([s + r * b, s + r * b + a, s + r * b + 2 * a]);
      text = "Each row goes up by " + a + " from left to right. Each column goes up by " + b + " from top to bottom.";
    } else if (kind === "sum") {
      for (r = 0; r < 3; r++) { var x = rnd.int(1, 9), y = rnd.int(1, 9); g.push([x, y, x + y]); }
      text = "In every row, the first two numbers add up to the third number.";
    } else if (kind === "colsum") {
      var top = [], mid = []; for (c = 0; c < 3; c++) { top.push(rnd.int(2, 15)); mid.push(rnd.int(2, 15)); }
      g = [top, mid, [top[0] + mid[0], top[1] + mid[1], top[2] + mid[2]]];
      text = "In every column, the top two numbers add up to the bottom number.";
    } else {
      var k0 = rnd.int(1, 3), s0 = rnd.int(1, 10), ds = rnd.int(2, 6);
      for (r = 0; r < 3; r++) { var k = k0 + r, st = s0 + r * ds; g.push([st, st + k, st + 2 * k]); }
      text = "Each row counts up by its own step, and the step gets bigger in each new row.";
    }
    var cells = [].concat(g[0], g[1], g[2]);
    if (cells.some(function (v) { return v < 0 || v > 99; })) return null;
    var miss = lv === 2 ? 8 : rnd.int(0, 8), ans = cells[miss], row = g[Math.floor(miss / 3)];
    var shown = cells.slice(); shown[miss] = -1;
    var P = gridPreds(shown, miss);
    if (!P.length || P.some(function (p) { return p !== ans; })) return null;
    var dis = [ans + 1, ans - 1, ans + 2, ans - 2, row[(miss % 3 + 2) % 3], ans + Math.abs(row[1] - row[0]), ans + 10].filter(function (v) { return v >= 0 && v <= 99 && v !== ans; });
    var o = BP.options(rnd, ans, rnd.shuffle(dis), null, 5);
    if (!o) return null;
    var steps = [
      "Look at the <b>rows</b> (across) and the <b>columns</b> (down). The grid follows one rule.",
      "Use the rows or columns that are complete to find the rule: " + text,
      "Use the rule on the line with the missing number: it must be <b>" + ans + "</b>.",
      "Check: " + ans + " fits the rule in its row and its column. (Neighbor numbers like " + row[(miss % 3 + 2) % 3] + " do not.)",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    return { prompt: "Which number goes in the empty box?", speak: "Look at the grid of numbers. The numbers follow a rule. Which number goes in the empty box?",
      fig: gridFig(shown, miss), kind: "text", opts: o.list.map(String), answer: o.answer, steps: steps, solutionFig: gridFig(shown, miss, ans), data: { grid: shown, miss: miss, opts: o.list } };
  }
  function gen(rnd, lv) {
    if (lv === 1) return genSeq(rnd, 1);
    if (lv === 2) return rnd.chance(0.7) ? genSeq(rnd, 2) : genGrid(rnd, 2);
    return rnd.chance(0.5) ? genSeq(rnd, 3) : genGrid(rnd, 3);
  }

  BP.reg("number-patterns", { name: "Number Patterns", group: "quant", gen: gen, solve: solve });
})(window.BP);

/* Number Puzzles (CogAT quantitative style): balance equations with one missing number, e.g. 4 = 2 + ?   1 + 3 = ? + 2.
   Level 1 is drawn with groups of objects in boxes, levels 2-3 use numbers. Options are numbers (text). */
(function (BP) {
  "use strict";
  var OBJ = [["circle", "red"], ["star", "yellow"], ["circle", "blue"], ["heart", "pink"], ["diamond", "purple"], ["hexagon", "orange"]];

  function ev(side, v) {
    var t = 0, sg = 1;
    side.forEach(function (x) { if (x === "+") sg = 1; else if (x === "-") sg = -1; else t += sg * (x === "?" ? v : x); });
    return t;
  }
  function solve(q) {
    var d = q.data, hit = [];
    d.opts.forEach(function (v, i) { if (ev(d.left, v) === ev(d.right, v)) hit.push(i); });
    if (hit.length !== 1) throw new Error("fits: " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function pile(n, M, x, y, w, h, o) {
    var bs = 0, bc = 1, c, r, i, out = "";
    for (c = 1; c <= M; c++) { r = Math.ceil(M / c); var cs = Math.min(w / c, h / r); if (cs > bs + 0.01) { bs = cs; bc = c; } }
    bs = Math.min(bs, w * 0.5);
    var rows = Math.ceil(n / bc), y0 = y + (h - rows * bs) / 2;
    for (i = 0; i < n; i++) {
      var row = Math.floor(i / bc), inRow = Math.min(bc, n - row * bc), x0 = x + (w - inRow * bs) / 2;
      out += BP.shape(o[0], x0 + (i % bc + 0.5) * bs, y0 + (row + 0.5) * bs, bs * 0.42, o[1]);
    }
    return out;
  }
  function figure(q, fill) {
    var toks = q.left.concat(["="], q.right), pict = !!q.pict, bw = pict ? 92 : 64, opw = pict ? 38 : 34, h = pict ? 92 : 70;
    var W = 28, i; toks.forEach(function (t) { W += (typeof t === "string" && t !== "?") ? opw : bw + 8; });
    W += 20;
    var H = h + 44, x = 24, y = 22, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>', M = 1;
    toks.forEach(function (t) { if (typeof t === "number") M = Math.max(M, t); });
    if (fill !== undefined) M = Math.max(M, fill);
    toks.forEach(function (t) {
      if (typeof t === "string" && t !== "?") { s += BP.text(x + opw / 2, y + h / 2 + (t === "=" ? 14 : 12), t === "-" ? "−" : t, { size: 40, color: "#5b6b8f" }); x += opw; return; }
      var ask = t === "?" && fill === undefined;
      var inner = "";
      if (!ask) {
        var v = t === "?" ? fill : t;
        inner = pict ? pile(v, M, x + 8, y + 8, bw - 16, h - 16, q.obj) : BP.text(x + bw / 2, y + h / 2 + 12, String(v), { size: 36 });
      }
      s += BP.box(x, y, bw, inner, { h: h, ask: ask, mark: t === "?" && !ask ? "#1fa866" : undefined });
      x += bw + 8;
    });
    return BP.svg(W, H, s, "Equation: " + toks.map(function (t) { return t === "?" ? "a question mark" : t === "-" ? "minus" : t; }).join(" "));
  }
  function show(side) { return side.map(function (t) { return t === "-" ? "−" : t; }).join(" "); }

  // ---------------------------------------------------------------- generator
  function gen(rnd, lv) {
    var x, left, right, a, b, c, e, r = rnd(), pict = lv === 1, form;
    if (lv === 1 || (lv === 2 && r < 0.4)) {
      c = lv === 1 ? rnd.int(3, 10) : rnd.int(6, 15); x = rnd.int(1, c - 1); a = c - x;
      var f = rnd.int(0, 2);
      if (f === 0) { left = [a, "+", "?"]; right = [c]; } else if (f === 1) { left = ["?", "+", a]; right = [c]; } else { x = c; left = [a, "+", c - a]; right = ["?"]; }
      if (lv === 2 && rnd.chance(0.5) && f < 2) { var t = left; left = right; right = t; }
    } else if (lv === 2) {
      if (rnd.chance(0.5)) { c = rnd.int(4, 12); x = rnd.int(1, c - 1); left = [c]; right = [c - x, "+", "?"]; }
      else { a = rnd.int(1, 6); b = rnd.int(1, 6); c = rnd.int(1, a + b - 1); x = a + b - c; left = [a, "+", b]; right = ["?", "+", c]; }
    } else if (rnd.chance(0.5)) {
      form = rnd.int(0, 2);
      if (form === 0) { a = rnd.int(5, 14); x = rnd.int(1, a - 1); var s = a - x; b = s > 1 ? rnd.int(1, s - 1) : 0; left = [a, "-", "?"]; right = b ? [b, "+", s - b] : [s]; }
      else if (form === 1) { a = rnd.int(1, 8); b = rnd.int(1, 8); c = rnd.int(a + b + 1, a + b + 8); x = c - a - b; left = [a, "+", b]; right = [c, "-", "?"]; }
      else { a = rnd.int(1, 6); b = rnd.int(1, 6); c = rnd.int(1, 6); e = rnd.int(1, a + b + c - 1); x = a + b + c - e; left = [a, "+", b, "+", c]; right = ["?", "+", e]; }
    } else {
      a = rnd.int(2, 7); b = rnd.int(1, 7); c = rnd.int(1, 6); e = rnd.int(1, 6);
      if (a + b - c < 1) return null;
      x = a + b - c + e; left = [a, "+", b, "-", c]; right = ["?", "-", e];
    }
    if (x < 1 || x > 20) return null;
    var known = ev(left.indexOf("?") < 0 ? left : right, 0), lim = pict ? 12 : 20;
    var dis = [known, x + 1, x - 1, x + 2, x - 2, Math.abs(known - x)].filter(function (v) { return v >= 1 && v <= lim; });
    var o = BP.options(rnd, x, rnd.shuffle(dis), null, 4);
    if (!o) return null;
    var q = { left: left, right: right, pict: pict, obj: pict ? rnd.pick(OBJ) : null };
    // ---- steps
    var withQ = left.indexOf("?") >= 0 ? left : right, S = ev(left.indexOf("?") >= 0 ? right : left, 0);
    var qi = withQ.indexOf("?"), sign = qi > 0 && withQ[qi - 1] === "-" ? -1 : 1, kn = ev(withQ, 0);
    var step3;
    if (withQ.length === 1) step3 = "So <b>?</b> is the total of the other side: " + show(left.indexOf("?") >= 0 ? right : left) + " = " + S + ".";
    else if (kn < 0) step3 = "This side is ? take away " + (-kn) + ". It must make " + S + ". Undo the take-away: " + S + " + " + (-kn) + " = <b>" + x + "</b>.";
    else if (sign > 0) step3 = "Without the ?, this side makes " + kn + ". It must make " + S + ". What do we add to " + kn + " to reach " + S + "? " + S + " − " + kn + " = <b>" + x + "</b>.";
    else step3 = "We start with " + kn + " and take away ? to leave " + S + ". So ? is " + kn + " − " + S + " = <b>" + x + "</b>.";
    var full = show(left).replace("?", x) + " = " + show(right).replace("?", x);
    var steps = [
      "The <b>=</b> sign means both sides are the <b>same amount</b>, like a balanced seesaw.",
      "Work out the side with no ?: " + show(left.indexOf("?") >= 0 ? right : left) + " = <b>" + S + "</b>.",
      step3,
      "Check it: put " + x + " in the box. " + full + ". Both sides match." + (known !== x && known >= 1 ? " (" + known + " is tempting, but it does not balance.)" : ""),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    q.data = { left: left, right: right, opts: o.list };
    return { prompt: "Both sides of the = sign must be the same. What number goes in the ?", speak: "Both sides of the equal sign must be the same amount. What number goes in the question mark?",
      fig: figure(q), kind: "text", opts: o.list.map(String), answer: o.answer, steps: steps, solutionFig: figure(q, x), data: q.data };
  }

  BP.reg("number-puzzles", { name: "Number Puzzles", group: "quant", gen: gen, solve: solve });
})(window.BP);

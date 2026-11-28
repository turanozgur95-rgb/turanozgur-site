/* Figure Matrices (CogAT nonverbal, NNAT/NGAT analogy style): 2×2 boxes. A changes into B; C changes the same way into ?.
   Attributes: shape, color, count, rot (arrow direction), empty (outline). */
(function (BP) {
  "use strict";
  var ATTR = ["shape", "color", "count", "rot", "empty"];
  var DIR = { 0: "up", 90: "right", 180: "down", 270: "left" };

  function say(c) {
    var n = c.count || 1, nm = c.shape === "arrow" ? "arrow" : c.shape;
    var s = (n > 1 ? n + " " : "a ") + (c.empty ? "white " : c.color + " ") + nm + (n > 1 ? (nm.slice(-1) === "s" ? "es" : "s") : "");
    if (c.shape === "arrow") s += " pointing " + DIR[c.rot];
    return s;
  }
  function vis(x) { return [x.shape, x.empty ? "-" : x.color, x.count, x.shape === "arrow" ? x.rot : 0, !!x.empty].join("|"); }
  function same(a, b) { return vis(a) === vis(b); }

  // ---------------------------------------------------------------- independent solver
  function solve(q) {
    var d = q.data, A = d.a, B = d.b, C = d.c, want = {};
    ATTR.forEach(function (k) {
      if (A[k] === B[k]) want[k] = C[k];
      else if (k === "count") want[k] = C[k] + (B[k] - A[k]);
      else if (k === "rot") want[k] = (C[k] + B[k] - A[k] + 360) % 360;
      else if (C[k] === A[k]) want[k] = B[k];
      else if (k === "empty") want[k] = !C[k];
      else throw new Error("ambiguous " + k);
    });
    var hit = [];
    d.opts.forEach(function (o, i) { if (same(o, want)) hit.push(i); });
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator
  function other(rnd, k, v, shapes) {
    var pool = k === "shape" ? shapes : k === "color" ? BP.COLORS : null;
    return rnd.pick(pool.filter(function (x) { return x !== v; }));
  }
  function gen(rnd, lv) {
    var arrow = lv >= 2 && rnd.chance(0.3);
    var shapes = BP.SHAPES;
    var a = { shape: arrow ? "arrow" : rnd.pick(shapes), color: rnd.pick(BP.COLORS), count: 1, rot: arrow ? rnd.pick([0, 90, 180, 270]) : 0, empty: false };
    var pool = arrow ? ["color", "rot", "empty"] : ["shape", "color", "empty"].concat(lv >= 2 ? ["count"] : []);
    var nChange = lv === 1 ? 1 : lv === 2 ? rnd.pick([1, 2, 2]) : rnd.pick([2, 3]);
    var change = rnd.sample(pool, Math.min(nChange, pool.length));
    if (arrow && change.indexOf("rot") < 0 && lv === 3) change[0] = "rot";
    if (change.indexOf("empty") >= 0 && change.indexOf("color") >= 0) return null;
    var b = JSON.parse(JSON.stringify(a)), c = JSON.parse(JSON.stringify(a));
    // C differs from A in an attribute that does NOT change (looks tricky but follows the rule)
    var keep = (arrow ? ["color"] : ["shape", "color"]).filter(function (k) { return change.indexOf(k) < 0; });
    if (keep.length) { var kk = rnd.pick(keep); c[kk] = other(rnd, kk, a[kk], shapes); }
    else if (arrow) c.rot = (a.rot + 180) % 360;
    change.forEach(function (k) {
      if (k === "count") { a.count = c.count = rnd.pick([1, 2]); b.count = a.count + rnd.pick([1, 2]); if (lv === 2) b.count = a.count + 1; }
      else if (k === "rot") { var step = rnd.pick([90, 180, 270]); b.rot = (a.rot + step) % 360; }
      else if (k === "empty") { b.empty = true; }
      else b[k] = other(rnd, k, a[k], shapes);
    });
    if (change.indexOf("count") < 0) { var n = lv >= 2 ? rnd.pick([1, 1, 2]) : 1; a.count = b.count = c.count = n; }
    if (change.indexOf("rot") >= 0 && arrow) c.rot = a.rot; // rot rule needs C's start
    var D = JSON.parse(JSON.stringify(c));
    change.forEach(function (k) {
      if (k === "count") D.count = c.count + (b.count - a.count);
      else if (k === "rot") D.rot = (c.rot + b.rot - a.rot + 360) % 360;
      else if (k === "empty") D.empty = true;
      else D[k] = b[k];
    });
    if (D.count > 4 || same(D, c) || same(D, b) && lv > 1) return null;
    // distractors: undo one change, wrong value, copies
    var dis = [];
    change.forEach(function (k) {
      var x = JSON.parse(JSON.stringify(D)); x[k] = c[k]; dis.push(x);
      var y = JSON.parse(JSON.stringify(D));
      if (k === "count") y.count = D.count + rnd.pick([-1, 1]); else if (k === "rot") y.rot = (D.rot + 180) % 360; else if (k === "empty") y.empty = !D.empty; else y[k] = other(rnd, k, D[k], shapes);
      if (y.count >= 1 && y.count <= 4) dis.push(y);
    });
    var z = JSON.parse(JSON.stringify(D)); z.shape = arrow ? "arrow" : other(rnd, "shape", D.shape, shapes); if (arrow) z.rot = (D.rot + 90) % 360; dis.push(z);
    dis.push(JSON.parse(JSON.stringify(c)));
    var w = JSON.parse(JSON.stringify(D)); w.color = other(rnd, "color", D.color, shapes); dis.push(w);
    dis = rnd.shuffle(dis);
    var n = 4;
    var o = BP.options(rnd, D, dis, vis, n);
    if (!o) return null;
    var fig = BP.grid([[a, b], [c, null]], { size: 120, label: "Matrix: top row " + say(a) + " then " + say(b) + "; bottom row " + say(c) + " then a question mark" });
    var opts = o.list.map(function (x) { return BP.tile(BP.cell(x, 4, 4, 100), 100); });
    var words = change.map(function (k) {
      if (k === "shape") return "the shape changes from " + a.shape + " to " + b.shape;
      if (k === "color") return "the color changes from " + a.color + " to " + b.color;
      if (k === "count") return "the number goes from " + a.count + " to " + b.count + " (" + (b.count - a.count > 0 ? "add " : "take away ") + Math.abs(b.count - a.count) + ")";
      if (k === "rot") return "the arrow turns from " + DIR[a.rot] + " to " + DIR[b.rot];
      return "the shape becomes white (only the outline)";
    });
    var steps = [
      "Look only at the <b>top row</b>. " + BP.cap(say(a)) + (a.count > 1 ? " change into " : " changes into ") + say(b) + ".",
      "Say the rule out loud: " + words.join(", and ") + ". " + (change.length === 1 ? "Nothing else changes." : "Everything else stays the same."),
      "Now use the same rule on the <b>bottom row</b>. Start with " + say(c) + ".",
      "Apply the rule: you get <b>" + say(D) + "</b>." + (keep.length ? " Notice the bottom row starts with a different " + keep[0] + ". That is fine: the rule is about what <i>changes</i>, so the " + keep[0] + " stays as it is in the bottom row." : ""),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    var solutionFig = BP.grid([[a, b], [c, D]], { size: 90, mark: { "1,1": "#1fa866" }, label: "Solved matrix" });
    return { prompt: "The top two boxes go together. Which picture goes with the bottom box the same way?", speak: "Look at the top two boxes. They go together. Which picture goes in the empty box, so the bottom boxes go together in the same way?",
      fig: fig, kind: "svg", opts: opts, answer: o.answer, steps: steps, solutionFig: solutionFig,
      data: { a: a, b: b, c: c, opts: o.list } };
  }

  BP.reg("figure-matrices", { name: "Figure Matrices", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

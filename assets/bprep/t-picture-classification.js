/* Picture Classification (CogAT verbal, K-2): three pictures belong together; pick the picture that belongs with them.
   Rule: the NARROWEST group that holds all three (farm animals, not just animals). Solver finds that group from the bank. */
(function (BP) {
  "use strict";
  var PB = BP.PB, B = BP.BANK, BROAD = ["food", "animal", "vehicle"];

  function solve(q) {
    var d = q.data, best = null, bestN = 1e9, tie = false;
    B.classes.forEach(function (c) {
      if (!d.ex.every(function (e) { return PB.inClass(e, c); })) return;
      var n = PB.members(c).length;
      if (n < bestN) { best = c; bestN = n; tie = false; } else if (n === bestN) tie = true;
    });
    if (best === null || tie) throw new Error("no single narrowest group");
    var hit = [];
    d.opts.forEach(function (o, i) { if (PB.inClass(o, best)) hit.push(i); });
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  function gen(rnd, lv) {
    var classes = B.classes.filter(function (c) { return BROAD.indexOf(c) < 0 && PB.members(c).length >= 4; });
    var cls = rnd.pick(classes), four = rnd.sample(PB.members(cls), 4), ex = four.slice(0, 3), ans = four[3];
    var sib = B.siblings[cls] || [], far = PB.farDomains(cls), dis = [], i;
    for (i = 0; i < 8; i++) {
      var near = lv === 3 || (lv === 2 && i % 2 === 0);
      var src = near && sib.length ? rnd.pick(sib) : rnd.pick(far);
      var pool = PB.members(src).filter(function (x) { return !PB.inClass(x, cls); });
      if (pool.length) dis.push(rnd.pick(pool));
    }
    if (lv === 3) { // trap: shares a group with at least two of the examples, but not their narrowest group
      var traps = [];
      B.classes.forEach(function (c2) {
        if (c2 === cls || BROAD.indexOf(c2) >= 0) return;
        var hit = ex.filter(function (e) { return PB.inClass(e, c2); }).length;
        if (hit >= 2) PB.members(c2).forEach(function (m) { if (!PB.inClass(m, cls) && ex.indexOf(m) < 0 && m !== ans) traps.push(m); });
      });
      if (traps.length) dis.unshift(rnd.pick(traps));
    }
    dis = dis.filter(function (x) { return !PB.inClass(x, cls) && x !== ans; });
    var o = BP.options(rnd, ans, dis, function (x) { return x; }, lv === 3 ? 4 : 3);
    if (!o) return null;
    var nm = PB.name, g = PB.group(cls);
    var q = { data: { ex: ex, opts: o.list } };
    try { if (solve(q) !== o.answer) return null; } catch (e) { return null; }
    var wrong = o.list.filter(function (x) { return x !== ans; });
    var steps = [
      "Look at the three pictures on top: the " + nm(ex[0]) + ", the " + nm(ex[1]) + ", and the " + nm(ex[2]) + ".",
      "Ask yourself: what are they? They are all <b>" + g + "</b>.",
      "Pick the picture that is also in that group: the <b>" + nm(ans) + "</b>.",
      "Check the others: " + wrong.map(function (x) { return "the " + nm(x); }).join(" and ") + " " + (wrong.length > 1 ? "are" : "is") + " not in the group of " + g + "." +
        (lv >= 2 ? " Look for the small, exact group, not a big one like food, animals, or vehicles." : ""),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    return { prompt: "These three pictures go together. Which other picture belongs with them?",
      speak: "Look at the three pictures at the top. They go together. Which one of the other pictures belongs with them?",
      fig: row(ex, null, 110, "Three pictures that go together: " + ex.map(nm).join(", ") + ", and a question mark."),
      kind: "svg", opts: o.list.map(function (x) { return BP.picTile(x, nm(x)); }), answer: o.answer, steps: steps,
      solutionFig: row(ex, ans, 84, "Solved: the " + nm(ans) + " belongs with the " + g + "."), data: q.data };
  }

  function row(ex, d, s, label) {
    var gap = 14, W = 4 * s + 5 * gap, H = s + 2 * gap, g = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>';
    ex.forEach(function (e, i) { g += PB.card(e, gap + i * (s + gap), gap, s); });
    g += d ? PB.card(d, gap + 3 * (s + gap), gap, s, "#1fa866") : BP.box(gap + 3 * (s + gap), gap, s, "", { ask: true });
    return BP.svg(W, H, g, label);
  }

  BP.reg("picture-classification", { name: "Picture Classification", group: "verbal", gen: gen, solve: solve });
})(window.BP);

/* Odd One Out (NGAT verbal style): six pictures, five belong to one group; pick the one that does NOT belong.
   Solver: finds every bank group that holds exactly 5 of the 6 pictures; all must leave out the same picture. */
(function (BP) {
  "use strict";
  var PB = BP.PB, B = BP.BANK, BROAD = ["food", "animal", "vehicle"];

  function solve(q) {
    var opts = q.data.opts, odd = -1;
    B.classes.forEach(function (c) {
      var out = [];
      opts.forEach(function (o, i) { if (!PB.inClass(o, c)) out.push(i); });
      if (out.length === 1) { if (odd >= 0 && odd !== out[0]) throw new Error("two different odd ones"); odd = out[0]; }
    });
    if (odd < 0) throw new Error("no odd one");
    return odd;
  }

  function gen(rnd, lv) {
    var classes = B.classes.filter(function (c) { return BROAD.indexOf(c) < 0 && PB.members(c).length >= 5; });
    var cls = rnd.pick(classes), five = rnd.sample(PB.members(cls), 5);
    var sib = B.siblings[cls] || [], far = PB.farDomains(cls);
    var near = lv === 3 || (lv === 2 && rnd.chance(0.5));
    var src = near && sib.length ? rnd.pick(sib) : rnd.pick(far);
    var pool = PB.members(src).filter(function (x) { return !PB.inClass(x, cls); });
    if (lv === 3 && rnd.chance(0.5)) { // tricky: the odd one shares another group with at least one of the five
      var tr = PB.ids().filter(function (x) {
        if (PB.inClass(x, cls)) return false;
        return B.classes.some(function (c2) { return c2 !== cls && BROAD.indexOf(c2) < 0 && PB.inClass(x, c2) && five.some(function (f) { return PB.inClass(f, c2); }); });
      });
      if (tr.length) pool = tr;
    }
    if (!pool.length) return null;
    var odd = rnd.pick(pool);
    var o = BP.options(rnd, odd, five, function (x) { return x; }, 6);
    if (!o) return null;
    var q = { data: { opts: o.list } };
    try { if (solve(q) !== o.answer) return null; } catch (e) { return null; }
    var nm = PB.name, g = PB.group(cls);
    var steps = [
      "Name every picture: " + o.list.map(function (x) { return nm(x); }).join(", ") + ".",
      "Five of them go together. They are all <b>" + g + "</b>.",
      "The <b>" + nm(odd) + "</b> is not in the group of " + g + ".",
      lv >= 2 ? "Tip: look for the group that fits five pictures exactly. The odd picture can look a bit like the others, but it does not fit the group." : "Tip: if five pictures fit a group and one does not, the one that does not fit is your answer.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    var W = 3 * 96 + 4 * 12, H = 2 * 96 + 3 * 12, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>';
    o.list.forEach(function (x, i) {
      s += PB.card(x, 12 + (i % 3) * 108, 12 + Math.floor(i / 3) * 108, 96, i === o.answer ? "#e8423f" : "#1fa866");
    });
    return { prompt: "Five of these pictures go together. Which one does NOT belong?",
      speak: "Look at the six pictures. Five of them go together. Which one does not belong?",
      fig: banner("Five of these go together.", "Which one does NOT belong?"), kind: "svg",
      opts: o.list.map(function (x) { return BP.picTile(x, nm(x)); }), answer: o.answer, steps: steps,
      solutionFig: BP.svg(W, H, s, "Solved: the " + nm(odd) + " does not belong with the " + g), data: q.data };
  }

  function banner(l1, l2) {
    var s = '<rect x="2" y="2" width="456" height="96" rx="18" fill="#fff6d1" stroke="#e2c45a" stroke-width="3"/>';
    s += BP.text(230, 44, l1, { size: 26 }) + BP.text(230, 80, l2, { size: 28, color: "#c0392b", weight: 900 });
    return BP.svg(460, 100, s, l1 + " " + l2);
  }

  BP.reg("odd-one-out", { name: "Odd One Out", group: "verbal", gen: gen, solve: solve });
})(window.BP);

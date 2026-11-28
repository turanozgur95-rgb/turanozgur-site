/* Picture Analogies (CogAT verbal, K-2): 2x2 boxes. The top pair shows a relation (bird - nest); the bottom-left picture
   is given; pick the picture that goes with it in the same way. Solver: finds ALL relations of the top pair in the bank and
   counts options that have one of them with C (exactly one must match). */
(function (BP) {
  "use strict";
  var PB = BP.PB, B = BP.BANK;
  var LEVELS = { 1: ["eats", "gives_us", "lives_in"], 2: ["works_on", "uses", "weather_gear", "travels_on"], 3: ["grows_into", "part_of", "faster_way"] };
  var PEOPLE = ["baby", "walker", "runner", "cyclist", "swimmer"];
  var SAY = {
    lives_in: function (a, b) { return "the " + a + " lives in (or on) the " + b; },
    gives_us: function (a, b) { return "the " + a + " gives us " + b; },
    eats: function (a, b) { return "the " + a + " eats the " + b; },
    grows_into: function (a, b) { return "the " + a + " grows into the " + b; },
    uses: function (a, b) { return "the " + a + " uses the " + b + " to do the job"; },
    works_on: function (a, b) { return "the " + a + " is used on the " + b; },
    weather_gear: function (a, b) { return "the " + b + " goes with the " + a + " (we use it in that weather)"; },
    travels_on: function (a, b) { return "the " + a + " travels on (or through) the " + b; },
    faster_way: function (a, b) { return "the " + b + " is a faster way than the " + a; },
    part_of: function (a, b) { return "the " + b + " is a part of the " + a; }
  };

  function tagsOf(x) { return PB.tags(x).concat(PEOPLE.indexOf(x) >= 0 ? ["person"] : []); }

  // ---------------------------------------------------------------- independent solver
  function solve(q) {
    var d = q.data, rs = PB.relsBetween(d.a, d.b);
    if (!rs.length) throw new Error("top pair has no relation");
    var hit = [];
    d.opts.forEach(function (o, i) { if (rs.some(function (r) { return PB.related(r, d.c, o); })) hit.push(i); });
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator
  function gen(rnd, lv) {
    var r = rnd.pick(LEVELS[lv]), pairs = B.relations[r];
    var p1 = rnd.pick(pairs), p2 = rnd.pick(pairs);
    var a = p1[0], b = p1[1], c = p2[0], ans = p2[1];
    if (a === c || b === ans || a === ans || c === b) return null;
    var all = PB.ids(), pri = [], dis = [];
    if (lv >= 3) { // trap: a picture that has a different relation with C
      Object.keys(B.relations).forEach(function (rr) {
        if (rr === r) return;
        B.relations[rr].forEach(function (p) { if (p[0] === c && p[1] !== ans) pri.push(p[1]); });
      });
      pri = rnd.shuffle(pri);
    }
    if (lv === 3 || rnd.chance(0.5)) pri.push(b); // copying the top answer
    var same = [];
    PB.tags(ans).forEach(function (t) { PB.members(t).forEach(function (m) { if (m !== ans && rnd.chance(0.3)) same.push(m); }); });
    var rand = rnd.sample(all, 8);
    dis = pri.concat(rnd.shuffle(same), rand).filter(function (x) { return x !== a && x !== c && x !== ans; });
    var rs = PB.relsBetween(a, b);
    dis = dis.filter(function (x) { return !rs.some(function (rr) { return PB.related(rr, c, x); }); });
    if (r === "grows_into") {
      var bad = {};
      B.relations.grows_into.forEach(function (p) { if (p[0] === c) tagsOf(p[1]).forEach(function (t) { if (t !== "animal") bad[t] = 1; }); });
      dis = dis.filter(function (x) { return !tagsOf(x).some(function (t) { return bad[t]; }); });
    }
    var n = lv === 3 ? 4 : 3;
    var o = BP.options(rnd, ans, dis, function (x) { return x; }, n);
    if (!o) return null;
    var nm = PB.name, rel = SAY[r];
    var tempt = dis.filter(function (x) { return o.list.indexOf(x) >= 0; });
    var steps = [
      "Look at the <b>top two</b> pictures: the " + nm(a) + " and the " + nm(b) + ".",
      "Find how they go together. " + BP.cap(rel(nm(a), nm(b))) + ".",
      "Now use the same idea with the <b>" + nm(c) + "</b>. " + BP.cap(rel(nm(c), nm(ans))) + ". That is the " + nm(ans) + "!"
    ];
    if (tempt.indexOf(b) >= 0) steps.push("Be careful: the " + nm(b) + " answers the <i>top</i> row. The bottom row needs a new picture.");
    else steps.push("The other pictures do not go with the " + nm(c) + " in the same way, even if they look like they could.");
    steps.push("Answer: <b>" + BP.LETTER[o.answer] + "</b>.");
    var solutionFig = board(a, b, c, ans, { size: 84, mark: "#1fa866", label: "Solved: the " + nm(c) + " goes with the " + nm(ans) });
    return { prompt: "The top two pictures go together. Which picture goes with the bottom picture in the same way?",
      speak: "Look at the top two pictures. They go together in a special way. Which picture goes with the bottom picture in the same way?",
      fig: board(a, b, c, null, { size: 112, label: "Top row: " + nm(a) + " then " + nm(b) + ". Bottom row: " + nm(c) + " then a question mark." }),
      kind: "svg", opts: o.list.map(function (x) { return BP.picTile(x, nm(x)); }), answer: o.answer, steps: steps, solutionFig: solutionFig,
      data: { a: a, b: b, c: c, opts: o.list } };
  }

  function board(a, b, c, d, o) {
    var s = o.size, ax = s * 0.5, gap = 14, W = 2 * s + ax + 2 * gap, H = 2 * s + 3 * gap, x1 = gap, x2 = gap + s + ax, y1 = gap, y2 = gap * 2 + s;
    var g = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>';
    function arrow(y) {
      var cy = y + s / 2, x0 = x1 + s + 7, x3 = x2 - 7;
      return '<path d="M' + x0 + " " + cy + "H" + (x3 - 3) + '" stroke="#8a97b4" stroke-width="5" stroke-linecap="round"/><path d="M' + (x3 - 12) + " " + (cy - 10) + "L" + x3 + " " + cy + "L" + (x3 - 12) + " " + (cy + 10) + '" fill="none" stroke="#8a97b4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    g += PB.card(a, x1, y1, s) + PB.card(b, x2, y1, s) + arrow(y1) + PB.card(c, x1, y2, s) + arrow(y2);
    g += d ? PB.card(d, x2, y2, s, o.mark) : BP.box(x2, y2, s, "", { ask: true });
    return BP.svg(W, H, g, o.label);
  }

  BP.reg("picture-analogies", { name: "Picture Analogies", group: "verbal", gen: gen, solve: solve });
})(window.BP);

/* Figure Classification (CogAT nonverbal): three figures share a rule; which option belongs with them?
   Figure = {shape, color, count, size}. The rule = every attribute that is the SAME in all three examples. */
(function (BP) {
  "use strict";
  var SHAPES = ["circle", "square", "triangle", "star", "diamond", "hexagon", "heart"];
  var COLS = ["red", "blue", "green", "yellow", "purple"];
  var VALS = { shape: SHAPES, color: COLS, count: [1, 2, 3], size: ["big", "small"] };
  var NAME = { shape: "shape", color: "color", count: "number of shapes", size: "size" };

  function look(g) { return g.shape + "|" + g.color + "|" + g.count + "|" + g.size; }
  function draw(g, x, y, w) { return BP.cell({ shape: g.shape, color: g.color, count: g.count, size: g.size === "big" ? 1.12 : 0.66 }, x, y, w); }
  function say(g, attrs) {
    var s = [];
    if (attrs.indexOf("size") >= 0) s.push(g.size);
    if (attrs.indexOf("count") >= 0) s.push(g.count);
    if (attrs.indexOf("color") >= 0) s.push(g.color);
    s.push(g.shape + (g.count > 1 && attrs.indexOf("count") >= 0 ? "s" : ""));
    return s.join(" ");
  }
  function valWord(k, v) { return k === "count" ? (v === 1 ? "1 shape" : v + " shapes") : String(v); }

  // ---------------------------------------------------------------- independent solver
  function solve(q) {
    var d = q.data, rule = {};
    d.attrs.forEach(function (k) {
      var v = d.ex[0][k];
      if (d.ex.every(function (e) { return e[k] === v; })) rule[k] = v;
    });
    if (!Object.keys(rule).length) throw new Error("no shared property");
    var hit = [];
    d.opts.forEach(function (o, i) { if (Object.keys(rule).every(function (k) { return o[k] === rule[k]; })) hit.push(i); });
    if (hit.length !== 1) throw new Error("fits " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator
  function rv(rnd, k) { return rnd.pick(VALS[k]); }
  function gen(rnd, lv) {
    var attrs = lv === 1 ? ["shape", "color"] : lv === 2 ? ["shape", "color", "count"] : ["shape", "color", "count", "size"];
    var rule = lv === 1 ? [rnd.pick(attrs)] : lv === 2 ? [rnd.pick(attrs)] : rnd.sample(["shape", "color", "count", "size"], 2);
    if (lv === 3 && rule.indexOf("size") >= 0 && rule.indexOf("count") >= 0) return null; // too much like each other
    var base = { shape: "circle", color: "red", count: 1, size: "big" }, fixed = {};
    rule.forEach(function (k) { fixed[k] = rv(rnd, k); });
    function make(extra) {
      var g = {};
      Object.keys(base).forEach(function (k) { g[k] = attrs.indexOf(k) < 0 ? base[k] : (fixed[k] !== undefined ? fixed[k] : rv(rnd, k)); });
      if (extra) Object.keys(extra).forEach(function (k) { g[k] = extra[k]; });
      return g;
    }
    var ex = [make(), make(), make()];
    // the other properties must really change (not all three equal, and mostly different)
    for (var i = 0; i < attrs.length; i++) {
      var k = attrs[i];
      if (rule.indexOf(k) >= 0) continue;
      var vs = ex.map(function (e) { return e[k]; }), n = {};
      vs.forEach(function (v) { n[v] = 1; });
      if (Object.keys(n).length < Math.min(VALS[k].length, 3) || (k === "size" && Object.keys(n).length < 2)) return null;
    }
    if (new Set(ex.map(look)).size < 3) return null;
    var ans = make();
    if (ex.some(function (e) { return look(e) === look(ans); })) return null;
    var dis = [];
    for (var t = 0; t < 30; t++) {
      var x = make(), kb = rnd.pick(rule), nv = rv(rnd, kb);
      if (nv === fixed[kb]) continue;
      x[kb] = nv;
      dis.push(x);
    }
    var n = lv === 3 ? 5 : 4;
    var o = BP.options(rnd, ans, dis, look, n);
    if (!o) return null;
    var rw = rule.map(function (k) { return fixed[k]; });
    var ruleText = rule.map(function (k) { return "the " + NAME[k] + " (" + valWord(k, fixed[k]) + ")"; }).join(" and ");
    var fig = BP.grid([ex], { size: 112, draw: function (g, x, y, w) { return draw(g, x, y, w); }, label: "Three figures that go together: " + ex.map(function (e) { return say(e, attrs); }).join("; ") });
    var opts = o.list.map(function (g) { return BP.tile(draw(g, 4, 4, 100), 100); });
    var vary = attrs.filter(function (k) { return rule.indexOf(k) < 0; }).map(function (k) { return NAME[k]; });
    var wrong = o.list.map(function (g, i) { return i; }).filter(function (i) { return i !== o.answer; });
    var near = wrong.filter(function (i) { return rule.some(function (k) { return o.list[i][k] !== fixed[k]; }); })[0];
    var bk = near === undefined ? null : rule.filter(function (k) { return o.list[near][k] !== fixed[k]; })[0];
    var steps = [
      "Look at the three figures on top. Ask: <b>what is the same in all three?</b>",
      "The " + (rule.length > 1 ? "properties that stay the same are " : "property that stays the same is ") + ruleText + ". " + (vary.length ? "The " + vary.join(" and the ") + " changes from figure to figure, so that is <i>not</i> the rule." : ""),
      "Now check each choice. The right one must have " + ruleText + "." + (bk ? " For example, choice " + BP.LETTER[near] + " has a different " + NAME[bk] + ", so it does not belong." : ""),
      "Only one choice keeps " + (rule.length > 1 ? "both" : "the") + " same " + rule.map(function (k) { return NAME[k]; }).join(" and ") + ".",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    var sol = BP.grid([ex.concat([ans])], { size: 90, mark: { "0,3": "#1fa866" }, draw: function (g, x, y, w) { return draw(g, x, y, w); }, label: "The matching figure joins the group" });
    var q = { prompt: "The three figures on top go together. Which one of the choices goes with them?",
      speak: "Look at the three figures on top. They go together in some way. Which one of the choices goes with them?",
      fig: fig, kind: "svg", opts: opts, answer: o.answer, steps: steps, solutionFig: sol, data: { attrs: attrs, ex: ex, opts: o.list } };
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }

  BP.reg("figure-classification", { name: "Figure Classification", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

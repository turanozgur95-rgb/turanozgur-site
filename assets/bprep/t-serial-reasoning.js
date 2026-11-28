/* Serial Reasoning (NNAT style): 3x3 grid, the shapes change row by row / column by column. The bottom-right box is missing.
   Each property (shape, color, number) follows its own pattern: by column, by row, or a "Latin square" (each value once per row and column). */
(function (BP) {
  "use strict";
  var SHAPES = ["circle", "square", "triangle", "diamond", "star", "hexagon"];
  var NAME = { shape: "shape", color: "color", count: "number" };
  var FILL = { blue: BP.COLOR.blue, yellow: BP.COLOR.yellow, green: BP.COLOR.green, black: BP.COLOR.black, white: "#ffffff" };
  function look(c) { return c.shape + "|" + c.color + "|" + c.count; }
  function draw(c, x, y, w) { return BP.cell({ shape: c.shape, color: FILL[c.color] ? c.color : c.color, count: c.count }, x, y, w); }

  // ---------------------------------------------------------------- independent solver
  var IDX = { col: function (r, c) { return c; }, row: function (r, c) { return r; }, lat: function (r, c) { return (r + c) % 3; }, lat2: function (r, c) { return (r + 2 * c) % 3; }, one: function () { return 0; } };
  function solve(q) {
    var d = q.data, want = {};
    d.attrs.forEach(function (a) {
      var preds = {}, n = 0;
      Object.keys(IDX).forEach(function (h) {
        var map = {}, ok = true;
        for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
          var cell = d.cells[r][c]; if (!cell) continue;
          var i = IDX[h](r, c);
          if (map[i] === undefined) map[i] = cell[a]; else if (map[i] !== cell[a]) ok = false;
        }
        if (!ok) return;
        var vals = Object.keys(map).map(function (i) { return map[i]; });
        if (h !== "one" && new Set(vals).size !== vals.length) return;       // different positions must give different values
        if (h === "one" && Object.keys(map).length) { /* constant */ }
        var m = map[IDX[h](2, 2)];
        if (m === undefined) return;
        if (h !== "one" && Object.keys(map).length < 3) return;
        preds[m] = 1; n++;
      });
      var ks = Object.keys(preds);
      if (ks.length !== 1) throw new Error(a + " predictions " + ks.length);
      want[a] = a === "count" ? +ks[0] : ks[0];
    });
    var hit = [];
    d.opts.forEach(function (o, i) { if (d.attrs.every(function (a) { return o[a] === want[a]; })) hit.push(i); });
    if (hit.length !== 1) throw new Error("fits " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator
  function gen(rnd, lv) {
    var attrs, pat = {};
    var dirs = ["row", "col"];
    if (lv === 1) { attrs = rnd.sample(["shape", "color", "count"], 2); var d0 = rnd.pick(dirs); pat[attrs[0]] = d0; pat[attrs[1]] = d0 === "row" ? "col" : "row"; }
    else if (lv === 2) { attrs = rnd.sample(["shape", "color", "count"], 2); pat[attrs[0]] = rnd.pick(["lat", "lat2"]); pat[attrs[1]] = rnd.pick(dirs); }
    else { attrs = ["shape", "color", "count"]; var kinds = rnd.shuffle(["lat", rnd.pick(dirs), rnd.pick(["row", "col", "lat2"])]); attrs.forEach(function (a, i) { pat[a] = kinds[i]; }); if (pat.shape === pat.color && pat.color === pat.count) return null; }
    var pool = { shape: rnd.sample(SHAPES, 3), color: rnd.sample(BP.NNAT, 3), count: rnd.pick([[1, 2, 3], [3, 2, 1], rnd.shuffle([1, 2, 3])]) };
    var cells = [], r, c;
    for (r = 0; r < 3; r++) { cells.push([]); for (c = 0; c < 3; c++) {
      var cell = { shape: "circle", color: "blue", count: 1 };
      attrs.forEach(function (a) { cell[a] = pool[a][IDX[pat[a]](r, c)]; });
      if (attrs.indexOf("shape") < 0) cell.shape = "circle";
      cells[r].push(cell);
    } }
    var D = cells[2][2], dis = [];
    attrs.forEach(function (a) { pool[a].forEach(function (v) { if (v !== D[a]) { var x = JSON.parse(JSON.stringify(D)); x[a] = v; dis.push(x); } }); });
    for (var t = 0; t < 4; t++) { var y = JSON.parse(JSON.stringify(D)); attrs.forEach(function (a) { if (rnd.chance(0.6)) y[a] = rnd.pick(pool[a]); }); dis.push(y); }
    dis = rnd.shuffle(dis);
    var o = BP.options(rnd, D, dis, look, 5);
    if (!o) return null;
    var shown = cells.map(function (row, i) { return row.map(function (x, j) { return i === 2 && j === 2 ? null : x; }); });
    var cn = ["first", "second", "third"];
    function listV(a) { return pool[a].map(function (v) { return a === "count" ? v : v; }).join(", "); }
    var steps = ["Look at the grid <b>row by row</b> and <b>column by column</b>. Ask: what changes, and in which direction?"];
    attrs.forEach(function (a) {
      var p = pat[a], nm = NAME[a], missing;
      if (p === "col") steps.push("The " + nm + " goes with the <b>column</b>: column 1 is " + pool[a][0] + ", column 2 is " + pool[a][1] + ", column 3 is " + pool[a][2] + ". So the last box needs " + pool[a][2] + ".");
      else if (p === "row") steps.push("The " + nm + " goes with the <b>row</b>: row 1 is " + pool[a][0] + ", row 2 is " + pool[a][1] + ", row 3 is " + pool[a][2] + ". So the last box needs " + pool[a][2] + ".");
      else steps.push("For the " + nm + ", each of " + listV(a) + " shows up <b>once in every row and every column</b>. The last row already has " + pool[a].filter(function (v) { return v !== D[a]; }).join(" and ") + ", so the last box needs " + D[a] + ".");
    });
    steps.push("Put it together: the missing box has " + attrs.map(function (a) { return "the " + NAME[a] + " " + D[a]; }).join(" and ") + ". Only one choice matches all of it.");
    steps.push("Answer: <b>" + BP.LETTER[o.answer] + "</b>.");
    function say(x) { return x.count + " " + x.color + " " + x.shape + (x.count > 1 ? "s" : ""); }
    var q = { prompt: "Look at the rows and columns. Which picture goes in the empty box?",
      speak: "Look at the rows and the columns. The pictures change in a pattern. Which picture goes in the empty box?",
      fig: BP.grid(shown, { size: 104, draw: draw, label: "3 by 3 grid with the bottom right box missing" }), kind: "svg",
      opts: o.list.map(function (x) { return BP.tile(draw(x, 4, 4, 100), 100); }), answer: o.answer, steps: steps,
      solutionFig: BP.grid(cells, { size: 90, draw: draw, mark: { "2,2": "#1fa866" }, label: "The finished grid" }),
      data: { attrs: attrs, cells: shown, opts: o.list } };
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }

  BP.reg("serial-reasoning", { name: "Serial Reasoning", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

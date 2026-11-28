/* Paper Folding (CogAT nonverbal): a square paper is folded, a hole is punched; which picture shows it unfolded?
   Paper = 4x4 cells. Folds: v (vertical line), h (horizontal), d / a (diagonals). Holes are [row, col, shape]. */
(function (BP) {
  "use strict";
  var HOLE = ["circle", "square", "diamond"];
  var KEEPS = { v: ["L", "R"], h: ["T", "B"], d: ["UR", "LL"], a: ["UL", "LR"] };
  var WORDS = {
    v: { R: "the left half folds over onto the right half", L: "the right half folds over onto the left half" },
    h: { B: "the top half folds down onto the bottom half", T: "the bottom half folds up onto the top half" },
    d: { UR: "the bottom-left half folds up onto the top-right half along the slanted line", LL: "the top-right half folds down onto the bottom-left half along the slanted line" },
    a: { UL: "the bottom-right half folds up onto the top-left half along the slanted line", LR: "the top-left half folds down onto the bottom-right half along the slanted line" }
  };
  var PAPER = "#fff8e1";
  function ck(h) { return h[0] + "," + h[1] + "," + h[2]; }
  function setKey(a) { return a.map(ck).sort().join(";"); }

  // ---------------------------------------------------------------- independent solver: fold every paper cell forward
  function mapCell(folds, r, c) {
    folds.forEach(function (f) {
      var t;
      if (f.k === "v" && (f.keep === "R" ? c < 2 : c >= 2)) c = 3 - c;
      else if (f.k === "h" && (f.keep === "B" ? r < 2 : r >= 2)) r = 3 - r;
      else if (f.k === "d" && (f.keep === "UR" ? c < r : c > r)) { t = r; r = c; c = t; }
      else if (f.k === "a" && (f.keep === "UL" ? r + c > 3 : r + c < 3)) { t = r; r = 3 - c; c = 3 - t; }
    });
    return [r, c];
  }
  function punch(folds, holes) {
    var out = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var p = mapCell(folds, r, c);
      holes.forEach(function (h) { if (h[0] === p[0] && h[1] === p[1]) out.push([r, c, h[2]]); });
    }
    return out;
  }
  function solve(q) {
    var d = q.data, want = setKey(punch(d.folds, d.holes)), hit = [];
    if (!want) throw new Error("no holes");
    d.opts.forEach(function (o, i) { if (setKey(o) === want) hit.push(i); });
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator helpers (unfold by mirroring)
  function refl(k, p) { return k === "v" ? [p[0], 3 - p[1], p[2]] : k === "h" ? [3 - p[0], p[1], p[2]] : k === "d" ? [p[1], p[0], p[2]] : [3 - p[1], 3 - p[0], p[2]]; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (p) { if (!s[ck(p)]) { s[ck(p)] = 1; o.push(p); } }); return o; }
  function unfoldKinds(kinds, holes) {
    var pts = holes.slice();
    for (var i = kinds.length - 1; i >= 0; i--) pts = uniq(pts.concat(pts.map(function (p) { return refl(kinds[i], p); })));
    return pts;
  }

  // ---------------------------------------------------------------- drawing
  function holeSvg(shape, x, y, rad) {
    var f = 'fill="' + BP.INK + '"';
    if (shape === "circle") return '<circle cx="' + BP.f1(x) + '" cy="' + BP.f1(y) + '" r="' + BP.f1(rad) + '" ' + f + "/>";
    if (shape === "square") return '<rect x="' + BP.f1(x - rad * 0.9) + '" y="' + BP.f1(y - rad * 0.9) + '" width="' + BP.f1(rad * 1.8) + '" height="' + BP.f1(rad * 1.8) + '" ' + f + "/>";
    return '<polygon points="' + BP.poly([[x, y - rad * 1.15], [x + rad * 1.05, y], [x, y + rad * 1.15], [x - rad * 1.05, y]]) + '" ' + f + "/>";
  }
  function holesSvg(list, px, py, cs, rad) {
    return list.map(function (h) { return holeSvg(HOLE[h[2]], px + (h[1] + 0.5) * cs, py + (h[0] + 0.5) * cs, rad); }).join("");
  }
  function bounds(folds) { // cells still on the paper after these folds
    var r0 = 9, r1 = -1, c0 = 9, c1 = -1;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) { var p = mapCell(folds, r, c); r0 = Math.min(r0, p[0]); r1 = Math.max(r1, p[0]); c0 = Math.min(c0, p[1]); c1 = Math.max(c1, p[1]); }
    return { r0: r0, r1: r1, c0: c0, c1: c1 };
  }
  function region(folds, px, py, S) {
    var st = 'fill="' + PAPER + '" stroke="' + BP.INK + '" stroke-width="2.6" stroke-linejoin="round"', cs = S / 4, last = folds[folds.length - 1];
    if (last && (last.k === "d" || last.k === "a")) {
      var tri = { UR: [[0, 0], [S, 0], [S, S]], LL: [[0, 0], [0, S], [S, S]], UL: [[0, 0], [S, 0], [0, S]], LR: [[S, 0], [S, S], [0, S]] }[last.keep];
      return '<polygon points="' + BP.poly(tri.map(function (p) { return [px + p[0], py + p[1]]; })) + '" ' + st + "/>";
    }
    var b = bounds(folds);
    return '<rect x="' + BP.f1(px + b.c0 * cs) + '" y="' + BP.f1(py + b.r0 * cs) + '" width="' + BP.f1((b.c1 - b.c0 + 1) * cs) + '" height="' + BP.f1((b.r1 - b.r0 + 1) * cs) + '" rx="3" ' + st + "/>";
  }
  function arrow(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), px = dy / L, py = -dx / L;
    if (py > 0.01 || (Math.abs(py) <= 0.01 && px < 0)) { px = -px; py = -py; }
    var cx = (x1 + x2) / 2 + px * 22, cy = (y1 + y2) / 2 + py * 22, ex = x2 - cx, ey = y2 - cy, el = Math.sqrt(ex * ex + ey * ey);
    ex /= el; ey /= el;
    var hx = x2 - ex * 10, hy = y2 - ey * 10;
    return '<path d="M' + BP.f1(x1) + "," + BP.f1(y1) + " Q" + BP.f1(cx) + "," + BP.f1(cy) + " " + BP.f1(hx) + "," + BP.f1(hy) + '" fill="none" stroke="#e0562b" stroke-width="3.4" stroke-linecap="round"/>' +
      '<polygon points="' + BP.poly([[x2, y2], [hx - ey * 6, hy + ex * 6], [hx + ey * 6, hy - ex * 6]]) + '" fill="#e0562b"/>';
  }
  var ARROW = { v: { R: [.2, .32, .8, .32], L: [.8, .32, .2, .32] }, h: { B: [.32, .2, .32, .8], T: [.32, .8, .32, .2] },
    d: { UR: [.28, .72, .72, .28], LL: [.72, .28, .28, .72] }, a: { UL: [.72, .72, .28, .28], LR: [.28, .28, .72, .72] } };
  function foldMarks(folds, i, px, py, S) {
    var f = folds[i], b = bounds(folds.slice(0, i)), cs = S / 4, bx = px + b.c0 * cs, by = py + b.r0 * cs, bw = (b.c1 - b.c0 + 1) * cs, bh = (b.r1 - b.r0 + 1) * cs, ln;
    var ds = 'stroke="' + BP.INK + '" stroke-width="2.6" stroke-dasharray="7 5" stroke-linecap="round"';
    if (f.k === "v") ln = [bx + bw / 2, by - 6, bx + bw / 2, by + bh + 6];
    else if (f.k === "h") ln = [bx - 6, by + bh / 2, bx + bw + 6, by + bh / 2];
    else if (f.k === "d") ln = [px - 5, py - 5, px + S + 5, py + S + 5];
    else ln = [px + S + 5, py - 5, px - 5, py + S + 5];
    var a = ARROW[f.k][f.keep];
    return '<line x1="' + ln[0] + '" y1="' + ln[1] + '" x2="' + ln[2] + '" y2="' + ln[3] + '" ' + ds + "/>" + arrow(bx + a[0] * bw, by + a[1] * bh, bx + a[2] * bw, by + a[3] * bh);
  }
  function figure(folds, holes) {
    var S = 112, gap = 46, X0 = 16, Y0 = 16, P = folds.length + 1, W = 2 * X0 + P * S + (P - 1) * gap, s = '<rect width="' + W + '" height="' + (Y0 + S + 44) + '" rx="18" fill="' + BP.BG + '"/>';
    for (var i = 0; i < P; i++) {
      var px = X0 + i * (S + gap), py = Y0;
      if (i > 0) s += '<rect x="' + px + '" y="' + py + '" width="' + S + '" height="' + S + '" fill="none" stroke="#b8c3da" stroke-width="2" stroke-dasharray="3 5"/>';
      s += region(folds.slice(0, i), px, py, S);
      if (i < P - 1) s += foldMarks(folds, i, px, py, S);
      else s += holesSvg(holes, px, py, S / 4, 7.5);
      s += BP.text(px + S / 2, py + S + 28, i < P - 1 ? "Fold " + (i + 1) : "Punch!", { size: 17, color: "#5b6b8c" });
      if (i < P - 1) { var ax = px + S + 8; s += '<path d="M' + ax + "," + (py + S / 2) + " h" + (gap - 22) + '" stroke="#9aa7c4" stroke-width="3.4" stroke-linecap="round"/><polygon points="' + BP.poly([[ax + gap - 10, py + S / 2], [ax + gap - 20, py + S / 2 - 7], [ax + gap - 20, py + S / 2 + 7]]) + '" fill="#9aa7c4"/>'; }
    }
    return BP.svg(W, Y0 + S + 44, s, "Paper folded " + folds.length + (folds.length > 1 ? " times" : " time") + " and then punched");
  }
  function paper(list, ox, oy, S, extra) {
    return '<rect x="' + ox + '" y="' + oy + '" width="' + S + '" height="' + S + '" rx="4" fill="' + PAPER + '" stroke="' + BP.INK + '" stroke-width="2.4"/>' + (extra || "") + holesSvg(list, ox, oy, S / 4, S * 0.075);
  }

  // ---------------------------------------------------------------- generator
  function gen(rnd, lv) {
    function fl(k) { return { k: k, keep: rnd.pick(KEEPS[k]) }; }
    var folds, nh, ax = rnd.pick(["v", "h"]);
    if (lv === 1) { folds = [fl(ax)]; nh = 1; }
    else if (lv === 2) { if (rnd.chance(0.5)) { folds = [fl(ax)]; nh = 2; } else { folds = (rnd.chance(0.5) ? ["v", "h"] : ["h", "v"]).map(fl); nh = 1; } }
    else if (rnd.chance(0.5)) { folds = (rnd.chance(0.5) ? ["v", "h"] : ["h", "v"]).map(fl); nh = 2; }
    else { folds = [fl(rnd.pick(["d", "a"]))]; nh = rnd.pick([1, 2]); }
    var kinds = folds.map(function (f) { return f.k; }), diag = kinds[0] === "d" || kinds[0] === "a", cells = [], seen = {};
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var p = mapCell(folds, r, c);
      if (diag && (kinds[0] === "d" ? p[0] === p[1] : p[0] + p[1] === 3)) continue;
      if (!seen[p]) { seen[p] = 1; cells.push(p); }
    }
    var pick = rnd.sample(cells, nh), holes = pick.map(function (p) { return [p[0], p[1], rnd.int(0, 2)]; });
    if (nh === 2 && holes[0][2] === holes[1][2] && lv === 3) holes[1][2] = (holes[0][2] + 1) % 3;
    holes.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var ans = unfoldKinds(kinds, holes), plain = holes.map(function (h) { return h.slice(); });
    var dis = [plain], rest = [], all = ["v", "h", "d", "a"];
    var seqs = kinds.length === 1 ? all.map(function (k) { return [k]; }) : [].concat.apply([], all.map(function (a) { return all.map(function (b) { return [a, b]; }); }));
    seqs.forEach(function (s) { if (s.join() !== kinds.join()) rest.push(unfoldKinds(s, holes)); });
    if (ans.length > 1) { var m = ans.slice(); m.splice(rnd.int(0, m.length - 1), 1); rest.push(m); }
    var ex = ans.slice(); ex.push([rnd.int(0, 3), rnd.int(0, 3), rnd.int(0, 2)]); rest.push(uniq(ex));
    rest.push(ans.map(function (h) { return [h[0], (h[1] + 1) % 4, h[2]]; }));
    rest.push(ans.map(function (h) { return [h[0], h[1], (h[2] + 1) % 3]; }));
    dis = dis.concat(rnd.shuffle(rest));
    var o = BP.options(rnd, ans, dis, setKey, lv === 1 ? 4 : 5);
    if (!o) return null;
    var fig = figure(folds, holes), opts = o.list.map(function (l) { return BP.tile(paper(l, 14, 14, 80), 100); });
    var lines = "";
    kinds.forEach(function (k) {
      var st = 'stroke="#c6cfe3" stroke-width="2" stroke-dasharray="5 5"', S = 132;
      lines += k === "v" ? '<line x1="' + (S / 2 + 12) + '" y1="12" x2="' + (S / 2 + 12) + '" y2="' + (S + 12) + '" ' + st + "/>" : k === "h" ? '<line x1="12" y1="' + (S / 2 + 12) + '" x2="' + (S + 12) + '" y2="' + (S / 2 + 12) + '" ' + st + "/>" :
        k === "d" ? '<line x1="12" y1="12" x2="' + (S + 12) + '" y2="' + (S + 12) + '" ' + st + "/>" : '<line x1="' + (S + 12) + '" y1="12" x2="12" y2="' + (S + 12) + '" ' + st + "/>";
    });
    var ring = ans.map(function (h) { return '<circle cx="' + BP.f1(12 + (h[1] + 0.5) * 33) + '" cy="' + BP.f1(12 + (h[0] + 0.5) * 33) + '" r="13" fill="none" stroke="#1fa866" stroke-width="3"/>'; }).join("");
    var solutionFig = BP.svg(156, 156, paper(ans, 12, 12, 132, lines + ring), "The paper unfolded with " + ans.length + " holes");
    var hw = holes.map(function (h) { return "a " + HOLE[h[2]] + " hole (" + (h[0] < 2 ? "top" : "bottom") + "-" + (h[1] < 2 ? "left" : "right") + " part of the paper)"; });
    var pi = o.list.findIndex(function (l) { return setKey(l) === setKey(plain); });
    var steps = [
      "Follow the folds one by one. " + folds.map(function (f, i) { var w = WORDS[f.k][f.keep]; return (i ? "Then " : "First, ") + w + "."; }).join(" ").replace(/^First, t/, "First, t"),
      "Now the paper is punched: " + hw.join(" and ") + ". The punch goes through <b>every layer</b> of folded paper.",
      "Unfold backward, last fold first. Every hole has a <b>mirror twin</b> on the other side of each fold line: the same shape, the same distance from the line. " + (folds.length === 2 ? "Two folds: every hole makes 4 holes." : "One fold: every hole makes 2 holes."),
      "So the open paper has <b>" + ans.length + "</b> hole" + (ans.length > 1 ? "s" : "") + "." + (pi >= 0 ? " Choice " + BP.LETTER[pi] + " only shows the holes you punched. It forgets their twins." : " A picture with fewer or more holes cannot be right."),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    var q = { prompt: "The paper is folded and punched. Which picture shows the paper when it is unfolded?",
      speak: "Look at how the paper is folded. Then a hole is punched through it. Which picture shows the paper after you unfold it?",
      fig: fig, kind: "svg", opts: opts, answer: o.answer, steps: steps, solutionFig: solutionFig, data: { folds: folds, holes: holes, opts: o.list } };
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }

  BP.reg("paper-folding", { name: "Paper Folding", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

/* Tamakala Games · Brainosaur Prep question engine (original, code-generated practice questions).
   BP.reg(key, {name, group: "verbal"|"quant"|"nonverbal", gen(rnd, level) -> Q|null, solve(Q) -> answer index (independent solver)})
   Q = {prompt: "text", speak?: "text read aloud", fig: "<svg>", kind: "svg"|"text", opts: ["<svg>"|"text"], answer: i,
        steps: ["html", ...], data: {...raw data for the solver}, solutionFig?: "<svg>"}
   Levels: 1 = K–1 (ages 5–7), 2 = Grade 2 (ages 7–8), 3 = Grade 3 (ages 8–9). */
(function (G) {
  "use strict";
  var BP = { T: {}, ORDER: [], PICS: "/assets/bprep/pics/" };

  // ---------------------------------------------------------------- seeded random
  BP.rnd = function (seed) {
    var a = seed >>> 0;
    function f() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    f.int = function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.shuffle = function (arr) { var b = arr.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
    f.sample = function (arr, n) { return f.shuffle(arr).slice(0, n); };
    f.chance = function (p) { return f() < p; };
    return f;
  };

  // ---------------------------------------------------------------- colours and drawing
  BP.COLOR = { red: "#ef4d56", blue: "#3d7ff2", green: "#1fa866", yellow: "#f5b700", purple: "#8b5cf6", orange: "#f5821f", pink: "#ec5fa6",
    black: "#26263a", white: "#ffffff", gray: "#9aa3b5" };
  BP.COLORS = ["red", "blue", "green", "yellow", "purple"];
  BP.NNAT = ["blue", "yellow", "green", "black", "white"]; // NNAT-style palette
  BP.INK = "#1d2742";
  BP.BG = "#eef3fb";
  BP.BOX = "#ffffff";
  BP.ASK = "#fff6d1";
  BP.SHAPES = ["circle", "square", "triangle", "star", "diamond", "heart", "hexagon"];

  function f1(x) { return Math.round(x * 10) / 10; }
  BP.f1 = f1;
  function poly(pts) { return pts.map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" "); }
  BP.poly = poly;
  BP.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  BP.cap = function (s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); };
  BP.plural = function (n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); };

  BP.svg = function (w, h, inner, label) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + f1(w) + " " + f1(h) + '" role="img"' + (label ? ' aria-label="' + BP.esc(label) + '"' : ' aria-hidden="true"') + ">" + inner + "</svg>";
  };

  /* One shape. o: {empty: true (outline only), sw: stroke width, fill: raw colour, stroke: raw colour} */
  BP.shape = function (name, cx, cy, r, color, rot, o) {
    o = o || {};
    var fill = o.empty ? "none" : (o.fill || BP.COLOR[color] || color);
    var sw = o.sw || Math.max(1.6, r * 0.09);
    var st = 'fill="' + fill + '" stroke="' + (o.stroke || BP.INK) + '" stroke-width="' + f1(sw) + '" stroke-linejoin="round"';
    var tr = rot ? ' transform="rotate(' + rot + " " + f1(cx) + " " + f1(cy) + ')"' : "";
    var i, pts = [], a;
    switch (name) {
      case "circle": return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r * 0.9) + '" ' + st + "/>";
      case "square": var s = r * 1.6; return '<rect x="' + f1(cx - s / 2) + '" y="' + f1(cy - s / 2) + '" width="' + f1(s) + '" height="' + f1(s) + '" rx="' + f1(r * 0.14) + '" ' + st + tr + "/>";
      case "triangle": return '<polygon points="' + poly([[cx, cy - r], [cx + r * 0.97, cy + r * 0.74], [cx - r * 0.97, cy + r * 0.74]]) + '" ' + st + tr + "/>";
      case "diamond": return '<polygon points="' + poly([[cx, cy - r], [cx + r * 0.72, cy], [cx, cy + r], [cx - r * 0.72, cy]]) + '" ' + st + tr + "/>";
      case "star":
        for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; var rr = i % 2 ? r * 0.46 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
        return '<polygon points="' + poly(pts) + '" ' + st + tr + "/>";
      case "hexagon":
        for (i = 0; i < 6; i++) { a = Math.PI / 6 + i * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
        return '<polygon points="' + poly(pts) + '" ' + st + tr + "/>";
      case "pentagon":
        for (i = 0; i < 5; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / 5; pts.push([cx + r * Math.cos(a), cy + r * 0.98 * Math.sin(a) + r * 0.08]); }
        return '<polygon points="' + poly(pts) + '" ' + st + tr + "/>";
      case "arrow":
        var w = r * 0.38;
        return '<polygon points="' + poly([[cx, cy - r], [cx + r * 0.82, cy - r * 0.08], [cx + w, cy - r * 0.08], [cx + w, cy + r], [cx - w, cy + r], [cx - w, cy - r * 0.08], [cx - r * 0.82, cy - r * 0.08]]) + '" ' + st + tr + "/>";
      case "cross":
        var t = r * 0.36;
        return '<polygon points="' + poly([[cx - t, cy - r], [cx + t, cy - r], [cx + t, cy - t], [cx + r, cy - t], [cx + r, cy + t], [cx + t, cy + t], [cx + t, cy + r], [cx - t, cy + r], [cx - t, cy + t], [cx - r, cy + t], [cx - r, cy - t], [cx - t, cy - t]]) + '" ' + st + tr + "/>";
      case "moon":
        return '<path d="M' + f1(cx + r * 0.35) + "," + f1(cy - r * 0.86) + " A" + f1(r * 0.92) + "," + f1(r * 0.92) + " 0 1 0 " + f1(cx + r * 0.35) + "," + f1(cy + r * 0.86) + " A" + f1(r * 0.7) + "," + f1(r * 0.7) + " 0 1 1 " + f1(cx + r * 0.35) + "," + f1(cy - r * 0.86) + 'Z" ' + st + tr + "/>";
      case "heart":
        var k = r / 10;
        var d = "M" + f1(cx) + "," + f1(cy + 9 * k) + " C" + f1(cx - 12 * k) + "," + f1(cy + k) + " " + f1(cx - 11 * k) + "," + f1(cy - 9 * k) + " " + f1(cx - 5 * k) + "," + f1(cy - 9 * k) +
          " C" + f1(cx - 2 * k) + "," + f1(cy - 9 * k) + " " + f1(cx) + "," + f1(cy - 7 * k) + " " + f1(cx) + "," + f1(cy - 5 * k) + " C" + f1(cx) + "," + f1(cy - 7 * k) + " " + f1(cx + 2 * k) + "," + f1(cy - 9 * k) + " " + f1(cx + 5 * k) + "," + f1(cy - 9 * k) +
          " C" + f1(cx + 11 * k) + "," + f1(cy - 9 * k) + " " + f1(cx + 12 * k) + "," + f1(cy + k) + " " + f1(cx) + "," + f1(cy + 9 * k) + "Z";
        return '<path d="' + d + '" ' + st + tr + "/>";
    }
    throw new Error("shape? " + name);
  };

  // positions of n shapes inside a cell
  BP.SPOTS = { 1: [[.5, .5]], 2: [[.3, .5], [.7, .5]], 3: [[.5, .28], [.27, .7], [.73, .7]], 4: [[.3, .3], [.7, .3], [.3, .7], [.7, .7]],
    5: [[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]], 6: [[.27, .3], [.5, .3], [.73, .3], [.27, .7], [.5, .7], [.73, .7]] };

  /* c: {shape, color, count, rot, size, empty} drawn in a w×w cell at (x, y) */
  BP.cell = function (c, x, y, w) {
    var n = c.count || 1, out = "";
    var r = w * (n === 1 ? 0.3 : n === 2 ? 0.17 : n <= 4 ? 0.135 : 0.115) * (c.size || 1);
    BP.SPOTS[n].forEach(function (p) { out += BP.shape(c.shape, x + p[0] * w, y + p[1] * w, r, c.color, c.rot || 0, { empty: c.empty }); });
    return out;
  };

  /* A rounded box; o: {ask: true (yellow "?" box), h, bg, mark: highlight colour} */
  BP.box = function (x, y, w, inner, o) {
    o = o || {};
    var h = o.h || w;
    var s = '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + f1(Math.min(w, h) * 0.09) + '" fill="' + (o.ask ? BP.ASK : o.bg || BP.BOX) +
      '" stroke="' + (o.mark || "#cbd4e6") + '" stroke-width="' + (o.mark ? 4 : 2.2) + '"/>';
    if (o.ask) s += '<text x="' + f1(x + w / 2) + '" y="' + f1(y + h * 0.5 + Math.min(w, h) * 0.17) + '" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="' + f1(Math.min(w, h) * 0.48) + '" fill="#e2a000">?</text>';
    return s + (inner || "");
  };

  /* Grid of cells: array of rows, null cell = "?" box. o: {size, gap, draw: cell drawer, mark: {"r,c": colour}, label} */
  BP.grid = function (rows, o) {
    o = o || {};
    var n = rows.length, m = rows[0].length, hc = o.size || 104, gap = o.gap || 10, draw = o.draw || BP.cell;
    var W = m * hc + (m + 1) * gap, H = n * hc + (n + 1) * gap, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>';
    for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) {
      var x = gap + c * (hc + gap), y = gap + r * (hc + gap), mk = o.mark && o.mark[r + "," + c];
      s += rows[r][c] === null ? BP.box(x, y, hc, "", { ask: true, mark: mk }) : BP.box(x, y, hc, draw(rows[r][c], x, y, hc), { mark: mk });
    }
    return BP.svg(W, H, s, o.label);
  };

  /* One answer-option tile (white rounded square) */
  BP.tile = function (inner, w, h) {
    w = w || 100; h = h || w;
    return BP.svg(w + 8, h + 8, '<rect x="4" y="4" width="' + w + '" height="' + h + '" rx="' + f1(w * 0.1) + '" fill="#fff"/>' + inner);
  };

  BP.text = function (x, y, t, o) {
    o = o || {};
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-family="Nunito,Arial,sans-serif" font-weight="' + (o.weight || 800) + '" font-size="' + (o.size || 24) + '" fill="' + (o.color || BP.INK) + '">' + BP.esc(t) + "</text>";
  };

  /* Picture (Noto Emoji image, Apache 2.0) drawn at x,y with size s */
  BP.pic = function (id, x, y, s) {
    return '<image href="' + BP.PICS + id + '.webp" x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(s) + '" height="' + f1(s) + '"/>';
  };
  /* Picture as an answer tile */
  BP.picTile = function (id, label) {
    return BP.svg(108, 108, '<rect x="4" y="4" width="100" height="100" rx="12" fill="#fff"/>' + BP.pic(id, 14, 14, 80), label);
  };

  /* Mix the correct option with distractors (unique by key fn). Returns {list, answer} or null */
  BP.options = function (rnd, correct, distractors, key, n) {
    n = n || 4;
    var k = key || function (x) { return JSON.stringify(x); };
    var seen = {}, l = [correct];
    seen[k(correct)] = 1;
    for (var i = 0; i < distractors.length && l.length < n; i++) { var kk = k(distractors[i]); if (!seen[kk]) { seen[kk] = 1; l.push(distractors[i]); } }
    if (l.length < n) return null;
    var s = rnd.shuffle(l);
    return { list: s, answer: s.indexOf(correct) };
  };

  BP.LETTER = "ABCDEF";
  BP.LEVEL = { 1: "K–1", 2: "Grade 2", 3: "Grade 3" };
  BP.LEVEL_LONG = { 1: "Kindergarten–Grade 1 (ages 5–7)", 2: "Grade 2 (ages 7–8)", 3: "Grade 3 (ages 8–9)" };
  BP.reg = function (key, t) { t.key = key; BP.T[key] = t; if (BP.ORDER.indexOf(key) < 0) BP.ORDER.push(key); };

  /* Single entry point: make a question (seed + level). On failure tries the next seed. */
  BP.make = function (key, level, seed) {
    var t = BP.T[key];
    for (var k = 0; k < 400; k++) {
      var rnd = BP.rnd((seed >>> 0) + k * 7919);
      var q = t.gen(rnd, level);
      if (q) { q.type = key; q.level = level; q.seed = seed; return q; }
    }
    throw new Error("could not make " + key + " " + level);
  };

  /* Test: n seeds × 3 levels; the independent solver must find the answer, options unique */
  BP.test = function (key, n) {
    var t = BP.T[key], err = [], count = 0;
    for (var lv = 1; lv <= 3; lv++) for (var i = 0; i < n; i++) {
      var q;
      try { q = BP.make(key, lv, i * 104729 + lv); } catch (e) { err.push("make " + lv + "/" + i + ": " + e.message); continue; }
      count++;
      var c;
      try { c = t.solve(q); } catch (e) { err.push("solve " + lv + "/" + i + ": " + e.message); continue; }
      if (c !== q.answer) err.push("answer " + lv + "/" + i + ": gen " + q.answer + " solver " + c);
      var u = {};
      q.opts.forEach(function (s) { u[s] = 1; });
      if (Object.keys(u).length !== q.opts.length) err.push("same-option " + lv + "/" + i);
      if (q.opts.length < 3 || q.opts.length > 6) err.push("option-count " + lv + "/" + i);
      if (!q.steps || q.steps.length < 2) err.push("steps " + lv + "/" + i);
      if (!/Answer: <b>[A-F]<\/b>/.test(q.steps[q.steps.length - 1] || "") || q.steps[q.steps.length - 1].indexOf("<b>" + BP.LETTER[q.answer] + "</b>") < 0) err.push("last-step " + lv + "/" + i);
      if (err.length > 20) break;
    }
    return { type: key, questions: count, errors: err };
  };

  G.BP = BP;
})(typeof window !== "undefined" ? window : this);

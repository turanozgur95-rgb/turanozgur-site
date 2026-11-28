/* ---- bp.js */
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

/* ---- t-0bank.js */
/* Brainosaur Prep picture bank (generated by uretici/brainosaur/pics_bank.py; pictures: Noto Emoji, Apache 2.0). */
(function (BP) {
  "use strict";
  BP.BANK = {"pics":{"apple":["apple",["fruit","food","red_thing"]],"banana":["banana",["fruit","food","yellow_thing"]],"grapes":["grapes",["fruit","food"]],"orange":["orange",["fruit","food","round_thing"]],"pear":["pear",["fruit","food"]],"strawberry":["strawberry",["fruit","food","red_thing"]],"cherries":["cherries",["fruit","food","red_thing"]],"watermelon":["watermelon",["fruit","food"]],"pineapple":["pineapple",["fruit","food"]],"lemon":["lemon",["fruit","food","yellow_thing"]],"carrot":["carrot",["vegetable","food"]],"corn":["corn",["vegetable","food","yellow_thing"]],"broccoli":["broccoli",["vegetable","food"]],"potato":["potato",["vegetable","food"]],"cucumber":["cucumber",["vegetable","food"]],"eggplant":["eggplant",["vegetable","food"]],"onion":["onion",["vegetable","food"]],"pepper":["pepper",["vegetable","food","red_thing"]],"pizza":["pizza",["meal","food"]],"hamburger":["hamburger",["meal","food"]],"hotdog":["hot dog",["meal","food"]],"sandwich":["sandwich",["meal","food"]],"taco":["taco",["meal","food"]],"bread":["bread",["food"]],"cheese":["cheese",["food","yellow_thing"]],"egg":["egg",["food"]],"milk":["milk",["drink","food"]],"juice":["juice box",["drink","food"]],"coffee":["hot drink",["drink","food","hot_thing"]],"cookie":["cookie",["sweet","food","round_thing"]],"cake":["cake",["sweet","food"]],"icecream":["ice cream",["sweet","food","cold_thing"]],"honey":["honey",["sweet","food"]],"candy":["candy",["sweet","food"]],"lollipop":["lollipop",["sweet","food"]],"doughnut":["doughnut",["sweet","food","round_thing"]],"chestnut":["nut",["food"]],"bone":["bone",[]],"cow":["cow",["farm_animal","animal","mammal"]],"pig":["pig",["farm_animal","animal","mammal"]],"sheep":["sheep",["farm_animal","animal","mammal"]],"horse":["horse",["farm_animal","animal","mammal"]],"chicken":["hen",["farm_animal","animal","bird"]],"goat":["goat",["farm_animal","animal","mammal"]],"rabbit":["rabbit",["animal","mammal","pet"]],"dog":["dog",["animal","mammal","pet"]],"cat":["cat",["animal","mammal","pet"]],"mouse":["mouse",["animal","mammal"]],"hamster":["hamster",["animal","mammal","pet"]],"lion":["lion",["wild_animal","animal","mammal"]],"tiger":["tiger",["wild_animal","animal","mammal"]],"elephant":["elephant",["wild_animal","animal","mammal"]],"giraffe":["giraffe",["wild_animal","animal","mammal"]],"zebra":["zebra",["wild_animal","animal","mammal","striped_thing"]],"monkey":["monkey",["wild_animal","animal","mammal"]],"bear":["bear",["wild_animal","animal","mammal"]],"fox":["fox",["wild_animal","animal","mammal"]],"camel":["camel",["wild_animal","animal","mammal"]],"squirrel":["squirrel",["wild_animal","animal","mammal"]],"fish":["fish",["sea_animal","animal"]],"whale":["whale",["sea_animal","animal","mammal"]],"dolphin":["dolphin",["sea_animal","animal","mammal"]],"octopus":["octopus",["sea_animal","animal"]],"crab":["crab",["sea_animal","animal"]],"shark":["shark",["sea_animal","animal"]],"jellyfish":["jellyfish",["sea_animal","animal"]],"shrimp":["shrimp",["sea_animal","animal"]],"bird":["bird",["bird","animal","flies"]],"eagle":["eagle",["bird","animal","flies"]],"owl":["owl",["bird","animal","flies"]],"parrot":["parrot",["bird","animal","flies"]],"penguin":["penguin",["bird","animal"]],"duck":["duck",["bird","animal","flies"]],"chick":["chick",["bird","animal","baby_animal"]],"hatching":["hatching chick",["bird","animal","baby_animal"]],"bee":["bee",["bug","animal","flies","striped_thing"]],"ladybug":["ladybug",["bug","animal","flies","red_thing"]],"butterfly":["butterfly",["bug","animal","flies"]],"ant":["ant",["bug","animal"]],"caterpillar":["caterpillar",["bug","animal"]],"beetle":["beetle",["bug","animal"]],"snail":["snail",["animal"]],"spider":["spider",["animal"]],"frog":["frog",["animal"]],"snake":["snake",["animal"]],"turtle":["turtle",["animal"]],"trex":["T. rex",["dinosaur","animal"]],"sauropod":["long-neck dinosaur",["dinosaur","animal"]],"car":["car",["land_vehicle","vehicle","red_thing"]],"bus":["bus",["land_vehicle","vehicle"]],"truck":["truck",["land_vehicle","vehicle"]],"bicycle":["bicycle",["land_vehicle","vehicle"]],"train":["train",["land_vehicle","vehicle"]],"tractor":["tractor",["land_vehicle","vehicle"]],"motorcycle":["motorcycle",["land_vehicle","vehicle"]],"scooter":["scooter",["land_vehicle","vehicle"]],"firetruck":["fire truck",["land_vehicle","vehicle","red_thing"]],"ambulance":["ambulance",["land_vehicle","vehicle"]],"policecar":["police car",["land_vehicle","vehicle"]],"airplane":["airplane",["air_vehicle","vehicle","flies"]],"helicopter":["helicopter",["air_vehicle","vehicle","flies"]],"rocket":["rocket",["air_vehicle","vehicle","flies"]],"parachute":["parachute",["flies"]],"sailboat":["sailboat",["water_vehicle","vehicle"]],"ship":["ship",["water_vehicle","vehicle"]],"canoe":["canoe",["water_vehicle","vehicle"]],"speedboat":["speedboat",["water_vehicle","vehicle"]],"tshirt":["T-shirt",["clothing"]],"dress":["dress",["clothing"]],"jeans":["jeans",["clothing"]],"socks":["socks",["clothing"]],"coat":["coat",["clothing","winter_thing"]],"cap":["cap",["clothing"]],"gloves":["gloves",["clothing","winter_thing"]],"scarf":["scarf",["clothing","winter_thing","striped_thing"]],"shoe":["sneaker",["clothing"]],"boot":["boot",["clothing"]],"hammer":["hammer",["tool"]],"wrench":["wrench",["tool"]],"screwdriver":["screwdriver",["tool"]],"saw":["saw",["tool"]],"axe":["axe",["tool"]],"spoon":["spoon",["kitchen_thing"]],"forkknife":["fork and knife",["kitchen_thing"]],"pan":["frying pan",["kitchen_thing"]],"bowl":["bowl",["kitchen_thing"]],"cup":["cup",["kitchen_thing","drink"]],"pencil":["pencil",["school_thing"]],"crayon":["crayon",["school_thing"]],"scissors":["scissors",["school_thing"]],"ruler":["ruler",["school_thing"]],"book":["book",["school_thing"]],"backpack":["backpack",["school_thing"]],"paperclip":["paper clip",["school_thing"]],"paper":["paper",["school_thing"]],"paintbrush":["paintbrush",["art_thing","school_thing"]],"palette":["paint palette",["art_thing","school_thing"]],"guitar":["guitar",["instrument"]],"violin":["violin",["instrument"]],"trumpet":["trumpet",["instrument"]],"drum":["drum",["instrument"]],"piano":["piano keys",["instrument"]],"saxophone":["saxophone",["instrument"]],"microphone":["microphone",[]],"soccer":["soccer ball",["ball","toy","round_thing"]],"basketball":["basketball",["ball","toy","round_thing"]],"baseball":["baseball",["ball","toy","round_thing"]],"football":["football",["ball","toy"]],"tennisball":["tennis racket and ball",["ball","toy","round_thing"]],"volleyball":["volleyball",["ball","toy","round_thing"]],"teddy":["teddy bear",["toy"]],"kite":["kite",["toy","flies"]],"puzzle":["puzzle piece",["toy"]],"balloon":["balloon",["toy","flies","red_thing"]],"sun":["sun",["sky_thing","hot_thing","gives_light","weather"]],"moon":["moon",["sky_thing"]],"star":["star",["sky_thing"]],"cloud":["cloud",["sky_thing","weather"]],"rain":["rain cloud",["weather"]],"snowflake":["snowflake",["weather","cold_thing","winter_thing"]],"rainbow":["rainbow",["weather","sky_thing"]],"lightning":["lightning",["weather"]],"snowman":["snowman",["cold_thing","winter_thing"]],"ice":["ice cube",["cold_thing"]],"fire":["fire",["hot_thing","gives_light"]],"water":["water drop",[]],"wave":["ocean wave",[]],"house":["house",["building"]],"school":["school",["building"]],"hospital":["hospital",["building"]],"castle":["castle",["building"]],"office":["office building",["building"]],"tent":["tent",[]],"tree":["tree",["plant"]],"pine":["pine tree",["plant"]],"palm":["palm tree",["plant"]],"cactus":["cactus",["plant"]],"tulip":["tulip",["plant","flower"]],"sunflower":["sunflower",["plant","flower","yellow_thing"]],"rose":["rose",["plant","flower","red_thing"]],"seedling":["seedling",["plant"]],"leaf":["leaf",["plant"]],"herb":["grass",["plant"]],"nest":["nest",[]],"web":["spider web",[]],"desert":["desert",[]],"feather":["feather",[]],"shell":["seashell",[]],"key":["key",[]],"lock":["lock",[]],"door":["door",[]],"bed":["bed",["furniture"]],"chair":["chair",["furniture"]],"couch":["couch",["furniture"]],"toothbrush":["toothbrush",[]],"tooth":["tooth",[]],"soap":["soap",[]],"broom":["broom",[]],"basket":["basket",[]],"bucket":["bucket",[]],"bulb":["light bulb",["gives_light"]],"flashlight":["flashlight",["gives_light"]],"candle":["candle",["gives_light"]],"magnet":["magnet",[]],"thread":["thread",[]],"needle":["sewing needle",[]],"yarn":["yarn",[]],"camera":["camera",[]],"phone":["phone",[]],"envelope":["letter",[]],"clock":["alarm clock",[]],"glasses":["glasses",[]],"sunglasses":["sunglasses",[]],"umbrella":["umbrella",[]],"crown":["crown",[]],"magnifier":["magnifying glass",[]],"stethoscope":["stethoscope",[]],"microscope":["microscope",[]],"telescope":["telescope",[]],"log":["log",[]],"nutbolt":["nut and bolt",[]],"wheel":["wheel",[]],"road":["road",[]],"railway":["train track",[]],"mountain":["mountain",[]],"volcano":["volcano",[]],"chef":["cook",["worker"]],"farmer":["farmer",["worker"]],"firefighter":["firefighter",["worker"]],"doctor":["doctor",["worker"]],"artist":["artist",["worker"]],"scientist":["scientist",["worker"]],"astronaut":["astronaut",["worker"]],"pilot":["pilot",["worker"]],"mechanic":["mechanic",["worker"]],"singer":["singer",["worker"]],"baby":["baby",[]],"walker":["person walking",[]],"runner":["person running",[]],"cyclist":["person biking",[]],"swimmer":["person swimming",[]]},"relations":{"lives_in":[["bird","nest"],["spider","web"],["fish","wave"],["whale","wave"],["dolphin","wave"],["octopus","wave"],["shark","wave"],["camel","desert"],["eagle","nest"],["owl","nest"]],"gives_us":[["cow","milk"],["goat","milk"],["chicken","egg"],["duck","egg"],["bee","honey"],["sheep","yarn"],["tree","log"],["pine","log"],["tree","apple"]],"eats":[["rabbit","carrot"],["rabbit","herb"],["monkey","banana"],["mouse","cheese"],["dog","bone"],["squirrel","chestnut"],["cow","herb"],["sheep","herb"],["goat","herb"],["horse","herb"],["horse","carrot"],["caterpillar","leaf"],["bee","sunflower"],["bee","tulip"],["bee","rose"],["butterfly","sunflower"],["butterfly","tulip"],["butterfly","rose"],["bear","honey"],["bear","fish"],["cat","fish"],["cat","mouse"],["shark","fish"],["penguin","fish"],["eagle","fish"],["eagle","mouse"],["owl","mouse"],["chicken","caterpillar"],["bird","caterpillar"],["frog","bee"],["spider","bee"],["pig","carrot"],["pig","apple"],["horse","apple"],["monkey","apple"],["mouse","chestnut"],["squirrel","apple"]],"grows_into":[["egg","chick"],["egg","hatching"],["hatching","chick"],["chick","chicken"],["egg","chicken"],["seedling","tree"],["seedling","sunflower"],["seedling","tulip"],["seedling","rose"],["caterpillar","butterfly"],["water","ice"],["baby","walker"],["baby","runner"]],"uses":[["chef","pan"],["chef","spoon"],["chef","bowl"],["farmer","tractor"],["firefighter","firetruck"],["doctor","stethoscope"],["artist","palette"],["artist","paintbrush"],["scientist","microscope"],["astronaut","rocket"],["pilot","airplane"],["pilot","helicopter"],["mechanic","wrench"],["mechanic","screwdriver"],["singer","microphone"]],"works_on":[["key","lock"],["needle","thread"],["toothbrush","tooth"],["saw","log"],["axe","log"],["paintbrush","palette"],["pencil","paper"],["crayon","paper"],["scissors","paper"],["paperclip","paper"],["wrench","nutbolt"],["screwdriver","nutbolt"],["bucket","water"]],"weather_gear":[["rain","umbrella"],["rain","boot"],["sun","sunglasses"],["sun","cap"],["snowflake","gloves"],["snowflake","scarf"],["snowflake","coat"],["snowflake","boot"]],"travels_on":[["car","road"],["bus","road"],["truck","road"],["bicycle","road"],["motorcycle","road"],["scooter","road"],["train","railway"],["ship","wave"],["sailboat","wave"],["canoe","wave"],["speedboat","wave"],["airplane","cloud"],["helicopter","cloud"]],"faster_way":[["walker","runner"],["walker","cyclist"],["runner","cyclist"],["candle","bulb"],["envelope","phone"],["canoe","speedboat"],["sailboat","speedboat"],["bicycle","motorcycle"],["scooter","motorcycle"],["horse","car"],["horse","train"],["walker","car"],["bicycle","car"],["ship","airplane"]],"part_of":[["bicycle","wheel"],["car","wheel"],["truck","wheel"],["bus","wheel"],["motorcycle","wheel"],["tractor","wheel"],["house","door"],["school","door"],["bird","feather"],["eagle","feather"],["owl","feather"],["parrot","feather"],["chicken","feather"],["duck","feather"],["tree","leaf"],["tree","log"]]},"analogy_relations":["lives_in","gives_us","eats","grows_into","uses","works_on","weather_gear","travels_on","faster_way","part_of"],"classes":["fruit","vegetable","meal","sweet","drink","farm_animal","wild_animal","sea_animal","bird","bug","dinosaur","land_vehicle","air_vehicle","water_vehicle","clothing","tool","kitchen_thing","school_thing","instrument","ball","toy","weather","building","plant","flower","furniture","worker","winter_thing","food","animal","vehicle"],"siblings":{"fruit":["vegetable","meal"],"vegetable":["fruit","meal"],"meal":["sweet","fruit"],"sweet":["vegetable","meal"],"drink":["fruit","meal"],"farm_animal":["wild_animal","sea_animal"],"wild_animal":["farm_animal","sea_animal"],"sea_animal":["farm_animal","wild_animal"],"bird":["wild_animal","bug"],"bug":["bird","sea_animal"],"dinosaur":["wild_animal","bird"],"land_vehicle":["air_vehicle","water_vehicle"],"air_vehicle":["land_vehicle","water_vehicle"],"water_vehicle":["land_vehicle","air_vehicle"],"clothing":["kitchen_thing","school_thing"],"tool":["kitchen_thing","instrument"],"kitchen_thing":["tool","school_thing"],"school_thing":["kitchen_thing","tool"],"instrument":["toy","tool"],"ball":["instrument","clothing"],"toy":["clothing","kitchen_thing"],"weather":["building","fruit"],"building":["land_vehicle","furniture"],"plant":["bug","building"],"flower":["bug","building"],"furniture":["building","kitchen_thing"],"worker":["building","land_vehicle"],"winter_thing":["fruit","building"],"food":["animal","vehicle"],"animal":["vehicle","food"],"vehicle":["animal","food"]},"sentences":[["s01","Which one do we use to cut paper?","scissors",["pencil","ruler"],1],["s02","Which one helps you see in the dark?","flashlight",["sunglasses","glasses"],1],["s03","Which animal gives us milk?","cow",["pig","horse"],1],["s04","Which one do you wear on your feet?","boot",["cap","gloves"],1],["s05","Which one grows under the ground?","carrot",["apple","banana"],1],["s06","Which one is the coldest?","ice",["fire","coffee"],1],["s07","Which one can fly?","eagle",["elephant","turtle"],1],["s08","Which one lives in the ocean?","octopus",["lion","cow"],1],["s09","Which one would you need on a rainy day?","umbrella",["sunglasses","kite"],1],["s10","Which one tells you what time it is?","clock",["camera","book"],1],["s11","Which one do we use to brush our teeth?","toothbrush",["broom","paintbrush"],1],["s12","Which one helps a doctor listen to your heart?","stethoscope",["microscope","telescope"],1],["s13","Which one helps you look at the stars?","telescope",["microscope","glasses"],1],["s14","Which animal is the biggest?","whale",["ant","rabbit"],1],["s15","Which one has eight legs?","spider",["ant","bee"],1],["s16","Which one makes music when you blow into it?","trumpet",["drum","guitar"],1],["s17","Which one do you need to open a lock?","key",["magnet","scissors"],1],["s18","Which one do bees make?","honey",["milk","cheese"],1],["s19","Which one comes from a hen?","egg",["milk","cheese"],2],["s20","Which one grows on a tree?","apple",["carrot","potato"],2],["s21","Which one keeps your hands warm?","gloves",["cap","shoe"],2],["s22","Which one do we sleep in at night?","bed",["chair","bucket"],2],["s23","Which one does a plant need to grow?","water",["fire","magnet"],2],["s24","Which one do we use to sweep the floor?","broom",["basket","yarn"],2],["s25","Which one can carry many people at the same time?","bus",["bicycle","scooter"],2],["s26","Which one can travel on water?","canoe",["bus","train"],2],["s27","Which one can go to space?","rocket",["helicopter","kite"],2],["s28","Which one is a baby animal?","chick",["chicken","cow"],2],["s29","Which one will turn into a butterfly?","caterpillar",["ant","ladybug"],2],["s30","Which one do we use to measure how long something is?","ruler",["scissors","pencil"],2],["s31","Which one do we use to wash our hands?","soap",["broom","paintbrush"],2],["s32","Which one sticks to metal?","magnet",["crayon","feather"],2],["s33","Which one will melt on a sunny day?","snowman",["tree","house"],2],["s34","Which one is a vegetable?","broccoli",["apple","cookie"],2],["s35","Which one do we wear on our head?","cap",["socks","jeans"],2],["s36","Which one can you read?","book",["soccer","cup"],2],["s37","Which animal has a trunk?","elephant",["giraffe","zebra"],3],["s38","Which animal has a very long neck?","giraffe",["zebra","lion"],3],["s39","Which animal has black and white stripes?","zebra",["tiger","horse"],3],["s40","Which one do we use to talk to a friend who is far away?","phone",["camera","clock"],3],["s41","Which one helps put out fires?","firetruck",["ambulance","policecar"],3],["s42","Which one takes sick people to the hospital?","ambulance",["firetruck","bus"],3],["s43","Which one does a farmer drive in the field?","tractor",["ship","airplane"],3],["s44","Which one do we use to take a picture?","camera",["clock","book"],3],["s45","Which one makes small things look bigger?","magnifier",["sunglasses","bucket"],3],["s46","Which one can carry water without spilling?","bucket",["basket","backpack"],3],["s47","Which one is very hot?","fire",["ice","snowman"],3],["s48","Which one do you put on when it is very cold outside?","coat",["tshirt","dress"],3],["s49","Which one can we drink?","milk",["bread","cheese"],3],["s50","Which instrument has strings?","guitar",["drum","trumpet"],3],["s51","Which instrument do you hit to make music?","drum",["trumpet","saxophone"],3],["s52","Which one do we use to eat soup?","spoon",["forkknife","pan"],3],["s53","Which one do we cook eggs in?","pan",["cup","basket"],3],["s54","Which ball do you kick?","soccer",["basketball","tennisball"],3],["s55","Which one keeps baby birds safe?","nest",["web","tent"],4],["s56","Which one helps people see better?","glasses",["crown","cap"],4],["s57","Which one shines in the sky at night?","moon",["sun","rainbow"],4],["s58","Which one can you see when the sun shines after the rain?","rainbow",["snowflake","lightning"],4],["s59","Which one is made of snow?","snowman",["teddy","house"],4],["s60","Which one helps fix a car?","wrench",["spoon","crayon"],4],["s61","Which one do you use to color a picture?","crayon",["spoon","key"],4],["s62","Which one has wings but is not alive?","airplane",["bird","butterfly"],4],["s63","Which one is not alive?","car",["dog","tree"],4],["s64","Which animal comes out of an egg?","chick",["dog","cow"],4],["s65","Which one do you sit on?","chair",["bulb","door"],4],["s66","Which one do you open to walk into a room?","door",["chair","book"],4],["s67","Which one gives light when you switch it on?","bulb",["candle","sun"],4],["s68","Which one has a shell on its back?","turtle",["frog","mouse"],4],["s69","Which one hops?","frog",["snail","fish"],4],["s70","Which one moves very, very slowly?","snail",["rabbit","horse"],4],["s72","Which one can you build a fire with?","log",["ice","water"],4],["n001","Which one do we use to write a letter?","pencil",["spoon","soccer","key"],1],["n002","Which one do you put a letter in before you mail it?","envelope",["bucket","pan","cup"],1],["n003","Which one do you sing into on a stage?","microphone",["hammer","broom","spoon"],1],["n004","Which one do we use to hit a nail?","hammer",["spoon","paintbrush","socks"],1],["n005","Which one do we use to cut wood?","saw",["spoon","crayon","feather"],1],["n006","Which one do we use to chop a tree?","axe",["spoon","ruler","crayon"],1],["n007","Which one do you sew with?","needle",["hammer","spoon","soccer"],1],["n008","Which animal says moo?","cow",["cat","dog","duck"],1],["n009","Which animal says quack?","duck",["cow","pig","sheep"],1],["n010","Which animal gives us wool?","sheep",["pig","horse","chicken"],1],["n011","Which one do you wear around your neck when it is cold?","scarf",["socks","boot","cap"],1],["n012","Which one do you wear on your legs?","jeans",["cap","gloves","scarf"],1],["n013","Which one do you sleep in when you go camping?","tent",["bucket","basket","umbrella"],1],["n014","Which one do we use to paint a picture?","paintbrush",["spoon","key","hammer"],1],["n015","Which one do you fly in the wind on a long string?","kite",["teddy","puzzle","drum"],1],["n016","Which one floats up in the air when you let it go?","balloon",["teddy","book","soccer"],1],["n017","Which one is a hot drink?","coffee",["juice","icecream","cheese"],1],["n018","Which one is a fruit?","banana",["carrot","bread","cheese"],1],["n019","Which one is yellow and sour?","lemon",["banana","strawberry","apple"],1],["n020","Which one do we eat in a cone when it is hot outside?","icecream",["pizza","bread","egg"],1],["n022","Which one lives in water and has fins?","fish",["cat","cow","bird"],1],["n023","Which one rings when a friend calls you?","phone",["book","chair","cup"],1],["n025","Which one do we use to eat spaghetti?","forkknife",["cup","bucket","broom"],1],["n026","Which one do you drink from?","cup",["hammer","shoe","book"],1],["n027","Which one has two wheels and pedals?","bicycle",["car","bus","train"],1],["n028","Which one runs on tracks?","train",["car","bus","ship"],1],["n029","Which one flies with spinning blades on top?","helicopter",["ship","bus","train"],1],["n030","Which one does a pilot fly?","airplane",["bus","truck","ship"],1],["n031","Which one is a flower?","tulip",["carrot","leaf","log"],1],["n032","Which one is a pet?","cat",["lion","shark","tiger"],1],["n033","Which big cat has a mane?","lion",["tiger","bear","elephant"],1],["n034","Which one do bees visit to get food?","sunflower",["log","shoe","cup"],1],["n035","Which one gives us light and heat during the day?","sun",["moon","star","cloud"],1],["n036","Which one is wet and falls from the clouds?","rain",["sun","star","rainbow"],1],["n037","Which one helps you turn a screw?","screwdriver",["spoon","crayon","paintbrush"],1],["n039","Which one has many keys you press to make music?","piano",["drum","guitar","violin"],1],["n040","Which one do you play with a bow?","violin",["drum","piano","trumpet"],1],["n041","Which one helps you see tiny germs?","microscope",["telescope","camera","glasses"],1],["n042","Which one is soft and big enough for the whole family to sit on?","couch",["bucket","door","bulb"],1],["n043","Which one do we use to make a sandwich?","bread",["apple","milk","ice"],1],["n044","Which ball do you hit with a bat?","baseball",["soccer","basketball","football"],1],["n045","Which ball do you throw through a hoop?","basketball",["soccer","baseball","tennisball"],1],["n046","Which one is a bug?","beetle",["bird","fish","frog"],2],["n047","Which one is a bird?","owl",["bee","butterfly","ladybug"],2],["n048","Which one is a tool?","wrench",["teddy","cake","socks"],2],["n049","Which one is a building?","school",["tree","mountain","cloud"],2],["n050","Which one is a musical instrument?","saxophone",["hammer","broom","phone"],2],["n051","Which one is a drink?","juice",["bread","cake","cookie"],2],["n052","Which one is a sweet treat?","candy",["onion","potato","broccoli"],2],["n053","Which one is a sea animal?","shark",["lion","bear","monkey"],2],["n054","Which one is a farm animal?","goat",["lion","shark","zebra"],2],["n055","Which one is a vegetable?","onion",["cherries","grapes","pear"],2],["n056","Which one is something you wear?","dress",["chair","cup","car"],2],["n057","Which one is a dinosaur?","trex",["lion","bear","elephant"],2],["n058","Which one helps sick people get better?","doctor",["chef","pilot","singer"],2],["n059","Which one cooks food in a restaurant?","chef",["doctor","pilot","firefighter"],2],["n060","Which one is a person who puts out fires?","firefighter",["chef","singer","artist"],2],["n061","Which one is a person who flies an airplane?","pilot",["chef","farmer","doctor"],2],["n062","Which one grows food on a farm?","farmer",["pilot","singer","astronaut"],2],["n063","Which one is a person who goes to space?","astronaut",["chef","farmer","mechanic"],2],["n064","Which one is a person who fixes cars?","mechanic",["singer","chef","artist"],2],["n065","Which one is a person who paints pictures?","artist",["pilot","doctor","mechanic"],2],["n066","Which one is a person who does experiments to learn new things?","scientist",["singer","farmer","chef"],2],["n067","Which one is round like a ball?","orange",["banana","carrot","cucumber"],2],["n068","Which one has black and orange stripes?","tiger",["zebra","lion","bear"],2],["n069","Which one has a hump on its back?","camel",["horse","cow","goat"],2],["n070","Which one climbs trees and has a bushy tail?","squirrel",["fish","pig","cow"],2],["n071","Which bird lives where it is very cold and cannot fly?","penguin",["parrot","eagle","owl"],2],["n072","Which one shows a baby bird coming out of its egg?","hatching",["chicken","duck","owl"],2],["n073","Which one can you eat for lunch?","sandwich",["soap","crayon","shoe"],2],["n074","Which one can you find on a beach?","shell",["snowman","fire","bed"],2],["n075","Which one is a tiny plant that just came out of a seed?","seedling",["car","cup","shoe"],2],["n076","Which one is a tree that stays green in winter?","pine",["tulip","sunflower","rose"],2],["n077","Which flower has thorns?","rose",["tulip","sunflower","leaf"],2],["n078","Which one has sharp spines and lives in the desert?","cactus",["tulip","sunflower","tree"],2],["n079","Which one flashes in the sky during a storm?","lightning",["rainbow","sun","moon"],2],["n080","Which one is white and fluffy and floats in the sky?","cloud",["sun","moon","star"],2],["n081","Which one is cold and white and falls in winter?","snowflake",["sun","fire","leaf"],2],["n082","Which mountain can have hot lava inside?","volcano",["tree","house","castle"],2],["n083","Which one is very tall and has snow on top?","mountain",["house","tent","car"],2],["n084","Which place is very dry and sandy?","desert",["wave","rain","snowman"],2],["n085","Which one do trains ride on?","railway",["road","wave","cloud"],2],["n086","Which one do cars drive on?","road",["railway","wave","cloud"],2],["n087","Which one is in the ocean and can knock you over at the beach?","wave",["road","desert","mountain"],2],["n088","Which one does a spider make?","web",["nest","honey","tent"],2],["n089","Which one do birds build?","nest",["web","tent","honey"],2],["n090","Which one holds sheets of paper together?","paperclip",["scissors","ruler","crayon"],2],["n091","Which fruit is red and small?","cherries",["lemon","banana","watermelon"],3],["n092","Which one is green outside and red inside?","watermelon",["apple","cherries","lemon"],3],["n093","Which vegetable is purple?","eggplant",["grapes","carrot","corn"],3],["n094","Which flower is big and yellow and turns to face the sun?","sunflower",["rose","tulip","cactus"],3],["n095","Which one can fly but is not a bird?","bee",["owl","eagle","parrot"],3],["n096","Which one is a bird but cannot fly?","penguin",["eagle","owl","duck"],3],["n097","Which one lives in the sea but is not a fish?","dolphin",["fish","shark"],3],["n098","Which one has wheels but no engine?","bicycle",["car","bus","motorcycle"],3],["n099","Which one is cold but is not made of snow?","ice",["snowman","snowflake"],3],["n100","Which one gives light but is not hot like fire?","flashlight",["fire","candle","sun"],3],["n101","Which food is round and cut into slices?","pizza",["hotdog","taco","sandwich"],3],["n102","Which food is long and goes inside a bun?","hotdog",["pizza","taco","cookie"],3],["n103","Which food is folded and filled with meat and beans?","taco",["pizza","cookie","cake"],3],["n104","Which one has a hole in the middle?","doughnut",["cookie","cake","pizza"],3],["n105","Which one do we put candles on at a birthday party?","cake",["pizza","bread","sandwich"],3],["n106","Which animal sleeps in the day and hunts at night?","owl",["chicken","duck","cow"],3],["n107","Which one has a long tail and swings from trees?","monkey",["elephant","bear","cow"],3],["n108","Which one has stripes and can fly?","bee",["zebra","tiger","eagle"],3],["n109","Which one is red with black spots?","ladybug",["bee","ant","frog"],3],["n110","Which one has a long body and no legs?","snake",["frog","turtle","spider"],3],["n111","Which one walks sideways on the beach?","crab",["fish","octopus","shark"],3],["n112","Which one is not a pet?","lion",["cat","dog","hamster"],3],["n113","Which one is not food?","shoe",["bread","apple","cheese"],3],["n114","Which one is not a vehicle?","house",["bus","car","train"],3],["n115","Which one is not a fruit?","carrot",["apple","pear","grapes"],3],["n116","Which one is not an animal?","tree",["cat","dog","fish"],3],["n117","Which animal is the smallest?","ant",["elephant","horse","cow"],3],["n118","Which animal is the tallest?","giraffe",["dog","cat","pig"],3],["n119","Which one is the fastest?","rocket",["bicycle","walker","turtle"],3],["n120","Which animal is the slowest?","turtle",["rabbit","horse","dog"],3],["n121","Which one is the lightest?","feather",["log","piano","car"],3],["n122","Which animal is the heaviest?","elephant",["mouse","cat","rabbit"],3],["n123","Which one do we use to knit a warm scarf?","yarn",["paper","soap","magnet"],3],["n124","Which food is made from milk?","cheese",["bread","apple","honey"],3],["n125","Which one comes from a tree?","log",["ice","magnet","shell"],3],["n126","Which person is running?","runner",["walker","swimmer","cyclist"],3],["n127","Which person is in the water?","swimmer",["runner","walker","cyclist"],3],["n128","Which person is riding a bike?","cyclist",["runner","walker","swimmer"],3],["n129","Which person is walking?","walker",["runner","swimmer","cyclist"],3],["n130","Which building is where sick people get help?","hospital",["school","castle","office"],3],["n131","Which building is where a king and queen live?","castle",["hospital","school","office"],3],["n132","Which one does a king wear on his head?","crown",["socks","gloves","boot"],3],["n133","Which building has many desks where grown-ups work?","office",["castle","tent","nest"],3],["n134","Which one helps you float down slowly from the sky?","parachute",["kite","rocket","ship"],3],["n135","Which one would a dog like to chew?","bone",["cup","phone","crown"],4],["n136","Which one would a rabbit like to eat?","carrot",["fish","bone","hamburger"],4],["n137","Which one would a monkey like to eat?","banana",["bone","hamburger","coffee"],4],["n138","Which one would a cat like to eat?","fish",["carrot","banana","bread"],4],["n139","Which one would keep you the warmest in the snow?","coat",["tshirt","dress","sunglasses"],4],["n140","Which one needs gas to go?","car",["bicycle","canoe","sailboat"],4],["n141","Which one uses the wind to move on the water?","sailboat",["speedboat","canoe","train"],4],["n142","Which one is the fastest on the water?","speedboat",["canoe","sailboat","duck"],4],["n143","Which one would you paddle on a lake?","canoe",["bus","train","bicycle"],4],["n144","Which one comes from a bird?","feather",["web","honey","shell"],4],["n145","Which one would melt fastest in your hand?","icecream",["cookie","apple","bread"],4],["n146","Which one would you find on a farm?","tractor",["rocket","ship","airplane"],4],["n147","Which one would you see in the sky at night?","star",["sun","rainbow","tractor"],4],["n148","Which one do you need to bake a cake?","egg",["shoe","crayon","soap"],4],["n149","Which one is round and helps a car roll?","wheel",["door","bulb","chair"],4],["n150","Which one holds two metal pieces tight together?","nutbolt",["paper","feather","soap"],4],["n151","Which toy has pieces that you fit together?","puzzle",["soccer","kite","drum"],4],["n152","Which toy do you hug at bedtime?","teddy",["soccer","kite","puzzle"],4],["n153","Which one gives you juice when you squeeze it?","orange",["bread","cheese","cookie"],4],["n154","Which fruit has tiny seeds on the outside?","strawberry",["banana","orange","grapes"],4],["n155","Which fruit grows in a bunch?","grapes",["apple","pear","watermelon"],4],["n156","Which fruit has a spiky top and is sweet inside?","pineapple",["lemon","pear","onion"],4],["n157","Which one can make your eyes water when you cut it?","onion",["bread","cheese","apple"],4],["n158","Which one is a nut that falls from a tree?","chestnut",["cheese","egg","candy"],4],["n159","Which plant do we use to make food taste better?","herb",["rose","cactus","log"],4],["n160","Which tree has needles and cones?","pine",["palm","tulip","sunflower"],4],["n161","Which tree grows coconuts?","palm",["pine","cactus","rose"],4],["n162","Which sea animal has big sharp teeth?","shark",["jellyfish","shrimp","shell"],4],["n163","Which sea animal can sting you?","jellyfish",["whale","dolphin","fish"],4],["n164","Which sea animal is tiny and pink?","shrimp",["whale","shark","dolphin"],4],["n165","Which one has two wheels and an engine?","motorcycle",["bicycle","car","bus"],4],["n166","Which one carries big loads on the road?","truck",["bicycle","scooter","canoe"],4],["n167","Which car helps catch robbers?","policecar",["bus","tractor","truck"],4],["n168","Which one is a big boat that carries many people across the ocean?","ship",["canoe","kite","bicycle"],4],["n169","Which one goes tick tock?","clock",["drum","book","cup"],4],["n170","Which one do we put soup in?","bowl",["forkknife","key","ruler"],4]]};

  /* Helpers shared by the picture / sentence generators */
  var B = BP.BANK, mem = null;
  var GROUP = { fruit: "fruits", vegetable: "vegetables", meal: "meals", sweet: "sweet treats", drink: "drinks", farm_animal: "farm animals",
    wild_animal: "wild animals", sea_animal: "sea animals", bird: "birds", bug: "bugs", dinosaur: "dinosaurs", land_vehicle: "vehicles that go on land",
    air_vehicle: "things that fly in the sky", water_vehicle: "boats that go on water", clothing: "clothes", tool: "tools", kitchen_thing: "things for the kitchen",
    school_thing: "things for school", instrument: "musical instruments", ball: "balls", toy: "toys", weather: "weather", building: "buildings", plant: "plants",
    flower: "flowers", furniture: "furniture", worker: "jobs (people who work)", winter_thing: "things for cold winter weather", food: "food", animal: "animals", vehicle: "vehicles" };
  var PB = BP.PB = {
    ids: function () { return Object.keys(B.pics); },
    name: function (id) { return B.pics[id][0]; },
    tags: function (id) { return B.pics[id][1]; },
    group: function (c) { return GROUP[c] || c; },
    members: function (c) {
      if (!mem) { mem = {}; B.classes.forEach(function (k) { mem[k] = []; }); Object.keys(B.pics).forEach(function (id) { B.pics[id][1].forEach(function (t) { if (mem[t]) mem[t].push(id); }); }); }
      return mem[c] || [];
    },
    inClass: function (id, c) { return B.pics[id][1].indexOf(c) >= 0; },
    related: function (r, x, y) { return B.relations[r].some(function (p) { return p[0] === x && p[1] === y; }); },
    relsBetween: function (x, y) { return Object.keys(B.relations).filter(function (r) { return PB.related(r, x, y); }); },
    farDomains: function (c) { return ["food", "animal", "vehicle"].filter(function (b) { return !PB.members(c).some(function (m) { return PB.inClass(m, b); }); }); },
    /* picture on a soft card at x,y, size s (mark: outline colour) */
    card: function (id, x, y, s, mark) { return BP.box(x, y, s, BP.pic(id, x + s * 0.12, y + s * 0.12, s * 0.76), { mark: mark }); }
  };
})(window.BP);

/* ---- t-figure-classification.js */
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

/* ---- t-figure-matrices.js */
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

/* ---- t-number-analogies.js */
/* Number Analogies (CogAT quantitative style): 2×2 number boxes drawn with groups of simple objects.
   A box holds a group (or two groups) of objects. A changes into B by a number rule; apply the same rule to C.
   Rules: +/-k, double, triple, half, share into 2 equal groups. Options are pictures of object groups. */
(function (BP) {
  "use strict";
  var OBJ = [
    { s: "circle", c: "red", n: "red balls" }, { s: "star", c: "yellow", n: "stars" }, { s: "circle", c: "blue", n: "blue beads" },
    { s: "heart", c: "pink", n: "hearts" }, { s: "diamond", c: "purple", n: "gems" }, { s: "hexagon", c: "orange", n: "orange tiles" },
    { s: "triangle", c: "green", n: "green triangles" }, { s: "square", c: "red", n: "red blocks" }];
  var RULES = ["same", "x2", "x3", "half", "third", "split"];
  var k;
  for (k = 1; k <= 9; k++) { RULES.push("+" + k); RULES.push("-" + k); }

  function key(g) { return JSON.stringify(g); }
  function apply(rule, g) {
    if (g.length !== 1) return null;
    var n = g[0], v;
    if (rule === "same") return [n];
    if (rule === "x2") return [n * 2];
    if (rule === "x3") return [n * 3];
    if (rule === "half") return n % 2 === 0 ? [n / 2] : null;
    if (rule === "third") return n % 3 === 0 ? [n / 3] : null;
    if (rule === "split") return n % 2 === 0 ? [n / 2, n / 2] : null;
    v = rule.charAt(0) === "+" ? n + Number(rule.slice(1)) : n - Number(rule.slice(1));
    return v >= 1 ? [v] : null;
  }
  // every prediction for C made by a rule that turns A into B
  function preds(a, b, c) {
    var out = {};
    RULES.forEach(function (r) {
      var x = apply(r, a);
      if (x && key(x) === key(b)) { var p = apply(r, c); if (p) out[key(p)] = p; }
    });
    return out;
  }
  function solve(q) {
    var d = q.data, P = preds(d.a, d.b, d.c), hit = [];
    d.opts.forEach(function (o, i) { if (P[key(o)]) hit.push(i); });
    if (hit.length !== 1) throw new Error("options matching rules: " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function pileOne(n, M, x, y, w, h, o) {
    var bs = 0, bc = 1, c, r, cs, rows, i, out = "";
    for (c = 1; c <= M; c++) { r = Math.ceil(M / c); cs = Math.min(w / c, h / r); if (cs > bs + 0.01) { bs = cs; bc = c; } }
    bs = Math.min(bs, w * 0.5);
    rows = Math.ceil(n / bc);
    var y0 = y + (h - rows * bs) / 2;
    for (i = 0; i < n; i++) {
      var row = Math.floor(i / bc), inRow = Math.min(bc, n - row * bc), x0 = x + (w - inRow * bs) / 2;
      out += BP.shape(o.s, x0 + (i % bc + 0.5) * bs, y0 + (row + 0.5) * bs, bs * 0.42, o.c);
    }
    return out;
  }
  function groupsSvg(g, x, y, w, o, M) {
    var pad = 8, inner;
    if (g.length === 1) inner = pileOne(g[0], M, x + pad, y + pad, w - 2 * pad, w - 2 * pad, o);
    else {
      var hw = (w - 2 * pad) / 2;
      inner = pileOne(g[0], M, x + pad, y + pad, hw, w - 2 * pad, o) + pileOne(g[1], M, x + pad + hw, y + pad, hw, w - 2 * pad, o) +
        '<line x1="' + (x + w / 2) + '" y1="' + (y + 12) + '" x2="' + (x + w / 2) + '" y2="' + (y + w - 12) + '" stroke="#b7c3dc" stroke-width="2.5" stroke-dasharray="5 5"/>';
    }
    return inner;
  }
  function boxSvg(g, x, y, w, o, M, bo) { return BP.box(x, y, w, groupsSvg(g, x, y, w, o, M), bo); }
  function arrow(x, y) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 36) + '" y2="' + y + '" stroke="#7b8bb0" stroke-width="5" stroke-linecap="round"/>' +
      '<polygon points="' + (x + 46) + "," + y + " " + (x + 32) + "," + (y - 10) + " " + (x + 32) + "," + (y + 10) + '" fill="#7b8bb0"/>';
  }
  function figure(a, b, c, d, o1, o2, M, label) {
    var W = 392, H = 358, bw = 150, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>';
    s += boxSvg(a, 14, 14, bw, o1, M) + boxSvg(b, 14 + bw + 64, 14, bw, o1, M);
    s += boxSvg(c, 14, 14 + bw + 30, bw, o2, M);
    s += d ? boxSvg(d, 14 + bw + 64, 14 + bw + 30, bw, o2, M, { mark: "#1fa866" }) : BP.box(14 + bw + 64, 14 + bw + 30, bw, "", { ask: true });
    s += arrow(14 + bw + 9, 14 + bw / 2) + arrow(14 + bw + 9, 14 + bw + 30 + bw / 2);
    return BP.svg(W, H, s, label);
  }

  // ---------------------------------------------------------------- words
  function say(g, o) { return g.length === 1 ? g[0] + " " + o.n : "two groups: " + g[0] + " and " + g[1] + " " + o.n; }
  function words(rule) {
    var n = rule.slice(1);
    if (rule.charAt(0) === "+") return "add " + n + " (" + n + " more)";
    if (rule.charAt(0) === "-") return "take away " + n + " (" + n + " fewer)";
    return { x2: "double it (2 times as many)", x3: "make 3 times as many", half: "take half (share into 2 equal groups, keep one group)", split: "share into 2 equal groups" }[rule];
  }
  function calc(rule, from, to) {
    var f = from[0], n = rule.slice(1);
    if (rule.charAt(0) === "+") return f + " + " + n + " = " + to[0];
    if (rule.charAt(0) === "-") return f + " − " + n + " = " + to[0];
    if (rule === "x2") return f + " + " + f + " = " + to[0];
    if (rule === "x3") return f + " × 3 = " + to[0];
    if (rule === "half") return "half of " + f + " is " + to[0];
    return f + " shared into 2 equal groups is " + to[0] + " and " + to[1];
  }

  // ---------------------------------------------------------------- generator
  function gen(rnd, lv) {
    var pool = lv === 1 ? ["+1", "-1"] : lv === 2 ? ["+2", "-2", "+3", "-3"] : ["x2", "half", "x2", "half", "split", "x3", "+4", "-4"];
    var rule = rnd.pick(pool), hi = lv === 1 ? 6 : lv === 2 ? 8 : 10;
    var a = [rnd.int(1, hi)], c = [rnd.int(1, hi)];
    if (a[0] === c[0]) return null;
    var b = apply(rule, a), d = apply(rule, c);
    if (!b || !d || Math.max(b[0], d[0], b[1] || 0) > 10) return null;
    var i1 = rnd.int(0, OBJ.length - 1), i2 = rnd.int(0, OBJ.length - 1);
    if (OBJ[i1].s === OBJ[i2].s && OBJ[i1].c === OBJ[i2].c || i1 === i2) return null;
    var o1 = OBJ[i1], o2 = OBJ[i2], dv = d.length === 1 ? d[0] : null, dis;
    if (dv !== null) dis = [b, c, [dv + 1], [dv - 1], [dv + 2], [dv - 2]];
    else { var h = d[0]; dis = [c, [h, h + 1], [h + 1, h + 1], [h - 1, h - 1], [h - 1, h + 1], b]; }
    var P = preds(a, b, c);
    dis = rnd.shuffle(dis.filter(function (g) {
      return g.every(function (v) { return v >= 1 && v <= 10; }) && !P[key(g)] && key(g) !== key(d);
    }));
    var o = BP.options(rnd, d, dis, key, 4);
    if (!o) return null;
    var M = 1;
    [a, b, c].concat(o.list).forEach(function (g) { g.forEach(function (v) { M = Math.max(M, v); }); });
    var label = "Number boxes. Top row: " + say(a, o1) + " then " + say(b, o1) + ". Bottom row: " + say(c, o2) + " then a question mark";
    var fig = figure(a, b, c, null, o1, o2, M, label);
    var opts = o.list.map(function (g) { return BP.tile(groupsSvg(g, 4, 4, 100, o2, M), 100); });
    var split = dv === null;
    var steps = [
      "Look at the <b>top row</b>. The first box has <b>" + say(a, o1) + "</b>. The second box has <b>" + say(b, o1) + "</b>.",
      "What happened? " + BP.cap(words(rule)) + ": " + calc(rule, a, b) + ".",
      "Do the <b>same thing</b> in the bottom row. Start with " + say(c, o2) + ": " + words(rule) + ": " + calc(rule, c, d) + ".",
      split ? "Careful: the picture must show <b>two equal groups</b>. A single group, or two unequal groups, does not match the rule."
        : "Careful: " + b[0] + " only copies the top box, and " + c[0] + " changes nothing. The bottom row needs <b>" + dv + "</b>.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    var solutionFig = figure(a, b, c, d, o1, o2, M, "Solved: the empty box shows " + say(d, o2));
    return { prompt: split ? "The top two boxes go together. Which picture goes in the empty box?" : "The top two boxes go together. How many belong in the empty box?",
      speak: "Look at the top two boxes. They go together in a special way. Which picture belongs in the empty box, so the bottom two boxes go together in the same way?",
      fig: fig, kind: "svg", opts: opts, answer: o.answer, steps: steps, solutionFig: solutionFig,
      data: { a: a, b: b, c: c, opts: o.list } };
  }

  BP.reg("number-analogies", { name: "Number Analogies", group: "quant", gen: gen, solve: solve });
})(window.BP);

/* ---- t-number-patterns.js */
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

/* ---- t-number-puzzles.js */
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

/* ---- t-number-series.js */
/* Number Series (CogAT quantitative style): bead abacus rods side by side. The number of beads follows a pattern;
   pick the next rod. A rod = [red beads, blue beads]. Beads fill ten-frame style: 5 per wire, left wire first. */
(function (BP) {
  "use strict";
  var SHOWN = 5, MAXSUM = 12, RED = "#ef4d56", BLUE = "#3d7ff2";

  // ---------------------------------------------------------------- independent solver
  function predict(v) {
    var out = [], n = v.length, d = [], i;
    for (i = 0; i < n - 1; i++) d.push(v[i + 1] - v[i]);
    function all(f, from, to) { for (var k = from; k < to; k++) if (!f(k)) return false; return true; }
    if (all(function (k) { return d[k] === d[0]; }, 0, d.length)) out.push(v[n - 1] + d[0]);                       // constant step
    if (all(function (k) { return v[k] === v[k - 2]; }, 2, n)) out.push(v[n - 2]);                                // 2-step repeat
    if (n >= 4 && all(function (k) { return v[k] === v[k - 3]; }, 3, n)) out.push(v[n - 3]);                      // 3-step repeat
    if (d.length >= 3 && all(function (k) { return d[k] - d[k - 1] === 1; }, 1, d.length)) out.push(v[n - 1] + d[d.length - 1] + 1); // steps grow by 1
    return out;
  }
  function solve(q) {
    var d = q.data, reds = d.rods.map(function (r) { return r[0]; }), blues = d.rods.map(function (r) { return r[1]; });
    var pr = predict(reds), pb = predict(blues), hit = [];
    d.opts.forEach(function (o, i) { if (pr.indexOf(o[0]) >= 0 && pb.indexOf(o[1]) >= 0) hit.push(i); });
    if (hit.length !== 1) throw new Error("rods fitting: " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function rod(x, y, w, h, beads, nw) {
    var base = y + h * 0.9, top = y + h * 0.05, colw = Math.min(w * 0.84 / nw, w * 0.42), cx = x + w / 2, s = "", i;
    var wires = [];
    for (i = 0; i < nw; i++) wires.push(cx + (i - (nw - 1) / 2) * colw);
    wires.forEach(function (wx) { s += '<line x1="' + BP.f1(wx) + '" y1="' + BP.f1(top) + '" x2="' + BP.f1(wx) + '" y2="' + BP.f1(base) + '" stroke="#8a6a46" stroke-width="' + BP.f1(Math.max(2.5, w * 0.03)) + '" stroke-linecap="round"/>'; });
    var pw = colw * (nw + 0.3);
    s += '<rect x="' + BP.f1(cx - pw / 2) + '" y="' + BP.f1(base) + '" width="' + BP.f1(pw) + '" height="' + BP.f1(h * 0.06) + '" rx="3" fill="#8a6a46"/>';
    var rowh = (base - top) / 5, rad = Math.min(colw * 0.47, rowh * 0.47), k;
    for (k = 0; k < beads[0] + beads[1]; k++) {
      var bx = wires[Math.floor(k / 5)], by = base - rowh * (k % 5 + 0.5);
      s += '<circle cx="' + BP.f1(bx) + '" cy="' + BP.f1(by) + '" r="' + BP.f1(rad) + '" fill="' + (k < beads[0] ? RED : BLUE) + '" stroke="' + BP.INK + '" stroke-width="1.6"/>' +
        '<circle cx="' + BP.f1(bx - rad * 0.33) + '" cy="' + BP.f1(by - rad * 0.33) + '" r="' + BP.f1(rad * 0.25) + '" fill="#fff" opacity="0.5"/>';
    }
    return s;
  }
  function nwFor(rods, opts) {
    var m = 1; rods.concat(opts).forEach(function (r) { m = Math.max(m, r[0] + r[1]); });
    return Math.min(3, Math.ceil(m / 5));
  }
  function figure(rods, ans, nw, label) {
    var bw = 78, gap = 10, h = 140, W = (SHOWN + 1) * bw + (SHOWN + 2) * gap, H = h + 2 * gap, s = '<rect width="' + W + '" height="' + H + '" rx="18" fill="' + BP.BG + '"/>', i;
    for (i = 0; i < SHOWN; i++) s += BP.box(gap + i * (bw + gap), gap, bw, rod(gap + i * (bw + gap), gap + 4, bw, h - 8, rods[i], nw), { h: h });
    var x = gap + SHOWN * (bw + gap);
    s += ans ? BP.box(x, gap, bw, rod(x, gap + 4, bw, h - 8, ans, nw), { h: h, mark: "#1fa866" }) : BP.box(x, gap, bw, "", { h: h, ask: true });
    return BP.svg(W, H, s, label);
  }

  // ---------------------------------------------------------------- generator
  function seq(rnd, kind) {
    var out = [], i, s, st, a, b, v;
    switch (kind) {
      case "up1": case "down1": case "up2": case "down2":
        st = { up1: 1, down1: -1, up2: 2, down2: -2 }[kind];
        var span = Math.abs(st) * SHOWN;
        s = st > 0 ? rnd.int(1, MAXSUM - span) : rnd.int(1 + span, MAXSUM);
        for (i = 0; i <= SHOWN; i++) out.push(s + st * i);
        return out;
      case "rep2":
        a = rnd.int(1, 8); b = rnd.int(1, 8); if (a === b) return [];
        for (i = 0; i <= SHOWN; i++) out.push(i % 2 ? b : a);
        return out;
      case "rep3":
        v = [rnd.int(1, 7), rnd.int(1, 7), rnd.int(1, 7)];
        if (v[0] === v[1] || v[1] === v[2] || v[0] === v[2]) return [];
        for (i = 0; i <= SHOWN; i++) out.push(v[i % 3]);
        return out;
      case "grow":
        var x = rnd.int(0, 1);
        for (i = 0; i <= SHOWN; i++) { out.push(x); x += i + 1; }
        return out;
      case "flat":
        v = rnd.int(1, 5);
        for (i = 0; i <= SHOWN; i++) out.push(v);
        return out;
    }
  }
  var WORD = { up1: "1 more each time", down1: "1 fewer each time", up2: "2 more each time", down2: "2 fewer each time",
    rep2: "two numbers that take turns", rep3: "three numbers that repeat", grow: "more each time: the jump grows (+1, +2, +3 ...)", flat: "always the same" };

  function gen(rnd, lv) {
    var rk, bk = "";
    if (lv === 1) rk = rnd.pick(["up1", "down1", "rep2"]);
    else if (lv === 2) { if (rnd.chance(0.4)) { rk = rnd.pick(["up1", "down1"]); bk = "flat"; } else rk = rnd.pick(["up2", "down2", "rep2"]); }
    else if (rnd.chance(0.4)) rk = "rep3";
    else { rk = rnd.pick(["up1", "up2", "down1", "down2"]); bk = rnd.pick(["down1", "up1", "flat", "rep2"]); if (bk === "flat" && /1$/.test(rk)) return null; }
    var red = seq(rnd, rk), blue = bk ? seq(rnd, bk) : null, two = !!bk;
    if (!red.length || (two && !blue.length)) return null;
    var rods = [], i;
    for (i = 0; i <= SHOWN; i++) {
      var r = red[i], b = two ? blue[i] : 0;
      if (r < 0 || b < 0 || r + b < 1 || r + b > MAXSUM) return null;
      rods.push([r, b]);
    }
    var ans = rods[SHOWN], shown = rods.slice(0, SHOWN), last = shown[SHOWN - 1];
    var dis = two ? [[ans[0], ans[1] + 1], [ans[1], ans[0]], last, [ans[0] + 1, ans[1]], [ans[0], ans[1] - 1], [ans[0] - 1, ans[1]], [ans[0] + 1, ans[1] + 1]]
      : [last, [ans[0] + 1, 0], [ans[0] - 1, 0], [ans[0] + 2, 0], shown[0], [ans[0] - 2, 0]];
    dis = rnd.shuffle(dis.filter(function (r) { return r[0] >= 0 && r[1] >= 0 && r[0] + r[1] >= 1 && r[0] + r[1] <= MAXSUM; }));
    var o = BP.options(rnd, ans, dis, null, lv === 3 ? 5 : 4);
    if (!o) return null;
    var nw = nwFor(shown, o.list);
    var rt = shown.map(function (r) { return r[0]; }).join(", "), bt = shown.map(function (r) { return r[1]; }).join(", ");
    var label = "Bead rods in a row. Red beads: " + rt + (two ? ". Blue beads: " + bt : "") + ". Then a question mark";
    var opts = o.list.map(function (r) { return BP.tile(rod(14, 12, 80, 88, r, nw), 100); });
    var steps = [
      "Count the beads on each rod, one rod at a time. " + (two ? "Red beads: <b>" + rt + "</b>. Blue beads: <b>" + bt + "</b>." : "You get: <b>" + rt + "</b>."),
      two ? "Look at each color alone. Red: " + WORD[rk] + ". Blue: " + WORD[bk] + "." : "Find the pattern: " + WORD[rk] + ".",
      "So the next rod has <b>" + ans[0] + " red</b>" + (two ? " and <b>" + ans[1] + " blue</b>" : "") + " beads.",
      "Careful: repeating the last rod (" + last[0] + (two ? " red, " + last[1] + " blue" : "") + ") or being one bead off does not follow the pattern. Count the beads in each choice.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    return { prompt: "Which rod comes next?", speak: "Count the beads on each rod. The beads follow a pattern. Which rod comes next?",
      fig: figure(shown, null, nw, label), kind: "svg", opts: opts, answer: o.answer, steps: steps,
      solutionFig: figure(shown, ans, nw, "Solved: the next rod has " + ans[0] + " red" + (two ? " and " + ans[1] + " blue" : "") + " beads"),
      data: { rods: shown, opts: o.list } };
  }

  BP.reg("number-series", { name: "Number Series", group: "quant", gen: gen, solve: solve });
})(window.BP);

/* ---- t-odd-one-out.js */
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

/* ---- t-paper-folding.js */
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

/* ---- t-pattern-completion.js */
/* Pattern Completion (NNAT style): a big coloured pattern with a missing square piece. Which piece fits?
   The pattern follows one rule: mirror left-right (lr), mirror up-down (ud), turn-over symmetry (rot) or a small tile repeating (tile2/tile3). */
(function (BP) {
  "use strict";
  var FILL = { blue: BP.COLOR.blue, yellow: BP.COLOR.yellow, green: BP.COLOR.green, black: BP.COLOR.black, white: "#ffffff" };
  var RULES = ["lr", "ud", "rot", "tile2", "tile3"];
  var RULE_TXT = { lr: "The left side is a mirror picture of the right side.", ud: "The top half is a mirror picture of the bottom half.",
    rot: "If you turn the whole pattern upside down, it looks the same.", tile2: "A small 2 by 2 block repeats again and again.", tile3: "A small 3 by 3 block repeats again and again." };

  // ---------------------------------------------------------------- independent solver
  function partners(rule, n, r, c) {
    var out = [], i, j;
    if (rule === "lr") out.push([r, n - 1 - c]);
    else if (rule === "ud") out.push([n - 1 - r, c]);
    else if (rule === "rot") out.push([n - 1 - r, n - 1 - c]);
    else { var t = rule === "tile2" ? 2 : 3; for (i = r % t; i < n; i += t) for (j = c % t; j < n; j += t) out.push([i, j]); }
    return out;
  }
  function solve(q) {
    var d = q.data, n = d.n, k = d.k, g = d.grid, h = d.hole, preds = [];
    function inHole(r, c) { return r >= h[0] && r < h[0] + k && c >= h[1] && c < h[1] + k; }
    RULES.forEach(function (rule) {
      var ok = true, piece = [];
      for (var r = 0; r < n && ok; r++) for (var c = 0; c < n && ok; c++) {
        if (inHole(r, c)) continue;
        partners(rule, n, r, c).forEach(function (p) { if (!inHole(p[0], p[1]) && g[p[0]][p[1]] !== g[r][c]) ok = false; });
      }
      if (!ok) return;
      for (var i = 0; i < k && ok; i++) { piece.push([]); for (var j = 0; j < k && ok; j++) {
        var seen = {}, cnt = 0;
        partners(rule, n, h[0] + i, h[1] + j).forEach(function (p) { if (!inHole(p[0], p[1])) { seen[g[p[0]][p[1]]] = 1; cnt++; } });
        if (cnt === 0) ok = false; else piece[i].push(Object.keys(seen)[0]);
      } }
      if (ok) preds.push(piece);
    });
    if (!preds.length) throw new Error("no usable rule");
    var hit = [];
    d.opts.forEach(function (o, i) { if (preds.some(function (p) { return JSON.stringify(p) === JSON.stringify(o); })) hit.push(i); });
    if (hit.length !== 1) throw new Error("fits " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- drawing
  function cells(g, x0, y0, cs, hole, k) {
    var s = "";
    for (var r = 0; r < g.length; r++) for (var c = 0; c < g[r].length; c++) {
      if (hole && r >= hole[0] && r < hole[0] + k && c >= hole[1] && c < hole[1] + k) continue;
      s += '<rect x="' + BP.f1(x0 + c * cs) + '" y="' + BP.f1(y0 + r * cs) + '" width="' + BP.f1(cs) + '" height="' + BP.f1(cs) + '" fill="' + FILL[g[r][c]] + '" stroke="#8a93ad" stroke-width="1.2"/>';
    }
    return s;
  }
  function piece(p, x0, y0, S) { return cells(p, x0, y0, S / p.length) + '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + BP.INK + '" stroke-width="2.4"/>'; }
  function big(g, n, hole, k, fillIn) {
    var S = 264, cs = S / n, x0 = 14, y0 = 14, s = '<rect width="292" height="292" rx="18" fill="' + BP.BG + '"/>' + cells(g, x0, y0, cs, hole, k);
    if (fillIn) s += cells(fillIn, x0 + hole[1] * cs, y0 + hole[0] * cs, cs);
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + BP.INK + '" stroke-width="3"/>';
    var hx = x0 + hole[1] * cs, hy = y0 + hole[0] * cs, hs = k * cs;
    if (!fillIn) s += '<rect x="' + hx + '" y="' + hy + '" width="' + hs + '" height="' + hs + '" fill="' + BP.ASK + '" stroke="#e2a000" stroke-width="3" stroke-dasharray="7 5"/>' + BP.text(hx + hs / 2, hy + hs / 2 + hs * 0.18, "?", { size: hs * 0.55, color: "#e2a000", weight: 900 });
    else s += '<rect x="' + hx + '" y="' + hy + '" width="' + hs + '" height="' + hs + '" fill="none" stroke="#1fa866" stroke-width="4"/>';
    return s;
  }
  function flipH(p) { return p.map(function (r) { return r.slice().reverse(); }); }
  function flipV(p) { return p.slice().reverse().map(function (r) { return r.slice(); }); }
  function rot90(p) { var k = p.length; return p.map(function (_, r) { return p.map(function (_2, c) { return p[k - 1 - c][r]; }); }); }
  function key(p) { return p.map(function (r) { return r.join(","); }).join("/"); }

  // ---------------------------------------------------------------- generator
  var DIM = { 1: { n: 4, k: 2, cols: 2, rules: ["lr", "ud", "tile2"] }, 2: { n: 5, k: 2, cols: 3, rules: ["lr", "ud", "rot", "tile2"] }, 3: { n: 6, k: 3, cols: 4, rules: ["lr", "ud", "rot", "tile2", "tile3"] } };
  function gen(rnd, lv) {
    var D = DIM[lv], n = D.n, k = D.k, rule = rnd.pick(D.rules), palette = rnd.sample(BP.NNAT, D.cols), cls = {}, g = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); for (c = 0; c < n; c++) {
      var id = partners(rule, n, r, c).concat([[r, c]]).map(function (p) { return p[0] * n + p[1]; }).sort(function (a, b) { return a - b; })[0];
      if (cls[id] === undefined) cls[id] = rnd.pick(palette);
      g[r].push(cls[id]);
    } }
    var used = {}; g.forEach(function (row) { row.forEach(function (v) { used[v] = 1; }); });
    if (Object.keys(used).length < Math.min(D.cols, 3)) return null;
    var hole = [rnd.int(0, n - k), rnd.int(0, n - k)], ans = [];
    for (r = 0; r < k; r++) { ans.push([]); for (c = 0; c < k; c++) ans[r].push(g[hole[0] + r][hole[1] + c]); }
    if (Object.keys(ans.reduce(function (a, row) { row.forEach(function (v) { a[v] = 1; }); return a; }, {})).length < 2) return null;
    var dis = [flipH(ans), flipV(ans), rot90(ans), rot90(rot90(ans)), rot90(rot90(rot90(ans)))];
    var cand = [];
    for (var t = 0; t < 8; t++) { // change one square of the right piece
      var x = ans.map(function (row) { return row.slice(); }), rr = rnd.int(0, k - 1), cc = rnd.int(0, k - 1);
      x[rr][cc] = rnd.pick(palette.filter(function (v) { return v !== ans[rr][cc]; }));
      cand.push(x);
    }
    var sw = ans.map(function (row) { return row.map(function (v) { var i = palette.indexOf(v); return i < 0 ? v : palette[(i + 1) % palette.length]; }); }); // swapped colors
    dis = rnd.shuffle(dis).slice(0, 3).concat(cand.slice(0, 1), [sw], cand.slice(1));
    var o = BP.options(rnd, ans, dis, key, 5);
    if (!o) return null;
    var q = { prompt: "A piece is missing from the big pattern. Which piece fits the empty spot?",
      speak: "Look at the big pattern. One piece is missing. Which piece fits in the empty spot, so the pattern keeps going?",
      fig: BP.svg(292, 292, big(g, n, hole, k), "A colored square pattern with a missing piece"), kind: "svg",
      opts: o.list.map(function (p) { return BP.tile(piece(p, 14, 14, 76), 100); }), answer: o.answer,
      steps: [], solutionFig: BP.svg(292, 292, big(g, n, hole, k, ans), "The pattern with the piece in place"), data: { n: n, k: k, grid: g.map(function (row, i) { return row.map(function (v, j) { return (i >= hole[0] && i < hole[0] + k && j >= hole[1] && j < hole[1] + k) ? null : v; }); }), hole: hole, opts: o.list } };
    var mir = o.list.map(function (p, i) { return i; }).filter(function (i) { return i !== o.answer && (key(o.list[i]) === key(flipH(ans)) || key(o.list[i]) === key(flipV(ans)) || key(o.list[i]) === key(rot90(ans))); })[0];
    q.steps = [
      "Look at the whole pattern first. Do not look at the pieces yet. <b>Find the rule</b> that the colored squares follow.",
      RULE_TXT[rule] + " " + (rule.indexOf("tile") === 0 ? "Find the same block somewhere else on the pattern." : "Find the squares that match the empty spot on the other side."),
      "Copy the colors into the empty spot, square by square. " + (rule === "lr" ? "Left becomes right (flip it!)." : rule === "ud" ? "Top becomes bottom (flip it!)." : rule === "rot" ? "Turn the matching part upside down." : "The colors stay in the same order.") + " Check each corner of the piece.",
      "Be careful with look-alikes." + (mir !== undefined ? " Choice " + BP.LETTER[mir] + " has the right colors, but they are turned or flipped the wrong way." : " A piece with the right colors in the wrong places does not fit."),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }

  BP.reg("pattern-completion", { name: "Pattern Completion", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

/* ---- t-picture-analogies.js */
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

/* ---- t-picture-classification.js */
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

/* ---- t-sentence-completion.js */
/* Sentence Completion / Listen & Pick (CogAT verbal, K-2): a short spoken question, pick the picture that answers it.
   Questions come from the hand-written bank (BP.BANK.sentences: [id, text, answer, [distractors], level]).
   Solver: looks the sentence up by id in the bank and counts options equal to its answer key. */
(function (BP) {
  "use strict";
  var PB = BP.PB, B = BP.BANK;
  var BYLEVEL = { 1: [1], 2: [2], 3: [3, 4] };

  function solve(q) {
    var d = q.data, it = B.sentences.filter(function (s) { return s[0] === d.id; })[0];
    if (!it) throw new Error("unknown sentence");
    var hit = [];
    d.opts.forEach(function (o, i) { if (o === it[2]) hit.push(i); });
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  function gen(rnd, lv) {
    var items = B.sentences.filter(function (s) { return BYLEVEL[lv].indexOf(s[4]) >= 0; });
    if (!items.length) return null;
    var it = rnd.pick(items), dis = rnd.shuffle(it[3]).filter(function (x) { return x !== it[2] && B.pics[x]; });
    var o = BP.options(rnd, it[2], dis, function (x) { return x; }, lv === 3 && dis.length >= 3 ? 4 : 3);
    if (!o || !B.pics[it[2]]) return null;
    var nm = PB.name, ans = it[2], txt = it[1];
    var steps = [
      "Listen to the question, or read it: <b>“" + BP.esc(txt) + "”</b>",
      "Say the name of each picture: " + o.list.map(function (x, i) { return BP.LETTER[i] + " is the " + nm(x); }).join("; ") + ".",
      "Think: which picture is the best answer? The <b>" + nm(ans) + "</b> fits the question best." + (lv >= 3 ? " Look for every clue in the question, even small words like “not” or “more”." : ""),
      "The other pictures can be real things, but they do not answer this question.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."
    ];
    return { prompt: txt, speak: txt, fig: banner(txt, null), kind: "svg",
      opts: o.list.map(function (x) { return BP.picTile(x, nm(x)); }), answer: o.answer, steps: steps,
      solutionFig: banner(txt, ans), data: { id: it[0], text: txt, opts: o.list } };
  }

  function wrap(t) {
    var w = t.split(" "), lines = [""];
    w.forEach(function (x) { var l = lines[lines.length - 1]; if (l && (l + " " + x).length > 25) lines.push(x); else lines[lines.length - 1] = l ? l + " " + x : x; });
    return lines;
  }
  function banner(txt, pic) {
    var lines = wrap(txt), H = 66 + lines.length * 32 + (pic ? 110 : 0), W = 460;
    var s = '<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="18" fill="#fff6d1" stroke="#e2c45a" stroke-width="3"/>';
    s += '<path d="M28 44h14l16-13v38L42 56H28z" fill="#8a97b4"/><path d="M66 38q8 10 0 20M74 32q14 16 0 32" fill="none" stroke="#8a97b4" stroke-width="4" stroke-linecap="round"/>';
    lines.forEach(function (l, i) { s += BP.text(270, 46 + i * 32, l, { size: 22 }); });
    if (pic) s += PB.card(pic, W / 2 - 45, 70 + lines.length * 32 - 4, 90, "#1fa866");
    return BP.svg(W, H, s, "Question: " + txt);
  }

  BP.reg("sentence-completion", { name: "Sentence Completion", group: "verbal", gen: gen, solve: solve });
})(window.BP);

/* ---- t-serial-reasoning.js */
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

/* ---- t-spatial-visualization.js */
/* Spatial Visualization (NNAT style). Two kinds of questions:
   "combine": two drawings are put on top of each other (top row shows how), pick the result for the bottom row;
   "turn":    a colored pattern is turned (quarter / half turn), pick how it looks afterwards. 5 options. */
(function (BP) {
  "use strict";
  var FILL = { blue: BP.COLOR.blue, yellow: BP.COLOR.yellow, green: BP.COLOR.green, black: BP.COLOR.black, white: "#ffffff" };
  var PN = ["a horizontal line", "a vertical line", "a slanted line (top-left to bottom-right)", "a slanted line (bottom-left to top-right)", "a ring", "a dot in the top-left corner", "a dot in the top-right corner", "a dot in the bottom-left corner", "a dot in the bottom-right corner", "a small square"];
  function skey(a) { return a.slice().sort(function (x, y) { return x - y; }).join(","); }
  function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function uni(a, b) { return sorted(a.concat(b.filter(function (x) { return a.indexOf(x) < 0; }))); }
  function xor(a, b) { return sorted(a.filter(function (x) { return b.indexOf(x) < 0; }).concat(b.filter(function (x) { return a.indexOf(x) < 0; }))); }

  // ---------------------------------------------------------------- drawing: parts card
  function card(parts, x, y, s) {
    var o = '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="' + s * 0.09 + '" fill="#fff" stroke="#cbd4e6" stroke-width="2.2"/>', p = s * 0.16, i;
    function L(x1, y1, x2, y2, col) { return '<line x1="' + BP.f1(x + x1 * s) + '" y1="' + BP.f1(y + y1 * s) + '" x2="' + BP.f1(x + x2 * s) + '" y2="' + BP.f1(y + y2 * s) + '" stroke="' + col + '" stroke-width="' + BP.f1(s * 0.07) + '" stroke-linecap="round"/>'; }
    var pad = 0.17;
    for (i = 0; i < parts.length; i++) {
      var k = parts[i];
      if (k === 0) o += L(pad, .5, 1 - pad, .5, BP.COLOR.blue);
      if (k === 1) o += L(.5, pad, .5, 1 - pad, BP.COLOR.green);
      if (k === 2) o += L(pad, pad, 1 - pad, 1 - pad, BP.COLOR.black);
      if (k === 3) o += L(pad, 1 - pad, 1 - pad, pad, BP.COLOR.black);
    }
    if (parts.indexOf(4) >= 0) o += '<circle cx="' + BP.f1(x + s / 2) + '" cy="' + BP.f1(y + s / 2) + '" r="' + BP.f1(s * 0.3) + '" fill="none" stroke="' + BP.COLOR.yellow + '" stroke-width="' + BP.f1(s * 0.075) + '"/>';
    if (parts.indexOf(9) >= 0) o += '<rect x="' + BP.f1(x + s * 0.36) + '" y="' + BP.f1(y + s * 0.36) + '" width="' + BP.f1(s * 0.28) + '" height="' + BP.f1(s * 0.28) + '" fill="#fff" stroke="' + BP.COLOR.green + '" stroke-width="' + BP.f1(s * 0.05) + '"/>';
    [[5, .24, .24], [6, .76, .24], [7, .24, .76], [8, .76, .76]].forEach(function (d) { if (parts.indexOf(d[0]) >= 0) o += '<circle cx="' + BP.f1(x + d[1] * s) + '" cy="' + BP.f1(y + d[2] * s) + '" r="' + BP.f1(s * 0.075) + '" fill="' + BP.COLOR.yellow + '" stroke="' + BP.INK + '" stroke-width="' + BP.f1(s * 0.025) + '"/>'; });
    return o;
  }
  // ---------------------------------------------------------------- drawing: colored grid
  function pgrid(g, x, y, s) {
    var n = g.length, cs = s / n, o = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) o += '<rect x="' + BP.f1(x + c * cs) + '" y="' + BP.f1(y + r * cs) + '" width="' + BP.f1(cs) + '" height="' + BP.f1(cs) + '" fill="' + FILL[g[r][c]] + '" stroke="#8a93ad" stroke-width="1.2"/>';
    return o + '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + BP.INK + '" stroke-width="2.4"/>';
  }
  function gkey(g) { return g.map(function (r) { return r.join(","); }).join("/"); }

  // ---------------------------------------------------------------- independent solver
  function turnCell(kind, n, r, c) { return kind === "cw" ? [c, n - 1 - r] : kind === "ccw" ? [n - 1 - c, r] : [n - 1 - r, n - 1 - c]; }
  function solve(q) {
    var d = q.data, hit = [], want, i;
    if (d.mode === "turn") {
      var n = d.grid.length; want = d.grid.map(function (r) { return r.slice(); });
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) { var p = turnCell(d.turn, n, r, c); want[p[0]][p[1]] = d.grid[r][c]; }
      d.opts.forEach(function (o, k) { if (gkey(o) === gkey(want)) hit.push(k); });
    } else {
      var ops = [];
      if (skey(uni(d.top[0], d.top[1])) === skey(d.top[2])) ops.push(uni);
      if (skey(xor(d.top[0], d.top[1])) === skey(d.top[2])) ops.push(xor);
      if (!ops.length) throw new Error("no rule");
      var preds = {}; ops.forEach(function (f) { preds[skey(f(d.bot[0], d.bot[1]))] = 1; });
      if (Object.keys(preds).length !== 1) throw new Error("two answers");
      want = Object.keys(preds)[0];
      d.opts.forEach(function (o, k) { if (skey(o) === want) hit.push(k); });
    }
    if (hit.length !== 1) throw new Error("matches " + hit.length);
    return hit[0];
  }

  // ---------------------------------------------------------------- generator: combine
  function genCombine(rnd, lv) {
    var spec = lv === 1 ? [1, 1, 0] : lv === 2 ? rnd.pick([[2, 1, 0], [2, 2, 0]]) : rnd.pick([[2, 2, 1], [3, 2, 1]]), useX = lv === 3 && rnd.chance(0.5);
    function pair() {
      var pool = rnd.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), a = pool.slice(0, spec[0]), b = a.slice(0, spec[2]).concat(pool.slice(spec[0], spec[0] + spec[1] - spec[2]));
      return [sorted(a), sorted(b)];
    }
    var top = pair(), bot = pair(), f = useX ? xor : uni, C = f(top[0], top[1]), A = f(bot[0], bot[1]);
    if (!C.length || A.length < 2 || A.length > 5) return null;
    top.push(C);
    var dis = [], other = useX ? uni(bot[0], bot[1]) : (spec[2] ? xor(bot[0], bot[1]) : null);
    if (other) dis.push(other);
    dis.push(bot[0], bot[1]);
    A.forEach(function (p) { dis.push(A.filter(function (x) { return x !== p; })); });
    for (var t = 0; t < 6; t++) {
      var extra = rnd.int(0, 9);
      if (A.indexOf(extra) < 0) dis.push(sorted(A.concat([extra])));
      else { var rep = A.filter(function (x) { return x !== extra; }), np = rnd.int(0, 9); if (A.indexOf(np) < 0) dis.push(sorted(rep.concat([np]))); }
    }
    dis = dis.filter(function (x) { return x.length > 0; });
    var o = BP.options(rnd, A, rnd.shuffle(dis.slice(3)).slice(0, 3).concat(dis.slice(0, 3), rnd.shuffle(dis.slice(3))), skey, 5);
    if (!o) return null;
    var S = 92, g = 34, W = 3 * S + 2 * g + 32, s = '<rect width="' + W + '" height="' + (2 * S + 44) + '" rx="18" fill="' + BP.BG + '"/>';
    [[top, 0], [bot, 1]].forEach(function (rw) {
      var y = 16 + rw[1] * (S + 12), row = rw[0];
      s += card(row[0], 16, y, S) + BP.text(16 + S + g / 2, y + S * 0.64, "+", { size: 34 }) + card(row[1], 16 + S + g, y, S) + BP.text(16 + 2 * S + g * 1.5, y + S * 0.64, "=", { size: 34 });
      s += rw[1] === 0 ? card(row[2], 16 + 2 * S + 2 * g, y, S) : BP.box(16 + 2 * S + 2 * g, y, S, "", { ask: true });
    });
    var sol = '<rect width="' + W + '" height="' + (2 * S + 44) + '" rx="18" fill="' + BP.BG + '"/>';
    [[top, 0], [bot.concat([A]), 1]].forEach(function (rw) {
      var y = 16 + rw[1] * (S + 12), row = rw[0];
      sol += card(row[0], 16, y, S) + BP.text(16 + S + g / 2, y + S * 0.64, "+", { size: 34 }) + card(row[1], 16 + S + g, y, S) + BP.text(16 + 2 * S + g * 1.5, y + S * 0.64, "=", { size: 34 }) + card(row[2], 16 + 2 * S + 2 * g, y, S);
    });
    sol += '<rect x="' + (16 + 2 * S + 2 * g) + '" y="' + (16 + S + 12) + '" width="' + S + '" height="' + S + '" rx="8" fill="none" stroke="#1fa866" stroke-width="4"/>';
    var shared = top[0].filter(function (x) { return top[1].indexOf(x) >= 0; });
    var steps = ["Look at the <b>top row</b>. Two drawings go on top of each other and make the third drawing.",
      useX ? "Check the part that both drawings have (" + PN[shared[0]] + "). In the answer it is <b>gone</b>. So the rule is: parts that match <b>cancel out</b>. Only parts that are in just one drawing stay." :
        (shared.length ? "Check the part that both drawings have (" + PN[shared[0]] + "). It shows up <b>once</b> in the answer. So the rule is: put the drawings on top of each other and keep every part." : "Check each part: every part from the first and the second drawing shows up in the third. So the rule is: put the drawings on top of each other and keep every part."),
      "Now do the same with the <b>bottom row</b>. First drawing: " + bot[0].map(function (p) { return PN[p]; }).join(", ") + ". Second drawing: " + bot[1].map(function (p) { return PN[p]; }).join(", ") + ".",
      "Result: " + A.map(function (p) { return PN[p]; }).join(", ") + ". Count the parts: you need <b>" + A.length + "</b>. A choice with a part too many or too few is wrong.",
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."];
    return { prompt: "The top row shows how two drawings go together. Which picture goes in the empty box?",
      speak: "Look at the top row. Two drawings are put together and make a new drawing. Do the same with the bottom row. Which picture goes in the empty box?",
      fig: BP.svg(W, 2 * S + 44, s, "Two drawings put together, top row complete, bottom row missing its answer"), kind: "svg",
      opts: o.list.map(function (p) { return BP.tile(card(p, 4, 4, 100), 100); }), answer: o.answer, steps: steps, solutionFig: BP.svg(W, 2 * S + 44, sol, "The bottom row solved"),
      data: { mode: "combine", top: top, bot: bot, opts: o.list } };
  }

  // ---------------------------------------------------------------- generator: turn
  function flipH(p) { return p.map(function (r) { return r.slice().reverse(); }); }
  function rot(p, kind) { var n = p.length, o = p.map(function (r) { return r.slice(); }); for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) { var q = turnCell(kind, n, r, c); o[q[0]][q[1]] = p[r][c]; } return o; }
  function genTurn(rnd, lv) {
    var n = lv === 3 ? 4 : 3, turn = lv === 1 ? "cw" : lv === 2 ? rnd.pick(["cw", "half", "ccw"]) : rnd.pick(["cw", "ccw", "half"]), pal = rnd.sample(BP.NNAT, lv === 1 ? 2 : 3), g = [], r, c;
    for (r = 0; r < n; r++) { g.push([]); for (c = 0; c < n; c++) g[r].push(rnd.chance(0.45) ? "white" : rnd.pick(pal)); }
    var ans = rot(g, turn), cw = rot(g, "cw"), half = rot(g, "half"), ccw = rot(g, "ccw");
    if ([cw, half, ccw, flipH(g)].some(function (x) { return gkey(x) === gkey(g); }) || gkey(cw) === gkey(ccw) || gkey(flipH(ans)) === gkey(ans)) return null;
    var wrongTurn = { cw: [ccw, half], ccw: [cw, half], half: [cw, ccw] }[turn];
    var poke = ans.map(function (x) { return x.slice(); }), pr = rnd.int(0, n - 1), pc = rnd.int(0, n - 1); poke[pr][pc] = rnd.pick(["blue", "yellow", "green", "black", "white"].filter(function (v) { return v !== ans[pr][pc]; }));
    var o = BP.options(rnd, ans, [flipH(ans), wrongTurn[0], wrongTurn[1], g, poke, rot(flipH(g), turn).map(function (x) { return x.slice(); })].map(function (x) { return x; }), gkey, 5);
    if (!o) return null;
    var word = { cw: "a quarter turn to the right (clockwise)", ccw: "a quarter turn to the left (counter-clockwise)", half: "a half turn (upside down)" }[turn];
    var label = { cw: "turn right", ccw: "turn left", half: "half turn" }[turn];
    var S = 150, W = 360, s = '<rect width="' + W + '" height="196" rx="18" fill="' + BP.BG + '"/>' + pgrid(g, 16, 22, S);
    var ax = 16 + S + 20, ay = 97;
    s += '<path d="M' + ax + "," + (ay + 20) + " Q" + (ax + 36) + "," + (ay - 40) + " " + (ax + 70) + "," + (ay + 20) + '" fill="none" stroke="#e0562b" stroke-width="4.5" stroke-linecap="round"/>';
    s += turn === "ccw" ? '<polygon points="' + ax + "," + (ay + 30) + " " + (ax - 5) + "," + (ay + 12) + " " + (ax + 14) + "," + (ay + 16) + '" fill="#e0562b"/>' : '<polygon points="' + (ax + 70) + "," + (ay + 30) + " " + (ax + 75) + "," + (ay + 12) + " " + (ax + 56) + "," + (ay + 16) + '" fill="#e0562b"/>';
    s += BP.text(ax + 35, ay + 52, label, { size: 15, color: "#e0562b" }) + BP.box(16 + S + 100, 22, 0 + 70, "", { ask: true, h: 70 }).replace(/<text[^>]*>.*?<\/text>/, BP.text(16 + S + 135, 22 + 50, "?", { size: 36, color: "#e2a000", weight: 900 }));
    var fig = BP.svg(W, 196, s, "A pattern and an arrow showing " + word);
    var solS = '<rect width="360" height="196" rx="18" fill="' + BP.BG + '"/>' + pgrid(g, 12, 38, 150) + BP.text(180, 120, "→", { size: 40, color: "#e0562b" }) + pgrid(ans, 198, 38, 150);
    var wi = o.list.findIndex(function (x) { return gkey(x) === gkey(flipH(ans)); });
    var steps = ["The pattern is going to be turned: " + word + ". The picture does <b>not</b> change. It only turns around.",
      "Pick one square that is easy to find, like the one in the top-left corner. " + (turn === "cw" ? "After a right turn, the top row moves to the right side (the first square goes to the top-right corner)." : turn === "ccw" ? "After a left turn, the top row moves to the left side (the first square goes to the bottom-left corner)." : "After a half turn, the top row becomes the bottom row, upside down (the first square goes to the bottom-right corner)."),
      "Find the choice with that square in the right place. Then check the other colors around it. Tip: turn the page in your head, or turn your paper!",
      "Careful: a <i>flipped</i> picture is not a <i>turned</i> picture." + (wi >= 0 ? " Choice " + BP.LETTER[wi] + " is a mirror picture, so it is wrong." : " Some choices turn the picture the wrong way or too far."),
      "Answer: <b>" + BP.LETTER[o.answer] + "</b>."];
    return { prompt: "The pattern turns around like the arrow shows. Which picture shows it after the turn?",
      speak: "Look at the pattern and the arrow. The pattern turns around like the arrow shows. Which picture shows the pattern after the turn?",
      fig: fig, kind: "svg", opts: o.list.map(function (p) { return BP.tile(pgrid(p, 14, 14, 76), 100); }), answer: o.answer, steps: steps,
      solutionFig: BP.svg(360, 196, solS, "The pattern before and after the turn"), data: { mode: "turn", turn: turn, grid: g, opts: o.list } };
  }

  function gen(rnd, lv) {
    var q = (lv === 1 ? rnd.chance(0.6) : rnd.chance(0.5)) ? genCombine(rnd, lv) : genTurn(rnd, lv);
    if (!q) return null;
    try { if (solve(q) !== q.answer) return null; } catch (e) { return null; }
    return q;
  }
  BP.reg("spatial-visualization", { name: "Spatial Visualization", group: "nonverbal", gen: gen, solve: solve });
})(window.BP);

/* ---- practice.js */
/* Tamakala Games · Brainosaur Prep: unlimited practice widget.
   <section class="bpp" data-type="figure-matrices | mixed | verbal | quant | nonverbal"></section> */
(function () {
  "use strict";
  var BP = window.BP;
  var PRAISE = ["Great job!", "Super!", "You got it!", "Nice thinking!", "Well done!", "Awesome!"];
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function seed() { try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % 2000000000; } catch (e) { return Math.floor(Math.random() * 2e9); } }
  BP.seed = seed;
  BP.ls = ls;

  /* read aloud (browser voice, US English when available) */
  BP.speak = function (text, btn) {
    try {
      var s = window.speechSynthesis;
      if (!s) return false;
      s.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.92;
      var vs = s.getVoices().filter(function (v) { return /^en[-_]US/i.test(v.lang); });
      if (vs.length) u.voice = vs.filter(function (v) { return /Google|Samantha|Aria|Jenny|Natural/i.test(v.name); })[0] || vs[0];
      if (btn) { btn.classList.add("on"); u.onend = u.onerror = function () { btn.classList.remove("on"); }; }
      s.speak(u);
      return true;
    } catch (e) { return false; }
  };
  BP.canSpeak = function () { return typeof window !== "undefined" && "speechSynthesis" in window; };
  BP.SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* level chooser shared by the whole hub */
  BP.level = function (v) { if (v) ls("bp-level", v); return ls("bp-level") || 2; };

  /* draws one question into a stage; returns {el, lock(i), reveal()} */
  BP.drawQuestion = function (q, onPick, opt) {
    opt = opt || {};
    var box = el("div", "bpq");
    var head = el("div", "bpq-head");
    if (opt.tag) head.appendChild(el("span", "bpq-tag", opt.tag));
    var p = el("p", "bpq-prompt");
    p.textContent = q.prompt;
    head.appendChild(p);
    if (BP.canSpeak()) {
      var sp = el("button", "bpq-say", BP.SPEAKER + "<span>Read to me</span>");
      sp.type = "button";
      sp.setAttribute("aria-label", "Read the question aloud");
      sp.addEventListener("click", function () { BP.speak(q.speak || q.prompt, sp); });
      head.appendChild(sp);
    }
    box.appendChild(head);
    var fig = el("div", "bpq-fig", q.fig);
    box.appendChild(fig);
    var ops = el("div", "bpq-opts " + (q.kind === "text" ? "txt" : "pic") + " n" + q.opts.length);
    ops.setAttribute("role", "group");
    ops.setAttribute("aria-label", "Answer choices");
    q.opts.forEach(function (s, i) {
      var b = el("button", "bpq-o", '<span class="bpq-l">' + BP.LETTER[i] + "</span>" + (q.kind === "text" ? '<span class="bpq-t">' + s + "</span>" : s));
      b.type = "button";
      b.setAttribute("aria-label", "Answer " + BP.LETTER[i] + (q.kind === "text" ? ": " + String(s).replace(/<[^>]+>/g, "") : ""));
      if (opt.picked === i) b.classList.add("picked");
      b.addEventListener("click", function () { onPick(i, b); });
      ops.appendChild(b);
    });
    box.appendChild(ops);
    return {
      el: box, opts: ops,
      mark: function (picked) {
        [].forEach.call(ops.children, function (b, j) {
          b.disabled = true;
          if (j === q.answer) b.classList.add("right");
          else if (j === picked) b.classList.add("wrong");
        });
      },
      select: function (i) { [].forEach.call(ops.children, function (b, j) { b.classList.toggle("picked", j === i); b.setAttribute("aria-pressed", j === i ? "true" : "false"); }); }
    };
  };
  BP.solutionHTML = function (q) {
    return (q.solutionFig ? '<div class="bps-fig">' + q.solutionFig + "</div>" : "") + '<ol class="bps-steps">' + q.steps.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ol>";
  };
  BP.pool = function (what) {
    if (BP.T[what]) return [what];
    return BP.ORDER.filter(function (k) { return what === "mixed" || BP.T[k].group === what; });
  };

  function mount(root) {
    var what = root.getAttribute("data-type") || "mixed";
    var pool = BP.pool(what);
    if (!pool.length) return;
    var key = "bp-score-" + what;
    var sc = ls(key) || { right: 0, total: 0, run: 0, best: 0 };
    var q = null, done = false, view = null, last = null;
    root.innerHTML = "";

    var top = el("div", "bpp-top");
    var lv = el("div", "bpp-lv");
    lv.setAttribute("role", "radiogroup");
    lv.setAttribute("aria-label", "Grade level");
    [1, 2, 3].forEach(function (n) {
      var b = el("button", "", "<b>" + BP.LEVEL[n] + "</b><small>" + ["", "ages 5–7", "ages 7–8", "ages 8–9"][n] + "</small>");
      b.type = "button"; b.dataset.lv = n; b.setAttribute("role", "radio");
      b.addEventListener("click", function () { BP.level(n); mark(); next(); });
      lv.appendChild(b);
    });
    top.appendChild(lv);
    var score = el("div", "bpp-score");
    score.setAttribute("aria-live", "polite");
    top.appendChild(score);
    root.appendChild(top);

    var stage = el("div", "bpp-stage");
    root.appendChild(stage);
    var fb = el("div", "bpp-fb");
    fb.setAttribute("role", "status");
    root.appendChild(fb);
    var bar = el("div", "bpp-bar");
    var bHow = el("button", "bp-btn ghost", "Show me how");
    bHow.type = "button";
    var bNext = el("button", "bp-btn go", "Next question <span aria-hidden=\"true\">→</span>");
    bNext.type = "button";
    bar.appendChild(bHow); bar.appendChild(bNext);
    root.appendChild(bar);
    var sol = el("div", "bpp-sol");
    sol.hidden = true;
    root.appendChild(sol);

    function mark() { [].forEach.call(lv.children, function (b) { var on = +b.dataset.lv === BP.level(); b.className = on ? "on" : ""; b.setAttribute("aria-checked", on ? "true" : "false"); }); }
    function showScore() { score.innerHTML = "<b>" + sc.right + "</b> right of " + sc.total + (sc.run >= 2 ? ' <span class="bpp-run">' + sc.run + " in a row</span>" : ""); }
    function next() {
      done = false;
      var cand = pool.length > 1 ? pool.filter(function (x) { return x !== last; }) : pool;
      var k = cand[Math.floor(Math.random() * cand.length)];
      last = k;
      try { q = BP.make(k, BP.level(), seed()); } catch (e) { fb.textContent = "Sorry, please tap Next question."; return; }
      view = BP.drawQuestion(q, pick, { tag: pool.length > 1 ? BP.T[k].name : "" });
      stage.innerHTML = ""; stage.appendChild(view.el);
      fb.className = "bpp-fb"; fb.innerHTML = "";
      sol.hidden = true; sol.innerHTML = ""; bHow.textContent = "Show me how";
      root.classList.remove("answered");
    }
    function pick(i) {
      if (done) return;
      done = true;
      var ok = i === q.answer;
      sc.total++;
      if (ok) { sc.right++; sc.run++; sc.best = Math.max(sc.best, sc.run); } else sc.run = 0;
      ls(key, sc); showScore();
      view.mark(i);
      root.classList.add("answered");
      fb.className = "bpp-fb " + (ok ? "good" : "oops");
      fb.innerHTML = ok ? '<span class="bpp-star" aria-hidden="true">★</span><b>' + PRAISE[Math.floor(Math.random() * PRAISE.length)] + "</b> The answer is " + BP.LETTER[q.answer] + "."
        : "<b>Almost!</b> The answer is " + BP.LETTER[q.answer] + ". Let's look at how to solve it.";
      if (!ok) openSol();
      bNext.focus({ preventScroll: true });
    }
    function openSol() {
      if (!sol.hidden) { sol.hidden = true; bHow.textContent = "Show me how"; return; }
      sol.innerHTML = BP.solutionHTML(q);
      sol.hidden = false; bHow.textContent = "Hide the steps";
    }
    bHow.addEventListener("click", function () {
      if (!done) { done = true; sc.total++; sc.run = 0; ls(key, sc); showScore(); view.mark(-1); root.classList.add("answered"); }
      openSol();
    });
    bNext.addEventListener("click", function () {
      next();
      var r = root.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.5) window.scrollTo(0, window.scrollY + r.top - 80);
    });
    root.addEventListener("keydown", function (e) {
      var n = "123456".indexOf(e.key);
      if (n < 0) n = "abcdef".indexOf((e.key || "").toLowerCase());
      if (n >= 0 && !done && q && n < q.opts.length) { e.preventDefault(); pick(n); }
    });
    mark(); showScore(); next();
  }

  BP.mountAll = function () { [].forEach.call(document.querySelectorAll(".bpp[data-type]"), mount); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", BP.mountAll); else BP.mountAll();
})();

/* ---- mock.js */
/* Tamakala Games · Brainosaur Prep: practice test (mock test). <section class="bpm"></section>
   BP.URLS = {type: "/brainosaur/prep/<slug>/"} is set by the page. */
(function () {
  "use strict";
  var BP = window.BP;
  var FORMS = {
    quick: { name: "Quick check", note: "12 questions · all three parts · no timer", parts: [{ name: "Mixed", types: ["picture-analogies", "picture-classification", "sentence-completion", "odd-one-out", "number-analogies", "number-puzzles", "number-series", "number-patterns", "figure-matrices", "paper-folding", "figure-classification", "pattern-completion"], n: 12 }] },
    cogat: { name: "CogAT-style screener", note: "3 parts × 8 questions · pictures, numbers, shapes · no timer",
      parts: [{ name: "Part 1: Picture Analogies", types: ["picture-analogies"], n: 8 }, { name: "Part 2: Number Analogies", types: ["number-analogies"], n: 8 }, { name: "Part 3: Figure Matrices", types: ["figure-matrices"], n: 8 }] },
    nnat: { name: "NNAT-style shape test", note: "24 shape questions · 15 minutes", min: 15,
      parts: [{ name: "Shapes", types: ["pattern-completion", "figure-matrices", "serial-reasoning", "spatial-visualization"], n: 24 }] },
    nnatfull: { name: "NNAT-style shape test (full length)", note: "48 shape questions · 30 minutes", min: 30,
      parts: [{ name: "Shapes", types: ["pattern-completion", "figure-matrices", "serial-reasoning", "spatial-visualization"], n: 48 }] }
  };
  BP.FORMS = FORMS;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function btn(cls, html, fn) { var b = el("button", cls, html); b.type = "button"; b.addEventListener("click", fn); return b; }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  function top(root) { var r = root.getBoundingClientRect(); if (r.top < 0 || r.top > 120) window.scrollTo(0, window.scrollY + r.top - 76); }

  function mount(root) {
    var st = null, timer = null;
    function home() {
      clearInterval(timer);
      root.innerHTML = "";
      root.appendChild(el("h2", "bpm-h", "1. Pick a practice test"));
      var g = el("div", "bpm-forms");
      var start = (location.hash || "").slice(1) || root.getAttribute("data-form");
      Object.keys(FORMS).forEach(function (k) {
        var f = FORMS[k];
        var b = btn("bpm-form" + (k === start ? " on" : ""), "<b>" + f.name + "</b><span>" + f.note + "</span>", function () { choose(k); });
        b.dataset.k = k;
        g.appendChild(b);
      });
      root.appendChild(g);
      root.appendChild(el("h2", "bpm-h", "2. Pick the grade"));
      var lv = el("div", "bpp-lv");
      [1, 2, 3].forEach(function (n) {
        var b = btn(BP.level() === n ? "on" : "", "<b>" + BP.LEVEL[n] + "</b><small>" + ["", "ages 5–7", "ages 7–8", "ages 8–9"][n] + "</small>", function () { BP.level(n); [].forEach.call(lv.children, function (x, j) { x.className = j + 1 === n ? "on" : ""; }); });
        lv.appendChild(b);
      });
      root.appendChild(lv);
      var go = btn("bp-btn go big", "Start the test <span aria-hidden=\"true\">→</span>", function () { begin(sel); });
      var sel = start && FORMS[start] ? start : "quick";
      function choose(k) { sel = k; [].forEach.call(g.children, function (x) { x.classList.toggle("on", x.dataset.k === k); }); }
      choose(sel);
      root.appendChild(el("div", "bpm-go")).appendChild(go);
      var hist = BP.ls("bp-mock-history") || [];
      if (hist.length) {
        var h = el("div", "bpm-hist", "<h3>Your last tests (saved only on this device)</h3>");
        var ul = el("ul");
        hist.slice(-5).reverse().forEach(function (x) { ul.appendChild(el("li", "", "<b>" + x.right + " of " + x.total + "</b> · " + BP.esc(x.form) + " · " + BP.LEVEL[x.level] + " · " + BP.esc(x.date))); });
        h.appendChild(ul);
        h.appendChild(btn("bp-link", "Clear history", function () { BP.ls("bp-mock-history", []); home(); }));
        root.appendChild(h);
      }
    }
    function begin(k) {
      var f = FORMS[k], lv = BP.level(), qs = [];
      f.parts.forEach(function (p, pi) {
        var types = p.types.filter(function (t) { return BP.T[t]; });
        var order = [];
        for (var i = 0; i < p.n; i++) order.push(types[i % types.length]);
        order = BP.rnd(BP.seed()).shuffle(order);
        order.forEach(function (t) { qs.push({ q: BP.make(t, lv, BP.seed()), part: pi, pick: -1, ms: 0 }); });
      });
      st = { k: k, f: f, lv: lv, qs: qs, i: 0, t0: Date.now(), shown: Date.now(), introPart: -1, end: f.min ? Date.now() + f.min * 60000 : 0 };
      if (f.min) timer = setInterval(tick, 500);
      show();
    }
    function tick() {
      var c = root.querySelector(".bpm-clock");
      var left = (st.end - Date.now()) / 1000;
      if (c) { c.textContent = mmss(left); c.classList.toggle("low", left < 120); }
      if (left <= 0) { clearInterval(timer); finish(true); }
    }
    function leave() { var x = st.qs[st.i]; x.ms += Date.now() - st.shown; }
    function show() {
      var x = st.qs[st.i], f = st.f;
      root.innerHTML = "";
      if (f.parts.length > 1 && x.part !== st.introPart) {
        st.introPart = x.part;
        var intro = el("div", "bpm-intro", "<h2>" + f.parts[x.part].name + "</h2><p>" + f.parts[x.part].n + " questions. Take your time. Tap <b>Read to me</b> if you want to hear a question.</p>");
        intro.appendChild(btn("bp-btn go big", "Let's go <span aria-hidden=\"true\">→</span>", show));
        root.appendChild(intro);
        top(root);
        return;
      }
      st.shown = Date.now();
      var head = el("div", "bpm-top");
      head.appendChild(el("span", "bpm-count", "Question <b>" + (st.i + 1) + "</b> of " + st.qs.length));
      if (f.min) head.appendChild(el("span", "bpm-clock", mmss((st.end - Date.now()) / 1000)));
      var prog = el("div", "bpm-prog", "<i style=\"width:" + ((st.i) / st.qs.length * 100).toFixed(1) + "%\"></i>");
      root.appendChild(head); root.appendChild(prog);
      var v = BP.drawQuestion(x.q, function (i) { x.pick = i; v.select(i); nextB.disabled = false; }, { picked: x.pick });
      root.appendChild(v.el);
      var bar = el("div", "bpp-bar");
      bar.appendChild(btn("bp-btn ghost", "<span aria-hidden=\"true\">←</span> Back", function () { if (st.i > 0) { leave(); st.i--; show(); } })).disabled = st.i === 0;
      var last = st.i === st.qs.length - 1;
      var nextB = btn("bp-btn go", last ? "Finish" : "Next <span aria-hidden=\"true\">→</span>", function () {
        leave();
        if (last) { var blank = st.qs.filter(function (y) { return y.pick < 0; }).length; if (blank && !confirm(blank + " question(s) have no answer. Finish anyway?")) { st.shown = Date.now(); return; } finish(false); }
        else { st.i++; show(); }
      });
      bar.appendChild(nextB);
      root.appendChild(bar);
      root.appendChild(btn("bp-link bpm-quit", "Stop and go back", function () { if (confirm("Stop this test? Answers will not be saved.")) home(); }));
      top(root);
    }
    function finish(timeUp) {
      clearInterval(timer);
      var qs = st.qs, right = qs.filter(function (y) { return y.pick === y.q.answer; }).length;
      var by = {};
      qs.forEach(function (y) { var b = by[y.q.type] = by[y.q.type] || { r: 0, n: 0, ms: 0 }; b.n++; b.ms += y.ms; if (y.pick === y.q.answer) b.r++; });
      var hist = BP.ls("bp-mock-history") || [];
      hist.push({ form: st.f.name, level: st.lv, right: right, total: qs.length, date: new Date().toISOString().slice(0, 10) });
      BP.ls("bp-mock-history", hist.slice(-30));
      root.innerHTML = "";
      var res = el("div", "bpm-res");
      res.appendChild(el("p", "bpm-big", "<b>" + right + "</b> right of " + qs.length));
      res.appendChild(el("p", "", (timeUp ? "Time is up. " : "") + st.f.name + " · " + BP.LEVEL_LONG[st.lv] + " · time " + mmss((Date.now() - st.t0) / 1000)));
      res.appendChild(el("p", "bpm-note", "This is a practice result to show what to practice next. It is not an official score and does not predict a test result."));
      root.appendChild(res);
      var tb = el("div", "bpm-types", "<h2>By question type</h2>");
      Object.keys(by).forEach(function (t) {
        var b = by[t], r = b.r / b.n, lab = r >= 0.8 ? ["strong", "Strong"] : r >= 0.5 ? ["grow", "Growing"] : ["work", "Practice more"];
        var row = el("div", "bpm-row " + lab[0], "<span><b>" + BP.T[t].name + "</b><small>" + b.r + " of " + b.n + " right · about " + Math.round(b.ms / b.n / 1000) + " s each</small></span><em>" + lab[1] + "</em>");
        var U = BP.URLS || window.BP_URLS; if (U && U[t] && r < 0.8) row.appendChild(el("a", "bp-btn sm", "Practice")).href = U[t];
        tb.appendChild(row);
      });
      root.appendChild(tb);
      var bar = el("div", "bpp-bar");
      bar.appendChild(btn("bp-btn ghost", "Print results", function () { window.print(); }));
      bar.appendChild(btn("bp-btn go", "New test <span aria-hidden=\"true\">→</span>", home));
      root.appendChild(bar);
      var miss = qs.filter(function (y) { return y.pick !== y.q.answer; });
      if (miss.length) {
        var rv = el("div", "bpm-review", "<h2>Let's look at the ones to fix (" + miss.length + ")</h2>");
        miss.forEach(function (y) {
          var n = qs.indexOf(y) + 1;
          var d = el("details", "bpm-item");
          d.appendChild(el("summary", "", "<b>Question " + n + "</b> · " + BP.T[y.q.type].name + " · " + (y.pick < 0 ? "no answer" : "you picked " + BP.LETTER[y.pick]) + ", answer " + BP.LETTER[y.q.answer]));
          var v = BP.drawQuestion(y.q, function () {}, {});
          v.mark(y.pick);
          d.appendChild(v.el);
          d.appendChild(el("div", "bpp-sol", BP.solutionHTML(y.q)));
          rv.appendChild(d);
        });
        root.appendChild(rv);
      }
      top(root);
    }
    window.addEventListener("hashchange", function () { if (!root.querySelector(".bpq") || root.querySelector(".bpm-res")) home(); });
    home();
  }
  function go() { [].forEach.call(document.querySelectorAll(".bpm"), mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();

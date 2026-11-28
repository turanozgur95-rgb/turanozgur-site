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

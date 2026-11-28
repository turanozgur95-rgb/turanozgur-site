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

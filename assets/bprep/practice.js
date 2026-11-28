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

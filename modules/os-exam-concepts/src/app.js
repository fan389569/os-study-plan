/* ============================================================
   交互引擎：页签、动画播放器、小测、综合自测、主题
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const LETTERS = "ABCD";
  const players = new Map();
  let activeTab = "p1";
  let toastTimer = null;

  /* ---------------- 主题 ---------------- */
  const themeBtn = $("#themeBtn");
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    themeBtn.innerHTML = dark
      ? '<span class="theme-ico" aria-hidden="true">☀</span><span class="theme-txt">浅色</span>'
      : '<span class="theme-ico" aria-hidden="true">☾</span><span class="theme-txt">深色</span>';
    themeBtn.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
    try { localStorage.setItem("os-theme", theme); } catch (e) {}
  }
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("os-theme"); } catch (e) {}
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  /* ---------------- 工具 ---------------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }
  function correctText(q) {
    if (q.parts) return q.parts.map((p, i) => `${["①", "②", "③"][i]} ${p.opts[p.a]}`).join("；");
    return q.opts[q.a];
  }
  function chosenText(q, choice) {
    if (q.parts) {
      if (!choice) return "未作答";
      return q.parts.map((p, i) => `${["①", "②", "③"][i]} ${p.opts[choice[i]]}`).join("；");
    }
    return q.opts[choice];
  }

  /* ---------------- 页签 ---------------- */
  const tabsEl = $("#tabs");
  const mainEl = $("#main");

  function buildTabs() {
    const nav = CARDS.concat([{ id: "p7", num: "⑦", short: "综合自测" }]);
    tabsEl.innerHTML = nav.map(card => `
      <button class="tab" role="tab" id="tab-${card.id}" aria-controls="panel-${card.id}"
              aria-selected="false" data-tab="${card.id}" type="button">
        <span class="tab-n" aria-hidden="true">${card.num}</span>${card.short}
      </button>`).join("");
    tabsEl.addEventListener("click", e => {
      const b = e.target.closest("[data-tab]");
      if (b) showTab(b.dataset.tab);
    });
  }

  function showTab(id, opts = {}) {
    if (id !== "p7" && !CARDS.some(c => c.id === id)) id = "p1";
    activeTab = id;
    $$(".tab", tabsEl).forEach(b => {
      const on = b.dataset.tab === id;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".card-panel", mainEl).forEach(p => p.classList.toggle("active", p.dataset.panel === id));
    $$(".anim", mainEl).forEach(a => { if (a.dataset.playing === "1") a.dataset.playing = "0"; });
    players.forEach(p => p.pause());
    $("#toast").hidden = true;
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: "auto" });
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }

  /* ---------------- 对比图 ---------------- */
  function shapeIcon(shape, color) {
    const common = `fill="none" stroke="${color}" stroke-width="3.2" stroke-linejoin="round"`;
    const shapes = {
      circle: `<circle cx="28" cy="28" r="17" ${common}/><circle cx="28" cy="28" r="4.5" fill="${color}"/>`,
      rect: `<rect x="7" y="13" width="42" height="30" rx="9" ${common}/><path d="M16 28h24" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`,
      pill: `<rect x="5" y="19" width="46" height="18" rx="9" ${common}/><circle cx="17" cy="28" r="2.6" fill="${color}"/><path d="M24 28h17" stroke="${color}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>`,
      square: `<rect x="12" y="12" width="32" height="32" rx="4" ${common}/><circle cx="22" cy="22" r="3" fill="${color}"/><circle cx="34" cy="34" r="3" fill="${color}"/>`,
      page: `<rect x="10" y="9" width="36" height="38" rx="5" ${common}/><path d="M18 20h20M18 28h20M18 36h12" stroke="${color}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>`,
      doc: `<path d="M14 7h20l9 9v33H14z" ${common}/><path d="M34 7v10h9" ${common}/><path d="M20 26h17M20 33h17M20 40h11" stroke="${color}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`,
      disk: `<ellipse cx="28" cy="15" rx="16" ry="6" ${common}/><path d="M12 15v26c0 3.3 7.2 6 16 6s16-2.7 16-6V15" ${common}/><path d="M12 28c0 3.3 7.2 6 16 6s16-2.7 16-6" stroke="${color}" stroke-width="2.4" opacity=".55"/>`,
      cpu: `<rect x="10" y="10" width="36" height="36" rx="6" ${common}/><rect x="20" y="20" width="16" height="16" rx="2" fill="${color}" opacity=".25"/><path d="M18 5v5M28 5v5M38 5v5M18 46v5M28 46v5M38 46v5M5 18h5M5 28h5M5 38h5M46 18h5M46 28h5M46 38h5" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`,
      shield: `<path d="M28 6l18 7v13c0 12-8 20-18 24-10-4-18-12-18-24V13z" ${common}/><path d="M20 28l6 6 11-12" ${common}/>`
    };
    return `<svg viewBox="0 0 56 56" aria-hidden="true">${shapes[shape] || shapes.circle}</svg>`;
  }

  function compareHTML(cmp) {
    return `
      <div class="compare">
        ${cmp.cols.map(col => `
          <div class="cmp-col" style="--cc:${col.color}">
            <div class="cmp-top">
              <div class="cmp-icon">${shapeIcon(col.shape, col.color)}</div>
              <div><h4>${col.name}</h4><span>${col.tag || ""}</span></div>
            </div>
            <ul>${col.points.map(p => `<li>${p}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>
      ${cmp.facts && cmp.facts.length ? `<div class="facts">${cmp.facts.map(f => `
        <div class="fact ${f.ok ? "ok" : "bad"}">
          <span class="fact-ico" aria-hidden="true">${f.ok ? "✓" : "✗"}</span>
          <span class="fact-text">${f.text}</span>
          <span class="fact-tag">${f.ok ? "对" : "错"}</span>
        </div>`).join("")}</div>` : ""}`;
  }

  /* ---------------- 动画播放器 ---------------- */
  class Player {
    constructor(anim, root) {
      this.anim = anim;
      this.root = root;
      this.i = 0;
      this.playing = false;
      this.speed = 1;
      this.timer = null;
      this.stage = $(".stage", root);
      this.sub = $(".subtitle", root);
      this.playBtn = $('[data-act="play"]', root);
      this.stepEl = $(".step-count", root);
      this.dotsEl = $(".dots", root);

      root.addEventListener("click", e => {
        const b = e.target.closest("[data-act]");
        if (!b) return;
        const act = b.dataset.act;
        if (act === "prev") this.prev();
        if (act === "next") this.next();
        if (act === "play") this.toggle();
        if (act === "dot") { this.seek(Number(b.dataset.i)); this.root.dataset.playing = "0"; }
      });
      const speed = $('[data-act="speed"]', root);
      if (speed) speed.addEventListener("change", () => this.setSpeed(Number(speed.value)));

      this.renderDots();
      this.render();
    }
    get last() { return this.anim.frames.length - 1; }
    renderDots() {
      this.dotsEl.innerHTML = this.anim.frames.map((_, i) =>
        `<button class="dot" type="button" data-act="dot" data-i="${i}" aria-label="第 ${i + 1} 步"></button>`).join("");
    }
    render() {
      const f = this.anim.frames[this.i];
      this.stage.innerHTML = `<svg viewBox="0 0 640 400" role="img" aria-label="${escapeHTML(this.anim.title)} 第 ${this.i + 1} 步">${f.svg}</svg>`;
      this.sub.textContent = f.t;
      this.stepEl.textContent = `${this.i + 1} / ${this.anim.frames.length}`;
      $$(".dot", this.dotsEl).forEach((d, i) => d.classList.toggle("on", i === this.i));
      $('[data-act="prev"]', this.root).disabled = this.i === 0;
      $('[data-act="next"]', this.root).disabled = this.i === this.last;
      this.playBtn.innerHTML = this.playing
        ? "⏸ 暂停"
        : (this.i === this.last ? "↻ 重播" : "▶ 播放");
      this.playBtn.setAttribute("aria-label", this.playing ? "暂停动画" : "播放动画");
    }
    updatePlayUI() {
      this.playBtn.innerHTML = this.playing ? "⏸ 暂停" : (this.i === this.last ? "↻ 重播" : "▶ 播放");
      this.playBtn.setAttribute("aria-label", this.playing ? "暂停动画" : "播放动画");
    }
    schedule() {
      clearTimeout(this.timer);
      if (!this.playing) return;
      const f = this.anim.frames[this.i];
      const dur = (f.d || 3400) / this.speed;
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        if (this.i < this.last) {
          this.i++;
          this.render();
          this.schedule();
        } else {
          this.playing = false;
          this.root.dataset.playing = "0";
          this.updatePlayUI();
        }
      }, dur);
    }
    play() {
      if (this.i >= this.last) { this.i = 0; this.render(); }
      this.playing = true;
      this.root.dataset.playing = "1";
      this.updatePlayUI();
      this.schedule();
    }
    pause() {
      this.playing = false;
      clearTimeout(this.timer);
      this.root.dataset.playing = "0";
      this.updatePlayUI();
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    seek(i, keepPaused = true) {
      clearTimeout(this.timer);
      this.i = Math.max(0, Math.min(this.last, i));
      if (keepPaused) this.playing = false;
      this.render();
      if (this.playing) this.schedule();
    }
    next() {
      clearTimeout(this.timer);
      this.playing = false;
      if (this.i < this.last) this.i++;
      this.render();
    }
    prev() {
      clearTimeout(this.timer);
      this.playing = false;
      if (this.i > 0) this.i--;
      this.render();
    }
    setSpeed(v) {
      this.speed = v || 1;
      if (this.playing) this.schedule();
    }
  }

  /* ---------------- 渲染卡片 ---------------- */
  function animHTML(a) {
    return `
      <article class="anim" id="anim-${a.id}" data-anim="${a.id}">
        <div class="anim-head">
          <span class="anim-no">动画 ${a.no}</span>
          <h4>${a.title}</h4>
          <span class="anim-len">${a.frames.length} 步 · ${Math.round(a.frames.reduce((s, f) => s + (f.d || 3400), 0) / 1000)} 秒</span>
        </div>
        <div class="stage"></div>
        <div class="subtitle"></div>
        <div class="controls">
          <button class="btn" type="button" data-act="prev">◀ 上一步</button>
          <button class="btn primary" type="button" data-act="play">▶ 播放</button>
          <button class="btn" type="button" data-act="next">下一步 ▶</button>
          <span class="step-count">1 / 1</span>
          <div class="dots"></div>
          <label class="speed">速度
            <select data-act="speed" aria-label="播放速度">
              <option value="0.75">0.75×</option>
              <option value="1" selected>1×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>
          </label>
        </div>
      </article>`;
  }

  function renderCard(card) {
    const panel = document.createElement("section");
    panel.className = "card-panel";
    panel.id = `panel-${card.id}`;
    panel.dataset.panel = card.id;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `tab-${card.id}`);
    panel.innerHTML = `
      <div class="card-hero" style="--accent-card:${card.color}">
        <div class="card-no">概念卡 ${card.num} · ${card.kicker}</div>
        <h2>${card.title}</h2>
        <p>${card.intro}</p>
        <div class="chips">${card.chips.map((c, i) => `<span class="chip${i === 0 ? " key" : ""}">${c}</span>`).join("")}</div>
      </div>

      <section class="sec">
        <div class="sec-head"><span class="sec-num">A</span><h3>看动画，记画面</h3></div>
        <p class="sec-desc">每段不超过 1 分钟。可以暂停、上一步、下一步；底部大字幕就是这一帧要记的话。</p>
        <div class="anim-list">${card.anims.map(animHTML).join("")}</div>
      </section>

      <section class="sec">
        <div class="sec-head"><span class="sec-num">B</span><h3>容易混淆的点</h3></div>
        <p class="sec-desc">先看两边的概念，再看下面的对错句。✓ / ✗ 图标和边框样式同时区分，不只靠颜色。</p>
        ${compareHTML(card.compare)}
      </section>

      <section class="sec">
        <div class="sec-head"><span class="sec-num">C</span><h3>一句口诀</h3></div>
        <div class="mnemonic">
          <span class="mn-label">考前默念</span>
          <p>${card.mnemonic}</p>
          ${card.mnNote ? `<span class="mn-note">${card.mnNote}</span>` : ""}
        </div>
      </section>

      <section class="sec">
        <div class="sec-head"><span class="sec-num">D</span><h3>真题小测</h3></div>
        <p class="sec-desc">选完立刻判对错。答错会自动滚到对应动画并回放，底部提示条保留理由和“回到小测”。</p>
        <div class="quiz-host"></div>
      </section>`;
    mainEl.appendChild(panel);

    card.anims.forEach(a => {
      const root = panel.querySelector(`#anim-${a.id}`);
      players.set(a.id, new Player(a, root));
    });

    const qHost = panel.querySelector(".quiz-host");
    const cardQuestions = card.quiz.map(id => QMAP[id]).filter(Boolean);
    mountQuiz(qHost, cardQuestions, {
      cardId: card.id,
      onWrong: q => replayForQuestion(q, qHost)
    });
  }

  /* ---------------- 卡片小测 ---------------- */
  function optionButtons(q, disabled = false) {
    if (q.parts) {
      return q.parts.map((p, pi) => `
        <div class="subq" data-part="${pi}">
          <div class="subq-label">${p.label}</div>
          <div class="opts">
            ${p.opts.map((o, i) => `
              <button class="opt" type="button" data-part-opt="${pi}" data-i="${i}" ${disabled ? "disabled" : ""}>
                <span class="key">${LETTERS[i]}</span><span class="opt-t">${o}</span><span class="mark"></span>
              </button>`).join("")}
          </div>
        </div>`).join("");
    }
    return `<div class="opts">${q.opts.map((o, i) => `
      <button class="opt" type="button" data-i="${i}" ${disabled ? "disabled" : ""}>
        <span class="key">${LETTERS[i]}</span><span class="opt-t">${o}</span><span class="mark"></span>
      </button>`).join("")}</div>`;
  }

  function mountQuiz(host, questions, opts = {}) {
    let index = 0, answered = false, score = 0, partChoices = [];

    function render() {
      answered = false;
      partChoices = [];
      score = 0;
      renderQuestion();
    }

    function renderQuestion() {
      const q = questions[index];
      answered = false;
      partChoices = [];
      host.innerHTML = `
        <div class="quiz">
          <div class="quiz-meta">
            <span class="q-no">第 ${index + 1} / ${questions.length} 题</span>
            <span class="q-src">${q.src || "真题"}</span>
          </div>
          <div class="q-text">${q.q}</div>
          <div class="q-body">${optionButtons(q)}</div>
          <div class="feedback" aria-live="polite" hidden></div>
          <div class="quiz-foot">
            <button class="btn primary" type="button" data-next hidden>${index === questions.length - 1 ? "看本卡成绩" : "下一题"} →</button>
            <button class="btn ghost" type="button" data-retry hidden>重做本卡</button>
          </div>
        </div>`;
    }

    host.addEventListener("click", e => {
      const next = e.target.closest("[data-next]");
      const retry = e.target.closest("[data-retry]");
      if (next) {
        if (index < questions.length - 1) { index++; renderQuestion(); }
        else renderResult();
        return;
      }
      if (retry) { index = 0; score = 0; renderQuestion(); return; }

      const opt = e.target.closest(".opt");
      if (!opt || answered) return;
      const q = questions[index];
      if (q.parts) {
        const pi = Number(opt.dataset.partOpt);
        partChoices[pi] = Number(opt.dataset.i);
        $$(`.opt[data-part-opt="${pi}"]`, host).forEach(b => {
          b.classList.toggle("picked", Number(b.dataset.i) === partChoices[pi]);
        });
        if (q.parts.every((_, i) => Number.isInteger(partChoices[i]))) {
          finish(q, partChoices.slice());
        }
      } else {
        finish(q, Number(opt.dataset.i));
      }
    });

    function finish(q, choice) {
      answered = true;
      const ok = q.parts
        ? q.parts.every((p, i) => choice[i] === p.a)
        : choice === q.a;
      if (ok) score++;

      const allOpts = $$(".opt", host);
      allOpts.forEach(b => {
        b.classList.add("locked");
        b.disabled = true;
        if (q.parts) {
          const pi = Number(b.dataset.partOpt);
          const i = Number(b.dataset.i);
          if (choice[pi] === i) b.classList.add("picked");
          if (q.parts[pi].a === i) {
            b.classList.add("correct");
            b.querySelector(".mark").textContent = "✓";
          } else if (choice[pi] === i) {
            b.classList.add("wrong");
            b.querySelector(".mark").textContent = "✗";
          } else {
            b.classList.add("dim");
          }
        } else {
          const i = Number(b.dataset.i);
          if (q.a === i) {
            b.classList.add("correct");
            b.querySelector(".mark").textContent = "✓";
          } else if (choice === i) {
            b.classList.add("wrong");
            b.querySelector(".mark").textContent = "✗";
          } else {
            b.classList.add("dim");
          }
        }
      });

      const fb = $(".feedback", host);
      fb.hidden = false;
      fb.className = `feedback ${ok ? "ok" : "bad"}`;
      fb.innerHTML = `
        <strong>${ok ? "✓ 答对了" : "✗ 答错了"}</strong>
        <p>${ok ? "" : `<span class="ans">正确答案：${correctText(q)}。</span>`}${q.why || ""}</p>`;
      $("[data-next]", host).hidden = false;

      if (!ok && typeof opts.onWrong === "function") opts.onWrong(q);
    }

    function renderResult() {
      const total = questions.length;
      const pct = Math.round(score / total * 100);
      const wrong = total - score;
      host.innerHTML = `
        <div class="quiz">
          <div class="quiz-score">
            <div class="score-big">${score}<small> / ${total}</small></div>
            <div style="flex:1;min-width:170px">
              <h4>${score === total ? "本卡全对，可以过" : wrong <= 1 ? "差一点，回看错题对应的动画" : "先回看动画，再重做一遍"}</h4>
              <p>正确率 ${pct}% · ${wrong ? `答错 ${wrong} 题，已自动回放过对应动画` : "没有错题"}。</p>
            </div>
            <button class="btn primary" type="button" data-retry>重做本卡</button>
            <button class="btn" type="button" data-goto-test>去综合自测 →</button>
          </div>
        </div>`;
      host.querySelector("[data-retry]").addEventListener("click", () => { index = 0; score = 0; renderQuestion(); });
      host.querySelector("[data-goto-test]").addEventListener("click", () => showTab("p7"));
    }

    renderQuestion();
  }

  /* ---------------- 自动回放 + 提示条 ---------------- */
  function gotoAnim(animId) {
    const cardId = "p" + animId.slice(1, 2);
    showTab(cardId, { keepScroll: true });
    const node = document.getElementById("anim-" + animId);
    const p = players.get(animId);
    if (!node || !p) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      if (activeTab !== cardId) return;
      p.seek(0);
      p.play();
    }, 420);
  }

  function replayForQuestion(q, returnEl) {
    if (!q.anim || !players.has(q.anim)) return;
    const p = players.get(q.anim);
    const node = document.getElementById("anim-" + q.anim);
    if (!node) return;
    const tabId = "p" + q.anim.slice(1, 2);
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      if (activeTab !== tabId) return;
      p.seek(0);
      p.play();
    }, 420);
    showToast(
      `答错了 · 正在回放「${p.anim.title}」`,
      q.why || correctText(q),
      returnEl
    );
  }

  const toast = $("#toast");
  function showToast(title, text, returnEl) {
    $("#toastTitle").textContent = title;
    $("#toastText").textContent = text;
    $("#toastIco").textContent = "✗";
    $("#toastBack").hidden = !returnEl;
    $("#toastBack").onclick = () => {
      toast.hidden = true;
      if (returnEl) returnEl.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 15000);
  }
  $("#toastClose").addEventListener("click", () => { toast.hidden = true; });

  /* ---------------- 综合自测 ---------------- */
  function questionMarkup(q, disabled = false) {
    return optionButtons(q, disabled);
  }

  function mountTest(host) {
    let session = null;

    function categoryCounts() {
      const map = new Map();
      ALLQ.forEach(q => map.set(q.src, (map.get(q.src) || 0) + 1));
      return Array.from(map.entries()).map(([k, v]) => `<span>${k} · ${v} 题</span>`).join("");
    }

    function intro() {
      host.innerHTML = `
        <div class="test-shell">
          <div class="test-top">
            <h3>综合自测</h3>
            <div class="test-stats"><span class="stat">共 <b>${ALLQ.length}</b> 题</span><span class="stat">随机顺序</span><span class="stat">答错收集</span></div>
          </div>
          <p style="color:var(--ink2);font-size:14px;margin:10px 0 0">
            题库按原文顺序共 <b>${ALLQ.length}</b> 题（原文标注“31 题”，实际列出 36 条）。每次开始都会重新洗牌；
            每题作答后显示出处和一句理由。综合自测里答错不会强制跳页，可点“看相关动画”回放。
          </p>
          <div class="test-cats">${categoryCounts()}</div>
          <div class="quiz-foot" style="margin-top:18px">
            <button class="btn primary" type="button" data-start>开始自测 →</button>
            <button class="btn ghost" type="button" data-wrong-start hidden>只练上次错题</button>
          </div>
        </div>`;
      const lastWrong = loadWrongIds();
      const btn = host.querySelector("[data-wrong-start]");
      if (lastWrong.length) {
        btn.hidden = false;
        btn.textContent = `只练上次错题（${lastWrong.length}）`;
        btn.onclick = () => start(ALLQ.filter(q => lastWrong.includes(q.id)), "wrong", new Set(lastWrong));
      }
      host.querySelector("[data-start]").onclick = () => start(ALLQ, "all", new Set(loadWrongIds()));
    }

    function start(pool, mode, wrongSet) {
      if (!pool.length) { intro(); return; }
      session = {
        pool: shuffle(pool),
        idx: 0,
        answers: [],
        wrong: new Set(wrongSet),
        partChoices: [],
        mode
      };
      renderQuestion();
    }

    function renderQuestion() {
      const q = session.pool[session.idx];
      session.partChoices = [];
      const pct = Math.round(session.idx / session.pool.length * 100);
      host.innerHTML = `
        <div class="test-shell test-question">
          <div class="test-top">
            <h3>${session.mode === "wrong" ? "只练错题" : "综合自测"}</h3>
            <div class="test-stats">
              <span class="stat">第 <b>${session.idx + 1}</b> / ${session.pool.length} 题</span>
              <span class="stat">已对 <b>${session.answers.filter(a => a.ok).length}</b></span>
              <span class="stat">错题 <b>${session.answers.filter(a => !a.ok).length}</b></span>
            </div>
          </div>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <div class="quiz-meta">
            <span class="q-no">${session.mode === "wrong" ? "错题重练" : "随机顺序"}</span>
            <span class="q-src">出处：${q.src}</span>
          </div>
          <div class="q-text">${q.q}</div>
          <div class="q-body">${questionMarkup(q)}</div>
          <div class="feedback" aria-live="polite" hidden></div>
          <div class="quiz-foot">
            <button class="btn primary" type="button" data-next hidden>${session.idx === session.pool.length - 1 ? "看结果" : "下一题"} →</button>
            <button class="btn ghost" type="button" data-quit>结束本轮</button>
          </div>
        </div>`;
    }

    host.addEventListener("click", e => {
      const next = e.target.closest("[data-next]");
      if (next) {
        if (session.idx < session.pool.length - 1) { session.idx++; renderQuestion(); }
        else renderResult();
        return;
      }
      const quit = e.target.closest("[data-quit]");
      if (quit) { if (session && session.answers.length) renderResult(); else intro(); return; }
      const replay = e.target.closest("[data-replay]");
      if (replay) { gotoAnim(replay.dataset.replay); return; }

      const opt = e.target.closest(".opt");
      if (!opt || !session) return;
      const q = session.pool[session.idx];
      if (host.querySelector(".feedback:not([hidden])")) return;

      if (q.parts) {
        if (opt.dataset.partOpt === undefined) return;
        session.partChoices[Number(opt.dataset.partOpt)] = Number(opt.dataset.i);
        $$(`.opt[data-part-opt="${opt.dataset.partOpt}"]`, host).forEach(b => {
          b.classList.toggle("picked", Number(b.dataset.i) === Number(opt.dataset.i));
        });
        if (q.parts.every((_, i) => Number.isInteger(session.partChoices[i]))) {
          finishTestQuestion(q, session.partChoices.slice());
          session.partChoices = [];
        }
      } else {
        if (opt.dataset.partOpt !== undefined) return;
        finishTestQuestion(q, Number(opt.dataset.i));
      }
    });

    function finishTestQuestion(q, choice) {
      const ok = q.parts
        ? q.parts.every((p, i) => choice[i] === p.a)
        : choice === q.a;
      session.answers.push({ q, ok, choice });
      if (ok) session.wrong.delete(q.id);
      else session.wrong.add(q.id);
      saveWrongIds(Array.from(session.wrong));

      const opts = $$(".opt", host);
      opts.forEach(b => {
        b.classList.add("locked");
        b.disabled = true;
        const i = Number(b.dataset.i);
        if (q.parts) {
          const pi = Number(b.dataset.partOpt);
          if (choice[pi] === i) b.classList.add("picked");
          if (q.parts[pi].a === i) {
            b.classList.add("correct"); b.querySelector(".mark").textContent = "✓";
          } else if (choice[pi] === i) {
            b.classList.add("wrong"); b.querySelector(".mark").textContent = "✗";
          } else b.classList.add("dim");
        } else {
          if (q.a === i) {
            b.classList.add("correct"); b.querySelector(".mark").textContent = "✓";
          } else if (choice === i) {
            b.classList.add("wrong"); b.querySelector(".mark").textContent = "✗";
          } else b.classList.add("dim");
        }
      });

      const fb = host.querySelector(".feedback");
      fb.hidden = false;
      fb.className = `feedback ${ok ? "ok" : "bad"}`;
      fb.innerHTML = `
        <strong>${ok ? "✓ 答对了" : "✗ 答错了"}</strong>
        <p>${ok ? "" : `<span class="ans">正确答案：${correctText(q)}。</span>`}${q.why || ""}</p>
        ${q.anim ? `<div style="margin-top:7px"><button class="btn small" type="button" data-replay="${q.anim}">看相关动画 →</button></div>` : ""}`;
      host.querySelector("[data-next]").hidden = false;
    }

    function renderResult() {
      const total = session.answers.length;
      const right = session.answers.filter(a => a.ok).length;
      const wrong = session.answers.filter(a => !a.ok);
      const pct = total ? Math.round(right / total * 100) : 0;
      const wrongIds = Array.from(session.wrong);
      host.innerHTML = `
        <div class="test-shell test-result">
          <div class="test-top">
            <h3>本轮结果</h3>
            <div class="test-stats">
              <span class="stat">作答 <b>${total}</b> / ${session.pool.length}</span>
              <span class="stat">错题累计 <b>${wrongIds.length}</b></span>
            </div>
          </div>
          <div class="result-hero">
            <div class="result-score">${right}<small> / ${total || session.pool.length}</small></div>
            <div class="result-copy">
              <h3>${total === 0 ? "本轮未作答" : pct === 100 ? "全对，可以上考场了" : pct >= 85 ? "及格稳了，再扫一遍错题" : pct >= 60 ? "及格线附近，错题要回看" : "先回看概念卡，再来一轮"}</h3>
              <p>正确率 ${pct}% · ${wrong.length ? "错的题已经收进“错题本”，可以只练错题。" : "本轮没有错题。"}</p>
            </div>
          </div>
          ${wrong.length ? `
            <h4 style="margin:6px 0 0;font-size:16px">本轮错题</h4>
            <div class="wrong-list">
              ${wrong.map(({ q, choice }) => `
                <div class="wrong-item">
                  <div class="wi-top">
                    <span class="wi-src">${q.src}</span>
                    ${q.anim ? `<button class="btn small" type="button" data-replay="${q.anim}">看动画</button>` : ""}
                  </div>
                  <div class="wi-q">${q.q}</div>
                  <div class="wi-a">你的答案：<span class="wi-b">${chosenText(q, choice)}</span><br>正确答案：<b>${correctText(q)}</b><br>${q.why || ""}</div>
                </div>`).join("")}
            </div>` : `<div class="test-empty"><div class="big">✓</div><b>本轮没有错题</b><div style="font-size:13px;margin-top:3px">可以重新洗牌，或去各概念卡巩固动画。</div></div>`}
          <div class="quiz-foot" style="margin-top:16px">
            ${wrongIds.length ? `<button class="btn primary" type="button" data-practice-wrong>只练错题（${wrongIds.length}）→</button>` : ""}
            <button class="btn" type="button" data-restart>重新洗牌全部</button>
            <button class="btn ghost" type="button" data-home>回到自测首页</button>
          </div>
        </div>`;

      const practice = host.querySelector("[data-practice-wrong]");
      if (practice) practice.onclick = () => {
        const pool = ALLQ.filter(q => wrongIds.includes(q.id));
        start(pool, "wrong", new Set(wrongIds));
      };
      host.querySelector("[data-restart]").onclick = () => start(ALLQ, "all", new Set(wrongIds));
      host.querySelector("[data-home]").onclick = () => intro();
    }

    intro();
  }

  const WRONG_KEY = "os-wrong-ids";
  function loadWrongIds() {
    try {
      const v = JSON.parse(localStorage.getItem(WRONG_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function saveWrongIds(ids) {
    try { localStorage.setItem(WRONG_KEY, JSON.stringify(ids)); } catch (e) {}
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    initTheme();
    buildTabs();
    CARDS.forEach(renderCard);
    // p7 由自定义面板渲染
    const panel = document.createElement("section");
    panel.className = "card-panel";
    panel.id = "panel-p7";
    panel.dataset.panel = "p7";
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", "tab-p7");
    panel.innerHTML = `
      <div class="card-hero" style="--accent-card:var(--c-run)">
        <div class="card-no">概念卡 ⑦ · 混合自测</div>
        <h2>综合自测</h2>
        <p>36 道题随机顺序。选择、判断、填空式选择都有；作答后立刻显示对错、出处和一句理由。答错的题会单独收集，可以只练错题。</p>
        <div class="chips"><span class="chip key">随机顺序</span><span class="chip">答错收集</span><span class="chip">只练错题</span><span class="chip">即时理由</span></div>
      </div>
      <section class="sec">
        <div class="sec-head"><span class="sec-num">A</span><h3>开始测</h3></div>
        <p class="sec-desc">题库覆盖进程/线程、死锁、调度/同步、内存、I/O、文件。原文没有 OS 概述的题库条目，所以这一页不含 OS 概述题，详见交付说明。</p>
        <div class="test-host"></div>
      </section>`;
    mainEl.appendChild(panel);
    mountTest(panel.querySelector(".test-host"));

    $$(".card-panel", mainEl).forEach(p => p.classList.remove("active"));
    const hash = (location.hash || "").replace("#", "");
    showTab(hash === "p7" || CARDS.some(c => c.id === hash) ? hash : "p1");
  }

  init();
})();

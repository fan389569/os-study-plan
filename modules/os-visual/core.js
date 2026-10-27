/* 页面公共工具 + 播放器 */
window.OSApp = (function () {
  'use strict';

  var E = window.OSEngine;

  var PALETTE = ['#3b6df6', '#e07b2a', '#1a9d67', '#8b5cf6', '#d94f70', '#0e93a3', '#b28b00'];

  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined && html !== null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function num(n, digits) {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    var d = digits === undefined ? 2 : digits;
    var p = Math.pow(10, d);
    var r = Math.round(n * p) / p;
    return String(r);
  }

  function pct(a, b) {
    return (a / b * 100) + '%';
  }

  function colorMap(jobs) {
    var map = {};
    jobs.forEach(function (j, i) {
      map[j.id] = PALETTE[i % PALETTE.length];
    });
    return map;
  }

  function jobChips(jobs, colors) {
    var wrap = h('div', 'job-chips');
    jobs.forEach(function (j, i) {
      var c = colors ? colors[j.id] : PALETTE[i % PALETTE.length];
      var chip = h('div', 'job-chip');
      chip.style.setProperty('--c', c);
      chip.innerHTML =
        '<span class="id">' + esc(j.id) + '</span>' +
        '<span class="vals"><b>' + esc(j.id) + '</b><small>到达 ' + j.arrival + ' · 运行 ' + j.burst + ' ms</small></span>';
      wrap.appendChild(chip);
    });
    return wrap;
  }

  function legend(jobs, colors) {
    var wrap = h('div', 'legend');
    jobs.forEach(function (j, i) {
      var c = colors ? colors[j.id] : PALETTE[i % PALETTE.length];
      var s = h('span', '', '<i style="background:' + c + '"></i>' + esc(j.id));
      wrap.appendChild(s);
    });
    return wrap;
  }

  /* 甘特图：时间轴严格按比例 */
  function gantt(opts) {
    var total = opts.total;
    var upto = opts.upto === undefined || opts.upto === null ? total : opts.upto;
    var colors = opts.colors || {};
    var now = opts.now;
    var preempts = opts.preempts || [];
    var compact = !!opts.compact;

    var wrap = h('div', 'gantt-scroll');
    var g = h('div', 'gantt');
    g.style.minWidth = Math.max(compact ? 460 : 560, Math.round(total * 32)) + 'px';

    var marks = h('div', 'gantt-marks');
    var lane = h('div', 'gantt-lane');
    var axis = h('div', 'gantt-axis');

    var visible = [];
    (opts.segments || []).forEach(function (s) {
      if (s.start >= upto) return;
      var end = Math.min(s.end, upto);
      if (end <= s.start) return;
      visible.push({ id: s.id, start: s.start, end: end, realEnd: s.end });
    });

    visible.forEach(function (s) {
      var w = (s.end - s.start) / total * 100;
      var bar = h('div', 'gbar');
      bar.style.left = pct(s.start, total);
      bar.style.width = w + '%';
      bar.style.background = colors[s.id] || PALETTE[0];
      if (w < 3.2) bar.classList.add('tiny-bar');
      else bar.textContent = s.id;
      if (now !== null && now !== undefined && s.start <= now && now < s.realEnd) {
        bar.classList.add('current');
      }
      lane.appendChild(bar);

      if (w < 3.2) {
        var tag = h('span', 'gbar-tag', esc(s.id));
        tag.style.left = ((s.start + s.end) / 2 / total * 100) + '%';
        marks.appendChild(tag);
      }
    });

    preempts.forEach(function (t) {
      if (t > upto) return;
      var m = h('div', 'gantt-preempt');
      m.style.left = pct(t, total);
      m.innerHTML = '<span class="bolt">▲</span><span class="tag">抢占</span>';
      marks.appendChild(m);
    });

    if (now !== null && now !== undefined) {
      var line = h('div', 'gantt-now');
      line.style.left = pct(now, total);
      lane.appendChild(line);
      var lab = h('div', 'gantt-now-label', 't=' + now);
      lab.style.left = pct(now, total);
      marks.appendChild(lab);
    }

    var markSet = { 0: true };
    markSet[total] = true;
    (opts.segments || []).forEach(function (s) {
      if (s.start <= total) markSet[s.start] = true;
      if (s.end <= total) markSet[s.end] = true;
    });
    Object.keys(markSet).map(Number).sort(function (a, b) { return a - b; }).forEach(function (t) {
      var tick = h('span', 'tick', String(t));
      tick.style.left = pct(t, total);
      if (t === total) tick.classList.add('last');
      if (t === 0) tick.classList.add('first');
      axis.appendChild(tick);
    });

    g.appendChild(marks);
    g.appendChild(lane);
    g.appendChild(axis);
    wrap.appendChild(g);

    var outer = h('div', 'gantt-outer');
    outer.appendChild(wrap);
    outer.appendChild(h('div', 'scroll-hint', '← 左右滑动查看完整时间轴 →'));
    return outer;
  }

  function ganttBlock(opts) {
    var box = h('div', 'stack-10');
    if (opts.title) {
      var head = h('div', 'row tight');
      head.innerHTML = '<b style="font-size:14px">' + esc(opts.title) + '</b>' +
        (opts.tag ? '<span class="chip accent">' + esc(opts.tag) + '</span>' : '');
      box.appendChild(head);
    }
    box.appendChild(gantt(opts));
    if (opts.jobs) box.appendChild(legend(opts.jobs, opts.colors));
    return box;
  }

  function metricsTable(res, opts) {
    opts = opts || {};
    var colors = opts.colors || {};
    var wrap = h('div', 'table-wrap');
    var table = h('table', 'data-table');
    table.innerHTML =
      '<thead><tr><th>进程</th><th>到达</th><th>运行</th><th>完成</th><th>周转</th><th>带权周转</th><th>等待</th></tr></thead>';
    var tbody = h('tbody');
    res.rows.forEach(function (r) {
      var tr = h('tr');
      var c = colors[r.id] || 'var(--accent)';
      tr.innerHTML =
        '<td class="id-cell"><span class="pdot" style="background:' + c + '"></span>' + esc(r.id) + '</td>' +
        '<td>' + r.arrival + '</td>' +
        '<td>' + r.burst + '</td>' +
        '<td>' + r.completion + '</td>' +
        '<td><b>' + r.turnaround + '</b></td>' +
        '<td>' + num(r.weighted, 3) + '</td>' +
        '<td>' + r.waiting + '</td>';
      tbody.appendChild(tr);
    });
    var avg = h('tr', 'avg-row');
    avg.innerHTML =
      '<td colspan="4">平均</td>' +
      '<td>' + num(res.avgTurnaround, 2) + '</td>' +
      '<td>' + num(res.avgWeighted, 3) + '</td>' +
      '<td>' + num(res.avgWaiting, 2) + '</td>';
    tbody.appendChild(avg);
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function statCards(res, opts) {
    opts = opts || {};
    var wrap = h('div', 'stats');
    function card(k, v, u, cls) {
      var d = h('div', 'stat' + (cls ? ' ' + cls : ''));
      d.innerHTML = '<div class="k">' + k + '</div><div class="v">' + v + '</div><div class="u">' + u + '</div>';
      return d;
    }
    wrap.appendChild(card('平均周转时间', num(res.avgTurnaround, 2), 'ms', opts.highlight === 'tat' ? 'ok' : ''));
    wrap.appendChild(card('平均带权周转', num(res.avgWeighted, 3), '', opts.highlight === 'wt' ? 'ok' : ''));
    wrap.appendChild(card('平均等待时间', num(res.avgWaiting, 2), 'ms', ''));
    return wrap;
  }

  function codeBlock(lines, activeLines, title) {
    var box = h('div', 'stack-10');
    if (title) box.appendChild(h('div', 'code-title', esc(title)));
    var pre = h('div', 'code');
    var active = activeLines || [];
    lines.forEach(function (line, i) {
      var d = h('div', 'code-line');
      d.innerHTML = line === '' ? '&nbsp;' : esc(line);
      if (active.indexOf(i + 1) !== -1) d.classList.add('active');
      pre.appendChild(d);
    });
    box.appendChild(pre);
    return box;
  }

  function term(title, text) {
    var d = h('div', 'term');
    d.innerHTML = '<b>' + esc(title) + '</b>　' + text;
    return d;
  }

  function box(kind, html) {
    return h('div', kind + '-box', html);
  }

  function pill(text, cls) {
    return h('span', 'chip' + (cls ? ' ' + cls : ''), text);
  }

  function fmtMs(n) {
    return n + ' ms';
  }

  var Player = function (root, scenes, opts) {
    this.root = root;
    this.scenes = scenes;
    this.opts = opts || {};
    this.i = 0;
    this.step = 0;
    this.speed = 1;
    this.playing = false;
    this.timer = null;
    this.steps = [];
    this.scene = null;
    this.built = null;
    this.buildUI();
    this.load(0, { autoplay: true });
  };

  Player.prototype.buildUI = function () {
    var self = this;
    this.root.innerHTML =
      '<div class="scene-nav" role="tablist" aria-label="场景"></div>' +
      '<div class="stage">' +
        '<div class="stage-head">' +
          '<div><span class="scene-kicker"></span><h2></h2></div>' +
          '<span class="step-count">1 / 1</span>' +
        '</div>' +
        '<div class="stage-body"></div>' +
        '<div class="subtitle"><span class="sub-text"></span></div>' +
      '</div>' +
      '<div class="progress"><span></span></div>' +
      '<div class="controls">' +
        '<button type="button" class="btn prev">◀ 上一步</button>' +
        '<button type="button" class="btn primary play">暂停</button>' +
        '<button type="button" class="btn next">下一步 ▶</button>' +
        '<div class="speed" role="group" aria-label="播放速度">' +
          '<button type="button" data-speed="0.5" aria-pressed="false">0.5×</button>' +
          '<button type="button" data-speed="1" class="active" aria-pressed="true">1×</button>' +
          '<button type="button" data-speed="2" aria-pressed="false">2×</button>' +
        '</div>' +
        '<label class="jump">场景跳转 <select aria-label="场景跳转"></select></label>' +
      '</div>';

    this.nav = this.root.querySelector('.scene-nav');
    this.bodyEl = this.root.querySelector('.stage-body');
    this.kickerEl = this.root.querySelector('.scene-kicker');
    this.titleEl = this.root.querySelector('.stage-head h2');
    this.countEl = this.root.querySelector('.step-count');
    this.subEl = this.root.querySelector('.sub-text');
    this.progressEl = this.root.querySelector('.progress span');
    this.playBtn = this.root.querySelector('.play');
    this.selectEl = this.root.querySelector('.jump select');

    this.scenes.forEach(function (sc, idx) {
      var b = h('button', 'scene-chip');
      b.type = 'button';
      b.innerHTML = '<b>' + esc(sc.id) + '</b>' + esc(sc.short || sc.title);
      b.addEventListener('click', function () { self.load(idx, { autoplay: true }); });
      self.nav.appendChild(b);

      var opt = h('option', '', esc(sc.id + '  ' + sc.title));
      opt.value = String(idx);
      self.selectEl.appendChild(opt);
    });

    this.root.querySelector('.prev').addEventListener('click', function () { self.prev(); });
    this.root.querySelector('.next').addEventListener('click', function () { self.next(); });
    this.playBtn.addEventListener('click', function () {
      if (self.playing) self.pause();
      else self.play();
    });
    this.root.querySelectorAll('.speed button').forEach(function (b) {
      b.addEventListener('click', function () { self.setSpeed(parseFloat(b.dataset.speed)); });
    });
    this.selectEl.addEventListener('change', function () {
      self.load(parseInt(self.selectEl.value, 10), { autoplay: true });
    });
  };

  Player.prototype.load = function (idx, options) {
    options = options || {};
    this.pause();
    this.i = idx;
    this.scene = this.scenes[idx];
    this.step = 0;
    this.bodyEl.innerHTML = '';
    this.built = this.scene.build(this.bodyEl, this);
    this.steps = this.built.steps;

    this.kickerEl.textContent = '场景 ' + this.scene.id;
    this.titleEl.textContent = this.scene.title;
    this.selectEl.value = String(idx);
    Array.prototype.forEach.call(this.nav.children, function (chip, ci) {
      chip.classList.toggle('active', ci === idx);
    });
    var activeChip = this.nav.children[idx];
    if (activeChip && activeChip.scrollIntoView) {
      try { activeChip.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
    }

    this.draw();
    if (options.autoplay) this.play();
    else this.pause();
  };

  Player.prototype.draw = function () {
    var st = this.steps[this.step];
    if (!st) return;
    st.draw();
    if (this.subEl.textContent !== st.sub) {
      this.subEl.textContent = st.sub || '';
      if (this.subEl.animate) {
        this.subEl.animate(
          [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }],
          { duration: 300, easing: 'ease-out' }
        );
      }
    }
    this.countEl.textContent = (this.step + 1) + ' / ' + this.steps.length;
    this.progressEl.style.width = ((this.step + 1) / this.steps.length * 100) + '%';
    this.updatePlayBtn();
  };

  Player.prototype.play = function () {
    if (this.step >= this.steps.length - 1) {
      this.step = 0;
      this.draw();
    }
    this.playing = true;
    this.updatePlayBtn();
    this.schedule();
  };

  Player.prototype.schedule = function () {
    var self = this;
    clearTimeout(this.timer);
    if (!this.playing) return;
    var st = this.steps[this.step];
    var base = (st && st.duration) || this.opts.baseDuration || 5000;
    var dur = base / this.speed;
    this.timer = setTimeout(function () {
      if (!self.playing) return;
      if (self.step < self.steps.length - 1) {
        self.step += 1;
        self.draw();
        self.schedule();
      } else {
        self.playing = false;
        self.updatePlayBtn();
      }
    }, dur);
  };

  Player.prototype.pause = function () {
    this.playing = false;
    clearTimeout(this.timer);
    this.updatePlayBtn();
  };

  Player.prototype.updatePlayBtn = function () {
    if (this.playBtn) this.playBtn.textContent = this.playing ? '暂停' : '播放';
  };

  Player.prototype.prev = function () {
    this.pause();
    if (this.step > 0) {
      this.step -= 1;
      this.draw();
      return;
    }
    if (this.i > 0) {
      this.load(this.i - 1, { autoplay: false });
      this.step = this.steps.length - 1;
      this.draw();
    }
  };

  Player.prototype.next = function () {
    this.pause();
    if (this.step < this.steps.length - 1) {
      this.step += 1;
      this.draw();
      return;
    }
    if (this.i < this.scenes.length - 1) {
      this.load(this.i + 1, { autoplay: true });
    }
  };

  Player.prototype.setSpeed = function (speed) {
    this.speed = speed;
    var btns = this.root.querySelectorAll('.speed button');
    Array.prototype.forEach.call(btns, function (b) {
      var on = parseFloat(b.dataset.speed) === speed;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (this.playing) this.schedule();
  };

  Player.prototype.resumeIfVisible = function () {
    if (!this.playing) {
      this.playing = true;
      this.updatePlayBtn();
      this.schedule();
    }
  };

  return {
    E: E,
    PALETTE: PALETTE,
    h: h,
    esc: esc,
    num: num,
    pct: pct,
    colorMap: colorMap,
    jobChips: jobChips,
    legend: legend,
    gantt: gantt,
    ganttBlock: ganttBlock,
    metricsTable: metricsTable,
    statCards: statCards,
    codeBlock: codeBlock,
    term: term,
    box: box,
    pill: pill,
    fmtMs: fmtMs,
    Player: Player
  };
})();

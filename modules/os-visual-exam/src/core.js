/* 页面基础组件：格式化、SVG/HTML 小部件、场景播放器 */
(function (global) {
  'use strict';

  var OS = global.OS;
  var D = OS.build();
  global.DATA = D;

  /* ---------- 格式化 ---------- */
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function fmt1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function fmt2(n) { return (Math.round(n * 100) / 100).toFixed(2); }
  function hex(n) { return Number(n).toString(16).toUpperCase(); }
  function pad(s, n) { return String(s).padStart(n, '0'); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function group4(bin) { return bin.replace(/(.{4})/g, '$1 ').trim(); }
  function shortName(name) {
    return name.indexOf('作业') === 0 ? '作' + name.slice(2) : name;
  }
  function pct(n, total) { return (n / total) * 100; }
  function sup(n) {
    var map = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return String(n).split('').map(function (d) { return map[Number(d)]; }).join('');
  }

  /* ---------- 静态小部件 ---------- */

  function sceneHead(kicker, title, note) {
    return '<div class="scene-head">' +
      '<div class="kicker">' + kicker + '</div>' +
      '<h3>' + title + '</h3>' +
      (note ? '<p class="scene-note">' + note + '</p>' : '') +
      '</div>';
  }

  function card(title, body, cls) {
    return '<section class="card ' + (cls || '') + '">' +
      (title ? '<div class="card-title">' + title + '</div>' : '') +
      '<div class="card-body">' + body + '</div></section>';
  }

  function callout(kind, title, body) {
    return '<div class="callout ' + kind + '">' +
      '<div class="callout-title">' + title + '</div>' +
      '<div class="callout-body">' + body + '</div></div>';
  }

  function formula(html, cls) {
    return '<div class="formula ' + (cls || '') + '">' + html + '</div>';
  }

  function legend(items) {
    return '<div class="legend">' + items.map(function (it) {
      return '<span class="lg"><i class="sw ' + it.cls + '"></i>' + it.label + '</span>';
    }).join('') + '</div>';
  }

  function tag(text, cls) {
    return '<span class="tag ' + (cls || '') + '">' + text + '</span>';
  }

  /* 位串条：把地址按字段切开 */
  function bitBar(groups, opts) {
    opts = opts || {};
    var total = groups.reduce(function (s, g) { return s + g.bits; }, 0);
    var html = '<div class="bitbar ' + (opts.cls || '') + '">';
    groups.forEach(function (g) {
      html += '<div class="bit-group ' + (g.cls || '') + '" style="flex:' + g.bits + ' 1 0">';
      html += '<div class="bit-label">' + g.label + '</div>';
      html += '<div class="bit-cells">';
      for (var i = 0; i < g.bits; i++) {
        var v = g.value ? g.value.charAt(i) : '';
        html += '<span class="bit ' + (g.cls || '') + '">' + (v || '&nbsp;') + '</span>';
      }
      html += '</div>';
      html += '<div class="bit-width">' + g.bits + ' 位</div>';
      html += '</div>';
    });
    html += '</div>';
    if (opts.foot) html += '<div class="bit-foot">' + opts.foot + '</div>';
    return html;
  }

  /* 内存条：free/alloc 状态来自模拟结果 */
  function memStrip(mem, free, alloc, opts) {
    opts = opts || {};
    var segs = [];
    alloc.forEach(function (a) {
      segs.push({ kind: 'alloc', name: a.name, start: a.start, size: a.size });
    });
    free.forEach(function (f) {
      segs.push({ kind: 'free', name: '空闲', start: f.start, size: f.size });
    });
    segs.sort(function (a, b) { return a.start - b.start; });

    var ticks = [0, 0.25, 0.5, 0.75, 1].map(function (r) {
      var v = Math.round(mem * r);
      return '<span>' + v + (r === 1 ? ' KB' : '') + '</span>';
    }).join('');

    var bar = segs.map(function (s) {
      var w = pct(s.size, mem);
      var tiny = w < 8;
      var flash = opts.flashStart === s.start ? ' flash' : '';
      var merge = opts.mergeStart === s.start ? ' merge' : '';
      var title = s.name + ' · 起始 ' + s.start + ' KB · 大小 ' + s.size + ' KB';
      return '<div class="seg ' + s.kind + (tiny ? ' tiny' : '') + flash + merge + '" ' +
        'style="left:' + pct(s.start, mem) + '%;width:' + w + '%" title="' + esc(title) + '">' +
        (tiny ? '' : '<span class="seg-name">' + (s.kind === 'free' ? '空闲' : shortName(s.name)) + '</span>' +
          '<span class="seg-kb">' + s.size + 'K</span>') +
        '</div>';
    }).join('');

    return '<div class="mem-wrap">' +
      '<div class="mem-top"><span class="mem-cap">内存用户区 ' + mem + ' KB</span>' +
      '<span class="mem-sub">0 → ' + mem + ' KB（左闭右开）</span></div>' +
      '<div class="mem-bar">' + bar + '</div>' +
      '<div class="mem-ticks">' + ticks + '</div>' +
      '</div>';
  }

  function freeChain(free, opts) {
    opts = opts || {};
    var marks = opts.marks || {};
    var html = '<div class="chain-wrap">';
    html += '<div class="chain-cap">空闲分区链 <span>按起始地址从小到大</span></div>';
    if (!free.length) {
      html += '<div class="chain-empty">∅ 没有空闲分区</div>';
    } else {
      html += '<div class="chain">';
      free.forEach(function (f, i) {
        var mark = marks[f.start];
        html += '<div class="fc-node' + (mark ? ' ' + mark : '') + '">' +
          '<div class="fc-idx">#' + (i + 1) + '</div>' +
          '<div class="fc-start">起 ' + f.start + '</div>' +
          '<div class="fc-size">' + f.size + ' KB</div>' +
          '</div>';
        html += '<span class="chain-ar">→</span>';
      });
      html += '<span class="chain-null">∧</span></div>';
    }
    html += '</div>';
    return html;
  }

  function allocLine(alloc, mem) {
    if (!alloc.length) {
      return '<div class="alloc-line"><span class="al-cap">已分配</span><span class="al-none">暂无</span></div>';
    }
    var items = alloc.map(function (a) {
      return '<span class="al-item"><b>' + a.name + '</b> [' + a.start + ',' + (a.start + a.size) + ') ' +
        a.size + 'KB</span>';
    }).join('');
    return '<div class="alloc-line"><span class="al-cap">已分配</span>' + items + '</div>';
  }

  function arrowRow(nodes, cls) {
    return '<div class="arrow-row ' + (cls || '') + '">' + nodes.join('<span class="ar">→</span>') + '</div>';
  }

  function node(label, sub, cls) {
    return '<div class="node ' + (cls || '') + '"><b>' + label + '</b>' +
      (sub ? '<span>' + sub + '</span>' : '') + '</div>';
  }

  /* ---------- 播放器 ---------- */

  function stepDuration(step, caption) {
    if (step.dur) return step.dur;
    return Math.min(9000, 3600 + caption.length * 32);
  }

  function Player(view) {
    this.view = view;
    this.section = view.section;
    this.stage = view.stage;
    this.subText = view.subText;
    this.progress = view.progress;
    this.playBtn = view.playBtn;
    this.prevBtn = view.prevBtn;
    this.nextBtn = view.nextBtn;
    this.stepCount = view.stepCount;
    this.chips = view.chips;
    this.select = view.select;
    this.scenes = view.meta.scenes;
    this.sceneIndex = 0;
    this.stepIndex = 0;
    this.playing = false;
    this.speed = 1;
    this.timer = null;
    this.bind();
  }

  Player.prototype.bind = function () {
    var self = this;
    this.section.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-scene]');
      if (chip && self.section.contains(chip)) {
        var i = Number(chip.getAttribute('data-scene'));
        if (!isNaN(i)) self.goToScene(i, { autoplay: true });
        return;
      }
      var act = e.target.closest('[data-act]');
      if (act) {
        var a = act.getAttribute('data-act');
        if (a === 'prev') self.prev();
        if (a === 'next') self.next();
        if (a === 'play') self.toggle();
        return;
      }
      var sp = e.target.closest('[data-speed]');
      if (sp) self.setSpeed(Number(sp.getAttribute('data-speed')));
    });
    this.select.addEventListener('change', function () {
      self.goToScene(Number(self.select.value), { autoplay: true });
    });
  };

  Player.prototype.currentScene = function () {
    return this.scenes[this.sceneIndex];
  };

  Player.prototype.currentStep = function () {
    return this.currentScene().steps[this.stepIndex];
  };

  Player.prototype.isVisible = function () {
    return this.section.classList.contains('active');
  };

  Player.prototype.renderStep = function (i) {
    var scene = this.currentScene();
    var step = scene.steps[i];
    this.stepIndex = i;
    this.stage.innerHTML = '<div class="scene">' + (step.html ? step.html() : '') + '</div>';
    this.stage.scrollTop = 0;
    this.stage.classList.remove('anim');
    void this.stage.offsetWidth;
    this.stage.classList.add('anim');
    this.subText.textContent = step.caption || '';
    if (step.enter) {
      try { step.enter(this.stage, this); } catch (err) { console.error(err); }
    }
    this.update();
  };

  Player.prototype.goToScene = function (i, opts) {
    opts = opts || {};
    if (i < 0 || i >= this.scenes.length) return;
    this.stopTimer();
    this.sceneIndex = i;
    this.stepIndex = opts.step == null ? 0 : opts.step;
    var scene = this.scenes[i];
    if (this.stepIndex >= scene.steps.length) this.stepIndex = scene.steps.length - 1;
    this.playing = !!opts.autoplay;
    this.renderStep(this.stepIndex);
    var chip = this.chips[i];
    if (chip && chip.parentElement) {
      chip.parentElement.scrollLeft = chip.offsetLeft - chip.parentElement.clientWidth / 2 + chip.offsetWidth / 2;
    }
    if (this.playing) this.schedule();
    this.update();
  };

  Player.prototype.update = function () {
    var scene = this.currentScene();
    var lastStep = this.stepIndex >= scene.steps.length - 1;
    var lastScene = this.sceneIndex >= this.scenes.length - 1;
    this.chips.forEach(function (c, i) {
      c.classList.toggle('on', i === this.sceneIndex);
      c.setAttribute('aria-selected', i === this.sceneIndex ? 'true' : 'false');
    }, this);
    this.select.value = String(this.sceneIndex);
    this.stepCount.textContent = (this.stepIndex + 1) + ' / ' + scene.steps.length;
    this.progress.style.width = ((this.stepIndex + 1) / scene.steps.length * 100) + '%';
    if (this.playing) {
      this.playBtn.innerHTML = '❚❚ 暂停';
    } else if (lastStep) {
      this.playBtn.innerHTML = '↻ 重播';
    } else {
      this.playBtn.innerHTML = '▶ 播放';
    }
    this.playBtn.setAttribute('aria-label', this.playing ? '暂停' : (lastStep ? '重播本场景' : '播放'));
    this.playBtn.classList.toggle('on', this.playing);
    this.prevBtn.disabled = this.sceneIndex === 0 && this.stepIndex === 0;
    this.nextBtn.disabled = lastScene && lastStep;
  };

  Player.prototype.schedule = function () {
    var self = this;
    this.stopTimer();
    if (!this.playing) return;
    var step = this.currentStep();
    var ms = stepDuration(step, step.caption || '') / this.speed;
    this.timer = setTimeout(function () { self.tick(); }, ms);
  };

  Player.prototype.tick = function () {
    if (!this.playing) return;
    var scene = this.currentScene();
    if (this.stepIndex < scene.steps.length - 1) {
      this.renderStep(this.stepIndex + 1);
      this.schedule();
    } else {
      this.playing = false;
      this.stopTimer();
      this.update();
    }
  };

  Player.prototype.stopTimer = function () {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  Player.prototype.play = function () {
    if (this.playing) return;
    var scene = this.currentScene();
    if (this.stepIndex >= scene.steps.length - 1) this.renderStep(0);
    this.playing = true;
    this.schedule();
    this.update();
  };

  Player.prototype.pause = function () {
    if (!this.playing) return;
    this.playing = false;
    this.stopTimer();
    this.update();
  };

  Player.prototype.toggle = function () {
    if (this.playing) this.pause();
    else this.play();
  };

  Player.prototype.next = function () {
    this.pause();
    var scene = this.currentScene();
    if (this.stepIndex < scene.steps.length - 1) {
      this.renderStep(this.stepIndex + 1);
    } else if (this.sceneIndex < this.scenes.length - 1) {
      this.goToScene(this.sceneIndex + 1, { autoplay: false });
    }
  };

  Player.prototype.prev = function () {
    this.pause();
    if (this.stepIndex > 0) {
      this.renderStep(this.stepIndex - 1);
    } else if (this.sceneIndex > 0) {
      var prevScene = this.scenes[this.sceneIndex - 1];
      this.goToScene(this.sceneIndex - 1, { autoplay: false, step: prevScene.steps.length - 1 });
    }
  };

  Player.prototype.setSpeed = function (s) {
    this.speed = s;
    var btns = this.section.querySelectorAll('[data-speed]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('on', Number(btns[i].getAttribute('data-speed')) === s);
    }
    if (this.playing) this.schedule();
  };

  /* ---------- 模块外壳 ---------- */

  function createModule(section, meta, num) {
    var chipsHTML = meta.scenes.map(function (s, i) {
      return '<button class="chip" role="tab" aria-selected="false" data-scene="' + i + '">' +
        '<b>' + s.id + '</b><span>' + s.short + '</span></button>';
    }).join('');
    var options = meta.scenes.map(function (s, i) {
      return '<option value="' + i + '">' + s.id + ' ' + s.title + '</option>';
    }).join('');

    section.innerHTML =
      '<div class="module-head">' +
        '<div class="mh-left">' +
          '<span class="module-badge">模块 ' + num + '</span>' +
          '<h2>' + meta.title + '</h2>' +
          '<p>' + meta.sub + '</p>' +
        '</div>' +
        '<div class="chips" role="tablist" aria-label="场景跳转">' + chipsHTML + '</div>' +
      '</div>' +
      '<div class="player-card">' +
        '<div class="stage" aria-live="polite"></div>' +
        '<div class="subtitle"><span class="sub-mark">▸</span><span class="sub-text"></span></div>' +
        '<div class="progress"><i></i></div>' +
        '<div class="controls">' +
          '<div class="ctrl-group">' +
            '<button class="ctl" data-act="prev" aria-label="上一步">◀ 上一步</button>' +
            '<button class="ctl play" data-act="play" aria-label="播放">▶ 播放</button>' +
            '<button class="ctl" data-act="next" aria-label="下一步">下一步 ▶</button>' +
          '</div>' +
          '<div class="ctrl-group"><span class="step-count">1 / 1</span></div>' +
          '<div class="ctrl-group ctrl-right">' +
            '<label class="jump"><span>场景</span><select>' + options + '</select></label>' +
            '<div class="speeds" aria-label="播放速度">' +
              '<button data-speed="0.5">0.5×</button>' +
              '<button data-speed="1" class="on">1×</button>' +
              '<button data-speed="2">2×</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="kbd-hint">空格 播放/暂停 · ← → 上一步/下一步</div>' +
      '</div>';

    var view = {
      section: section,
      meta: meta,
      stage: section.querySelector('.stage'),
      subText: section.querySelector('.sub-text'),
      progress: section.querySelector('.progress i'),
      playBtn: section.querySelector('[data-act="play"]'),
      prevBtn: section.querySelector('[data-act="prev"]'),
      nextBtn: section.querySelector('[data-act="next"]'),
      stepCount: section.querySelector('.step-count'),
      chips: Array.prototype.slice.call(section.querySelectorAll('.chip')),
      select: section.querySelector('.jump select')
    };
    return new Player(view);
  }

  global.UI = {
    D: D,
    fmt: fmt,
    fmt1: fmt1,
    fmt2: fmt2,
    hex: hex,
    pad: pad,
    esc: esc,
    group4: group4,
    shortName: shortName,
    pct: pct,
    sup: sup,
    sceneHead: sceneHead,
    card: card,
    callout: callout,
    formula: formula,
    legend: legend,
    tag: tag,
    bitBar: bitBar,
    memStrip: memStrip,
    freeChain: freeChain,
    allocLine: allocLine,
    arrowRow: arrowRow,
    node: node,
    Player: Player,
    createModule: createModule
  };
})(window);

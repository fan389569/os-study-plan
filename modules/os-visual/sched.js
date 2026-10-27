/* 模块①：进程调度 */
(function (A) {
  'use strict';

  var E = A.E;
  var h = A.h;
  var esc = A.esc;
  var num = A.num;
  var pct = A.pct;

  function clear(host) { host.innerHTML = ''; }

  function add(host) {
    for (var i = 1; i < arguments.length; i++) {
      var n = arguments[i];
      if (n) host.appendChild(n);
    }
  }

  function mergeSegs(segs) {
    var out = [];
    segs.forEach(function (s) {
      var last = out[out.length - 1];
      if (last && last.id === s.id && last.end === s.start) last.end = s.end;
      else out.push({ id: s.id, start: s.start, end: s.end });
    });
    return out;
  }

  function orderText(res) {
    return mergeSegs(res.segments).map(function (s) { return s.id; }).join(' → ');
  }

  function numList(items) {
    var ol = h('ol', 'num-list');
    items.forEach(function (t) { ol.appendChild(h('li', '', t)); });
    return ol;
  }

  /* ---------------- 1.0 CPU 只有一个 ---------------- */
  var scene10 = {
    id: '1.0',
    short: 'CPU 只有一个',
    title: 'CPU 只有一个，调度就是“挑下一个”',
    build: function (host) {
      var jobs = [
        { id: 'P1', arrival: 0, burst: 5 },
        { id: 'P2', arrival: 0, burst: 3 },
        { id: 'P3', arrival: 0, burst: 2 }
      ];
      var colors = A.colorMap(jobs);

      function proc(j, opts) {
        opts = opts || {};
        return '<span class="proc' + (opts.dim ? ' dim' : '') + (opts.pulse ? ' pulse' : '') + '"' +
          ' style="--c:' + colors[j.id] + '">' + j.id + ' <small>需 ' + j.burst + 'ms</small></span>';
      }

      function draw(step) {
        clear(host);
        var remaining = jobs.filter(function (j) { return j.id !== 'P1'; });
        var html =
          '<div class="cpu-scene">' +
            '<div class="cpu-box">' +
              '<div class="cpu-label">CPU · 同一时刻只能运行一个进程</div>' +
              '<div class="cpu-slot' + (step >= 2 ? ' busy' : '') + '">' +
                (step >= 2
                  ? '<div class="cpu-task" style="--c:' + colors.P1 + '">' +
                      '<div class="t-top"><span>P1 正在运行</span><small>还需 5ms</small></div>' +
                      '<div class="t-bar"><i style="width:42%"></i></div>' +
                    '</div>'
                  : '<div class="cpu-idle">空闲 · 等一个进程上来</div>') +
              '</div>' +
            '</div>' +
            '<div class="arrow-down">↓</div>' +
            '<div class="queue-box">' +
              '<div class="queue-label">就绪队列（已经到达、只差 CPU 的进程）</div>' +
              '<div class="queue-row">' +
                (step === 0
                  ? jobs.map(function (j) { return proc(j); }).join('')
                  : (step === 1
                      ? '<span class="head-mark">队首</span>' +
                        '<span class="proc pulse" style="--c:' + colors.P1 + '">P1 <small>需 5ms</small></span>' +
                        proc(jobs[1]) + proc(jobs[2])
                      : remaining.map(function (j) { return proc(j); }).join(''))) +
              '</div>' +
            '</div>' +
          '</div>';
        host.innerHTML = html;
        if (step === 0) {
          var pterm = h('div', 'term');
          pterm.innerHTML = '<b>进程</b>　正在运行的程序。这里用带名字的方块表示，方块里的“需 x ms”就是它还要占用 CPU 多久。';
          host.appendChild(pterm);
        }
        if (step >= 2) {
          var tip = h('div', 'term');
          tip.innerHTML = '<b>调度</b>　就是 CPU 空出来时，按某种规则从就绪队列里挑一个进程。挑的规则不同，就叫不同的调度算法。';
          host.appendChild(tip);
        }
      }

      return {
        steps: [
          {
            sub: 'CPU 只有一个。同一时刻，只能有一个进程真正在跑，其他进程都在“就绪队列”里排队。所谓调度，就是决定下一个让谁上 CPU。',
            duration: 5200,
            draw: function () { draw(0); }
          },
          {
            sub: '所谓“调度”，就是 CPU 空出来时做一个决定：从队首挑一个进程，让它上 CPU。',
            duration: 5200,
            draw: function () { draw(1); }
          },
          {
            sub: 'P1 上 CPU 运行，P2、P3 继续排队。后面所有算法，区别只在“按什么规则挑”。',
            duration: 5400,
            draw: function () { draw(2); }
          }
        ]
      };
    }
  };

  /* ---------------- 1.1 三个指标 ---------------- */
  var scene11 = {
    id: '1.1',
    short: '三个指标',
    title: '周转、带权周转、等待：一条时间轴全看懂',
    build: function (host) {
      var jobs = [
        { id: 'P1', arrival: 0, burst: 5 },
        { id: 'P2', arrival: 2, burst: 6 }
      ];
      var res = E.fcfs(jobs);
      var colors = A.colorMap(jobs);
      var p2 = res.rows[1];
      var total = 11;

      function detail(step) {
        var marks = '';
        if (step >= 1) {
          marks += '<span class="dt-mark arrive" style="left:' + pct(p2.arrival, total) + '">到达 ' + p2.arrival + '</span>';
        }
        if (step >= 2) {
          marks += '<span class="dt-mark start" style="left:' + pct(p2.start, total) + '">开始 ' + p2.start + '</span>';
        }
        if (step >= 3) {
          marks += '<span class="dt-mark done" style="left:100%">完成 ' + p2.completion + '</span>';
        }
        var spans = '';
        if (step >= 2) {
          spans += '<div class="dt-span wait" style="left:' + pct(p2.arrival, total) + ';width:' +
            pct(p2.start - p2.arrival, total) + '">等待 ' + p2.waiting + 'ms</div>';
        }
        if (step >= 3) {
          spans += '<div class="dt-span run" style="left:' + pct(p2.start, total) + ';width:' +
            pct(p2.completion - p2.start, total) + ';--c:' + colors.P2 + '">运行 ' + p2.burst + 'ms</div>';
        }
        var bracket = '';
        if (step >= 4) {
          bracket = '<div class="dt-bracket" style="left:' + pct(p2.arrival, total) + ';width:' +
            pct(p2.completion - p2.arrival, total) + '"><span>周转时间 ' + p2.turnaround + 'ms</span></div>';
        }
        return '<div class="detail-timeline">' +
          '<div class="dt-marks">' + marks + '</div>' +
          '<div class="dt-track">' + spans + '</div>' +
          '<div class="dt-axis"><span style="left:0%">0</span><span style="left:' + pct(p2.start, total) + '">' + p2.start + '</span><span class="last" style="left:100%">' + p2.completion + '</span></div>' +
          bracket +
        '</div>';
      }

      function draw(step) {
        clear(host);
        add(host, A.jobChips(jobs, colors));

        var g = A.ganttBlock({
          segments: res.segments,
          total: total,
          colors: colors,
          jobs: jobs,
          title: 'CPU 时间轴',
          tag: 'P1 先跑完，P2 才轮到'
        });
        add(host, g);

        var label = h('div', 'row tight');
        label.innerHTML = '<b style="font-size:14.5px">单独看 P2</b><span class="chip">到达 2 · 运行 6</span>';
        add(host, label);
        var d = h('div', '');
        d.innerHTML = detail(step);
        add(host, d);

        if (step >= 4) {
          var f = h('div', 'formula');
          f.innerHTML =
            '周转时间 = 完成 − 到达 = <span class="hl">' + p2.completion + ' − ' + p2.arrival + ' = ' + p2.turnaround + ' ms</span><br>' +
            (step >= 5
              ? '带权周转 = 周转 ÷ 运行 = <span class="hl">' + p2.turnaround + ' ÷ ' + p2.burst + ' = ' + num(p2.weighted, 3) + '</span><br>' +
                '等待时间 = 周转 − 运行 = <span class="hl">' + p2.turnaround + ' − ' + p2.burst + ' = ' + p2.waiting + ' ms</span>'
              : '');
          add(host, f);
        }
        if (step >= 5) {
          add(host, A.box('ok',
            '<b>一句话记住：</b>周转时间 = 等待 + 运行；带权周转 = 周转 ÷ 运行。带权周转越接近 1，说明这个进程几乎没等。'));
        }
      }

      return {
        steps: [
          { sub: '先看 P2：它 ' + p2.arrival + 'ms 到达，但 CPU 正被 P1 占着，只能先等。这一节要算的“周转时间”，就是它从到达到完成的全部时长。', duration: 5600, draw: function () { draw(0); } },
          { sub: '“到达时间” = 进程进入系统的时刻，这里是 t = ' + p2.arrival + '。', duration: 4800, draw: function () { draw(1); } },
          { sub: '“开始运行” = ' + p2.start + '。从 ' + p2.arrival + ' 到 ' + p2.start + ' 的 ' + p2.waiting + 'ms，就是 P2 的等待时间。', duration: 5000, draw: function () { draw(2); } },
          { sub: '“完成时间” = ' + p2.completion + '。从开始到完成跑了 ' + p2.burst + 'ms，这就是它的运行时间。', duration: 5000, draw: function () { draw(3); } },
          { sub: '周转时间 = 完成 − 到达 = ' + p2.completion + ' − ' + p2.arrival + ' = ' + p2.turnaround + 'ms，它把“等待 + 运行”都装进去了。', duration: 5600, draw: function () { draw(4); } },
          { sub: '带权周转 = 周转 ÷ 运行 = ' + p2.turnaround + ' ÷ ' + p2.burst + ' = ' + num(p2.weighted, 3) + '；等待 = 周转 − 运行 = ' + p2.waiting + 'ms。三个公式其实是一条线。', duration: 6000, draw: function () { draw(5); } }
        ]
      };
    }
  };

  /* ---------------- 1.2 FCFS vs SJF ---------------- */
  var scene12 = {
    id: '1.2',
    short: 'FCFS / SJF',
    title: 'FCFS 与 SJF 对比（24 卷三.11）',
    build: function (host) {
      var jobs = [
        { id: 'A', arrival: 0, burst: 6 },
        { id: 'B', arrival: 0, burst: 2 },
        { id: 'C', arrival: 0, burst: 10 },
        { id: 'D', arrival: 0, burst: 4 }
      ];
      var colors = A.colorMap(jobs);
      var fcfs = E.fcfs(jobs);
      var sjf = E.sjf(jobs);
      var total = 22;

      function ganttCard(res, title, tag, tone) {
        var box = h('div', 'card plain stack-10 fade-in');
        var head = h('div', 'row tight');
        head.innerHTML = '<b style="font-size:15px">' + title + '</b><span class="chip">' + tag + '</span>' +
          '<span class="spacer"></span><span class="chip ' + (tone || '') + '">顺序：' + orderText(res) + '</span>';
        box.appendChild(head);
        box.appendChild(A.gantt({ segments: res.segments, total: total, colors: colors }));
        box.appendChild(A.legend(jobs, colors));
        return box;
      }

      function tableCard(res, title, tone) {
        var box = h('div', 'card plain stack-10 fade-in');
        var head = h('div', 'row tight');
        head.innerHTML = '<b style="font-size:15px">' + title + '</b><span class="chip ' + (tone || '') + '">平均周转 ' +
          num(res.avgTurnaround, 2) + 'ms · 带权 ' + num(res.avgWeighted, 3) + '</span>';
        box.appendChild(head);
        box.appendChild(A.metricsTable(res, { colors: colors }));
        box.appendChild(A.statCards(res));
        return box;
      }

      function draw(step) {
        clear(host);
        var top = h('div', 'row');
        top.innerHTML = '<b style="font-size:14px">4 个作业同时到达 t = 0</b>';
        add(host, top);
        add(host, A.jobChips(jobs, colors));

        if (step === 0) {
          add(host, A.term('FCFS（先来先服务）', '像食堂排队：谁先到谁先打饭，不看谁吃得快。'));
          add(host, A.term('SJF（短作业优先）', '像快递分拣：小件先处理，大件往后放。每次挑运行时间最短的。这里是非抢占：一旦上 CPU，就跑完自己这一整段。'));
          return;
        }

        if (step >= 1) {
          add(host, ganttCard(fcfs, 'FCFS · 先来先服务', '先到先服务', ''));
        }
        if (step >= 3) {
          add(host, ganttCard(sjf, 'SJF · 短作业优先（非抢占）', '每次挑运行最短的', 'ok'));
        }
        if (step >= 2) {
          add(host, tableCard(fcfs, 'FCFS 计算表', ''));
        }
        if (step >= 4) {
          add(host, tableCard(sjf, 'SJF 计算表', 'ok'));
        }

        if (step >= 5) {
          var cmp = h('div', 'split');
          var left = h('div', 'card');
          left.innerHTML =
            '<div class="small muted">FCFS 平均周转 / 带权</div>' +
            '<div class="big-num" style="color:var(--warn)">' + num(fcfs.avgTurnaround, 2) + ' <span style="font-size:15px">ms</span></div>' +
            '<div class="small muted">带权 ' + num(fcfs.avgWeighted, 3) + '</div>';
          var right = h('div', 'card');
          right.innerHTML =
            '<div class="small muted">SJF 平均周转 / 带权</div>' +
            '<div class="big-num" style="color:var(--ok)">' + num(sjf.avgTurnaround, 2) + ' <span style="font-size:15px">ms</span></div>' +
            '<div class="small muted">带权 ' + num(sjf.avgWeighted, 3) + '</div>';
          cmp.appendChild(left);
          cmp.appendChild(right);
          add(host, cmp);
          add(host, A.box('ok',
            '<b>一句话：</b>短的放前面，大家平均等得少。平均周转从 ' + num(fcfs.avgTurnaround, 2) +
            'ms 降到 ' + num(sjf.avgTurnaround, 2) + 'ms，带权从 ' + num(fcfs.avgWeighted, 3) +
            ' 降到 ' + num(sjf.avgWeighted, 3) + '。'));
        }

        if (step >= 6) {
          add(host, A.box('warn',
            '<b>缺点：饥饿。</b>如果系统里源源不断有短作业进来，长作业 C 可能一直被推后，永远轮不到 —— 这叫“饥饿”。'));
        }
      }

      var bursts = {};
      jobs.forEach(function (j) { bursts[j.id] = j.burst; });
      var fcfsDone = fcfs.rows.map(function (r) { return r.completion; }).join('、');
      var sjfDone = sjf.rows.map(function (r) { return r.completion; }).join('、');
      var sjfOrderDetail = mergeSegs(sjf.segments).map(function (s) {
        return s.id + '(' + bursts[s.id] + ')';
      }).join(' → ');
      var burstText = jobs.map(function (j) { return j.burst; }).join('、');

      return {
        steps: [
          { sub: '题目：A、B、C、D 同时到达，运行时间 ' + burstText + 'ms。先看两种最常考的规则。', duration: 5600, draw: function () { draw(0); } },
          { sub: 'FCFS 按到达顺序，也就是 ' + orderText(fcfs) + '，画出一条连续的甘特图。', duration: 5400, draw: function () { draw(1); } },
          { sub: '完成时间 ' + fcfsDone + ' → 平均周转 ' + num(fcfs.avgTurnaround, 2) + 'ms，平均带权 ' + num(fcfs.avgWeighted, 3) + '。', duration: 6000, draw: function () { draw(2); } },
          { sub: 'SJF 每次挑运行时间最短的：' + sjfOrderDetail + '。', duration: 5600, draw: function () { draw(3); } },
          { sub: '完成时间 ' + sjfDone + ' → 平均周转 ' + num(sjf.avgTurnaround, 2) + 'ms，平均带权 ' + num(sjf.avgWeighted, 3) + '。', duration: 6000, draw: function () { draw(4); } },
          { sub: '对比：SJF 平均周转 ' + num(sjf.avgTurnaround, 2) + ' < FCFS ' + num(fcfs.avgTurnaround, 2) + '。短的放前面，大家平均等得少。', duration: 6000, draw: function () { draw(5); } },
          { sub: '但 SJF 有缺点：一直有短作业进来时，长作业可能一直被推后，这叫“饥饿”。', duration: 5600, draw: function () { draw(6); } }
        ]
      };
    }
  };

  /* ---------------- 1.3 抢占式 SJF ---------------- */
  var scene13 = {
    id: '1.3',
    short: '抢占式 SJF',
    title: '抢占式 SJF：每个新进程到达都重新比一次（25 卷四.3）',
    build: function (host) {
      var jobs = [
        { id: 'P1', arrival: 0, burst: 8 },
        { id: 'P2', arrival: 1, burst: 4 },
        { id: 'P3', arrival: 2, burst: 9 },
        { id: 'P4', arrival: 3, burst: 5 }
      ];
      var colors = A.colorMap(jobs);
      var pre = E.srtf(jobs);
      var np = E.sjf(jobs);
      var segs = mergeSegs(pre.segments);
      var total = Math.max.apply(null, pre.segments.map(function (s) { return s.end; }));

      function remainingAt(job, t) {
        var ran = 0;
        pre.segments.forEach(function (s) {
          if (s.id === job.id) ran += Math.max(0, Math.min(s.end, t) - s.start);
        });
        return job.burst - ran;
      }

      function describe(d) {
        if (d.kind === 'start') {
          var a0 = d.arrivals[0];
          return 't=' + d.t + '：' + a0.id + ' 到达（需要 ' + a0.rem + 'ms），CPU 空着 → ' + d.chosen + ' 上 CPU。';
        }
        if (d.kind === 'preempt') {
          var a = d.arrivals[0];
          return 't=' + d.t + '：' + a.id + ' 到达（需要 ' + a.rem + 'ms）。当前 ' + d.preempted +
            ' 还剩 ' + d.runningRemBefore + 'ms：' + d.runningRemBefore + ' > ' + a.rem + '，' + a.id + ' 抢占 CPU。';
        }
        if (d.kind === 'keep') {
          var b = d.arrivals[0];
          return 't=' + d.t + '：' + b.id + ' 到达（需要 ' + b.rem + 'ms）。当前 ' + d.chosen +
            ' 还剩 ' + d.runningRemBefore + 'ms：' + d.runningRemBefore + ' ≤ ' + b.rem + '，不抢占，' + d.chosen + ' 继续。';
        }
        if (d.kind === 'complete') {
          var cands = d.candidates.map(function (c) { return c.id + ' 剩 ' + c.rem + 'ms'; }).join('、');
          return 't=' + d.t + '：' + d.completed + ' 完成。就绪队列：' + cands + ' → 选最短的 ' + d.chosen + '。';
        }
        if (d.kind === 'done') {
          return 't=' + d.t + '：' + d.completed + ' 完成，所有进程结束。';
        }
        return 't=' + d.t + '：' + d.chosen + ' 运行。';
      }

      function histLabel(d) {
        if (d.kind === 'preempt') return 't=' + d.t + ' 抢占';
        if (d.kind === 'keep') return 't=' + d.t + ' 不抢';
        if (d.kind === 'complete') return 't=' + d.t + ' 选' + d.chosen;
        if (d.kind === 'done') return 't=' + d.t + ' 结束';
        return 't=' + d.t + ' 选' + d.chosen;
      }

      function verdictOf(d) {
        if (d.kind === 'preempt') return { text: d.chosen + ' 抢占', cls: 'preempt' };
        if (d.kind === 'keep') return { text: '继续 ' + d.chosen, cls: 'keep' };
        if (d.kind === 'complete') return { text: '选 ' + d.chosen, cls: '' };
        if (d.kind === 'done') return { text: '全部结束', cls: 'keep' };
        return { text: d.chosen + ' 上 CPU', cls: '' };
      }

      function titleOf(d) {
        if (d.kind === 'start') return d.chosen + ' 到达，CPU 只能选它';
        if (d.kind === 'preempt') return d.arrivals[0].id + ' 到达，比当前进程更短';
        if (d.kind === 'keep') return d.arrivals[0].id + ' 到达，但不比当前进程短';
        if (d.kind === 'complete') return d.completed + ' 完成，重新挑一个';
        if (d.kind === 'done') return '最后一个进程完成';
        return '';
      }

      function detailOf(d) {
        if (d.kind === 'preempt') {
          return '新进程 ' + d.arrivals[0].id + '：' + d.arrivals[0].rem + 'ms　|　当前 ' + d.preempted + ' 剩余：' + d.runningRemBefore + 'ms';
        }
        if (d.kind === 'keep') {
          return '新进程 ' + d.arrivals[0].id + '：' + d.arrivals[0].rem + 'ms　|　当前 ' + d.chosen + ' 剩余：' + d.runningRemBefore + 'ms';
        }
        if (d.kind === 'complete') {
          return '就绪队列里剩余时间：' + d.candidates.map(function (c) { return c.id + ' ' + c.rem + 'ms'; }).join('　');
        }
        if (d.kind === 'start') return d.chosen + ' 需要 ' + d.arrivals[0].rem + 'ms';
        if (d.kind === 'done') return d.completed + ' 完成，全部结束';
        return '';
      }

      function decisionStep(idx) {
        clear(host);
        var d = pre.decisions[idx];
        var next = pre.decisions[idx + 1];
        var upto = next ? next.t : total;
        var preempts = pre.decisions.slice(0, idx + 1)
          .filter(function (x) { return x.kind === 'preempt'; })
          .map(function (x) { return x.t; });

        add(host, A.ganttBlock({
          segments: segs,
          total: total,
          colors: colors,
          upto: upto,
          now: d.t,
          preempts: preempts,
          jobs: jobs,
          title: 'CPU 甘特图（走到 t=' + d.t + '）'
        }));

        var v = verdictOf(d);
        var dc = h('div', 'decision-card');
        dc.innerHTML =
          '<div class="decision-time">' + d.t + '<small>时刻 t</small></div>' +
          '<div class="decision-body">' +
            '<div class="d-title">' + esc(titleOf(d)) + '</div>' +
            '<div class="d-sub">' + esc(detailOf(d)) + '</div>' +
          '</div>' +
          '<div class="decision-verdict ' + v.cls + '">' + esc(v.text) + '</div>';
        add(host, dc);

        var remRow = h('div', 'row tight');
        remRow.innerHTML = '<span class="small muted">此刻各进程剩余：</span>' + jobs.map(function (j) {
          if (j.arrival > d.t) return '<span class="chip muted">' + j.id + ' 未到达</span>';
          var r = remainingAt(j, d.t);
          if (r <= 0) return '<span class="chip ok">' + j.id + ' 已完成</span>';
          return '<span class="chip"><span class="dot" style="background:' + colors[j.id] + '"></span>' + j.id + ' 剩 ' + r + 'ms</span>';
        }).join('');
        add(host, remRow);

        var hist = h('div', 'history');
        for (var i = 0; i <= idx; i++) {
          var hd = pre.decisions[i];
          var hc = h('span', 'hchip' + (i === idx ? ' active' : '') + (hd.kind === 'preempt' ? ' preempt' : ''), histLabel(hd));
          hist.appendChild(hc);
        }
        add(host, hist);
      }

      function draw(step) {
        if (step === 0) {
          clear(host);
          add(host, A.jobChips(jobs, colors));
          add(host, A.box('ok',
            '<b>规则：</b>任何时刻，只运行“剩余时间最短”的进程。每来一个新进程，就拿它和当前进程的剩余时间比一比：<b>更短就抢占</b>，否则继续。'));
          add(host, A.term('抢占', '像打游戏时被更急的事叫走：当前进程还没跑完，也必须先让出 CPU。'));
          add(host, A.box('warn',
            '<b>最容易错的地方：</b>抢占式不是“排一次序就完事”。<b>每次有新进程到达，都要重新比较一次。</b>'));
          return;
        }
        var dcount = pre.decisions.length;
        if (step >= 1 && step <= dcount) {
          decisionStep(step - 1);
          return;
        }
        if (step === dcount + 1) {
          clear(host);
          add(host, A.ganttBlock({
            segments: segs,
            total: total,
            colors: colors,
            preempts: [1],
            jobs: jobs,
            title: '完整甘特图',
            tag: '调度次序：' + orderText(pre)
          }));
          add(host, A.metricsTable(pre, { colors: colors }));
          add(host, A.statCards(pre, { highlight: 'tat' }));
          return;
        }
        clear(host);
        add(host, A.ganttBlock({
          segments: mergeSegs(np.segments),
          total: total,
          colors: colors,
          jobs: jobs,
          title: '对照：非抢占式 SJF',
          tag: '平均周转 ' + num(np.avgTurnaround, 2) + 'ms'
        }));
        var box = h('div', 'split');
        var a = h('div', 'card');
        a.innerHTML = '<div class="small muted">抢占式 SJF</div><div class="big-num" style="color:var(--ok)">' +
          num(pre.avgTurnaround, 2) + '<span style="font-size:14px"> ms</span></div><div class="small muted">平均周转</div>';
        var b = h('div', 'card');
        b.innerHTML = '<div class="small muted">非抢占式 SJF</div><div class="big-num" style="color:var(--warn)">' +
          num(np.avgTurnaround, 2) + '<span style="font-size:14px"> ms</span></div><div class="small muted">平均周转</div>';
        box.appendChild(a);
        box.appendChild(b);
        add(host, box);
        add(host, A.box('ok',
          '<b>差别在哪：</b>抢占式让短作业 P2 更早跑完，P1 被切成两段；非抢占式让 P1 一次跑完，但 P2 要等到 t=' + p2np.start +
          '。抢占要付出切换开销（把进程换下来、再换上去的额外时间）。'));
      }

      var jobText = jobs.map(function (j) {
        return j.id + '(' + j.arrival + ',' + j.burst + ')';
      }).join('、');
      var steps = [
        { sub: '题目：' + jobText + '。抢占式规则：每次有新进程到达，就比较剩余时间。', duration: 6200, draw: function () { draw(0); } }
      ];
      pre.decisions.forEach(function (d, i) {
        steps.push({
          sub: describe(d),
          duration: d.kind === 'preempt' ? 6200 : 5200,
          draw: (function (idx) { return function () { draw(idx + 1); }; })(i)
        });
      });
      var tatText = pre.rows.map(function (r) { return r.id + '=' + r.turnaround; }).join('、');
      steps.push({
        sub: '最终周转：' + tatText + '，平均 ' + num(pre.avgTurnaround, 2) + 'ms。完成时间按最后一次算。',
        duration: 6400,
        draw: function () { draw(pre.decisions.length + 1); }
      });
      var p2np = np.rows.filter(function (r) { return r.id === 'P2'; })[0];
      steps.push({
        sub: '同样数据用非抢占 SJF，平均周转 ' + num(np.avgTurnaround, 2) + 'ms。抢占式平均更短，但上下文切换有开销。',
        duration: 6400,
        draw: function () { draw(999); }
      });

      return { steps: steps };
    }
  };

  /* ---------------- 1.4 时间片轮转 ---------------- */
  var scene14 = {
    id: '1.4',
    short: '时间片轮转 RR',
    title: '时间片轮转 RR：每人跑一小段，没完就回队尾',
    build: function (host) {
      var jobs = [
        { id: 'P1', arrival: 0, burst: 5 },
        { id: 'P2', arrival: 0, burst: 3 },
        { id: 'P3', arrival: 0, burst: 2 }
      ];
      var q = 2;
      var colors = A.colorMap(jobs);
      var res = E.rr(jobs, q);
      var total = Math.max.apply(null, res.segments.map(function (s) { return s.end; }));
      var responseLimit = 2000;
      var processCount = 100;
      var qMax = Math.floor(responseLimit / processCount);
      var waitN = 10;
      var waitQ = 200;
      var waitSwitch = 10;
      var worstWait = (waitN - 1) * (waitQ + waitSwitch);

      function queueChips(ids) {
        if (!ids.length) return '<span class="small muted">（空）</span>';
        return ids.map(function (id) {
          return '<span class="chip"><span class="dot" style="background:' + colors[id] + '"></span>' + id + '</span>';
        }).join('');
      }

      function intro() {
        clear(host);
        add(host, A.jobChips(jobs, colors));
        add(host, A.box('ok',
          '<b>规则：</b>每个进程一次最多跑一个“时间片”（这里是 2ms）。时间片用完还没结束，就回到<b>队尾</b>重新排队。'));
        var card = h('div', 'card plain');
        card.innerHTML =
          '<div class="small muted">初始就绪队列（同时到达，按 P1 P2 P3 排）</div>' +
          '<div class="row tight" style="margin-top:8px">' + queueChips(['P1', 'P2', 'P3']) + '</div>';
        add(host, card);
        add(host, A.term('时间片', '像老师轮流提问：每人最多回答 2 分钟，没答完就排到队伍最后，等下一轮。'));
      }

      function traceStep(i) {
        clear(host);
        var tr = res.trace[i];
        add(host, A.ganttBlock({
          segments: res.segments,
          total: total,
          colors: colors,
          upto: tr.end,
          now: tr.start,
          jobs: jobs,
          title: 'CPU 甘特图（第 ' + (i + 1) + ' 个时间片）'
        }));
        var card = h('div', 'card plain');
        card.innerHTML =
          '<div class="row">' +
            '<span class="proc" style="--c:' + colors[tr.id] + '">' + tr.id + '</span>' +
            '<div><b>CPU 运行 ' + tr.start + ' → ' + tr.end + ' ms</b>' +
            '<div class="small muted">本次跑了 ' + tr.run + 'ms，时间片是 ' + tr.quantum + 'ms</div></div>' +
            '<span class="spacer"></span>' +
            '<span class="chip ' + (tr.completed ? 'ok' : '') + '">' +
              (tr.completed ? '已完成' : '还剩 ' + tr.remAfter + 'ms') + '</span>' +
          '</div>';
        add(host, card);
        var qs = h('div', 'card');
        qs.innerHTML =
          '<div class="small muted">运行前的就绪队列</div>' +
          '<div class="row tight" style="margin:5px 0 9px">' + queueChips(tr.queueBefore) + '</div>' +
          '<div class="small muted">' + (tr.completed ? tr.id + ' 直接完成，离开系统' : tr.id + ' 没跑完 → 回到队尾') + '</div>' +
          '<div class="row tight" style="margin-top:5px">' + queueChips(tr.queueAfter) + '</div>';
        add(host, qs);
      }

      function metricsStep() {
        clear(host);
        add(host, A.ganttBlock({
          segments: res.segments,
          total: total,
          colors: colors,
          jobs: jobs,
          title: '完整甘特图',
          tag: '时间片 = 2ms'
        }));
        add(host, A.metricsTable(res, { colors: colors }));
        add(host, A.statCards(res));
      }

      function formulaResponse() {
        clear(host);
        add(host, A.box('ok',
          '<b>响应时间</b>：从进程到达，到它第一次被 CPU 运行，中间等了多久。轮流一圈，每个人都要等别人跑完。'));
        var f = h('div', 'formula');
        f.innerHTML =
          '响应时间 ≈ 进程数 × 时间片<br>' +
          '题目：' + processCount + ' 个进程，要求响应不超过 ' + responseLimit + 'ms<br>' +
          '时间片 ≤ ' + responseLimit + ' ÷ ' + processCount + ' = <span class="hl">' + qMax + 'ms</span><br>' +
          '验证：' + processCount + ' × ' + qMax + ' = ' + (processCount * qMax) + 'ms';
        add(host, f);
        add(host, A.term('响应时间', '像排队买奶茶：你从进店到第一次被叫到号的时间。轮转一圈 = 人数 × 每人时间片。'));
      }

      function formulaWait() {
        clear(host);
        var f = h('div', 'formula');
        f.innerHTML =
          '最坏等待时间 = (n − 1) × (时间片 + 切换时间)<br>' +
          '题目：' + waitN + ' 个进程、时间片 ' + waitQ + 'ms、切换 ' + waitSwitch + 'ms（切换 = 换进程的额外开销）<br>' +
          '(' + waitN + ' − 1) × (' + waitQ + ' + ' + waitSwitch + ') = ' + (waitN - 1) + ' × ' + (waitQ + waitSwitch) +
          ' = <span class="hl">' + worstWait + ' ≈ 1900ms</span>';
        add(host, f);
        var sum = h('div', 'split');
        sum.innerHTML =
          '<div class="card"><div class="small muted">公式一 · 响应时间</div><b style="font-size:15px">进程数 × 时间片</b>' +
          '<div class="small muted" style="margin-top:4px">' + processCount + ' × ' + qMax + ' = ' + (processCount * qMax) + 'ms</div></div>' +
          '<div class="card"><div class="small muted">公式二 · 最坏等待</div><b style="font-size:15px">(n−1) × (时间片+切换)</b>' +
          '<div class="small muted" style="margin-top:4px">' + (waitN - 1) + ' × ' + (waitQ + waitSwitch) + ' = ' + worstWait + 'ms</div></div>';
        add(host, sum);
        add(host, A.box('warn',
          '<b>时间片怎么选：</b>太大 → 退化成像 FCFS，响应变慢；太小 → 切换太频繁，开销变大。'));
      }

      var burstText14 = jobs.map(function (j) { return j.burst; }).join('、');
      var steps = [
        { sub: '三个进程同时到达，运行 ' + burstText14 + 'ms。规则：每个最多跑 ' + q + 'ms，没跑完回队尾。', duration: 6000, draw: intro }
      ];
      res.trace.forEach(function (tr, i) {
        var sub;
        if (tr.completed) {
          sub = tr.id + ' 跑 ' + tr.start + '–' + tr.end + '，正好用完剩余时间，完成！' +
            (tr.queueAfter.length ? '队列里还剩 ' + tr.queueAfter.join('、') + '。' : '');
        } else {
          sub = tr.id + ' 跑 ' + tr.start + '–' + tr.end + '，还剩 ' + tr.remAfter + 'ms，排到队尾。';
        }
        steps.push({
          sub: sub,
          duration: 5400,
          draw: (function (idx) { return function () { traceStep(idx); }; })(i)
        });
      });
      var doneText14 = res.rows.map(function (r) { return r.id + '=' + r.completion; }).join('、');
      var tatText14 = res.rows.map(function (r) { return r.turnaround; }).join('、');
      var waitText14 = res.rows.map(function (r) { return r.waiting; }).join('、');
      steps.push({
        sub: '完成时间 ' + doneText14 + ' → 周转 ' + tatText14 + '，平均约 ' + num(res.avgTurnaround, 2) + 'ms；等待 ' + waitText14 + '。',
        duration: 6400,
        draw: metricsStep
      });
      steps.push({
        sub: '常考公式一：响应时间 ≈ 进程数 × 时间片。' + processCount + ' 个进程、' + responseLimit + 'ms → 时间片最大 ' + qMax + 'ms。',
        duration: 6200,
        draw: formulaResponse
      });
      steps.push({
        sub: '常考公式二：最坏等待 = (n−1) × (时间片 + 切换)。' + waitN + ' 个进程、' + waitQ + 'ms、切换 ' + waitSwitch + 'ms → ' + worstWait + 'ms。',
        duration: 6200,
        draw: formulaWait
      });

      return { steps: steps };
    }
  };

  /* ---------------- 1.5 HRRN ---------------- */
  var scene15 = {
    id: '1.5',
    short: '高响应比 HRRN',
    title: '高响应比优先 HRRN：等得越久，优先级越高',
    build: function (host) {
      var jobs = [
        { id: 'J1', arrival: 0, burst: 3 },
        { id: 'J2', arrival: 1, burst: 6 },
        { id: 'J3', arrival: 2, burst: 4 },
        { id: 'J4', arrival: 3, burst: 1 }
      ];
      var colors = A.colorMap(jobs);
      var hrrn = E.hrrn(jobs);
      var sjf = E.sjf(jobs);
      var total = 14;

      function ratioTable(d) {
        if (!d.ratios) return null;
        var wrap = h('div', 'table-wrap');
        var table = h('table', 'data-table');
        table.innerHTML = '<thead><tr><th>作业</th><th>等待</th><th>运行</th><th>响应比算式</th><th>响应比</th></tr></thead>';
        var tb = h('tbody');
        d.ratios.forEach(function (r) {
          var tr = h('tr');
          if (r.id === d.chosen) tr.className = 'best';
          tr.innerHTML =
            '<td class="id-cell">' + r.id + '</td>' +
            '<td>' + r.wait + '</td>' +
            '<td>' + r.burst + '</td>' +
            '<td>(' + r.wait + ' + ' + r.burst + ') ÷ ' + r.burst + '</td>' +
            '<td><b>' + num(r.ratio, 2) + '</b></td>';
          tb.appendChild(tr);
        });
        table.appendChild(tb);
        wrap.appendChild(table);
        return wrap;
      }

      function ratioLine(d) {
        if (!d.ratios) return '';
        return d.ratios.map(function (r) {
          return r.id + ' (' + r.wait + '+' + r.burst + ')/' + r.burst + '=' + num(r.ratio, 2);
        }).join('　');
      }

      function decisionStep(idx) {
        clear(host);
        var d = hrrn.decisions[idx];
        var next = hrrn.decisions[idx + 1];
        var upto = next ? next.t : total;
        add(host, A.ganttBlock({
          segments: hrrn.segments,
          total: total,
          colors: colors,
          upto: upto,
          now: d.t,
          jobs: jobs,
          title: 'CPU 甘特图（走到 t=' + d.t + '）'
        }));
        add(host, ratioTable(d));
        var card = h('div', 'card plain');
        card.innerHTML =
          '<div class="row">' +
            '<span class="chip accent">t = ' + d.t + '</span>' +
            '<b>按响应比选：' + d.chosen + '</b>' +
            '<span class="spacer"></span>' +
            '<span class="small muted">' + ratioLine(d) + '</span>' +
          '</div>';
        add(host, card);
      }

      function metricsStep() {
        clear(host);
        add(host, A.ganttBlock({
          segments: hrrn.segments,
          total: total,
          colors: colors,
          jobs: jobs,
          title: 'HRRN 完整甘特图',
          tag: '平均周转 ' + num(hrrn.avgTurnaround, 2) + 'ms'
        }));
        add(host, A.metricsTable(hrrn, { colors: colors }));
        add(host, A.statCards(hrrn, { highlight: 'tat' }));
      }

      function compareStep() {
        clear(host);
        add(host, A.ganttBlock({
          segments: sjf.segments,
          total: total,
          colors: colors,
          jobs: jobs,
          title: '对照：SJF（非抢占）',
          tag: '平均周转 ' + num(sjf.avgTurnaround, 2) + 'ms'
        }));
        var split = h('div', 'split');
        var a = h('div', 'card');
        a.innerHTML = '<div class="small muted">HRRN 平均周转</div><div class="big-num" style="color:var(--accent)">' +
          num(hrrn.avgTurnaround, 2) + '<span style="font-size:14px"> ms</span></div>';
        var b = h('div', 'card');
        b.innerHTML = '<div class="small muted">SJF 平均周转</div><div class="big-num" style="color:var(--ok)">' +
          num(sjf.avgTurnaround, 2) + '<span style="font-size:14px"> ms</span></div>';
        split.appendChild(a);
        split.appendChild(b);
        add(host, split);
        add(host, A.box('warn',
          '<b>取舍：</b>SJF 平均更短，但 J2 是长作业，被一路推到 t=' + j2sjf.start + ' 才开始，t=' + j2sjf.completion +
          ' 才结束。HRRN 让等得久的 J2 先跑，解决了长作业饥饿。'));
      }

      var steps = [
        {
          sub: '响应比 = (等待时间 + 运行时间) ÷ 运行时间。每次挑响应比最高的，等得越久越占优势。',
          duration: 6200,
          draw: function () {
            clear(host);
            add(host, A.jobChips(jobs, colors));
            var f = h('div', 'formula');
            f.innerHTML = '响应比 = (等待时间 + 运行时间) ÷ 运行时间<br>' +
              '<span class="hl">等待越长，分子越大 → 优先级被“抬”上来</span>';
            add(host, f);
            add(host, A.term('响应比', '像排队时给“等了很久的人”加权：等 1 分钟和等 10 分钟，后者更容易被叫到。'));
            add(host, A.box('ok', '非抢占：一旦上 CPU，就跑完自己这一整段，不会被中途叫走。'));
          }
        }
      ];

      hrrn.decisions.forEach(function (d, i) {
        var sub;
        if (d.ratios && d.ratios.length > 1) {
          var parts = d.ratios.map(function (r) {
            return r.id + ' (' + r.wait + '+' + r.burst + ')/' + r.burst + '=' + num(r.ratio, 2);
          });
          sub = 't=' + d.t + '：' + parts.join('，') + ' → 选 ' + d.chosen + '。';
        } else {
          sub = 't=' + d.t + '：只有 ' + d.chosen + ' 在等，直接运行 ' + d.t + '–' + (d.t + d.candidates[0].burst) + '。';
        }
        steps.push({
          sub: sub,
          duration: 6000,
          draw: (function (idx) { return function () { decisionStep(idx); }; })(i)
        });
      });
      var done15 = hrrn.rows.map(function (r) { return r.id + '=' + r.completion; }).join('、');
      var tat15 = hrrn.rows.map(function (r) { return r.turnaround; }).join('、');
      var j2sjf = sjf.rows.filter(function (r) { return r.id === 'J2'; })[0];
      steps.push({
        sub: '完成时间 ' + done15 + ' → 周转 ' + tat15 + '，平均 ' + num(hrrn.avgTurnaround, 2) + 'ms。',
        duration: 6400,
        draw: metricsStep
      });
      steps.push({
        sub: 'SJF 平均 ' + num(sjf.avgTurnaround, 2) + 'ms 更短，但 J2 等到 t=' + j2sjf.start +
          ' 才开始。HRRN 用 ' + num(hrrn.avgTurnaround, 2) + 'ms 换来“长作业不被饿死”。',
        duration: 6400,
        draw: compareStep
      });

      return { steps: steps };
    }
  };

  /* ---------------- 1.6 其他算法 ---------------- */
  var scene16 = {
    id: '1.6',
    short: '其他算法与对比',
    title: '优先级、多级反馈队列，以及一张对比表',
    build: function (host) {
      function priorityStep() {
        clear(host);
        add(host, A.term('优先级调度', '像医院分诊：病情重的先看，普通号往后排。每个进程有一个优先级，CPU 每次给优先级最高的。'));
        var card = h('div', 'card plain stack-10');
        card.innerHTML =
          '<div class="row"><b>就绪队列（数字越大，优先级越高）</b><span class="chip danger">P2 优先</span></div>' +
          '<div class="row tight">' +
            '<span class="proc" style="--c:var(--p2)">P1 <small>优先级 2</small></span>' +
            '<span class="proc" style="--c:var(--p1)">P2 <small>优先级 5</small></span>' +
            '<span class="proc" style="--c:var(--p3)">P3 <small>优先级 3</small></span>' +
          '</div>' +
          '<div class="small muted">↑ 先让 P2 上 CPU</div>';
        add(host, card);
        add(host, A.box('warn',
          '<b>两类：</b>静态优先级（创建时定死）和动态优先级（运行中可调整）。<br>' +
          '<b>风险：</b>低优先级进程可能长期轮不到 —— 还是“饥饿”。'));
      }

      function mlfqStep() {
        clear(host);
        add(host, A.term('多级反馈队列', '像三层安检通道：新来的先走最快的第一层；没办完就降到第二层，时间片更长；再没完就降到第三层。'));
        var wrap = h('div', 'stack-10');
        [['Q1', '最高优先级', '时间片 2ms'], ['Q2', '中优先级', '时间片 4ms'], ['Q3', '最低优先级', '时间片 8ms']].forEach(function (q, i) {
          var c = h('div', 'card plain');
          c.innerHTML =
            '<div class="row"><span class="chip accent">' + q[0] + '</span><b>' + q[1] + '</b>' +
            '<span class="spacer"></span><span class="small muted">' + q[2] + '</span></div>' +
            '<div class="small muted" style="margin-top:5px">' +
              (i === 0 ? '新进程先进入这里' : '上一级用完时间片还没结束 → 降到这一级') +
            '</div>';
          wrap.appendChild(c);
          if (i < 2) {
            var ar = h('div', 'center muted', '↓ 用完时间片仍未完成');
            ar.style.fontSize = '12px';
            wrap.appendChild(ar);
          }
        });
        add(host, wrap);
        add(host, A.box('ok',
          '<b>调度顺序：</b>只有高优先级队列空了，才轮到低优先级队列。低优先级队列里的长作业，可能等很久 —— 这是它要权衡的地方。'));
      }

      function tableStep() {
        clear(host);
        var wrap = h('div', 'table-wrap');
        var table = h('table', 'data-table');
        table.innerHTML =
          '<thead><tr><th>算法</th><th>是否抢占</th><th>可能饥饿</th><th>适合场景</th></tr></thead>' +
          '<tbody>' +
            '<tr><td class="id-cell">FCFS</td><td>非抢占</td><td><span class="chip ok">不会</span></td><td>批处理、公平简单</td></tr>' +
            '<tr><td class="id-cell">SJF</td><td>非抢占 / 有抢占版</td><td><span class="chip danger">会</span></td><td>短作业多、追求平均周转</td></tr>' +
            '<tr><td class="id-cell">优先级</td><td>可抢占 / 非抢占</td><td><span class="chip danger">会</span></td><td>重要任务优先</td></tr>' +
            '<tr><td class="id-cell">RR</td><td>时间片用完切换</td><td><span class="chip ok">不会</span></td><td>分时系统、要响应快</td></tr>' +
            '<tr><td class="id-cell">HRRN</td><td>非抢占</td><td><span class="chip ok">不会</span></td><td>兼顾长短作业</td></tr>' +
          '</tbody>';
        wrap.appendChild(table);
        add(host, wrap);
        add(host, A.box('ok',
          '<b>考试只背一句：</b>SJF 和优先级可能饥饿；FCFS、RR、HRRN 不会。'));
      }

      return {
        steps: [
          { sub: '优先级调度：每个进程有一个优先级，每次让优先级最高的上 CPU。低优先级可能一直排不上。', duration: 6000, draw: priorityStep },
          { sub: '多级反馈队列：多个队列，优先级逐级降低、时间片逐级加长；新进程先进第一队，没跑完就降级。', duration: 6400, draw: mlfqStep },
          { sub: '对比表：只有 SJF 和优先级调度可能饥饿；FCFS、RR、HRRN 不会。', duration: 6200, draw: tableStep }
        ]
      };
    }
  };

  /* ---------------- 1.7 模板与错误 ---------------- */
  var scene17 = {
    id: '1.7',
    short: '模板 + 常见错误',
    title: '解题模板与常见错误',
    build: function (host) {
      function templateStep() {
        clear(host);
        add(host, A.box('ok', '<b>手算调度题，固定按这 5 步走：</b>'));
        add(host, numList([
          '画一条时间轴，从 0 开始，标出每个进程的到达时刻。',
          '每个决策点，把“已经到达、还没完成”的进程列出来，这就是就绪队列。',
          '按题目规则挑一个，在时间轴上画它的运行区间；抢占式要重新比较剩余时间。',
          '一直画到所有进程完成，读出每个进程的完成时间。',
          '套公式：周转 = 完成 − 到达；带权 = 周转 ÷ 运行；等待 = 周转 − 运行；最后求平均。'
        ]));
        add(host, A.term('决策点', '不是每一毫秒都要决策，而是“有新进程到达”或“当前进程完成”的时刻。抢占式尤其要盯住这些时刻。'));
      }

      function errorsStep() {
        clear(host);
        add(host, A.box('danger', '<b>这 5 个坑，考试里最常见：</b>'));
        var items = [
          ['周转忘了减到达时间', '周转 = 完成 − 到达，不是“完成时间”。同时到达时两者才碰巧相等。'],
          ['抢占式只比了一次', '每来一个新进程都要拿它的运行时间，和当前进程的“剩余时间”重新比较。'],
          ['RR 排队次序搞反', '同一时刻“新到达的进程”和“刚被抢下的进程”谁先入队，按题目约定；本页采用：时间片用完的先进队，新到达的排在其后。'],
          ['带权周转算错分母', '带权周转 = 周转 ÷ 运行时间，不是 ÷ 到达时间。'],
          ['同时到达时乱排序', 'FCFS 按题目给的先后顺序；SJF 遇到运行时间相同，一般按到达先后（或题目约定）。']
        ];
        items.forEach(function (it, i) {
          var c = h('div', 'card plain');
          c.innerHTML = '<div class="row"><span class="chip danger">' + (i + 1) + '</span><b>' + it[0] + '</b></div>' +
            '<div class="small muted" style="margin-top:4px">' + it[1] + '</div>';
          add(host, c);
        });
      }

      return {
        steps: [
          { sub: '调度题不是“看一眼就会”，按 5 步模板走，手不会乱。', duration: 6000, draw: templateStep },
          { sub: '最后检查：周转减了吗？抢占每次都比了吗？RR 排队次序对吗？带权除以的是运行时间吗？', duration: 6200, draw: errorsStep }
        ]
      };
    }
  };

  A.schedScenes = [scene10, scene11, scene12, scene13, scene14, scene15, scene16, scene17];
})(window.OSApp);

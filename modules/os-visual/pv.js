/* 模块②：PV 操作 */
(function (A) {
  'use strict';

  var E = A.E;
  var h = A.h;
  var esc = A.esc;
  var num = A.num;

  function clear(host) { host.innerHTML = ''; }
  function add(host) {
    for (var i = 1; i < arguments.length; i++) if (arguments[i]) host.appendChild(arguments[i]);
  }

  function code(lines, active, title) {
    return A.codeBlock(lines, active || [], title);
  }

  function semCard(name, value, sub, bump) {
    var d = h('div', 'sem-card' + (bump ? ' bump' : ''));
    d.innerHTML = '<div class="name">' + esc(name) + '</div>' +
      '<div class="val' + (value < 0 ? ' neg' : value === 0 ? ' zero' : '') + '">' + value + '</div>' +
      '<div class="sub">' + esc(sub || '') + '</div>';
    return d;
  }

  function numList(items) {
    var ol = h('ol', 'num-list');
    items.forEach(function (t) { ol.appendChild(h('li', '', t)); });
    return ol;
  }

  /* ---------------- 2.0 丢失更新 ---------------- */
  var scene20 = {
    id: '2.0',
    short: '为什么需要 PV',
    title: '两个售票员，把 1 张票卖成了 2 张',
    build: function (host) {
      var states = [
        { count: 1, aRead: '—', bRead: '—', a: '等待', b: '等待', note: '共享变量：剩余票数 = 1' },
        { count: 1, aRead: '1', bRead: '—', a: '读到 1', b: '等待', note: '售票员 A 先读了一次' },
        { count: 1, aRead: '1', bRead: '1', a: '读到 1', b: '也读到 1', note: '还没写回，B 也来读' },
        { count: 0, aRead: '1', bRead: '1', a: '卖出，写回 0', b: '读到 1', note: 'A 卖出 1 张，票数变 0' },
        { count: -1, aRead: '1', bRead: '1', a: '卖出，写回 0', b: '也卖出，0−1=−1', note: 'B 用刚才读到的 1 判断“还有票”' },
        { count: -1, aRead: '1', bRead: '1', a: '卖出', b: '卖出', note: '结果：卖出 2 张，实际只有 1 张' }
      ];

      function draw(step) {
        clear(host);
        var st = states[step];
        var wrap = h('div', 'stack-16');

        var counter = h('div', 'card plain center');
        counter.innerHTML =
          '<div class="small muted">共享变量 · 剩余票数</div>' +
          '<div class="big-num ' + (st.count < 0 ? '' : '') + '" style="color:' + (st.count < 0 ? 'var(--danger)' : 'var(--accent-ink)') + '">' + st.count + '</div>' +
          '<div class="small muted">' + esc(st.note) + '</div>';
        wrap.appendChild(counter);

        var sellers = h('div', 'split');
        ['A', 'B'].forEach(function (who) {
          var c = h('div', 'card plain');
          var read = who === 'A' ? st.aRead : st.bRead;
          var state = who === 'A' ? st.a : st.b;
          var active = (step === 1 && who === 'A') || (step === 2 && who === 'B') ||
            (step === 3 && who === 'A') || (step === 4 && who === 'B');
          c.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
          c.innerHTML =
            '<div class="row"><span class="chip ' + (active ? 'accent' : '') + '">售票员 ' + who + '</span>' +
            '<span class="spacer"></span><span class="small muted">' + esc(state) + '</span></div>' +
            '<div class="row" style="margin-top:8px"><span class="small muted">手里读到的值</span>' +
            '<span class="chip"><b>' + read + '</b></span></div>';
          if (active) c.classList.add('pop-in');
          sellers.appendChild(c);
        });
        wrap.appendChild(sellers);

        if (step === 2) {
          var t = h('div', 'term');
          t.innerHTML = '<b>上下文切换</b>　CPU 从一个进程换到另一个进程。A 还没来得及写回，CPU 先切到了 B，两边都以为“还有 1 张票”。';
          wrap.appendChild(t);
        }
        if (step >= 4) {
          wrap.appendChild(A.box('danger',
            '<b>超卖！</b>两个进程都通过了“还有票”的判断，最后票数变成 −1。卖出的票比实际库存还多。'));
        }
        if (step >= 5) {
          wrap.appendChild(A.term('临界区', '访问共享变量的那几行代码（读、判断、写回）。同一时刻只能让一个进程进去，否则就会像这样互相覆盖。'));
        }
        add(host, wrap);
      }

      return {
        steps: [
          { sub: '售票系统里有一个共享变量“剩余票数”，现在是 1。两个售票员同时卖票，会发生什么？', duration: 6000, draw: function () { draw(0); } },
          { sub: '售票员 A 先读到 1：还有票，准备卖。', duration: 5000, draw: function () { draw(1); } },
          { sub: 'A 还没来得及写回，CPU 切换到了 B。B 也读到 1。现在两个人都以为还有票。', duration: 6400, draw: function () { draw(2); } },
          { sub: 'A 卖出 1 张，把 0 写回共享变量。到这里看起来还正常。', duration: 5400, draw: function () { draw(3); } },
          { sub: 'B 也用刚才读到的 1 判断“还有票”，卖出，0 − 1 = −1。票数被卖成负数。', duration: 6400, draw: function () { draw(4); } },
          { sub: '卖出 2 张，实际只有 1 张。要避免这种事，访问共享变量必须“一个一个来”——这就是 PV 要解决的问题。', duration: 6800, draw: function () { draw(5); } }
        ]
      };
    }
  };

  /* ---------------- 2.1 两种关系 ---------------- */
  var scene21 = {
    id: '2.1',
    short: '互斥与同步',
    title: '互斥像厕所门锁，同步像接力赛',
    build: function (host) {
      function mutexStep() {
        clear(host);
        var c = h('div', 'card plain');
        c.innerHTML =
          '<div class="row"><span class="chip accent">互斥</span><b>一次只能进一个</b></div>' +
          '<div class="relation-stage" style="margin-top:14px">' +
            '<div class="room"><div class="room-label">临界区</div><div class="proc" style="--c:var(--p1)">进程 A</div></div>' +
            '<div class="door-line"><span class="lock-icon"></span><span class="small muted">门锁上</span></div>' +
            '<div class="waiting"><span class="proc ghost">进程 B</span><span class="small muted">门外等待</span></div>' +
          '</div>';
        add(host, c);
        add(host, A.term('互斥', '像厕所门锁：里面有人，外面的人只能等；里面的出来后，外面才能进。'));
        add(host, A.box('ok', '生活类比：同一个座位、同一支笔、同一个共享变量，都只能一个人用。'));
      }

      function syncStep() {
        clear(host);
        var c = h('div', 'card plain');
        c.innerHTML =
          '<div class="row"><span class="chip accent">同步</span><b>有先后顺序</b></div>' +
          '<div class="relay" style="margin-top:14px">' +
            '<div class="relay-runner"><span class="proc" style="--c:var(--p1)">第一棒</span><small>先跑</small></div>' +
            '<div class="relay-arrow">接力棒 →</div>' +
            '<div class="relay-runner"><span class="proc" style="--c:var(--p2)">第二棒</span><small>必须等棒到</small></div>' +
          '</div>';
        add(host, c);
        add(host, A.term('同步', '像接力赛：第二棒必须等第一棒把接力棒交过来，才能起跑。顺序错了，比赛就乱了。'));
        add(host, A.box('ok', '区别：互斥是“不能同时”，同步是“必须按顺序”。'));
      }

      function defineStep() {
        clear(host);
        add(host, A.term('临界资源', '一次只允许一个进程使用的资源，比如打印机、同一张票、同一段共享缓冲区。'));
        add(host, A.term('临界区', '进程里“访问临界资源”的那段代码。我们要做的，就是让临界区同一时刻只有一个进程在执行。'));
        var codeBox = code([
          'P(mutex);        // 进门，上锁',
          '    临界区;      // 访问共享资源',
          'V(mutex);        // 出门，开锁'
        ], [1, 2, 3], '互斥模板（先看形状，后面细讲）');
        add(host, codeBox);
        add(host, A.box('warn', '注意：P 和 V 必须夹住临界区，而且通常要成对出现。只 P 不 V，别人就永远进不来了。'));
      }

      return {
        steps: [
          { sub: '互斥：像厕所门锁，一次只能进一个。里面有人，外面的人只能等。', duration: 6000, draw: mutexStep },
          { sub: '同步：像接力赛，第二棒必须等第一棒把棒交过来。它管的是“先后顺序”。', duration: 6000, draw: syncStep },
          { sub: '临界资源是“只能一个人用的东西”，临界区是“访问它的那段代码”。PV 就是给临界区上锁。', duration: 6600, draw: defineStep }
        ]
      };
    }
  };

  /* ---------------- 2.2 信号量 ---------------- */
  var scene22 = {
    id: '2.2',
    short: '信号量 P/V',
    title: '信号量：一个计数器 + 一条等待队列',
    build: function (host) {
      var sem = E.makeSem(2);
      var states = [];
      function snap(extra) {
        var s = {
          value: sem.value,
          waiters: sem.waiters.slice()
        };
        if (extra) for (var k in extra) s[k] = extra[k];
        states.push(s);
      }
      snap({ op: 'init', actor: null });
      E.semP(sem, 'P1');
      snap({ op: 'P', actor: 'P1', blocked: false });
      var p2 = E.semP(sem, 'P2');
      snap({ op: 'P', actor: 'P2', blocked: p2.blocked });
      var p3 = E.semP(sem, 'P3');
      snap({ op: 'P', actor: 'P3', blocked: p3.blocked });
      var v = E.semV(sem);
      snap({ op: 'V', actor: 'P2', woke: v.woke });
      snap({ op: 'summary', actor: null });
      snap({ op: 'range', actor: null });

      function processState(pid, step) {
        if (step === 0) return { cls: '', txt: '就绪' };
        if (pid === 'P1') return step >= 1 ? { cls: 'done', txt: 'P 通过' } : { cls: '', txt: '就绪' };
        if (pid === 'P2') return step >= 2 ? { cls: 'done', txt: step === 4 ? '执行 V' : 'P 通过' } : { cls: '', txt: '就绪' };
        if (pid === 'P3') {
          if (step === 3) return { cls: 'block', txt: '阻塞排队' };
          if (step >= 4) return { cls: 'run', txt: '被唤醒' };
          return { cls: '', txt: '就绪' };
        }
        return { cls: '', txt: '' };
      }

      function draw(step) {
        clear(host);
        var st = states[step];
        var value = st.value;

        var wrap = h('div', 'stack-16');
        var big = h('div', 'sem-big-wrap');
        big.innerHTML =
          '<div class="small muted">信号量 S 的当前值</div>' +
          '<div class="sem-big ' + (value < 0 ? 'neg' : value === 0 ? 'zero' : '') + (step > 0 ? ' bump' : '') + '">' + value + '</div>' +
          '<div class="small muted">' +
            (value > 0 ? '还有 ' + value + ' 个资源可用' : value === 0 ? '资源刚好用完，没人等待' : '有 ' + Math.abs(value) + ' 个进程在等待') +
          '</div>';
        wrap.appendChild(big);

        var procs = h('div', 'row tight');
        ['P1', 'P2', 'P3'].forEach(function (pid) {
          var ps = processState(pid, step);
          var d = h('div', 'proc-state ' + ps.cls);
          d.innerHTML = '<div class="pid">' + pid + '</div><div class="st">' + ps.txt + '</div>';
          procs.appendChild(d);
        });
        wrap.appendChild(procs);

        var wq = h('div', 'wait-queue');
        wq.innerHTML = '<b style="font-size:12px">等待队列</b>' +
          (st.waiters.length
            ? st.waiters.map(function (w) { return '<span class="chip danger">' + w + '</span>'; }).join('')
            : '<span class="small" style="color:var(--faint)">（空）</span>');
        wrap.appendChild(wq);

        var codeBox = code([
          'P(S):  S = S - 1;',
          '       if (S < 0) 阻塞，进入等待队列;',
          '',
          'V(S):  S = S + 1;',
          '       if (S <= 0) 唤醒一个等待者;'
        ], step >= 1 && step <= 3 ? [1, 2] : step === 4 ? [4, 5] : [], 'P / V 的规则');
        wrap.appendChild(codeBox);

        if (step === 5) {
          var cards = h('div', 'split');
          cards.innerHTML =
            '<div class="card"><b>S &gt; 0</b><div class="small muted">还有 S 个资源可用</div></div>' +
            '<div class="card"><b>S &lt; 0</b><div class="small muted">|S| 就是等待进程数</div></div>';
          wrap.appendChild(cards);
          wrap.appendChild(A.term('信号量', '可以想成“停车场的剩余车位牌 + 等车位队伍”：数字是车位，队伍是等待的进程。'));
        }

        if (step === 6) {
          var f = h('div', 'formula');
          f.innerHTML =
            '初值 k，M 个进程竞争：取值范围 <span class="hl">[k − M, k]</span><br>' +
            '例：初值 2、6 个进程 → [' + (2 - 6) + ', 2]<br>' +
            '例：初值 4、当前值 1 → 可用 1 个，等待 0 个';
          wrap.appendChild(f);
          wrap.appendChild(A.box('ok',
            '<b>为什么下界是负的：</b>每有一个进程被阻塞，值就再减 1；绝对值就是排队人数。'));
        }

        add(host, wrap);
      }

      var range26 = E.semRange(2, 6);
      var steps = [
        { sub: '信号量 = 一个计数器 + 一条等待队列。初值 2 表示一开始有 2 个资源。', duration: 6200, draw: function () { draw(0); } },
        { sub: 'P1 执行 P：2 − 1 = ' + states[1].value + ' ≥ 0，直接通过。P 就是“申请一个资源”。', duration: 5600, draw: function () { draw(1); } },
        { sub: 'P2 执行 P：' + states[1].value + ' − 1 = ' + states[2].value + '，刚好用完，也通过。', duration: 5400, draw: function () { draw(2); } },
        { sub: 'P3 执行 P：' + states[2].value + ' − 1 = ' + states[3].value + ' < 0，资源不够，P3 阻塞，排进等待队列。', duration: 6200, draw: function () { draw(3); } },
        { sub: '来一个 V：' + states[3].value + ' + 1 = ' + states[4].value + '，≤ 0 说明有人在等，唤醒 P3。V 就是“归还一个资源”。', duration: 6200, draw: function () { draw(4); } },
        { sub: '记住：value > 0 是可用资源数；value < 0 时，绝对值是等待的进程数。', duration: 6200, draw: function () { draw(5); } },
        { sub: '初值 k、M 个进程竞争，取值范围 [k−M, k]。例：初值 2、6 个进程 → [' + range26.min + ', ' + range26.max + ']。', duration: 6400, draw: function () { draw(6); } }
      ];

      return { steps: steps };
    }
  };

  /* ---------------- 2.3 互斥模板 ---------------- */
  var scene23 = {
    id: '2.3',
    short: '互斥模板',
    title: '互斥模板：P/V 夹住临界区',
    build: function (host) {
      var sem = E.makeSem(1);
      var states = [];
      function snap(extra) {
        var s = { value: sem.value, waiters: sem.waiters.slice() };
        if (extra) for (var k in extra) s[k] = extra[k];
        states.push(s);
      }
      snap({ op: 'init' });
      E.semP(sem, 'A');
      snap({ op: 'P', actor: 'A', blocked: false });
      E.semP(sem, 'B');
      snap({ op: 'P', actor: 'B', blocked: true });
      var v = E.semV(sem);
      snap({ op: 'V', actor: 'A', woke: v.woke });
      E.semV(sem);
      snap({ op: 'V', actor: 'B', woke: null });

      function draw(step) {
        clear(host);
        var st = states[step];
        var wrap = h('div', 'stack-16');

        var top = h('div', 'split');
        var left = h('div', 'card plain');
        left.innerHTML =
          '<div class="row"><b>进程 A</b><span class="spacer"></span>' +
          '<span class="chip ' + (step === 1 ? 'accent' : step >= 3 ? 'ok' : '') + '">' +
            (step === 0 ? '等待' : step === 1 ? '进入临界区' : step === 2 ? '临界区中' : '已完成') + '</span></div>';
        var right = h('div', 'card plain');
        right.innerHTML =
          '<div class="row"><b>进程 B</b><span class="spacer"></span>' +
          '<span class="chip ' + (step === 2 ? 'danger' : step >= 4 ? 'ok' : '') + '">' +
            (step <= 1 ? '等待' : step === 2 ? '阻塞在 P' : step === 3 ? '被唤醒' : '已完成') + '</span></div>';
        top.appendChild(left);
        top.appendChild(right);
        wrap.appendChild(top);

        var mid = h('div', 'card center');
        mid.innerHTML =
          '<div class="small muted">mutex 当前值</div>' +
          '<div class="sem-big ' + (st.value < 0 ? 'neg' : st.value === 0 ? 'zero' : '') + '" style="font-size:60px">' + st.value + '</div>' +
          '<div class="small muted">1 = 空闲；0 = 有人占用；负数的绝对值 = 排队人数</div>';
        wrap.appendChild(mid);

        var wq = h('div', 'wait-queue');
        wq.innerHTML = '<b style="font-size:12px">等待队列</b>' +
          (st.waiters.length ? st.waiters.map(function (w) { return '<span class="chip danger">' + w + '</span>'; }).join('') : '<span class="small" style="color:var(--faint)">（空）</span>');
        wrap.appendChild(wq);

        var lines = [
          'mutex = 1;',
          '',
          '// 进程 A',
          'P(mutex);',
          '    临界区;',
          'V(mutex);',
          '',
          '// 进程 B',
          'P(mutex);',
          '    临界区;',
          'V(mutex);'
        ];
        var active = [];
        if (step === 1) active = [4, 5];
        if (step === 2) active = [9];
        if (step === 3) active = [6, 9, 10];
        if (step === 4) active = [11];
        if (step === 0) active = [1];
        wrap.appendChild(code(lines, active, '互斥模板'));

        if (step >= 3) {
          wrap.appendChild(A.box('ok',
            '<b>关键：</b>P 和 V 必须夹住同一个临界区，而且成对。A 的 V 把 B 唤醒，B 才能进入。'));
        }

        add(host, wrap);
      }

      return {
        steps: [
          { sub: '模板：mutex = 1；进程里先 P(mutex)，再执行临界区，最后 V(mutex)。', duration: 6000, draw: function () { draw(0); } },
          { sub: 'A 执行 P：mutex ' + states[0].value + ' → ' + states[1].value + '，拿到锁，进入临界区。', duration: 5400, draw: function () { draw(1); } },
          { sub: 'B 也执行 P：mutex ' + states[1].value + ' → ' + states[2].value + '，没有锁，B 阻塞排队。', duration: 5800, draw: function () { draw(2); } },
          { sub: 'A 执行 V：mutex ' + states[2].value + ' → ' + states[3].value + '，唤醒 B。A 离开，B 拿到锁。', duration: 5800, draw: function () { draw(3); } },
          { sub: 'B 执行 V：mutex ' + states[3].value + ' → ' + states[4].value + '，锁回到空闲。P/V 必须成对，少一个就会出问题。', duration: 6000, draw: function () { draw(4); } }
        ]
      };
    }
  };

  /* ---------------- 2.4 生产者消费者 ---------------- */
  var scene24 = {
    id: '2.4',
    short: '生产者–消费者',
    title: '生产者–消费者：有界缓冲区 N=5',
    build: function (host) {
      var sems = {
        mutex: E.makeSem(1),
        empty: E.makeSem(5),
        full: E.makeSem(0)
      };
      var buffer = [null, null, null, null, null];
      var inP = 0;
      var outP = 0;
      var seq = 0;
      var states = [];

      function snapshot(extra) {
        var s = {
          mutex: sems.mutex.value,
          empty: sems.empty.value,
          full: sems.full.value,
          mWait: sems.mutex.waiters.slice(),
          eWait: sems.empty.waiters.slice(),
          fWait: sems.full.waiters.slice(),
          buffer: buffer.slice(),
          inP: inP,
          outP: outP,
          justIn: null,
          justOut: null
        };
        if (extra) for (var k in extra) s[k] = extra[k];
        states.push(s);
      }

      snapshot({ op: 'init' });
      E.semP(sems.empty, '生产者'); snapshot({ op: 'P(empty)' });
      E.semP(sems.mutex, '生产者'); snapshot({ op: 'P(mutex)' });
      seq += 1; buffer[inP] = '产品' + seq; var firstSlot = inP; inP = (inP + 1) % 5;
      snapshot({ op: 'put', justIn: firstSlot });
      E.semV(sems.mutex); snapshot({ op: 'V(mutex)' });
      E.semV(sems.full); snapshot({ op: 'V(full)' });
      // 第二个产品
      E.semP(sems.empty, '生产者'); E.semP(sems.mutex, '生产者');
      seq += 1; buffer[inP] = '产品' + seq; var secondSlot = inP; inP = (inP + 1) % 5;
      E.semV(sems.mutex); E.semV(sems.full);
      snapshot({ op: 'produce2', justIn: secondSlot });
      // 消费一个
      E.semP(sems.full, '消费者'); snapshot({ op: 'C P(full)' });
      E.semP(sems.mutex, '消费者'); snapshot({ op: 'C P(mutex)' });
      var taken = buffer[outP];
      buffer[outP] = null;
      var takenSlot = outP;
      outP = (outP + 1) % 5;
      snapshot({ op: 'take', justOut: takenSlot, taken: taken });
      E.semV(sems.mutex); E.semV(sems.empty);
      snapshot({ op: 'C V' });
      snapshot({ op: 'template' });
      // 填满：连续生产 4 个，最后统一记录一次状态
      for (var i = 0; i < 4; i++) {
        E.semP(sems.empty, '生产者');
        E.semP(sems.mutex, '生产者');
        seq += 1;
        buffer[inP] = '产品' + seq;
        inP = (inP + 1) % 5;
        E.semV(sems.mutex);
        E.semV(sems.full);
      }
      snapshot({ op: 'fill' });
      // 错误顺序
      E.semP(sems.mutex, '生产者');
      var pe = E.semP(sems.empty, '生产者');
      snapshot({ op: 'wrong1', blocked: pe.blocked });
      E.semP(sems.full, '消费者');
      var cm = E.semP(sems.mutex, '消费者');
      snapshot({ op: 'wrong2', blocked2: cm.blocked });
      snapshot({ op: 'rule' });

      var produceLines = ['P(empty);', 'P(mutex);', '放入产品;', 'V(mutex);', 'V(full);'];
      var consumeLines = ['P(full);', 'P(mutex);', '取出产品;', 'V(mutex);', 'V(empty);'];

      function semRow(st, changed) {
        var row = h('div', 'sem-grid');
        row.appendChild(semCard('mutex', st.mutex, '缓冲区锁', changed === 'mutex'));
        row.appendChild(semCard('empty', st.empty, '空位数', changed === 'empty'));
        row.appendChild(semCard('full', st.full, '产品数', changed === 'full'));
        return row;
      }

      function bufferView(st) {
        var box = h('div', 'buffer');
        st.buffer.forEach(function (item, idx) {
          var s = h('div', 'slot' + (item ? ' filled' : '') + (st.justIn === idx ? ' just' : '') + (st.justOut === idx ? ' just' : ''));
          s.innerHTML = '<span class="pidx">格 ' + (idx + 1) + '</span>' +
            (item ? '<span class="prod">●</span><span>' + esc(item) + '</span>' : '<span>空</span>');
          box.appendChild(s);
        });
        var info = h('div', 'row');
        info.innerHTML = '<span class="chip">生产指针 in = ' + st.inP + '</span>' +
          '<span class="chip">消费指针 out = ' + st.outP + '</span>' +
          '<span class="chip">产品数 full = ' + st.full + '</span>' +
          '<span class="chip">空位 empty = ' + st.empty + '</span>';
        var wrap = h('div', 'stack-10');
        wrap.appendChild(box);
        wrap.appendChild(info);
        return wrap;
      }

      function activeProducer(step) {
        if (step === 1) return [1];
        if (step === 2) return [2];
        if (step === 3) return [3];
        if (step === 4) return [4];
        if (step === 5) return [5];
        if (step === 6) return [1, 2, 3, 4, 5];
        return [];
      }
      function activeConsumer(step) {
        if (step === 7) return [1];
        if (step === 8) return [2];
        if (step === 9) return [3];
        if (step === 10) return [4, 5];
        return [];
      }

      function draw(step) {
        clear(host);
        var st = states[step];
        var wrap = h('div', 'stack-16');

        var changed = null;
        if (step === 1) changed = 'empty';
        if (step === 2) changed = 'mutex';
        if (step === 4) changed = 'mutex';
        if (step === 5) changed = 'full';
        if (step === 6) changed = 'full';
        if (step === 7) changed = 'full';
        if (step === 8) changed = 'mutex';
        if (step === 10) changed = 'empty';

        wrap.appendChild(semRow(st, changed));
        wrap.appendChild(bufferView(st));
        if (step === 0) {
          wrap.appendChild(A.term('生产者 / 消费者', '生产者像往货架上补货，消费者像从货架取货；5 个格子就是共享的货架（缓冲区）。'));
        }

        var split = h('div', 'split');
        var suffix = step >= 13 ? '（标准）' : '';
        var pcode = code(produceLines, activeProducer(step), '生产者' + suffix);
        var ccode = code(consumeLines, activeConsumer(step), '消费者' + suffix);
        split.appendChild(pcode);
        split.appendChild(ccode);
        wrap.appendChild(split);

        if (step >= 13 && step <= 15) {
          var wrong = code([
            '// 错误顺序：先拿锁，再等空位',
            'P(mutex);',
            'P(empty);   // 满的时候卡在这里',
            '放入产品;',
            'V(mutex);',
            'V(full);'
          ], step >= 13 ? [2, 3] : [], '反例：交换生产者的两个 P');
          wrap.appendChild(wrong);
        }

        if (step === 12) {
          wrap.appendChild(A.box('warn',
            '<b>现在缓冲区满了：</b>empty = 0，full = 5，mutex = 1。'));
        }
        if (step === 13) {
          wrap.appendChild(A.box('danger',
            '<b>生产者：</b>P(mutex) 成功，拿着锁；P(empty) 时 empty 已经是 0 → 生产者阻塞。<b>锁没有释放。</b>'));
        }
        if (step === 14) {
          wrap.appendChild(A.box('danger',
            '<b>死锁：</b>生产者拿着 mutex 等 empty；消费者等 mutex 才能取产品、释放 empty。两边互相等，谁也动不了。'));
          var cycle = h('div', 'card center');
          cycle.innerHTML =
            '<div class="row" style="justify-content:center;gap:10px">' +
              '<span class="proc" style="--c:var(--p1)">生产者</span>' +
              '<span class="muted">→ 等 empty →</span>' +
              '<span class="proc" style="--c:var(--p2)">消费者</span>' +
              '<span class="muted">→ 等 mutex →</span>' +
              '<span class="proc" style="--c:var(--p1)">生产者</span>' +
            '</div>';
          wrap.appendChild(cycle);
        }
        if (step === 15) {
          wrap.appendChild(A.box('ok',
            '<b>规则：</b>同步的 P（P(empty) / P(full)）放在互斥的 P(mutex) <b>之前</b>。V 的先后顺序不影响正确性。'));
        }

        add(host, wrap);
      }

      var putState = states[3];
      var putName = putState.buffer[putState.justIn];
      var putSlot = putState.justIn + 1;
      var takeState = states[9];
      var takeName = takeState.taken;
      var takeSlot = takeState.justOut + 1;
      var steps = [
        { sub: '缓冲区有 5 个格子。mutex=' + states[0].mutex + ' 管互斥，empty=' + states[0].empty + ' 记录空位，full=' + states[0].full + ' 记录已有产品。', duration: 6600, draw: function () { draw(0); } },
        { sub: '生产者先 P(empty)：empty ' + states[0].empty + ' → ' + states[1].empty + '，预订一个空位。', duration: 5400, draw: function () { draw(1); } },
        { sub: '再 P(mutex)：mutex ' + states[1].mutex + ' → ' + states[2].mutex + '，锁住缓冲区。', duration: 5200, draw: function () { draw(2); } },
        { sub: '把「' + putName + '」放进 ' + putSlot + ' 号格。注意：此时 full 还没加，消费者还不能拿。', duration: 5600, draw: function () { draw(3); } },
        { sub: 'V(mutex)：mutex ' + states[3].mutex + ' → ' + states[4].mutex + '，解锁。', duration: 5000, draw: function () { draw(4); } },
        { sub: 'V(full)：full ' + states[4].full + ' → ' + states[5].full + '，告诉消费者“有 ' + states[5].full + ' 个产品了”。', duration: 5400, draw: function () { draw(5); } },
        { sub: '再快速生产一个：empty ' + states[6].empty + '、full ' + states[6].full + '，缓冲区里现在有 ' + states[6].full + ' 个产品。', duration: 5800, draw: function () { draw(6); } },
        { sub: '消费者 P(full)：full ' + states[6].full + ' → ' + states[7].full + '，确认有产品可拿。', duration: 5400, draw: function () { draw(7); } },
        { sub: '消费者 P(mutex)：mutex ' + states[7].mutex + ' → ' + states[8].mutex + '，锁住缓冲区再取。', duration: 5400, draw: function () { draw(8); } },
        { sub: '取出「' + takeName + '」，' + takeSlot + ' 号格变空。', duration: 5200, draw: function () { draw(9); } },
        { sub: 'V(mutex) 解锁；V(empty) 空位 ' + states[9].empty + ' → ' + states[10].empty + '。两个 V 的先后不影响正确性。', duration: 5800, draw: function () { draw(10); } },
        { sub: '标准模板：生产者先 P(empty) 再 P(mutex)；消费者先 P(full) 再 P(mutex)。', duration: 6400, draw: function () { draw(11); } },
        { sub: '现在把缓冲区填满：empty = ' + states[12].empty + '，full = ' + states[12].full + '，mutex = ' + states[12].mutex + '。', duration: 5600, draw: function () { draw(12); } },
        { sub: '反例：生产者先 P(mutex) 拿到锁，再 P(empty)——没有空位，阻塞，但锁没放！', duration: 6800, draw: function () { draw(13); } },
        { sub: '消费者 P(full) 通过，但 P(mutex) 发现锁在生产者手里 → 也阻塞。双方互等：死锁。', duration: 6800, draw: function () { draw(14); } },
        { sub: '一句话：同步的 P 放在互斥的 P 之前。V 的先后顺序不影响正确性。', duration: 6200, draw: function () { draw(15); } }
      ];

      return { steps: steps };
    }
  };

  /* ---------------- 2.5 过桥 / 读者写者 ---------------- */
  var scene25 = {
    id: '2.5',
    short: '过桥 / 读者写者',
    title: '过桥问题：第一个上桥的人锁桥，最后一个下桥的人开锁',
    build: function (host) {
      var S = E.makeSem(1);
      var Sc1 = E.makeSem(1);
      var Sc2 = E.makeSem(1);
      var c1 = 0;
      var c2 = 0;
      var states = [];

      function snap(extra) {
        var s = { S: S.value, Sc1: Sc1.value, Sc2: Sc2.value, c1: c1, c2: c2, waiters: S.waiters.slice() };
        if (extra) for (var k in extra) s[k] = extra[k];
        states.push(s);
      }

      snap({ op: 'init' });
      // 方向1 第1人上桥
      E.semP(Sc1, 'L1'); if (c1 === 0) E.semP(S, 'L1'); c1++; E.semV(Sc1);
      snap({ op: 'L1 in' });
      // 方向1 第2人上桥
      E.semP(Sc1, 'L2'); if (c1 === 0) E.semP(S, 'L2'); c1++; E.semV(Sc1);
      snap({ op: 'L2 in' });
      // 方向2 第1人想上桥
      E.semP(Sc2, 'R1');
      var r1blocked = false;
      if (c2 === 0) {
        var r1wait = E.semP(S, 'R1');
        r1blocked = r1wait.blocked;
      }
      if (!r1blocked) { c2++; E.semV(Sc2); }
      snap({ op: 'R1 wait', r1blocked: r1blocked });
      // L1 下桥
      E.semP(Sc1, 'L1'); c1--; if (c1 === 0) E.semV(S); E.semV(Sc1);
      snap({ op: 'L1 out' });
      // L2 下桥 -> 唤醒 R1
      E.semP(Sc1, 'L2'); c1--; if (c1 === 0) E.semV(S); E.semV(Sc1);
      // 被唤醒的 R1 继续：count2++，V(Sc2)（在 P(S) 返回之后）
      c2++;
      E.semV(Sc2);
      snap({ op: 'L2 out, R1 in' });
      // R1 下桥
      E.semP(Sc2, 'R1'); c2--; if (c2 === 0) E.semV(S); E.semV(Sc2);
      snap({ op: 'R1 out' });
      snap({ op: 'summary' });

      function person(id, left, topPx, cls, badge) {
        var d = h('div', 'person ' + (cls || ''));
        d.style.left = left + '%';
        d.style.top = topPx + 'px';
        d.style.setProperty('--c', id === 'R1' ? 'var(--p2)' : 'var(--p1)');
        d.textContent = id;
        if (badge) d.innerHTML = id + '<span class="badge">' + badge + '</span>';
        return d;
      }

      function positions(step) {
        var l1x = step === 0 ? 7 : step <= 3 ? 46 : 93;
        var l2x = step <= 1 ? 7 : step <= 4 ? 61 : 93;
        var r1x = step <= 2 ? 93 : (step === 3 || step === 4) ? 82 : step === 5 ? 48 : 7;
        return { l1x: l1x, l2x: l2x, r1x: r1x };
      }

      function bridgeView(step) {
        var wrap = h('div', 'bridge-scene');
        wrap.innerHTML =
          '<div class="bank left"><div class="bank-label">左岸 · 方向1</div></div>' +
          '<div class="bank right"><div class="bank-label">右岸 · 方向2</div></div>' +
          '<div class="bridge-deck"><div class="deck-label">桥</div></div>';
        var p = positions(step);
        wrap.appendChild(person('L1', p.l1x, 82, step >= 4 ? 'done' : '', null));
        wrap.appendChild(person('L2', p.l2x, 108, step >= 5 ? 'done' : '', null));
        wrap.appendChild(person('R1', p.r1x, 95, step === 3 || step === 4 ? 'blocked' : step >= 6 ? 'done' : '',
          step === 3 || step === 4 ? '等 S' : null));
        var info = h('div', 'on-bridge');
        if (step >= 1 && step <= 3) info.textContent = '方向1：桥上 ' + (step === 1 ? 1 : 2) + ' 人';
        else if (step === 4) info.textContent = '方向1：桥上 1 人';
        else if (step === 5) info.textContent = '方向2：R1 上桥';
        else if (step >= 6) info.textContent = '桥空';
        else info.textContent = '桥空';
        wrap.appendChild(info);
        return wrap;
      }

      function codePanel(step) {
        var split = h('div', 'split');
        var d1 = code([
          '// 方向1',
          'wait(Scount1);',
          'if (count1==0) wait(S);',
          'count1++;',
          'signal(Scount1);',
          '过桥;',
          'wait(Scount1);',
          'count1--;',
          'if (count1==0) signal(S);',
          'signal(Scount1);'
        ], (step >= 1 && step <= 3) ? [1, 2, 3, 4, 5, 6] : (step === 4 || step === 5) ? [7, 8, 9, 10] : [], '方向1 代码');
        var d2 = code([
          '// 方向2（对称）',
          'wait(Scount2);',
          'if (count2==0) wait(S);',
          'count2++;',
          'signal(Scount2);',
          '过桥;',
          'wait(Scount2);',
          'count2--;',
          'if (count2==0) signal(S);',
          'signal(Scount2);'
        ], (step === 3 || step === 4) ? [1, 2] : step === 5 ? [3, 4, 5] : step === 6 ? [7, 8, 9, 10] : [], '方向2 代码');
        split.appendChild(d1);
        split.appendChild(d2);
        return split;
      }

      function draw(step) {
        clear(host);
        var st = states[step];
        var wrap = h('div', 'stack-16');

        wrap.appendChild(bridgeView(step));

        var sems = h('div', 'sem-grid');
        sems.appendChild(semCard('S（桥锁）', st.S, '1=桥空', step === 1 || step === 5 || step === 6));
        sems.appendChild(semCard('count1', st.c1, '方向1 人数'));
        sems.appendChild(semCard('count2', st.c2, '方向2 人数'));
        sems.appendChild(semCard('Scount1', st.Sc1, '保护 count1'));
        sems.appendChild(semCard('Scount2', st.Sc2, '保护 count2'));
        var wq = h('div', 'wait-queue');
        wq.innerHTML = '<b style="font-size:12px">等桥的人</b>' +
          (st.waiters.length ? st.waiters.map(function (w) { return '<span class="chip danger">' + w + '</span>'; }).join('') : '<span class="small" style="color:var(--faint)">（空）</span>');
        sems.appendChild(wq);
        wrap.appendChild(sems);

        wrap.appendChild(codePanel(step));

        if (step === 7) {
          wrap.appendChild(A.box('warn',
            '<b>饥饿风险：</b>如果一个方向一直有人上桥，count1 永远不归 0，S 就一直不开，对向的人可能一直等。'));
          wrap.appendChild(A.term('读者–写者', '桥就是共享资源；同一方向的人像“读者”可以一起进，反方向像“写者”必须独占。'));
        }
        add(host, wrap);
      }

      function readerWriterStep() {
        clear(host);
        add(host, A.term('把桥换成共享数据', '同一方向的人像“读者”：可以一起读；反方向像“写者”：必须独占。桥 = 共享资源。'));
        var split = h('div', 'split');
        split.appendChild(code([
          '// 读者优先（rmutex=1, wmutex=1）',
          'P(rmutex);',
          'if (count==0) P(wmutex);',
          'count++;',
          'V(rmutex);',
          '读;',
          'P(rmutex);',
          'count--;',
          'if (count==0) V(wmutex);',
          'V(rmutex);'
        ], [], '读者'));
        split.appendChild(code([
          '// 写者',
          'P(wmutex);',
          '写;',
          'V(wmutex);'
        ], [], '写者'));
        add(host, split);
        add(host, A.box('ok',
          '<b>对照过桥：</b>count 就是同一方向的人数；第一个读者 P(wmutex) 锁住写者，最后一个读者 V(wmutex) 放开。'));
        add(host, A.box('warn',
          '<b>饥饿：</b>读者源源不断时，写者可能一直等不到 wmutex。这就是“读者优先”的代价。'));
      }

      var steps = [
        { sub: '桥的规则：同一方向可以同时过，两个方向不能同时过。第一个上桥的人锁桥，最后一个下桥的人开锁。', duration: 6800, draw: function () { draw(0); } },
        { sub: '方向1 的 L1 上桥：count1 从 ' + states[0].c1 + ' 变 ' + states[1].c1 + '，它是第一个人 → P(S)，S ' + states[0].S + ' → ' + states[1].S + '，把桥锁上。', duration: 6400, draw: function () { draw(1); } },
        { sub: 'L2 也上桥：count1 从 ' + states[1].c1 + ' 变 ' + states[2].c1 + '，它不是第一个，不用再锁桥，直接过。', duration: 6200, draw: function () { draw(2); } },
        { sub: '右岸的 R1 想上桥：count2=' + states[2].c2 + '，它需要 P(S)，但 S 已经被方向1 锁住 → S ' + states[2].S + ' → ' + states[3].S + '，R1 阻塞等桥。', duration: 6800, draw: function () { draw(3); } },
        { sub: 'L1 下桥：count1 ' + states[3].c1 + ' → ' + states[4].c1 + '，还没归零，所以不能开桥。', duration: 5800, draw: function () { draw(4); } },
        { sub: 'L2 下桥：count1 ' + states[4].c1 + ' → ' + states[5].c1 + '，最后一个走 → V(S)，S ' + states[4].S + ' → ' + states[5].S + '，唤醒 R1。', duration: 6400, draw: function () { draw(5); } },
        { sub: 'R1 过桥，count2 ' + states[5].c2 + ' → ' + states[6].c2 + '，最后一个下桥 → V(S)，S ' + states[5].S + ' → ' + states[6].S + '，桥恢复空闲。', duration: 6000, draw: function () { draw(6); } },
        { sub: '代价：一个方向持续有人时，对向可能一直等（饥饿）。这也是读者优先写法的特点。', duration: 6800, draw: function () { draw(7); } },
        { sub: '读者–写者标准写法：第一个读者锁写者，最后一个读者放开；写者永远是独占。', duration: 7000, draw: readerWriterStep }
      ];

      return { steps: steps };
    }
  };

  /* ---------------- 2.6 前趋图 ---------------- */
  var scene26 = {
    id: '2.6',
    short: '前趋图 → PV',
    title: '前趋图：每条箭头一个信号量',
    build: function (host) {
      var sa = E.makeSem(0);
      var sb = E.makeSem(0);
      var sc = E.makeSem(0);
      var sd = E.makeSem(0);
      var values = [];
      function snapValues() {
        values.push({ a: sa.value, b: sb.value, c: sc.value, d: sd.value });
      }
      snapValues();
      E.semV(sa); E.semV(sb); snapValues();
      E.semP(sa, 'P2'); E.semV(sc); snapValues();
      E.semP(sb, 'P3'); E.semV(sd); snapValues();
      E.semP(sc, 'P4'); E.semP(sd, 'P4'); snapValues();
      snapValues();

      function graph(step, vals) {
        var wrap = h('div', 'svg-wrap');
        var lit = {
          a: step >= 1 && step <= 2,
          b: step >= 1 && step <= 3,
          c: step >= 2 && step <= 4,
          d: step >= 3 && step <= 4
        };
        var active = {
          S1: step === 1,
          S2: step === 2,
          S3: step === 3,
          S4: step === 4
        };
        function node(x, y, id) {
          return '<g>' +
            '<rect class="node-rect ' + (active[id] ? 'active' : '') + '" x="' + (x - 45) + '" y="' + (y - 25) + '" width="90" height="50" rx="11"/>' +
            '<text class="node-text ' + (active[id] ? 'active' : '') + '" x="' + x + '" y="' + (y - 2) + '" text-anchor="middle">' + id + '</text>' +
            '<text x="' + x + '" y="' + (y + 14) + '" text-anchor="middle" font-size="10.5" fill="' + (active[id] ? '#fff' : 'var(--muted)') + '">' + id.replace('S', 'P') + '</text>' +
          '</g>';
        }
        function edge(d, label, lx, ly, on) {
          return '<path class="edge ' + (on ? 'lit' : '') + '" d="' + d + '" marker-end="url(#' + (on ? 'arrLit' : 'arr') + ')"/>' +
            '<text class="edge-label ' + (on ? 'lit' : '') + '" x="' + lx + '" y="' + ly + '" text-anchor="middle">' + label + '=' + vals[label] + '</text>';
        }
        wrap.innerHTML =
          '<svg viewBox="0 0 640 300" role="img" aria-label="前趋图">' +
            '<defs>' +
              '<marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--border-strong)"/></marker>' +
              '<marker id="arrLit" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/></marker>' +
            '</defs>' +
            edge('M160 135 L282 92', 'a', 222, 106, lit.a) +
            edge('M160 165 L282 208', 'b', 222, 200, lit.b) +
            edge('M375 92 L503 136', 'c', 438, 106, lit.c) +
            edge('M375 208 L503 164', 'd', 438, 200, lit.d) +
            node(120, 150, 'S1') +
            node(330, 70, 'S2') +
            node(330, 230, 'S3') +
            node(550, 150, 'S4') +
          '</svg>';
        return wrap;
      }

      function semStrip(vals) {
        var row = h('div', 'sem-grid four');
        ['a', 'b', 'c', 'd'].forEach(function (k) {
          var d = h('div', 'sem-card');
          d.innerHTML = '<div class="name">' + k + '</div><div class="val ' + (vals[k] ? 'zero' : '') + '">' + vals[k] + '</div><div class="sub">信号量</div>';
          row.appendChild(d);
        });
        return row;
      }

      var lines = [
        'Semaphore a=0, b=0, c=0, d=0;',
        '',
        'P1: S1; V(a); V(b);',
        'P2: P(a); S2; V(c);',
        'P3: P(b); S3; V(d);',
        'P4: P(c); P(d); S4;'
      ];

      function draw(step) {
        clear(host);
        var vals = values[step];
        var wrap = h('div', 'stack-16');
        if (step === 0) {
          wrap.appendChild(A.term('前趋图', '方框是“一段程序”，箭头表示“谁必须先做完”。箭头上的 a、b、c、d 是信号量。'));
        }
        wrap.appendChild(graph(step, vals));
        wrap.appendChild(semStrip(vals));
        wrap.appendChild(code(lines, step === 0 ? [1] : step === 1 ? [3] : step === 2 ? [4] : step === 3 ? [5] : step === 4 ? [6] : [1, 3, 4, 5, 6], '信号量与前趋代码'));
        if (step === 5) {
          wrap.appendChild(A.box('ok',
            '<b>口诀：</b>每条箭头设一个信号量，初值 0；前驱执行完 V，后继执行前 P。'));
        }
        add(host, wrap);
      }

      return {
        steps: [
          { sub: '前趋图：S1 → S2、S1 → S3、S2 → S4、S3 → S4。每条箭头表示一个先后关系。', duration: 6400, draw: function () { draw(0); } },
          { sub: '每条箭头设一个信号量，初值 0。S1 做完，V(a)、V(b)，把 a、b 各加 1。', duration: 6400, draw: function () { draw(1); } },
          { sub: 'P2 先 P(a)：a 从 ' + values[1].a + ' 变 ' + values[2].a + '，说明 S1 已完成，可以执行 S2；做完 V(c)。', duration: 6400, draw: function () { draw(2); } },
          { sub: 'P3 同理：P(b) 从 ' + values[2].b + ' 变 ' + values[3].b + ' 后通过，执行 S3，再 V(d)。S2、S3 可以并行。', duration: 6400, draw: function () { draw(3); } },
          { sub: 'S4 有两个前驱：P(c)、P(d) 都要通过，才能执行 S4。', duration: 6200, draw: function () { draw(4); } },
          { sub: '口诀：每条箭头一个信号量，初值 0；前者执行完 V，后者执行前 P。', duration: 6200, draw: function () { draw(5); } }
        ]
      };
    }
  };

  /* ---------------- 2.7 哲学家就餐 ---------------- */
  var scene27 = {
    id: '2.7',
    short: '哲学家就餐',
    title: '哲学家就餐：5 个人、5 根筷子，为什么会死锁',
    build: function (host) {
      var cx = 220;
      var cy = 210;
      var pr = 158;
      var chr = 108;

      var room = E.makeSem(4);
      var roomVals = [];
      roomVals[3] = room.value;
      for (var ri = 0; ri < 4; ri++) E.semP(room, 'P' + ri);
      roomVals[4] = room.value;
      E.semP(room, 'P4');
      roomVals[4] = room.value;
      roomVals[5] = room.value;
      E.semV(room);
      roomVals[6] = room.value;

      function pt(r, deg) {
        var rad = deg * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      }

      function svg(step) {
        var philPos = [];
        for (var i = 0; i < 5; i++) philPos.push(pt(pr, -90 + i * 72));
        var chopPos = [];
        for (var j = 0; j < 5; j++) chopPos.push(pt(chr, -54 + j * 72));

        var leftHeld = {};
        var rightHeld = {};
        var eat = null;
        var blockedPhil = null;
        if (step === 1 || step === 2) {
          for (var k = 0; k < 5; k++) leftHeld[k] = true;
        }
        if (step === 4 || step === 5) {
          if (step === 5) {
            leftHeld[0] = true; leftHeld[1] = true; leftHeld[2] = true; leftHeld[3] = true;
            rightHeld[0] = true;
            eat = 0;
          } else {
            for (var k2 = 0; k2 < 5; k2++) leftHeld[k2] = true;
          }
          blockedPhil = 4;
        }

        var parts = [];
        parts.push('<svg viewBox="0 0 440 440" role="img" aria-label="哲学家就餐">');
        parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="88" fill="var(--panel-2)" stroke="var(--border-strong)" stroke-width="2"/>');
        parts.push('<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="13" fill="var(--muted)">圆桌</text>');

        // 盘子
        for (var p = 0; p < 5; p++) {
          var pp = pt(70, -90 + p * 72);
          parts.push('<circle cx="' + pp.x + '" cy="' + pp.y + '" r="17" fill="var(--panel)" stroke="var(--border)" stroke-width="1.5"/>');
          parts.push('<circle cx="' + pp.x + '" cy="' + pp.y + '" r="6" fill="var(--panel-3)"/>');
        }

        // 筷子
        for (var c = 0; c < 5; c++) {
          var cp = chopPos[c];
          var held = leftHeld[c] || rightHeld[c];
          var dead = step === 2 && leftHeld[c];
          var eating = step === 5 && (c === 0 || c === 4);
          var col = eating ? '#1a9d67' : dead ? 'var(--danger)' : held ? 'var(--accent)' : 'var(--border-strong)';
          parts.push('<g transform="translate(' + cp.x + ',' + cp.y + ') rotate(' + (-54 + c * 72) + ')">' +
            '<rect x="-4" y="-20" width="8" height="40" rx="3" fill="' + col + '"/></g>');
          parts.push('<text x="' + (cp.x + 18) + '" y="' + (cp.y - 15) + '" font-size="10.5" fill="' + col + '" font-weight="700">筷' + (c + 1) + '</text>');
        }

        // 哲学家
        for (var q = 0; q < 5; q++) {
          var pp2 = philPos[q];
          var isBlocked = blockedPhil === q;
          var isEat = eat === q;
          var deadPhil = step === 2;
          var fill = isEat ? '#1a9d67' : isBlocked ? 'var(--danger)' : deadPhil ? 'var(--danger)' : 'var(--panel)';
          var stroke = isEat || isBlocked || deadPhil ? fill : 'var(--border-strong)';
          var textCol = isEat || isBlocked || deadPhil ? '#fff' : 'var(--text)';
          parts.push('<circle cx="' + pp2.x + '" cy="' + pp2.y + '" r="27" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>');
          parts.push('<text x="' + pp2.x + '" y="' + (pp2.y + 5) + '" text-anchor="middle" font-size="13" font-weight="800" fill="' + textCol + '">P' + q + '</text>');
          var label = '';
          if (isEat) label = '吃到';
          else if (isBlocked) label = '等 room';
          else if (step === 1) label = '拿着左筷';
          else if (step === 2) label = '等右筷';
          else if (step === 4) label = '已进场';
          else if (step === 5 && (q === 1 || q === 2 || q === 3)) label = '等右筷';
          if (label) {
            parts.push('<text x="' + pp2.x + '" y="' + (pp2.y + 42) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="' +
              (isEat ? '#1a9d67' : isBlocked || step === 2 ? 'var(--danger)' : 'var(--muted)') + '">' + label + '</text>');
          }
        }

        if (step === 2) {
          parts.push('<text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="14" font-weight="800" fill="var(--danger)">死锁</text>');
          parts.push('<text x="' + cx + '" y="' + (cy + 52) + '" text-anchor="middle" font-size="10.5" fill="var(--muted)">5 人各拿左筷，等右筷</text>');
        }
        if (step === 5) {
          parts.push('<text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#1a9d67">P0 拿到两筷</text>');
        }
        parts.push('</svg>');
        return '<div class="svg-wrap narrow">' + parts.join('') + '</div>';
      }

      function draw(step) {
        clear(host);
        var wrap = h('div', 'stack-16');
        var viz = h('div', '');
        viz.innerHTML = svg(step);
        wrap.appendChild(viz);

        if (step >= 3) {
          var roomVal = roomVals[step];
          var freeChop = [5, 0, 0, 5, 1, 0, 5][step];
          var row = h('div', 'sem-grid');
          row.appendChild(semCard('room', roomVal, '最多允许 4 人拿筷'));
          row.appendChild(semCard('空闲筷子', freeChop, '一共 5 根'));
          wrap.appendChild(row);
        }

        if (step === 0) {
          wrap.appendChild(A.term('死锁', '每个人都占着一个资源，同时在等别人手里的资源，谁都不肯先放 —— 大家永远卡住。'));
          wrap.appendChild(A.box('ok', '规则：每个人先拿左边的筷子，再拿右边的筷子。'));
        }
        if (step === 1) {
          wrap.appendChild(A.box('warn', '5 个人同时拿起左边的筷子。现在每根筷子都被一个人占着。'));
        }
        if (step === 2) {
          wrap.appendChild(A.box('danger',
            '<b>死锁：</b>每个人都在等右边那根，而右边那根正被旁边的人拿着。循环等待，谁也吃不到。'));
        }
        if (step === 3) {
          wrap.appendChild(A.term('解法：加一个“门”', '设信号量 room = 4，最多允许 4 个人同时拿筷子。至少有一个人能拿到两根。'));
        }
        if (step === 4) {
          wrap.appendChild(A.box('ok',
            '<b>P0–P3 先 P(room) 进场，room 4 → 0；P4 被挡在门外。</b>现在桌上只有 4 个人。'));
        }
        if (step === 5) {
          wrap.appendChild(A.box('ok',
            '<b>4 个人各拿左筷后，P0 的右边那根空着</b>（因为 P4 没进场）。P0 拿起右筷，吃完放下，其他人就能依次吃。'));
        }
        if (step === 6) {
          wrap.appendChild(A.box('ok',
            '<b>结论：</b>room = 4 破坏了“5 个人同时各拿一根”的循环等待条件，所以不会死锁。P0 吃完 V(room) 后，P4 也能进场。'));
        }
        add(host, wrap);
      }

      return {
        steps: [
          { sub: '5 个哲学家围坐，5 根筷子。每个人先拿左边的，再拿右边的。', duration: 6200, draw: function () { draw(0); } },
          { sub: '如果 5 个人同时拿起左边的筷子：每根筷子都被占住，每个人手里都只有一根。', duration: 6400, draw: function () { draw(1); } },
          { sub: '接着每个人都等右边那根 —— 而右边那根正被旁边的人拿着。循环等待，死锁。', duration: 6600, draw: function () { draw(2); } },
          { sub: '解法：设 room = 4，最多允许 4 个人同时拿筷子。', duration: 6000, draw: function () { draw(3); } },
          { sub: 'P0–P3 执行 P(room) 进入，room 4 → 0；P4 再 P(room) → ' + roomVals[4] + '，阻塞在门外。', duration: 6200, draw: function () { draw(4); } },
          { sub: '4 个人各拿左筷后，P0 右边的筷子是空的 → P0 拿起两根，开始吃。', duration: 6400, draw: function () { draw(5); } },
          { sub: 'P0 吃完放下筷子，别人就能接着吃。至少有一个人能拿到两根，死锁被破坏。', duration: 6200, draw: function () { draw(6); } }
        ]
      };
    }
  };

  /* ---------------- 2.8 模板与错误 ---------------- */
  var scene28 = {
    id: '2.8',
    short: '模板 + 常见错误',
    title: 'PV 解题模板与常见错误',
    build: function (host) {
      function templateStep() {
        clear(host);
        add(host, A.box('ok', '<b>PV 题固定四步：</b>'));
        add(host, numList([
          '判断关系：是“不能同时”（互斥），还是“必须谁先谁后”（同步）。',
          '每个“等待条件”设一个信号量，并写初值：互斥通常 1；同步通常 0；资源计数用资源个数。',
          '互斥：P/V 夹住临界区，放在同一个进程里；同步：P 在一个进程、V 在另一个进程。',
          '检查顺序：同步的 P 必须放在互斥的 P 之前；每个 P 都要有对应的 V。'
        ]));
        add(host, A.term('一句话', 'P 是“等条件”，V 是“通知别人条件成立了”。谁等谁，就在谁那里 P，在对方那里 V。'));
      }

      function codeStep() {
        clear(host);
        var split = h('div', 'split');
        split.appendChild(code([
          '// 生产者',
          'P(empty);',
          'P(mutex);',
          '  放入产品;',
          'V(mutex);',
          'V(full);',
          '',
          '// 消费者',
          'P(full);',
          'P(mutex);',
          '  取出产品;',
          'V(mutex);',
          'V(empty);'
        ], [], '生产者–消费者（N=5：empty=5, full=0, mutex=1）'));
        split.appendChild(code([
          '// 读者（读者优先）',
          'P(rmutex);',
          'if (count==0) P(wmutex);',
          'count++;',
          'V(rmutex);',
          '  读;',
          'P(rmutex);',
          'count--;',
          'if (count==0) V(wmutex);',
          'V(rmutex);',
          '',
          '// 写者',
          'P(wmutex); 写; V(wmutex);'
        ], [], '读者–写者（rmutex=1, wmutex=1, count=0）'));
        add(host, split);
        add(host, A.term('读者优先', '第一个读者进来时锁住写者，最后一个读者离开时放开；读者之间可以同时读。'));
      }

      function errorStep() {
        clear(host);
        add(host, A.box('danger', '<b>PV 题满分检查表：</b>'));
        var errs = [
          ['初值写错', '互斥信号量通常 1；同步信号量通常 0；empty 是空位数，full 是产品数，别写反。'],
          ['P/V 没夹住临界区', '互斥的 P 和 V 必须在同一个进程里，中间才是临界区。'],
          ['P/V 不成对', '每个 P 都要有 V；少一个 V，等待的进程永远醒不过来。'],
          ['同步 P 放在互斥 P 后面', '生产者先 P(mutex) 再 P(empty)，缓冲区满时会死锁。'],
          ['读者写者忘了保护 count', 'count 是共享变量，修改它也要用 rmutex 夹住。'],
          ['忘了 mutex', '只有 empty/full 而没 mutex，多个生产者可能同时写同一格。']
        ];
        errs.forEach(function (e, i) {
          var c = h('div', 'card plain');
          c.innerHTML = '<div class="row"><span class="chip danger">' + (i + 1) + '</span><b>' + e[0] + '</b></div>' +
            '<div class="small muted" style="margin-top:4px">' + e[1] + '</div>';
          add(host, c);
        });
      }

      return {
        steps: [
          { sub: 'PV 四步法：判断关系 → 设信号量写初值 → P/V 夹住或配对 → 检查顺序。', duration: 6600, draw: templateStep },
          { sub: '两张必背模板：生产者消费者（三个信号量）和读者写者（读者优先，count 保护）。', duration: 6800, draw: codeStep },
          { sub: '最后检查：初值、成对、顺序、mutex、count 保护。', duration: 6600, draw: errorStep }
        ]
      };
    }
  };

  A.pvScenes = [scene20, scene21, scene22, scene23, scene24, scene25, scene26, scene27, scene28];
})(window.OSApp);

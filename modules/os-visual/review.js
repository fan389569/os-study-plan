/* 模块④：复盘与自测 */
(function (A) {
  'use strict';

  var E = A.E;
  var h = A.h;
  var esc = A.esc;
  var num = A.num;

  function paperSection(title, content) {
    var s = h('section', 'paper-section');
    s.appendChild(h('h3', '', title));
    if (typeof content === 'string') s.innerHTML += content;
    else s.appendChild(content);
    return s;
  }

  function miniCode(text) {
    return '<div class="mini-code">' + esc(text) + '</div>';
  }

  function buildPaper() {
    var paper = h('div', 'paper');
    paper.innerHTML =
      '<h2>一页纸 · 公式与模板卡</h2>' +
      '<div class="paper-sub">考前 10 分钟看这张 · 浅色底、黑字，可以直接截图或打印</div>';

    var grid = h('div', 'paper-grid');

    grid.appendChild(paperSection('1. 调度指标（必背）',
      '<div class="formula">' +
        '周转时间 = 完成时间 − 到达时间<br>' +
        '带权周转 = 周转时间 ÷ 运行时间<br>' +
        '等待时间 = 周转时间 − 运行时间<br>' +
        '<span class="hl">平均 = 各自求和 ÷ 进程个数</span>' +
      '</div>' +
      '<div class="tagline">周转 = 等待 + 运行；带权越接近 1 越好。</div>'
    ));

    grid.appendChild(paperSection('2. 时间片轮转 RR',
      '<div class="formula">' +
        '响应时间 ≈ 进程数 × 时间片<br>' +
        '最坏等待 = (n − 1) × (时间片 + 切换时间)' +
      '</div>' +
      '<ul><li>时间片太大 → 退化成 FCFS</li><li>时间片太小 → 切换开销大</li><li>本页假设：时间片用完的进程先进队，同一时刻新到达的排其后</li></ul>'
    ));

    grid.appendChild(paperSection('3. 高响应比 HRRN',
      '<div class="formula">响应比 = (等待时间 + 运行时间) ÷ 运行时间</div>' +
      '<ul><li>非抢占；每次挑响应比最高的</li><li>等待越久，响应比越大 → 长作业不会饿死</li><li>平均周转通常比 SJF 略差</li></ul>'
    ));

    grid.appendChild(paperSection('4. 信号量',
      '<div class="formula">' +
        '初值 k，M 个进程竞争 → 范围 [k − M, k]<br>' +
        'value &gt; 0：可用资源数<br>' +
        'value &lt; 0：|value| = 等待进程数' +
      '</div>' +
      '<div class="formula" style="margin-top:6px">P(S): S = S − 1; if (S &lt; 0) 阻塞<br>' +
      'V(S): S = S + 1; if (S ≤ 0) 唤醒一个</div>'
    ));

    grid.appendChild(paperSection('5. PV 四步法',
      '<ul>' +
        '<li>判断关系：互斥（不能同时）还是同步（有先后）</li>' +
        '<li>每个等待条件设一个信号量：互斥通常 1，同步通常 0</li>' +
        '<li>互斥：P/V 夹住临界区；同步：P、V 分在两个进程</li>' +
        '<li>检查：同步 P 在互斥 P 之前；P/V 成对</li>' +
      '</ul>' +
      '<div class="tagline">口诀：谁等谁，就在谁那里 P，在对方那里 V。</div>'
    ));

    grid.appendChild(paperSection('6. 两张必背模板',
      '<div class="mini-code">// 生产者–消费者（N=5）\n' +
        'mutex=1, empty=5, full=0;\n' +
        '生产者: P(empty); P(mutex); 放入; V(mutex); V(full);\n' +
        '消费者: P(full);  P(mutex); 取出; V(mutex); V(empty);</div>' +
      '<div class="mini-code" style="margin-top:6px">// 读者–写者（读者优先）\n' +
        'rmutex=1, wmutex=1, count=0;\n' +
        '读者: P(rmutex); if(count==0) P(wmutex); count++; V(rmutex);\n' +
        '     读; P(rmutex); count--; if(count==0) V(wmutex); V(rmutex);\n' +
        '写者: P(wmutex); 写; V(wmutex);</div>'
    ));

    grid.appendChild(paperSection('7. 位示图',
      '<div class="formula">' +
        '约定 A（从 0 起）：b = n × i + j<br>' +
        'i = ⌊b ÷ n⌋　j = b mod n<br>' +
        '约定 B（从 1 起）：b = n × (i − 1) + j<br>' +
        'i = ⌊(b − 1) ÷ n⌋ + 1　j = (b − 1) mod n + 1' +
      '</div>' +
      '<div class="tagline">位示图字数 = ⌈总盘块数 ÷ n⌉；分配找第一个 0，回收按号置 0。</div>'
    ));

    grid.appendChild(paperSection('8. 考前最后检查',
      '<ul>' +
        '<li>周转减的是“到达时间”，不是 0</li>' +
        '<li>抢占式：每次新进程到达都重新比剩余时间</li>' +
        '<li>RR：新到达 vs 刚被抢下，按题目约定排队</li>' +
        '<li>带权周转除以“运行时间”</li>' +
        '<li>PV：同步 P 在互斥 P 之前；P/V 成对</li>' +
        '<li>位示图：全程统一从 0 或从 1</li>' +
      '</ul>'
    ));

    paper.appendChild(grid);
    return paper;
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

  function miniGantt(res, jobs, total) {
    var colors = A.colorMap(jobs);
    var g = A.gantt({
      segments: mergeSegs(res.segments),
      total: total,
      colors: colors,
      compact: true
    });
    g.classList.add('mini-gantt');
    return g;
  }

  function answerLead(text) {
    return h('div', 'ans-lead', text);
  }

  function quizCard(n, question, buildAnswer) {
    var card = h('div', 'quiz');
    var head = h('div', 'quiz-head');
    head.innerHTML = '<div class="quiz-num">' + n + '</div><div class="quiz-q">' + question + '</div>';
    var actions = h('div', 'quiz-actions');
    var btn = h('button', 'btn', '看答案');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    var ans = h('div', 'quiz-answer');
    ans.hidden = true;
    buildAnswer(ans);
    btn.addEventListener('click', function () {
      ans.hidden = !ans.hidden;
      btn.textContent = ans.hidden ? '看答案' : '收起答案';
      btn.setAttribute('aria-expanded', ans.hidden ? 'false' : 'true');
      if (!ans.hidden && ans.scrollIntoView) {
        setTimeout(function () { try { ans.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 50);
      }
    });
    actions.appendChild(btn);
    card.appendChild(head);
    card.appendChild(actions);
    card.appendChild(ans);
    return card;
  }

  function buildQuizzes() {
    var wrap = h('div', 'quiz-list');

    /* S1 */
    var s1jobs = [
      { id: 'P1', arrival: 0, burst: 7 },
      { id: 'P2', arrival: 2, burst: 4 },
      { id: 'P3', arrival: 4, burst: 1 },
      { id: 'P4', arrival: 5, burst: 4 }
    ];
    var s1np = E.sjf(s1jobs);
    var s1p = E.srtf(s1jobs);
    wrap.appendChild(quizCard('S1',
      'P1(0, 7)、P2(2, 4)、P3(4, 1)、P4(5, 4)。分别求非抢占式 SJF 与抢占式 SJF 的平均周转时间。' +
      '<span class="sub">先自己在纸上画两条时间轴，再点开对照。</span>',
      function (ans) {
        var box = h('div', 'stack-12');
        var a = h('div', 'card plain');
        a.innerHTML = '<div class="row"><b>非抢占式 SJF</b><span class="chip ok">平均周转 ' + num(s1np.avgTurnaround, 2) + 'ms</span></div>' +
          '<div class="small muted" style="margin-top:4px">顺序：P1 → P3 → P2 → P4；周转：' +
          s1np.rows.map(function (r) { return r.id + '=' + r.turnaround; }).join('，') + '</div>';
        a.appendChild(miniGantt(s1np, s1jobs, 16));
        var b = h('div', 'card plain');
        b.innerHTML = '<div class="row"><b>抢占式 SJF</b><span class="chip ok">平均周转 ' + num(s1p.avgTurnaround, 2) + 'ms</span></div>' +
          '<div class="small muted" style="margin-top:4px">P3 到达时抢占 P2，P2 之后继续；周转：' +
          s1p.rows.map(function (r) { return r.id + '=' + r.turnaround; }).join('，') + '</div>';
        b.appendChild(miniGantt(s1p, s1jobs, 16));
        box.appendChild(answerLead('答案：非抢占 8ms，抢占 7ms'));
        box.appendChild(a);
        box.appendChild(b);
        ans.appendChild(box);
      }
    ));

    /* S2 */
    var qMax = Math.floor(3000 / 60);
    wrap.appendChild(quizCard('S2',
      '响应时间要求不超过 3 秒，有 60 个用户，时间片最大多少？',
      function (ans) {
        var f = h('div', 'formula');
        f.innerHTML = '3 秒 = 3000ms<br>时间片 ≤ 3000 ÷ 60 = <span class="hl">' + qMax + 'ms</span>';
        ans.appendChild(answerLead('答案：' + qMax + 'ms'));
        ans.appendChild(f);
        ans.appendChild(h('div', 'small muted', '思路：响应时间 ≈ 进程数 × 时间片。反过来除一下即可。'));
      }
    ));

    /* S3 */
    var range = E.semRange(3, 5);
    wrap.appendChild(quizCard('S3',
      '初值 3 的信号量，5 个进程竞争，取值范围？',
      function (ans) {
        var f = h('div', 'formula');
        f.innerHTML = '范围 = [初值 − 进程数, 初值] = [' + range.min + ', ' + range.max + ']';
        ans.appendChild(answerLead('答案：[' + range.min + ', ' + range.max + ']'));
        ans.appendChild(f);
        ans.appendChild(h('div', 'small muted', '下界负多少，就代表最多有多少个进程同时等待。'));
      }
    ));

    /* S4 */
    wrap.appendChild(quizCard('S4',
      '公交车上，司机和售票员协作：司机“启动车辆、正常行车、到站停车”；售票员“关车门、售票、开车门”。关了车门才能启动，到站停车后才能开车门。用 PV 实现。',
      function (ans) {
        var box = h('div', 'stack-12');
        box.appendChild(answerLead('答案：s1 = 0（可以启动），s2 = 0（可以开门）'));
        var c = A.codeBlock([
          'Semaphore s1 = 0, s2 = 0;',
          '',
          '司机:',
          '  P(s1);',
          '  启动车辆;',
          '  正常行车;',
          '  到站停车;',
          '  V(s2);',
          '',
          '售票员:',
          '  关车门;',
          '  V(s1);',
          '  售票;',
          '  P(s2);',
          '  开车门;'
        ], [4, 8, 12, 14], '');
        box.appendChild(c);
        box.appendChild(h('div', 'small muted',
          's1：司机等“车门已关”；s2：售票员等“车已停稳”。两个同步信号量初值都为 0。'));
        ans.appendChild(box);
      }
    ));

    /* S5 */
    wrap.appendChild(quizCard('S5',
      '缓冲区 10 个格子的生产者消费者，写出三个信号量及初值。',
      function (ans) {
        var row = h('div', 'sem-grid');
        [['mutex', '1', '互斥访问缓冲区'], ['empty', '10', '空位数'], ['full', '0', '已有产品数']].forEach(function (x) {
          var d = h('div', 'sem-card');
          d.innerHTML = '<div class="name">' + x[0] + '</div><div class="val">' + x[1] + '</div><div class="sub">' + x[2] + '</div>';
          row.appendChild(d);
        });
        ans.appendChild(answerLead('答案：mutex = 1，empty = 10，full = 0'));
        ans.appendChild(row);
        ans.appendChild(h('div', 'small muted', 'empty 的初值跟着格子数走；full 一开始是 0。'));
      }
    ));

    /* S6 */
    var words = E.bitmapWords(2000, 32);
    var p6 = E.blockToPos(100, 32, 0);
    wrap.appendChild(quizCard('S6',
      '2000 个盘块，每字 32 位，位示图至少多少个字？盘块 100 在第几字第几位（从 0 数）？',
      function (ans) {
        var f = h('div', 'formula');
        f.innerHTML =
          '字数 = ⌈2000 ÷ 32⌉ = <span class="hl">' + words + ' 个字</span><br>' +
          '100 = ' + p6.i + ' × 32 + ' + p6.j + ' → 第 ' + p6.i + ' 字第 ' + p6.j + ' 位';
        ans.appendChild(answerLead('答案：' + words + ' 个字；第 ' + p6.i + ' 字第 ' + p6.j + ' 位'));
        ans.appendChild(f);
        ans.appendChild(h('div', 'small muted', '盘块号从 0 数：i = ⌊100 ÷ 32⌋ = 3，j = 100 mod 32 = 4。'));
      }
    ));

    return wrap;
  }

  A.buildReview = function (root) {
    root.innerHTML = '';
    var wrap = h('div', 'stack-16');
    wrap.appendChild(buildPaper());

    var head = h('div', 'stack-10');
    head.style.marginTop = '10px';
    head.innerHTML =
      '<div class="row"><span class="chip accent">自测</span><b style="font-size:18px">先暂停，自己算，再点“看答案”</b></div>' +
      '<div class="small muted">6 道题覆盖调度、RR 公式、信号量、PV、位示图。答案里的数字同样由页面代码计算。</div>';
    wrap.appendChild(head);
    wrap.appendChild(buildQuizzes());
    root.appendChild(wrap);
  };
})(window.OSApp);

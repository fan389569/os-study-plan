(function () {
  'use strict';

  const L = window.LESSON;
  const SEQ = L.seq, NB = L.frames, NC = SEQ.length;
  const INF = Infinity;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
  const isRecord = /[?&]record=1/.test(location.search);
  const wantBeat = (location.search.match(/[?&]beat=(\d+)/) || [])[1];

  const state = {
    algo: 'FIFO',
    upto: 0,
    pending: false,
    meters: false,
    panelOn: false,
    note: '',
    tag: '准备开始',
    idx: 0
  };

  /* ============================ 渲染 ============================ */

  function cols(algo) { return L.algo[algo].cols; }

  function prevFrames(algo, i) {
    if (i <= 0) return new Array(NB).fill(null);
    return cols(algo)[i - 1].frames;
  }
  function prevLoaded(algo, i) {
    if (i <= 0) return new Array(NB).fill(0);
    return cols(algo)[i - 1].loaded;
  }
  function prevUsed(algo, i) {
    if (i <= 0) return new Array(NB).fill(0);
    return cols(algo)[i - 1].used;
  }

  function metersFor(algo, i, frames, loaded, used) {
    return frames.map((f, k) => {
      if (f == null) return null;
      if (algo === 'FIFO') return (i + 1) - loaded[k];
      if (algo === 'LRU') return (i + 1) - used[k];
      const j = SEQ.indexOf(f, i + 1);
      return j < 0 ? INF : j - i;
    });
  }

  function meterHTML(algo, v) {
    if (v == null) return '';
    let tag, pct, inf = false;
    if (algo === 'FIFO') { tag = '住 ' + v; pct = Math.min(v / 6, 1) * 100; }
    else if (algo === 'LRU') { tag = '闲 ' + v; pct = Math.min(v / 6, 1) * 100; }
    else {
      if (v === INF) { tag = '∞ 不再出现'; pct = 100; inf = true; }
      else { tag = '下次 ' + v + ' 列'; pct = Math.min(v / 6, 1) * 100; }
    }
    return '<div class="meter' + (inf ? ' inf' : '') + '">' +
      '<div class="bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
      '<span class="tag">' + tag + '</span></div>';
  }

  function render() {
    const algo = state.algo, upto = state.upto, pending = state.pending;
    const C = cols(algo);
    const activeCol = pending ? upto : upto - 1;

    let h = '';

    /* 列号 */
    h += '<div class="row head"><div class="lab"></div>';
    for (let i = 0; i < NC; i++) {
      h += '<div class="colhead' + (i === activeCol ? ' cur' : '') + '">t' + (i + 1) + '</div>';
    }
    h += '</div>';

    /* 访问序列 */
    h += '<div class="row visit"><div class="lab"><b>访问序列</b></div>';
    for (let i = 0; i < NC; i++) {
      let cls = 'c';
      if (i < upto) cls += ' done';
      else if (i === upto && pending) cls += ' cur';
      else cls += ' future';
      if (algo === 'OPT' && i >= upto) cls += ' lit';
      h += '<div class="' + cls + '" data-visit="' + i + '"><div class="num">' + SEQ[i] + '</div></div>';
    }
    h += '</div>';

    /* 三个物理块 */
    for (let k = 0; k < NB; k++) {
      h += '<div class="row block"><div class="lab"><b>块 ' + (k + 1) + '</b></div>';
      for (let i = 0; i < NC; i++) {
        let page = null, isPending = false, showMeter = false, victim = false;
        if (i < upto) page = C[i].frames[k];
        else if (i === upto && pending) { page = prevFrames(algo, i)[k]; isPending = true; }

        if (page != null && i === activeCol && state.meters) showMeter = true;

        if (pending && i === upto) {
          const cur = C[upto];
          if (cur && cur.evicted != null && cur.target === k) victim = true;
        }

        let cls = 'c';
        if (page == null) cls += ' empty';
        else cls += ' p' + page + ' has';
        if (isPending) cls += ' pending';
        if (i === activeCol) cls += ' latest';
        if (victim) cls += ' victim';

        let inner = page == null ? '' : '<div class="num">' + page + '</div>';
        if (showMeter) {
          const m = metersFor(algo, i,
            i === upto ? prevFrames(algo, i) : C[i].frames,
            i === upto ? prevLoaded(algo, i) : C[i].loaded,
            i === upto ? prevUsed(algo, i) : C[i].used);
          inner += meterHTML(algo, m[k]);
        }
        h += '<div class="' + cls + '" data-col="' + i + '" data-slot="' + k + '">' + inner + '</div>';
      }
      h += '</div>';
    }

    /* 缺页行 */
    h += '<div class="row fault"><div class="lab"><b>缺页? </b></div>';
    for (let i = 0; i < NC; i++) {
      const miss = i < upto && C[i].status === 'miss';
      h += '<div class="c' + (miss ? ' mark' : '') + '" data-col="' + i + '"></div>';
    }
    h += '</div>';

    $('#table').innerHTML = h;
  }

  /* ============================ 面板 ============================ */

  const RULES = {
    FIFO: '谁进来得<b>最早</b>，就淘汰谁。<br>命中不改变任何顺序。',
    LRU: '谁<b>最久没被用过</b>，就淘汰谁。<br>命中会把它刷新成最新的。',
    OPT: '往后看，淘汰<b>下次出现最晚</b>的。<br>以后不再出现的，优先淘汰。'
  };

  function updatePanel() {
    const algoOn = state.panelOn;
    const nameEl = $('#panelAlgoName'), ruleEl = $('#panelRule');
    nameEl.textContent = algoOn ? state.algo : '—';
    nameEl.classList.toggle('on', algoOn);
    ruleEl.innerHTML = algoOn ? RULES[state.algo] : '先看懂命中、缺页，<br>再学淘汰规则。';

    $('#panelNote').innerHTML = state.note || '—';

    const C = cols(state.algo);
    const f = state.upto > 0 ? C[state.upto - 1].faults : 0;
    const rate = Math.round(f / NC * 100);
    $('#statFaults').textContent = f;
    $('#statTotal').textContent = '/ ' + NC;
    $('#statRate').textContent = rate + '%';
    $('#statBar').style.width = rate + '%';
  }

  function updateChrome() {
    $('#chapterTag').textContent = state.tag;
    const chip = $('#algoChip');
    chip.textContent = state.panelOn ? state.algo : '—';
    chip.classList.toggle('on', state.panelOn);
    $('#progressFill').style.width = ((state.idx + 1) / beats.length * 100).toFixed(1) + '%';
  }

  let subToken = 0;
  function setSub(html) {
    const el = $('#subText');
    const t = ++subToken;
    el.classList.remove('show');
    setTimeout(() => {
      if (t !== subToken) return;
      el.innerHTML = html || '';
      el.classList.add('show');
    }, 150);
  }

  let calloutTimer = null;
  function showCallout(html, ms) {
    const el = $('#callout');
    el.innerHTML = html;
    el.classList.add('show');
    clearTimeout(calloutTimer);
    calloutTimer = setTimeout(() => el.classList.remove('show'), ms || 3600);
  }
  function hideCallout() {
    clearTimeout(calloutTimer);
    $('#callout').classList.remove('show');
  }

  function flashChapter(n, t) {
    const el = $('#chapterFlash');
    el.innerHTML = '<span class="n">' + n + '</span><span class="t">' + t + '</span>';
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  /* ============================ 动画 ============================ */

  let gen = 0;

  function animateStep(algo, i) {
    const g = ++gen;
    state.algo = algo;
    state.upto = i;
    state.pending = true;
    state.meters = true;
    hideCallout();
    render();
    updatePanel();

    const col = cols(algo)[i];

    if (col.status === 'miss' && col.evicted != null) {
      setTimeout(() => {
        if (g !== gen) return;
        const v = document.querySelector('.row.block .c[data-col="' + i + '"][data-slot="' + col.target + '"]');
        if (v) v.classList.add('evicting');
      }, 620);
    }

    setTimeout(() => { if (g === gen) commitStep(algo, i, g); }, 1080);
  }

  function commitStep(algo, i, g) {
    const col = cols(algo)[i];
    state.pending = false;
    state.upto = i + 1;
    render();
    updatePanel();

    const cell = document.querySelector('.row.block .c[data-col="' + i + '"][data-slot="' + col.target + '"]');
    if (!cell) return;

    if (col.status === 'hit') {
      cell.classList.add('flash-hit');
      return;
    }

    cell.classList.add('arriving');
    const from = document.querySelector('.c[data-visit="' + i + '"]');
    if (from) {
      flyer(from, cell, col.page, () => {
        if (g !== gen) return;
        cell.classList.remove('arriving');
        cell.classList.add('landed');
      });
    } else {
      cell.classList.remove('arriving');
    }

    setTimeout(() => {
      if (g !== gen) return;
      const fc = document.querySelector('.row.fault .c[data-col="' + i + '"]');
      if (fc) fc.classList.add('pop');
    }, 400);
  }

  function flyer(from, to, page, cb) {
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'flyer p' + page;
    el.textContent = page;
    el.style.left = a.left + 'px';
    el.style.top = a.top + 'px';
    el.style.width = a.width + 'px';
    el.style.height = a.height + 'px';
    el.style.fontSize = '30px';
    el.style.background = 'var(--p' + page + 'a)';
    el.style.color = 'var(--p' + page + ')';
    document.body.appendChild(el);

    const dx = b.left - a.left, dy = b.top - a.top;
    const sx = b.width / a.width, sy = b.height / a.height;
    const anim = el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (dx * 0.55) + 'px,' + (dy * 0.55 - 46) + 'px) scale(1.14)', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: 0.95 }
    ], { duration: 520, easing: 'cubic-bezier(.28,.72,.2,1)', fill: 'forwards' });
    anim.onfinish = function () { el.remove(); if (cb) cb(); };
  }

  /* ============================ 时间线 ============================ */

  const beats = [];
  function B(o) { beats.push(o); }

  function stepBeat(algo, i, d, sub, note) {
    return {
      d: d, sub: sub, algo: algo, upto: i, meters: true, panelOn: true, note: note,
      run: function () { animateStep(algo, i); }
    };
  }

  /* ---------- ① 开场 ---------- */
  B({ d: 5600, algo: 'FIFO', upto: 0, meters: false, tag: '准备开始',
    sub: '' });
  B({ d: 5200, algo: 'FIFO', upto: 0, meters: false, tag: '① 先搞懂在干嘛',
    sub: '题目会给你两样东西：<b>一串页面访问序列</b>，和<b>几个物理块</b>。',
    run: function () { $('#titlecard').classList.add('hide'); flashChapter('①', '先搞懂在干嘛'); } });
  B({ d: 5200, upto: 0,
    sub: '物理块就是内存里能放页面的格子。这里只有 3 个：块 1、块 2、块 3。',
    note: '内存很小，只放得下 3 个页面。<br>但程序要用的页面远不止 3 个。' });

  /* ---------- ② 命中与缺页 ---------- */
  B(stepBeat('FIFO', 0, 6000,
    '第一步，2 号页面。三个块都是空的，没有它，那就放进去。这一次，记一次<span class="r">缺页</span>。',
    '2 号不在块里，块 1 还空着 → <b>直接放进去</b>。'));

  B(stepBeat('FIFO', 1, 6000,
    '第二步，3 号。还是不在，放进块 2。又一次<span class="r">缺页</span>。',
    '3 号不在块里，块 2 空着 → 放进去。'));

  B(stepBeat('FIFO', 2, 6500,
    '第三步，2 号。<span class="g">这次它在块 1 里</span>。这种情况叫<b>命中</b>，什么都不用做。',
    '2 号已经在块 1 里 → <span class="g">命中</span>，页面不动。'));

  B({ d: 5500, upto: 3,
    sub: '所以每一列只有两种结果：<span class="g">命中</span>，或者<span class="r">缺页</span>。缺页就在最下面打一个 √。',
    note: '命中 = 已经在块里。<br>缺页 = 不在块里，要把它搬进来。' });

  B({ d: 5600, upto: 3,
    sub: '缺页率 = <b>缺页次数 ÷ 总访问次数</b>。这题一共 10 次访问，所以分母是 10。',
    note: '这道题最后要算的，就是缺页次数和缺页率。' });

  /* ---------- ③ 满了怎么办 ---------- */
  B(stepBeat('FIFO', 3, 6500,
    '第四步，1 号。它不在，但注意，<b>块 3 还空着</b>。有空位就直接放，不需要淘汰任何人。',
    '1 号不在块里，但块 3 是空的 → <b>直接放入，不淘汰</b>。'));

  B({ d: 5500, upto: 4,
    sub: '很多同学在这里就急着「踢人」了，其实不用。<b>只有三个块全满，才需要淘汰。</b>',
    note: '记住：有空位就放，<span class="r">不用淘汰</span>。' });

  B({ d: 6000, upto: 4,
    sub: '现在三个块都满了。第五步，5 号来了，还是没有它。<b>必须腾一个位置出来。</b>',
    note: '块已满，5 号不在 → 必须淘汰一个。<br>问题是：淘汰谁？',
    run: function () { showCallout('三个块已满 → 必须淘汰一个页面', 3800); } });

  B({ d: 6000, upto: 4,
    sub: 'FIFO、LRU、OPT 三个算法，前面的步骤完全一样，<b>区别只在这一下：淘汰谁。</b>',
    note: '三种算法 = 三条「选谁淘汰」的规则。' });

  /* ---------- ④ FIFO ---------- */
  B({ d: 5000, algo: 'FIFO', upto: 4, meters: true, panelOn: true, tag: '② FIFO：先进先出',
    sub: '先看 FIFO：<b>先进先出</b>。谁进来得最早，就淘汰谁。',
    note: '规则：谁进来得最早，谁先走。',
    run: function () { flashChapter('②', 'FIFO：先进先出'); } });

  B({ d: 5200, upto: 4,
    sub: '怎么看出谁最早？给每个页面配一根<b>「住店时间条」</b>：住得越久，条子越长。',
    note: '条子越长 = 住得越久 = 越该被淘汰。' });

  B(stepBeat('FIFO', 4, 6500,
    '第五步，5 号要进来。看条子：<b>2 号的条子最长</b>，它第 1 步就住进来了。所以淘汰 2 号。',
    '5 号不在，块满了。<b>淘汰块 1 的 2 号</b>（住得最久）。'));

  B({ d: 5200, upto: 5,
    sub: '2 号被换出去，5 号住进它原来的位置。缺页次数 +1。',
    note: '5 号住进块 1，2 号离开。<br>条子从 0 重新开始涨。' });

  B(stepBeat('FIFO', 5, 6000,
    '第六步，2 号又来了。可惜它刚刚被踢走，只能重新搬进来。又一次<span class="r">缺页</span>。',
    '2 号不在块里 → 淘汰块 2 的 3 号。'));

  B(stepBeat('FIFO', 6, 5800,
    '第七步，4 号。现在住得最久的是 1 号，淘汰它。',
    '4 号不在 → 淘汰块 3 的 1 号（住得最久）。'));

  B(stepBeat('FIFO', 7, 6200,
    '第八步，5 号。它还在块里，<span class="g">命中</span>。注意：<b>FIFO 命中时不改变任何顺序</b>。',
    '5 号在块 1 → <span class="g">命中</span>。条子照涨，顺序不变。'));

  B(stepBeat('FIFO', 8, 5800,
    '第九步，3 号。住得最久的是 5 号，淘汰 5。',
    '3 号不在 → 淘汰块 1 的 5 号。'));

  B(stepBeat('FIFO', 9, 5800,
    '第十步，2 号。还在，<span class="g">命中</span>。',
    '2 号在块 2 → <span class="g">命中</span>。'));

  B({ d: 6000, upto: 10,
    sub: '数一数最下面的 √，一共 <b>7 个</b>。FIFO 缺页 7 次，缺页率 70%。',
    note: 'FIFO：<b>缺页 7 次</b>，缺页率 70%。',
    run: function () { showCallout('FIFO：缺页 7 次 / 10 次访问 = 70%', 4200); } });

  /* ---------- ⑤ LRU ---------- */
  B({ d: 5200, algo: 'LRU', upto: 4, meters: true, panelOn: true, tag: '③ LRU：最近最久未使用',
    sub: '再看 LRU：<b>最近最久未使用</b>。它淘汰的是「最长时间没被用过」的那个。',
    note: '规则：谁最久没被用过，谁走。',
    run: function () { flashChapter('③', 'LRU：最近最久未使用'); } });

  B({ d: 5400, upto: 4,
    sub: '条子的含义变了：不是「住了多久」，而是<b>「多久没被用过」</b>。',
    note: '同样是条子，量的是「多久没碰它」。' });

  B({ d: 6000, upto: 4,
    sub: '最关键的一点：LRU 一旦命中，<b>条子立刻清零</b>。因为刚刚用过，它现在是最新的。',
    note: '命中 = 刚用过 = 条子清零。<br>这就是和 FIFO 最大的区别。' });

  B(stepBeat('LRU', 4, 7000,
    '回到第 5 步。看条子：<b>3 号最久没用</b>，淘汰 3。而 FIFO 刚才淘汰的是 2。',
    '5 号不在，块满了。<b>淘汰块 2 的 3 号</b>（最久没用）。',
    ));
  // 补充对比提示
  beats[beats.length - 1].after = function () {
    showCallout('同一步：FIFO 淘汰 <b>2</b> &nbsp;|&nbsp; LRU 淘汰 <b>3</b>', 4200);
  };

  B(stepBeat('LRU', 5, 6500,
    '第六步，2 号来了。<span class="g">它在，命中</span>。FIFO 在这一步是缺页，因为它的 2 号早被踢走了。',
    '2 号在块 1 → <span class="g">命中</span>，条子清零。'));

  B(stepBeat('LRU', 6, 5800,
    '第七步，4 号，淘汰最久没用的 1 号。',
    '4 号不在 → 淘汰块 3 的 1 号。'));

  B(stepBeat('LRU', 7, 5800,
    '第八步，5 号命中，条子清零。',
    '5 号在块 2 → <span class="g">命中</span>。'));

  B(stepBeat('LRU', 8, 5800,
    '第九步，3 号，淘汰 2 号。',
    '3 号不在 → 淘汰块 1 的 2 号。'));

  B(stepBeat('LRU', 9, 5800,
    '第十步，2 号，淘汰 4 号。',
    '2 号不在 → 淘汰块 3 的 4 号。'));

  B({ d: 6200, upto: 10,
    sub: 'LRU 数下来也是 <b>7 次缺页</b>。这题两者打平，但每一步淘汰的可能不是同一个页面。',
    note: 'LRU：<b>缺页 7 次</b>，缺页率 70%。',
    run: function () { showCallout('FIFO 7 次 &nbsp;|&nbsp; LRU 7 次 &nbsp;|&nbsp; 但过程不同', 4200); } });

  /* ---------- ⑥ OPT ---------- */
  B({ d: 5200, algo: 'OPT', upto: 4, meters: true, panelOn: true, tag: '④ OPT：最优置换',
    sub: '最后是 OPT：<b>最优置换</b>。它作弊，因为它假设你能看见未来。',
    note: '规则：往后看，谁下次来得最晚，谁走。',
    run: function () { flashChapter('④', 'OPT：能看见未来'); } });

  B({ d: 6000, upto: 4,
    sub: '每个页面头上会标出：<b>下次还要等几列</b>才用到。如果以后再也不出现，就是 <b>∞</b>。',
    note: '注意右边未来的卡片：OPT 全都能看见。' });

  B(stepBeat('OPT', 4, 7000,
    '第五步，5 号进来。往后看：2 号下一步就用，3 号第 9 步才用，<b>1 号以后再也不出现</b>。淘汰 1 号。',
    '淘汰块 3 的 1 号（∞：以后不再出现）。'));

  B(stepBeat('OPT', 5, 5600,
    '第六步，2 号<span class="g">命中</span>。',
    '2 号在块 1 → <span class="g">命中</span>。'));

  B(stepBeat('OPT', 6, 6800,
    '第七步，4 号进来。5 号下一步就用，3 号第 9 步，2 号第 10 步。<b>淘汰最晚的 2 号</b>。',
    '4 号不在 → 淘汰块 1 的 2 号（下次最晚）。'));

  B(stepBeat('OPT', 7, 5600,
    '第八步，5 号<span class="g">命中</span>。',
    '5 号在块 3 → <span class="g">命中</span>。'));

  B(stepBeat('OPT', 8, 5600,
    '第九步，3 号也还在，<span class="g">命中</span>。',
    '3 号在块 2 → <span class="g">命中</span>。'));

  B(stepBeat('OPT', 9, 6000,
    '第十步，2 号。剩下的页面以后都不用了，淘汰 4 号。',
    '2 号不在 → 淘汰块 1 的 4 号。'));

  B({ d: 6500, upto: 10,
    sub: 'OPT 一共 <b>6 次缺页</b>，是这题的理论最少值。但现实里没人能预知未来，所以它只能考，不能实现。',
    note: 'OPT：<b>缺页 6 次</b>，缺页率 60%。',
    run: function () { showCallout('FIFO 7 &nbsp;|&nbsp; LRU 7 &nbsp;|&nbsp; OPT 6', 4500); } });

  /* ---------- ⑦ 怎么写 ---------- */
  B({ d: 6000, algo: 'FIFO', upto: 10, meters: false, panelOn: true, tag: '⑤ 卷面上怎么写',
    sub: '考试的时候就画这张表：第一行放<b>访问序列</b>，下面三行是<b>三个物理块</b>，最后一行打 √。',
    note: '这就是标准答题格式。<br>一列 = 一次访问。',
    run: function () { flashChapter('⑤', '卷面上怎么写'); hideCallout(); } });

  B({ d: 6000, upto: 10,
    sub: '每一列都从上一列抄过来：<b>命中就原样抄</b>；<b>缺页就把新页面写进去</b>，被淘汰的擦掉。',
    note: '抄列 = 把上一列原样搬过来，再改被换掉的那一格。' });

  B({ d: 5500, upto: 10,
    sub: '块里页面的顺序，按块号写或者按进入先后写都行，<b>只要集合对，就能得分</b>。',
    note: '老师看的是「这一列有哪些页面」，不是先后顺序。' });

  B({ d: 5600, upto: 10,
    sub: '最后数 √ 的个数，就是<b>缺页次数</b>；除以总访问次数，就是<b>缺页率</b>。',
    note: '√ 的个数 = 缺页次数。<br>缺页次数 ÷ 10 = 缺页率。' });

  B({ d: 6500, upto: 10,
    sub: '交卷前做三个自检。第一：缺页次数<b>不可能小于不同页面的个数</b>。这题有 5 个不同页面，7 ≥ 5，合理。',
    note: '自检 1：缺页次数 ≥ 不同页面数。<br>这里 7 ≥ 5 ✓',
    run: function () { showCallout('自检 1：7 ≥ 5 个不同页面 ✓', 4000); } });

  B({ d: 6000, upto: 10,
    sub: '第二：<b>OPT 一定不会比 FIFO 和 LRU 多</b>。这里 6 ≤ 7，合理。',
    note: '自检 2：OPT ≤ FIFO、LRU。<br>这里 6 ≤ 7 ✓',
    run: function () { showCallout('自检 2：OPT 6 ≤ 7 ✓', 4000); } });

  B({ d: 6500, upto: 10,
    sub: '第三：每一个打了 √ 的列，<b>被淘汰的页面必须在下一列里消失</b>。逐列核对，能抓出绝大多数算错。',
    note: '自检 3：被淘汰的页面，下一列必须不见。',
    run: function () { showCallout('自检 3：被淘汰的页面，下一列必须消失 ✓', 4200); } });

  /* ---------- ⑧ 收尾 ---------- */
  B({ d: 5600, upto: 10, tag: '⑥ 一句话记住',
    sub: '最后总结一句话：三种算法只差一件事——<b>踢人的时候，看谁。</b>',
    note: '三种算法，同一张表。<br>只有「淘汰谁」这一条规则不同。',
    run: function () { flashChapter('⑥', '一句话记住'); hideCallout(); } });

  B({ d: 7000, upto: 10,
    sub: '<b>FIFO</b> 看谁来得最早；<b>LRU</b> 看谁最久没用；<b>OPT</b> 看谁下次来得最晚。',
    note: '<b>FIFO</b>：来得最早<br><b>LRU</b>：最久没用<br><b>OPT</b>：下次最晚',
    run: function () { showCallout('FIFO 最早 &nbsp;·&nbsp; LRU 最久没用 &nbsp;·&nbsp; OPT 下次最晚', 5200); } });

  B({ d: 6500, upto: 10,
    sub: '剩下的，就是老老实实一列一列往下填。',
    note: '会填这张表，这类题就没有难度了。' });

  /* ============================ 播放器 ============================ */

  let idx = 0, playing = false, timer = null, speed = 1, finished = false;

  function enter(k) {
    if (k < 0) k = 0;
    if (k >= beats.length) { finish(); return; }
    idx = k;
    state.idx = k;
    const b = beats[k];

    if (b.algo !== undefined) state.algo = b.algo;
    if (b.upto !== undefined) { state.upto = b.upto; state.pending = false; }
    if (b.meters !== undefined) state.meters = b.meters;
    if (b.panelOn !== undefined) state.panelOn = b.panelOn;
    if (b.note !== undefined) state.note = b.note;
    if (b.tag !== undefined) state.tag = b.tag;
    else {
      for (let j = k; j >= 0; j--) { if (beats[j].tag !== undefined) { state.tag = beats[j].tag; break; } }
    }

    $('#titlecard').classList.toggle('hide', k > 0);
    render();
    updatePanel();
    updateChrome();
    setSub(b.sub);
    if (b.run) b.run();
    if (b.after) setTimeout(b.after, 2600);
  }

  function schedule() {
    clearTimeout(timer);
    if (!playing) return;
    const d = Math.max(700, beats[idx].d / speed);
    timer = setTimeout(() => {
      if (idx + 1 >= beats.length) { finish(); return; }
      enter(idx + 1);
      schedule();
    }, d);
  }

  function play() {
    if (finished) { restart(); return; }
    playing = true;
    $('#btnPlay').innerHTML = '&#10074;&#10074;';
    schedule();
  }
  function pause() {
    playing = false;
    clearTimeout(timer);
    $('#btnPlay').innerHTML = '&#9654;';
  }
  function toggle() { playing ? pause() : play(); }

  function nextBeat() {
    pause();
    enter(Math.min(idx + 1, beats.length - 1));
  }
  function prevBeat() {
    pause();
    enter(Math.max(idx - 1, 0));
  }
  function restart() {
    pause();
    finished = false;
    $('#titlecard').classList.remove('hide');
    hideCallout();
    idx = 0;
    enter(0);
  }
  function finish() {
    playing = false;
    finished = true;
    clearTimeout(timer);
    $('#btnPlay').innerHTML = '&#9654;';
    window.__DONE = true;
    document.body.classList.add('done');
  }

  $('#btnPlay').onclick = toggle;
  $('#btnNext').onclick = nextBeat;
  $('#btnPrev').onclick = prevBeat;
  $('#btnRestart').onclick = restart;
  $('#btnSpeed').onclick = function () {
    speed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.75 : 1;
    this.textContent = speed.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '×';
    if (playing) schedule();
  };
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    else if (e.code === 'ArrowRight') { e.preventDefault(); nextBeat(); }
    else if (e.code === 'ArrowLeft') { e.preventDefault(); prevBeat(); }
  });

  /* ============================ 启动 ============================ */

  function fit() {
    const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    $('#fit').style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  if (isRecord) {
    document.body.classList.add('recording');
    $('#ctrl').style.display = 'none';
  }

  render();
  updatePanel();
  updateChrome();
  $('#titlecard').classList.remove('hide');

  if (wantBeat !== undefined) {
    enter(parseInt(wantBeat, 10) || 0);
    pause();
  } else if (isRecord) {
    setTimeout(function () { enter(0); play(); }, 400);
  } else {
    // 交互模式：先停在封面，点击播放开始
    setTimeout(function () { play(); }, 900);
  }
})();

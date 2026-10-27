/* 模块③：位示图 */
(function (A) {
  'use strict';

  var E = A.E;
  var h = A.h;
  var esc = A.esc;

  function clear(host) { host.innerHTML = ''; }
  function add(host) {
    for (var i = 1; i < arguments.length; i++) if (arguments[i]) host.appendChild(arguments[i]);
  }

  function bitmapGrid(opts) {
    var rows = opts.rows || 4;
    var n = opts.n || 16;
    var base = opts.base === 1 ? 1 : 0;
    var used = opts.used || {};
    var highlight = opts.highlight || [];
    var scanned = opts.scanned || [];
    var found = opts.found;
    var changed = opts.changed || [];
    var highlightRow = opts.highlightRow;
    var highlightCol = opts.highlightCol;

    var scroll = h('div', 'bitmap-scroll');
    var grid = h('div', 'bitmap');
    grid.appendChild(h('div', 'bm-corner'));
    for (var j = 0; j < n; j++) {
      var jjHead = j + base;
      var col = h('div', 'bm-col' + (highlightCol === jjHead ? ' hl' : ''), String(jjHead));
      grid.appendChild(col);
    }
    for (var i = 0; i < rows; i++) {
      var ii = i + base;
      var lab = h('div', 'bm-row' + (highlightRow === ii ? ' hl' : ''), String(ii));
      grid.appendChild(lab);
      for (var j2 = 0; j2 < n; j2++) {
        var jj = j2 + base;
        var b = E.posToBlock(ii, jj, n, base);
        var bit = h('div', 'bit ' + (used[b] ? 'used' : 'free'), used[b] ? '1' : '0');
        bit.dataset.block = String(b);
        bit.title = '盘块 ' + b + ' · 字号 ' + ii + ' · 位号 ' + jj;
        if (highlight.some(function (x) { return x.i === ii && x.j === jj; })) bit.classList.add('hl');
        if (scanned.indexOf(b) !== -1) bit.classList.add('scan');
        if (found === b) bit.classList.add('found');
        if (changed.indexOf(b) !== -1) bit.classList.add('changed');
        grid.appendChild(bit);
      }
    }
    scroll.appendChild(grid);
    var outer = h('div', 'bitmap-outer');
    outer.appendChild(scroll);
    outer.appendChild(h('div', 'scroll-hint', '← 左右滑动查看整张位示图 →'));
    return outer;
  }

  function numList(items) {
    var ol = h('ol', 'num-list');
    items.forEach(function (t) { ol.appendChild(h('li', '', t)); });
    return ol;
  }

  function legendBits() {
    var row = h('div', 'row tight');
    row.innerHTML =
      '<span class="chip ok"><span class="dot"></span>0 = 空闲</span>' +
      '<span class="chip"><span class="dot" style="background:var(--muted)"></span>1 = 已占用</span>';
    return row;
  }

  /* ---------------- 3.0 位示图是什么 ---------------- */
  var scene30 = {
    id: '3.0',
    short: '位示图是什么',
    title: '位示图：给每个盘块画一张“座位表”',
    build: function (host) {
      var usedArr = [1, 2, 5, 7, 9, 10, 14, 17, 18, 22, 25, 30, 33, 35, 40, 44, 47, 52, 56, 60];
      var used = {};
      usedArr.forEach(function (b) { used[b] = true; });
      var usedCount = usedArr.length;
      var total = 64;

      function draw(step) {
        clear(host);
        if (step === 0) {
          var a = h('div', 'term');
          a.innerHTML = '<b>位示图</b>　磁盘会按固定大小切成很多块，每块叫一个“盘块”。把每个盘块想成电影院的一个座位：<b>0 = 空着</b>，<b>1 = 已有人</b>。用一位（bit）记一个盘块，整张表就叫位示图。';
          add(host, a);
          add(host, legendBits());
          add(host, bitmapGrid({ rows: 4, n: 16, used: used }));
          var s = h('div', 'row small muted');
          s.innerHTML = '这张小表有 ' + total + ' 个盘块，已用 <b>' + usedCount + '</b> 个，空闲 <b>' + (total - usedCount) + '</b> 个。';
          add(host, s);
          return;
        }
        if (step === 1) {
          var t = h('div', 'term');
          t.innerHTML = '<b>字（word）</b>　位示图按“字”来存，每个字有 n 位。这里 n = 16，所以一行就是 1 个字，一行能记 16 个盘块。';
          add(host, t);
          add(host, legendBits());
          add(host, bitmapGrid({ rows: 4, n: 16, used: used }));
          var f = h('div', 'formula');
          f.innerHTML =
            '一个盘块 = 一个字里的某一位<br>' +
            '字号 i：第几行（从 0 开始）　位号 j：第几列（从 0 开始）';
          add(host, f);
          return;
        }
        var b = 35;
        var pos = E.blockToPos(b, 16, 0);
        add(host, bitmapGrid({
          rows: 4, n: 16, used: used,
          highlight: [{ i: pos.i, j: pos.j }],
          highlightRow: pos.i,
          highlightCol: pos.j
        }));
        var box = h('div', 'card plain');
        box.innerHTML =
          '<div class="row"><span class="chip accent">盘块 ' + b + '</span>' +
          '<span class="chip">字号 i = ' + pos.i + '</span>' +
          '<span class="chip">位号 j = ' + pos.j + '</span></div>' +
          '<div class="small muted" style="margin-top:6px">字号 = 第几行，位号 = 第几列。两者合起来，唯一确定一个盘块。</div>';
        add(host, box);
        add(host, A.box('ok',
          '<b>算盘块号：</b>b = n × i + j = 16 × ' + pos.i + ' + ' + pos.j + ' = ' + b + '。这个公式下一节会用。'));
      }

      return {
        steps: [
          { sub: '位示图就是磁盘的“座位表”：每一位对应一个盘块，0 表示空闲，1 表示已占用。', duration: 6200, draw: function () { draw(0); } },
          { sub: '位示图按“字”存储。每个字 n 位；这里 n=16，所以一行就是 1 个字，一行管 16 个盘块。', duration: 6400, draw: function () { draw(1); } },
          { sub: '字号 i = 第几行，位号 j = 第几列，都从 0 数。它们合起来唯一确定一个盘块。', duration: 6400, draw: function () { draw(2); } }
        ]
      };
    }
  };

  /* ---------------- 3.1 盘块号互换 ---------------- */
  var scene31 = {
    id: '3.1',
    short: '盘块号 ↔ 字号/位号',
    title: '盘块号与（字号，位号）互换：两套约定',
    build: function (host) {
      var n = 16;
      var used = {};
      [0, 1, 2, 7, 9, 14, 18, 23, 27, 31, 35, 40, 45, 52, 60, 70, 80, 89].forEach(function (b) { used[b] = true; });

      var A35 = E.blockToPos(35, n, 0);
      var A59 = E.posToBlock(5, 9, n, 0);
      var B35 = E.blockToPos(35, n, 1);
      var B59 = E.posToBlock(5, 9, n, 1);

      function conventionCard(which, active) {
        var card = h('div', 'card' + (active ? ' plain' : ''));
        card.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
        card.style.boxShadow = active ? '0 0 0 3px var(--accent-soft)' : 'none';
        if (which === 'A') {
          card.innerHTML =
            '<div class="row"><span class="chip accent">约定 A · 从 0 开始</span></div>' +
            '<div class="formula" style="margin-top:8px">b = n × i + j<br>i = ⌊b ÷ n⌋　j = b mod n</div>' +
            '<div class="small muted" style="margin-top:7px">盘块 35 → i=' + A35.i + '，j=' + A35.j + '；字号 5、位号 9 → b=' + A59 + '</div>';
        } else {
          card.innerHTML =
            '<div class="row"><span class="chip accent">约定 B · 从 1 开始</span></div>' +
            '<div class="formula" style="margin-top:8px">b = n × (i − 1) + j<br>i = ⌊(b − 1) ÷ n⌋ + 1　j = (b − 1) mod n + 1</div>' +
            '<div class="small muted" style="margin-top:7px">盘块 35 → i=' + B35.i + '，j=' + B35.j + '；字号 5、位号 9 → b=' + B59 + '</div>';
        }
        return card;
      }

      function draw(step) {
        clear(host);
        var active = step === 0 || step === 1 || step === 2 ? 'A' : step >= 3 ? 'B' : null;
        if (step === 0) {
          var t = h('div', 'term');
          t.innerHTML = '<b>关键：先看题目从 0 还是从 1 数。</b>同一个盘块，用不同约定算出来的字号、位号可能不同。考试以课件例题和题目说明为准。';
          add(host, t);
          add(host, conventionCard('A', true));
          add(host, conventionCard('B', false));
          return;
        }
        if (step === 1) {
          add(host, conventionCard('A', true));
          add(host, conventionCard('B', false));
          add(host, bitmapGrid({
            rows: 6, n: n, used: used,
            highlight: [{ i: A35.i, j: A35.j }],
            highlightRow: A35.i, highlightCol: A35.j
          }));
          var f = h('div', 'formula');
          f.innerHTML =
            '盘块 35：i = ⌊35 ÷ 16⌋ = ' + A35.i + '，j = 35 mod 16 = ' + A35.j + '<br>' +
            '格子位置：第 ' + A35.i + ' 行、第 ' + A35.j + ' 列。';
          add(host, f);
          return;
        }
        if (step === 2) {
          add(host, conventionCard('A', true));
          add(host, conventionCard('B', false));
          add(host, bitmapGrid({
            rows: 6, n: n, used: used,
            highlight: [{ i: 5, j: 9 }],
            highlightRow: 5, highlightCol: 9
          }));
          var f2 = h('div', 'formula');
          f2.innerHTML =
            '字号 5、位号 9：b = 16 × 5 + 9 = <span class="hl">' + A59 + '</span>';
          add(host, f2);
          return;
        }
        if (step === 3) {
          add(host, conventionCard('B', true));
          add(host, conventionCard('A', false));
          var t3 = h('div', 'term');
          t3.innerHTML = '<b>约定 B：字号、位号都从 1 开始。</b>公式里要多减 1、再加 1，别和约定 A 混用。';
          add(host, t3);
          return;
        }
        if (step === 4) {
          add(host, conventionCard('B', true));
          add(host, conventionCard('A', false));
          add(host, bitmapGrid({
            rows: 6, n: n, used: used, base: 1,
            highlight: [{ i: B35.i, j: B35.j }],
            highlightRow: B35.i, highlightCol: B35.j
          }));
          var f4 = h('div', 'formula');
          f4.innerHTML =
            '盘块 35：i = ⌊(35−1) ÷ 16⌋ + 1 = ' + B35.i + '，j = (35−1) mod 16 + 1 = ' + B35.j + '<br>' +
            '注意：同样是盘块 35，约定 B 下它在第 ' + B35.i + ' 行、第 ' + B35.j + ' 列。';
          add(host, f4);
          return;
        }
        if (step === 5) {
          add(host, conventionCard('B', true));
          add(host, conventionCard('A', false));
          add(host, bitmapGrid({
            rows: 6, n: n, used: used, base: 1,
            highlight: [{ i: 5, j: 9 }],
            highlightRow: 5, highlightCol: 9
          }));
          var f5 = h('div', 'formula');
          f5.innerHTML =
            '字号 5、位号 9：b = 16 × (5−1) + 9 = <span class="hl">' + B59 + '</span>';
          add(host, f5);
          return;
        }
        add(host, A.box('warn',
          '<b>考前提醒：</b>同一道题必须统一用一套约定。先翻题目/课件确认“从 0 还是从 1”，再套公式，不要两套混着用。'));
        add(host, conventionCard('A', false));
        add(host, conventionCard('B', false));
      }

      return {
        steps: [
          { sub: '约定 A：字号、位号、盘块号都从 0 开始。先记住 b = n × i + j。', duration: 6200, draw: function () { draw(0); } },
          { sub: '盘块 35：i = 35 ÷ 16 取整 = 2，j = 35 mod 16 = 3。所以是第 2 行第 3 列。', duration: 6400, draw: function () { draw(1); } },
          { sub: '反过来：字号 5、位号 9 → b = 16 × 5 + 9 = 89。', duration: 6000, draw: function () { draw(2); } },
          { sub: '约定 B：字号、位号都从 1 开始。公式变成 b = n × (i−1) + j。', duration: 6200, draw: function () { draw(3); } },
          { sub: '同样盘块 35，在约定 B 下：i = (35−1)÷16 取整 +1 = 3，j = (35−1) mod 16 + 1 = 3。', duration: 6600, draw: function () { draw(4); } },
          { sub: '字号 5、位号 9，约定 B → b = 16 × 4 + 9 = 73。和约定 A 的 89 不同！', duration: 6400, draw: function () { draw(5); } },
          { sub: '考试提醒：先看题目用哪套约定，全程统一。两套混用，答案一定错。', duration: 6200, draw: function () { draw(6); } }
        ]
      };
    }
  };

  /* ---------------- 3.2 分配与回收 ---------------- */
  var scene32 = {
    id: '3.2',
    short: '分配与回收',
    title: '分配：找第一个 0；回收：按盘块号置 0',
    build: function (host) {
      var n = 16;
      var baseUsed = [0, 1, 2, 5, 6, 7, 10, 11, 12, 15, 18, 20, 21, 22, 25, 30, 31, 35, 40, 41, 45, 46, 50, 55, 60, 61];
      var used0 = {};
      baseUsed.forEach(function (b) { used0[b] = true; });

      var firstFree = null;
      for (var b = 0; b < 64; b++) {
        if (!used0[b]) { firstFree = b; break; }
      }
      var used1 = {};
      for (var k in used0) used1[k] = true;
      used1[firstFree] = true;
      var pAlloc = E.blockToPos(firstFree, n, 0);

      var recycleBlock = 20;
      var used2 = {};
      for (var k2 in used1) used2[k2] = true;
      delete used2[recycleBlock];
      var pRec = E.blockToPos(recycleBlock, n, 0);

      var words = E.bitmapWords(1000, n);
      var scanned = [];
      for (var s = 0; s < firstFree; s++) scanned.push(s);

      function draw(step) {
        clear(host);
        if (step === 0) {
          var f = h('div', 'formula');
          f.innerHTML =
            '位示图大小 = ⌈总盘块数 ÷ 每字位数⌉<br>' +
            '例：1000 个盘块，n = 16 → ⌈1000 ÷ 16⌉ = <span class="hl">' + words + ' 个字</span>';
          add(host, f);
          add(host, A.term('位示图', '一格一位，0 空闲、1 占用。分配就是“找 0 改 1”，回收就是“按号改 0”。'));
          add(host, bitmapGrid({ rows: 4, n: n, used: used0 }));
          return;
        }
        if (step === 1) {
          add(host, bitmapGrid({
            rows: 4, n: n, used: used1,
            scanned: scanned,
            found: firstFree,
            changed: [firstFree]
          }));
          var box = h('div', 'card plain');
          box.innerHTML =
            '<div class="row"><span class="chip accent">分配</span>' +
            '<span class="chip">第一个 0：盘块 ' + firstFree + '</span></div>' +
            '<div class="small muted" style="margin-top:6px">从左往右、从上往下扫，遇到第一个 0 就分配，并把它置 1。</div>';
          add(host, box);
          var f2 = h('div', 'formula');
          f2.innerHTML =
            '盘块 ' + firstFree + ' → i = ⌊' + firstFree + ' ÷ 16⌋ = ' + pAlloc.i +
            '，j = ' + firstFree + ' mod 16 = ' + pAlloc.j + '<br>' +
            '所以：第 ' + pAlloc.i + ' 字第 ' + pAlloc.j + ' 位置 1，盘块号 = ' + firstFree + '。';
          add(host, f2);
          return;
        }
        if (step === 2) {
          add(host, bitmapGrid({
            rows: 4, n: n, used: used1,
            highlight: [{ i: pRec.i, j: pRec.j }],
            changed: [recycleBlock]
          }));
          var box2 = h('div', 'card plain');
          box2.innerHTML =
            '<div class="row"><span class="chip danger">回收</span>' +
            '<span class="chip">盘块 ' + recycleBlock + '</span></div>' +
            '<div class="small muted" style="margin-top:6px">已知盘块号，先算字号、位号，再把这一位置 0。</div>';
          add(host, box2);
          var f3 = h('div', 'formula');
          f3.innerHTML =
            '盘块 ' + recycleBlock + ' → i = ⌊' + recycleBlock + ' ÷ 16⌋ = ' + pRec.i +
            '，j = ' + recycleBlock + ' mod 16 = ' + pRec.j + '<br>' +
            '第 ' + pRec.i + ' 字第 ' + pRec.j + ' 位：1 → 0，回收完成。';
          add(host, f3);
          return;
        }
        add(host, A.box('ok',
          '<b>两个动作：</b>分配 = 找第一个 0 → 置 1 → 算盘块号；回收 = 由盘块号算 (i,j) → 置 0。'));
        add(host, bitmapGrid({ rows: 4, n: n, used: used2, changed: [recycleBlock] }));
        add(host, A.term('别忘向上取整', '1000 ÷ 16 = 62.5，位示图至少要 63 个字，不能只写 62。'));
      }

      return {
        steps: [
          { sub: '先记位示图大小：总盘块数 ÷ 每字位数，向上取整。1000 块、16 位 → 63 个字。', duration: 6400, draw: function () { draw(0); } },
          { sub: '分配：从前往后找第一个 0。前 3 位都是 1，第 4 位（盘块 3）是 0 → 分配它，置 1。', duration: 6800, draw: function () { draw(1); } },
          { sub: '回收：盘块 20 → i = 1，j = 4，把第 1 行第 4 位置 0。', duration: 6400, draw: function () { draw(2); } },
          { sub: '位示图就靠这两个动作维护：找 0 分配，按号回收。', duration: 6000, draw: function () { draw(3); } }
        ]
      };
    }
  };

  /* ---------------- 3.3 模板与错误 ---------------- */
  var scene33 = {
    id: '3.3',
    short: '模板 + 常见错误',
    title: '位示图解题模板与常见错误',
    build: function (host) {
      function templateStep() {
        clear(host);
        add(host, A.box('ok', '<b>位示图题，按这 4 步走：</b>'));
        add(host, numList([
          '先确认编号起点：字号、位号、盘块号是从 0 还是从 1 开始（看题目或课件）。',
          '分配：从前往后扫，找到第一个 0 → 置 1 → 用 b = n × i + j（或从 1 起的公式）算盘块号。',
          '回收：已知盘块号 b → 算 i、j → 把对应位置 0。',
          '位示图大小：总盘块数 ÷ n，向上取整。'
        ]));
        var f = h('div', 'formula');
        f.innerHTML =
          '从 0 起：b = n × i + j　　i = ⌊b ÷ n⌋，j = b mod n<br>' +
          '从 1 起：b = n × (i − 1) + j　　i = ⌊(b − 1) ÷ n⌋ + 1，j = (b − 1) mod n + 1';
        add(host, f);
        add(host, A.term('一句话', '一张表、两个动作：找 0 分配，按号回收。所有坐标都从同一个起点数。'));
      }

      function errorStep() {
        clear(host);
        add(host, A.box('danger', '<b>位示图最常见的 5 个错：</b>'));
        var errs = [
          ['两套约定混用', '算字号时用“从 1 起”，算盘块号时又用“从 0 起”，答案必错。'],
          ['忘记向上取整', '1000 ÷ 16 = 62.5，位示图要 63 个字，不是 62。'],
          ['盘块号和字号位号搞反', '题目给的是盘块号 b 就用除法拆 i、j；给的是 (i,j) 就用乘法合成 b。'],
          ['分配后忘了置 1', '找到 0 只是选中，必须把这一位改成 1，才算分配出去。'],
          ['回收时行列数错', 'b ÷ n 的商是字号 i，余数是位号 j；从 1 起还要再 +1。']
        ];
        errs.forEach(function (e, i) {
          var c = h('div', 'card plain');
          c.innerHTML = '<div class="row"><span class="chip danger">' + (i + 1) + '</span><b>' + e[0] + '</b></div>' +
            '<div class="small muted" style="margin-top:4px">' + e[1] + '</div>';
          add(host, c);
        });
        add(host, A.box('ok',
          '<b>检查：</b>把算出的 (i,j) 代回 b = n×i+j（或从 1 起公式），能回到原盘块号就对了。'));
      }

      return {
        steps: [
          { sub: '位示图四步：确认起点 → 分配找 0 置 1 → 回收按号置 0 → 大小向上取整。', duration: 6400, draw: templateStep },
          { sub: '最后检查：约定有没有混用？有没有向上取整？分配后置 1 了吗？回收的行列数对吗？', duration: 6600, draw: errorStep }
        ]
      };
    }
  };

  A.bitmapScenes = [scene30, scene31, scene32, scene33];
})(window.OSApp);

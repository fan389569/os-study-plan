/* 模块③ 首次适应 */
(function () {
  'use strict';
  var U = window.UI;
  var D = window.DATA;
  var FIT = D.fit;
  var S = FIT.snapshots;
  var CMP = D.fitCmp;
  var FREE = D.fitCmpFree;
  var F = U.fmt;

  function say(t) { return '<div class="say">' + t + '</div>'; }
  function freeTxt(f) { return '[' + f.start + ',' + (f.start + f.size) + ') ' + f.size + 'KB'; }
  function allocTxt(a) { return '[' + a.start + ',' + (a.start + a.size) + ')'; }

  function opBanner(s) {
    if (s.op.type === 'init') return '<div class="op-banner init"><span class="op-tag">起点</span><b>初始状态</b></div>';
    if (s.op.type === 'alloc') {
      return '<div class="op-banner alloc"><span class="op-tag">申请</span><b>' + s.op.name + '</b><em>' + s.op.size + ' KB</em>' +
        '<span class="op-step">操作 ' + s.index + ' / ' + (S.length - 1) + '</span></div>';
    }
    return '<div class="op-banner free"><span class="op-tag">释放</span><b>' + s.op.name + '</b><em>' + s.released.size + ' KB</em>' +
      '<span class="op-step">操作 ' + s.index + ' / ' + (S.length - 1) + '</span></div>';
  }

  function scanLine(s) {
    if (!s.scan || !s.scan.length) return '';
    var items = s.scan.map(function (x) {
      return '<span class="sl-item ' + (x.ok ? 'ok' : 'no') + '">[' + x.start + ',' + (x.start + x.size) + ') ' +
        x.size + 'KB · ' + (x.ok ? '够，选中' : '不够，跳过') + '</span>';
    }).join('<span class="sl-ar">→</span>');
    return '<div class="scanline"><span class="sl-cap">扫描空闲链</span>' + items + '</div>';
  }

  function splitNote(s) {
    if (!s.split) return '';
    var sp = s.split;
    return '<div class="split-note"><b>切分：</b>从 [' + sp.original.start + ',' + (sp.original.start + sp.original.size) + ') ' +
      sp.original.size + 'KB 中，切出 [' + sp.allocated.start + ',' + (sp.allocated.start + sp.allocated.size) + ') ' +
      sp.allocated.size + 'KB；剩下 ' +
      (sp.remain ? '[' + sp.remain.start + ',' + (sp.remain.start + sp.remain.size) + ') ' + sp.remain.size + 'KB' : '0KB，节点删除') + '。</div>';
  }

  function mergeNote(s) {
    if (s.op.type !== 'free') return '';
    var txt = '释放 [' + s.released.start + ',' + (s.released.start + s.released.size) + ') ' + s.released.size + 'KB。';
    if (!s.merges || !s.merges.length) {
      return '<div class="merge-note no-merge"><b>' + txt + '</b>前后空闲块都不相邻 → <b>不合并</b>。</div>';
    }
    var parts = s.merges.map(function (m) {
      return '与' + (m.side === 'left' ? '左边' : '右边') + ' [' + m.other.start + ',' + (m.other.start + m.other.size) + ') ' + m.other.size + 'KB 相邻';
    }).join('；');
    return '<div class="merge-note has-merge"><b>' + txt + '</b>' + parts + ' → 合并成 [' +
      s.mergedBlock.start + ',' + (s.mergedBlock.start + s.mergedBlock.size) + ') <b>' + s.mergedBlock.size + 'KB</b>。</div>';
  }

  function fitView(s) {
    var marks = {};
    if (s.scan) {
      s.scan.forEach(function (x) { if (!x.ok) marks[x.start] = 'skip'; });
    }
    if (s.split && s.split.remain) marks[s.split.remain.start] = 'split';
    if (s.merges && s.merges.length && s.mergedBlock) marks[s.mergedBlock.start] = 'merge';

    var flashStart = null;
    if (s.op.type === 'alloc' && s.allocated) flashStart = s.allocated.start;
    if (s.op.type === 'free' && s.merges && s.merges.length) flashStart = s.mergedBlock.start;

    return U.memStrip(FIT.memKB, s.free, s.alloc, {
      flashStart: flashStart,
      mergeStart: s.merges && s.merges.length ? s.mergedBlock.start : null
    }) +
      U.freeChain(s.free, { marks: marks }) +
      U.allocLine(s.alloc) +
      scanLine(s) + splitNote(s) + mergeNote(s);
  }

  function sceneStrip() {
    return {
      id: '3.0',
      short: '内存条',
      title: '内存是一条长条',
      steps: [
        {
          caption: '把内存用户区想成一条 ' + FIT.memKB + 'KB 的长条，初始整条都是空闲的。',
          html: function () {
            return U.sceneHead('3.0 场景', '先画一条内存', '0 到 512KB，左闭右开') +
              U.memStrip(FIT.memKB, [{ start: 0, size: FIT.memKB }], []) +
              say('左闭右开 [0,512) 表示包含 0，不包含 512；每一段都这样写，终点不会重复算。');
          }
        },
        {
          caption: '空闲分区链按起始地址从小到大排队，每个节点只记两件事：起始地址、大小。',
          html: function () {
            return U.sceneHead('3.0 场景', '空闲分区链') +
              U.memStrip(FIT.memKB, [{ start: 0, size: FIT.memKB }], []) +
              U.freeChain([{ start: 0, size: FIT.memKB }]) +
              say('分配就是改这条链；释放就是往链里插节点。所有操作都围着这条链转。');
          }
        }
      ]
    };
  }

  /* ---------- 3.1 规则（示意链） ---------- */

  var DEMO = {
    free: [{ start: 0, size: 60 }, { start: 200, size: 120 }, { start: 400, size: 300 }],
    req: 130
  };
  var DEMO_CHOICE = DEMO.free.filter(function (f) { return f.size >= DEMO.req; })[0];
  var DEMO_REST = { start: DEMO_CHOICE.start + DEMO.req, size: DEMO_CHOICE.size - DEMO.req };

  function sceneRule() {
    return {
      id: '3.1',
      short: '规则',
      title: '首次适应的规则',
      steps: [
        {
          caption: '首次适应：从链首开始扫，遇到第一个装得下的空闲块就分配。',
          html: function () {
            return U.sceneHead('3.1 场景', '一句话规则', '示意链：只看规则，不画整条内存') +
              U.freeChain(DEMO.free) +
              '<div class="request-banner">收到申请：<b>' + DEMO.req + ' KB</b></div>' +
              say('从第一个节点开始看，够大就停，不往后比较谁更合适。');
          }
        },
        {
          caption: '第一个 ' + DEMO.free[0].size + 'KB 不够，跳过；第二个 ' + DEMO.free[1].size + 'KB 也不够，跳过；第三个 ' + DEMO.free[2].size + 'KB 够，停下。',
          dur: 6500,
          html: function () {
            var marks = {};
            marks[0] = 'skip'; marks[200] = 'skip'; marks[400] = 'chosen';
            return U.sceneHead('3.1 场景', '扫描指针从左往右') +
              U.freeChain(DEMO.free, { marks: marks }) +
              '<div class="scanline"><span class="sl-cap">扫描</span>' +
                '<span class="sl-item no">' + freeTxt(DEMO.free[0]) + ' · 不够，跳过</span><span class="sl-ar">→</span>' +
                '<span class="sl-item no">' + freeTxt(DEMO.free[1]) + ' · 不够，跳过</span><span class="sl-ar">→</span>' +
                '<span class="sl-item ok">' + freeTxt(DEMO.free[2]) + ' · 够，选中</span></div>' +
              say('扫描指针走到第一个够大的节点就停，这就是“首次适应”。');
          }
        },
        {
          caption: '切掉 ' + DEMO.req + 'KB，剩下的 ' + DEMO_REST.size + 'KB 留在原处，起始地址从 ' + DEMO_CHOICE.start + ' 挪到 ' + DEMO_REST.start + '。',
          dur: 6200,
          html: function () {
            var after = [
              { start: 0, size: 60 },
              { start: 200, size: 120 },
              { start: DEMO_REST.start, size: DEMO_REST.size }
            ];
            return U.sceneHead('3.1 场景', '切分与剩余') +
              '<div class="split-visual">' +
                '<div class="sv-orig"><b>[' + DEMO_CHOICE.start + ',' + (DEMO_CHOICE.start + DEMO_CHOICE.size) + ') ' + DEMO_CHOICE.size + 'KB</b><span>原空闲块</span></div>' +
                '<div class="sv-arrow">→</div>' +
                '<div class="sv-alloc"><b>[' + DEMO_CHOICE.start + ',' + (DEMO_CHOICE.start + DEMO.req) + ') ' + DEMO.req + 'KB</b><span>分配给作业</span></div>' +
                '<div class="sv-plus">+</div>' +
                '<div class="sv-rest"><b>[' + DEMO_REST.start + ',' + (DEMO_REST.start + DEMO_REST.size) + ') ' + DEMO_REST.size + 'KB</b><span>剩下的空闲</span></div>' +
              '</div>' +
              U.freeChain(after, { marks: (function () { var m = {}; m[DEMO_REST.start] = 'split'; return m; })() }) +
              say('只改节点里的“起始地址”和“大小”，节点位置不动。');
          }
        }
      ]
    };
  }

  /* ---------- 3.2 主线题 7 步 ---------- */

  function sceneMain() {
    var caps = [
      '初始：整条 ' + FIT.memKB + 'KB 空闲，空闲链只有一个节点 [0,' + FIT.memKB + ')。',
      S[1].op.name + ' 申请 ' + S[1].op.size + 'KB：链首 [0,' + FIT.memKB + ') 够大，分配 ' + allocTxt(S[1].allocated) + '，剩下 ' + freeTxt(S[1].split.remain) + '。',
      S[2].op.name + ' 申请 ' + S[2].op.size + 'KB：链首 ' + freeTxt(S[1].free[0]) + ' 够大，分配 ' + allocTxt(S[2].allocated) + '，剩下 ' + freeTxt(S[2].split.remain) + '。',
      S[3].op.name + ' 申请 ' + S[3].op.size + 'KB：链首 ' + freeTxt(S[2].free[0]) + ' 够，分配 ' + allocTxt(S[3].allocated) + '，剩下 ' + freeTxt(S[3].split.remain) + '。',
      S[4].op.name + ' 释放 ' + freeTxt(S[4].released) + '。它和 ' + freeTxt(S[3].free[0]) + ' 不相邻，不合并，空闲链变成两块。',
      S[5].op.name + ' 申请 ' + S[5].op.size + 'KB：先看 ' + freeTxt(S[5].scan[0]) + ' 不够，跳过；再看 ' + freeTxt(S[5].scan[1]) + ' 够，分配 ' + allocTxt(S[5].allocated) + '。',
      S[6].op.name + ' 释放 ' + freeTxt(S[6].released) + '。它和右边的 ' + freeTxt(S[6].merges[0].other) + ' 紧挨着，合并成 ' + freeTxt(S[6].mergedBlock) + '。',
      S[7].op.name + ' 申请 ' + S[7].op.size + 'KB：链首 ' + freeTxt(S[6].free[0]) + ' 够，分配 ' + allocTxt(S[7].allocated) + '，剩下 ' + freeTxt(S[7].split.remain) + '。'
    ];
    var steps = [];
    for (var i = 0; i <= 7; i++) {
      (function (idx) {
        steps.push({
          caption: caps[idx],
          dur: idx === 0 || idx === 5 || idx === 6 ? 6500 : 5600,
          html: function () {
            return U.sceneHead('3.2 · 主线题', '7 步操作 · 第 ' + idx + ' 步', '首次适应：每步先看空闲链，再改内存条') +
              opBanner(S[idx]) +
              fitView(S[idx]);
          }
        });
      })(i);
    }
    steps.push({
      caption: '最终已分配 ' + FIT.finalAlloc.map(function (a) { return a.size; }).join(' + ') + ' = ' + FIT.allocatedKB +
        'KB；内存利用率 = ' + FIT.allocatedKB + ' ÷ ' + FIT.memKB + ' ≈ ' + U.fmt1(FIT.utilization * 100) + '%。',
      dur: 7000,
      html: function () {
        return U.sceneHead('3.2 · 主线题', '最终状态与利用率') +
          '<div class="op-banner final"><span class="op-tag">最终</span><b>7 步操作完成</b></div>' +
          fitView(S[7]) +
          '<div class="util-card">' +
            '<div class="uc-row"><span>已分配</span><b>' + FIT.finalAlloc.map(function (a) { return a.size; }).join(' + ') +
              ' = ' + FIT.allocatedKB + ' KB</b></div>' +
            '<div class="uc-row"><span>内存利用率</span><b>' + FIT.allocatedKB + ' ÷ ' + FIT.memKB + ' = ' +
              U.fmt1(FIT.utilization * 100) + '%</b></div>' +
          '</div>' +
          say('最终空闲分区：' + FIT.finalFree.map(freeTxt).join(' 和 ') + '。');
      }
    });
    return {
      id: '3.2',
      short: '7步',
      title: '主线题：7 步操作',
      steps: steps
    };
  }

  /* ---------- 3.3 优缺点 + 三算法对比 ---------- */

  function cmpCards(chosenKey) {
    return '<div class="cmp-row">' + FREE.map(function (f, i) {
      var chosen = CMP[chosenKey] && CMP[chosenKey].start === f.start;
      return '<div class="cmp-card ' + (chosen ? 'on' : '') + '">' +
        '<div class="cmp-idx">块 ' + String.fromCharCode(65 + i) + '</div>' +
        '<div class="cmp-addr">起始 ' + f.start + '</div>' +
        '<div class="cmp-size">' + f.size + ' KB</div>' +
        '<div class="cmp-tag">' + (chosen ? '选中' : '') + '</div></div>';
    }).join('') + '</div>';
  }

  function sceneCompare() {
    return {
      id: '3.3',
      short: '对比',
      title: '优缺点与三种适应',
      steps: [
        {
          caption: '首次适应的优点：尽量保留高地址的大块连续空闲区，后面的大作业更容易放。',
          html: function () {
            return U.sceneHead('3.3 · 优缺点', '优点：高地址留大块') +
              U.memStrip(FIT.memKB, FIT.finalFree, FIT.finalAlloc) +
              U.callout('good', '看最终状态', '高地址的 ' + freeTxt(FIT.finalFree[1]) + ' 还有连续空间，大作业来了还能用。') +
              say('因为它总是从低地址开始找，先把低地址切碎，高地址的大块就保住了。');
          }
        },
        {
          caption: '缺点：低地址被反复切割，留下很多小碎片；越到后面，扫描经过的碎片越多。',
          html: function () {
            return U.sceneHead('3.3 · 优缺点', '缺点：低地址碎片多') +
              U.memStrip(FIT.memKB, FIT.finalFree, FIT.finalAlloc) +
              U.callout('bad', '碎片积累', freeTxt(FIT.finalFree[0]) + ' 单独看不起眼，但放不下大作业。每次申请都要从头扫过这些小碎片，效率变低。') +
              say('这就是“首次适应”的代价：实现简单，但低地址会越来越碎。');
          }
        },
        {
          caption: '15 秒补充对比：三个空闲块 ' + FREE.map(function (f) { return f.size; }).join('、') + 'KB，申请 ' + CMP.request + 'KB。首次适应选第一个够用的 ' + CMP.first.size + 'KB。',
          html: function () {
            return U.sceneHead('3.3 · 三种适应', '首次适应：第一个够用就行') +
              cmpCards('first') +
              say('从地址小的往大扫，第一个 ≥' + CMP.request + 'KB 的块就选中，不比较谁更合适。');
          }
        },
        {
          caption: '最佳适应：选最小的够用块，也就是 ' + CMP.best.size + 'KB 那块。',
          html: function () {
            return U.sceneHead('3.3 · 三种适应', '最佳适应：最小的够用块') +
              cmpCards('best') +
              say('把每个块都看一遍，选浪费最少的那块；代价是扫描更久，还容易留下更小的碎片。');
          }
        },
        {
          caption: '最坏适应：选最大的块，也就是 ' + CMP.worst.size + 'KB 那块。',
          html: function () {
            return U.sceneHead('3.3 · 三种适应', '最坏适应：最大的块') +
              cmpCards('worst') +
              say('选最大的块，切完剩下的部分还比较大，可能还能用；但大块很快会被用光。');
          }
        },
        {
          caption: '记住区别：首次适应找“第一个”，最佳适应找“最小够用”，最坏适应找“最大”。',
          html: function () {
            var rows = [
              ['首次适应', '第一个够用的块', CMP.first.size + 'KB'],
              ['最佳适应', '最小的够用块', CMP.best.size + 'KB'],
              ['最坏适应', '最大的块', CMP.worst.size + 'KB']
            ].map(function (r) {
              return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="num">' + r[2] + '</td></tr>';
            }).join('');
            return U.sceneHead('3.3 · 三种适应', '一张表记住') +
              '<table class="tbl"><thead><tr><th>算法</th><th>怎么选</th><th>本题选中</th></tr></thead><tbody>' + rows + '</tbody></table>' +
              say('考试如果只考首次适应，记住“从链首扫，第一个够大就用”。');
          }
        }
      ]
    };
  }

  /* ---------- 3.4 模板 ---------- */

  function tplItem(n, title, body) {
    return '<div class="tpl-item"><div class="tpl-num">' + n + '</div><div><b>' + title + '</b><p>' + body + '</p></div></div>';
  }

  function sceneTemplate() {
    return {
      id: '3.4',
      short: '模板',
      title: '解题模板',
      steps: [
        {
          caption: '模板前半段：每步先写空闲分区表，申请时从链首往下找第一个够大的。',
          html: function () {
            return U.sceneHead('3.4 · 解题模板', '申请与切分') +
              tplItem('1', '先画内存条和空闲链', '每个节点写（起始地址，大小），按地址从小到大排。') +
              tplItem('2', '申请：从链首扫描', '第一个大小 ≥ 申请量的节点就是目标。') +
              tplItem('3', '切分', '分配 [start, start+size)；剩余 [start+size, end)。正好相等就删掉节点。') +
              U.callout('info', '写题格式', '每一步都写出“操作 → 空闲分区表”，老师按步给分。');
          }
        },
        {
          caption: '模板后半段：释放时插回链中，检查左右邻居；最后用已分配量除以总量。',
          html: function () {
            return U.sceneHead('3.4 · 解题模板', '释放与利用率') +
              tplItem('4', '释放：按地址插回链', '插回后检查前、后两个节点是否与它相邻。') +
              tplItem('5', '相邻就合并', '起点和终点的地址正好接上，就把两个节点合成一个。') +
              tplItem('6', '算利用率', '利用率 = 已分配总量 ÷ 总内存，不是空闲量 ÷ 总量。') +
              U.callout('warn', '最常见的丢分点', '释放后忘记检查合并；分配后忘记改剩余块的起始地址。');
          }
        }
      ]
    };
  }

  function errRow(wrong, right) {
    return '<div class="err-row"><span class="err-badge">错</span><div><b>' + wrong + '</b><p>' + right + '</p></div></div>';
  }

  function sceneErrors() {
    return {
      id: '3.5',
      short: '易错',
      title: '常见错误',
      steps: [
        {
          caption: '第一类：释放不合并、分配不改起始地址、区间开闭算错。',
          html: function () {
            return U.sceneHead('3.5 · 常见错误', '链的维护') +
              errRow('释放后忘记合并', '本题 ' + S[6].op.name + '释放 ' + freeTxt(S[6].released) + '，必须和 ' + freeTxt(S[6].merges[0].other) + ' 合并成 ' + freeTxt(S[6].mergedBlock) + '。') +
              errRow('分配后只改大小，不改起始地址', '切掉前半段后，剩余块起点要往后挪：从 ' + S[1].allocated.start + ' 变成 ' + S[1].split.remain.start + '。') +
              errRow('区间“含不含终点”算错', '统一用左闭右开 [起, 止)，本题 ' + freeTxt(FIT.finalFree[0]) + ' 大小是 ' + (FIT.finalFree[0].start + FIT.finalFree[0].size) + '−' + FIT.finalFree[0].start + '=' + FIT.finalFree[0].size + '。');
          }
        },
        {
          caption: '第二类：扫描选错、算法混淆、利用率算反。',
          html: function () {
            return U.sceneHead('3.5 · 常见错误', '选择与计算') +
              errRow('首次适应跳过第一个够大的块', '首次适应必须用第一个够大的，不能挑“更合适”的。') +
              errRow('把首次适应当成最佳适应', '最佳适应才找最小够用块；首次只看顺序。') +
              errRow('利用率用空闲量除以总量', '利用率 = 已分配 ÷ 总量；本题 ' + FIT.allocatedKB + ' ÷ ' + FIT.memKB + '，不是 ' + FIT.freeKB + ' ÷ ' + FIT.memKB + '。') +
              errRow('忘记“释放后空出的块”也要参与后续分配', '释放的块回到链里，后面的申请可以再用它。');
          }
        }
      ]
    };
  }

  window.MODULES = window.MODULES || {};
  window.MODULES.m3 = {
    title: '首次适应',
    sub: '512KB 内存、7 步申请与释放：每步都画内存条和空闲链',
    scenes: [sceneStrip(), sceneRule(), sceneMain(), sceneCompare(), sceneTemplate(), sceneErrors()]
  };
})();

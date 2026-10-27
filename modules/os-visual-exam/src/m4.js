/* 模块④ 快表 TLB */
(function () {
  'use strict';
  var U = window.UI;
  var D = window.DATA;
  var T = D.tlb;
  var F = U.fmt;

  function say(t) { return '<div class="say">' + t + '</div>'; }

  function arch(hitPt, hitData, showTlb) {
    return '<div class="arch">' +
      '<div class="arch-row">' +
        '<div class="arch-box cpu">CPU<span>发出逻辑地址</span></div>' +
        (showTlb ? '<div class="arch-tie">⇄</div><div class="arch-box tlb on">TLB 快表<span>查一次 ' + T.tlbNs + 'ns</span></div>' : '') +
      '</div>' +
      '<div class="arch-arrow ' + (hitPt === true ? 'on' : '') + '">↓ 查页表</div>' +
      '<div class="arch-box pt ' + (hitPt === true ? 'on' : '') + '">主存里的页表<span>' + T.memNs + 'ns / 次</span></div>' +
      '<div class="arch-arrow ' + (hitData === true ? 'on' : '') + '">↓ 按块号取数据</div>' +
      '<div class="arch-box data ' + (hitData === true ? 'on' : '') + '">数据块<span>' + T.memNs + 'ns / 次</span></div>' +
      '</div>';
  }

  function tlRow(kind, showSaved) {
    var total = kind === 'hit' ? T.hitTime : T.missTime;
    var max = T.missTime;
    var segs = '<div class="tl-seg tlb" style="width:' + (T.tlbNs / total * 100) + '%">' + T.tlbNs + '</div>';
    if (kind === 'miss') {
      segs += '<div class="tl-seg page ' + (showSaved ? 'saved' : '') + '" style="width:' + (T.memNs / total * 100) + '%">查页表 ' + T.memNs + '</div>';
    }
    segs += '<div class="tl-seg mem" style="width:' + (T.memNs / total * 100) + '%">' +
      (kind === 'hit' ? '取数据 ' : '取数据 ') + T.memNs + '</div>';
    return '<div class="tl-row ' + kind + '">' +
      '<div class="tl-name"><b>' + (kind === 'hit' ? '命中' : '未命中') + '</b><span>' +
        (kind === 'hit' ? 'TLB 里有这一页' : 'TLB 里没有') + '</span></div>' +
      '<div class="tl-track"><div class="tl-bar" style="width:' + (total / max * 100) + '%">' + segs + '</div></div>' +
      '<div class="tl-total">' + total + 'ns</div>' +
      '</div>';
  }

  function sceneWhy() {
    return {
      id: '4.0',
      short: '为什么',
      title: '为什么需要快表',
      steps: [
        {
          caption: 'CPU 拿到逻辑地址，先去页表里查：这一页被放在哪个物理块。',
          html: function () {
            return U.sceneHead('4.0 场景', '访问数据的路线', '页表在主存里') +
              arch(false, false, false) +
              say('页表就是记着“哪一页在哪个块”的那张表。');
          }
        },
        {
          caption: '页表放在主存里，查一次页表就是访问一次内存，花 ' + T.memNs + 'ns。',
          html: function () {
            return U.sceneHead('4.0 场景', '第 1 次内存访问：查页表') +
              arch(true, false, false) +
              '<div class="big-result"><span>查页表</span><b>' + T.memNs + '</b><span>ns</span></div>' +
              say('这一步只是拿到块号，还没拿到真正想要的数据。');
          }
        },
        {
          caption: '再按块号去那个块取数据，又是第 2 次内存访问，再花 ' + T.memNs + 'ns。',
          html: function () {
            return U.sceneHead('4.0 场景', '第 2 次内存访问：取数据') +
              arch(true, true, false) +
              '<div class="big-result"><span>取数据</span><b>' + T.memNs + '</b><span>ns</span></div>' +
              say('一次取数据，实际访问了两次内存：先查表，再取数。');
          }
        },
        {
          caption: '所以不设快表：' + T.memNs + ' + ' + T.memNs + ' = ' + T.noTlb + 'ns。这就是要引入快表的原因。',
          dur: 6200,
          html: function () {
            return U.sceneHead('4.0 场景', '不设快表：100ns') +
              arch(true, true, false) +
              U.formula(T.memNs + ' + ' + T.memNs + ' = <b>' + T.noTlb + 'ns</b>', 'big') +
              U.callout('bad', '太慢了', '每次取数据都要查两遍内存。能不能把最近用过的页表项抄近一点？');
          }
        },
        {
          caption: '快表 TLB 是 CPU 旁边的一块很小很快的“小抄”，只记最近用过的页表项。',
          html: function () {
            return U.sceneHead('4.0 场景', '快表 TLB 是什么') +
              arch(false, false, true) +
              U.callout('good', '生活类比', '把常用电话号码抄进手机通讯录，就不用每次都翻厚厚的电话簿。TLB 就是那页通讯录。') +
              say('页表项就是页表里的一行：记着一页对应哪个块。TLB 很小，只能装几十到几百项，存的是这些页表项的副本。');
          }
        }
      ]
    };
  }

  function scenePaths() {
    return {
      id: '4.1',
      short: '两条路',
      title: '命中和未命中两条路',
      steps: [
        {
          caption: '命中：TLB 里有这一页，' + T.tlbNs + 'ns 查到块号，再花 ' + T.memNs + 'ns 取数据，共 ' + T.hitTime + 'ns。',
          dur: 6200,
          html: function () {
            return U.sceneHead('4.1 场景', '命中路径', 'TLB 命中') +
              tlRow('hit') +
              U.formula(T.tlbNs + ' + ' + T.memNs + ' = <b>' + T.hitTime + 'ns</b>', 'big') +
              U.legend([{ cls: 'sw tlb', label: '查 TLB' }, { cls: 'sw mem', label: '访问内存' }]) +
              say('只访问了一次内存：取数据。查 TLB 不算访问内存。');
          }
        },
        {
          caption: '未命中：先花 ' + T.tlbNs + 'ns 查 TLB，没查到；再花 ' + T.memNs + 'ns 查内存页表，最后 ' + T.memNs + 'ns 取数据，共 ' + T.missTime + 'ns。',
          dur: 6800,
          html: function () {
            return U.sceneHead('4.1 场景', '未命中路径', 'TLB 里没有，只能去内存查页表') +
              tlRow('miss') +
              U.formula(T.tlbNs + ' + ' + T.memNs + ' + ' + T.memNs + ' = <b>' + T.missTime + 'ns</b>', 'big') +
              U.legend([{ cls: 'sw tlb', label: '查 TLB' }, { cls: 'sw page', label: '查内存页表' }, { cls: 'sw mem', label: '取数据' }]) +
              say('未命中要访问两次内存：查页表 + 取数据。');
          }
        },
        {
          caption: '两条路摆在一起：命中省掉的是“查内存页表”那 ' + T.memNs + 'ns。',
          dur: 6500,
          html: function () {
            return U.sceneHead('4.1 场景', '对比：省掉哪一段') +
              tlRow('hit') +
              tlRow('miss', true) +
              U.callout('info', '看图', '未命中那条里标着“查页表”的 ' + T.memNs + 'ns，命中时被 TLB 里的副本替代了，所以只花 ' + T.hitTime + 'ns。') +
              say('两条时间轴按 ns 成比例画；TLB 的 5ns 段很短，看总长度即可。');
          }
        }
      ]
    };
  }

  function dots() {
    var s = '<div class="dot-grid">';
    for (var i = 0; i < 100; i++) {
      s += '<span class="dot ' + (i < Math.round(T.hit * 100) ? 'hit' : 'miss') + '"></span>';
    }
    return s + '</div>';
  }

  function chart() {
    var X0 = 50, X1 = 580, Y0 = 210, Y1 = 30;
    function x(h) { return X0 + h * (X1 - X0); }
    function y(v) { return Y0 - (v - 50) / 60 * (Y0 - Y1); }
    var h0 = 0, h1 = 1;
    var line = 'M' + x(0) + ',' + y(T.missTime) + ' L' + x(1) + ',' + y(T.hitTime);
    var noY = y(T.noTlb);
    var beX = x(T.breakEven);
    var startEat = T.eat;
    return '<svg class="eat-chart" viewBox="0 0 620 260" role="img" aria-label="有效访问时间随命中率变化">' +
      '<rect x="50" y="30" width="530" height="180" class="chart-bg"></rect>' +
      '<line x1="50" y1="210" x2="580" y2="210" class="axis"></line>' +
      '<line x1="50" y1="30" x2="50" y2="210" class="axis"></line>' +
      '<line x1="50" y1="' + noY + '" x2="580" y2="' + noY + '" class="no-tlb-line"></line>' +
      '<text x="576" y="' + (noY - 8) + '" class="chart-lab end">不设快表 ' + T.noTlb + 'ns</text>' +
      '<text x="580" y="228" class="chart-lab end">命中率 100%</text>' +
      '<text x="50" y="228" class="chart-lab">0%</text>' +
      '<text x="315" y="228" class="chart-lab mid">50%</text>' +
      '<text x="44" y="214" class="chart-lab end">50ns</text>' +
      '<text x="44" y="34" class="chart-lab end">110ns</text>' +
      '<path d="' + line + '" class="eat-line"></path>' +
      '<circle cx="' + beX + '" cy="' + noY + '" r="4" class="be-dot"></circle>' +
      '<text x="' + (beX + 8) + '" y="' + (noY + 18) + '" class="chart-lab be-label">临界 ' + U.fmt1(T.breakEven * 100) + '%</text>' +
      '<line class="guide" x1="' + x(T.hit) + '" y1="30" x2="' + x(T.hit) + '" y2="210"></line>' +
      '<circle class="marker" cx="' + x(T.hit) + '" cy="' + y(startEat) + '" r="7"></circle>' +
      '<text class="marker-lab" x="' + (x(T.hit) - 18) + '" y="' + (y(startEat) - 14) + '">' + U.fmt1(startEat) + 'ns</text>' +
      '</svg>';
  }

  function sceneAverage() {
    return {
      id: '4.2',
      short: '加权平均',
      title: '有效访问时间与滑块',
      steps: [
        {
          caption: '假设一共访问 100 次：' + T.hitCount + ' 次命中，' + T.missCount + ' 次未命中。',
          html: function () {
            return U.sceneHead('4.2 场景', '100 次访问的分布') +
              dots() +
              U.legend([{ cls: 'sw hit', label: '命中 ' + Math.round(T.hit * 100) + ' 次' }, { cls: 'sw miss', label: '未命中 ' + Math.round((1 - T.hit) * 100) + ' 次' }]) +
              say('命中率 80% 的意思是：100 次里大约 80 次能在 TLB 里直接找到。');
          }
        },
        {
          caption: '命中 ' + T.hitCount + ' 次 × ' + T.hitTime + 'ns = ' + F(T.hitCount * T.hitTime) + 'ns；未命中 ' + T.missCount + ' 次 × ' + T.missTime + 'ns = ' + F(T.missCount * T.missTime) + 'ns。',
          dur: 6500,
          html: function () {
            return U.sceneHead('4.2 场景', '把两条路的时间加起来') +
              '<div class="calc-cols">' +
                '<div class="calc-col hit"><b>命中 ' + T.hitCount + ' 次</b><span>' + T.hitCount + ' × ' + T.hitTime + ' = ' + F(T.hitCount * T.hitTime) + ' ns</span></div>' +
                '<div class="calc-col miss"><b>未命中 ' + T.missCount + ' 次</b><span>' + T.missCount + ' × ' + T.missTime + ' = ' + F(T.missCount * T.missTime) + ' ns</span></div>' +
              '</div>' +
              U.formula(F(T.hitCount * T.hitTime) + ' + ' + F(T.missCount * T.missTime) + ' = <b>' + F(T.total100) + ' ns</b>', 'big') +
              say('总时间 6500ns 是 100 次访问的总和。');
          }
        },
        {
          caption: '平均每次 = ' + F(T.total100) + ' ÷ 100 = ' + U.fmt1(T.eat) + 'ns。这个平均值就叫“有效访问时间”（EAT）。',
          dur: 6500,
          html: function () {
            return U.sceneHead('4.2 场景', '有效访问时间 EAT') +
              U.formula(F(T.total100) + ' ÷ 100 = <b>' + U.fmt1(T.eat) + 'ns</b>', 'big') +
              '<div class="big-result"><span>EAT</span><b>' + U.fmt1(T.eat) + '</b><span>ns / 次</span></div>' +
              U.callout('info', '大白话', '有效访问时间就是“平均每次访问数据要花多少时间”，把命中和未命中按比例平均。') +
              say('不用真的访问 100 次，用加权平均就能算。');
          }
        },
        {
          caption: '公式：EAT = 命中率 × (TLB + 内存) + (1 − 命中率) × (TLB + 2 × 内存)。',
          dur: 6800,
          html: function () {
            return U.sceneHead('4.2 场景', '把过程写成公式') +
              U.formula('EAT = h × (t + m) + (1 − h) × (t + 2m)', 'big') +
              '<div class="var-table">' +
                '<span><b>h</b> 命中率 = ' + T.hit + '</span>' +
                '<span><b>t</b> 查 TLB 时间 = ' + T.tlbNs + 'ns</span>' +
                '<span><b>m</b> 一次内存 = ' + T.memNs + 'ns</span>' +
              '</div>' +
              U.formula(U.fmt1(T.hit) + ' × (' + T.tlbNs + '+' + T.memNs + ') + ' + U.fmt1(1 - T.hit) + ' × (' + T.tlbNs + '+2×' + T.memNs + ') = <b>' + U.fmt1(T.eat) + 'ns</b>') +
              say('记住括号里的意思：命中 1 次内存，未命中 2 次内存，但都要先查 TLB。');
          }
        },
        {
          caption: '试卷写法：' + T.memNs + ' + ' + T.tlbNs + '×' + U.fmt1(T.hit) + ' + (' + T.memNs + '+' + T.tlbNs + ')×' + U.fmt1(1 - T.hit) + ' = ' + U.fmt1(T.exam) + '，和上面的公式等价。',
          html: function () {
            return U.sceneHead('4.2 场景', '试卷上的写法') +
              U.formula(T.memNs + ' + ' + T.tlbNs + '×' + U.fmt1(T.hit) + ' + (' + T.memNs + '+' + T.tlbNs + ')×' + U.fmt1(1 - T.hit) + ' = <b>' + U.fmt1(T.exam) + '</b>', 'big') +
              U.callout('info', '两种写法一样', '试卷写法把“每次都有的 ' + T.memNs + 'ns 取数据”提出来，再加 TLB 的加权时间；代数上和 EAT 公式完全等价。') +
              say('考试用哪种都行，写清楚 h、t、m 各是多少。');
          }
        },
        {
          caption: '拖动滑块看命中率变化：0% 时 ' + T.missTime + 'ns，100% 时 ' + T.hitTime + 'ns；不设快表固定 ' + T.noTlb + 'ns。',
          dur: 8000,
          html: function () {
            return U.sceneHead('4.2 场景', '互动：改变命中率') +
              '<div class="slider-card">' +
                '<div class="slider-top"><span>命中率 h</span><b class="h-val">' + Math.round(T.hit * 100) + '%</b></div>' +
                '<input class="h-slider" type="range" min="0" max="100" step="1" value="' + Math.round(T.hit * 100) + '" aria-label="命中率">' +
                '<div class="slider-mid">' +
                  '<span>命中 <b>' + T.hitTime + 'ns</b></span>' +
                  '<span>未命中 <b>' + T.missTime + 'ns</b></span>' +
                  '<span class="eat-now">EAT <b class="eat-val">' + U.fmt1(T.eat) + 'ns</b></span>' +
                '</div>' +
              '</div>' +
              chart() +
              '<div class="slider-note">不设快表的 100ns 线在图上；命中率高于 <b>' + U.fmt1(T.breakEven * 100) + '%</b> 时，快表才开始划算。</div>';
          },
          enter: function (root) {
            var input = root.querySelector('.h-slider');
            var marker = root.querySelector('.marker');
            var lab = root.querySelector('.marker-lab');
            var guide = root.querySelector('.guide');
            var hval = root.querySelector('.h-val');
            var eval_ = root.querySelector('.eat-val');
            if (!input || !marker) return;
            function x(h) { return 50 + h * 530; }
            function y(v) { return 210 - (v - 50) / 60 * 180; }
            function update() {
              var h = Number(input.value) / 100;
              var eat = h * T.hitTime + (1 - h) * T.missTime;
              hval.textContent = Math.round(h * 100) + '%';
              eval_.textContent = eat.toFixed(1) + 'ns';
              marker.setAttribute('cx', x(h));
              marker.setAttribute('cy', y(eat));
              lab.setAttribute('x', x(h) - 18);
              lab.setAttribute('y', y(eat) - 14);
              lab.textContent = eat.toFixed(1) + 'ns';
              guide.setAttribute('x1', x(h));
              guide.setAttribute('x2', x(h));
            }
            input.addEventListener('input', update);
            update();
          }
        }
      ]
    };
  }

  function tplItem(n, title, body) {
    return '<div class="tpl-item"><div class="tpl-num">' + n + '</div><div><b>' + title + '</b><p>' + body + '</p></div></div>';
  }

  function sceneTemplate() {
    return {
      id: '4.3',
      short: '模板',
      title: '解题模板',
      steps: [
        {
          caption: '模板前半段：先写清两条路径各自花多少时间。',
          html: function () {
            return U.sceneHead('4.3 · 解题模板', '两条路径') +
              tplItem('1', '命中路径', '查 TLB + 取数据 = t + m = ' + T.hitTime + 'ns。') +
              tplItem('2', '未命中路径', '查 TLB + 查页表 + 取数据 = t + 2m = ' + T.missTime + 'ns。') +
              tplItem('3', '不设快表', '查页表 + 取数据 = 2m = ' + T.noTlb + 'ns。') +
              U.callout('info', '先列三行', '不管题目怎么问，先把 ' + T.hitTime + '、' + T.missTime + '、' + T.noTlb + ' 这三个数写出来，后面不会乱。');
          }
        },
        {
          caption: '模板后半段：按命中率加权，套 EAT 公式。',
          html: function () {
            return U.sceneHead('4.3 · 解题模板', '加权平均') +
              tplItem('4', '套公式', 'EAT = h × (t + m) + (1 − h) × (t + 2m)。') +
              tplItem('5', '代入', 'h = ' + T.hit + '，t = ' + T.tlbNs + '，m = ' + T.memNs + '，得 ' + U.fmt1(T.eat) + 'ns。') +
              tplItem('6', '检查', '结果一定在命中时间 ' + T.hitTime + ' 和未命中时间 ' + T.missTime + ' 之间。') +
              U.callout('warn', '单位', '题目给 ns 就用 ns，最后别漏单位。');
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
      id: '4.4',
      short: '易错',
      title: '常见错误与口径',
      steps: [
        {
          caption: '第一类：未命中时漏掉查 TLB 的 ' + T.tlbNs + 'ns，或者漏掉最后取数据的 ' + T.memNs + 'ns。',
          html: function () {
            return U.sceneHead('4.4 · 常见错误', '路径漏项') +
              errRow('未命中只算 ' + T.memNs + ' + ' + T.memNs + ' = ' + (2 * T.memNs) + 'ns', '先查 TLB ' + T.tlbNs + 'ns，再查页表 ' + T.memNs + 'ns，再取数据 ' + T.memNs + 'ns，是 ' + T.missTime + 'ns。') +
              errRow('未命中忘记最后取数据', '查完页表只是拿到块号，还要去那个块取数据。') +
              errRow('命中时把 TLB 的 ' + T.tlbNs + 'ns 漏掉', '命中路径是 ' + T.tlbNs + ' + ' + T.memNs + ' = ' + T.hitTime + 'ns。');
          }
        },
        {
          caption: '第二类：权重弄反、把 ' + T.noTlb + 'ns 当答案、不同教材口径不同。',
          html: function () {
            return U.sceneHead('4.4 · 常见错误', '加权与口径') +
              errRow('把 0.8 乘到未命中上', '命中率乘命中时间，1 − 命中率乘未命中时间。') +
              errRow('不设快表也写 ' + U.fmt1(T.eat) + 'ns', '不设快表是 2 × ' + T.memNs + ' = ' + T.noTlb + 'ns，' + U.fmt1(T.eat) + 'ns 是设了快表后的平均值。') +
              errRow('不知道 TLB 未命中要不要算 ' + T.tlbNs + 'ns', '本课程约定：算。未命中 = ' + T.tlbNs + ' + ' + T.memNs + ' + ' + T.memNs + ' = ' + T.missTime + 'ns。') +
              U.callout('warn', '一句提醒', '不同教材对“未命中是否计入 TLB 查找时间”有不同约定；本课程试卷计入，以本页为准。');
          }
        }
      ]
    };
  }

  window.MODULES = window.MODULES || {};
  window.MODULES.m4 = {
    title: '快表 TLB',
    sub: '5ns 查 TLB、80% 命中：从两条路径到 65ns 的加权平均',
    scenes: [sceneWhy(), scenePaths(), sceneAverage(), sceneTemplate(), sceneErrors()]
  };
})();

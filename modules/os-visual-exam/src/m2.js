/* 模块② 分页地址变换 */
(function () {
  'use strict';
  var U = window.UI;
  var D = window.DATA;
  var A = D.pagingA;
  var B = D.pagingB;
  var SEG = D.seg;
  var F = U.fmt;

  function say(t) { return '<div class="say">' + t + '</div>'; }

  function ptable(table, active, note) {
    var keys = Object.keys(table).map(Number).sort(function (a, b) { return a - b; });
    var rows = keys.map(function (k) {
      return '<tr class="' + (k === active ? 'on' : '') + '"><td>页 ' + k + '</td><td class="ar">→</td>' +
        '<td>块 ' + table[k] + '</td></tr>';
    }).join('');
    return '<div class="ptable-wrap"><div class="ptable-cap">页表（前台对照表）</div>' +
      '<table class="ptable"><tbody>' + rows + '</tbody></table>' +
      (note ? '<div class="ptable-note">' + note + '</div>' : '') + '</div>';
  }

  function building(floors, activeFloor, room, cls, title) {
    var html = '<div class="building ' + cls + '"><div class="b-title">' + title + '</div>';
    for (var f = floors - 1; f >= 0; f--) {
      html += '<div class="floor ' + (f === activeFloor ? 'on' : '') + '">' +
        '<span class="floor-no">' + f + ' 层</span><div class="rooms">';
      for (var r = 0; r < 4; r++) {
        html += '<span class="room ' + (f === activeFloor && r === room ? 'on' : '') + '">' + r + '</span>';
      }
      html += '</div></div>';
    }
    return html + '</div>';
  }

  function hexRow(dec, bin, hexv) {
    return '<div class="hex-row"><span class="hx-dec">' + dec + '</span><span class="hx-eq">=</span>' +
      '<span class="hx-bin">' + U.group4(bin) + '</span><span class="hx-eq">→</span>' +
      '<span class="hx-hex">' + hexv + 'H</span></div>';
  }

  /* ---------- 2.0 酒店类比 ---------- */

  function sceneHotel() {
    return {
      id: '2.0',
      short: '酒店',
      title: '逻辑地址 = 楼层 + 房间',
      steps: [
        {
          caption: '逻辑地址就是程序眼里的地址，像“楼层号 + 房间号”。程序说我要 ' + A.page + ' 楼 2 号房。',
          html: function () {
            return U.sceneHead('2.0 场景', '先把地址想成酒店房间', '逻辑地址 = 页号 + 页内偏移') +
              '<div class="hotel">' +
                building(4, 1, 2, 'logical', '逻辑空间（程序看到）') +
                '<div class="hotel-side"><div class="hs-box"><b>页号</b><span>1 楼</span></div><div class="hs-plus">+</div><div class="hs-box"><b>页内偏移</b><span>2 号房</span></div></div>' +
              '</div>' +
              say('逻辑地址 = <b>页号</b>（楼层）+ <b>页内偏移</b>（房间号）。');
          }
        },
        {
          caption: '页表就是前台的对照表：程序说“我要 ' + A.page + ' 楼”，前台告诉你“去真实 ' + A.frame + ' 楼”。',
          html: function () {
            return U.sceneHead('2.0 场景', '页表 = 前台对照表') +
              '<div class="hotel">' +
                building(4, 1, 2, 'logical', '逻辑空间') +
                ptable({ 0: 2, 1: 3, 2: 7 }, 1, '页 1 → 块 3') +
                '<div class="hotel-side"><div class="hs-box accent"><b>查表结果</b><span>去 3 号块</span></div></div>' +
              '</div>' +
              say('页表只负责回答一件事：<b>这一页被放到哪个物理块了？</b>');
          }
        },
        {
          caption: '变换时只换楼层号，房间号原封不动。所以真实地址是 ' + A.frame + ' 楼 2 号房。',
          html: function () {
            return U.sceneHead('2.0 场景', '只换楼层，不换房间') +
              '<div class="hotel">' +
                building(4, 1, 2, 'logical', '逻辑空间') +
                ptable({ 0: 2, 1: 3, 2: 7 }, 1) +
                building(8, 3, 2, 'physical', '物理空间（真实内存）') +
              '</div>' +
              U.callout('good', '不变的是页内偏移', '页内偏移 2 号房在变换前后完全一样，只有页号 1 被换成块号 3。') +
              say('记住这句话，地址变换就不会做反。');
          }
        }
      ]
    };
  }

  /* ---------- 2.1 页与块 ---------- */

  function isOn(active, i) {
    return Array.isArray(active) ? active.indexOf(i) >= 0 : active === i;
  }

  function pageCards(active) {
    var pages = [0, 1, 2, 3].map(function (i) {
      return '<div class="pg-card ' + (isOn(active, i) ? 'on' : '') + '"><b>页 ' + i + '</b><span>2KB</span></div>';
    }).join('');
    return '<div class="pg-row">' + pages + '</div>';
  }

  function frameGrid(active) {
    var frames = '';
    for (var i = 0; i < 8; i++) {
      frames += '<div class="fr-card ' + (isOn(active, i) ? 'on' : '') + '"><b>' + i + '</b><span>块</span></div>';
    }
    return '<div class="fr-grid">' + frames + '</div>';
  }

  function sceneSplit() {
    return {
      id: '2.1',
      short: '切页',
      title: '程序切页，内存切块',
      steps: [
        {
          caption: '程序按固定大小切成“页”，每页 ' + (A.pageSize / 1024) + 'KB。页是逻辑空间里的单位。',
          html: function () {
            return U.sceneHead('2.1 场景', '程序切成页') +
              pageCards(-1) +
              say('页就像把一本书按固定厚度切成小册子，每册大小一样。');
          }
        },
        {
          caption: '内存也按同样大小切成块（页框），每块也是 ' + (A.pageSize / 1024) + 'KB。',
          html: function () {
            return U.sceneHead('2.1 场景', '内存切成块（页框）') +
              '<div class="split-cols">' +
                '<div>' + pageCards(-1) + '<div class="ccap">逻辑空间 · 页</div></div>' +
                '<div>' + frameGrid(-1) + '<div class="ccap">物理内存 · 块</div></div>' +
              '</div>' +
              say('页和块大小必须一样，这样一页才能整块塞进一个块里。');
          }
        },
        {
          caption: '页可以放进任意空闲块，不用连续；页表记录每一页被放到了哪个块。',
          html: function () {
            return U.sceneHead('2.1 场景', '用页表记录对应关系') +
              '<div class="split-cols">' +
                '<div>' + pageCards([0, 1, 2]) + '<div class="ccap">逻辑空间 · 页</div></div>' +
                ptable({ 0: 2, 1: 3, 2: 7 }, 1) +
                '<div>' + frameGrid([2, 3, 7]) + '<div class="ccap">物理内存 · 块</div></div>' +
              '</div>' +
              say('程序依次放入 2、3、7 号块：页 0 → 块 2，页 1 → 块 3，页 2 → 块 7。');
          }
        }
      ]
    };
  }

  /* ---------- 2.2 题 A ---------- */

  function bitBarA() {
    return U.bitBar([
      { bits: A.cfg.pageBits, label: '页号（高位 11–17）', cls: 'page', value: A.pageBin },
      { bits: A.cfg.offsetBits, label: '页内偏移（低位 0–10）', cls: 'off', value: A.offsetBin }
    ], { foot: '2800 的 18 位二进制：<b>' + U.group4(A.vaBin) + '</b>' });
  }

  function sceneA() {
    var wrong = parseInt('1AE0', 16);
    return {
      id: '2.2',
      short: '题A',
      title: '题 A：18 位地址，2800 在哪',
      steps: [
        {
          caption: A.cfg.addrBits + ' 位地址，从右往左切：低 ' + A.cfg.offsetBits + ' 位是页内偏移，高 ' + A.cfg.pageBits + ' 位是页号。',
          dur: 6200,
          html: function () {
            return U.sceneHead('2.2 · 题 A', '先切地址', '地址长度 18 位，页号 11–17，偏移 0–10') +
              bitBarA() +
              say('右边 11 位管“页内第几个字节”，左边 7 位管“第几页”。');
          }
        },
        {
          caption: '页内 ' + A.cfg.offsetBits + ' 位 → 每页 2' + U.sup(A.cfg.offsetBits) + ' = ' + A.pageSize + 'B = ' + (A.pageSize / 1024) + 'KB。',
          html: function () {
            return U.sceneHead('2.2 · 题 A', '页大小') +
              U.formula('2' + U.sup(A.cfg.offsetBits) + ' = <b>' + A.pageSize + '</b> B = <b>' + (A.pageSize / 1024) + ' KB</b>', 'big') +
              bitBarA() +
              say('页内偏移有 11 位，能表示 0 到 2047，正好 2048 个字节。');
          }
        },
        {
          caption: '页号 ' + A.cfg.pageBits + ' 位 → 最多 2' + U.sup(A.cfg.pageBits) + ' = ' + A.pageCount + ' 个块；主存最大 2' + U.sup(A.cfg.addrBits) + ' = ' + (A.maxMem / 1024) + 'KB。',
          dur: 6000,
          html: function () {
            return U.sceneHead('2.2 · 题 A', '页数与主存上限') +
              U.formula('页号 ' + A.cfg.pageBits + ' 位 → 2' + U.sup(A.cfg.pageBits) + ' = <b>' + A.pageCount + '</b> 页 / 块', 'big') +
              U.formula('总地址 ' + A.cfg.addrBits + ' 位 → 2' + U.sup(A.cfg.addrBits) + ' = <b>' + F(A.maxMem) + '</b> B = <b>' + (A.maxMem / 1024) + ' KB</b>', 'big') +
              say('页号位数决定“最多能有多少页”，总位数决定“主存最大能有多大”。');
          }
        },
        {
          caption: '相对地址（程序眼里的逻辑地址）' + A.cfg.va + '：' + A.cfg.va + ' ÷ ' + A.pageSize + ' = ' + A.page + ' 余 ' + A.offset + '，所以页号 ' + A.page + '，页内偏移 ' + A.offset + '。',
          dur: 6500,
          html: function () {
            return U.sceneHead('2.2 · 题 A', '第 1 步：拆分地址') +
              U.formula(A.cfg.va + ' ÷ ' + A.pageSize + ' = <b>' + A.page + '</b> 余 <b>' + A.offset + '</b>', 'big') +
              '<div class="result-grid">' +
                '<div class="res"><span>页号</span><b>' + A.page + '</b></div>' +
                '<div class="res"><span>页内偏移</span><b>' + A.offset + '</b></div>' +
              '</div>' +
              say('商是页号，余数是页内偏移。页号从 0 开始。');
          }
        },
        {
          caption: '查页表：页 ' + A.page + ' 被放在 ' + A.frame + ' 号物理块。',
          html: function () {
            return U.sceneHead('2.2 · 题 A', '第 2 步：查页表') +
              '<div class="two-col">' +
                '<div class="result-grid vertical">' +
                  '<div class="res"><span>页号</span><b>' + A.page + '</b></div>' +
                  '<div class="res"><span>页内偏移</span><b>' + A.offset + '</b></div>' +
                '</div>' +
                ptable(A.cfg.pageTable, A.page, '页 1 → 块 3') +
              '</div>' +
              say('页表项只换页号，偏移原样带过去。');
          }
        },
        {
          caption: '物理地址 = 块号 × 页大小 + 页内偏移 = ' + A.frame + ' × ' + A.pageSize + ' + ' + A.offset + ' = ' + F(A.pa) + '。',
          dur: 6500,
          html: function () {
            return U.sceneHead('2.2 · 题 A', '第 3 步：算物理地址') +
              U.formula('块号 × 页大小 + 偏移', '') +
              U.formula(A.frame + ' × ' + A.pageSize + ' + ' + A.offset + ' = <b>' + F(A.pa) + '</b>', 'big') +
              '<div class="result-grid">' +
                '<div class="res"><span>块号</span><b>' + A.frame + '</b></div>' +
                '<div class="res"><span>页大小</span><b>' + A.pageSize + '</b><small>字节</small></div>' +
                '<div class="res"><span>偏移</span><b>' + A.offset + '</b><small>字节</small></div>' +
              '</div>' +
              say('这里的 6896 是十进制物理地址。');
          }
        },
        {
          caption: '换成十六进制：' + F(A.pa) + ' = ' + U.group4(A.pa.toString(2).padStart(16, '0')) + ' = ' + A.paHex + 'H。',
          dur: 6500,
          html: function () {
            return U.sceneHead('2.2 · 题 A', '第 4 步：转十六进制') +
              hexRow(F(A.pa), A.pa.toString(2).padStart(16, '0'), A.paHex) +
              U.formula(F(A.pa) + ' = <b>' + A.paHex + 'H</b>', 'big') +
              say('按 4 位一组切开，每组换成一位十六进制：0001→1，1010→A，1111→F，0000→0。');
          }
        },
        {
          caption: '提醒：试卷标准答案写的是 1AE0，那是 ' + wrong + '，按题面算应为 ' + A.paHex + '。',
          html: function () {
            return U.sceneHead('2.2 · 题 A', '答案口径') +
              U.callout('bad', '试卷答案有误', '1AE0H = ' + wrong + '，与 ' + A.frame + ' × ' + A.pageSize + ' + ' + A.offset + ' = ' + F(A.pa) + ' 不符。正确结果：<b>' + A.paHex + 'H</b>。') +
              U.callout('info', '考试怎么写', '把“3 × 2048 + 752 = 6896 = 1AF0H”写全，过程清楚即可。') +
              say('别为了迎合错误答案改自己的计算。');
          }
        }
      ]
    };
  }

  /* ---------- 2.3 题 B ---------- */

  function bitBarB() {
    return U.bitBar([
      { bits: B.pageBits, label: '页号 5 位', cls: 'page', value: B.pageBin },
      { bits: B.offsetBits, label: '页内偏移 11 位', cls: 'off', value: B.offsetBin }
    ], { foot: '0CA8H 的 16 位二进制：<b>' + U.group4(B.vaBin) + '</b>' });
  }

  function bitBarBOut() {
    return U.bitBar([
      { bits: B.pageBits, label: '块号 5 位（已替换）', cls: 'frame', value: B.frameBin },
      { bits: B.offsetBits, label: '页内偏移 11 位（不变）', cls: 'off', value: B.offsetBin }
    ], { foot: '拼起来：<b>' + U.group4(B.paBin) + '</b>' });
  }

  function sceneB() {
    return {
      id: '2.3',
      short: '题B',
      title: '题 B：0CA8H 变成多少',
      steps: [
        {
          caption: B.cfg.pages + ' 页 → 页号 ' + B.pageBits + ' 位；每页 ' + (B.pageSize / 1024) + 'KB → 页内偏移 ' + B.offsetBits + ' 位；总地址 ' + B.totalBits + ' 位。',
          html: function () {
            return U.sceneHead('2.3 · 题 B', '先定地址格式') +
              U.formula(B.cfg.pages + ' = 2' + U.sup(B.pageBits) + ' → 页号 <b>' + B.pageBits + '</b> 位', 'big') +
              U.formula((B.pageSize / 1024) + 'KB = 2' + U.sup(B.offsetBits) + 'B → 偏移 <b>' + B.offsetBits + '</b> 位', 'big') +
              U.formula('总共 <b>' + B.totalBits + '</b> 位', 'big') +
              say('页大小是 2 的幂，所以不用做除法，直接切位。');
          }
        },
        {
          caption: B.vaHex + 'H 先展开成 ' + B.totalBits + ' 位二进制：' + U.group4(B.vaBin) + '。',
          html: function () {
            return U.sceneHead('2.3 · 题 B', '第 1 步：展开成二进制') +
              U.formula(B.vaHex + 'H = <b>' + U.group4(B.vaBin) + '</b>B', 'big') +
              bitBarB() +
              say('一位十六进制正好对应 4 位二进制，补齐 16 位再切。');
          }
        },
        {
          caption: '从右边数 ' + B.offsetBits + ' 位切一刀：左边 ' + B.pageBits + ' 位是页号 ' + B.pageBin + '，右边 ' + B.offsetBits + ' 位是偏移。',
          dur: 6200,
          html: function () {
            return U.sceneHead('2.3 · 题 B', '第 2 步：切位') +
              bitBarB() +
              U.formula(B.pageBin + ' | ' + B.offsetBin, 'big') +
              say('页号就取高 5 位，页内偏移就取低 11 位，不要动偏移。');
          }
        },
        {
          caption: '页号 ' + B.pageBin + ' = ' + B.page + '，查页表：页 ' + B.page + ' 放在 ' + B.frame + ' 号块，' + B.frame + ' 的 ' + B.pageBits + ' 位二进制是 ' + B.frameBin + '。',
          html: function () {
            return U.sceneHead('2.3 · 题 B', '第 3 步：查页表') +
              '<div class="two-col">' +
                '<div class="result-grid vertical">' +
                  '<div class="res"><span>页号</span><b>00001</b><small>= 1</small></div>' +
                  '<div class="res"><span>物理块</span><b>14</b></div>' +
                '</div>' +
                ptable(B.cfg.pageTable, 1, '页 1 → 块 14 = 01110') +
              '</div>' +
              say('块号 ' + B.frame + ' 用 ' + B.pageBits + ' 位二进制写：' + B.frameBin + '。');
          }
        },
        {
          caption: '把高 ' + B.pageBits + ' 位换成 ' + B.frameBin + '，低 ' + B.offsetBits + ' 位原样照抄：' + B.frameBin + ' | ' + B.offsetBin + '。',
          dur: 6200,
          html: function () {
            return U.sceneHead('2.3 · 题 B', '第 4 步：替换页号') +
              bitBarBOut() +
              U.formula(B.frameBin + ' | ' + B.offsetBin + ' = <b>' + U.group4(B.paBin) + '</b>', 'big') +
              say('只换前 5 位；后 11 位一个都不能变。');
          }
        },
        {
          caption: '按 4 位一组转回十六进制：' + U.group4(B.paBin) + ' → ' + B.paHex + 'H。',
          dur: 6200,
          html: function () {
            return U.sceneHead('2.3 · 题 B', '第 5 步：拼回十六进制') +
              '<div class="hex-row"><span class="hx-eq">二进制</span><span class="hx-bin">' + U.group4(B.paBin) + '</span><span class="hx-eq">→</span><span class="hx-hex">' + B.paHex + 'H</span></div>' +
              U.formula('物理地址 = <b>' + B.paHex + 'H</b>', 'big') +
              say('0111→7，0100→4，1010→A，1000→8。');
          }
        },
        {
          caption: '核心技巧：页大小是 2 的幂，十六进制地址可以直接切位，不用做除法。',
          html: function () {
            return U.sceneHead('2.3 · 题 B', '把技巧记下来') +
              U.callout('good', '切位法', '页内 11 位 = 十六进制低 3 位（11 位不是 4 的整数倍，但可以按二进制切）。先把十六进制展开成二进制，切完再拼回去，最稳。') +
              U.formula(B.vaHex + 'H → ' + B.pageBin + ' | ' + B.offsetBin + ' → ' + B.frameBin + ' | ' + B.offsetBin + ' → ' + B.paHex + 'H') +
              say('熟练后可以口算：偏移 4A8H 不变，只把高 5 位的页号 00001 换成块号 01110。');
          }
        }
      ]
    };
  }

  /* ---------- 2.4 两个提醒 ---------- */

  function sceneReminders() {
    return {
      id: '2.4',
      short: '提醒',
      title: '两个必须知道的提醒',
      steps: [
        {
          caption: '页号 ≥ 页表长度时，说明这一页根本不存在，会触发越界中断。',
          html: function () {
            return U.sceneHead('2.4 · 两个提醒', '越界检查') +
              '<div class="two-col">' +
                ptable({ 0: 2, 1: 3, 2: 7 }, -1, '页表只有 3 项：0、1、2') +
                '<div class="bounds-box"><div class="bb-title">程序要访问页 5</div>' +
                  '<div class="bb-line"><span>页号 5</span><b>≥</b><span>页表长度 3</span></div>' +
                  '<div class="bb-result">越界中断</div></div>' +
              '</div>' +
              U.callout('info', '大白话', '页表是一张只有 3 行的表，程序却问第 5 行，系统只能说：没有这一页，报错。');
          }
        },
        {
          caption: '页表放在内存里：查页表一次内存，取数据再一次，所以不设快表至少要 2 次内存。',
          dur: 6200,
          html: function () {
            return U.sceneHead('2.4 · 两个提醒', '为什么访问一次数据要两次内存') +
              '<div class="access-flow">' +
                '<div class="af-box cpu">CPU</div>' +
                '<div class="af-arrow">查页表 → <b>50ns</b></div>' +
                '<div class="af-box mem">内存里的页表</div>' +
                '<div class="af-arrow">取数据 → <b>50ns</b></div>' +
                '<div class="af-box data">数据块</div>' +
              '</div>' +
              U.formula(D.tlb.memNs + ' + ' + D.tlb.memNs + ' = <b>' + D.tlb.noTlb + 'ns</b>', 'big') +
              say('如果每次访存都这样，太慢了。这就是下一模块“快表 TLB”要解决的问题。');
          }
        },
        {
          caption: '把这两句话记住：页号越界会中断；页表在内存，访问数据至少两次内存。',
          html: function () {
            return U.sceneHead('2.4 · 两个提醒', '一句话复习') +
              U.callout('warn', '提醒 1', '页号 ≥ 页表长度 → 越界中断，不是“随便找个块”。') +
              U.callout('warn', '提醒 2', '不设快表：查页表 1 次 + 取数据 1 次 = 至少 2 次内存。') +
              say('下一页开始做快表的计算题。');
          }
        }
      ]
    };
  }

  /* ---------- 2.5 分段 ---------- */

  function sceneSeg() {
    return {
      id: '2.5',
      short: '分段',
      title: '顺带：分段（25 卷选择 12）',
      steps: [
        {
          caption: '地址 ' + SEG.cfg.addrBits + ' 位，其中 ' + SEG.cfg.segBits + ' 位段号，剩下 ' + SEG.offsetBits + ' 位就是段内地址。',
          html: function () {
            return U.sceneHead('2.5 · 顺带：分段', '24 位 = 8 位段号 + 16 位段内地址') +
              U.bitBar([
                { bits: SEG.cfg.segBits, label: '段号 8 位', cls: 'page', value: '' },
                { bits: SEG.offsetBits, label: '段内地址 16 位', cls: 'off', value: '' }
              ]) +
              say('段号管“第几段”，段内地址管“段内第几个字节”。');
          }
        },
        {
          caption: '段内 ' + SEG.offsetBits + ' 位 → 每段最大 2' + U.sup(SEG.offsetBits) + 'B = ' + SEG.maxSegKB + 'KB；段号 ' + SEG.cfg.segBits + ' 位 → 最多 ' + SEG.maxSegments + ' 段。',
          html: function () {
            return U.sceneHead('2.5 · 顺带：分段', '算上限') +
              U.formula('2¹⁶ = <b>' + F(SEG.maxSegBytes) + '</b> B = <b>' + SEG.maxSegKB + ' KB</b>', 'big') +
              U.formula('2⁸ = <b>' + SEG.maxSegments + '</b> 段', 'big') +
              say('和分页的算法一模一样：看位数，算 2 的幂。');
          }
        },
        {
          caption: '页和段的区别：页由系统按固定大小切，对用户透明；段按程序逻辑切，长度不固定。',
          html: function () {
            return U.sceneHead('2.5 · 顺带：分段', '页 vs 段') +
              '<table class="tbl"><thead><tr><th></th><th>页</th><th>段</th></tr></thead><tbody>' +
                '<tr><td>谁来切</td><td>系统</td><td>程序逻辑</td></tr>' +
                '<tr><td>大小</td><td>固定</td><td>不固定</td></tr>' +
                '<tr><td>用户看得见吗</td><td>透明，看不见</td><td>看得见（函数、数据段）</td></tr>' +
              '</tbody></table>' +
              say('页是“机械地切”，段是“按意思切”。');
          }
        },
        {
          caption: '段页式访存：查段表 + 查页表 + 取数据 = 3 次内存。',
          html: function () {
            return U.sceneHead('2.5 · 顺带：分段', '段页式：3 次访存') +
              U.arrowRow([
                U.node('查段表', '一次内存', 'idx'),
                U.node('查页表', '又一次内存', 'idx'),
                U.node('取数据', '第三次', 'data')
              ], 'big-arrows') +
              U.formula('1 + 1 + 1 = <b>3</b> 次', 'big') +
              say('段表记每段放在哪、多长；页表记每页放在哪。这是选择题常考的一句话，记“段、页、数”三次。');
          }
        }
      ]
    };
  }

  /* ---------- 2.6 模板 ---------- */

  function tplItem(n, title, body) {
    return '<div class="tpl-item"><div class="tpl-num">' + n + '</div><div><b>' + title + '</b><p>' + body + '</p></div></div>';
  }

  function sceneTemplate() {
    return {
      id: '2.6',
      short: '模板',
      title: '解题模板',
      steps: [
        {
          caption: '模板前半段：先看页大小定偏移位数，再用总位数减出页号位数。',
          html: function () {
            return U.sceneHead('2.6 · 解题模板', '地址怎么切') +
              tplItem('1', '页内位数', '页大小 = 2ⁿ，n 就是页内位数。2KB → 11 位。') +
              tplItem('2', '页号位数', '总位数 − 页内位数。18 − 11 = 7 位。') +
              tplItem('3', '切地址', '页号 = 地址 ÷ 页大小（或取高位），偏移 = 余数（或取低位）。') +
              say('页大小是 2 的幂时，优先用切位，比除法快。');
          }
        },
        {
          caption: '模板后半段：查页表拿块号，块号拼偏移；十六进制按 4 位一组。',
          html: function () {
            return U.sceneHead('2.6 · 解题模板', '拼回物理地址') +
              tplItem('4', '查页表', '页号 → 物理块号。页表项只换页号。') +
              tplItem('5', '拼物理地址', '块号 × 页大小 + 页内偏移。') +
              tplItem('6', '转十六进制', '按 4 位二进制一组换成一位十六进制。') +
              U.callout('info', '检查', '页内偏移在变换前后必须完全一样；变了就说明做错了。');
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
      id: '2.7',
      short: '易错',
      title: '常见错误',
      steps: [
        {
          caption: '第一类：位数分反、十六进制没补齐、单位没换。',
          html: function () {
            return U.sceneHead('2.7 · 常见错误', '切位与单位') +
              errRow('页号和页内偏移的位数分反', '页内位数由页大小决定；剩下才是页号。2KB → 11 位偏移。') +
              errRow('十六进制转二进制没补够位数', '0CA8 是 4 位十六进制，必须展开成 16 位；少了前导 0 会切错。') +
              errRow('2KB 当成 2000B', '2KB = 2 × 1024 = 2048B。');
          }
        },
        {
          caption: '第二类：把页号当块号、页号从 1 数、拼回时改了偏移。',
          html: function () {
            return U.sceneHead('2.7 · 常见错误', '变换时的坑') +
              errRow('页号直接当物理块号', '页号只是页表的下标，必须查表换成块号。') +
              errRow('页号从 1 开始数', '页号、块号都从 0 开始。') +
              errRow('拼物理地址时把偏移也改了', '只替换页号那几位，页内偏移原样照抄。') +
              errRow('页号越界没有判断', '页号 ≥ 页表长度 → 越界中断。');
          }
        }
      ]
    };
  }

  window.MODULES = window.MODULES || {};
  window.MODULES.m2 = {
    title: '分页地址变换',
    sub: '酒店类比 + 两道真题：十进制 2800 与十六进制 0CA8H',
    scenes: [sceneHotel(), sceneSplit(), sceneA(), sceneB(), sceneReminders(), sceneSeg(), sceneTemplate(), sceneErrors()]
  };
})();

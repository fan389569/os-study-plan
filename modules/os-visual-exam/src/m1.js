/* 模块① 文件索引 inode */
(function () {
  'use strict';
  var U = window.UI;
  var D = window.DATA;
  var I = D.inode;
  var L = I.layout;
  var UZ = I.usage;
  var LK = D.linked;

  function R(key) {
    for (var i = 0; i < L.regions.length; i++) if (L.regions[i].key === key) return L.regions[i];
  }
  var RD = R('direct'), RS = R('single'), RB = R('double'), RT = R('triple');
  var P = L.p;
  var CUM = [RD.count, RD.count + RS.count, RD.count + RS.count + RB.count, L.totalBlocks];
  var F = U.fmt;

  function say(text) { return '<div class="say">' + text + '</div>'; }

  function diskGrid(marks, labels) {
    marks = marks || {}; labels = labels || {};
    var cells = '';
    for (var i = 0; i < 16; i++) {
      cells += '<div class="blk ' + (marks[i] || '') + '"><b>' + i + '</b>' +
        (labels[i] ? '<span class="blk-next">' + labels[i] + '</span>' : '') + '</div>';
    }
    return '<div class="disk-head"><span>磁盘</span><span>每一格 = 一个盘块</span></div>' +
      '<div class="disk-grid">' + cells + '</div>';
  }

  /* ---------- 1.0 磁盘与三种分配 ---------- */

  function sceneDisk() {
    return {
      id: '1.0',
      short: '磁盘',
      title: '文件在磁盘上怎么放',
      steps: [
        {
          caption: '磁盘被切成许多大小相同的格子，每个格子叫一个盘块。文件就是一堆盘块的集合。',
          html: function () {
            return U.sceneHead('1.0 场景', '文件在磁盘上怎么放', '先认识盘块，再看三种记录方式') +
              U.card('磁盘（示意 16 块）', diskGrid()) +
              say('核心问题只有一个：<b>怎么记住一个文件用了哪些盘块？</b>');
          }
        },
        {
          caption: '连续分配像排队占座：文件占一整串相邻盘块，找第 k 块只要“起始块 + k”。',
          html: function () {
            return U.sceneHead('1.0 场景', '连续分配：排队占座') +
              U.card('文件 A 占 4–7 号盘块', diskGrid({ 4: 'data', 5: 'data', 6: 'data', 7: 'data' })) +
              U.callout('good', '好处', '找块快：知道起始块，第 k 块直接算出来。') +
              U.callout('bad', '代价', '必须提前知道文件多大；删除后会留下零散的小空隙，叫<b>外部碎片</b>——单独看有空位，合起来却放不下一个大文件。');
          }
        },
        {
          caption: '链接分配像接龙：每个盘块末尾写着下一块的块号，文件不必连续。',
          html: function () {
            return U.sceneHead('1.0 场景', '链接分配：接龙') +
              U.card('文件 A 的盘块', diskGrid(
                { 4: 'data', 9: 'data', 12: 'data', 15: 'data' },
                { 4: '→ 9', 9: '→ 12', 12: '→ 15', 15: '结束' }
              )) +
              U.callout('good', '好处', '盘块可以随便放，不会因为找不到一整串连续空间而放不下。') +
              U.callout('bad', '代价', '只能从头顺着走。<b>随机访问</b>（不按顺序、直接跳到某一块）很慢：想找第 7 块，也得先走前面 7 个。');
          }
        },
        {
          caption: '索引分配像查目录：单独拿一个索引块，把文件用到的数据块号全列出来。',
          html: function () {
            return U.sceneHead('1.0 场景', '索引分配：查目录') +
              U.card('文件 A + 一个索引块', diskGrid({ 4: 'data', 9: 'data', 12: 'data', 2: 'index' }) +
                '<div class="index-inline"><span class="idx-chip">索引块 #2</span><span class="idx-arrow">→</span>' +
                '<span class="idx-entry">4</span><span class="idx-entry">9</span><span class="idx-entry">12</span></div>') +
              U.callout('good', '好处', '想要第几块，直接查表，不用顺着链走。索引块本身也是一个盘块。') +
              say('inode 用的就是索引思想：把“块号表”放在索引结点或索引块里。');
          }
        },
        {
          caption: '来做链接分配的计算题：文件有 ' + LK.chain.length + ' 个逻辑块，每块 ' + LK.blockSize + 'B，按链的顺序存放。',
          html: function () {
            return U.sceneHead('1.0 · 链接分配小题', '10 个逻辑块，块大小 1024B', '读文件偏移 7654 字节处的内容') +
              U.card('逻辑块 → 物理盘块',
                '<div class="chain-scroll"><div class="link-chain">' +
                LK.chain.map(function (b, i) {
                  return '<div class="lc ' + (i === LK.logical ? 'hi' : '') + '" data-i="' + i + '">' +
                    '<div class="lc-top">逻辑块 ' + i + '</div><div class="lc-bot">物理 ' + b + '</div></div>';
                }).join('<span class="lc-ar">→</span>') +
                '</div></div>') +
              say('<b>逻辑块</b>是文件自己从 0 编的号；<b>物理盘块</b>是磁盘上的真实块号。链按顺序排列。');
          }
        },
        {
          caption: LK.offset + ' ÷ ' + LK.blockSize + ' = ' + LK.logical + ' 余 ' + LK.inner + '：落在逻辑块 ' + LK.logical + '（从 0 数，是第 ' + (LK.logical + 1) + ' 块），块内再偏移 ' + LK.inner + ' 字节。',
          dur: 6200,
          html: function () {
            return U.sceneHead('1.0 · 链接分配小题', '第 1 步：字节偏移 → 逻辑块') +
              U.formula(LK.offset + ' ÷ ' + LK.blockSize + ' = <b>' + LK.logical + '</b> 余 <b>' + LK.inner + '</b>', 'big') +
              U.card('逻辑块 → 物理盘块',
                '<div class="chain-scroll"><div class="link-chain">' +
                LK.chain.map(function (b, i) {
                  return '<div class="lc ' + (i === LK.logical ? 'hi' : '') + '" data-i="' + i + '">' +
                    '<div class="lc-top">逻辑块 ' + i + '</div><div class="lc-bot">物理 ' + b + '</div></div>';
                }).join('<span class="lc-ar">→</span>') +
                '</div></div>') +
              say('块号从 <b>0</b> 开始数：逻辑块 7 是第 8 个。块内偏移是 486，不是 486 号块。');
          },
          enter: scrollChain
        },
        {
          caption: '顺着链数到逻辑块 ' + LK.logical + '，物理盘块是 ' + LK.physical + '；所以答案：' + LK.physical + ' 号盘块、块内偏移 ' + LK.inner + '。',
          dur: 6200,
          html: function () {
            return U.sceneHead('1.0 · 链接分配小题', '第 2 步：顺着链找物理块') +
              U.card('逻辑块 → 物理盘块',
                '<div class="chain-scroll"><div class="link-chain">' +
                LK.chain.map(function (b, i) {
                  return '<div class="lc ' + (i === LK.logical ? 'hi' : '') + '" data-i="' + i + '">' +
                    '<div class="lc-top">逻辑块 ' + i + '</div><div class="lc-bot">物理 ' + b + '</div></div>';
                }).join('<span class="lc-ar">→</span>') +
                '</div></div>') +
              '<div class="result-grid">' +
                '<div class="res"><span>逻辑块</span><b>' + LK.logical + '</b></div>' +
                '<div class="res"><span>物理盘块</span><b>' + LK.physical + '</b></div>' +
                '<div class="res"><span>块内偏移</span><b>' + LK.inner + '</b><small>字节</small></div>' +
              '</div>' +
              say('链接分配没有“直接跳”，只能顺着链数。这就是它随机访问慢的原因。');
          },
          enter: scrollChain
        }
      ]
    };
  }

  function scrollChain(root) {
    var box = root.querySelector('.chain-scroll');
    var item = root.querySelector('.lc.hi');
    if (!box || !item) return;
    var b = box.getBoundingClientRect();
    var r = item.getBoundingClientRect();
    box.scrollLeft += (r.left - b.left) - box.clientWidth / 2 + item.clientWidth / 2;
  }

  /* ---------- 1.1 inode 结构 ---------- */

  function inodeBox(active) {
    var cells = '';
    for (var i = 0; i < 10; i++) {
      cells += '<div class="ptr ' + (active === 'd' + i ? 'on' : '') + '"><span>' + i + '</span></div>';
    }
    return '<div class="inode-box">' +
      '<div class="inode-hd"><b>inode</b><span>索引结点 · 文件的“户口本”</span></div>' +
      '<div class="ptr-lab">10 个直接指针</div>' +
      '<div class="ptr-row">' + cells + '</div>' +
      '<div class="ptr-lab">3 个间接指针（一、二、三级各 1 个）</div>' +
      '<div class="ptr-row indirect">' +
        '<div class="ptr wide ' + (active === 'single' ? 'on' : '') + '"><span>一级</span></div>' +
        '<div class="ptr wide ' + (active === 'double' ? 'on' : '') + '"><span>二级</span></div>' +
        '<div class="ptr wide ' + (active === 'triple' ? 'on' : '') + '"><span>三级</span></div>' +
      '</div></div>';
  }

  function levelRow(key, active, showRead) {
    var r = R(key);
    var nodes = ['<div class="node inode-mini"><b>inode</b><span>' + r.label + '指针</span></div>'];
    for (var i = 0; i < r.depth; i++) {
      nodes.push('<div class="node idx"><b>索引块</b><span>' + P + ' 个块号</span></div>');
    }
    nodes.push('<div class="node data"><b>数据块</b><span>真正的内容</span></div>');
    var isActive = active === key || (key === 'direct' && active && active.charAt(0) === 'd');
    var dim = active === 'all' ? '' : (active && !isActive ? ' dim' : '');
    return '<div class="lvl ' + (isActive ? 'on' : '') + dim + '">' +
      '<div class="lvl-tag"><b>' + r.label + '</b><span>最多管 ' + F(r.count) + ' 块</span></div>' +
      '<div class="lvl-flow">' + nodes.join('<span class="ar">→</span>') + '</div>' +
      '<div class="read-badge ' + (showRead ? 'show' : '') + '">读 ' + r.readCost + ' 次盘</div>' +
      '</div>';
  }

  function sceneInode() {
    function view(active, showRead, extra) {
      return U.sceneHead('1.1 场景', 'inode 长什么样', '10 个直接指针 + 一级 / 二级 / 三级间接指针各 1 个') +
        inodeBox(active) +
        '<div class="levels">' +
        levelRow('direct', active, showRead) +
        levelRow('single', active, showRead) +
        levelRow('double', active, showRead) +
        levelRow('triple', active, showRead) +
        '</div>' + (extra || '');
    }
    return {
      id: '1.1',
      short: 'inode',
      title: 'inode 长什么样',
      steps: [
        {
          caption: 'inode 是文件在磁盘上的“户口本”：记着文件大小、权限，以及所有盘块号放在哪。',
          html: function () { return view('none', false, say('先看结构：左边一排是直接指针，下面三个是间接指针。')); }
        },
        {
          caption: '直接指针直接写数据块号：inode 在内存时，读 ' + RD.readCost + ' 次盘就能拿到数据。',
          html: function () {
            return view('d3', true, U.callout('info', '像目录里直接写页码', '想找第 3 块，inode 里就写着它的块号，不用再翻别的表。'));
          }
        },
        {
          caption: '一级间接：inode 先指向一个索引块，索引块里才写数据块号，多转一道。',
          html: function () {
            return view('single', true, U.callout('info', '像先翻到一页“小目录”', '索引块里装着 ' + P + ' 个块号，所以一级间接能管 ' + P + ' 个数据块。'));
          }
        },
        {
          caption: '二级间接：索引块再指向索引块，像“目录的目录”，能管 ' + P + ' × ' + P + ' 个数据块。',
          html: function () {
            return view('double', true, U.callout('info', '多一层目录', '代价是读盘多一次：顶层索引块 → 下层索引块 → 数据块。'));
          }
        },
        {
          caption: '三级间接：再套一层，“目录的目录的目录”，能管的块最多，读盘也最慢。',
          html: function () {
            return view('triple', true, U.callout('info', '三层目录', '每多一层间接，就多一次读索引块。'));
          }
        },
        {
          caption: '规律：层数越深，能管的块越多，读盘次数也越多。直接 ' + RD.readCost + ' 次、一级 ' + RS.readCost + ' 次、二级 ' + RB.readCost + ' 次、三级 ' + RT.readCost + ' 次。',
          html: function () {
            var rows = L.regions.filter(function (r) { return r.count > 0; }).map(function (r) {
              return '<tr><td>' + r.label + '</td><td class="num">' + F(r.count) + ' 块</td><td class="num">' + r.readCost + ' 次</td></tr>';
            }).join('');
            return view('all', true,
              '<table class="tbl"><thead><tr><th>方式</th><th>最多管多少数据块</th><th>读盘次数*</th></tr></thead><tbody>' + rows + '</tbody></table>' +
              '<div class="tbl-note">* inode 已在内存；读盘次数 = 读索引块 + 最后读数据块。</div>');
          }
        }
      ]
    };
  }

  /* ---------- 1.2 一个索引块装多少指针 ---------- */

  function cells128(filled) {
    var s = '<div class="cells-128">';
    for (var i = 0; i < P; i++) {
      s += '<span class="c4 ' + (filled ? 'fill' : '') + '" style="--i:' + i + '"></span>';
    }
    return s + '</div>';
  }

  function scenePtrCount() {
    return {
      id: '1.2',
      short: '128',
      title: '一个索引块能装多少个块号',
      steps: [
        {
          caption: '每个盘块 ' + I.cfg.blockSize + 'B，每个盘块号占 ' + I.cfg.ptrSize + 'B。',
          html: function () {
            return U.sceneHead('1.2 场景', '一个索引块装多少个块号？') +
              '<div class="size-compare">' +
                '<div class="size-block"><b>512 B</b><span>一个盘块</span></div>' +
                '<div class="size-ptr"><b>4 B</b><span>一个块号</span></div>' +
              '</div>' +
              say('索引块里不放文件内容，只放“块号”（也叫地址项）。一个块号占 4B。');
          }
        },
        {
          caption: '把 ' + I.cfg.blockSize + 'B 的盘块想成一排 ' + I.cfg.ptrSize + 'B 的小格子。',
          html: function () {
            return U.sceneHead('1.2 场景', '把盘块切成小格子') +
              cells128(false) +
              say('每个小格子正好放一个盘块号。数一数有多少格。');
          }
        },
        {
          caption: I.cfg.blockSize + ' ÷ ' + I.cfg.ptrSize + ' = ' + P + '：一个索引块正好装 ' + P + ' 个块号。这个 ' + P + ' 是后面所有计算的种子。',
          dur: 6000,
          html: function () {
            return U.sceneHead('1.2 场景', '答案：128 个') +
              U.formula(I.cfg.blockSize + ' ÷ ' + I.cfg.ptrSize + ' = <b>' + P + '</b>', 'big') +
              cells128(true) +
              U.callout('info', '记住这个数', '块大小换成 1KB 就是 1024 ÷ 4 = 256；地址项换成 8B，也要重算。');
          }
        },
        {
          caption: '注意：块大小或地址项大小一变，' + P + ' 就要重算，不能死记。',
          html: function () {
            return U.sceneHead('1.2 场景', '这个数不能死记') +
              U.formula('每块指针数 p = 块大小 ÷ 地址项大小') +
              '<table class="tbl"><thead><tr><th>块大小</th><th>地址项</th><th>p</th></tr></thead><tbody>' +
                '<tr><td>512 B</td><td>4 B</td><td class="num">128</td></tr>' +
                '<tr><td>1 KB</td><td>4 B</td><td class="num">256</td></tr>' +
                '<tr><td>1 KB</td><td>8 B</td><td class="num">128</td></tr>' +
              '</tbody></table>' +
              say('先算 p，再往下做，后面每一步都靠它。');
          }
        }
      ]
    };
  }

  /* ---------- 1.3 最大文件 ---------- */

  function capRow(key, shown) {
    var r = R(key);
    var idx = ['direct', 'single', 'double', 'triple'].indexOf(key);
    var max = RT.count || 1;
    var w = 16 + 84 * Math.log10(r.count + 1) / Math.log10(max + 1);
    return '<div class="cap-row ' + (shown ? 'show' : '') + '">' +
      '<div class="cap-name">' + r.label + '</div>' +
      '<div class="cap-track"><i style="width:' + w.toFixed(2) + '%"></i></div>' +
      '<div class="cap-count">' + F(r.count) + ' 块</div>' +
      '<div class="cap-cum">累计 <b>' + F(CUM[idx]) + '</b></div>' +
      '</div>';
  }

  function sceneMax() {
    function rows(n) {
      var keys = ['direct', 'single', 'double', 'triple'];
      return '<div class="cap-chart">' + keys.map(function (k, i) {
        return capRow(k, i < n);
      }).join('') + '</div><div class="chart-note">条长按对数压缩，只为看清差别；数字才是真实值。</div>';
    }
    return {
      id: '1.3',
      short: '最大文件',
      title: '第 (1) 问：最大文件多大',
      steps: [
        {
          caption: '先算每一级能管多少块。直接指针有 ' + RD.count + ' 个，所以直接区管 ' + RD.count + ' 个数据块。',
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '逐级累加能管的数据块', '每块 512B，每块 128 个块号') +
              U.formula('p = ' + I.cfg.blockSize + ' ÷ ' + I.cfg.ptrSize + ' = ' + P) +
              rows(1) + say('先从直接区开始：10 块。');
          }
        },
        {
          caption: '一级间接：1 个索引块有 ' + P + ' 个块号，能管 ' + RS.count + ' 个数据块；累计 ' + F(CUM[1]) + ' 块。',
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '一级间接：128 块') +
              rows(2) +
              U.formula(RD.count + ' + ' + RS.count + ' = <b>' + F(CUM[1]) + '</b>', 'big');
          }
        },
        {
          caption: '二级间接：' + P + ' × ' + P + ' = ' + F(RB.count) + ' 块；累计 ' + F(CUM[2]) + ' 块。',
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '二级间接：128² = 16384 块') +
              rows(3) +
              U.formula(F(CUM[1]) + ' + ' + F(RB.count) + ' = <b>' + F(CUM[2]) + '</b>', 'big');
          }
        },
        {
          caption: '三级间接：' + P + '³ = ' + F(RT.count) + ' 块；四段全部加起来是 ' + F(L.totalBlocks) + ' 个数据块。',
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '三级间接：128³ = 2097152 块') +
              rows(4) +
              U.formula(RD.count + ' + ' + RS.count + ' + ' + F(RB.count) + ' + ' + F(RT.count) + ' = <b>' + F(L.totalBlocks) + '</b>', 'big');
          }
        },
        {
          caption: '再乘每块 ' + I.cfg.blockSize + 'B：' + F(L.totalBlocks) + ' × ' + I.cfg.blockSize + ' = ' + F(L.maxBytes) + 'B，约 ' + U.fmt2(L.maxMB) + 'MB，也就是约 1GB。',
          dur: 6500,
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '乘上块大小') +
              rows(4) +
              '<div class="big-result"><span>最大文件</span><b>' + F(L.totalBlocks) + '</b><span>个数据块</span></div>' +
              U.formula(F(L.totalBlocks) + ' × ' + I.cfg.blockSize + ' B = <b>' + F(L.maxBytes) + ' B</b>', 'big') +
              U.formula('≈ <b>' + U.fmt2(L.maxMB) + ' MB</b> ≈ 1 GB', 'big');
          }
        },
        {
          caption: '数量级自检：' + P + '³ = 2' + U.sup(Math.round(3 * Math.log2(P))) + '，再乘 2' + U.sup(Math.round(Math.log2(I.cfg.blockSize))) + 'B，合起来是 2' + U.sup(Math.round(3 * Math.log2(P) + Math.log2(I.cfg.blockSize))) + 'B，刚好 1GB 左右，说明没算错量级。',
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '用 2 的幂快速自检') +
              U.formula(P + '³ = (2' + U.sup(Math.round(Math.log2(P))) + ')³ = 2' + U.sup(Math.round(3 * Math.log2(P)))) +
              U.formula('2' + U.sup(Math.round(3 * Math.log2(P))) + ' × 2' + U.sup(Math.round(Math.log2(I.cfg.blockSize))) + ' B = 2' + U.sup(Math.round(3 * Math.log2(P) + Math.log2(I.cfg.blockSize))) + ' B = 1 GiB') +
              say('算出 1000MB 上下就对了；如果得到 17GB，说明哪一步多乘了一个数量级。');
          }
        },
        {
          caption: '特别提醒：这道题试卷给的标准答案 17.135GB 是错的，按题面数据算就是约 ' + U.fmt2(L.maxMB) + 'MB。',
          html: function () {
            return U.sceneHead('1.3 · 第 (1) 问', '答案口径') +
              U.callout('bad', '试卷答案有误', '流传的 17.135GB 与题面数据（' + I.cfg.blockSize + 'B 块、' + I.cfg.ptrSize + 'B 块号、' + I.cfg.nDirect + '+' + I.cfg.nSingle + '+' + I.cfg.nDouble + '+' + I.cfg.nTriple + '）不符。按本页计算：<b>' + F(L.totalBlocks) + ' 块 × ' + I.cfg.blockSize + 'B ≈ ' + U.fmt2(L.maxMB) + 'MB</b>。') +
              U.callout('info', '考试怎么写', '把算式写全：10 + 128 + 128² + 128³，再乘 512B。老师看过程，数字对得上就行。');
          }
        }
      ]
    };
  }

  /* ---------- 1.4 两级索引小例 ---------- */

  function sceneTwoLevel() {
    var T = D.twoLevel;
    return {
      id: '1.4',
      short: '两级',
      title: '顺带：两级索引（25 卷三.12）',
      steps: [
        {
          caption: '换一道更简单的：块 ' + (T.blockSize / 1024) + 'KB，地址项 ' + T.ptrSize + 'B，做两级索引。',
          html: function () {
            return U.sceneHead('1.4 · 顺带一题', '块 1KB，地址项 4B，两级索引') +
              U.formula('p = ' + T.blockSize + ' ÷ ' + T.ptrSize + ' = <b>' + T.p + '</b>') +
              say('先算每块能装 256 个块号，这一步和上一题一样。');
          }
        },
        {
          caption: '两级索引：一级 ' + T.p + ' 个指针，每个指针再指向一个 ' + T.p + ' 项的索引块。',
          html: function () {
            return U.sceneHead('1.4 · 顺带一题', '两级各 256 项') +
              '<div class="two-level">' +
                '<div class="tl-box idx"><b>一级索引块</b><span>' + T.p + ' 项</span></div>' +
                '<div class="tl-fan">×' + T.p + '</div>' +
                '<div class="tl-box idx"><b>二级索引块</b><span>' + T.p + ' 项</span></div>' +
                '<div class="tl-fan">×' + T.p + '</div>' +
                '<div class="tl-box data"><b>数据块</b><span>1 KB</span></div>' +
              '</div>' +
              say('每个一级项管一个二级索引块，每个二级项管一个数据块。');
          }
        },
        {
          caption: '最大文件 = ' + T.p + ' × ' + T.p + ' × 1KB = ' + F(T.maxBytes / 1024) + 'KB = ' + T.maxMB + 'MB。',
          html: function () {
            return U.sceneHead('1.4 · 顺带一题', '乘起来') +
              U.formula(T.p + ' × ' + T.p + ' × 1 KB = <b>' + F(T.maxBytes / 1024) + ' KB</b>', 'big') +
              U.formula('= <b>' + T.maxMB + ' MB</b>', 'big') +
              say('两级索引的套路：项数相乘，再乘块大小。');
          }
        }
      ]
    };
  }

  /* ---------- 1.5 访问 80000 ---------- */

  function rangeAxis(showMarker) {
    var marker = ((I.blockIndex - RB.start + 0.5) / RB.count) * 70;
    return '<div class="range-axis-wrap">' +
      '<div class="range-axis">' +
        '<div class="ra-seg direct" style="width:8%"><b>0–' + (RD.end - 1) + '</b><span>直接 ' + RD.count + ' 块</span></div>' +
        '<div class="ra-seg single" style="width:22%"><b>' + RS.start + '–' + (RS.end - 1) + '</b><span>一级 ' + RS.count + ' 块</span></div>' +
        '<div class="ra-seg double" style="width:70%"><b>' + RB.start + '–' + (RB.end - 1) + '</b><span>二级 ' + F(RB.count) + ' 块</span></div>' +
        (showMarker ? '<div class="ra-marker" style="left:' + (30 + marker).toFixed(2) + '%"><span>' + I.blockIndex + '</span></div>' : '') +
      '</div>' +
      '<div class="axis-note">只示意位置关系，二级区宽度已压缩（真实有 16384 块）。</div>' +
      '</div>';
  }

  function pathDiagram(reads) {
    var nodes = [
      { key: 'inode', title: 'inode', sub: '已在内存 · 不读盘', badge: '0 次' },
      { key: 'l1', title: '一级索引块', sub: '二级间接的顶层', badge: '第 1 次读盘' },
      { key: 'l2', title: '二级索引块', sub: '顶层索引块的第 0 项', badge: '第 2 次读盘' },
      { key: 'data', title: '数据块 ' + I.blockIndex, sub: '第 18 项指向它', badge: '第 3 次读盘' }
    ];
    var order = ['inode', 'l1', 'l2', 'data'];
    var html = '<div class="path">';
    nodes.forEach(function (n) {
      var lit = n.key === 'inode' || order.indexOf(n.key) <= reads;
      html += '<div class="path-node ' + (lit ? 'lit' : '') + ' ' + n.key + '">' +
        '<div class="pn-main"><b>' + n.title + '</b><span>' + n.sub + '</span></div>' +
        '<div class="pn-badge">' + n.badge + '</div></div>';
      if (n.key !== 'data') {
        var lab = n.key === 'inode' ? '二级指针' : (n.key === 'l1' ? '第 ' + I.access.entries[0] + ' 项' : '第 ' + I.access.entries[1] + ' 项');
        html += '<div class="path-arrow"><span>' + lab + '</span>↓</div>';
      }
    });
    html += '</div>';
    return html + '<div class="read-counter"><span>读盘次数</span><b>' + reads + '</b><span>/ 3</span></div>';
  }

  function sceneOffset() {
    var acc = I.access;
    var div = I.cfg.offset + ' ÷ ' + I.cfg.blockSize;
    return {
      id: '1.5',
      short: '80000',
      title: '第 (2) 问：偏移 80000 读几次盘',
      steps: [
        {
          caption: '先把字节偏移换算成“第几个数据块、块内偏移多少”。',
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '偏移 80000 落在哪一块？', 'inode 已在内存') +
              U.formula(div + ' = ?', 'big') +
              say('字节偏移就是从文件开头数到第几个字节（从 0 数）。用除法：商是块号，余数是块内偏移。');
          }
        },
        {
          caption: I.cfg.offset + ' ÷ ' + I.cfg.blockSize + ' = ' + I.blockIndex + ' 余 ' + I.blockOffset + '：第 ' + I.blockIndex + ' 号数据块（从 0 数），块内偏移 ' + I.blockOffset + '。',
          dur: 6200,
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '第 1 步：算出块号') +
              U.formula(I.cfg.offset + ' ÷ ' + I.cfg.blockSize + ' = <b>' + I.blockIndex + '</b> 余 <b>' + I.blockOffset + '</b>', 'big') +
              '<div class="result-grid">' +
                '<div class="res"><span>数据块号</span><b>' + I.blockIndex + '</b></div>' +
                '<div class="res"><span>块内偏移</span><b>' + I.blockOffset + '</b><small>字节</small></div>' +
                '<div class="res"><span>从 0 数</span><b>第 ' + (I.blockIndex + 1) + '</b><small>块</small></div>' +
              '</div>' +
              say('注意：块号从 0 开始，156 号是第 157 块。');
          }
        },
        {
          caption: '把它放到覆盖范围轴上：直接区 0–' + (RD.end - 1) + '，一级 ' + RS.start + '–' + (RS.end - 1) + '，二级 ' + RB.start + '–' + (RB.end - 1) + '。' + I.blockIndex + ' 落在二级区。',
          dur: 6500,
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '第 2 步：判断落在哪个区') +
              rangeAxis(true) +
              U.callout('info', '为什么看区间？', '不同区的读盘次数不同：直接 1 次，一级 2 次，二级 3 次。先确定区，再算次数。') +
              say('156 比 137 大、比 16522 小 → 二级间接区。');
          }
        },
        {
          caption: '二级区内再编号：' + I.blockIndex + ' − ' + RB.start + ' = ' + acc.rel + '，说明它是二级区的第 ' + acc.rel + ' 个数据块（从 0 数）。',
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '第 3 步：二级区内部编号') +
              U.formula(I.blockIndex + ' − ' + RB.start + ' = <b>' + acc.rel + '</b>', 'big') +
              rangeAxis(true) +
              say('减去二级区的起点，得到区内的相对编号 18。');
          }
        },
        {
          caption: acc.rel + ' ÷ ' + P + ' = ' + acc.entries[0] + ' 余 ' + acc.entries[1] + '：走顶层索引块的第 ' + acc.entries[0] + ' 项，再走下一层索引块的第 ' + acc.entries[1] + ' 项。',
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '第 4 步：拆成两层索引项') +
              U.formula(acc.rel + ' ÷ ' + P + ' = <b>' + acc.entries[0] + '</b> 余 <b>' + acc.entries[1] + '</b>', 'big') +
              U.card('索引路径', pathDiagram(0)) +
              say('商 0 表示顶层索引块的第 0 项；余数 18 表示下一层索引块的第 18 项。');
          }
        },
        {
          caption: 'inode 已经在内存，不读盘。第 1 次读盘：读一级索引块（二级间接的顶层）。',
          dur: 6000,
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '开始读盘') +
              U.card('索引路径', pathDiagram(1)) +
              say('别把 inode 算进去：题目说它在内存，访问它不产生磁盘 I/O。');
          }
        },
        {
          caption: '第 2 次读盘：读二级索引块（下一层）。',
          dur: 5200,
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '第 2 次读盘') +
              U.card('索引路径', pathDiagram(2)) +
              say('到这里才拿到数据块的块号 ' + I.blockIndex + '。');
          }
        },
        {
          caption: '第 ' + acc.reads + ' 次读盘：读数据块 ' + I.blockIndex + '，取出块内偏移 ' + I.blockOffset + ' 处的那个字节。答案：' + acc.reads + ' 次。',
          dur: 6200,
          html: function () {
            return U.sceneHead('1.5 · 第 (2) 问', '第 3 次读盘，完成') +
              U.card('索引路径', pathDiagram(3)) +
              '<div class="big-result"><span>答案</span><b>3</b><span>次访问磁盘</span></div>' +
              say('两次索引块 + 一次数据块，共 3 次。');
          }
        },
        {
          caption: '记住规律：inode 在内存时，直接 ' + RD.readCost + ' 次、一级 ' + RS.readCost + ' 次、二级 ' + RB.readCost + ' 次、三级 ' + RT.readCost + ' 次。',
          html: function () {
            var rows = L.regions.filter(function (r) { return r.count > 0; }).map(function (r) {
              return '<tr><td>' + r.label + '</td><td class="num">' + r.readCost + ' 次</td><td>' +
                (r.depth === 0 ? 'inode → 数据块' :
                 r.depth === 1 ? 'inode → 索引块 → 数据块' :
                 r.depth === 2 ? 'inode → 顶层索引 → 下层索引 → 数据块' :
                 'inode → 三层索引 → 数据块') + '</td></tr>';
            }).join('');
            return U.sceneHead('1.5 · 归纳', '读盘次数速查') +
              '<table class="tbl"><thead><tr><th>区域</th><th>读盘次数</th><th>路径</th></tr></thead><tbody>' + rows + '</tbody></table>' +
              U.callout('info', '前提', '这个表的前提是 <b>inode 已在内存</b>。如果 inode 不在内存，还要先读一次 inode。');
          }
        }
      ]
    };
  }

  /* ---------- 1.6 1MB 文件占用 ---------- */

  function sceneUsage() {
    var u = UZ;
    function dataSummary() {
      return '<div class="region-cards">' +
        '<div class="rc data"><b>' + F(u.direct) + '</b><span>直接区</span></div>' +
        '<div class="rc data"><b>' + F(u.single) + '</b><span>一级区</span></div>' +
        '<div class="rc data"><b>' + F(u.double) + '</b><span>二级区</span></div>' +
        '</div>';
    }
    function idxSummary() {
      return '<div class="idx-counts">' +
        '<div class="ic"><b>' + u.singleIndexBlocks + '</b><span>一级间接<br>索引块</span></div>' +
        '<div class="ic"><b>' + u.doubleTopBlocks + '</b><span>二级间接<br>顶层索引块</span></div>' +
        '<div class="ic"><b>' + u.doubleL2Blocks + '</b><span>二级间接<br>下层索引块</span></div>' +
        '</div>';
    }
    return {
      id: '1.6',
      short: '1MB占用',
      title: '第 (3) 问：1MB 文件占多少块',
      steps: [
        {
          caption: '1MB 先换成数据块：1MB = ' + F(u.byteSize) + 'B，除以 ' + I.cfg.blockSize + 'B，等于 ' + F(u.dataBlocks) + ' 个数据块。',
          html: function () {
            return U.sceneHead('1.6 · 第 (3) 问', '1MB 文件有多少数据块？') +
              U.formula('1 MB = ' + F(u.byteSize) + ' B') +
              U.formula(F(u.byteSize) + ' ÷ ' + I.cfg.blockSize + ' = <b>' + F(u.dataBlocks) + '</b> 个数据块', 'big') +
              say('先只数数据块，索引块一会儿再加。');
          }
        },
        {
          caption: '按顺序填：前 ' + u.direct + ' 块走直接，接着 ' + u.single + ' 块走一级，剩下 ' + F(u.dataBlocks) + ' − ' + (u.direct + u.single) + ' = ' + F(u.double) + ' 块走二级。',
          html: function () {
            return U.sceneHead('1.6 · 第 (3) 问', '2048 块怎么分配') +
              dataSummary() +
              U.formula(F(u.dataBlocks) + ' − (' + u.direct + ' + ' + u.single + ') = <b>' + F(u.double) + '</b> 块走二级', 'big') +
              say('直接区和一级区都装满了，剩下的全部落到二级区。');
          }
        },
        {
          caption: '二级区每 ' + P + ' 个数据块要一个下层索引块：⌈' + F(u.double) + ' ÷ ' + P + '⌉ = ' + u.doubleL2Blocks + ' 个；前 ' + u.doubleFullL2 + ' 个装满，最后一个装 ' + u.doubleLastEntries + ' 项。',
          dur: 7000,
          html: function () {
            return U.sceneHead('1.6 · 第 (3) 问', '二级区要几个索引块') +
              U.formula('⌈' + F(u.double) + ' ÷ ' + P + '⌉ = <b>' + u.doubleL2Blocks + '</b> 个', 'big') +
              U.formula(u.doubleFullL2 + ' 个装满 × ' + P + ' = ' + F(u.doubleFullL2 * P) + ' 项，最后 ' + (u.doubleL2Blocks - u.doubleFullL2) + ' 个装 <b>' + u.doubleLastEntries + '</b> 项', '') +
              '<div class="idx-grid">' +
                Array.from({ length: u.doubleL2Blocks }, function (_, i) {
                  var full = i < u.doubleFullL2;
                  return '<div class="idx-square ' + (full ? 'full' : 'part') + '"><b>' + (full ? P : u.doubleLastEntries) + '</b><span>' + (full ? '满' : '末') + '</span></div>';
                }).join('') +
              '</div>' +
              say('15 个下层索引块：14 个满的，1 个只装 118 项。');
          }
        },
        {
          caption: '别漏掉另外两个：' + u.singleIndexBlocks + ' 个一级间接索引块，' + u.doubleTopBlocks + ' 个二级间接的顶层索引块。',
          html: function () {
            return U.sceneHead('1.6 · 第 (3) 问', '加上另外两个索引块') +
              idxSummary() +
              U.formula(u.singleIndexBlocks + ' + ' + u.doubleTopBlocks + ' + ' + u.doubleL2Blocks + ' = <b>' + u.indexBlocks + '</b> 个索引块', 'big') +
              say('一级间接索引块管那 128 个数据块；顶层索引块管下面 15 个下层索引块。');
          }
        },
        {
          caption: '总占用 = ' + F(u.dataBlocks) + ' 个数据块 + ' + u.indexBlocks + ' 个索引块 = ' + F(u.totalBlocks) + ' 块。',
          dur: 6200,
          html: function () {
            return U.sceneHead('1.6 · 第 (3) 问', '合起来') +
              U.formula(F(u.dataBlocks) + ' 个数据块 + ' + u.indexBlocks + ' 个索引块 = <b>' + F(u.totalBlocks) + '</b> 块', 'big') +
              '<div class="big-result"><span>答案</span><b>' + F(u.totalBlocks) + '</b><span>个磁盘块</span></div>' +
              U.callout('info', '和最大文件的区别', '第 (1) 问的“最大文件”只算能寻址的数据块；这里问“实际占用”，才要把索引块加进去。');
          }
        }
      ]
    };
  }

  /* ---------- 1.7 模板 ---------- */

  function tplItem(n, title, body) {
    return '<div class="tpl-item"><div class="tpl-num">' + n + '</div><div><b>' + title + '</b><p>' + body + '</p></div></div>';
  }

  function sceneTemplate() {
    return {
      id: '1.7',
      short: '模板',
      title: '解题模板',
      steps: [
        {
          caption: '模板第 1 段：先算 p，再逐级算容量，最后乘块大小。',
          html: function () {
            return U.sceneHead('1.7 · 解题模板', '最大文件：三步') +
              tplItem('1', '先算每块指针数', 'p = 块大小 ÷ 地址项大小。本卷：512 ÷ 4 = ' + P + '。') +
              tplItem('2', '逐级累加块数', '直接 ' + RD.count + ' + 一级 ' + RS.count + ' + 二级 ' + F(RB.count) + ' + 三级 ' + F(RT.count) + ' = ' + F(L.totalBlocks) + ' 块。') +
              tplItem('3', '乘块大小', F(L.totalBlocks) + ' × 512B = ' + F(L.maxBytes) + 'B ≈ ' + U.fmt2(L.maxMB) + 'MB。') +
              say('单位要跟着算式走：块数 × 每块字节数 = 字节数。');
          }
        },
        {
          caption: '模板第 2 段：偏移先除块大小，判断区域，再按“层数 + 1”算读盘。',
          html: function () {
            return U.sceneHead('1.7 · 解题模板', '访问偏移：四步') +
              tplItem('4', '偏移 ÷ 块大小', '商 = 块号（从 0 数），余数 = 块内偏移。') +
              tplItem('5', '判断落在哪个区', '拿块号和四个区间的起点、终点比。') +
              tplItem('6', '算读盘次数', 'inode 在内存：直接 1、一级 2、二级 3、三级 4。') +
              tplItem('7', '实际占用', '数据块 + 索引块。一级 1 个；二级 1 + ⌈n/p⌉ 个；三级再多一层。') +
              U.callout('warn', '最容易漏', '访问次数不要忘了最后读数据块那一次；占用块数不要忘了索引块。');
          }
        }
      ]
    };
  }

  /* ---------- 1.8 常见错误 ---------- */

  function errRow(wrong, right) {
    return '<div class="err-row"><span class="err-badge">错</span><div><b>' + wrong + '</b><p>' + right + '</p></div></div>';
  }

  function sceneErrors() {
    return {
      id: '1.8',
      short: '易错',
      title: '常见错误',
      steps: [
        {
          caption: '第一类错误：忘了乘块大小，或者换了块大小不重算 p。',
          html: function () {
            return U.sceneHead('1.8 · 常见错误', '算容量时的坑') +
              errRow('只算出“多少个块”就交卷', '题目问“多大”时，要乘块大小换成字节：块数 × 512B。') +
              errRow('块大小换成 1KB，还继续用 128', 'p 必须重算：1024 ÷ 4 = 256。') +
              errRow('B、KB、MB 混着用', '1KB = 1024B，1MB = 1024KB；最后统一单位再报答案。');
          }
        },
        {
          caption: '第二类错误：访问次数和占用块数漏项。',
          html: function () {
            return U.sceneHead('1.8 · 常见错误', '访问与占用的坑') +
              errRow('访问次数只算索引块，漏了数据块', '直接 1 次、一级 2 次、二级 3 次、三级 4 次，最后那一次是读数据。') +
              errRow('算 1MB 占用时只写 ' + F(UZ.dataBlocks), '索引块也要占盘：' + F(UZ.dataBlocks) + ' + ' + UZ.indexBlocks + ' = ' + F(UZ.totalBlocks) + '。') +
              errRow('把“最大文件”和“实际占用”混了', '最大文件只算数据块容量；实际占用才加索引块。') +
              errRow('块号从 1 开始数', '块号、页号、逻辑块号都从 0 开始。');
          }
        }
      ]
    };
  }

  window.MODULES = window.MODULES || {};
  window.MODULES.m1 = {
    title: '文件索引（inode）',
    sub: '一道 512B 块、4B 块号的题，串起直接 / 一级 / 二级 / 三级索引',
    scenes: [sceneDisk(), sceneInode(), scenePtrCount(), sceneMax(), sceneTwoLevel(), sceneOffset(), sceneUsage(), sceneTemplate(), sceneErrors()]
  };
})();

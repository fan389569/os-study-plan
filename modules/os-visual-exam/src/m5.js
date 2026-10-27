/* 模块⑤ 复盘与自测 */
(function () {
  'use strict';
  var U = window.UI;
  var D = window.DATA;
  var F = U.fmt;
  var T = D.tests;

  function sol(n, body) {
    return '<div class="sol-step"><span class="ss-n">' + n + '</span><div class="ss-body">' + body + '</div></div>';
  }

  function qCard(id, type, title, question, answer) {
    return '<article class="q-card" data-q="' + id + '">' +
      '<div class="q-head"><span class="q-tag">' + id + '</span><span class="q-type">' + type + '</span></div>' +
      '<h3 class="q-title">' + title + '</h3>' +
      '<div class="q-body">' + question + '</div>' +
      '<button class="reveal" data-reveal="' + id + '" aria-expanded="false" aria-controls="ans-' + id + '">看答案</button>' +
      '<div class="q-ans" id="ans-' + id + '" hidden>' + answer + '</div>' +
      '</article>';
  }

  function formulaSheet() {
    var inode = D.inode;
    var A = D.pagingA;
    var B = D.pagingB;
    return '<section class="formula-sheet" id="formulaSheet">' +
      '<div class="fs-head"><div><h3>一页纸公式卡</h3><p>4 个考点 · 考前 10 分钟看这一页</p></div>' +
        '<span class="fs-badge">可截图 / 可打印</span></div>' +
      '<div class="fs-grid">' +

      '<div class="fs-block fs-m1">' +
        '<div class="fs-title"><span>①</span>文件索引（inode）</div>' +
        '<div class="fs-line"><b>p</b> = 块大小 ÷ 地址项大小</div>' +
        '<div class="fs-line">容量 = 直接 n + 一级 p + 二级 p² + 三级 p³</div>' +
        '<div class="fs-line">最大文件 = 总块数 × 块大小</div>' +
        '<div class="fs-line">块号 = 偏移 ÷ 块大小；余数 = 块内偏移</div>' +
        '<div class="fs-line">读盘（inode 在内存）：直接 1 / 一级 2 / 二级 3 / 三级 4</div>' +
        '<div class="fs-line">实际占用 = 数据块 + 索引块（别漏）</div>' +
        '<div class="fs-ex">本卷：p = ' + inode.layout.p + '；最大 ' + F(inode.layout.totalBlocks) + ' 块 ≈ ' +
          U.fmt2(inode.layout.maxMB) + 'MB；偏移 80000 → 块 ' + inode.blockIndex + '，读 ' + inode.access.reads +
          ' 次；1MB → ' + F(inode.usage.totalBlocks) + ' 块。</div>' +
      '</div>' +

      '<div class="fs-block fs-m2">' +
        '<div class="fs-title"><span>②</span>分页地址变换</div>' +
        '<div class="fs-line">页内位数 = log₂(页大小)；页号位数 = 总位数 − 页内位数</div>' +
        '<div class="fs-line">页号 = 地址 ÷ 页大小；页内偏移 = 余数</div>' +
        '<div class="fs-line">物理地址 = 块号 × 页大小 + 页内偏移</div>' +
        '<div class="fs-line">十六进制：展开成二进制，按 4 位一组切</div>' +
        '<div class="fs-line">页号 ≥ 页表长度 → 越界中断</div>' +
        '<div class="fs-ex">本卷：2800 → 页 ' + A.page + '，偏移 ' + A.offset + ' → 物理地址 ' + F(A.pa) + ' = ' + A.paHex +
          'H；0CA8H → ' + B.paHex + 'H。</div>' +
        '<div class="fs-warn">易错：页内偏移变换前后必须不变。</div>' +
      '</div>' +

      '<div class="fs-block fs-m3">' +
        '<div class="fs-title"><span>③</span>首次适应</div>' +
        '<div class="fs-line">空闲链按起始地址从小到大排</div>' +
        '<div class="fs-line">申请：从链首扫，第一个 ≥ 申请量的块就用</div>' +
        '<div class="fs-line">切分：分配 [start, start+size)，剩余 [start+size, end)</div>' +
        '<div class="fs-line">释放：按地址插回链，检查左右邻居，相邻就合并</div>' +
        '<div class="fs-line">利用率 = 已分配总量 ÷ 总内存</div>' +
        '<div class="fs-ex">本卷：最终空闲 [70,160) 90KB、[390,512) 122KB；利用率 ' +
          F(D.fit.allocatedKB) + ' ÷ ' + D.fit.memKB + ' ≈ ' + U.fmt1(D.fit.utilization * 100) + '%。</div>' +
        '<div class="fs-warn">易错：释放忘合并；分配忘改剩余块起点。</div>' +
      '</div>' +

      '<div class="fs-block fs-m4">' +
        '<div class="fs-title"><span>④</span>快表 TLB</div>' +
        '<div class="fs-line">命中 = t + m = ' + D.tlb.hitTime + 'ns</div>' +
        '<div class="fs-line">未命中 = t + 2m = ' + D.tlb.missTime + 'ns</div>' +
        '<div class="fs-line">不设快表 = 2m = ' + D.tlb.noTlb + 'ns</div>' +
        '<div class="fs-line"><b>EAT</b> = h(t+m) + (1−h)(t+2m)</div>' +
        '<div class="fs-line">试卷写法：m + t·h + (m+t)(1−h)，等价</div>' +
        '<div class="fs-ex">本卷：h = ' + D.tlb.hit + '，t = ' + D.tlb.tlbNs + 'ns，m = ' + D.tlb.memNs +
          'ns → EAT = ' + U.fmt1(D.tlb.eat) + 'ns。</div>' +
        '<div class="fs-warn">易错：未命中漏掉 t 或最后一次 m；权重乘反。</div>' +
      '</div>' +

      '</div>' +
      '<div class="fs-foot">打印时只会保留这一页公式卡。自测题在下方，答案默认收起。</div>' +
      '</section>';
  }

  function tests() {
    var A1 = T.A1, A2 = T.A2, B1 = T.B1, B2 = T.B2, C1 = T.C1, D1 = T.D1;

    var a1Range =
      '<div class="mini-axis">' +
        '<div class="ma direct" style="width:8%">0–9</div>' +
        '<div class="ma single" style="width:24%">10–' + (A1.access.region.start - 1) + '</div>' +
        '<div class="ma double" style="width:68%">' + A1.access.region.start + '–' + (A1.layout.totalBlocks - 1) + '</div>' +
        '<div class="ma-mark" style="left:' + (8 + 24 + 68 * ((A1.byteBlock - A1.access.region.start + 0.5) / A1.access.region.count)).toFixed(2) + '%">' +
          '<span>' + A1.byteBlock + '</span></div>' +
      '</div>' +
      '<div class="mini-axis-note">示意：292 刚进二级区，离起点 26 块。</div>';

    var a1Ans =
      sol(1, '<b>p</b> = ' + A1.cfg.blockSize + ' ÷ ' + A1.cfg.ptrSize + ' = <b>' + A1.layout.p + '</b> 项/块') +
      sol(2, '最大文件 = ' + A1.cfg.nDirect + ' + ' + A1.layout.p + ' + ' + A1.layout.p + '² = <b>' +
        F(A1.layout.totalBlocks) + '</b> 块<br>= ' + F(A1.layout.maxBytes / 1024) + ' KB ≈ <b>' +
        U.fmt2(A1.layout.maxMB) + ' MB</b>') +
      sol(3, '300000 ÷ ' + A1.cfg.blockSize + ' = <b>' + A1.byteBlock + '</b> 余 <b>' + A1.blockOffset + '</b>') +
      sol(4, '直接 0–9，一级 10–' + (A1.access.region.start - 1) + '，二级从 ' + A1.access.region.start +
        ' 起；' + A1.byteBlock + ' 在二级区 → 读 <b>' + A1.access.reads + ' 次</b>盘') +
      '<div class="final-answer"><span>答案</span>(1) ' + F(A1.layout.maxBytes / 1024) + ' KB（≈ ' +
        U.fmt2(A1.layout.maxMB) + ' MB）；(2) ' + A1.access.reads + ' 次</div>' + a1Range;

    var a2Ans =
      sol(1, '<b>p</b> = ' + A2.cfg.blockSize + ' ÷ ' + A2.cfg.ptrSize + ' = <b>' + A2.layout.p + '</b> 项/块') +
      sol(2, '最大 = ' + A2.cfg.nDirect + ' + 2 × ' + A2.layout.p + ' + ' + A2.layout.p + '²<br>= ' +
        A2.cfg.nDirect + ' + ' + (2 * A2.layout.p) + ' + ' + F(A2.layout.p * A2.layout.p) + ' = <b>' +
        F(A2.layout.totalBlocks) + '</b> 块') +
      sol(3, '每块 1KB → 最大文件 = <b>' + F(A2.layout.maxBytes / 1024) + ' KB</b>') +
      '<div class="final-answer"><span>答案</span>' + F(A2.layout.totalBlocks) + ' KB（' + F(A2.layout.totalBlocks) + ' 个 1KB 块）</div>';

    var b1Ans =
      sol(1, '3000 ÷ ' + B1.pageSize + ' = <b>' + B1.page + '</b> 余 <b>' + B1.offset + '</b>') +
      sol(2, '页 ' + B1.page + ' → 块 ' + B1.frame + '（查页表）') +
      sol(3, '物理地址 = ' + B1.frame + ' × ' + B1.pageSize + ' + ' + B1.offset + ' = <b>' + B1.pa + '</b>') +
      '<div class="final-answer"><span>答案</span>' + B1.pa + '</div>';

    var b2Ans =
      sol(1, '4KB = 2¹² → 页内偏移 12 位 = 十六进制低 3 位。<br>2B7CH 拆成：页号 <b>2</b>，偏移 <b>' + B2.offsetHex + 'H</b>') +
      sol(2, '页 2 → 块 9（十六进制 <b>' + B2.frameHex + '</b>）') +
      sol(3, '块号替换页号，偏移不动：<b>' + B2.frameHex + '</b> + <b>' + B2.offsetHex + '</b> = <b>' + B2.paHex + 'H</b>') +
      '<div class="hex-split"><span class="hxs">2</span><span class="hxs off">B7C</span>' +
        '<span class="hxs-ar">→</span><span class="hxs frame">9</span><span class="hxs off">B7C</span></div>' +
      '<div class="final-answer"><span>答案</span>' + B2.paHex + 'H</div>';

    var c1Rows = C1.snapshots.slice(1).map(function (s) {
      var op = s.op.type === 'alloc' ? s.op.name + ' 申请 ' + s.op.size : s.op.name + ' 释放';
      var free = s.free.map(function (f) {
        return '[' + f.start + ',' + (f.start + f.size) + ') ' + f.size + 'K';
      }).join('、');
      return '<tr><td>' + op + '</td><td>' + free + '</td></tr>';
    }).join('');

    var c1Ans =
      '<div class="sol-table-wrap"><table class="tbl compact"><thead><tr><th>操作</th><th>操作后的空闲分区</th></tr></thead><tbody>' +
        c1Rows + '</tbody></table></div>' +
      '<div class="mini-mem">' + U.memStrip(C1.memKB, C1.finalFree, C1.finalAlloc) + '</div>' +
      sol(1, '最终空闲：' + C1.finalFree.map(function (f) {
        return '[' + f.start + ',' + (f.start + f.size) + ') <b>' + f.size + 'KB</b>';
      }).join('、')) +
      sol(2, '已分配 = ' + C1.finalAlloc.map(function (a) { return a.size; }).join(' + ') + ' = <b>' +
        C1.allocatedKB + ' KB</b>') +
      sol(3, '利用率 = ' + C1.allocatedKB + ' ÷ ' + C1.memKB + ' = <b>' +
        U.fmt1(C1.utilization * 100) + '%</b>') +
      '<div class="final-answer"><span>答案</span>空闲 [0,90) 90KB、[130,140) 10KB、[360,400) 40KB；利用率 ' +
        U.fmt1(C1.utilization * 100) + '%</div>';

    var d1Ans =
      sol(1, '命中：' + D1.memNs + ' + ' + D1.tlbNs + ' = <b>' + D1.hitTime + 'ns</b>；未命中：' +
        D1.tlbNs + ' + 2×' + D1.memNs + ' = <b>' + D1.missTime + 'ns</b>') +
      sol(2, 'EAT = ' + D1.hit + ' × ' + D1.hitTime + ' + ' + U.fmt1(1 - D1.hit) + ' × ' + D1.missTime +
        ' = <b>' + U.fmt1(D1.eat) + 'ns</b>') +
      sol(3, '不设快表 = 2 × ' + D1.memNs + ' = <b>' + D1.noTlb + 'ns</b>') +
      '<div class="final-answer"><span>答案</span>有效访问时间 ' + U.fmt1(D1.eat) + 'ns；不设快表 ' + D1.noTlb + 'ns</div>';

    return '<section class="selftest">' +
      '<div class="st-head"><div><h3>自测 · 先自己做，再点看答案</h3>' +
        '<p>6 道题覆盖 4 个考点。答案默认收起，先拿纸算一遍。</p></div>' +
        '<span class="st-progress">已看 <b>0</b> / 6</span></div>' +
      '<div class="q-grid">' +

      qCard('A1', '文件索引', '块 1KB、地址项 4B，10 直接 + 1 一级 + 1 二级',
        '<p>(1) 最大文件多大？</p><p>(2) 访问偏移 300000 字节，inode 在内存，要读几次盘？</p>', a1Ans) +

      qCard('A2', '文件索引', '5 直接 + 2 一级 + 1 二级，地址项 8B',
        '<p>块大小 1KB，每个地址项 8B。最大文件多大？</p>', a2Ans) +

      qCard('B1', '地址变换', '页大小 1KB，逻辑地址 3000',
        '<p>页表：页 0 → 块 5，页 1 → 块 2，页 2 → 块 7。</p><p>逻辑地址 3000（十进制）的物理地址是多少？</p>', b1Ans) +

      qCard('B2', '地址变换', '页大小 4KB，逻辑地址 2B7CH',
        '<p>页 2 → 块 9。物理地址用十六进制表示是多少？</p>', b2Ans) +

      qCard('C1', '首次适应', '400KB 内存，7 步申请与释放',
        '<p>依次：A 申请 90，B 申请 50，C 申请 120，B 释放，D 申请 40，A 释放，E 申请 100。</p>' +
        '<p>画出最终空闲分区，并求内存利用率。</p>', c1Ans) +

      qCard('D1', '快表 TLB', '内存 100ns，TLB 10ns，命中率 90%',
        '<p>有效访问时间是多少？不设快表是多少？</p>', d1Ans) +

      '</div></section>';
  }

  function renderReview(root) {
    root.innerHTML =
      '<div class="review-head"><div><span class="module-badge">模块 5</span>' +
        '<h2>复盘与自测</h2><p>一页纸公式卡 + 6 道自测。先算，再对答案。</p></div>' +
        '<button class="print-btn" id="printSheet" type="button">打印 / 存 PDF</button></div>' +
      formulaSheet() + tests();

    var revealBtns = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
    revealBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.q-card');
        var ans = card.querySelector('.q-ans');
        var open = ans.hasAttribute('hidden');
        if (open) {
          ans.removeAttribute('hidden');
          btn.textContent = '收起答案';
          btn.classList.add('open');
        } else {
          ans.setAttribute('hidden', '');
          btn.textContent = '看答案';
          btn.classList.remove('open');
        }
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        updateProgress(root);
      });
    });

    var pb = root.querySelector('#printSheet');
    if (pb) {
      pb.addEventListener('click', function () {
        document.body.classList.add('print-sheet');
        window.print();
      });
    }
    window.addEventListener('afterprint', function () {
      document.body.classList.remove('print-sheet');
    });
  }

  function updateProgress(root) {
    var total = root.querySelectorAll('.q-card').length;
    var open = 0;
    Array.prototype.forEach.call(root.querySelectorAll('.q-ans'), function (a) {
      if (!a.hasAttribute('hidden')) open++;
    });
    var el = root.querySelector('.st-progress b');
    if (el) el.textContent = open;
    var box = root.querySelector('.st-progress');
    if (box && open === total) box.classList.add('done');
  }

  window.renderReview = renderReview;
})();

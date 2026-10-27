/* 操作系统四个考点 · 统一计算源
 * 页面上所有题目数字都由这里计算，不在 HTML 里手写答案。
 * 浏览器中挂到 window.OS；Node 中挂到 globalThis.OS。
 */
(function (global) {
  'use strict';

  var RAW = {
    inode: {
      blockSize: 512,
      ptrSize: 4,
      nDirect: 10,
      nSingle: 1,
      nDouble: 1,
      nTriple: 1,
      offset: 80000,
      fileBytes: 1024 * 1024
    },
    linked: {
      blockSize: 1024,
      blocks: [10, 61, 32, 75, 87, 98, 46, 37, 33, 11],
      offset: 7654
    },
    twoLevel: {
      blockSize: 1024,
      ptrSize: 4,
      levels: 2
    },
    pagingA: {
      addrBits: 18,
      pageBits: 7,
      offsetBits: 11,
      pageTable: { 0: 2, 1: 3, 2: 7 },
      va: 2800
    },
    pagingB: {
      pages: 32,
      pageSize: 2048,
      pageTable: { 0: 9, 1: 14, 2: 7, 3: 13, 4: 3, 5: 21 },
      vaHex: '0CA8'
    },
    seg: {
      addrBits: 24,
      segBits: 8
    },
    fit: {
      memKB: 512,
      ops: [
        { type: 'alloc', name: '作业1', size: 100 },
        { type: 'alloc', name: '作业2', size: 60 },
        { type: 'alloc', name: '作业3', size: 150 },
        { type: 'free', name: '作业2' },
        { type: 'alloc', name: '作业4', size: 80 },
        { type: 'free', name: '作业1' },
        { type: 'alloc', name: '作业5', size: 70 }
      ]
    },
    fitC: {
      memKB: 400,
      ops: [
        { type: 'alloc', name: 'A', size: 90 },
        { type: 'alloc', name: 'B', size: 50 },
        { type: 'alloc', name: 'C', size: 120 },
        { type: 'free', name: 'B' },
        { type: 'alloc', name: 'D', size: 40 },
        { type: 'free', name: 'A' },
        { type: 'alloc', name: 'E', size: 100 }
      ]
    },
    fitCmp: {
      free: [
        { start: 0, size: 100 },
        { start: 100, size: 200 },
        { start: 300, size: 80 }
      ],
      request: 70
    },
    tlb: {
      memNs: 50,
      tlbNs: 5,
      hit: 0.8
    },
    tests: {
      A1: {
        blockSize: 1024,
        ptrSize: 4,
        nDirect: 10,
        nSingle: 1,
        nDouble: 1,
        nTriple: 0,
        offset: 300000
      },
      A2: {
        blockSize: 1024,
        ptrSize: 8,
        nDirect: 5,
        nSingle: 2,
        nDouble: 1,
        nTriple: 0
      },
      B1: {
        pageSize: 1024,
        pageTable: { 0: 5, 1: 2, 2: 7 },
        va: 3000
      },
      B2: {
        pageSize: 4096,
        pageTable: { 2: 9 },
        va: 0x2b7c
      },
      C1: {
        memKB: 400,
        ops: [
          { type: 'alloc', name: 'A', size: 90 },
          { type: 'alloc', name: 'B', size: 50 },
          { type: 'alloc', name: 'C', size: 120 },
          { type: 'free', name: 'B' },
          { type: 'alloc', name: 'D', size: 40 },
          { type: 'free', name: 'A' },
          { type: 'alloc', name: 'E', size: 100 }
        ]
      },
      D1: { memNs: 100, tlbNs: 10, hit: 0.9 }
    }
  };

  var REGION_LABEL = {
    direct: '直接',
    single: '一级间接',
    double: '二级间接',
    triple: '三级间接'
  };

  function clone(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg);
  }

  /* ---------- inode / 文件索引 ---------- */

  function inodeLayout(cfg) {
    assert(cfg.blockSize % cfg.ptrSize === 0, '块大小必须能被地址项大小整除');
    var p = cfg.blockSize / cfg.ptrSize;
    var counts = {
      direct: cfg.nDirect,
      single: cfg.nSingle * p,
      double: cfg.nDouble * p * p,
      triple: cfg.nTriple * p * p * p
    };
    var depthOf = { direct: 0, single: 1, double: 2, triple: 3 };
    var regions = [];
    var start = 0;
    ['direct', 'single', 'double', 'triple'].forEach(function (key) {
      var count = counts[key];
      regions.push({
        key: key,
        label: REGION_LABEL[key],
        start: start,
        end: start + count, // 不含
        count: count,
        depth: depthOf[key],
        readCost: depthOf[key] + 1, // 数据块那一次也算
        ptrCount: {
          direct: cfg.nDirect,
          single: cfg.nSingle,
          double: cfg.nDouble,
          triple: cfg.nTriple
        }[key]
      });
      start += count;
    });
    var totalBlocks = start;
    return {
      cfg: clone(cfg),
      p: p,
      regions: regions,
      totalBlocks: totalBlocks,
      maxBytes: totalBlocks * cfg.blockSize,
      maxMB: totalBlocks * cfg.blockSize / (1024 * 1024)
    };
  }

  /* 定位第 index 号数据块（从 0 数），返回间接层级与每层索引项 */
  function locateBlock(cfg, index) {
    var L = inodeLayout(cfg);
    if (index < 0 || index >= L.totalBlocks) {
      return { outOfRange: true, layout: L };
    }
    var region = null;
    for (var i = 0; i < L.regions.length; i++) {
      var r = L.regions[i];
      if (r.count > 0 && index >= r.start && index < r.end) {
        region = r;
        break;
      }
    }
    assert(region, '找不到块所在区域');
    var rel = index - region.start;
    var ptrIndex = 0;
    var entries = [];
    var p = L.p;
    if (region.depth === 0) {
      // 直接指针没有间接索引项
      entries = [];
    } else if (region.depth === 1) {
      ptrIndex = Math.floor(rel / p);
      entries = [rel % p];
    } else if (region.depth === 2) {
      ptrIndex = Math.floor(rel / (p * p));
      var rem2 = rel % (p * p);
      entries = [Math.floor(rem2 / p), rem2 % p];
    } else {
      ptrIndex = Math.floor(rel / (p * p * p));
      var rem3 = rel % (p * p * p);
      entries = [
        Math.floor(rem3 / (p * p)),
        Math.floor((rem3 % (p * p)) / p),
        rem3 % p
      ];
    }
    return {
      index: index,
      region: region,
      rel: rel,
      ptrIndex: ptrIndex,
      entries: entries,
      reads: region.readCost,
      layout: L
    };
  }

  /* 实际占用：数据块 + 各级索引块 */
  function fileUsage(cfg, bytes) {
    var L = inodeLayout(cfg);
    var p = L.p;
    var dataBlocks = Math.ceil(bytes / cfg.blockSize);
    assert(dataBlocks <= L.totalBlocks, '文件超过最大可寻址范围');

    var remaining = dataBlocks;
    var direct = Math.min(remaining, cfg.nDirect);
    remaining -= direct;
    var single = Math.min(remaining, cfg.nSingle * p);
    remaining -= single;
    var double = Math.min(remaining, cfg.nDouble * p * p);
    remaining -= double;
    var triple = Math.min(remaining, cfg.nTriple * p * p * p);
    remaining -= triple;

    var singleIndexBlocks = single > 0 ? Math.ceil(single / p) : 0;
    var doubleTopBlocks = double > 0 ? Math.ceil(double / (p * p)) : 0;
    var doubleL2Blocks = double > 0 ? Math.ceil(double / p) : 0;
    var tripleTopBlocks = triple > 0 ? Math.ceil(triple / (p * p * p)) : 0;
    var tripleL2Blocks = triple > 0 ? Math.ceil(triple / (p * p)) : 0;
    var tripleL3Blocks = triple > 0 ? Math.ceil(triple / p) : 0;

    var indexBlocks = singleIndexBlocks + doubleTopBlocks + doubleL2Blocks +
      tripleTopBlocks + tripleL2Blocks + tripleL3Blocks;

    var doubleFullL2 = double > 0 ? Math.floor(double / p) : 0;
    var doubleLastEntries = double > 0 ? double - doubleFullL2 * p : 0;

    return {
      byteSize: bytes,
      dataBlocks: dataBlocks,
      direct: direct,
      single: single,
      double: double,
      triple: triple,
      unusedCapacity: remaining,
      singleIndexBlocks: singleIndexBlocks,
      doubleTopBlocks: doubleTopBlocks,
      doubleL2Blocks: doubleL2Blocks,
      doubleFullL2: doubleFullL2,
      doubleLastEntries: doubleLastEntries,
      tripleTopBlocks: tripleTopBlocks,
      tripleL2Blocks: tripleL2Blocks,
      tripleL3Blocks: tripleL3Blocks,
      indexBlocks: indexBlocks,
      totalBlocks: dataBlocks + indexBlocks
    };
  }

  function linkedInfo(cfg) {
    var logical = Math.floor(cfg.offset / cfg.blockSize);
    var inner = cfg.offset % cfg.blockSize;
    return {
      offset: cfg.offset,
      blockSize: cfg.blockSize,
      logical: logical,
      inner: inner,
      physical: cfg.blocks[logical],
      chain: cfg.blocks.slice()
    };
  }

  /* ---------- 分页 / 分段 ---------- */

  function pagingA(cfg) {
    assert(cfg.pageBits + cfg.offsetBits === cfg.addrBits, '页号位 + 页内位应等于地址总位数');
    var pageSize = Math.pow(2, cfg.offsetBits);
    var pageCount = Math.pow(2, cfg.pageBits);
    var maxMem = Math.pow(2, cfg.addrBits);
    var page = Math.floor(cfg.va / pageSize);
    var offset = cfg.va % pageSize;
    var frame = cfg.pageTable[page];
    assert(typeof frame === 'number', '页表中没有该页');
    var pa = frame * pageSize + offset;
    return {
      cfg: clone(cfg),
      pageSize: pageSize,
      pageCount: pageCount,
      maxMem: maxMem,
      page: page,
      offset: offset,
      frame: frame,
      pa: pa,
      paHex: pa.toString(16).toUpperCase(),
      vaBin: cfg.va.toString(2).padStart(cfg.addrBits, '0'),
      pageBin: page.toString(2).padStart(cfg.pageBits, '0'),
      offsetBin: offset.toString(2).padStart(cfg.offsetBits, '0')
    };
  }

  function pagingB(cfg) {
    var va = parseInt(cfg.vaHex, 16);
    var offsetBits = Math.round(Math.log2(cfg.pageSize));
    var pageBits = Math.round(Math.log2(cfg.pages));
    var totalBits = offsetBits + pageBits;
    var page = Math.floor(va / cfg.pageSize);
    var offset = va % cfg.pageSize;
    var frame = cfg.pageTable[page];
    assert(typeof frame === 'number', '页表中没有该页');
    var pa = frame * cfg.pageSize + offset;
    var vaBin = va.toString(2).padStart(totalBits, '0');
    return {
      cfg: clone(cfg),
      va: va,
      vaHex: cfg.vaHex.toUpperCase().padStart(Math.ceil(totalBits / 4), '0'),
      pageSize: cfg.pageSize,
      offsetBits: offsetBits,
      pageBits: pageBits,
      totalBits: totalBits,
      page: page,
      offset: offset,
      frame: frame,
      pa: pa,
      paHex: pa.toString(16).toUpperCase().padStart(Math.ceil(totalBits / 4), '0'),
      vaBin: vaBin,
      pageBin: vaBin.slice(0, pageBits),
      offsetBin: vaBin.slice(pageBits),
      frameBin: frame.toString(2).padStart(pageBits, '0'),
      paBin: frame.toString(2).padStart(pageBits, '0') + vaBin.slice(pageBits)
    };
  }

  /* 通用地址变换（自测 B1/B2） */
  function translate(cfg) {
    var offsetBits = Math.round(Math.log2(cfg.pageSize));
    var page = Math.floor(cfg.va / cfg.pageSize);
    var offset = cfg.va % cfg.pageSize;
    var frame = cfg.pageTable[page];
    assert(typeof frame === 'number', '页表中没有该页');
    var pa = frame * cfg.pageSize + offset;
    var offHexWidth = Math.max(1, Math.ceil(offsetBits / 4));
    return {
      cfg: clone(cfg),
      pageSize: cfg.pageSize,
      offsetBits: offsetBits,
      page: page,
      offset: offset,
      frame: frame,
      pa: pa,
      offsetHex: offset.toString(16).toUpperCase().padStart(offHexWidth, '0'),
      frameHex: frame.toString(16).toUpperCase(),
      paHex: pa.toString(16).toUpperCase()
    };
  }

  function segInfo(cfg) {
    var offsetBits = cfg.addrBits - cfg.segBits;
    return {
      cfg: clone(cfg),
      offsetBits: offsetBits,
      maxSegBytes: Math.pow(2, offsetBits),
      maxSegKB: Math.pow(2, offsetBits) / 1024,
      maxSegments: Math.pow(2, cfg.segBits)
    };
  }

  /* ---------- 首次适应 ---------- */

  function simulateFit(memKB, ops) {
    var free = [{ start: 0, size: memKB }];
    var alloc = [];
    var snapshots = [];

    snapshots.push({
      index: 0,
      op: { type: 'init', name: '初始', size: 0 },
      free: clone(free),
      alloc: clone(alloc),
      freeBefore: clone(free),
      allocBefore: [],
      scan: [],
      merges: []
    });

    ops.forEach(function (op, i) {
      var rec = {
        index: i + 1,
        op: clone(op),
        freeBefore: clone(free),
        allocBefore: clone(alloc),
        scan: [],
        merges: []
      };

      if (op.type === 'alloc') {
        var scan = [];
        var chosen = -1;
        for (var j = 0; j < free.length; j++) {
          var f = free[j];
          var ok = f.size >= op.size;
          scan.push({ start: f.start, size: f.size, ok: ok });
          if (ok) { chosen = j; break; }
        }
        assert(chosen >= 0, '没有足够大的空闲分区：' + op.name + ' ' + op.size + 'KB');
        var target = free[chosen];
        var original = { start: target.start, size: target.size };
        var seg = { name: op.name, start: target.start, size: op.size };
        alloc.push(seg);
        if (target.size === op.size) {
          free.splice(chosen, 1);
        } else {
          target.start += op.size;
          target.size -= op.size;
        }
        rec.scan = scan;
        rec.chosen = original;
        rec.allocated = clone(seg);
        rec.split = {
          original: original,
          allocated: clone(seg),
          remain: target.size > 0 ? { start: target.start, size: target.size } : null
        };
      } else if (op.type === 'free') {
        var idx = -1;
        for (var k = 0; k < alloc.length; k++) {
          if (alloc[k].name === op.name) { idx = k; break; }
        }
        assert(idx >= 0, '找不到要释放的作业：' + op.name);
        var released = alloc.splice(idx, 1)[0];
        rec.released = clone(released);

        var block = { start: released.start, size: released.size };
        free.push(block);
        free.sort(function (a, b) { return a.start - b.start; });
        var bi = free.indexOf(block);

        // 先向高地址合并，再向低地址合并（顺序不影响结果）
        while (bi + 1 < free.length &&
               free[bi].start + free[bi].size === free[bi + 1].start) {
          rec.merges.push({ side: 'right', other: clone(free[bi + 1]) });
          free[bi].size += free[bi + 1].size;
          free.splice(bi + 1, 1);
        }
        if (bi > 0 && free[bi - 1].start + free[bi - 1].size === free[bi].start) {
          rec.merges.push({ side: 'left', other: clone(free[bi - 1]) });
          free[bi - 1].size += free[bi].size;
          free.splice(bi, 1);
          bi -= 1;
        }
        rec.mergedBlock = clone(free[bi]);
      } else {
        throw new Error('未知操作：' + op.type);
      }

      free.sort(function (a, b) { return a.start - b.start; });
      alloc.sort(function (a, b) { return a.start - b.start; });
      rec.free = clone(free);
      rec.alloc = clone(alloc);
      rec.allocatedKB = alloc.reduce(function (s, a) { return s + a.size; }, 0);
      rec.freeKB = free.reduce(function (s, f) { return s + f.size; }, 0);
      snapshots.push(rec);
    });

    var allocatedKB = alloc.reduce(function (s, a) { return s + a.size; }, 0);
    var freeKB = free.reduce(function (s, f) { return s + f.size; }, 0);
    assert(allocatedKB + freeKB === memKB, '内存总量不守恒');

    return {
      memKB: memKB,
      snapshots: snapshots,
      finalFree: clone(free),
      finalAlloc: clone(alloc),
      allocatedKB: allocatedKB,
      freeKB: freeKB,
      utilization: allocatedKB / memKB
    };
  }

  function fitChoices(free, req) {
    var first = null, best = null, worst = null;
    free.forEach(function (f) {
      if (f.size < req) return;
      if (!first) first = f;
      if (!best || f.size < best.size) best = f;
      if (!worst || f.size > worst.size) worst = f;
    });
    assert(first && best && worst, '没有满足要求的空闲块');
    return {
      request: req,
      first: clone(first),
      best: clone(best),
      worst: clone(worst)
    };
  }

  /* ---------- 快表 TLB ---------- */

  function tlbEat(cfg, h) {
    var t = cfg.tlbNs;
    var m = cfg.memNs;
    return h * (t + m) + (1 - h) * (t + 2 * m);
  }

  function tlbInfo(cfg) {
    var t = cfg.tlbNs;
    var m = cfg.memNs;
    var h = cfg.hit;
    var hitTime = t + m;
    var missTime = t + 2 * m;
    var eat = tlbEat(cfg, h);
    var noTlb = 2 * m;
    var exam = m + t * h + (m + t) * (1 - h);
    return {
      cfg: clone(cfg),
      tlbNs: t,
      memNs: m,
      hit: h,
      hitTime: hitTime,
      missTime: missTime,
      eat: eat,
      noTlb: noTlb,
      exam: exam,
      hitCount: Math.round(100 * h),
      missCount: Math.round(100 * (1 - h)),
      total100: 100 * eat,
      // EAT 与不设快表相等时的命中率
      breakEven: (2 * m - (t + 2 * m)) / (t + m - (t + 2 * m))
    };
  }

  /* ---------- 汇总 ---------- */

  function build() {
    var inodeL = inodeLayout(RAW.inode);
    var inodeBlock = Math.floor(RAW.inode.offset / RAW.inode.blockSize);
    var inodeAccess = locateBlock(RAW.inode, inodeBlock);
    var inodeUsage = fileUsage(RAW.inode, RAW.inode.fileBytes);

    var linked = linkedInfo(RAW.linked);

    var twoLevel = (function () {
      var p = RAW.twoLevel.blockSize / RAW.twoLevel.ptrSize;
      var maxBlocks = Math.pow(p, RAW.twoLevel.levels);
      return {
        p: p,
        levels: RAW.twoLevel.levels,
        blockSize: RAW.twoLevel.blockSize,
        ptrSize: RAW.twoLevel.ptrSize,
        maxBlocks: maxBlocks,
        maxBytes: maxBlocks * RAW.twoLevel.blockSize,
        maxMB: maxBlocks * RAW.twoLevel.blockSize / (1024 * 1024)
      };
    })();

    var A = pagingA(RAW.pagingA);
    var B = pagingB(RAW.pagingB);
    var seg = segInfo(RAW.seg);

    var fit = simulateFit(RAW.fit.memKB, RAW.fit.ops);
    var fitC = simulateFit(RAW.fitC.memKB, RAW.fitC.ops);
    var choices = fitChoices(RAW.fitCmp.free, RAW.fitCmp.request);
    var tlb = tlbInfo(RAW.tlb);

    var a1Cfg = RAW.tests.A1;
    var a1Block = Math.floor(a1Cfg.offset / a1Cfg.blockSize);
    var a1 = {
      cfg: clone(a1Cfg),
      layout: inodeLayout(a1Cfg),
      byteBlock: a1Block,
      blockOffset: a1Cfg.offset % a1Cfg.blockSize,
      access: locateBlock(a1Cfg, a1Block)
    };
    var a2 = {
      cfg: clone(RAW.tests.A2),
      layout: inodeLayout(RAW.tests.A2)
    };
    var b1 = translate(RAW.tests.B1);
    var b2 = translate(RAW.tests.B2);
    var c1 = simulateFit(RAW.tests.C1.memKB, RAW.tests.C1.ops);
    var d1 = tlbInfo(RAW.tests.D1);

    return {
      raw: RAW,
      inode: {
        cfg: clone(RAW.inode),
        layout: inodeL,
        blockIndex: inodeBlock,
        blockOffset: RAW.inode.offset % RAW.inode.blockSize,
        access: inodeAccess,
        usage: inodeUsage
      },
      linked: linked,
      twoLevel: twoLevel,
      pagingA: A,
      pagingB: B,
      seg: seg,
      fit: fit,
      fitC: fitC,
      fitCmp: choices,
      fitCmpFree: clone(RAW.fitCmp.free),
      tlb: tlb,
      tests: { A1: a1, A2: a2, B1: b1, B2: b2, C1: c1, D1: d1 }
    };
  }

  global.OS = {
    RAW: RAW,
    build: build,
    inodeLayout: inodeLayout,
    locateBlock: locateBlock,
    fileUsage: fileUsage,
    linkedInfo: linkedInfo,
    pagingA: pagingA,
    pagingB: pagingB,
    translate: translate,
    segInfo: segInfo,
    simulateFit: simulateFit,
    fitChoices: fitChoices,
    tlbInfo: tlbInfo,
    tlbEat: tlbEat
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

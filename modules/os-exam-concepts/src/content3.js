/* ============================================================
   卡④ 内存管理 + 卡⑤ 文件
   ============================================================ */

/* ---------------- 4.1 碎片 ---------------- */
function fragmentDiagram(stage) {
  if (stage === 1) {
    const segs = [
      { x: 46, w: 132, used: true }, { x: 178, w: 58, used: false },
      { x: 236, w: 108, used: true }, { x: 344, w: 44, used: false },
      { x: 388, w: 126, used: true }, { x: 514, w: 76, used: false }
    ];
    return `
      ${tx(320, 52, "内存分配久了，空闲区会变碎", { s: 18, w: 900 })}
      ${segs.map(s => `
        ${box(s.x, 128, s.w, 108, { fill: s.used ? SVGC.mem : "var(--bg2)", stroke: s.used ? SVGC.mem : SVGC.muted, sw: 1.8, rx: 5, op: s.used ? 0.16 : 1 })}
        ${tx(s.x + s.w / 2, 182, s.used ? "已分配" : "空闲", { s: 12, c: s.used ? SVGC.mem : SVGC.ink2, w: 700 })}
      `).join("")}
      ${tag(320, 286, "两种碎片：块内没用满（内部） / 块与块之间用不上（外部）", { s: 13, c: SVGC.ink2 })}
      ${tag(320, 330, "下面分别看内部碎片和外部碎片", { s: 13, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 52, "内部碎片：分到的块里没用满", { s: 18, c: SVGC.bad, w: 900 })}
      ${box(120, 100, 400, 182, { fill: "var(--card)", stroke: SVGC.mem, sw: 2.4, rx: 10 })}
      <rect x="120" y="100" width="320" height="182" fill="${SVGC.mem}" opacity=".16"/>
      <rect x="440" y="100" width="80" height="182" fill="${SVGC.bad}" opacity=".2"/>
      ${[0, 1, 2, 3, 4, 5].map(i => ln(120 + i * 66.6, 100, 120 + i * 66.6, 282, { c: SVGC.line2, sw: 1, op: 0.3 })).join("")}
      ${tx(280, 172, "3.2 KB 用上", { s: 15, c: SVGC.mem, w: 900 })}
      ${tx(280, 204, "这一页装的内容", { s: 11.5, c: SVGC.ink2, w: 600 })}
      ${tx(480, 172, "0.8", { s: 13, c: SVGC.bad, w: 900 })}
      ${tx(480, 194, "KB", { s: 12, c: SVGC.bad, w: 900 })}
      ${tag(480, 236, "浪费", { s: 12, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 314, "一页 4 KB：最后一页只用了 3.2 KB，剩下 0.8 KB 就是内部碎片", { s: 12.5, c: SVGC.ink2 })}
      ${tag(320, 354, "分页只消除外部碎片，内部碎片仍然存在", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}`;
  }
  if (stage === 3) {
    const segs = [
      { x: 44, w: 104 }, { x: 148, w: 30 }, { x: 178, w: 96 },
      { x: 274, w: 26 }, { x: 300, w: 118 }, { x: 418, w: 34 },
      { x: 452, w: 146 }
    ];
    return `
      ${tx(320, 52, "外部碎片：块与块之间的小空闲区", { s: 18, c: SVGC.bad, w: 900 })}
      ${segs.map((s, i) => `
        ${box(s.x, 118, s.w, 96, { fill: i % 2 === 0 ? SVGC.mem : "var(--bg2)", stroke: i % 2 === 0 ? SVGC.mem : SVGC.bad, sw: i % 2 === 0 ? 1.8 : 2, rx: 5, op: i % 2 === 0 ? 0.15 : 1, dash: i % 2 === 0 ? "" : "4 3" })}
        ${i % 2 === 0 ? tx(s.x + s.w / 2, 166, "占用", { s: 11.5, c: SVGC.mem, w: 700 }) : ""}
      `).join("")}
      ${[178, 274, 418].map(x => arrow(x + 13, 236, x + 13, 270, { c: SVGC.bad, key: "red", sw: 2.2 })).join("")}
      ${tag(320, 300, "空闲块都太小，凑不出一块连续的大空间", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 340, "现在需要一个 6 KB 的连续空间 → 分配失败", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}
      ${mark(560, 286, false, { r: 14 })}`;
  }
  return `
    ${tx(320, 52, "一句话分清两种碎片", { s: 19, w: 900 })}
    ${box(24, 88, 286, 236, { fill: "var(--card)", stroke: SVGC.mem, sw: 2.2, rx: 16 })}
    ${tx(167, 120, "内部碎片", { s: 18, c: SVGC.mem, w: 900 })}
    ${mark(167, 162, true, { r: 13 })}
    ${tx(190, 162, "分页：最后一页装不满", { s: 12.5, a: "start", c: SVGC.ink2 })}
    ${mark(167, 204, false, { r: 13 })}
    ${tx(190, 204, "不是块与块之间的问题", { s: 12.5, a: "start", c: SVGC.ink2 })}
    ${tag(167, 262, "藏在块内部", { s: 13, c: SVGC.mem, stroke: SVGC.mem })}
    ${box(330, 88, 286, 236, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 16, dash: "6 5" })}
    ${tx(473, 120, "外部碎片", { s: 18, c: SVGC.bad, w: 900 })}
    ${mark(473, 162, true, { r: 13 })}
    ${tx(496, 162, "动态分区、分段会出现", { s: 12.5, a: "start", c: SVGC.ink2 })}
    ${mark(473, 204, false, { r: 13 })}
    ${tx(496, 204, "分页不会产生外部碎片", { s: 12.5, a: "start", c: SVGC.ink2 })}
    ${tag(473, 262, "散落在块与块之间", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}
    ${tag(320, 356, "结论：分页只消除外部碎片，内部碎片仍存在", { s: 15, c: SVGC.warn, stroke: SVGC.warn })}`;
}

/* ---------------- 4.2 分页 vs 分段 ---------------- */
function pageSegDiagram(stage) {
  if (stage === 1) {
    let cells = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        cells += `<rect x="${92 + c * 92}" y="${100 + r * 60}" width="88" height="56" rx="4" fill="${SVGC.mem}" opacity=".08" stroke="${SVGC.mem}" stroke-width="1.5"/>${tx(136 + c * 92, 128 + r * 60, `页 ${r * 5 + c}`, { s: 11.5, c: SVGC.mem, w: 700 })}`;
      }
    }
    return `
      ${tx(320, 48, "分页：切成固定大小", { s: 18, c: SVGC.mem, w: 900 })}
      ${cells}
      ${tag(320, 300, "大小固定 · 由系统划分 · 对用户透明", { s: 13, c: SVGC.mem, stroke: SVGC.mem })}
      <rect x="92" y="330" width="456" height="30" rx="4" fill="var(--card)" stroke="${SVGC.mem}" stroke-width="2"/>
      <rect x="92" y="330" width="152" height="30" rx="4" fill="${SVGC.mem}" opacity=".18"/>
      ${tx(168, 345, "页号", { s: 12, c: SVGC.mem, w: 800 })}
      ${tx(396, 345, "页内地址", { s: 12, c: SVGC.mem, w: 800 })}
      ${tag(320, 380, "逻辑地址是一维的：一个数就能表示", { s: 11.5, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 48, "分段：按逻辑切成不等长的段", { s: 18, c: SVGC.seg, w: 900 })}
      ${box(110, 84, 200, 82, { fill: SVGC.seg, stroke: SVGC.seg, sw: 2.2, rx: 8, op: 0.12 })}
      ${tx(210, 125, "代码段", { s: 15, c: SVGC.seg, w: 800 })}
      ${box(110, 176, 320, 78, { fill: SVGC.seg, stroke: SVGC.seg, sw: 2.2, rx: 8, op: 0.12 })}
      ${tx(270, 215, "数据段", { s: 15, c: SVGC.seg, w: 800 })}
      ${box(110, 264, 150, 60, { fill: SVGC.seg, stroke: SVGC.seg, sw: 2.2, rx: 8, op: 0.12 })}
      ${tx(185, 294, "栈段", { s: 15, c: SVGC.seg, w: 800 })}
      ${box(450, 110, 156, 166, { fill: "var(--card)", stroke: SVGC.seg, sw: 2, rx: 12 })}
      ${tx(528, 138, "地址", { s: 13, c: SVGC.seg, w: 800 })}
      ${tx(528, 186, "（段号，", { s: 18, c: SVGC.ink, w: 800 })}
      ${tx(528, 218, "段内地址）", { s: 18, c: SVGC.ink, w: 800 })}
      ${tx(528, 252, "二维", { s: 13, c: SVGC.bad, w: 800 })}
      ${tag(320, 350, "按逻辑划分 · 长度不等 · 地址是（段号, 段内地址）", { s: 13, c: SVGC.seg, stroke: SVGC.seg })}`;
  }
  return `
    ${tx(320, 46, "段内地址越界检查", { s: 18, c: SVGC.bad, w: 900 })}
    ${box(50, 92, 260, 160, { fill: "var(--card)", stroke: SVGC.seg, sw: 2.2, rx: 12 })}
    ${tx(180, 120, "段表", { s: 15, c: SVGC.seg, w: 900 })}
    ${ln(66, 136, 294, 136, { c: SVGC.line2, sw: 1 })}
    ${tx(110, 160, "段号", { s: 12, c: SVGC.ink2, w: 700 })}
    ${tx(240, 160, "段长", { s: 12, c: SVGC.ink2, w: 700 })}
    ${tx(110, 204, "2", { s: 18, c: SVGC.seg, w: 900 })}
    ${tx(240, 204, "600", { s: 18, c: SVGC.seg, w: 900 })}
    ${box(360, 100, 240, 128, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 12 })}
    ${tx(480, 130, "逻辑地址", { s: 12, c: SVGC.ink2, w: 700 })}
    ${tx(480, 174, "段 2，段内 800", { s: 17, c: SVGC.bad, w: 900 })}
    ${tx(480, 208, "800 > 600", { s: 20, c: SVGC.bad, w: 900, ff: "Georgia,serif" })}
    ${arrow(310, 180, 356, 180, { c: SVGC.bad, key: "red", sw: 2.4 })}
    ${mark(547, 74, false, { r: 16 })}
    ${tag(320, 270, "段内地址大于段长 → 越界中断", { s: 15, c: SVGC.bad, stroke: SVGC.bad })}
    ${tag(320, 320, "分段要检查段长；分页的页内偏移不会超过页大小", { s: 12, c: SVGC.ink2 })}
    ${tag(320, 358, "所以分段地址是二维的，还要做越界检查", { s: 12.5, c: SVGC.seg, stroke: SVGC.seg })}`;
}

/* ---------------- 4.3 地址变换 ---------------- */
function addressDiagram(stage) {
  if (stage === 3) {
    return `
      ${tx(320, 46, "段页式：段表 → 页表 → 数据", { s: 18, w: 900 })}
      ${box(36, 120, 140, 100, { fill: "var(--card)", stroke: SVGC.seg, sw: 2.2, rx: 12 })}
      ${tx(106, 150, "段表", { s: 16, c: SVGC.seg, w: 900 })}
      ${tx(106, 184, "查段号", { s: 12, c: SVGC.ink2, w: 600 })}
      ${box(246, 120, 140, 100, { fill: "var(--card)", stroke: SVGC.mem, sw: 2.2, rx: 12 })}
      ${tx(316, 150, "页表", { s: 16, c: SVGC.mem, w: 900 })}
      ${tx(316, 184, "查页号", { s: 12, c: SVGC.ink2, w: 600 })}
      ${box(456, 120, 140, 100, { fill: "var(--card)", stroke: SVGC.run, sw: 2.2, rx: 12 })}
      ${tx(526, 150, "内存数据", { s: 16, c: SVGC.run, w: 900 })}
      ${tx(526, 184, "取数据", { s: 12, c: SVGC.ink2, w: 600 })}
      ${arrow(178, 170, 242, 170, { c: SVGC.ink2, key: "ink", sw: 2.6 })}
      ${arrow(388, 170, 452, 170, { c: SVGC.ink2, key: "ink", sw: 2.6 })}
      ${tag(210, 214, "① 内存", { s: 12, c: SVGC.seg, stroke: SVGC.seg })}
      ${tag(420, 214, "② 内存", { s: 12, c: SVGC.mem, stroke: SVGC.mem })}
      ${tag(526, 268, "③ 内存", { s: 12, c: SVGC.run, stroke: SVGC.run })}
      ${tag(320, 318, "段页式访问一个数据需要 3 次内存", { s: 16, c: SVGC.warn, stroke: SVGC.warn })}
      ${tag(320, 358, "不设快表时，页式是 2 次；段页式多查一张段表", { s: 12.5, c: SVGC.ink2 })}`;
  }
  const step = stage === 2;
  return `
    ${tx(320, 42, "页式地址变换：页表放在内存", { s: 18, w: 900 })}
    ${box(24, 148, 98, 76, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2.2, rx: 10, op: 0.12 })}
    ${tx(73, 186, "CPU", { s: 17, c: SVGC.cpu, w: 900 })}
    ${box(152, 50, 136, 62, { fill: "var(--card)", stroke: SVGC.warn, sw: 2.2, rx: 10 })}
    ${tx(220, 72, "页表寄存器", { s: 13, c: SVGC.warn, w: 800 })}
    ${tx(220, 94, "页表基址", { s: 11.5, c: SVGC.ink2, w: 600 })}
    ${box(318, 80, 166, 178, { fill: "var(--card)", stroke: SVGC.mem, sw: 2.2, rx: 10 })}
    ${tx(401, 104, "页表（在内存）", { s: 12.5, c: SVGC.mem, w: 800 })}
    ${ln(334, 118, 468, 118, { c: SVGC.line2, sw: 1 })}
    ${[
      ["页 0", "块 5"], ["页 1", "块 8"], ["页 2", "块 3"], ["页 3", "块 9"]
    ].map((r, i) => `${tx(364, 140 + i * 28, r[0], { s: 12, c: SVGC.ink2, w: 600 })}${tx(438, 140 + i * 28, r[1], { s: 12, c: SVGC.mem, w: 800 })}`).join("")}
    ${box(520, 248, 96, 76, { fill: SVGC.run, stroke: SVGC.run, sw: 2.2, rx: 10, op: 0.12 })}
    ${tx(568, 276, "内存", { s: 13, c: SVGC.run, w: 800 })}
    ${tx(568, 300, "数据", { s: 13, c: SVGC.run, w: 800 })}
    ${arrow(122, 180, 148, 138, { c: SVGC.warn, key: "amber", sw: 2.4 })}
    ${arrow(288, 112, 314, 130, { c: SVGC.mem, key: "purple", sw: 2.4 })}
    ${parrow("M484,212 C520,230 552,236 568,244", { c: SVGC.run, key: "green", sw: 2.4 })}
    ${step ? `
      ${tag(401, 286, "① 访问页表：第 1 次内存", { s: 12.5, c: SVGC.mem, stroke: SVGC.mem })}
      ${tag(566, 348, "② 访问数据：第 2 次内存", { s: 12.5, c: SVGC.run, stroke: SVGC.run })}
      ${tag(320, 352, "不设快表：访问一个数据至少 2 次内存", { s: 16, c: SVGC.warn, stroke: SVGC.warn })}
    ` : tag(320, 340, "页表基址在页表寄存器里，页表本身放在内存", { s: 13.5, c: SVGC.ink2 })}`;
}

/* ---------------- 4.4 重定位 ---------------- */
function relocationDiagram(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 48, "静态重定位：装入时一次完成", { s: 18, c: SVGC.proc, w: 900 })}
      ${box(70, 100, 210, 150, { fill: "var(--card)", stroke: SVGC.proc, sw: 2.2, rx: 12 })}
      ${tx(175, 126, "程序装入内存", { s: 14, c: SVGC.proc, w: 800 })}
      ${tx(175, 164, "基址 1000", { s: 16, c: SVGC.ink, w: 800 })}
      ${tx(175, 202, "逻辑地址 200", { s: 13, c: SVGC.ink2, w: 600 })}
      ${arrow(282, 176, 354, 176, { c: SVGC.ink2, key: "ink", sw: 2.6 })}
      ${box(360, 100, 210, 150, { fill: "var(--card)", stroke: SVGC.ok, sw: 2.2, rx: 12 })}
      ${tx(465, 126, "装入时改写", { s: 14, c: SVGC.ok, w: 800 })}
      ${tx(465, 172, "1200", { s: 28, c: SVGC.ok, w: 900, ff: "Georgia,serif" })}
      ${tx(465, 208, "以后访问的就是 1200", { s: 12, c: SVGC.ink2, w: 600 })}
      ${tag(320, 290, "装入时一次加上基址，地址从此固定", { s: 14, c: SVGC.proc, stroke: SVGC.proc })}
      ${tag(320, 334, "特点：装入时完成，运行时不再计算", { s: 13, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 48, "动态重定位：运行时每次访问都算", { s: 18, c: SVGC.ok, w: 900 })}
      ${box(56, 120, 150, 90, { fill: "var(--card)", stroke: SVGC.warn, sw: 2.2, rx: 12 })}
      ${tx(131, 150, "基址寄存器", { s: 13, c: SVGC.warn, w: 800 })}
      ${tx(131, 184, "1000", { s: 24, c: SVGC.warn, w: 900 })}
      ${box(56, 240, 150, 90, { fill: "var(--card)", stroke: SVGC.proc, sw: 2.2, rx: 12 })}
      ${tx(131, 270, "逻辑地址", { s: 13, c: SVGC.proc, w: 800 })}
      ${tx(131, 304, "200", { s: 24, c: SVGC.proc, w: 900 })}
      ${box(330, 176, 80, 80, { fill: "var(--card)", stroke: SVGC.ink, sw: 2.2, rx: 12 })}
      ${tx(370, 216, "+", { s: 28, c: SVGC.ink, w: 900 })}
      ${arrow(210, 166, 330, 200, { c: SVGC.warn, key: "amber", sw: 2.4 })}
      ${arrow(210, 286, 330, 232, { c: SVGC.proc, key: "darkblue", sw: 2.4 })}
      ${arrow(414, 216, 474, 216, { c: SVGC.ok, key: "green", sw: 2.8 })}
      ${box(480, 176, 120, 80, { fill: "var(--card)", stroke: SVGC.ok, sw: 2.2, rx: 12 })}
      ${tx(540, 208, "物理地址", { s: 12, c: SVGC.ink2, w: 600 })}
      ${tx(540, 234, "1200", { s: 21, c: SVGC.ok, w: 900 })}
      ${tag(320, 348, "硬件在每次访问时：逻辑地址 + 基址 → 物理地址", { s: 14, c: SVGC.ok, stroke: SVGC.ok })}
      ${tag(320, 382, "这是运行时进行的，不是装入时一次完成", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}`;
  }
  return `
    ${tx(320, 52, "静态 vs 动态重定位", { s: 19, w: 900 })}
    ${box(24, 88, 286, 240, { fill: "var(--card)", stroke: SVGC.proc, sw: 2.2, rx: 16 })}
    ${tx(167, 122, "静态重定位", { s: 19, c: SVGC.proc, w: 900 })}
    ${mark(167, 170, true, { r: 13 })}
    ${tx(190, 170, "装入时一次加上基址", { s: 13, a: "start", c: SVGC.ink2 })}
    ${mark(167, 212, true, { r: 13 })}
    ${tx(190, 212, "地址从此固定", { s: 13, a: "start", c: SVGC.ink2 })}
    ${tag(167, 274, "装入时完成", { s: 14, c: SVGC.proc, stroke: SVGC.proc })}
    ${box(330, 88, 286, 240, { fill: "var(--card)", stroke: SVGC.ok, sw: 2.2, rx: 16 })}
    ${tx(473, 122, "动态重定位", { s: 19, c: SVGC.ok, w: 900 })}
    ${mark(473, 170, true, { r: 13 })}
    ${tx(496, 170, "每次访问时硬件相加", { s: 13, a: "start", c: SVGC.ink2 })}
    ${mark(473, 212, true, { r: 13 })}
    ${tx(496, 212, "逻辑地址 + 基址", { s: 13, a: "start", c: SVGC.ink2 })}
    ${tag(473, 274, "运行时进行", { s: 14, c: SVGC.ok, stroke: SVGC.ok })}
    ${tag(320, 360, "考试问“动态重定位什么时候进行”→ 作业执行过程中", { s: 14, c: SVGC.warn, stroke: SVGC.warn })}`;
}

/* ---------------- 4.5 缺页中断 ---------------- */
function pageFaultDiagram(step) {
  const rowY = [126, 158, 190, 222];
  const highlightRow = step === 2 || step === 5;
  const pageRows = [
    ["页 0", "在内存"], ["页 1", "在内存"], ["页 2", "在内存"], ["页 3", step >= 5 ? "已调入" : "不在内存"]
  ];
  let mem = "";
  for (let i = 0; i < 4; i++) {
    const x = 346 + (i % 2) * 106;
    const y = 94 + Math.floor(i / 2) * 98;
    const victim = i === 2 && step === 4;
    const target = i === 3 && step >= 5;
    const c = target ? SVGC.ok : victim ? SVGC.bad : SVGC.mem;
    mem += `<rect x="${x}" y="${y}" width="84" height="74" rx="6" fill="${c}" opacity="${target ? .18 : victim ? .16 : .07}" stroke="${c}" stroke-width="${target || victim ? 2.8 : 1.5}"/>
      ${tx(x + 42, y + 20, `块 ${i}`, { s: 10.5, c: SVGC.ink2, w: 600 })}
      ${tx(x + 42, y + 46, i === 2 ? "脏页" : i === 3 && step >= 5 ? "页 3" : "页 " + i, { s: 11, c: target ? SVGC.ok : victim ? SVGC.bad : SVGC.mem, w: 700 })}`;
  }
  return `
    ${tag(320, 32, `缺页中断 · 第 ${step} / 6 步`, { s: 13, c: SVGC.warn, stroke: SVGC.warn })}
    ${box(24, 148, 86, 66, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2.2, rx: 10, op: step === 1 || step === 6 ? .2 : .1 })}
    ${tx(67, 181, "CPU", { s: 15, c: SVGC.cpu, w: 900 })}
    ${box(138, 64, 164, 168, { fill: "var(--card)", stroke: SVGC.mem, sw: 2, rx: 10 })}
    ${tx(220, 86, "页表（在内存）", { s: 12, c: SVGC.mem, w: 800 })}
    ${ln(150, 100, 290, 100, { c: SVGC.line2, sw: 1 })}
    ${pageRows.map((r, i) => `
      ${highlightRow && i === 3 ? `<rect x="146" y="${rowY[i] - 13}" width="148" height="26" rx="5" fill="${step >= 5 ? SVGC.ok : SVGC.bad}" opacity=".14"/>` : ""}
      ${tx(170, rowY[i], r[0], { s: 11, c: SVGC.ink2, w: 600 })}
      ${tx(278, rowY[i], r[1], { s: 11, c: i === 3 ? (step >= 5 ? SVGC.ok : SVGC.bad) : SVGC.ink2, w: 700 })}
    `).join("")}
    ${box(330, 64, 222, 218, { stroke: SVGC.mem, sw: 1.4, rx: 10, dash: "4 5", op: .6 })}
    ${tx(441, 53, "内存", { s: 12, c: SVGC.mem, w: 800 })}
    ${mem}
    ${box(288, 300, 82, 46, { fill: SVGC.warn, stroke: SVGC.warn, sw: 2.2, rx: 10, op: step === 3 ? .22 : .08 })}
    ${tx(329, 317, "OS", { s: 13, c: SVGC.warn, w: 900 })}
    ${tx(329, 334, "缺页处理", { s: 9, c: SVGC.ink2, w: 600 })}
    ${box(500, 300, 116, 52, { fill: SVGC.disk, stroke: SVGC.disk, sw: 2.2, rx: 10, op: step === 4 || step === 5 ? .18 : .08 })}
    ${tx(558, 319, "磁盘", { s: 12.5, c: SVGC.disk, w: 900 })}
    ${tx(558, 337, "有页 3", { s: 9.5, c: SVGC.ink2, w: 600 })}
    ${arrow(110, 181, 134, 154, { c: SVGC.proc, key: "darkblue", sw: 2.4 })}
    ${step === 3 ? arrow(302, 226, 320, 296, { c: SVGC.bad, key: "red", sw: 2.8 }) : ""}
    ${step === 4 ? arrow(370, 322, 496, 322, { c: SVGC.disk, key: "amber", sw: 2.6 }) : ""}
    ${step === 4 ? parrow("M410,268 C470,280 500,292 520,298", { c: SVGC.bad, key: "red", sw: 2, dash: "5 4" }) : ""}
    ${step === 5 ? arrow(540, 298, 540, 270, { c: SVGC.ok, key: "green", sw: 2.6 }) : ""}
    ${step === 5 ? arrow(330, 240, 304, 224, { c: SVGC.ok, key: "green", sw: 2, dash: "4 4" }) : ""}
    ${step === 6 ? parrow("M112,174 C190,132 260,136 300,168", { c: SVGC.ok, key: "green", sw: 2.6 }) : ""}
    ${step === 6 ? mark(67, 240, true, { r: 14 }) : ""}
    ${step === 1 ? tag(200, 366, "① CPU 访问某页", { s: 13, c: SVGC.proc, stroke: SVGC.proc }) : ""}
    ${step === 2 ? tag(200, 366, "② 查页表：这一页不在内存", { s: 13, c: SVGC.bad, stroke: SVGC.bad }) : ""}
    ${step === 3 ? tag(320, 366, "③ 产生缺页中断，转入 OS", { s: 13, c: SVGC.bad, stroke: SVGC.bad }) : ""}
    ${step === 4 ? tag(320, 372, "④ 从磁盘找页；没空闲块就换出，修改位=1 才写回", { s: 11.5, c: SVGC.warn, stroke: SVGC.warn }) : ""}
    ${step === 5 ? tag(320, 366, "⑤ 调入所需页，并更新页表", { s: 13, c: SVGC.ok, stroke: SVGC.ok }) : ""}
    ${step === 6 ? tag(320, 366, "⑥ 重新执行被中断的那条指令", { s: 13.5, c: SVGC.ok, stroke: SVGC.ok }) : ""}`;
}

/* ---------------- 4.6 抖动 ---------------- */
function thrashDiagram(stage) {
  if (stage === 1 || stage === 2) {
    const n = stage === 1 ? 4 : 6;
    const frames = stage === 1 ? 3 : 2;
    const colors = Array(6).fill(SVGC.proc);
    let zones = "";
    for (let i = 0; i < n; i++) {
      const x = 34 + (i % 3) * 194;
      const y = 96 + Math.floor(i / 3) * 122;
      zones += `<g class="pop" style="animation-delay:${i * .05}s">
        ${box(x, y, 180, 104, { fill: "var(--card)", stroke: colors[i], sw: 1.8, rx: 10 })}
        ${tx(x + 12, y + 18, `P${i + 1}`, { s: 12, a: "start", c: colors[i], w: 800 })}
        ${Array.from({ length: frames }).map((_, j) => `<rect x="${x + 12 + j * 50}" y="${y + 38}" width="42" height="30" rx="4" fill="${colors[i]}" opacity=".14" stroke="${colors[i]}" stroke-width="1.3"/>`).join("")}
        ${tx(x + 90, y + 88, `${frames} 个物理块`, { s: 10.5, c: SVGC.ink2, w: 600 })}
      </g>`;
    }
    return `
      ${tx(320, 48, stage === 1 ? "4 个进程，每个分到 3 个物理块" : "进程变多，每个进程只能分到 2 个物理块", { s: 17, w: 900 })}
      ${zones}
      ${stage === 2 ? tag(320, 368, "块太少 → 刚用到的页又被换出 → 缺页中断频繁", { s: 13, c: SVGC.bad, stroke: SVGC.bad }) : tag(320, 354, "分给每个进程的物理块越少，越容易缺页", { s: 13, c: SVGC.ink2 })}`;
  }
  if (stage === 3) {
    const bars = [28, 42, 58, 76, 92];
    return `
      ${tx(320, 46, "缺页率随进程数上升（全局置换）", { s: 17, w: 900 })}
      ${box(90, 90, 460, 220, { fill: "var(--card)", stroke: SVGC.line2, sw: 1.6, rx: 6 })}
      ${[0, 1, 2, 3, 4].map(i => `${ln(120, 122 + i * 38, 530, 122 + i * 38, { c: SVGC.line2, sw: 1, op: .35, dash: "3 4" })}${tx(104, 122 + i * 38, `${(5 - i) * 20}%`, { s: 9.5, a: "end", c: SVGC.muted, w: 600 })}`).join("")}
      ${bars.map((h, i) => `<rect x="${150 + i * 72}" y="${290 - h * 2}" width="38" height="${h * 2}" rx="4" fill="${SVGC.bad}" opacity="${.35 + i * .13}" class="grow"/>${tx(169 + i * 72, 300, `${i + 2}`, { s: 11, c: SVGC.ink2, w: 700 })}`).join("")}
      ${tx(320, 330, "进程数 →", { s: 12, c: SVGC.ink2, w: 700 })}
      ${tag(320, 368, "缺页中断频繁，系统大部分时间花在换页上 = 抖动", { s: 13.5, c: SVGC.bad, stroke: SVGC.bad })}`;
  }
  return `
    ${tx(320, 52, "抖动（Thrashing）", { s: 20, w: 900 })}
    ${[
      { t: "原因一", d: "进程数太多", c: SVGC.bad },
      { t: "原因二", d: "分给每个进程的物理块太少", c: SVGC.warn },
      { t: "结果", d: "缺页中断频繁，大部分时间在换页", c: SVGC.res },
      { t: "全局置换", d: "进程数增加，每个进程缺页率上升", c: SVGC.proc }
    ].map((it, i) => {
      const x = i % 2 === 0 ? 22 : 328, y = i < 2 ? 96 : 218;
      return `<g class="pop" style="animation-delay:${i * .07}s">
        ${box(x, y, 290, 104, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 14 })}
        ${tx(x + 20, y + 30, it.t, { s: 14, a: "start", c: it.c, w: 900 })}
        ${tx(x + 20, y + 68, it.d, { s: 12.5, a: "start", c: SVGC.ink2, w: 600 })}
      </g>`;
    }).join("")}
    ${tag(320, 362, "口诀：分页管内存，分段管逻辑；缺页要重做，修改才写回", { s: 13, c: SVGC.warn, stroke: SVGC.warn })}`;
}

const CARD4_ANIMS = [
  {
    id: "p4a1", no: "4.1", title: "内部碎片 vs 外部碎片",
    frames: [
      FR("内存分配久了，会出现两种碎片：块内没用满，和块与块之间用不上。", fragmentDiagram(1)),
      FR("内部碎片：分到的块里没用满。比如分页的最后一页。", fragmentDiagram(2), 4200),
      FR("外部碎片：块与块之间的小空闲区。比如动态分区、分段。", fragmentDiagram(3), 4200),
      FR("结论：分页只消除外部碎片，内部碎片仍然存在。", fragmentDiagram(4), 4200)
    ]
  },
  {
    id: "p4a2", no: "4.2", title: "分页 vs 分段",
    frames: [
      FR("分页：大小固定，由系统划分，对用户透明，地址是一维的。", pageSegDiagram(1)),
      FR("分段：按逻辑划分，长度不等，地址是（段号, 段内地址）。", pageSegDiagram(2)),
      FR("段内地址大于段长，会产生越界中断。", pageSegDiagram(3), 4200)
    ]
  },
  {
    id: "p4a3", no: "4.3", title: "地址变换：2 次与 3 次内存",
    frames: [
      FR("页表放在内存，页表基址放在页表寄存器里。", addressDiagram(1)),
      FR("不设快表：先访问页表 1 次，再访问数据 1 次，共 2 次内存。", addressDiagram(2), 4200),
      FR("段页式：段表 + 页表 + 数据，共 3 次内存。", addressDiagram(3), 4200)
    ]
  },
  {
    id: "p4a4", no: "4.4", title: "静态 vs 动态重定位",
    frames: [
      FR("静态重定位：装入时一次加上基址，地址从此固定。", relocationDiagram(1)),
      FR("动态重定位：每次访问时，硬件把逻辑地址加上基址，是运行时进行的。", relocationDiagram(2), 4200),
      FR("对比记：静态在装入时一次完成，动态在每次访问时计算。", relocationDiagram(3), 4000)
    ]
  },
  {
    id: "p4a5", no: "4.5", title: "缺页中断：六步走完",
    frames: [
      FR("第 1 步：CPU 访问某页。", pageFaultDiagram(1)),
      FR("第 2 步：查页表，发现“不在内存”。", pageFaultDiagram(2)),
      FR("第 3 步：产生缺页中断，转入 OS。", pageFaultDiagram(3)),
      FR("第 4 步：OS 从磁盘找到该页；没有空闲块就按置换算法选一页换出，修改位为 1 才写回。", pageFaultDiagram(4), 4800),
      FR("第 5 步：把所需页调入，并更新页表。", pageFaultDiagram(5)),
      FR("第 6 步：重新执行被中断的那条指令。", pageFaultDiagram(6), 4000)
    ]
  },
  {
    id: "p4a6", no: "4.6", title: "抖动：为什么越换越慢",
    frames: [
      FR("进程数不多时，每个进程还能分到几个物理块。", thrashDiagram(1)),
      FR("进程变多，每个进程分到的物理块变少，缺页立刻变频繁。", thrashDiagram(2), 4200),
      FR("缺页中断频繁，系统大部分时间花在换页上，这就是抖动。", thrashDiagram(3), 4200),
      FR("原因：进程数太多或物理块太少；全局置换下，进程数增加会让每个进程缺页率上升。", thrashDiagram(4), 4400)
    ]
  }
];

const CARD4 = {
  id: "p4", num: "④", short: "内存管理", kicker: "碎片 · 分页分段 · 缺页 · 抖动",
  title: "内存管理",
  color: "var(--c-mem)",
  intro: "内存这张的数字题最多：碎片、2 次/3 次访存、重定位时机、缺页六步。先分清“分页管内存、分段管逻辑”，再记缺页要重做。",
  chips: ["内/外部碎片", "分页 vs 分段", "2 次 vs 3 次访存", "动态重定位", "缺页六步", "抖动"],
  anims: CARD4_ANIMS,
  compare: {
    cols: [
      {
        name: "分页", color: "var(--c-mem)", shape: "page", tag: "物理划分",
        points: [
          "大小固定",
          "由系统划分，对用户透明",
          "地址一维",
          "只消除外部碎片，内部碎片仍存在"
        ]
      },
      {
        name: "分段", color: "var(--c-seg)", shape: "rect", tag: "逻辑划分",
        points: [
          "按逻辑划分，长度不等",
          "地址是（段号, 段内地址）",
          "段内地址大于段长 → 越界中断"
        ]
      }
    ],
    facts: [
      { ok: true, text: "分页大小固定，由系统划分，对用户透明" },
      { ok: false, text: "分页是按程序的逻辑模块划分的" },
      { ok: true, text: "分页只消除外部碎片，内部碎片仍然存在" },
      { ok: false, text: "分页既消除外部碎片，也消除内部碎片" },
      { ok: true, text: "不设快表的页式管理访问一个数据至少 2 次内存" },
      { ok: true, text: "段页式访问一个数据需要 3 次内存" }
    ]
  },
  mnemonic: "分页管内存，分段管逻辑；缺页要重做，修改才写回。",
  mnNote: "页表在内存、基址在寄存器；缺页处理完，重新执行被中断的那条指令。",
  quiz: ["q21", "q22", "q23", "q25", "q27"]
};

/* ============================================================
   卡⑤ 文件
   ============================================================ */
function logicalFile(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 52, "流式文件：无结构，就是一串字节", { s: 18, c: SVGC.file, w: 900 })}
      ${box(60, 100, 520, 110, { fill: "var(--card)", stroke: SVGC.file, sw: 2.4, rx: 12 })}
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${76 + i * 61}" y="120" width="54" height="70" rx="4" fill="${SVGC.file}" opacity="${i % 2 ? .08 : .16}" stroke="${SVGC.file}" stroke-width="1.2"/>${tx(103 + i * 61, 156, i % 2 ? "01" : "10", { s: 12, c: SVGC.file, w: 700, ff: "Consolas,monospace" })}`).join("")}
      ${tx(320, 248, "没有记录边界，从头到尾按字节读写", { s: 13, c: SVGC.ink2, w: 600 })}
      ${tag(320, 312, "流式文件：无结构，字节序列", { s: 15, c: SVGC.file, stroke: SVGC.file })}
      ${tag(320, 354, "像一根没有刻度的长纸条", { s: 12.5, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 52, "记录式文件：有结构", { s: 18, c: SVGC.seg, w: 900 })}
      ${[0, 1, 2, 3].map(i => `
        <g class="pop" style="animation-delay:${i * .07}s">
          ${box(120, 92 + i * 58, 400, 48, { fill: "var(--card)", stroke: SVGC.seg, sw: 1.8, rx: 8 })}
          <rect x="120" y="${92 + i * 58}" width="54" height="48" rx="8" fill="${SVGC.seg}" opacity=".16"/>
          ${tx(147, 116 + i * 58, `记录 ${i + 1}`, { s: 11.5, c: SVGC.seg, w: 800 })}
          ${[0, 1, 2].map(j => `<rect x="${196 + j * 100}" y="${104 + i * 58}" width="82" height="24" rx="4" fill="${SVGC.seg}" opacity=".09"/>`).join("")}
        </g>`).join("")}
      ${tag(320, 352, "记录式文件：由一条条记录组成，有结构", { s: 15, c: SVGC.seg, stroke: SVGC.seg })}`;
  }
  return `
    ${tx(320, 52, "逻辑结构的目标", { s: 19, w: 900 })}
    ${[
      { t: "检索速度快", d: "找记录要快", c: SVGC.proc },
      { t: "增删改方便", d: "插入、删除、修改省事", c: SVGC.run },
      { t: "节省存储空间", d: "别浪费磁盘", c: SVGC.warn }
    ].map((it, i) => `
      <g class="pop" style="animation-delay:${i * .08}s">
        ${box(22 + i * 202, 106, 188, 176, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 15 })}
        <circle cx="${116 + i * 202}" cy="156" r="26" fill="${it.c}" opacity=".14"/>
        <circle cx="${116 + i * 202}" cy="156" r="26" fill="none" stroke="${it.c}" stroke-width="2"/>
        ${tx(116 + i * 202, 157, ["快", "改", "省"][i], { s: 16, c: it.c, w: 900 })}
        ${tx(116 + i * 202, 216, it.t, { s: 15, c: it.c, w: 800 })}
        ${tx(116 + i * 202, 246, it.d, { s: 11.5, c: SVGC.ink2, w: 600 })}
      </g>`).join("")}
    ${tag(320, 330, "逻辑结构：面向用户，文件内部怎么组织", { s: 13.5, c: SVGC.ink2 })}`;
}

function physicalFile(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 50, "连续组织：块挨着块", { s: 18, c: SVGC.file, w: 900 })}
      ${box(62, 126, 120, 54, { fill: "var(--card)", stroke: SVGC.file, sw: 2, rx: 8 })}
      ${tx(122, 144, "目录项", { s: 11.5, c: SVGC.file, w: 800 })}
      ${tx(122, 166, "起始块 2", { s: 11.5, c: SVGC.ink2, w: 600 })}
      ${[0, 1, 2, 3, 4, 5, 6].map(i => {
        const on = i >= 2 && i <= 5;
        return `<rect x="${220 + i * 54}" y="128" width="48" height="50" rx="4" fill="${on ? SVGC.file : "var(--bg2)"}" opacity="${on ? .18 : 1}" stroke="${on ? SVGC.file : SVGC.line2}" stroke-width="${on ? 2 : 1.2}"/>${tx(244 + i * 54, 153, `块 ${i}`, { s: 9.5, c: on ? SVGC.file : SVGC.muted, w: 700 })}`;
      }).join("")}
      ${tag(320, 218, "文件的块连续存放 → 访问快，支持直接存取", { s: 13.5, c: SVGC.ok, stroke: SVGC.ok })}
      ${tag(320, 264, "缺点：有外部碎片；需要预先知道文件大小", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 310, "连续组织方式支持直接存取", { s: 14, c: SVGC.file, stroke: SVGC.file })}`;
  }
  if (stage === 2) {
    const blocks = [[90, 240], [210, 150], [340, 290], [460, 180], [540, 300]];
    return `
      ${tx(320, 50, "链接组织：块之间用指针串起来", { s: 18, c: SVGC.thread, w: 900 })}
      ${box(24, 100, 96, 56, { fill: "var(--card)", stroke: SVGC.thread, sw: 2, rx: 8 })}
      ${tx(72, 120, "目录项", { s: 11, c: SVGC.thread, w: 800 })}
      ${tx(72, 140, "首块 2", { s: 10.5, c: SVGC.ink2, w: 600 })}
      ${blocks.map((b, i) => `
        <g class="pop" style="animation-delay:${i * .08}s">
          <rect x="${b[0]}" y="${b[1]}" width="70" height="54" rx="5" fill="${SVGC.thread}" opacity=".12" stroke="${SVGC.thread}" stroke-width="1.8"/>
          ${tx(b[0] + 35, b[1] + 18, `块 ${[2, 7, 4, 9, 6][i]}`, { s: 10.5, c: SVGC.thread, w: 700 })}
          ${tx(b[0] + 35, b[1] + 37, i < 4 ? "下一块 →" : "END", { s: 9, c: SVGC.ink2, w: 600 })}
        </g>`).join("")}
      ${[
        [160, 267, 206, 182], [280, 182, 336, 284], [410, 292, 456, 208], [530, 210, 536, 294]
      ].map(p => arrow(p[0], p[1], p[2], p[3], { c: SVGC.thread, key: "teal", sw: 2, dash: "5 3" })).join("")}
      ${tag(320, 338, "块之间用指针链接：顺着当前块找下一块", { s: 12.5, c: SVGC.thread, stroke: SVGC.thread })}
      ${tag(320, 376, "链接：慢但灵活", { s: 14, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  if (stage === 3) {
    const blocks = [
      { x: 66, y: 66, label: "块 5", sx: 216, sy: 136, tx: 132, ty: 108 },
      { x: 300, y: 292, label: "块 8", sx: 330, sy: 260, tx: 331, ty: 290 },
      { x: 418, y: 74, label: "块 2", sx: 366, sy: 150, tx: 416, ty: 118 },
      { x: 514, y: 282, label: "块 9", sx: 366, sy: 214, tx: 516, ty: 294 }
    ];
    return `
      ${tx(320, 50, "索引组织：索引块里放一堆指针", { s: 18, c: SVGC.res, w: 900 })}
      ${box(70, 150, 94, 62, { fill: "var(--card)", stroke: SVGC.res, sw: 2, rx: 8 })}
      ${tx(117, 172, "目录项", { s: 11, c: SVGC.res, w: 800 })}
      ${tx(117, 194, "索引块 1", { s: 10.5, c: SVGC.ink2, w: 600 })}
      ${arrow(168, 182, 210, 182, { c: SVGC.res, key: "purple", sw: 2.2 })}
      ${box(216, 116, 150, 144, { fill: "var(--card)", stroke: SVGC.res, sw: 2.2, rx: 10 })}
      ${tx(291, 138, "索引块", { s: 12.5, c: SVGC.res, w: 800 })}
      ${[0, 1, 2, 3].map(i => `${tx(244, 166 + i * 24, `→ 块 ${[5, 8, 2, 9][i]}`, { s: 11, a: "start", c: SVGC.ink2, w: 600 })}`).join("")}
      ${blocks.map(b => `
        <rect x="${b.x}" y="${b.y}" width="62" height="50" rx="4" fill="${SVGC.res}" opacity=".1" stroke="${SVGC.res}" stroke-width="1.5"/>
        ${tx(b.x + 31, b.y + 27, b.label, { s: 9.5, c: SVGC.res, w: 700 })}
        ${arrow(b.sx, b.sy, b.tx, b.ty, { c: SVGC.res, key: "purple", sw: 1.6, dash: "3 3" })}
      `).join("")}
      ${tag(320, 356, "索引：便于随机访问", { s: 13.5, c: SVGC.res, stroke: SVGC.res })}`;
  }
  return `
    ${tx(320, 52, "三种物理结构一起记", { s: 19, w: 900 })}
    ${[
      { t: "连续", d: ["访问快", "支持直接存取", "有外部碎片", "需预知大小"], c: SVGC.ok },
      { t: "链接", d: ["块之间用指针连接", "顺着指针找下一块", "慢但灵活"], c: SVGC.thread },
      { t: "索引", d: ["索引块放指针", "便于随机访问"], c: SVGC.res }
    ].map((it, i) => `
      <g class="pop" style="animation-delay:${i * .08}s">
        ${box(18 + i * 204, 92, 190, 240, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 15 })}
        ${tx(113 + i * 204, 126, it.t, { s: 19, c: it.c, w: 900 })}
        ${tlines(113 + i * 204, 172, it.d, { s: 11.5, c: SVGC.ink2, w: 600, lh: 25 })}
      </g>`).join("")}
    ${tag(320, 360, "连续快但碎，链接慢但灵活，索引兼顾随机", { s: 13, c: SVGC.warn, stroke: SVGC.warn })}`;
}

function directoryDiagram(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 50, "单级目录：所有文件挤在一起", { s: 18, c: SVGC.bad, w: 900 })}
      ${box(120, 88, 400, 230, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 14 })}
      ${tx(320, 112, "根目录", { s: 14, c: SVGC.bad, w: 800 })}
      ${["report.txt", "photo.jpg", "report.txt"].map((f, i) => `
        <g class="pop" style="animation-delay:${i * .08}s">
          ${box(150, 134 + i * 54, 340, 42, { fill: i === 2 ? "var(--bad-bg)" : "var(--bg2)", stroke: i === 2 ? SVGC.bad : SVGC.line2, sw: i === 2 ? 2.2 : 1.2, rx: 6 })}
          ${tx(172, 155 + i * 54, "文件", { s: 10, a: "start", c: SVGC.ink2, w: 600 })}
          ${tx(230, 155 + i * 54, f, { s: 12.5, a: "start", c: i === 2 ? SVGC.bad : SVGC.ink, w: 700 })}
          ${i === 2 ? mark(460, 155 + i * 54, false, { r: 11 }) : ""}
        </g>`).join("")}
      ${tag(320, 342, "所有文件放在一个目录里 → 重名冲突", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 378, "不同用户很难各自管理自己的文件", { s: 12, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 48, "两级目录：主目录 + 每个用户自己的文件目录", { s: 17, w: 900 })}
      ${box(240, 74, 160, 48, { fill: "var(--card)", stroke: SVGC.file, sw: 2.2, rx: 8 })}
      ${tx(320, 98, "主目录", { s: 13, c: SVGC.file, w: 800 })}
      ${arrow(278, 122, 168, 164, { c: SVGC.file, key: "ink", sw: 2 })}
      ${arrow(362, 122, 472, 164, { c: SVGC.file, key: "ink", sw: 2 })}
      ${[
        { x: 72, name: "用户 A", files: ["a1.txt", "a2.txt"], c: SVGC.proc },
        { x: 400, name: "用户 B", files: ["b1.txt", "b2.txt"], c: SVGC.thread }
      ].map(u => `
        <g class="pop">
          ${box(u.x, 160, 152, 48, { fill: "var(--card)", stroke: u.c, sw: 2, rx: 8 })}
          ${tx(u.x + 76, 178, u.name, { s: 12.5, c: u.c, w: 800 })}
          ${tx(u.x + 76, 196, "用户名 + 指针", { s: 9.5, c: SVGC.ink2, w: 600 })}
          ${box(u.x, 228, 152, 116, { fill: "var(--bg2)", stroke: u.c, sw: 1.5, rx: 8 })}
          ${u.files.map((f, i) => tx(u.x + 76, 254 + i * 30, f, { s: 11, c: SVGC.ink, w: 600 })).join("")}
        </g>`).join("")}
      ${tag(320, 374, "主目录项 = 用户名 + 指向该用户文件目录的指针", { s: 13, c: SVGC.file, stroke: SVGC.file })}`;
  }
  return `
    ${tx(320, 46, "多级（树形）目录", { s: 19, w: 900 })}
    ${box(278, 70, 84, 40, { fill: "var(--card)", stroke: SVGC.file, sw: 2, rx: 7 })}
    ${tx(320, 90, "/", { s: 16, c: SVGC.file, w: 900 })}
    ${box(90, 150, 110, 40, { fill: "var(--card)", stroke: SVGC.proc, sw: 2, rx: 7 })}
    ${tx(145, 170, "user1", { s: 12, c: SVGC.proc, w: 800 })}
    ${box(440, 150, 110, 40, { fill: "var(--card)", stroke: SVGC.thread, sw: 2, rx: 7 })}
    ${tx(495, 170, "user2", { s: 12, c: SVGC.thread, w: 800 })}
    ${arrow(300, 110, 170, 146, { c: SVGC.muted, key: "ink", sw: 1.8 })}
    ${arrow(340, 110, 470, 146, { c: SVGC.muted, key: "ink", sw: 1.8 })}
    ${[
      { x: 54, name: "report", c: SVGC.proc },
      { x: 174, name: "notes", c: SVGC.proc },
      { x: 404, name: "report", c: SVGC.thread },
      { x: 524, name: "photo", c: SVGC.thread }
    ].map(f => `
      <g class="pop">
        ${box(f.x, 240, 92, 44, { fill: "var(--card)", stroke: f.c, sw: 1.8, rx: 7 })}
        ${tx(f.x + 46, 262, f.name, { s: 11.5, c: f.c, w: 700 })}
      </g>`).join("")}
    ${arrow(165, 190, 110, 236, { c: SVGC.proc, key: "ink", sw: 1.5 })}
    ${arrow(180, 190, 215, 236, { c: SVGC.proc, key: "ink", sw: 1.5 })}
    ${arrow(475, 190, 450, 236, { c: SVGC.thread, key: "ink", sw: 1.5 })}
    ${arrow(510, 190, 570, 236, { c: SVGC.thread, key: "ink", sw: 1.5 })}
    ${tag(320, 320, "同一个目录下不能重名；不同目录下可以同名", { s: 14, c: SVGC.ok, stroke: SVGC.ok })}
    ${tag(220, 366, "/user1/report", { s: 11.5, c: SVGC.proc, stroke: SVGC.proc })}
    ${tag(430, 366, "/user2/report", { s: 11.5, c: SVGC.thread, stroke: SVGC.thread })}`;
}

function inodeDiagram(stage) {
  if (stage === 1) {
    const attrs = [["文件名", "report"], ["大小", "12 KB"], ["创建时间", "10:02"], ["物理地址", "块 8"], ["权限", "rw-r--"], ["所有者", "user1"]];
    return `
      ${tx(320, 48, "目录项里塞满属性：目录很大", { s: 18, c: SVGC.bad, w: 900 })}
      ${box(120, 82, 400, 262, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 14 })}
      ${tx(320, 108, "目录项（FCB）", { s: 14, c: SVGC.bad, w: 800 })}
      ${attrs.map((a, i) => `
        ${ln(140, 128 + i * 34, 500, 128 + i * 34, { c: SVGC.line2, sw: 1, op: .5 })}
        ${tx(158, 146 + i * 34, a[0], { s: 11.5, a: "start", c: SVGC.ink2, w: 600 })}
        ${tx(482, 146 + i * 34, a[1], { s: 11.5, a: "end", c: SVGC.ink, w: 700 })}
      `).join("")}
      ${tag(320, 366, "什么都放在目录项里 → 目录项大，查目录慢", { s: 13.5, c: SVGC.bad, stroke: SVGC.bad })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 46, "把属性搬进 inode，目录项只留名字和指针", { s: 17, w: 900 })}
      ${box(36, 92, 250, 234, { fill: "var(--card)", stroke: SVGC.file, sw: 2.2, rx: 12 })}
      ${tx(161, 118, "目录项（变小）", { s: 13.5, c: SVGC.file, w: 800 })}
      ${[0, 1, 2].map(i => `
        ${box(56, 140 + i * 56, 210, 42, { fill: "var(--bg2)", stroke: SVGC.line2, sw: 1.2, rx: 6 })}
        ${tx(74, 161 + i * 56, ["report", "notes", "photo"][i], { s: 11.5, a: "start", c: SVGC.ink, w: 700 })}
        ${tx(246, 161 + i * 56, "→ inode", { s: 9.5, a: "end", c: SVGC.file, w: 600 })}
      `).join("")}
      ${arrow(288, 190, 340, 190, { c: SVGC.file, key: "ink", sw: 2.4 })}
      ${box(346, 92, 254, 234, { fill: "var(--card)", stroke: SVGC.res, sw: 2.2, rx: 14 })}
      ${tx(473, 118, "inode", { s: 15, c: SVGC.res, w: 900 })}
      ${[["大小", "12 KB"], ["时间", "10:02"], ["物理地址", "块 8"], ["权限", "rw-r--"], ["所有者", "user1"]].map((a, i) => `
        ${ln(366, 136 + i * 32, 580, 136 + i * 32, { c: SVGC.line2, sw: 1, op: .45 })}
        ${tx(382, 153 + i * 32, a[0], { s: 10.5, a: "start", c: SVGC.ink2, w: 600 })}
        ${tx(564, 153 + i * 32, a[1], { s: 10.5, a: "end", c: SVGC.ink, w: 700 })}
      `).join("")}
      ${tag(320, 366, "目录项只留文件名 + 指向 inode 的信息", { s: 13, c: SVGC.file, stroke: SVGC.file })}`;
  }
  return `
    ${tx(320, 52, "为什么要拆出 inode？", { s: 19, w: 900 })}
    ${box(50, 100, 230, 190, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 15 })}
    ${tx(165, 132, "不拆", { s: 17, c: SVGC.bad, w: 900 })}
    ${tlines(165, 184, ["目录项很大", "目录里放不下多少项", "查目录慢"], { s: 12.5, c: SVGC.ink2, w: 600, lh: 26 })}
    ${box(360, 100, 230, 190, { fill: "var(--card)", stroke: SVGC.ok, sw: 2.2, rx: 15 })}
    ${tx(475, 132, "拆出 inode", { s: 17, c: SVGC.ok, w: 900 })}
    ${tlines(475, 184, ["目录项变小", "目录项更紧凑", "查目录更快"], { s: 12.5, c: SVGC.ink2, w: 600, lh: 26 })}
    ${arrow(286, 195, 354, 195, { c: SVGC.ok, key: "green", sw: 2.8 })}
    ${tag(320, 338, "目录项 = 文件名 + 指向 inode / FCB 的信息", { s: 13.5, c: SVGC.file, stroke: SVGC.file })}`;
}

function fatDiagram(stage) {
  const rows = [["0", "—"], ["1", "—"], ["2", "5"], ["3", "—"], ["4", "9"], ["5", "9"], ["6", "—"], ["7", "—"], ["8", "—"], ["9", "END"]];
  const chain = ["2", "5", "9"];
  return `
    ${tx(320, 46, "FAT：整张表放在内存", { s: 19, c: SVGC.file, w: 900 })}
    ${box(54, 92, 150, 92, { fill: "var(--card)", stroke: SVGC.file, sw: 2.2, rx: 10 })}
    ${tx(129, 118, "目录项", { s: 12.5, c: SVGC.file, w: 800 })}
    ${tx(129, 144, "文件名 A", { s: 11, c: SVGC.ink, w: 700 })}
    ${tx(129, 166, "首块 = 2", { s: 11, c: SVGC.bad, w: 800 })}
    ${arrow(208, 150, 252, 150, { c: SVGC.file, key: "ink", sw: 2.2 })}
    ${box(258, 82, 288, 250, { fill: "var(--card)", stroke: SVGC.file, sw: 2.2, rx: 12 })}
    ${tx(402, 106, "FAT 表（内存）", { s: 13, c: SVGC.file, w: 800 })}
    ${tx(330, 128, "块号", { s: 10.5, c: SVGC.ink2, w: 700 })}
    ${tx(474, 128, "下一块", { s: 10.5, c: SVGC.ink2, w: 700 })}
    ${ln(274, 140, 530, 140, { c: SVGC.line2, sw: 1 })}
    ${rows.map((r, i) => {
      const on = stage >= 2 && chain.includes(r[0]);
      const y = 156 + i * 16;
      return `${on ? `<rect x="270" y="${y - 8}" width="258" height="16" fill="${SVGC.ok}" opacity=".13"/>` : ""}${tx(330, y, r[0], { s: 10.5, c: on ? SVGC.ok : SVGC.ink2, w: on ? 800 : 600 })}${tx(474, y, r[1], { s: 10.5, c: on ? SVGC.ok : SVGC.ink2, w: on ? 800 : 600 })}`;
    }).join("")}
    ${stage >= 2 ? `
      ${arrow(129, 190, 129, 250, { c: SVGC.ok, key: "green", sw: 2.2 })}
      ${tag(200, 270, "2 → 5 → 9 → END", { s: 14, c: SVGC.ok, stroke: SVGC.ok })}
      ${tag(390, 352, "顺着 FAT 一项一项找，就能得到块之间的链接信息", { s: 13, c: SVGC.file, stroke: SVGC.file })}
    ` : tag(390, 352, "每项记录“某一块的下一块”", { s: 13.5, c: SVGC.file, stroke: SVGC.file })}`;
}

function sharingDiagram(stage) {
  const cx = 320, cy = 190;
  if (stage === 4) {
    return `
      ${tx(320, 52, "共享文件的互斥规则", { s: 19, w: 900 })}
      ${box(70, 100, 500, 70, { fill: "var(--card)", stroke: SVGC.ok, sw: 2.2, rx: 12 })}
      ${mark(102, 135, true, { r: 12 })}
      ${tx(124, 135, "多个读者可以同时读", { s: 14, a: "start", c: SVGC.ok, w: 700 })}
      ${box(70, 190, 500, 70, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 12, dash: "6 4" })}
      ${mark(102, 225, false, { r: 12 })}
      ${tx(124, 225, "读者和写者不能同时", { s: 14, a: "start", c: SVGC.bad, w: 700 })}
      ${box(70, 280, 500, 70, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 12, dash: "6 4" })}
      ${mark(102, 315, false, { r: 12 })}
      ${tx(124, 315, "多个写者也不能同时", { s: 14, a: "start", c: SVGC.bad, w: 700 })}
      ${tag(320, 380, "读写冲突要用互斥保证", { s: 14, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  const file = (x, y, label) => `
    <g class="pop">
      <path d="M${x - 42},${y - 38} H${x + 20} L${x + 42},${y - 16} V${y + 38} H${x - 42} Z" fill="var(--card)" stroke="${SVGC.file}" stroke-width="2.4"/>
      <path d="M${x + 20},${y - 38} V${y - 16} H${x + 42}" fill="none" stroke="${SVGC.file}" stroke-width="2"/>
      ${tx(x, y + 12, label, { s: 11, c: SVGC.file, w: 800 })}
    </g>`;
  const pos = [
    { x: 130, y: 120 }, { x: 130, y: 280 }, { x: 510, y: 120 }, { x: 510, y: 280 }
  ];
  let users;
  if (stage === 1) {
    users = pos.map((p, i) => ({ ...p, label: `读者 ${i + 1}`, c: SVGC.proc, kind: "read" }));
  } else if (stage === 2) {
    users = [
      { ...pos[0], label: "读者 1", c: SVGC.proc, kind: "read" },
      { ...pos[1], label: "读者 2", c: SVGC.proc, kind: "read" },
      { ...pos[2], label: "读者 3", c: SVGC.proc, kind: "read" },
      { ...pos[3], label: "写者", c: SVGC.bad, kind: "write" }
    ];
  } else {
    users = [
      { ...pos[0], label: "写者 1", c: SVGC.bad, kind: "write" },
      { ...pos[1], label: "写者 2", c: SVGC.bad, kind: "write" },
      { ...pos[2], label: "写者 3", c: SVGC.bad, kind: "write" }
    ];
  }
  return `
    ${tx(320, 48, stage === 1 ? "共享文件：多个读者同时读" : stage === 2 ? "读者 + 写者：不能同时" : "多个写者：也不能同时", { s: 18, c: stage === 1 ? SVGC.ok : SVGC.bad, w: 900 })}
    ${file(cx, cy, "共享文件")}
    ${users.map(u => {
      const left = u.x < cx;
      const startX = u.x + (left ? 58 : -58);
      const endX = cx + (left ? -50 : 50);
      const endY = cy + (u.y < cy ? -22 : 22);
      const bad = u.kind === "write";
      return `<g>
        ${pillNode(u.x - 58, u.y - 22, 116, 44, u.label, u.c, { fs: 11.5 })}
        ${arrow(startX, u.y, endX, endY, { c: bad ? SVGC.bad : SVGC.ok, key: bad ? "red" : "green", sw: 2.2, dash: "5 3" })}
      </g>`;
    }).join("")}
    ${stage === 1 ? mark(320, 320, true, { r: 16 }) : ""}
    ${stage === 1 ? tag(320, 360, "允许多个用户同时读", { s: 14, c: SVGC.ok, stroke: SVGC.ok }) : ""}
    ${stage === 2 ? `
      ${mark(320, 318, false, { r: 16 })}
      ${tag(320, 360, "读者和写者不能同时使用", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}
    ` : ""}
    ${stage === 3 ? `
      ${mark(320, 318, false, { r: 16 })}
      ${tag(320, 360, "多个写者也不能同时使用", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}
    ` : ""}`;
}

const CARD5_ANIMS = [
  {
    id: "p5a1", no: "5.1", title: "逻辑结构：流式 vs 记录式",
    frames: [
      FR("流式文件：无结构，就是一串字节。", logicalFile(1)),
      FR("记录式文件：有结构，由一条条记录组成。", logicalFile(2)),
      FR("逻辑结构的目标：检索速度快；增删改方便；节省存储空间。", logicalFile(3), 4200)
    ]
  },
  {
    id: "p5a2", no: "5.2", title: "物理结构：连续、链接、索引",
    frames: [
      FR("连续：访问快，支持直接存取，有外部碎片，需预知大小。", physicalFile(1), 4200),
      FR("链接：块之间用指针串起来，不要求连续。", physicalFile(2), 4200),
      FR("索引：索引块里放指针，便于随机访问。", physicalFile(3), 4200),
      FR("三种一起记：连续快但碎，链接慢但灵活，索引兼顾随机。", physicalFile(4), 4200)
    ]
  },
  {
    id: "p5a3", no: "5.3", title: "目录：单级 → 两级 → 多级树",
    frames: [
      FR("单级目录：所有文件放一起，重名冲突。", directoryDiagram(1)),
      FR("两级目录：主目录项 = 用户名 + 指向该用户文件目录的指针。", directoryDiagram(2), 4200),
      FR("多级树形：同一目录下不能重名，不同目录可以同名。", directoryDiagram(3), 4200)
    ]
  },
  {
    id: "p5a4", no: "5.4", title: "FCB 与 inode：目录项为什么变小",
    frames: [
      FR("目录项里塞满文件属性，目录很大，查目录慢。", inodeDiagram(1)),
      FR("把其他属性放进 inode，目录项只留文件名 + 指向 inode 的信息。", inodeDiagram(2), 4200),
      FR("目录项更小，查目录更快。", inodeDiagram(3), 3800)
    ]
  },
  {
    id: "p5a5", no: "5.5", title: "FAT：顺着表就能找到下一块",
    frames: [
      FR("文件的第一块地址存放在目录项中；整张 FAT 在内存。", fatDiagram(1)),
      FR("每项记录“某一块的下一块”，顺着 2 → 5 → 9 找下去。", fatDiagram(2), 4200),
      FR("所以通过 FAT 可以直接得到块之间的链接信息。", fatDiagram(3), 3800)
    ]
  },
  {
    id: "p5a6", no: "5.6", title: "共享文件：谁能同时用",
    frames: [
      FR("允许多个用户同时读。", sharingDiagram(1), 3600),
      FR("读者和写者不能同时。", sharingDiagram(2), 3800),
      FR("多个写者也不能同时。", sharingDiagram(3), 3800),
      FR("读写冲突要用互斥保证。", sharingDiagram(4), 4000)
    ]
  }
];

const CARD5 = {
  id: "p5", num: "⑤", short: "文件", kicker: "逻辑结构 · 物理结构 · 目录 · FAT",
  title: "文件管理",
  color: "var(--c-file)",
  intro: "文件这张的选择题很细：连续支不支持直接存取、FAT 能直接得到什么、主目录项里有什么。把三种物理结构和目录演变看一遍，比死背定义稳。",
  chips: ["流式 / 记录式", "连续 / 链接 / 索引", "单级 / 两级 / 多级", "FCB / inode", "FAT", "共享"],
  anims: CARD5_ANIMS,
  compare: {
    cols: [
      {
        name: "连续", color: "var(--c-ok)", shape: "square", tag: "块挨着块",
        points: ["访问快", "支持直接存取", "有外部碎片", "需预知文件大小"]
      },
      {
        name: "链接", color: "var(--c-thread)", shape: "pill", tag: "指针串起来",
        points: ["块之间用指针连接", "通过指针找下一块", "慢但灵活"]
      },
      {
        name: "索引", color: "var(--c-res)", shape: "page", tag: "索引块放指针",
        points: ["便于随机访问", "先查索引块，再找数据块"]
      }
    ],
    facts: [
      { ok: true, text: "连续组织方式访问速度快，但需要预知文件长度" },
      { ok: false, text: "连续组织方式不支持直接存取" },
      { ok: true, text: "FAT 每项记录某一块的下一块，整张表在内存" },
      { ok: true, text: "通过 FAT 可以直接得到块之间的链接信息" },
      { ok: false, text: "FAT 表里存的是每个文件的权限" },
      { ok: true, text: "同一目录下不能重名，不同目录可以同名" }
    ]
  },
  mnemonic: "连续快但碎，链接慢但灵活，索引兼顾随机。",
  mnNote: "两点常考：FAT 得到的是“块之间的链接信息”；连续方式支持直接存取。",
  quiz: ["q32", "q33", "q34", "q35", "q36"]
};

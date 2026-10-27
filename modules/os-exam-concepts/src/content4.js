/* ============================================================
   卡⑥ OS 概述 + 题库 + 注册
   ============================================================ */

/* ---------------- 6.1 四大特征 ---------------- */
function featuresDiagram(stage) {
  if (stage === 1) {
    const p1 = [[90, 70], [220, 70], [360, 70]];
    const p2 = [[150, 92], [290, 92], [440, 92]];
    return `
      ${tx(320, 40, "并发：同一时间间隔内交替执行", { s: 18, w: 900 })}
      ${box(300, 62, 96, 40, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2.2, rx: 8, op: .12 })}
      ${tx(348, 82, "1 个 CPU", { s: 11.5, c: SVGC.cpu, w: 800 })}
      ${box(60, 148, 520, 68, { fill: "var(--bg2)", stroke: SVGC.line2, sw: 1.6, rx: 8 })}
      ${p1.map(([x, w], i) => `<rect x="${x}" y="158" width="${w}" height="22" rx="4" fill="${SVGC.proc}" opacity=".8" class="pop"/>`).join("")}
      ${p2.map(([x, w], i) => `<rect x="${x}" y="186" width="${w}" height="22" rx="4" fill="${SVGC.thread}" opacity=".8" class="pop"/>`).join("")}
      ${tx(46, 170, "P1", { s: 11, a: "end", c: SVGC.proc, w: 800 })}
      ${tx(46, 198, "P2", { s: 11, a: "end", c: SVGC.thread, w: 800 })}
      ${ln(60, 134, 580, 134, { c: SVGC.warn, sw: 1.6 })}
      ${ln(60, 128, 60, 140, { c: SVGC.warn, sw: 1.6 })}
      ${ln(580, 128, 580, 140, { c: SVGC.warn, sw: 1.6 })}
      ${tag(320, 124, "同一时间间隔", { s: 11.5, c: SVGC.warn, stroke: SVGC.warn })}
      ${tag(320, 268, "两个程序交替占用 CPU：这是并发，不是并行", { s: 13, c: SVGC.proc, stroke: SVGC.proc })}
      ${tag(320, 310, "并发强调“同一时间间隔内”发生", { s: 12, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 40, "并行：同一时刻，多个程序同时执行", { s: 18, w: 900 })}
      ${box(238, 62, 76, 38, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2, rx: 7, op: .12 })}
      ${tx(276, 81, "CPU 1", { s: 10.5, c: SVGC.cpu, w: 800 })}
      ${box(326, 62, 76, 38, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2, rx: 7, op: .12 })}
      ${tx(364, 81, "CPU 2", { s: 10.5, c: SVGC.cpu, w: 800 })}
      ${box(60, 148, 520, 48, { fill: "var(--bg2)", stroke: SVGC.line2, sw: 1.6, rx: 8 })}
      ${box(60, 210, 520, 48, { fill: "var(--bg2)", stroke: SVGC.line2, sw: 1.6, rx: 8 })}
      <rect x="78" y="158" width="484" height="28" rx="4" fill="${SVGC.proc}" opacity=".8"/>
      <rect x="78" y="220" width="484" height="28" rx="4" fill="${SVGC.thread}" opacity=".8"/>
      ${tx(46, 172, "P1", { s: 11, a: "end", c: SVGC.proc, w: 800 })}
      ${tx(46, 234, "P2", { s: 11, a: "end", c: SVGC.thread, w: 800 })}
      ${ln(320, 116, 320, 290, { c: SVGC.bad, sw: 1.8, dash: "5 4" })}
      ${tag(320, 120, "同一时刻", { s: 12, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 312, "两个程序在同一时刻都在运行 → 并行", { s: 13.5, c: SVGC.thread, stroke: SVGC.thread })}
      ${tag(320, 352, "并行需要多个处理器；并发只需要一个 CPU 交替", { s: 12, c: SVGC.ink2 })}`;
  }
  if (stage === 3) {
    return `
      ${tx(320, 52, "操作系统的四大特征", { s: 20, w: 900 })}
      <circle cx="320" cy="200" r="74" fill="${SVGC.warn}" opacity=".08" stroke="${SVGC.warn}" stroke-width="2"/>
      ${tx(320, 188, "OS", { s: 22, c: SVGC.warn, w: 900 })}
      ${tx(320, 216, "四大特征", { s: 12, c: SVGC.ink2, w: 700 })}
      ${[
        { x: 112, y: 108, t: "并发", c: SVGC.proc },
        { x: 528, y: 108, t: "共享", c: SVGC.thread },
        { x: 112, y: 292, t: "虚拟", c: SVGC.res },
        { x: 528, y: 292, t: "异步", c: SVGC.file }
      ].map((it, i) => `
        <g class="pop" style="animation-delay:${i * .08}s">
          ${box(it.x - 62, it.y - 32, 124, 64, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 14 })}
          ${tx(it.x, it.y, it.t, { s: 19, c: it.c, w: 900 })}
          ${arrow(it.x + (it.x < 320 ? 64 : -64), it.y, 320 + (it.x < 320 ? -78 : 78), 200, { c: it.c, key: "ink", sw: 1.6, dash: "4 4" })}
        </g>`).join("")}
      ${tag(320, 350, "并发、共享、虚拟、异步", { s: 14, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  return `
    ${tx(320, 52, "并发和共享互为存在条件", { s: 19, w: 900 })}
    <circle cx="220" cy="196" r="72" fill="${SVGC.proc}" opacity=".1" stroke="${SVGC.proc}" stroke-width="2.6"/>
    ${tx(220, 196, "并发", { s: 25, c: SVGC.proc, w: 900 })}
    <circle cx="420" cy="196" r="72" fill="${SVGC.thread}" opacity=".1" stroke="${SVGC.thread}" stroke-width="2.6"/>
    ${tx(420, 196, "共享", { s: 25, c: SVGC.thread, w: 900 })}
    ${arrow(296, 176, 344, 176, { c: SVGC.warn, key: "amber", sw: 3 })}
    ${arrow(344, 216, 296, 216, { c: SVGC.warn, key: "amber", sw: 3 })}
    ${tag(320, 196, "互为条件", { s: 11.5, c: SVGC.warn, stroke: SVGC.warn })}
    ${tag(320, 320, "没有并发，就谈不上共享；没有共享，并发也没有意义", { s: 13, c: SVGC.ink2 })}
    ${tag(320, 360, "并行是同一时刻；并发是同一时间间隔", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}`;
}

/* ---------------- 6.2 三种系统 ---------------- */
function osTypes(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 44, "批处理系统：追求吞吐量", { s: 18, c: SVGC.proc, w: 900 })}
      ${[0, 1, 2].map(i => `
        <g class="pop" style="animation-delay:${i * .07}s">
          ${box(34, 84 + i * 78, 212, 62, { fill: "var(--card)", stroke: SVGC.proc, sw: 1.8, rx: 9 })}
          ${tx(54, 106 + i * 78, `作业 ${i + 1}`, { s: 12.5, a: "start", c: SVGC.proc, w: 800 })}
          ${tx(54, 128 + i * 78, "作业控制信息", { s: 10.5, a: "start", c: SVGC.ink2, w: 600 })}
        </g>`).join("")}
      ${arrow(250, 200, 356, 200, { c: SVGC.proc, key: "darkblue", sw: 2.8 })}
      ${box(362, 146, 132, 108, { fill: "var(--card)", stroke: SVGC.cpu, sw: 2.4, rx: 12 })}
      ${tx(428, 180, "批处理", { s: 15, c: SVGC.cpu, w: 900 })}
      ${tx(428, 208, "逐个执行", { s: 11, c: SVGC.ink2, w: 600 })}
      ${arrow(498, 200, 556, 200, { c: SVGC.ok, key: "green", sw: 2.6 })}
      ${tx(590, 200, "吞吐量", { s: 12, c: SVGC.ok, w: 800 })}
      ${tag(320, 300, "作业必须带作业控制信息，系统按批处理", { s: 13, c: SVGC.proc, stroke: SVGC.proc })}
      ${tag(320, 342, "目标：单位时间内完成更多作业", { s: 12, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${tx(320, 44, "分时系统：按时间片轮流", { s: 18, c: SVGC.thread, w: 900 })}
      <circle cx="320" cy="194" r="76" fill="${SVGC.thread}" opacity=".08" stroke="${SVGC.thread}" stroke-width="2.4"/>
      ${tx(320, 174, "CPU", { s: 18, c: SVGC.thread, w: 900 })}
      ${tx(320, 202, "时间片轮流", { s: 10.5, c: SVGC.ink2, w: 600 })}
      ${[
        { x: 130, y: 104, t: "用户 1" },
        { x: 510, y: 104, t: "用户 2" },
        { x: 130, y: 284, t: "用户 3" },
        { x: 510, y: 284, t: "用户 4" }
      ].map((u, i) => `
        <g class="pop" style="animation-delay:${i * .06}s">
          ${pillNode(u.x - 50, u.y - 20, 100, 40, u.t, SVGC.thread, { fs: 11 })}
          ${arrow(u.x + (i % 2 === 0 ? 50 : -50), u.y, 320 + (i % 2 === 0 ? -58 : 58), 194 + (i < 2 ? -38 : 38), { c: SVGC.thread, key: "teal", sw: 1.8, dash: "4 4" })}
        </g>`).join("")}
      ${tag(320, 342, "时间片一到就换人：用户越多，轮一圈越久，响应越慢", { s: 12.5, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 380, "分时系统中，用户不是独占计算机", { s: 13, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  if (stage === 3) {
    return `
      ${tx(320, 44, "实时系统：及时性和可靠性", { s: 18, c: SVGC.bad, w: 900 })}
      <rect x="80" y="150" width="480" height="44" rx="6" fill="var(--bg2)" stroke="${SVGC.line2}"/>
      <rect x="96" y="158" width="250" height="28" rx="4" fill="${SVGC.run}" opacity=".85"/>
      ${tx(220, 173, "任务必须在截止前完成", { s: 11, c: "#fff", w: 800 })}
      <line x1="430" y1="128" x2="430" y2="216" stroke="${SVGC.bad}" stroke-width="3" stroke-dasharray="6 4"/>
      ${tx(430, 116, "截止时间", { s: 11.5, c: SVGC.bad, w: 800 })}
      ${mark(346, 172, true, { r: 13 })}
      ${tag(320, 250, "响应时间要求比分时严格得多", { s: 15, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 296, "目标：及时 + 可靠，错过截止就可能出问题", { s: 12.5, c: SVGC.ink2 })}
      ${tag(320, 338, "分时追求交互，实时追求“必须按时”", { s: 12.5, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  return `
    ${tx(320, 44, "三种系统对比", { s: 19, w: 900 })}
    ${[
      { x: 18, t: "批处理", c: SVGC.proc, rows: ["追求吞吐量", "作业带作业控制信息", "交互性弱"] },
      { x: 220, t: "分时", c: SVGC.thread, rows: ["交互性强", "按时间片轮流", "用户越多响应越慢", "用户不是独占"] },
      { x: 422, t: "实时", c: SVGC.bad, rows: ["及时性、可靠性", "响应要求比分时更严", "错过截止可能出问题"] }
    ].map(col => `
      <g class="pop">
        ${box(col.x, 82, 190, 244, { fill: "var(--card)", stroke: col.c, sw: 2.2, rx: 14 })}
        ${tx(col.x + 95, 116, col.t, { s: 18, c: col.c, w: 900 })}
        ${tlines(col.x + 95, 164, col.rows, { s: 11.5, c: SVGC.ink2, w: 600, lh: 30 })}
      </g>`).join("")}
    ${tag(320, 360, "分时不是独占；实时比分时的响应要求严格得多", { s: 12.5, c: SVGC.warn, stroke: SVGC.warn })}`;
}

/* ---------------- 6.3 用户态 / 内核态 ---------------- */
function modeDiagram(stage) {
  return `
    ${tx(320, 36, "用户态（目态）与内核态（管态）", { s: 17, w: 900 })}
    ${box(30, 92, 230, 200, { fill: SVGC.user, stroke: SVGC.user, sw: 2.4, rx: 16, op: .07 })}
    ${box(30, 92, 230, 200, { stroke: SVGC.user, sw: 2.4, rx: 16 })}
    ${tx(145, 120, "应用程序", { s: 16, c: SVGC.user, w: 900 })}
    ${tx(145, 144, "运行在目态", { s: 11.5, c: SVGC.ink2, w: 700 })}
    ${tx(48, 180, 'read("file")', { s: 13, a: "start", c: SVGC.ink, w: 700, ff: "Consolas,monospace" })}
    ${tx(48, 208, "普通指令", { s: 10.5, a: "start", c: SVGC.ink2, w: 600 })}
    ${box(380, 92, 230, 200, { fill: SVGC.kernel, stroke: SVGC.kernel, sw: 2.4, rx: 16, op: .07 })}
    ${box(380, 92, 230, 200, { stroke: SVGC.kernel, sw: 2.4, rx: 16 })}
    ${tx(495, 120, "操作系统内核", { s: 16, c: SVGC.kernel, w: 900 })}
    ${tx(495, 144, "运行在管态", { s: 11.5, c: SVGC.ink2, w: 700 })}
    ${stage === 3 ? `
      ${box(400, 166, 190, 38, { fill: "var(--card)", stroke: SVGC.kernel, sw: 1.6, rx: 7 })}
      ${tx(495, 185, "置程序状态字", { s: 12, c: SVGC.kernel, w: 800 })}
      ${box(400, 214, 190, 38, { fill: "var(--card)", stroke: SVGC.kernel, sw: 1.6, rx: 7 })}
      ${tx(495, 233, "特权指令", { s: 12, c: SVGC.kernel, w: 800 })}
    ` : `
      ${tx(495, 196, "执行特权操作", { s: 12.5, c: SVGC.kernel, w: 700 })}
    `}
    ${stage === 4
      ? arrow(376, 222, 264, 222, { c: SVGC.ok, key: "green", sw: 3 })
      : arrow(264, 192, 376, 192, { c: SVGC.warn, key: "amber", sw: 3 })}
    ${tag(320, stage === 4 ? 200 : 168, stage === 4 ? "返回目态" : "系统调用（陷入）", { s: 11.5, c: stage === 4 ? SVGC.ok : SVGC.warn, stroke: stage === 4 ? SVGC.ok : SVGC.warn })}
    ${stage === 1 ? tag(320, 330, "应用程序要读文件 → 发出系统调用（陷入）", { s: 13, c: SVGC.user, stroke: SVGC.user }) : ""}
    ${stage === 2 ? `
      ${tag(320, 320, "CPU 从目态切换到管态", { s: 14, c: SVGC.kernel, stroke: SVGC.kernel })}
      ${arrow(272, 350, 368, 350, { c: SVGC.kernel, key: "red", sw: 2.6 })}
      ${tag(320, 378, "目态 ——→ 管态", { s: 12, c: SVGC.ink2 })}
    ` : ""}
    ${stage === 3 ? `
      ${mark(145, 250, false, { r: 13 })}
      ${tag(145, 286, "目态不能执行", { s: 12, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 330, "置程序状态字等是特权指令，只能在管态执行", { s: 13, c: SVGC.kernel, stroke: SVGC.kernel })}
      ${tag(320, 370, "CPU 在执行 OS 代码时处于管态", { s: 13.5, c: SVGC.warn, stroke: SVGC.warn })}
    ` : ""}
    ${stage === 4 ? tag(320, 330, "OS 完成特权操作后返回目态", { s: 13, c: SVGC.ok, stroke: SVGC.ok }) : ""}`;
}

const CARD6_ANIMS = [
  {
    id: "p6a1", no: "6.1", title: "并发 vs 并行，四大特征",
    frames: [
      FR("并发：同一时间间隔内，多个程序交替执行。", featuresDiagram(1)),
      FR("并行：同一时刻，多个程序同时执行。", featuresDiagram(2)),
      FR("四大特征：并发、共享、虚拟、异步。", featuresDiagram(3)),
      FR("并发和共享互为存在条件。", featuresDiagram(4), 3800)
    ]
  },
  {
    id: "p6a2", no: "6.2", title: "批处理、分时、实时",
    frames: [
      FR("批处理：追求吞吐量，作业必须带作业控制信息。", osTypes(1)),
      FR("分时：按时间片轮流；用户越多响应越慢，用户不是独占计算机。", osTypes(2), 4200),
      FR("实时：及时性和可靠性，响应时间要求比分时严格得多。", osTypes(3), 4200),
      FR("三种系统放在一起对比。", osTypes(4), 4000)
    ]
  },
  {
    id: "p6a3", no: "6.3", title: "系统调用：目态 → 管态 → 目态",
    frames: [
      FR("应用程序要读文件，发出系统调用（陷入）。", modeDiagram(1)),
      FR("CPU 从目态切换到管态。", modeDiagram(2)),
      FR("置程序状态字等是特权指令，只能在管态执行；CPU 执行 OS 代码时处于管态。", modeDiagram(3), 4400),
      FR("OS 完成操作，返回目态。", modeDiagram(4), 3800)
    ]
  }
];

const CARD6 = {
  id: "p6", num: "⑥", short: "OS 概述", kicker: "并发共享 · 三种系统 · 目态管态",
  title: "操作系统概述",
  color: "var(--c-warn)",
  intro: "这一张是“送分概念”：并发和并行的区别、三种系统的目标、系统调用导致目态→管态。把这几句话记准，选择判断不丢分。",
  chips: ["四大特征", "并发 vs 并行", "批处理 / 分时 / 实时", "目态 / 管态", "系统调用"],
  anims: CARD6_ANIMS,
  compare: {
    cols: [
      {
        name: "并发", color: "var(--c-proc)", shape: "circle", tag: "同一时间间隔",
        points: ["同一时间间隔内发生", "多个程序交替执行", "一个 CPU 也能并发", "和共享互为存在条件"]
      },
      {
        name: "并行", color: "var(--c-thread)", shape: "pill", tag: "同一时刻",
        points: ["同一时刻同时执行", "需要多个处理器", "强调“同时”", "不是并发"]
      }
    ],
    facts: [
      { ok: true, text: "并发是同一时间间隔内发生，并行是同一时刻发生" },
      { ok: false, text: "单 CPU 上也可以实现真正的并行" },
      { ok: true, text: "并发和共享互为存在条件" },
      { ok: false, text: "分时系统中，用户独占整台计算机" },
      { ok: true, text: "分时系统中时间片一定，用户越多响应时间越长" },
      { ok: true, text: "实时系统的响应时间要求比分时系统严格得多" }
    ]
  },
  mnemonic: "系统调用进管态，应用程序跑目态。",
  mnNote: "并发是同一时间间隔，并行是同一时刻；分时用户越多越慢。",
  quiz: ["c6a", "c6b", "c6c", "c6d", "q16"]
};

/* ============================================================
   题库：36 题（按原文编号）
   ============================================================ */
const ALLQ = [
  {
    id: "q1", src: "进程/线程", anim: "p1a3",
    q: "引入线程后，拥有资源的独立单位仍是什么？",
    opts: ["进程", "线程", "程序", "CPU"], a: 0,
    why: "线程只是进程内的执行流；引入线程后，进程仍是拥有资源的独立单位。"
  },
  {
    id: "q2", src: "进程/线程", anim: "p1a3",
    q: "下列不是进程特性的是：",
    opts: ["动态性", "并发性", "异步性", "静态性"], a: 3,
    why: "进程的特性是动态性、并发性、独立性、异步性，没有静态性。"
  },
  {
    id: "q3", src: "进程/线程", anim: "p1a1",
    q: "进程申请 CPU 得不到满足时，状态变为？",
    opts: ["就绪", "阻塞", "运行", "终止"], a: 0,
    why: "等 CPU 是就绪；阻塞是在等 I/O 或资源等事件。"
  },
  {
    id: "q4", src: "进程/线程", anim: "p1a1",
    q: "一次打印输出结束后，请求打印的进程状态变化？",
    opts: ["阻塞 → 就绪", "就绪 → 运行", "运行 → 阻塞", "阻塞 → 运行"], a: 0,
    why: "打印完成属于 I/O 完成，阻塞 → 就绪；阻塞不能直接变成运行。"
  },
  {
    id: "q5", src: "进程/线程", anim: "p1a2",
    q: "判断：只有处于阻塞状态的进程才能被挂起。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "就绪和阻塞都可以挂起，分别变成静止就绪、静止阻塞。"
  },
  {
    id: "q6", src: "进程/线程", anim: "p1a3",
    q: "判断：每个线程有自己独立的地址空间。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "同一进程的线程共享所属进程的地址空间，各有自己的栈和寄存器。"
  },
  {
    id: "q7", src: "进程/线程", anim: "p1a4",
    q: "原语的特点？",
    opts: ["由若干条指令组成，执行过程中不可被中断", "只包含一条指令", "只能在用户态执行", "可以被任意中断"], a: 0,
    why: "原语由若干条指令组成，执行时不可被中断，所以会屏蔽中断。"
  },
  {
    id: "q8", src: "死锁", anim: "p2a4",
    q: "7 台打印机，每进程最多 2 台，最多几个进程不会死锁？",
    opts: ["5", "6", "7", "8"], a: 1,
    why: "N×(2−1)+1≤7，N≤6；6 个进程各占 1 台还剩 1 台，必有一个能拿第 2 台跑完。"
  },
  {
    id: "q9", src: "死锁", anim: "p2a4",
    q: "19 台打印机，每进程共需 4 台，N 最多是多少？",
    opts: ["5", "6", "7", "8"], a: 1,
    why: "3N+1≤19，N≤6。"
  },
  {
    id: "q10", src: "死锁", anim: "p2a3",
    q: "预先分配资源破坏哪个必要条件？",
    opts: ["互斥", "请求和保持", "不可剥夺", "环路等待"], a: 1,
    why: "一次性申请全部资源，破坏“请求和保持”（也叫请求并保持）。"
  },
  {
    id: "q11", src: "死锁", anim: "p2a1",
    q: "判断：死锁一定导致整个系统崩溃。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "死锁只是相关进程卡住，不是所有进程都停，更不等于系统崩溃。"
  },
  {
    id: "q12", src: "死锁", anim: "p2a2",
    q: "死锁的充分条件？",
    opts: ["资源分配图不可完全简化", "资源分配图有环", "系统处于不安全状态", "有进程被阻塞"], a: 0,
    why: "资源分配图不可完全简化时死锁；原文用“当且仅当”表述这个条件。"
  },
  {
    id: "q13", src: "调度/同步", anim: null,
    q: "信号量初值 4、当前值 1，可用资源数和等待进程数分别是？",
    opts: ["1 和 0", "3 和 0", "1 和 3", "0 和 1"], a: 0,
    why: "当前值 1 表示还有 1 个可用资源；值为正，没有进程在等待。"
  },
  {
    id: "q14", src: "调度/同步", anim: null,
    q: "6 个进程共享互斥段，最多 2 个同时进入，信号量变化范围？",
    opts: ["[−4, 2]", "[−6, 2]", "[0, 2]", "[−4, 6]"], a: 0,
    why: "初值 2；最多 6 个进程申请，最坏降到 2−6=−4，所以范围是 [−4, 2]。"
  },
  {
    id: "q15", src: "调度/同步", anim: null,
    q: "10 个就绪进程、时间片 200ms、切换 10ms，最坏等待约？",
    opts: ["1800ms", "1900ms", "2000ms", "2100ms"], a: 1,
    why: "前面 9 个进程各用 200ms 加切换 10ms，9×210=1890ms，约 1900ms。"
  },
  {
    id: "q16", src: "调度/同步", anim: "p6a2",
    q: "判断：分时系统中，时间片一定，用户越多响应时间越长。",
    opts: ["✓ 正确", "✗ 错误"], a: 0,
    why: "用户越多，每个用户轮到的时间片间隔越长，响应越慢。"
  },
  {
    id: "q17", src: "调度/同步", anim: null,
    q: "判断：响应比高者优先解决了长作业死等的问题。",
    opts: ["✓ 正确", "✗ 错误"], a: 0,
    why: "长作业等待越久，响应比越高，越容易被选中，不会一直被跳过。"
  },
  {
    id: "q18", src: "调度/同步", anim: null,
    q: "判断：先来先服务算法效率比较高。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "先来先服务按到达顺序执行，短作业可能排在长作业后面等很久，效率并不高。"
  },
  {
    id: "q19", src: "调度/同步", anim: null,
    q: "下列不会引起饥饿的是：",
    opts: ["短寻道优先", "静态优先权", "短作业优先", "时间片轮转"], a: 3,
    why: "时间片轮转让每个进程轮流获得 CPU，不会长期得不到服务；其余可能让某些进程一直等。"
  },
  {
    id: "q20", src: "调度/同步", anim: null,
    q: "临界区是指？",
    opts: ["进程中访问临界资源的那段代码", "一段共享内存", "一个进程", "一种信号量"], a: 0,
    why: "临界区是进程中访问临界资源的那段代码。"
  },
  {
    id: "q21", src: "内存", anim: "p4a4",
    q: "动态重定位在什么时候进行？",
    opts: ["作业执行过程中", "装入内存时", "编译时", "链接时"], a: 0,
    why: "动态重定位在运行时由硬件把逻辑地址加基址得到物理地址。"
  },
  {
    id: "q22", src: "内存", anim: "p4a1",
    q: "判断：请求页式管理既减少外零头，又减少内零头。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "请求页式只减少外部碎片（外零头），内部碎片（内零头）仍然存在。"
  },
  {
    id: "q23", src: "内存", anim: "p4a3",
    q: "不设快表的页式管理，访问一个数据至少访问几次内存？",
    opts: ["1 次", "2 次", "3 次", "4 次"], a: 1,
    why: "先访问内存中的页表 1 次，再访问数据 1 次，共 2 次。"
  },
  {
    id: "q24", src: "内存", anim: "p4a3",
    q: "页表起始地址存放在哪里？",
    opts: ["页表寄存器", "内存", "磁盘", "快表"], a: 0,
    why: "页表基址放在页表寄存器里，页表本身放在内存。"
  },
  {
    id: "q25", src: "内存", anim: "p4a5",
    q: "缺页中断处理完后，接着执行哪条指令？",
    opts: ["被中断的那条指令", "下一条指令", "程序第一条指令", "任意指令"], a: 0,
    why: "缺页处理完要重新执行被中断的那条指令。"
  },
  {
    id: "q26", src: "内存", anim: "p4a5",
    q: "页表项增加“修改位”，哪个程序会用到？",
    opts: ["选择换出页的程序", "地址变换程序", "编译程序", "用户程序"], a: 0,
    why: "修改位供选择换出页时判断是否要写回磁盘：修改位为 1 才需要写回。"
  },
  {
    id: "q27", src: "内存", anim: "p4a2",
    q: "地址 24 位，其中 8 位段号，每段最大长度？",
    opts: ["2^8 字节", "2^16 字节", "2^24 字节", "2^32 字节"], a: 1,
    why: "24−8=16 位段内地址，最大长度是 2^16 字节。"
  },
  {
    id: "q28", src: "I/O", anim: "p3a2",
    q: "CPU 输出速度远高于打印机，可采用？",
    opts: ["缓冲技术", "SPOOLing", "DMA", "通道"], a: 0,
    why: "缓冲技术用来解决 CPU 与外设速度不匹配。"
  },
  {
    id: "q29", src: "I/O", anim: "p3a1",
    q: "通道实现哪两者之间的信息传输？对 CPU 干预最少的方式是？",
    parts: [
      { label: "① 通道实现（ ）之间的信息传输", opts: ["主存与外设", "CPU 与外设", "CPU 与主存", "外设与外设"], a: 0 },
      { label: "② 对 CPU 干预最少的是（ ）", opts: ["程序直接控制", "中断驱动", "DMA", "通道"], a: 3 }
    ],
    why: "通道实现主存与外设之间的信息传输；通道方式对 CPU 的干预最少。"
  },
  {
    id: "q30", src: "I/O", anim: "p3a3",
    q: "判断：SPOOLing 系统中输出井和输出缓冲区都在硬盘。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "输入/输出缓冲区在内存，输入井和输出井在磁盘。"
  },
  {
    id: "q31", src: "I/O", anim: "p3a5",
    q: "判断：磁盘一次 I/O 的延迟时间在硬件设计时就固定了。",
    opts: ["✓ 正确", "✗ 错误"], a: 1,
    why: "旋转延迟取决于磁头当前位置，一次具体访问并不固定。"
  },
  {
    id: "q32", src: "文件", anim: "p5a5",
    q: "通过 FAT 表可以直接获得的信息？",
    opts: ["块之间的连接信息", "文件的权限", "文件的创建时间", "磁盘总容量"], a: 0,
    why: "FAT 每项记录某一块的下一块，整张表在内存，可直接得到块之间的链接信息。"
  },
  {
    id: "q33", src: "文件", anim: "p5a3",
    q: "允许不同用户的文件同名，且按名存取安全，通常采用？",
    opts: ["单级目录", "两级目录", "多级目录结构", "无目录"], a: 2,
    why: "题目给出的答案是“多级目录结构”；不同目录下可以同名，按名存取更安全。"
  },
  {
    id: "q34", src: "文件", anim: "p5a6",
    q: "允许多个用户同时使用共享文件，下列做法不对的是？",
    opts: ["读者之间可同时使用", "写者之间互斥", "读者和写者同时使用", "读写互斥"], a: 2,
    why: "读者和写者不能同时使用，否则读到的内容可能不一致。"
  },
  {
    id: "q35", src: "文件", anim: "p5a3",
    q: "两级文件目录中，主文件目录项的内容？",
    opts: ["用户名和指向该用户目录文件的指针", "文件名和文件长度", "文件的物理地址", "文件的权限"], a: 0,
    why: "主目录项 = 用户名 + 指向该用户文件目录的指针。"
  },
  {
    id: "q36", src: "文件", anim: "p5a2",
    q: "关于连续组织方式，不正确的是：",
    opts: ["访问速度快", "有外碎片", "需预知文件长度", "不支持直接存取"], a: 3,
    why: "连续组织方式支持直接存取；前三项都是它的特点。"
  }
];

/* 卡⑥ 自编小测：严格来自卡⑥正文，不计入综合自测 36 题 */
const CARD6Q = [
  {
    id: "c6a", src: "OS 概述", anim: "p6a1",
    q: "并发和共享的关系是？",
    opts: ["互为存在条件", "完全无关", "共享以并行为前提", "并发只出现在单道系统"], a: 0,
    why: "并发和共享互为存在条件。"
  },
  {
    id: "c6b", src: "OS 概述", anim: "p6a1",
    q: "并行与并发的区别是？",
    opts: ["并行是同一时刻，并发是同一时间间隔", "两者完全相同", "并发是同一时刻，并行是同一时间间隔", "并行只发生在单 CPU 上"], a: 0,
    why: "并行强调同一时刻同时执行；并发强调同一时间间隔内交替执行。"
  },
  {
    id: "c6c", src: "OS 概述", anim: "p6a2",
    q: "批处理系统最追求的是？",
    opts: ["吞吐量", "交互性", "响应时间", "用户独占"], a: 0,
    why: "批处理系统追求吞吐量，作业必须带作业控制信息。"
  },
  {
    id: "c6d", src: "OS 概述", anim: "p6a3",
    q: "应用程序要读文件，CPU 状态如何变化？",
    opts: ["通过系统调用从目态进入管态", "从管态进入目态", "一直在目态", "一直在管态"], a: 0,
    why: "应用程序发出系统调用（陷入），CPU 从目态切换到管态，由 OS 执行特权操作。"
  }
];

const QMAP = Object.fromEntries(ALLQ.concat(CARD6Q).map(q => [q.id, q]));
const CARDS = [CARD1, CARD2, CARD3, CARD4, CARD5, CARD6];

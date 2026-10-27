/* ============================================================
   内容层：SVG 动画、对比、口诀、题库
   ============================================================ */
"use strict";

const SVGC = {
  ink: "var(--ink)", ink2: "var(--ink2)", muted: "var(--c-muted)",
  card: "var(--card)", stage: "var(--stage)",
  proc: "var(--c-proc)", thread: "var(--c-thread)", res: "var(--c-res)",
  ready: "var(--c-ready)", run: "var(--c-run)", block: "var(--c-block)",
  create: "var(--c-create)", term: "var(--c-term)",
  mem: "var(--c-mem)", seg: "var(--c-seg)", file: "var(--c-file)",
  disk: "var(--c-disk)", cpu: "var(--c-cpu)", buf: "var(--c-buf)",
  user: "var(--c-user)", kernel: "var(--c-kernel)",
  ok: "var(--c-ok)", bad: "var(--c-bad)", warn: "var(--c-warn)",
  accent: "var(--accent)", line2: "var(--line2)"
};

/* ---------- SVG 小工具 ---------- */
function tx(x, y, str, o = {}) {
  const s = o.s === undefined ? 16 : o.s;
  const a = o.a || "middle";
  const c = o.c || SVGC.ink;
  const w = o.w === undefined ? 700 : o.w;
  const op = o.op === undefined ? 1 : o.op;
  const ls = o.ls || 0;
  const ff = o.ff ? ` font-family="${o.ff}"` : "";
  return `<text x="${x}" y="${y}" font-size="${s}" text-anchor="${a}" fill="${c}" font-weight="${w}" opacity="${op}" letter-spacing="${ls}"${ff} dominant-baseline="middle">${str}</text>`;
}
function tlines(x, y, lines, o = {}) {
  const lh = o.lh || 22;
  return lines.map((l, i) => tx(x, y + i * lh, l, o)).join("");
}
function box(x, y, w, h, o = {}) {
  const fill = o.fill === undefined ? "none" : o.fill;
  const stroke = o.stroke === undefined ? SVGC.ink2 : o.stroke;
  const sw = o.sw === undefined ? 2 : o.sw;
  const rx = o.rx === undefined ? 12 : o.rx;
  const op = o.op === undefined ? 1 : o.op;
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : "";
  const cls = o.cls ? ` class="${o.cls}"` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"${dash}${cls}/>`;
}
function ln(x1, y1, x2, y2, o = {}) {
  const c = o.c || SVGC.ink2, sw = o.sw || 2, op = o.op === undefined ? 1 : o.op;
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}" opacity="${op}"${dash} stroke-linecap="round"/>`;
}
function arrow(x1, y1, x2, y2, o = {}) {
  const key = o.key || "ink";
  const c = o.c || SVGC.ink2;
  const sw = o.sw || 2.4;
  const op = o.op === undefined ? 1 : o.op;
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : "";
  const cls = o.cls ? ` class="${o.cls}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}" opacity="${op}"${dash}${cls} stroke-linecap="round" marker-end="url(#ah-${key})"/>`;
}
function parrow(d, o = {}) {
  const key = o.key || "ink";
  const c = o.c || SVGC.ink2;
  const sw = o.sw || 2.4;
  const op = o.op === undefined ? 1 : o.op;
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : "";
  const cls = o.cls ? ` class="${o.cls}"` : "";
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" opacity="${op}"${dash}${cls} stroke-linecap="round" marker-end="url(#ah-${key})"/>`;
}
function textWidth(str, size) {
  let w = 0;
  for (const ch of String(str)) {
    w += /[⺀-鿿＀-￯]/.test(ch) ? size : size * 0.6;
  }
  return w;
}
function tag(x, y, text, o = {}) {
  const s = o.s || 12.5;
  const w = textWidth(text, s) + 16;
  const h = s + 11;
  const fill = o.fill || "var(--card)";
  const stroke = o.stroke || SVGC.muted;
  const c = o.c || SVGC.ink;
  return `<g class="fade"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1" opacity=".97"/>${tx(x, y + 1, text, { s, c, w: 700 })}</g>`;
}
function mark(x, y, ok, o = {}) {
  const r = o.r || 12;
  const c = o.c || (ok ? SVGC.ok : SVGC.bad);
  return `<g class="pop"><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>${tx(x, y + 1, ok ? "✓" : "✗", { s: r + 2, c: "#fff", w: 900 })}</g>`;
}
function stateNode(x, y, r, label, color, o = {}) {
  const active = !!o.active;
  const dashed = !!o.dashed;
  const sub = o.sub || "";
  const fs = o.fs || (r >= 48 ? 19 : r >= 42 ? 17 : 13);
  return `<g class="${active ? "pop" : ""}">
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${active ? 0.18 : 0.07}"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${active ? 4 : 2.6}" ${dashed ? 'stroke-dasharray="7 6"' : ""}/>
    ${tx(x, y - (sub ? 7 : 0), label, { s: fs, c: color, w: 800 })}
    ${sub ? tx(x, y + 19, sub, { s: 11.5, c: SVGC.ink2, w: 700 }) : ""}
  </g>`;
}
function pillNode(x, y, w, h, label, color, o = {}) {
  const active = !!o.active;
  const sub = o.sub || "";
  return `<g class="${active ? "pop" : ""}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}" opacity="${active ? 0.2 : 0.08}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="none" stroke="${color}" stroke-width="${active ? 3.6 : 2.3}"/>
    ${tx(x + w / 2, y + h / 2 - (sub ? 5 : 0), label, { s: o.fs || 14, c: color, w: 800 })}
    ${sub ? tx(x + w / 2, y + h / 2 + 13, sub, { s: 10.5, c: SVGC.ink2, w: 700 }) : ""}
  </g>`;
}
function resSquare(x, y, w, h, label, dots = 1, o = {}) {
  const color = o.c || SVGC.res;
  let dotMarkup = "";
  for (let i = 0; i < dots; i++) {
    const dx = x + w / 2 + (i - (dots - 1) / 2) * 17;
    dotMarkup += `<circle cx="${dx}" cy="${y + h * 0.62}" r="4.5" fill="${color}"/>`;
  }
  return `<g class="${o.active ? "pop" : ""}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${color}" opacity="${o.active ? 0.18 : 0.08}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="none" stroke="${color}" stroke-width="${o.active ? 3.6 : 2.4}"/>
    ${tx(x + w / 2, y + (dots ? 18 : h / 2), label, { s: 13.5, c: color, w: 800 })}
    ${dotMarkup}
  </g>`;
}
function docShape(x, y, w, h, color, o = {}) {
  const fold = o.fold || 22;
  const lines = o.lines || 3;
  let lm = "";
  for (let i = 0; i < lines; i++) {
    lm += `<path d="M${x + 20},${y + h * 0.42 + i * 18} H${x + w - 22 - (i === lines - 1 ? 28 : 0)}" stroke="${color}" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`;
  }
  return `<g class="${o.active ? "pop" : ""}">
    <path d="M${x},${y} H${x + w - fold} L${x + w},${y + fold} V${y + h} H${x} Z" fill="var(--card)" stroke="${color}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M${x + w - fold},${y} V${y + fold} H${x + w}" fill="none" stroke="${color}" stroke-width="2.2"/>
    ${lm}
    ${o.label ? tx(x + w / 2, y + h + 22, o.label, { s: o.fs || 14, c: color, w: 800 }) : ""}
  </g>`;
}
function cpuChip(x, y, w, h, label, o = {}) {
  return `<g class="${o.active ? "pop" : ""}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${SVGC.cpu}" opacity=".1"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${SVGC.cpu}" stroke-width="2.4"/>
    <path d="M${x + w * 0.28},${y} v-7 M${x + w * 0.5},${y} v-7 M${x + w * 0.72},${y} v-7" stroke="${SVGC.cpu}" stroke-width="2" stroke-linecap="round"/>
    <path d="M${x + w * 0.28},${y + h} v7 M${x + w * 0.5},${y + h} v7 M${x + w * 0.72},${y + h} v7" stroke="${SVGC.cpu}" stroke-width="2" stroke-linecap="round"/>
    ${tx(x + w / 2, y + h / 2, label, { s: o.fs || 14, c: SVGC.cpu, w: 900 })}
  </g>`;
}
const FR = (t, svg, d = 3400) => ({ t, svg, d });

/* ============================================================
   卡① 进程与线程
   ============================================================ */

/* ---- 1.1 五状态 ---- */
function stateDiagram(activeEdge, activeNodes) {
  const edges = [
    { id: "admit", d: "M124,110 H187", c: SVGC.create, key: "ink", label: "创建完成", lx: 155, ly: 85 },
    { id: "dispatch", d: "M283,110 H347", c: SVGC.run, key: "green", label: "被调度", lx: 315, ly: 85 },
    { id: "preempt", d: "M378,64 C352,22 292,22 252,64", c: SVGC.ready, key: "amber", label: "时间片到 / 被抢占", lx: 316, ly: 14 },
    { id: "block", d: "M395,158 V237", c: SVGC.block, key: "red", label: "等 I/O 或资源", lx: 500, ly: 198 },
    { id: "wake", d: "M359,262 C300,244 248,208 241,158", c: SVGC.ready, key: "amber", label: "I/O 完成 / 资源到", lx: 291, ly: 238 },
    { id: "exit", d: "M443,110 H526", c: SVGC.term, key: "muted", label: "结束", lx: 485, ly: 85 }
  ];
  let edgeMarkup = "";
  edges.forEach(e => {
    const on = activeEdge === e.id;
    const isPath = e.d.includes("C");
    if (isPath) {
      edgeMarkup += parrow(e.d, {
        c: on ? e.c : SVGC.ink2, key: on ? e.key : "ink",
        sw: on ? 4.2 : 2.2, op: on ? 1 : (activeEdge ? 0.28 : 0.52),
        cls: on ? "draw" : "", dash: ""
      });
    } else {
      edgeMarkup += arrow(
        ...(() => {
          const m = e.d.match(/M([\d.]+),([\d.]+)\s*H([\d.]+)/);
          if (m) return [+m[1], +m[2], +m[3], +m[2]];
          const v = e.d.match(/M([\d.]+),([\d.]+)\s*V([\d.]+)/);
          return [+v[1], +v[2], +v[1], +v[3]];
        })(),
        { c: on ? e.c : SVGC.ink2, key: on ? e.key : "ink", sw: on ? 4.2 : 2.2, op: on ? 1 : (activeEdge ? 0.28 : 0.52), dash: "", cls: on ? "draw" : "" }
      );
    }
  });
  const labels = edges.map(e => tag(e.lx, e.ly, e.label, {
    c: activeEdge === e.id ? e.c : SVGC.ink2,
    stroke: activeEdge === e.id ? e.c : SVGC.muted,
    op: activeEdge === e.id ? 1 : 0.72,
    s: 12
  })).join("");

  const nodes = [
    { x: 80, y: 110, r: 44, label: "创建", c: SVGC.create, id: "create" },
    { x: 235, y: 110, r: 48, label: "就绪", c: SVGC.ready, id: "ready" },
    { x: 395, y: 110, r: 48, label: "运行", c: SVGC.run, id: "run" },
    { x: 395, y: 285, r: 48, label: "阻塞", c: SVGC.block, id: "block" },
    { x: 570, y: 110, r: 44, label: "终止", c: SVGC.term, id: "term" }
  ];
  return `
    <g opacity=".45">${tx(320, 372, "合法转换用实线；不存在的转换在下一步单独标出", { s: 12, c: SVGC.ink2, w: 600 })}</g>
    ${edgeMarkup}
    ${nodes.map(n => stateNode(n.x, n.y, n.r, n.label, n.c, { active: activeNodes.includes(n.id) })).join("")}
    ${labels}`;
}

function forbiddenDiagram() {
  function panel(x, title, left, right, note) {
    const y = 78, w = 288, h = 250;
    return `<g class="pop">
      ${box(x, y, w, h, { fill: "var(--card)", stroke: SVGC.bad, sw: 2, rx: 16, dash: "7 6" })}
      ${tx(x + w / 2, y + 28, title, { s: 17, c: SVGC.bad, w: 900 })}
      ${stateNode(x + 68, y + 112, 39, left, left === "阻塞" ? SVGC.block : left === "就绪" ? SVGC.ready : SVGC.run, { fs: 15 })}
      ${stateNode(x + w - 68, y + 112, 39, right, right === "阻塞" ? SVGC.block : right === "运行" ? SVGC.run : SVGC.ready, { fs: 15 })}
      ${arrow(x + 112, y + 112, x + w - 112, y + 112, { c: SVGC.bad, key: "red", sw: 3, dash: "6 5" })}
      ${mark(x + w / 2, y + 112, false, { r: 14 })}
      ${tlines(x + w / 2, y + 190, note, { s: 12.5, c: SVGC.ink2, w: 600, lh: 19 })}
    </g>`;
  }
  return `
    ${panel(20, "✗ 阻塞 → 运行", "阻塞", "运行", ["阻塞在等事件，", "不会因为 CPU 空就直接运行"])}
    ${panel(332, "✗ 就绪 → 阻塞", "就绪", "阻塞", ["就绪只差 CPU，", "不会主动去等 I/O 或资源"])}
    ${tx(320, 365, "记：就绪等 CPU，阻塞等事件", { s: 15, c: SVGC.warn, w: 900 })}`;
}

/* ---- 1.2 挂起 ---- */
function suspendDiagram(mode) {
  const arrows = [];
  const faint = 0.26;
  arrows.push(arrow(163, 150, 479, 150, {
    c: mode === "s-ready" ? SVGC.ready : SVGC.ink2,
    key: mode === "s-ready" ? "amber" : "ink",
    sw: mode === "s-ready" ? 4 : 2.2,
    op: mode === "s-ready" ? 1 : faint,
    cls: mode === "s-ready" ? "draw" : ""
  }));
  arrows.push(arrow(163, 295, 479, 295, {
    c: mode === "s-block" ? SVGC.block : SVGC.ink2,
    key: mode === "s-block" ? "red" : "ink",
    sw: mode === "s-block" ? 4 : 2.2,
    op: mode === "s-block" ? 1 : faint,
    cls: mode === "s-block" ? "draw" : ""
  }));
  if (mode === "activate") {
    arrows.push(arrow(479, 120, 163, 120, { c: SVGC.thread, key: "teal", sw: 4, cls: "draw" }));
    arrows.push(arrow(479, 328, 163, 328, { c: SVGC.thread, key: "teal", sw: 4, cls: "draw" }));
  }
  return `
    ${box(20, 56, 352, 312, { stroke: SVGC.mem, sw: 2, rx: 18, dash: "7 7", op: 0.75 })}
    ${box(428, 56, 192, 312, { stroke: SVGC.disk, sw: 2, rx: 18, dash: "7 7", op: 0.75 })}
    ${tx(40, 78, "内存", { s: 16, a: "start", c: SVGC.mem, w: 900 })}
    ${tx(444, 78, "外存（磁盘）", { s: 16, a: "start", c: SVGC.disk, w: 900 })}
    ${stateNode(116, 150, 44, "活动就绪", SVGC.ready, { active: mode === "s-ready" })}
    ${stateNode(116, 295, 44, "活动阻塞", SVGC.block, { active: mode === "s-block" })}
    ${stateNode(526, 150, 44, "静止就绪", SVGC.ready, { dashed: true, active: mode === "s-ready" })}
    ${stateNode(526, 295, 44, "静止阻塞", SVGC.block, { dashed: true, active: mode === "s-block" })}
    ${arrows.join("")}
    ${tag(321, 126, "挂起", { s: 12, c: mode === "s-ready" ? SVGC.ready : SVGC.ink2 })}
    ${tag(321, 271, "挂起", { s: 12, c: mode === "s-block" ? SVGC.block : SVGC.ink2 })}
    ${mode === "activate" ? tag(321, 96, "激活", { s: 12, c: SVGC.thread }) : ""}
    ${mode === "activate" ? tag(321, 350, "激活", { s: 12, c: SVGC.thread }) : ""}
    ${mode === "s-ready" ? tag(321, 184, "就绪也能挂起", { s: 13, c: SVGC.ready, stroke: SVGC.ready }) : ""}
    ${mode === "s-block" ? tag(321, 184, "阻塞也能挂起", { s: 13, c: SVGC.block, stroke: SVGC.block }) : ""}`;
}

function suspendSummary() {
  const items = [
    { y: 116, a: "活动就绪", b: "静止就绪", ca: SVGC.ready, cb: SVGC.ready, note: "挂起 / 激活" },
    { y: 256, a: "活动阻塞", b: "静止阻塞", ca: SVGC.block, cb: SVGC.block, note: "挂起 / 激活" }
  ];
  return `
    ${tx(320, 56, "挂起后的四种状态", { s: 20, w: 900 })}
    ${tx(320, 82, "内存里的叫“活动”，外存里的叫“静止”", { s: 13, c: SVGC.ink2, w: 600 })}
    ${items.map(it => `
      ${pillNode(58, it.y, 150, 54, it.a, it.ca, { active: true, fs: 14 })}
      ${pillNode(432, it.y, 150, 54, it.b, it.cb, { fs: 14 })}
      ${arrow(216, it.y + 27, 386, it.y + 27, { c: SVGC.warn, key: "amber", sw: 2.6 })}
      ${arrow(386, it.y + 27, 216, it.y + 27, { c: SVGC.warn, key: "amber", sw: 2.6 })}
      ${tag(320, it.y - 14, it.note, { s: 12, c: SVGC.warn, stroke: SVGC.warn })}
    `).join("")}
    ${tag(320, 338, "就绪、阻塞都可以挂起；挂起不是终止", { s: 14, c: SVGC.warn, stroke: SVGC.warn })}`;
}

/* ---- 1.3 进程 vs 程序 vs 线程 ---- */
function procProgramDiagram(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 62, "程序", { s: 28, w: 900, c: SVGC.create })}
      ${docShape(220, 100, 200, 160, SVGC.create, { lines: 3, label: "指令 + 数据" })}
      ${tag(320, 300, "静态：只是磁盘上的一组指令和数据", { s: 14, c: SVGC.create, stroke: SVGC.create })}
      ${tag(320, 338, "像菜谱：放在那里，不会自己动", { s: 13, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    return `
      ${docShape(34, 158, 112, 92, SVGC.create, { lines: 2, label: "程序", fs: 12 })}
      ${arrow(152, 204, 208, 204, { c: SVGC.proc, key: "darkblue", sw: 3 })}
      ${tag(180, 180, "运行", { s: 12, c: SVGC.proc, stroke: SVGC.proc })}
      ${box(208, 72, 402, 288, { fill: SVGC.proc, stroke: SVGC.proc, sw: 2.6, rx: 24, op: 0.06 })}
      ${box(208, 72, 402, 288, { stroke: SVGC.proc, sw: 2.6, rx: 24 })}
      ${tx(409, 102, "进程", { s: 23, c: SVGC.proc, w: 900 })}
      ${tag(550, 102, "动态", { s: 12, c: SVGC.proc, stroke: SVGC.proc })}
      ${box(236, 134, 158, 48, { fill: "var(--card)", stroke: SVGC.proc, sw: 2, rx: 10 })}
      ${tx(315, 158, "地址空间", { s: 14, c: SVGC.proc })}
      ${box(424, 134, 158, 48, { fill: "var(--card)", stroke: SVGC.proc, sw: 2, rx: 10 })}
      ${tx(503, 158, "打开的文件", { s: 14, c: SVGC.proc })}
      ${box(236, 214, 170, 56, { fill: SVGC.proc, stroke: SVGC.proc, sw: 2.8, rx: 11, op: 0.14 })}
      ${tx(321, 242, "PCB", { s: 19, c: SVGC.proc, w: 900 })}
      ${tag(474, 242, "唯一标志", { s: 12, c: SVGC.proc, stroke: SVGC.proc })}
      ${tx(409, 314, "程序的一次运行 = 资源 + 执行过程", { s: 14, c: SVGC.ink2, w: 700 })}`;
  }
  if (stage === 3) {
    return `
      ${box(62, 72, 516, 288, { fill: SVGC.proc, stroke: SVGC.proc, sw: 2.6, rx: 24, op: 0.05 })}
      ${box(62, 72, 516, 288, { stroke: SVGC.proc, sw: 2.6, rx: 24 })}
      ${tx(320, 102, "一个进程里可以有多个线程", { s: 19, c: SVGC.proc, w: 900 })}
      ${pillNode(102, 176, 128, 52, "线程 T1", SVGC.thread, { active: true })}
      ${pillNode(256, 176, 128, 52, "线程 T2", SVGC.thread, { active: true })}
      ${pillNode(410, 176, 128, 52, "线程 T3", SVGC.thread, { active: false })}
      ${arrow(166, 248, 166, 286, { c: SVGC.thread, key: "teal", sw: 2.4 })}
      ${arrow(320, 248, 320, 286, { c: SVGC.thread, key: "teal", sw: 2.4 })}
      ${arrow(474, 248, 474, 286, { c: SVGC.thread, key: "teal", sw: 2.4 })}
      ${tag(320, 312, "线程 = 进程里的执行流，是独立调度的基本单位", { s: 14, c: SVGC.thread, stroke: SVGC.thread })}
      ${tx(320, 348, "CPU 调度的是线程，不是整个进程", { s: 12.5, c: SVGC.ink2, w: 700 })}`;
  }
  if (stage === 4) {
    return `
      ${box(56, 62, 528, 310, { stroke: SVGC.proc, sw: 2.6, rx: 24 })}
      ${box(78, 78, 484, 54, { fill: SVGC.proc, stroke: SVGC.proc, sw: 2, rx: 12, op: 0.12 })}
      ${tx(320, 105, "共享：地址空间、文件等资源", { s: 15, c: SVGC.proc, w: 800 })}
      ${[
        { x: 88, label: "线程 T1" },
        { x: 252, label: "线程 T2" },
        { x: 416, label: "线程 T3" }
      ].map(t => `
        ${pillNode(t.x, 156, 136, 42, t.label, SVGC.thread, { fs: 13 })}
        ${box(t.x + 10, 220, 116, 46, { fill: "var(--card)", stroke: SVGC.thread, sw: 1.8, rx: 8 })}
        ${tx(t.x + 68, 243, "自己的栈", { s: 12, c: SVGC.thread, w: 700 })}
        ${box(t.x + 10, 278, 116, 46, { fill: "var(--card)", stroke: SVGC.thread, sw: 1.8, rx: 8 })}
        ${tx(t.x + 68, 301, "寄存器", { s: 12, c: SVGC.thread, w: 700 })}
      `).join("")}
      ${tx(320, 354, "共享资源，但各自的栈和寄存器不共享", { s: 13, c: SVGC.ink2, w: 700 })}`;
  }
  return `
    ${[
      { x: 18, name: "程序", color: SVGC.create, shape: "doc", points: ["静态", "指令 + 数据", "不会自己运行"] },
      { x: 224, name: "进程", color: SVGC.proc, shape: "circle", points: ["动态执行过程", "一套资源 + PCB", "资源拥有的独立单位"] },
      { x: 430, name: "线程", color: SVGC.thread, shape: "pill", points: ["进程内的执行流", "独立调度的基本单位", "共享进程资源"] }
    ].map(c => `
      ${box(c.x, 74, 192, 228, { fill: "var(--card)", stroke: c.color, sw: 2.2, rx: 16 })}
      ${tx(c.x + 96, 104, c.name, { s: 20, c: c.color, w: 900 })}
      ${c.shape === "circle"
        ? stateNode(c.x + 96, 156, 27, "进程", c.color, { active: true, fs: 12 })
        : c.shape === "pill"
          ? pillNode(c.x + 46, 138, 100, 36, c.name, c.color, { fs: 12 })
          : docShape(c.x + 66, 126, 60, 62, c.color, { lines: 2, fold: 14 })}
      ${tlines(c.x + 96, 216, c.points, { s: 12, c: SVGC.ink2, w: 600, lh: 23 })}
    `).join("")}
    ${tag(320, 340, "引入线程后，进程仍是拥有资源的独立单位", { s: 15, c: SVGC.warn, stroke: SVGC.warn })}`;
}

/* ---- 1.4 原语 ---- */
function primitiveDiagram(stage) {
  const code = [
    "关中断",
    "分配 PCB",
    "插入就绪队列",
    "开中断"
  ];
  const codePanel = (highlight) => `
    ${box(118, 82, 404, 220, { fill: "var(--card)", stroke: SVGC.proc, sw: 2.2, rx: 16 })}
    ${tx(320, 108, "原语：创建进程", { s: 15, c: SVGC.proc, w: 800 })}
    ${code.map((line, i) => `
      <circle cx="154" cy="${144 + i * 38}" r="11" fill="${highlight === i ? SVGC.proc : "var(--bg2)"}" stroke="${SVGC.proc}" stroke-width="1.5"/>
      ${tx(154, 145 + i * 38, String(i + 1), { s: 10.5, c: highlight === i ? "#fff" : SVGC.proc, w: 900 })}
      ${tx(178, 145 + i * 38, line, { s: 16, a: "start", c: highlight === i ? SVGC.proc : SVGC.ink, w: 700 })}
    `).join("")}`;
  if (stage === 1) {
    return `
      ${tx(320, 50, "原语（Primitive）", { s: 20, w: 900 })}
      ${codePanel(-1)}
      ${tag(320, 332, "由若干条指令组成", { s: 14, c: SVGC.proc, stroke: SVGC.proc })}
      ${tag(320, 366, "关键词：执行过程中不可被中断", { s: 13, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  if (stage === 2) {
    return `
      ${codePanel(0)}
      ${parrow("M596,196 C552,196 530,196 506,196", { c: SVGC.bad, key: "red", sw: 3.4 })}
      ${mark(566, 168, false, { r: 14 })}
      ${tag(566, 132, "中断请求", { s: 12, c: SVGC.bad, stroke: SVGC.bad })}
      <g class="pop">
        <path d="M474,150 L502,178 M502,150 L474,178" stroke="${SVGC.bad}" stroke-width="4" stroke-linecap="round"/>
        <path d="M452,128 C432,154 432,234 452,260" fill="none" stroke="${SVGC.bad}" stroke-width="5" stroke-linecap="round" opacity=".45"/>
      </g>
      ${tag(320, 332, "执行时屏蔽中断：外面进不来，里面不被打断", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}`;
  }
  return `
    ${tx(320, 58, "哪些是原语？", { s: 20, w: 900 })}
    ${[
      { x: 26, label: "进程创建", icon: "+" },
      { x: 230, label: "进程阻塞", icon: "Ⅱ" },
      { x: 434, label: "进程唤醒", icon: "◉" }
    ].map((c, i) => `
      <g class="pop" style="animation-delay:${i * 0.08}s">
        ${box(c.x, 94, 180, 190, { fill: "var(--card)", stroke: SVGC.proc, sw: 2.2, rx: 16 })}
        <circle cx="${c.x + 90}" cy="150" r="31" fill="${SVGC.proc}" opacity=".13"/>
        <circle cx="${c.x + 90}" cy="150" r="31" fill="none" stroke="${SVGC.proc}" stroke-width="2.2"/>
        ${tx(c.x + 90, 151, c.icon, { s: 28, c: SVGC.proc, w: 900 })}
        ${tx(c.x + 90, 213, c.label, { s: 16, c: SVGC.proc, w: 800 })}
        ${tx(c.x + 90, 241, "原语", { s: 12, c: SVGC.ink2, w: 700 })}
      </g>
    `).join("")}
    ${tag(320, 330, "它们都会改变进程状态，必须原子地完成", { s: 13, c: SVGC.warn, stroke: SVGC.warn })}
    ${tag(320, 366, "所以执行时屏蔽中断", { s: 13, c: SVGC.ink2 })}`;
}

/* ---- 卡① 动画 ---- */
const P1_ANIMS = [
  {
    id: "p1a1", no: "1.1", title: "五状态转换：六条合法边 + 两条禁区",
    frames: [
      FR("进程有五个状态：创建、就绪、运行、阻塞、终止。先记住它们的位置。", stateDiagram(null, ["create", "ready", "run", "block", "term"])),
      FR("创建完成、拿到除 CPU 外的资源 → 就绪。", stateDiagram("admit", ["create", "ready"])),
      FR("就绪被调度程序选中，分到 CPU → 运行。", stateDiagram("dispatch", ["ready", "run"])),
      FR("时间片用完或被更高优先级抢占：运行 → 就绪，不是阻塞。", stateDiagram("preempt", ["run", "ready"])),
      FR("运行中等待 I/O 或申请资源得不到 → 阻塞。", stateDiagram("block", ["run", "block"])),
      FR("I/O 完成或资源到手：阻塞 → 就绪，仍然不能直接运行。", stateDiagram("wake", ["block", "ready"])),
      FR("进程结束 → 终止。", stateDiagram("exit", ["run", "term"])),
      FR("两条不存在的转换：阻塞 → 运行、就绪 → 阻塞。", forbiddenDiagram(), 4200)
    ]
  },
  {
    id: "p1a2", no: "1.2", title: "挂起：内存 ↔ 外存的四种状态",
    frames: [
      FR("挂起 = 把进程换到外存，腾出内存。就绪和阻塞都可能被挂起。", suspendDiagram("initial")),
      FR("活动就绪被换到外存 → 静止就绪。", suspendDiagram("s-ready")),
      FR("活动阻塞被换到外存 → 静止阻塞。", suspendDiagram("s-block")),
      FR("需要时再激活：静止就绪 → 活动就绪，静止阻塞 → 活动阻塞。", suspendDiagram("activate")),
      FR("四种状态：活动就绪、静止就绪、活动阻塞、静止阻塞。", suspendSummary(), 4000)
    ]
  },
  {
    id: "p1a3", no: "1.3", title: "程序 vs 进程 vs 线程",
    frames: [
      FR("程序是静态的：磁盘上的指令和数据，像一张菜谱，不会自己动。", procProgramDiagram(1)),
      FR("进程是程序的一次运行，是动态的；PCB 是进程存在的唯一标志。", procProgramDiagram(2)),
      FR("线程是进程里的执行流，是独立调度的基本单位。", procProgramDiagram(3)),
      FR("同一进程的线程共享地址空间和资源，但各有自己的栈和寄存器。", procProgramDiagram(4)),
      FR("引入线程后，进程仍是拥有资源的独立单位。", procProgramDiagram(5), 4000)
    ]
  },
  {
    id: "p1a4", no: "1.4", title: "原语：不可被中断的指令段",
    frames: [
      FR("原语由若干条指令组成，执行过程中不可被中断。", primitiveDiagram(1)),
      FR("为了不被打断，原语执行时会屏蔽中断。", primitiveDiagram(2)),
      FR("进程创建、进程阻塞、进程唤醒，都是原语。", primitiveDiagram(3), 4000)
    ]
  }
];

const CARD1 = {
  id: "p1", num: "①", short: "进程与线程", kicker: "状态 · 挂起 · PCB · 原语",
  title: "进程与线程",
  color: "var(--c-proc)",
  intro: "把进程想成“正在运行的程序 + 它占的资源”，线程则是进程里真正被 CPU 调度的执行流。这一张先把状态图和“谁管资源、谁管干活”钉死。",
  chips: ["五状态", "挂起四态", "进程 vs 线程", "PCB 唯一标志", "原语"],
  anims: P1_ANIMS,
  compare: {
    cols: [
      {
        name: "进程", color: "var(--c-proc)", shape: "circle", tag: "资源 + 动态执行",
        points: [
          "一套资源：地址空间、打开的文件",
          "一个动态执行过程",
          "PCB 是进程存在的唯一标志",
          "引入线程后，仍是拥有资源的独立单位"
        ]
      },
      {
        name: "线程", color: "var(--c-thread)", shape: "pill", tag: "执行流",
        points: [
          "进程里的执行流",
          "独立调度的基本单位",
          "同一进程的线程共享地址空间和资源",
          "每个线程有自己的栈和寄存器"
        ]
      }
    ],
    facts: [
      { ok: true, text: "同一进程的线程共享地址空间和资源" },
      { ok: false, text: "每个线程有自己独立的地址空间" },
      { ok: true, text: "程序是静态的，进程是动态的" },
      { ok: false, text: "有了线程后，线程成为拥有资源的独立单位" },
      { ok: true, text: "PCB 是进程存在的唯一标志" }
    ]
  },
  mnemonic: "进程管资源，线程管干活；阻塞等事件，就绪等 CPU。",
  mnNote: "两条不存在的转换：阻塞→运行、就绪→阻塞。",
  quiz: ["q1", "q3", "q4", "q6", "q7"]
};

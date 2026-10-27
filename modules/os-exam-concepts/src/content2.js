/* ============================================================
   卡② 死锁 + 卡③ I/O
   ============================================================ */

function miniProc(x, y, label, o = {}) {
  const r = o.r || 26;
  const color = o.color || SVGC.proc;
  const dots = o.dots || 0;
  const active = o.active !== false;
  let dm = "";
  for (let i = 0; i < dots; i++) {
    const dx = x + (i - (dots - 1) / 2) * 12;
    dm += `<circle cx="${dx}" cy="${y + 13}" r="4" fill="${o.dotColor || SVGC.res}"/>`;
  }
  return `<g class="${active ? "pop" : ""}">
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity=".08"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${o.sw || 2.4}"/>
    ${tx(x, y - (dots ? 5 : 0), label, { s: o.fs || 13, c: color, w: 800 })}
    ${dm}
  </g>`;
}
function printerIcon(x, y, s, color = SVGC.res, active = true) {
  return `<g class="${active ? "pop" : ""}">
    <rect x="${x}" y="${y}" width="${s}" height="${s * 0.64}" rx="4" fill="${SVGC.card}" stroke="${color}" stroke-width="2"/>
    <rect x="${x + s * 0.22}" y="${y + s * 0.12}" width="${s * 0.56}" height="${s * 0.22}" rx="2" fill="${color}" opacity=".25" stroke="${color}" stroke-width="1.4"/>
    <circle cx="${x + s * 0.8}" cy="${y + s * 0.48}" r="2.2" fill="${color}"/>
    <rect x="${x + s * 0.18}" y="${y - s * 0.18}" width="${s * 0.64}" height="${s * 0.2}" rx="2" fill="${SVGC.card}" stroke="${color}" stroke-width="1.6"/>
  </g>`;
}

/* ============================================================
   2.1 资源分配图
   ============================================================ */
function ragDiagram(stage) {
  const showAlloc = stage >= 3 || stage === 6;
  const showReq = stage >= 4 || stage === 6;
  const cycle = stage === 5;
  const keyA = cycle ? "red" : "purple";
  const keyR = cycle ? "red" : "darkblue";
  const cA = cycle ? SVGC.bad : SVGC.res;
  const cR = cycle ? SVGC.bad : SVGC.proc;

  const edges = [];
  if (showAlloc) {
    edges.push(arrow(300, 130, 204, 175, { c: cA, key: keyA, sw: cycle ? 4 : 2.8 }));
    edges.push(arrow(358, 274, 440, 221, { c: cA, key: keyA, sw: cycle ? 4 : 2.8 }));
  }
  if (showReq) {
    edges.push(arrow(200, 221, 282, 270, { c: cR, key: keyR, sw: cycle ? 4 : 2.8 }));
    edges.push(arrow(443, 165, 345, 118, { c: cR, key: keyR, sw: cycle ? 4 : 2.8 }));
  }

  const labels = [];
  if (stage === 3) {
    labels.push(tag(247, 145, "已分配", { c: SVGC.res, stroke: SVGC.res }));
    labels.push(tag(405, 255, "已分配", { c: SVGC.res, stroke: SVGC.res }));
  }
  if (stage === 4) {
    labels.push(tag(236, 254, "请求", { c: SVGC.proc, stroke: SVGC.proc }));
    labels.push(tag(400, 133, "请求", { c: SVGC.proc, stroke: SVGC.proc }));
  }
  if (stage === 6) {
    labels.push(tag(250, 143, "已分配 R→P", { c: SVGC.res, stroke: SVGC.res }));
    labels.push(tag(237, 254, "请求 P→R", { c: SVGC.proc, stroke: SVGC.proc }));
    labels.push(tag(404, 133, "请求 P→R", { c: SVGC.proc, stroke: SVGC.proc }));
    labels.push(tag(410, 255, "已分配 R→P", { c: SVGC.res, stroke: SVGC.res }));
  }

  let legend = "";
  if (stage <= 1 || stage === 6) {
    legend = `
      ${stateNode(132, 360, 17, "", SVGC.proc, { active: false })}
      ${tx(156, 360, "进程", { s: 12.5, a: "start", c: SVGC.proc })}
      ${resSquare(246, 346, 32, 28, "", 0)}
      ${tx(286, 360, "资源", { s: 12.5, a: "start", c: SVGC.res })}
      ${arrow(380, 360, 420, 360, { c: SVGC.proc, key: "darkblue", sw: 2.4 })}
      ${tx(426, 360, "请求 P→R", { s: 12, a: "start", c: SVGC.ink2 })}
      ${arrow(520, 386, 480, 386, { c: SVGC.res, key: "purple", sw: 2.4 })}
      ${tx(526, 386, "已分配 R→P", { s: 12, a: "start", c: SVGC.ink2 })}`;
  }
  const bottomNote = stage === 2
    ? tag(320, 364, "资源框里的圆点 = 该类资源的实例数（这里各 1 个）", { s: 13, c: SVGC.ink2 })
    : stage === 3
      ? tag(320, 364, "R → P：资源已经分配给它", { s: 13, c: SVGC.res, stroke: SVGC.res })
      : stage === 4
        ? tag(320, 364, "P → R：进程正在请求这个资源", { s: 13, c: SVGC.proc, stroke: SVGC.proc })
        : "";

  return `
    ${edges.join("")}
    ${stateNode(160, 195, 48, "P1", SVGC.proc, { active: stage === 5 || stage === 6 })}
    ${stateNode(480, 195, 48, "P2", SVGC.proc, { active: stage === 5 || stage === 6 })}
    ${resSquare(275, 66, 90, 64, "R1", stage >= 2 ? 1 : 0, { active: cycle })}
    ${resSquare(275, 266, 90, 64, "R2", stage >= 2 ? 1 : 0, { active: cycle })}
    ${labels.join("")}
    ${cycle ? tag(320, 195, "P1→R2→P2→R1 形成环 → 死锁", { s: 13.5, c: SVGC.bad, stroke: SVGC.bad, fill: "var(--card)" }) : ""}
    ${stage === 2 ? tx(320, 198, "各 1 个实例", { s: 12, c: SVGC.muted, w: 600 }) : ""}
    ${legend}
    ${bottomNote}`;
}

/* ============================================================
   2.2 图的简化
   ============================================================ */
function simplifyDiagram(stage) {
  const showP2 = stage <= 2;
  const showP1 = stage <= 4;
  const showAlloc = stage <= 3;
  const showReq = stage <= 2;
  const showNewAlloc = stage === 4;
  const r2Free = stage >= 3;
  const r1Free = stage >= 5;

  let markup = `
    ${box(112, 46, 102, 64, { fill: "var(--card)", stroke: SVGC.res, sw: 2.4, rx: 8 })}
    ${tx(163, 68, "R1", { s: 14, c: SVGC.res, w: 800 })}
    ${r1Free
      ? `<circle cx="163" cy="92" r="4.5" fill="var(--stage)" stroke="${SVGC.res}" stroke-width="2"/>`
      : `<circle cx="163" cy="92" r="4.5" fill="${SVGC.res}"/>`}
    ${box(406, 136, 102, 64, { fill: "var(--card)", stroke: SVGC.res, sw: 2.4, rx: 8 })}
    ${tx(457, 158, "R2", { s: 14, c: SVGC.res, w: 800 })}
    ${r2Free
      ? `<circle cx="457" cy="182" r="4.5" fill="var(--stage)" stroke="${SVGC.res}" stroke-width="2"/>`
      : `<circle cx="457" cy="182" r="4.5" fill="${SVGC.res}"/>`}
  `;
  if (showAlloc) markup += arrow(163, 110, 175, 134, { c: SVGC.res, key: "purple", sw: 2.8 });
  if (showReq) markup += arrow(221, 174, 404, 170, { c: SVGC.proc, key: "darkblue", sw: 2.8 });
  if (stage <= 2) markup += arrow(457, 200, 480, 254, { c: SVGC.res, key: "purple", sw: 2.8 });
  if (showNewAlloc) markup += arrow(406, 166, 221, 178, { c: SVGC.ok, key: "green", sw: 3.4 });

  if (showP1) {
    markup += stateNode(175, 180, 46, "P1", SVGC.proc, { active: stage === 4 });
    markup += stage === 4 ? tag(178, 238, "P1 已满足", { s: 12, c: SVGC.ok, stroke: SVGC.ok }) : "";
  }
  if (showP2) {
    markup += stateNode(480, 300, 46, "P2", SVGC.proc, { active: stage === 2 });
    markup += stage === 2 ? tag(480, 242, "P2 没有请求", { s: 13, c: SVGC.ok, stroke: SVGC.ok }) : "";
  }
  if (stage === 3) markup += tag(480, 300, "P2 跑完 → 释放 R2", { s: 13, c: SVGC.ok, stroke: SVGC.ok });
  if (stage === 5) {
    markup += tag(320, 200, "所有进程都能跑完 = 可完全简化 = 无死锁", { s: 14.5, c: SVGC.ok, stroke: SVGC.ok });
    markup += mark(320, 250, true, { r: 18 });
  }
  if (stage === 6) {
    markup += `${box(30, 72, 278, 240, { fill: "var(--card)", stroke: SVGC.ok, sw: 2.2, rx: 16 })}
      ${tcOr(160, 112, "可完全简化", SVGC.ok)}
      ${mark(160, 166, true, { r: 18 })}
      ${tlines(160, 218, ["所有进程都能跑完", "没有死锁"], { s: 13, c: SVGC.ink2, w: 600, lh: 23 })}
      ${box(332, 72, 278, 240, { fill: "var(--card)", stroke: SVGC.bad, sw: 2.2, rx: 16, dash: "7 6" })}
      ${tx(471, 112, "不可完全简化", { s: 18, c: SVGC.bad, w: 900 })}
      ${mark(471, 166, false, { r: 18 })}
      ${tlines(471, 218, ["总剩下边擦不掉", "存在死锁"], { s: 13, c: SVGC.ink2, w: 600, lh: 23 })}`;
  }
  return markup;
}
function tcOr(x, y, str, c) { return tx(x, y, str, { s: 18, c, w: 900 }); }

/* ============================================================
   2.3 四个必要条件与策略
   ============================================================ */
const DL_CONDITIONS = [
  { t: "互斥", d: "资源一次只能给一个进程用", b: "一般不能破坏", icon: "1" },
  { t: "请求并保持", d: "占着资源，又去申请新的资源", b: "破坏：一次性申请全部（预先分配）", icon: "2" },
  { t: "不可剥夺", d: "拿到就不放，不能被强行收回", b: "破坏：申请不到就释放已占资源，或强行剥夺", icon: "3" },
  { t: "环路等待", d: "进程首尾相接，循环等资源", b: "破坏：资源按编号顺序申请", icon: "4" }
];
function conditionsDiagram(active) {
  const positions = [[18, 58], [326, 58], [18, 210], [326, 210]];
  const cards = DL_CONDITIONS.map((c, i) => {
    const [x, y] = positions[i];
    const on = active === i;
    const dim = active >= 0 && !on;
    return `<g class="${on ? "pop" : ""}" opacity="${dim ? 0.38 : 1}">
      ${box(x, y, 296, 140, { fill: on ? "var(--bg2)" : "var(--card)", stroke: on ? SVGC.warn : SVGC.line2, sw: on ? 3.4 : 1.8, rx: 15 })}
      <circle cx="${x + 30}" cy="${y + 30}" r="15" fill="${on ? SVGC.warn : "var(--bg2)"}" stroke="${SVGC.warn}" stroke-width="1.5"/>
      ${tx(x + 30, y + 31, c.icon, { s: 12, c: on ? "#fff" : SVGC.warn, w: 900 })}
      ${tx(x + 54, y + 30, c.t, { s: 18, a: "start", c: on ? SVGC.warn : SVGC.ink, w: 900 })}
      ${tx(x + 18, y + 66, c.d, { s: 12.5, a: "start", c: SVGC.ink2, w: 600 })}
      ${tx(x + 18, y + 104, c.b, { s: 11.5, a: "start", c: i === 0 ? SVGC.bad : SVGC.ok, w: 700 })}
    </g>`;
  }).join("");
  return cards + (active >= 0
    ? tag(320, 374, active === 0 ? "互斥一般不能破坏；另外三条可以针对性破坏" : `第 ${active + 1} 条：${DL_CONDITIONS[active].b}`, { s: 13, c: SVGC.warn, stroke: SVGC.warn })
    : tag(320, 374, "四个条件同时成立，才可能发生死锁", { s: 13, c: SVGC.ink2 }));
}
function strategiesDiagram() {
  const items = [
    { t: "预防", d: "破坏四个必要条件之一", c: SVGC.ok },
    { t: "避免", d: "银行家算法，每次分配前检查安全", c: SVGC.proc },
    { t: "检测", d: "资源分配图化简", c: SVGC.warn },
    { t: "解除", d: "剥夺资源、撤销进程", c: SVGC.bad }
  ];
  return items.map((it, i) => {
    const x = i % 2 === 0 ? 18 : 326, y = i < 2 ? 58 : 210;
    return `<g class="pop" style="animation-delay:${i * .07}s">
      ${box(x, y, 296, 140, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 15 })}
      <circle cx="${x + 34}" cy="${y + 34}" r="18" fill="${it.c}" opacity=".14"/>
      <circle cx="${x + 34}" cy="${y + 34}" r="18" fill="none" stroke="${it.c}" stroke-width="2"/>
      ${tx(x + 34, y + 35, String(i + 1), { s: 13, c: it.c, w: 900 })}
      ${tx(x + 64, y + 34, it.t, { s: 19, a: "start", c: it.c, w: 900 })}
      ${tx(x + 20, y + 88, it.d, { s: 12.5, a: "start", c: SVGC.ink2, w: 600 })}
    </g>`;
  }).join("") + tag(320, 374, "四种策略：预防、避免、检测、解除", { s: 13, c: SVGC.ink2 });
}

/* ============================================================
   2.4 资源数公式
   ============================================================ */
function resourceDiagram(stage) {
  if (stage === 1) {
    return `
      ${tx(320, 52, "保证不死锁的资源数公式", { s: 19, w: 900 })}
      ${box(70, 100, 500, 100, { fill: "var(--card)", stroke: SVGC.warn, sw: 2.4, rx: 18 })}
      ${tx(320, 152, "N × (k − 1) + 1 ≤ R", { s: 35, c: SVGC.warn, w: 900, ff: "Georgia,serif" })}
      ${[
        ["N", "进程数"],
        ["k", "每个进程最多需要"],
        ["R", "系统资源总数"]
      ].map((v, i) => `
        <g class="pop" style="animation-delay:${i * .08}s">
          ${box(64 + i * 176, 242, 160, 84, { fill: "var(--card)", stroke: SVGC.line2, sw: 1.8, rx: 12 })}
          ${tx(144 + i * 176, 270, v[0], { s: 24, c: SVGC.proc, w: 900 })}
          ${tx(144 + i * 176, 300, v[1], { s: 12, c: SVGC.ink2, w: 600 })}
        </g>`).join("")}
      ${tag(320, 362, "最坏情况：每个进程先拿 k−1 个，都差最后 1 个", { s: 13, c: SVGC.ink2 })}`;
  }
  if (stage === 2) {
    const xs = [110, 250, 390, 530];
    return `
      ${tx(320, 50, "最坏情况：每个进程都拿 k−1 个", { s: 18, w: 900 })}
      ${xs.map((x, i) => miniProc(x, 170, `P${i + 1}`, { dots: 2, r: 31 })).join("")}
      ${xs.map((x, i) => tag(x, 235, "k−1 = 2", { s: 11.5, c: SVGC.res, stroke: SVGC.res })).join("")}
      ${tag(320, 318, "每个都还差最后 1 个，谁也不够跑完", { s: 15, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 362, "这里的例子：k = 3，N = 4", { s: 13, c: SVGC.ink2 })}`;
  }
  if (stage === 3) {
    const xs = [110, 250, 390, 530];
    return `
      ${tx(320, 50, "再加 1 个资源，就一定有进程能凑齐", { s: 18, w: 900 })}
      ${xs.map((x, i) => miniProc(x, 170, `P${i + 1}`, { dots: 2, r: 31, color: i === 1 ? SVGC.run : SVGC.proc })).join("")}
      <circle cx="320" cy="286" r="12" fill="${SVGC.res}" opacity=".18" stroke="${SVGC.res}" stroke-width="2.2"/>
      ${tx(320, 287, "1", { s: 13, c: SVGC.res, w: 900 })}
      ${parrow("M320,272 C320,238 290,218 254,205", { c: SVGC.ok, key: "green", sw: 3 })}
      ${mark(320, 342, true, { r: 14 })}
      ${tag(320, 374, "拿到最后 1 个 → 跑完 → 释放 → 其他人也能跑完", { s: 13, c: SVGC.ok, stroke: SVGC.ok })}`;
  }
  if (stage === 4) {
    const xs = [62, 148, 234, 320, 406, 492, 578];
    return `
      ${tx(320, 46, "例（25 卷）：7 台打印机，每进程最多 2 台", { s: 17, w: 900 })}
      ${tx(320, 74, "N × 1 + 1 ≤ 7  →  N ≤ 6", { s: 20, c: SVGC.warn, w: 900, ff: "Georgia,serif" })}
      ${xs.slice(0, 6).map((x, i) => `
        ${miniProc(x, 145, `P${i + 1}`, { dots: 0, r: 27 })}
        ${printerIcon(x - 14, 188, 28, SVGC.res)}
      `).join("")}
      ${printerIcon(306, 300, 30, SVGC.ok)}
      ${tag(320, 344, "还剩 1 台：一定有人拿到第 2 台，跑完释放", { s: 13, c: SVGC.ok, stroke: SVGC.ok })}
      ${tag(320, 378, "6 个进程各占 1 台，N = 6 是安全的", { s: 12.5, c: SVGC.ink2 })}`;
  }
  if (stage === 5) {
    const xs = [55, 143, 231, 319, 407, 495, 583];
    return `
      ${tx(320, 46, "如果是 7 个进程：全部卡住", { s: 18, c: SVGC.bad, w: 900 })}
      ${tx(320, 76, "7 × 1 + 1 = 8 > 7", { s: 19, c: SVGC.bad, w: 900, ff: "Georgia,serif" })}
      ${xs.map((x, i) => `
        ${miniProc(x, 158, `P${i + 1}`, { dots: 0, r: 25, color: SVGC.bad })}
        ${printerIcon(x - 13, 199, 26, SVGC.bad)}
      `).join("")}
      ${mark(320, 296, false, { r: 18 })}
      ${tag(320, 344, "每人 1 台，谁都要不到第 2 台 → 死锁", { s: 15, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 378, "所以 N 最多取 6", { s: 13, c: SVGC.ink2 })}`;
  }
  const xs = [70, 166, 262, 358, 454, 550];
  return `
    ${tx(320, 44, "例（23 卷）：19 台，每进程共需 4 台", { s: 17, w: 900 })}
    ${tx(320, 74, "3N + 1 ≤ 19  →  N ≤ 6", { s: 21, c: SVGC.warn, w: 900, ff: "Georgia,serif" })}
    ${xs.map((x, i) => miniProc(x, 156, `P${i + 1}`, { dots: 3, r: 28 })).join("")}
    ${tag(320, 218, "最坏：6 × 3 = 18 台，还剩 1 台", { s: 13, c: SVGC.res, stroke: SVGC.res })}
    ${tx(320, 286, "19 台 − 18 台 = 1 台", { s: 17, c: SVGC.proc, w: 900 })}
    ${tag(320, 334, "N = 6 时一定有人凑齐第 4 台；N = 7 需要 22 台，不够", { s: 13, c: SVGC.ok, stroke: SVGC.ok })}
    ${tag(320, 372, "答案：N 最多 6", { s: 15, c: SVGC.warn, stroke: SVGC.warn })}`;
}

const CARD2_ANIMS = [
  {
    id: "p2a1", no: "2.1", title: "资源分配图：圆、方框、两种箭头",
    frames: [
      FR("资源分配图：进程用圆，资源用方框；先认这两种形状。", ragDiagram(1)),
      FR("资源框里的圆点表示实例数。这个例子里 R1、R2 各只有 1 个。", ragDiagram(2)),
      FR("R → P 的箭头表示“这个资源已经分配给它”。", ragDiagram(3)),
      FR("P → R 的箭头表示“这个进程正在请求这个资源”。", ragDiagram(4)),
      FR("P1 占着 R1、请求 R2；P2 占着 R2、请求 R1。形成环 → 死锁。", ragDiagram(5), 4200),
      FR("记：P→R 是请求，R→P 是已分配。", ragDiagram(6), 4000)
    ]
  },
  {
    id: "p2a2", no: "2.2", title: "图的简化：擦边判断死锁",
    frames: [
      FR("简化方法：找一个“所有请求都能满足”的进程，让它跑完、释放资源，再擦掉它的边。", simplifyDiagram(1)),
      FR("P2 没有任何请求，它的请求全部满足，可以运行。", simplifyDiagram(2)),
      FR("P2 跑完，释放 R2；擦掉 P2 和它相关的边。", simplifyDiagram(3)),
      FR("R2 空出来了，P1 的请求得到满足。", simplifyDiagram(4)),
      FR("重复下去，所有进程都能跑完、所有边都擦掉 = 可完全简化 = 无死锁。", simplifyDiagram(5), 4000),
      FR("如果怎么找都还有边擦不掉 = 不可完全简化 = 死锁。", simplifyDiagram(6), 4200)
    ]
  },
  {
    id: "p2a3", no: "2.3", title: "四个必要条件与四种策略",
    frames: [
      FR("四个必要条件同时成立，才可能死锁：互斥、请求并保持、不可剥夺、环路等待。", conditionsDiagram(-1)),
      FR("互斥：资源一次只能给一个进程用——一般不能破坏。", conditionsDiagram(0)),
      FR("请求并保持：占着资源又申请新的。破坏办法：一次性申请全部资源（预先分配）。", conditionsDiagram(1)),
      FR("不可剥夺：拿到就不放。破坏办法：申请不到就释放已占资源，或强行剥夺。", conditionsDiagram(2)),
      FR("环路等待：首尾相接等资源。破坏办法：资源按编号顺序申请。", conditionsDiagram(3)),
      FR("四种策略：预防破坏必要条件；避免用银行家算法；检测靠化简；解除靠剥夺或撤销。", strategiesDiagram(), 4400)
    ]
  },
  {
    id: "p2a4", no: "2.4", title: "资源数公式与两个真题例子",
    frames: [
      FR("每个进程最多需要 k 个资源，系统共有 R 个。", resourceDiagram(1)),
      FR("最坏情况：每个进程各拿 k−1 个，都还差最后 1 个。", resourceDiagram(2)),
      FR("只要再多 1 个资源，就一定能让某个进程凑齐、跑完、释放。", resourceDiagram(3)),
      FR("25 卷：7 台打印机，每进程最多 2 台。N×1+1≤7 → N 最多 6。", resourceDiagram(4), 4200),
      FR("如果放 7 个进程，每人占 1 台，全部卡住——这就是 7 > 6。", resourceDiagram(5), 4200),
      FR("23 卷：19 台，每进程共需 4 台。3N+1≤19 → N 最多 6。", resourceDiagram(6), 4400)
    ]
  }
];

const CARD2 = {
  id: "p2", num: "②", short: "死锁", kicker: "资源图 · 化简 · 四个条件 · 公式",
  title: "死锁",
  color: "var(--c-block)",
  intro: "死锁这张最容易“背了不会用”。先会用圆和方框画资源分配图，再记住化简和公式，选择题基本就稳了。",
  chips: ["资源分配图", "图化简", "四个必要条件", "银行家算法", "N×(k−1)+1≤R"],
  anims: CARD2_ANIMS,
  compare: {
    cols: [
      {
        name: "死锁", color: "var(--c-bad)", shape: "circle", tag: "已经卡住",
        points: [
          "相关进程互相等待，谁也走不了",
          "只是相关进程卡住",
          "不是所有进程都停",
          "更不等于整个系统崩溃"
        ]
      },
      {
        name: "不安全状态", color: "var(--c-warn)", shape: "square", tag: "可能死锁",
        points: [
          "只是“可能”进入死锁",
          "不等于已经死锁",
          "银行家算法在分配前检查安全"
        ]
      }
    ],
    facts: [
      { ok: true, text: "死锁时只是相关进程卡住，不是所有进程都停" },
      { ok: false, text: "死锁一定会导致整个系统崩溃" },
      { ok: true, text: "不安全状态只是可能死锁，并不等于死锁" },
      { ok: false, text: "系统处于不安全状态，就已经死锁了" },
      { ok: true, text: "资源分配图不可完全简化是题目给出的死锁充分条件" }
    ]
  },
  mnemonic: "互斥保持不剥夺，再加环路就死锁；预先分配破保持。",
  mnNote: "死锁只卡住相关进程，不等于系统崩溃；不安全状态也不等于死锁。",
  quiz: ["q8", "q9", "q10", "q11", "q12"]
};

/* ============================================================
   卡③ I/O
   ============================================================ */
function ioModes(active) {
  const rows = [
    { label: "程序直接控制", y: 96 },
    { label: "中断驱动", y: 164 },
    { label: "DMA", y: 232 },
    { label: "通道", y: 300 }
  ];
  const X = 152, W = 458, H = 26;
  function dimFor(i) { return active >= 0 && active !== i ? 0.3 : 1; }
  const bars = rows.map((r, i) => {
    let content = "";
    if (i === 0) {
      content = `<rect x="${X}" y="${r.y}" width="${W}" height="${H}" rx="5" fill="${SVGC.proc}" class="grow"/>
        ${tx(X + W / 2, r.y + H / 2, "反复查询设备状态 · 全程忙等", { s: 11.5, c: "#fff", w: 800 })}`;
    } else if (i === 1) {
      for (let b = 0; b < 4; b++) {
        for (let j = 0; j < 4; j++) {
          content += `<rect x="${X + b * 114.5 + j * 27}" y="${r.y}" width="8" height="${H}" rx="2" fill="${SVGC.proc}" class="grow"/>`;
        }
      }
      content += `<rect x="${X}" y="${r.y}" width="${W}" height="${H}" rx="5" fill="none" stroke="${SVGC.line2}" stroke-width="1"/>`;
    } else if (i === 2) {
      for (let b = 0; b < 4; b++) {
        const bx = X + b * 114.5;
        content += `<rect x="${bx}" y="${r.y}" width="14" height="${H}" rx="3" fill="${SVGC.proc}" class="grow"/>`;
        content += `<rect x="${bx + 102}" y="${r.y}" width="11" height="${H}" rx="3" fill="${SVGC.proc}" class="grow"/>`;
      }
      content += `<rect x="${X}" y="${r.y}" width="${W}" height="${H}" rx="5" fill="none" stroke="${SVGC.line2}" stroke-width="1"/>`;
    } else {
      content = `<rect x="${X}" y="${r.y}" width="16" height="${H}" rx="3" fill="${SVGC.proc}" class="grow"/>
        <rect x="${X + W - 14}" y="${r.y}" width="14" height="${H}" rx="3" fill="${SVGC.proc}" class="grow"/>
        <rect x="${X}" y="${r.y}" width="${W}" height="${H}" rx="5" fill="none" stroke="${SVGC.line2}" stroke-width="1"/>`;
    }
    const on = active === i;
    return `<g opacity="${dimFor(i)}">
      ${on ? box(X - 9, r.y - 8, W + 18, H + 16, { stroke: SVGC.accent, sw: 2, rx: 9, dash: "5 4" }) : ""}
      ${tx(140, r.y + H / 2, r.label, { s: 13, a: "end", c: on ? SVGC.accent : SVGC.ink, w: on ? 900 : 700 })}
      ${content}
    </g>`;
  }).join("");

  return `
    ${tx(320, 40, "读 4 个数据块：CPU 在四种方式下忙不忙？", { s: 17, w: 900 })}
    ${rectLegend(360, 62, SVGC.proc, "CPU 忙")}
    ${rectLegend(455, 62, "var(--line2)", "CPU 空闲 / 设备在工作")}
    ${boxesAndBlocks()}
    ${bars}
    ${tag(320, 372, "CPU 干预：直接控制 > 中断 > DMA > 通道", { s: 13, c: SVGC.ink2 })}`;
}
function rectLegend(x, y, c, label) {
  return `<rect x="${x}" y="${y - 7}" width="15" height="12" rx="3" fill="${c}"/>${tx(x + 21, y, label, { s: 11.5, a: "start", c: SVGC.ink2, w: 600 })}`;
}
function boxesAndBlocks() {
  const X = 152, W = 458;
  let out = "";
  for (let b = 0; b <= 4; b++) {
    out += ln(X + b * 114.5, 88, X + b * 114.5, 332, { c: SVGC.line2, sw: 1, op: 0.45, dash: "2 4" });
  }
  for (let b = 0; b < 4; b++) {
    out += tx(X + b * 114.5 + 57, 348, `块 ${b + 1}`, { s: 10.5, c: SVGC.muted, w: 600 });
  }
  return out;
}

function bufferDiagram(stage) {
  if (stage === 1) {
    return `
      ${box(44, 148, 110, 84, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2.4, rx: 12, op: 0.12 })}
      ${tx(99, 190, "CPU", { s: 20, c: SVGC.cpu, w: 900 })}
      ${box(494, 142, 104, 96, { fill: SVGC.disk, stroke: SVGC.disk, sw: 2.4, rx: 12, op: 0.1 })}
      ${tx(546, 180, "打印机", { s: 16, c: SVGC.disk, w: 900 })}
      ${tx(546, 208, "慢", { s: 12, c: SVGC.ink2, w: 700 })}
      ${arrow(160, 190, 486, 190, { c: SVGC.ink2, key: "ink", sw: 2.8 })}
      ${tag(323, 162, "直接送数据", { s: 12, c: SVGC.ink2 })}
      ${box(30, 134, 138, 112, { stroke: SVGC.bad, sw: 2.2, rx: 14, dash: "5 4" })}
      ${tag(99, 276, "CPU 只能干等", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}
      ${tag(320, 340, "CPU 速度远高于打印机 → 不匹配", { s: 14, c: SVGC.bad, stroke: SVGC.bad })}`;
  }
  if (stage === 2) {
    return `
      ${box(36, 148, 104, 84, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2.4, rx: 12, op: 0.12 })}
      ${tx(88, 190, "CPU", { s: 19, c: SVGC.cpu, w: 900 })}
      ${box(258, 134, 120, 112, { fill: SVGC.buf, stroke: SVGC.buf, sw: 2.6, rx: 12, op: 0.1 })}
      ${tx(318, 158, "缓冲区", { s: 15, c: SVGC.buf, w: 900 })}
      ${[0, 1, 2].map(i => `<rect x="278" y="${174 + i * 20}" width="80" height="13" rx="3" fill="${SVGC.buf}" opacity=".3"/>`).join("")}
      ${box(498, 142, 100, 96, { fill: SVGC.disk, stroke: SVGC.disk, sw: 2.4, rx: 12, op: 0.1 })}
      ${tx(548, 180, "打印机", { s: 15, c: SVGC.disk, w: 900 })}
      ${tx(548, 208, "慢慢取", { s: 12, c: SVGC.ink2, w: 700 })}
      ${arrow(144, 190, 252, 190, { c: SVGC.proc, key: "darkblue", sw: 3 })}
      ${arrow(382, 190, 492, 190, { c: SVGC.buf, key: "amber", sw: 2.4, dash: "6 4" })}
      ${tag(197, 162, "快速放下", { s: 12, c: SVGC.proc, stroke: SVGC.proc })}
      ${tag(437, 162, "慢慢取走", { s: 12, c: SVGC.buf, stroke: SVGC.buf })}
      ${tag(318, 286, "CPU 把数据丢进缓冲区，就去干别的", { s: 14, c: SVGC.buf, stroke: SVGC.buf })}`;
  }
  if (stage === 3) {
    const X = 120, W = 450;
    return `
      ${tx(320, 46, "单缓冲的时间轴", { s: 18, w: 900 })}
      ${tx(68, 118, "CPU", { s: 14, a: "end", c: SVGC.cpu, w: 800 })}
      ${tx(68, 218, "打印机", { s: 14, a: "end", c: SVGC.disk, w: 800 })}
      <rect x="${X}" y="102" width="${W}" height="30" rx="5" fill="var(--bg2)" stroke="${SVGC.line2}"/>
      <rect x="${X}" y="202" width="${W}" height="30" rx="5" fill="var(--bg2)" stroke="${SVGC.line2}"/>
      ${[
        [0, 55], [110, 55], [220, 55], [330, 55]
      ].map(([dx, w]) => `<rect x="${X + dx}" y="102" width="${w}" height="30" rx="4" fill="${SVGC.proc}" opacity=".8"/>`).join("")}
      ${[
        [70, 120], [200, 120], [330, 120]
      ].map(([dx, w]) => `<rect x="${X + dx}" y="202" width="${w}" height="30" rx="4" fill="${SVGC.disk}" opacity=".7"/>`).join("")}
      ${tx(X + 27, 117, "装", { s: 11, c: "#fff", w: 900 })}
      ${tx(X + 130, 117, "装", { s: 11, c: "#fff", w: 900 })}
      ${tx(X + 247, 117, "装", { s: 11, c: "#fff", w: 900 })}
      ${tx(X + 357, 117, "装", { s: 11, c: "#fff", w: 900 })}
      ${tx(X + 130, 217, "慢慢打印", { s: 11, c: "#fff", w: 800 })}
      ${tag(X + 230, 158, "CPU 装完就走，不用等打印", { s: 13, c: SVGC.ok, stroke: SVGC.ok })}
      ${tag(320, 292, "缓冲技术解决 CPU 与外设速度不匹配", { s: 15, c: SVGC.warn, stroke: SVGC.warn })}
      ${tag(320, 332, "单缓冲：一块缓冲区，装和取轮流用", { s: 12.5, c: SVGC.ink2 })}`;
  }
  if (stage === 4) {
    return `
      ${box(30, 150, 92, 90, { fill: SVGC.cpu, stroke: SVGC.cpu, sw: 2.4, rx: 12, op: 0.12 })}
      ${tx(76, 195, "CPU", { s: 17, c: SVGC.cpu, w: 900 })}
      ${box(194, 92, 146, 82, { fill: SVGC.buf, stroke: SVGC.buf, sw: 2.4, rx: 12, op: 0.1 })}
      ${tx(267, 122, "缓冲 B1", { s: 14, c: SVGC.buf, w: 800 })}
      ${tx(267, 148, "正在装", { s: 11.5, c: SVGC.proc, w: 700 })}
      ${box(194, 230, 146, 82, { fill: SVGC.buf, stroke: SVGC.buf, sw: 2.4, rx: 12, op: 0.1 })}
      ${tx(267, 260, "缓冲 B2", { s: 14, c: SVGC.buf, w: 800 })}
      ${tx(267, 286, "正在取", { s: 11.5, c: SVGC.disk, w: 700 })}
      ${box(500, 150, 100, 96, { fill: SVGC.disk, stroke: SVGC.disk, sw: 2.4, rx: 12, op: 0.1 })}
      ${tx(550, 188, "打印机", { s: 15, c: SVGC.disk, w: 900 })}
      ${arrow(126, 180, 188, 140, { c: SVGC.proc, key: "darkblue", sw: 2.8 })}
      ${arrow(340, 266, 494, 206, { c: SVGC.buf, key: "amber", sw: 2.8, dash: "6 4" })}
      ${arrow(262, 178, 262, 226, { c: SVGC.thread, key: "teal", sw: 2, dash: "4 4" })}
      ${arrow(272, 226, 272, 178, { c: SVGC.thread, key: "teal", sw: 2, dash: "4 4" })}
      ${tag(312, 202, "交换", { s: 11.5, c: SVGC.thread, stroke: SVGC.thread })}
      ${tag(320, 348, "双缓冲：一块在装，一块在取，CPU 等得更少", { s: 14, c: SVGC.ok, stroke: SVGC.ok })}`;
  }
  return `
    ${tx(320, 56, "缓冲技术", { s: 20, w: 900 })}
    ${[
      { t: "单缓冲", d: "一块缓冲区，装和取轮流", c: SVGC.buf },
      { t: "双缓冲", d: "两块轮流，一块装一块取", c: SVGC.thread },
      { t: "目的", d: "解决 CPU 与外设速度不匹配", c: SVGC.ok }
    ].map((it, i) => `
      <g class="pop" style="animation-delay:${i * .08}s">
        ${box(22 + i * 202, 104, 188, 170, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 15 })}
        ${tx(116 + i * 202, 148, it.t, { s: 19, c: it.c, w: 900 })}
        ${tlines(116 + i * 202, 200, it.d.match(/.{1,7}/g), { s: 12.5, c: SVGC.ink2, w: 600, lh: 22 })}
      </g>`).join("")}
    ${tag(320, 332, "CPU 把数据丢进缓冲区就去干别的，外设慢慢取", { s: 13.5, c: SVGC.ink2 })}`;
}

function spoolDiagram(stage) {
  if (stage === 5) {
    return `
      ${tx(320, 54, "SPOOLing 的效果", { s: 20, w: 900 })}
      ${[
        { t: "独占 → 共享", d: "打印机不再被一个进程长期占住", c: SVGC.ok },
        { t: "提高 I/O 速度", d: "进程只写到磁盘，不必等打印", c: SVGC.proc },
        { t: "虚拟设备", d: "把独占设备变成共享设备", c: SVGC.thread }
      ].map((it, i) => `
        <g class="pop" style="animation-delay:${i * .08}s">
          ${box(20 + i * 202, 96, 190, 190, { fill: "var(--card)", stroke: it.c, sw: 2.2, rx: 15 })}
          ${tx(115 + i * 202, 140, it.t, { s: 17, c: it.c, w: 900 })}
          ${tlines(115 + i * 202, 196, it.d.match(/.{1,7}/g), { s: 12.5, c: SVGC.ink2, w: 600, lh: 22 })}
        </g>`).join("")}
      ${tag(320, 340, "输出井在磁盘，输出缓冲区在内存", { s: 14, c: SVGC.warn, stroke: SVGC.warn })}`;
  }
  const procs = [108, 200, 292];
  const showWell = stage >= 2;
  const showDaemon = stage >= 3;
  return `
    ${procs.map((y, i) => `
      ${miniProc(70, y, `P${i + 1}`, { r: 27, color: stage === 1 && i > 0 ? SVGC.bad : SVGC.proc })}
      ${arrow(102, y, 246, y, {
        c: stage === 1 && i > 0 ? SVGC.muted : SVGC.proc,
        key: "darkblue", sw: 2.2,
        op: stage === 1 && i > 0 ? 0.3 : 1
      })}
    `).join("")}
    ${showWell ? `
      ${box(246, 70, 176, 270, { fill: SVGC.disk, stroke: SVGC.disk, sw: 2.4, rx: 14, op: 0.07 })}
      ${tx(334, 92, "输出井（磁盘）", { s: 14, c: SVGC.disk, w: 900 })}
      ${[0, 1, 2].map(i => {
        const yy = 116 + i * 62;
        return `<g class="pop" style="animation-delay:${i * .07}s">
          <rect x="270" y="${yy}" width="128" height="44" rx="7" fill="var(--card)" stroke="${SVGC.disk}" stroke-width="1.7"/>
          ${tx(286, yy + 22, `作业 ${i + 1}`, { s: 12, a: "start", c: SVGC.disk, w: 700 })}
          <path d="M370,${yy + 15} h14 M370,${yy + 22} h14 M370,${yy + 29} h9" stroke="${SVGC.disk}" stroke-width="2" stroke-linecap="round" opacity=".6"/>
        </g>`;
      }).join("")}
    ` : `
      ${box(246, 70, 176, 270, { stroke: SVGC.line2, sw: 2, rx: 14, dash: "6 6", op: 0.5 })}
      ${tx(334, 200, "还没有输出井", { s: 13, c: SVGC.muted, w: 600 })}
    `}
    ${box(488, 150, 112, 100, { fill: SVGC.disk, stroke: SVGC.disk, sw: 2.4, rx: 12, op: 0.1 })}
    ${tx(544, 184, "打印机", { s: 15, c: SVGC.disk, w: 900 })}
    ${tx(544, 212, "独占设备", { s: 11.5, c: stage === 1 ? SVGC.bad : SVGC.ink2, w: 700 })}
    ${stage === 1 ? `
      <g class="pop">
        <rect x="536" y="168" width="16" height="12" rx="2" fill="none" stroke="${SVGC.bad}" stroke-width="2"/>
        <path d="M540,168 v-5 a4,4 0 1 1 8,0 v5" fill="none" stroke="${SVGC.bad}" stroke-width="2"/>
      </g>
      ${tag(320, 360, "多个进程抢一台打印机：谁占住，别人只能等", { s: 13, c: SVGC.bad, stroke: SVGC.bad })}
    ` : ""}
    ${stage === 2 ? tag(320, 366, "先写到磁盘上的输出井，不直接抢打印机", { s: 13, c: SVGC.disk, stroke: SVGC.disk }) : ""}
    ${showDaemon ? `
      <circle cx="434" cy="306" r="34" fill="${SVGC.thread}" opacity=".12" stroke="${SVGC.thread}" stroke-width="2"/>
      ${tx(434, 299, "守护", { s: 11.5, c: SVGC.thread, w: 900 })}
      ${tx(434, 315, "进程", { s: 11.5, c: SVGC.thread, w: 900 })}
      ${arrow(472, 306, 486, 232, { c: SVGC.thread, key: "teal", sw: 2.6 })}
    ` : ""}
    ${stage === 3 ? tag(320, 366, "守护进程从输出井里逐个取出，交给打印机", { s: 13, c: SVGC.thread, stroke: SVGC.thread }) : ""}
    ${stage === 4 ? `
      ${tag(186, 360, "输出缓冲区 → 内存", { s: 13, c: SVGC.proc, stroke: SVGC.proc })}
      ${tag(452, 360, "输入井 / 输出井 → 磁盘", { s: 13, c: SVGC.disk, stroke: SVGC.disk })}
    ` : ""}`;
}

function deviceIndep(stage) {
  return `
    ${tx(320, 40, "设备独立性：程序只认逻辑名", { s: 18, w: 900 })}
    ${box(28, 110, 196, 168, { fill: "var(--card)", stroke: SVGC.proc, sw: 2.4, rx: 14 })}
    ${tx(126, 138, "用户程序", { s: 15, c: SVGC.proc, w: 900 })}
    ${tx(46, 178, 'open("printer")', { s: 14, a: "start", c: SVGC.ink, w: 700, ff: "Consolas,monospace" })}
    ${tx(46, 210, "write(data)", { s: 14, a: "start", c: SVGC.ink2, w: 700, ff: "Consolas,monospace" })}
    ${tx(46, 242, "close()", { s: 14, a: "start", c: SVGC.ink2, w: 700, ff: "Consolas,monospace" })}
    ${stage === 3 ? tag(126, 300, "程序一个字都没改", { s: 13, c: SVGC.ok, stroke: SVGC.ok }) : tag(126, 300, "只写逻辑设备名", { s: 13, c: SVGC.proc, stroke: SVGC.proc })}
    ${arrow(228, 194, 276, 194, { c: SVGC.proc, key: "darkblue", sw: 2.6 })}
    ${box(280, 104, 166, 182, { fill: "var(--card)", stroke: SVGC.warn, sw: 2.4, rx: 14 })}
    ${tx(363, 132, "系统映射表", { s: 14, c: SVGC.warn, w: 900 })}
    ${box(300, 154, 126, 40, { fill: "var(--bg2)", stroke: SVGC.line2, sw: 1.5, rx: 8 })}
    ${tx(363, 174, "printer", { s: 13, c: SVGC.proc, w: 800 })}
    ${arrow(363, 198, 363, 224, { c: SVGC.warn, key: "amber", sw: 2.2 })}
    ${box(300, 228, 126, 40, { fill: "var(--bg2)", stroke: stage === 3 ? SVGC.thread : SVGC.ok, sw: 2, rx: 8 })}
    ${tx(363, 248, stage === 3 ? "打印机 B" : "打印机 A", { s: 13, c: stage === 3 ? SVGC.thread : SVGC.ok, w: 800 })}
    ${arrow(450, 194, 492, stage === 3 ? 272 : 160, { c: SVGC.warn, key: "amber", sw: 2.6, dash: "6 4" })}
    ${deviceBox(496, 112, "打印机 A", "LPT1", stage !== 3, SVGC.ok)}
    ${deviceBox(496, 236, "打印机 B", "USB", stage === 3, SVGC.thread)}
    ${tag(320, 342, stage === 3
      ? "换了物理设备，只改映射：程序仍然使用 printer 这个名字"
      : "系统把逻辑设备名映射到某台具体的物理设备", { s: 13.5, c: stage === 3 ? SVGC.ok : SVGC.ink2, stroke: stage === 3 ? SVGC.ok : SVGC.muted })}`;
}
function deviceBox(x, y, name, port, active, c) {
  return `<g class="${active ? "pop" : ""}" opacity="${active ? 1 : 0.42}">
    ${box(x, y, 112, 86, { fill: "var(--card)", stroke: c, sw: active ? 2.8 : 1.6, rx: 12 })}
    ${tx(x + 56, y + 26, name, { s: 12.5, c, w: 800 })}
    ${tx(x + 56, y + 50, port, { s: 11.5, c: SVGC.ink2, w: 600 })}
    <rect x="${x + 40}" y="${y + 62}" width="32" height="10" rx="2" fill="${c}" opacity=".25"/>
  </g>`;
}

function diskTime(stage) {
  const cx = 176, cy = 196;
  const trackR = stage === 2 ? 66 : 78;
  const sectorA = stage === 3 ? 130 : 48;
  const [sx1, sy1] = polar(cx, cy, trackR, sectorA);
  const [sx2, sy2] = polar(cx, cy, trackR, sectorA + 34);
  const sectorColor = stage === 4 ? SVGC.run : stage === 3 ? SVGC.ready : SVGC.buf;
  const timeline = `
    ${tx(140, 352, "寻道", { s: 11, a: "end", c: stage === 2 ? SVGC.proc : SVGC.ink2, w: 800 })}
    ${tx(330, 352, "旋转延迟", { s: 11, c: stage === 3 ? SVGC.ready : SVGC.ink2, w: 800 })}
    ${tx(500, 352, "传输", { s: 11, c: stage === 4 ? SVGC.run : SVGC.ink2, w: 800 })}
    <rect x="150" y="366" width="440" height="18" rx="4" fill="var(--bg2)" stroke="${SVGC.line2}"/>
    <rect x="150" y="366" width="120" height="18" rx="4" fill="${SVGC.proc}" opacity="${stage === 2 ? .95 : .28}"/>
    <rect x="270" y="366" width="180" height="18" fill="${SVGC.ready}" opacity="${stage === 3 ? .95 : .28}"/>
    <rect x="450" y="366" width="80" height="18" fill="${SVGC.run}" opacity="${stage === 4 ? .95 : .28}"/>
    <rect x="530" y="366" width="60" height="18" rx="4" fill="var(--line2)" opacity=".6"/>`;
  let lead = "";
  if (stage === 1) {
    lead = tag(320, 42, "访问时间 = 寻道时间 + 旋转延迟 + 传输时间", { s: 17, c: SVGC.warn, stroke: SVGC.warn });
  } else if (stage === 2) {
    lead = tag(320, 42, "① 寻道：磁头移到目标磁道", { s: 16, c: SVGC.proc, stroke: SVGC.proc });
  } else if (stage === 3) {
    lead = tag(320, 42, "② 旋转延迟：等目标扇区转到磁头下（取决于当前位置）", { s: 14.5, c: SVGC.ready, stroke: SVGC.ready });
  } else if (stage === 4) {
    lead = tag(320, 42, "③ 传输：真正读写数据", { s: 16, c: SVGC.run, stroke: SVGC.run });
  } else {
    lead = tag(320, 42, "磁盘调度算法只优化寻道时间", { s: 17, c: SVGC.warn, stroke: SVGC.warn });
  }
  return `
    ${lead}
    <circle cx="${cx}" cy="${cy}" r="106" fill="${SVGC.disk}" opacity=".07"/>
    <circle cx="${cx}" cy="${cy}" r="106" fill="none" stroke="${SVGC.disk}" stroke-width="2.4"/>
    ${[44, 66, 88].map(r => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${SVGC.disk}" stroke-width="1.2" opacity=".35" stroke-dasharray="3 4"/>`).join("")}
    <circle cx="${cx}" cy="${cy}" r="15" fill="var(--stage)" stroke="${SVGC.disk}" stroke-width="2"/>
    ${stage === 2 ? `<circle cx="${cx}" cy="${cy}" r="66" fill="none" stroke="${SVGC.proc}" stroke-width="5" opacity=".85" class="pulse"/>` : ""}
    <path d="M${sx1},${sy1} A${trackR},${trackR} 0 0 1 ${sx2},${sy2}" fill="none" stroke="${sectorColor}" stroke-width="16" stroke-linecap="round" class="${stage >= 3 ? "pulse" : ""}"/>
    ${stage === 2 ? `<path d="M418,282 L${cx + 58},${cy + 38}" stroke="${SVGC.proc}" stroke-width="6" stroke-linecap="round"/><circle cx="${cx + 58}" cy="${cy + 38}" r="7" fill="${SVGC.proc}"/>` : `<path d="M444,272 L${cx + 82},${cy + 22}" stroke="${SVGC.cpu}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx + 82}" cy="${cy + 22}" r="6" fill="${SVGC.cpu}"/>`}
    ${stage === 1 ? tag(176, 332, "盘面", { s: 11, c: SVGC.disk }) : ""}
    ${timeline}
    ${stage === 5 ? tag(320, 322, "旋转延迟取决于磁头当前位置，一次具体访问并不固定", { s: 13, c: SVGC.bad, stroke: SVGC.bad }) : ""}`;
}
function polar(cx, cy, r, deg) {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

const CARD3_ANIMS = [
  {
    id: "p3a1", no: "3.1", title: "四种 I/O 控制方式：CPU 到底忙不忙",
    frames: [
      FR("任务：从设备读 4 个数据块。比较四种方式下 CPU 的忙闲。", ioModes(-1)),
      FR("程序直接控制：CPU 反复查询设备状态，全程忙等。", ioModes(0), 4000),
      FR("中断驱动：设备每完成一个字（或字节）就打断 CPU 一次。", ioModes(1), 4000),
      FR("DMA：控制器直接在主存和设备之间搬一整块，CPU 只在开始发命令、结束时处理一次中断。", ioModes(2), 4400),
      FR("通道：专用 I/O 处理器执行通道程序，完成一组相关 I/O 后才通知 CPU，干预最少。", ioModes(3), 4400),
      FR("从直接控制到通道，CPU 的干预越来越少；通道实现主存与外设之间的信息传输。", ioModes(-1), 4400)
    ]
  },
  {
    id: "p3a2", no: "3.2", title: "缓冲：解决 CPU 与外设速度不匹配",
    frames: [
      FR("CPU 速度远高于打印机，直接送数据，CPU 只能干等。", bufferDiagram(1)),
      FR("加一块缓冲区：CPU 把数据放进去就去干别的，打印机慢慢取。", bufferDiagram(2)),
      FR("看时间轴：CPU 装完就走，不用等打印机。", bufferDiagram(3)),
      FR("双缓冲：一块在装、一块在取，CPU 等得更少。", bufferDiagram(4), 4200),
      FR("缓冲技术解决 CPU 与外设速度不匹配。", bufferDiagram(5), 4000)
    ]
  },
  {
    id: "p3a3", no: "3.3", title: "SPOOLing：独占设备变共享",
    frames: [
      FR("多个进程都要打印，打印机是独占设备：一个占住，别人只能等。", spoolDiagram(1)),
      FR("数据不直接送打印机，先写到磁盘上的“输出井”。", spoolDiagram(2)),
      FR("打印机守护进程从输出井里逐个取出，交给打印机。", spoolDiagram(3), 4200),
      FR("注意位置：输入/输出缓冲区在内存，输入井和输出井在磁盘。", spoolDiagram(4), 4200),
      FR("效果：独占变共享，提高 I/O 速度，实现虚拟设备。", spoolDiagram(5), 4000)
    ]
  },
  {
    id: "p3a4", no: "3.4", title: "设备独立性：逻辑名 → 物理设备",
    frames: [
      FR("程序里写逻辑设备名，比如 printer，不直接写某台机器。", deviceIndep(1)),
      FR("系统查映射表，把逻辑名映射到一台具体的物理设备。", deviceIndep(2)),
      FR("换了物理设备，只改映射；程序仍然用 printer 这个名字，一行不用改。", deviceIndep(3), 4200)
    ]
  },
  {
    id: "p3a5", no: "3.5", title: "磁盘访问时间与调度优化谁",
    frames: [
      FR("磁盘访问时间 = 寻道时间 + 旋转延迟 + 传输时间。", diskTime(1)),
      FR("寻道：磁头移动到目标磁道。", diskTime(2)),
      FR("旋转延迟：等目标扇区转到磁头下面；取决于当前位置。", diskTime(3)),
      FR("传输：真正读写数据。", diskTime(4)),
      FR("磁盘调度算法只优化寻道时间；旋转延迟一次一个样，并不固定。", diskTime(5), 4400)
    ]
  }
];

const CARD3 = {
  id: "p3", num: "③", short: "I/O", kicker: "四种方式 · 缓冲 · SPOOLing · 磁盘",
  title: "I/O 管理",
  color: "var(--c-disk)",
  intro: "I/O 的选择题喜欢问“谁干预最少”“缓冲区在哪”“调度算法优化哪一段”。把四条时间轴和 SPOOLing 的图记住，比背定义快。",
  chips: ["程序直接控制", "中断驱动", "DMA", "通道", "缓冲", "SPOOLing"],
  anims: CARD3_ANIMS,
  compare: {
    cols: [
      {
        name: "DMA", color: "var(--c-res)", shape: "square", tag: "管一整块",
        points: [
          "DMA 控制器直接在主存和设备间搬运",
          "一次搬一整块数据",
          "开始发命令、结束处理一次中断",
          "CPU 干预较少"
        ]
      },
      {
        name: "通道", color: "var(--c-thread)", shape: "cpu", tag: "管一组",
        points: [
          "专用的 I/O 处理器",
          "执行通道程序",
          "完成一组相关 I/O 后才通知 CPU",
          "对 CPU 的干预最少"
        ]
      }
    ],
    facts: [
      { ok: true, text: "DMA 一次搬运一整块数据，CPU 只在首尾介入" },
      { ok: false, text: "通道每传一个字就中断 CPU 一次" },
      { ok: true, text: "输入/输出缓冲区在内存，输入井和输出井在磁盘" },
      { ok: false, text: "SPOOLing 的输出缓冲区也放在磁盘上" },
      { ok: true, text: "磁盘调度算法只优化寻道时间" },
      { ok: false, text: "磁盘一次 I/O 的旋转延迟在硬件设计时就固定了" }
    ]
  },
  mnemonic: "DMA 管一块，通道管一组；独占变共享，用 SPOOLing。",
  mnNote: "缓冲解决速度不匹配；SPOOLing 把独占设备变成共享设备。",
  quiz: ["q28", "q29", "q30", "q31"]
};

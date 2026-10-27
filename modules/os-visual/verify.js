'use strict';
const E = require('./engine.js');

let failures = 0;
function check(name, actual, expect, eps = 1e-9) {
  const ok = Math.abs(actual - expect) <= eps;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${actual}  (期望 ${expect})`);
  if (!ok) failures++;
}
function checkDeep(name, actual, expect) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expect);
  const ok = a === b;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${a}  (期望 ${b})`);
  if (!ok) failures++;
}
function ids(res) { return res.rows.map(r => r.id).join(','); }
function show(res) {
  console.log('  明细:', res.rows.map(r =>
    `${r.id}(到达${r.arrival},运行${r.burst}) 完成${r.completion} 周转${r.turnaround} 带权${r.weighted.toFixed(3)} 等待${r.waiting}`
  ).join(' | '));
  console.log('  平均: 周转', res.avgTurnaround, '带权', res.avgWeighted.toFixed(3), '等待', res.avgWaiting);
}

console.log('\n=== 1.1 指标示例（FCFS：P1(0,5), P2(2,6)） ===');
const metric = E.fcfs([{id:'P1',arrival:0,burst:5},{id:'P2',arrival:2,burst:6}]);
show(metric);
check('P2 开始时间', metric.rows[1].start, 5);
check('P2 等待时间', metric.rows[1].waiting, 3);
check('P2 周转时间', metric.rows[1].turnaround, 9);
check('P2 带权周转', metric.rows[1].weighted, 1.5);

console.log('\n=== 1.2 FCFS vs SJF（24 卷三.11） ===');
const jobs12 = [
  {id:'A',arrival:0,burst:6},
  {id:'B',arrival:0,burst:2},
  {id:'C',arrival:0,burst:10},
  {id:'D',arrival:0,burst:4}
];
const f12 = E.fcfs(jobs12);
const s12 = E.sjf(jobs12);
console.log('FCFS 顺序:', f12.segments.map(s=>s.id).join(' '));
show(f12);
checkDeep('FCFS 完成时间', f12.rows.map(r=>r.completion), [6,8,18,22]);
check('FCFS 平均周转', f12.avgTurnaround, 13.5);
check('FCFS 平均带权', f12.avgWeighted, 3.075);
console.log('SJF 顺序:', s12.segments.map(s=>s.id).join(' '));
show(s12);
check('SJF 平均周转', s12.avgTurnaround, 10.5);
check('SJF 平均带权', s12.avgWeighted, 1.675);

console.log('\n=== 1.3 抢占式 SJF（25 卷四.3） ===');
const jobs13 = [
  {id:'P1',arrival:0,burst:8},
  {id:'P2',arrival:1,burst:4},
  {id:'P3',arrival:2,burst:9},
  {id:'P4',arrival:3,burst:5}
];
const pre13 = E.srtf(jobs13);
console.log('抢占式段:', pre13.segments.map(s=>`${s.id}(${s.start}-${s.end})`).join(' '));
show(pre13);
checkDeep('抢占式完成时间', pre13.rows.map(r=>r.completion), [17,5,26,10]);
checkDeep('抢占式周转', pre13.rows.map(r=>r.turnaround), [17,4,24,7]);
check('抢占式平均周转', pre13.avgTurnaround, 13);
console.log('决策:');
pre13.decisions.forEach(d => console.log(' ', JSON.stringify(d)));
const np13 = E.sjf(jobs13);
console.log('非抢占 SJF 段:', np13.segments.map(s=>`${s.id}(${s.start}-${s.end})`).join(' '));
show(np13);
checkDeep('非抢占 SJF 周转', np13.rows.map(r=>r.turnaround), [8,11,24,14]);
check('非抢占 SJF 平均周转', np13.avgTurnaround, 14.25);

console.log('\n=== 1.4 RR（时间片 2） ===');
const rr14 = E.rr([{id:'P1',arrival:0,burst:5},{id:'P2',arrival:0,burst:3},{id:'P3',arrival:0,burst:2}], 2);
console.log('RR 段:', rr14.segments.map(s=>`${s.id}(${s.start}-${s.end})`).join(' '));
show(rr14);
console.log('轨迹:');
rr14.trace.forEach(t => console.log(' ', JSON.stringify(t)));
checkDeep('RR 周转', rr14.rows.map(r=>r.turnaround), [10,9,6]);
check('RR 平均周转', rr14.avgTurnaround, 25/3);
checkDeep('RR 等待', rr14.rows.map(r=>r.waiting), [5,6,4]);
check('RR 响应时间公式', 100 * 20, 2000);
check('RR 最坏等待公式', 9 * (200 + 10), 1890);

console.log('\n=== 1.5 HRRN ===');
const jobs15 = [
  {id:'J1',arrival:0,burst:3},
  {id:'J2',arrival:1,burst:6},
  {id:'J3',arrival:2,burst:4},
  {id:'J4',arrival:3,burst:1}
];
const h15 = E.hrrn(jobs15);
console.log('HRRN 段:', h15.segments.map(s=>`${s.id}(${s.start}-${s.end})`).join(' '));
show(h15);
h15.decisions.forEach(d => console.log(' t=' + d.t, 'chosen=' + d.chosen, (d.ratios||[]).map(r=>`${r.id}:${r.ratio.toFixed(2)}`).join(' ')));
check('HRRN 平均周转', h15.avgTurnaround, 7.5);
const s15 = E.sjf(jobs15);
console.log('SJF 段:', s15.segments.map(s=>`${s.id}(${s.start}-${s.end})`).join(' '));
show(s15);
check('SJF(1.5) 平均周转', s15.avgTurnaround, 5.75);

console.log('\n=== 4. S1 自测（非抢占 vs 抢占） ===');
const s1jobs = [
  {id:'P1',arrival:0,burst:7},
  {id:'P2',arrival:2,burst:4},
  {id:'P3',arrival:4,burst:1},
  {id:'P4',arrival:5,burst:4}
];
const s1np = E.sjf(s1jobs);
const s1p = E.srtf(s1jobs);
console.log('非抢占:'); show(s1np);
console.log('抢占:'); show(s1p);
check('S1 非抢占平均周转', s1np.avgTurnaround, 8);
check('S1 抢占平均周转', s1p.avgTurnaround, 7);
checkDeep('S1 非抢占周转', s1np.rows.map(r=>r.turnaround), [7,10,4,11]);
checkDeep('S1 抢占周转', s1p.rows.map(r=>r.turnaround), [16,5,1,6]);

console.log('\n=== 2. PV 公式与位示图 ===');
check('S2 时间片', Math.floor(3000 / 60), 50);
checkDeep('S3 信号量范围', E.semRange(3, 5), {min:-2, max:3});
const r23 = E.semRange(2, 6);
check('23 卷 信号量下界', r23.min, -4);
check('23 卷 信号量上界', r23.max, 2);
check('S6 位示图字数', E.bitmapWords(2000, 32), 63);
checkDeep('S6 盘块100(0起)', E.blockToPos(100, 32, 0), {i:3, j:4});
checkDeep('3.1 约定A 盘块35', E.blockToPos(35, 16, 0), {i:2, j:3});
check('3.1 约定A (5,9)', E.posToBlock(5, 9, 16, 0), 89);
checkDeep('3.1 约定B 盘块35', E.blockToPos(35, 16, 1), {i:3, j:3});
check('3.1 约定B (5,9)', E.posToBlock(5, 9, 16, 1), 73);
check('3.2 1000块/16位', E.bitmapWords(1000, 16), 63);

console.log('\n' + (failures ? `❌ ${failures} 项不一致` : '✅ 全部核对通过'));
process.exit(failures ? 1 : 0);

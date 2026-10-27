/* 核对参考值：用页面同一份 solver 计算，再与题目给出的核心参考值逐条比对 */
require('./src/solver.js');
const OS = globalThis.OS;
const D = OS.build();

let fail = 0;
function eq(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}: ${actual}${ok ? '' : '  != ' + expected}`);
}
function close(name, actual, expected, eps = 1e-6) {
  const ok = Math.abs(actual - expected) <= eps;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}: ${actual}${ok ? '' : '  != ' + expected}`);
}
function arr(name, actual, expected) {
  eq(name, JSON.stringify(actual), JSON.stringify(expected));
}

console.log('--- 模块① inode ---');
eq('每块指针数', D.inode.layout.p, 128);
eq('最大文件块数', D.inode.layout.totalBlocks, 2113674);
eq('最大文件字节数', D.inode.layout.maxBytes, 1082201088);
close('最大文件 MB', D.inode.layout.maxMB, 1032.0673828125, 1e-9);
eq('偏移 80000 所在块', D.inode.blockIndex, 156);
eq('偏移 80000 块内偏移', D.inode.blockOffset, 128);
eq('偏移 80000 区域', D.inode.access.region.key, 'double');
arr('偏移 80000 索引项', D.inode.access.entries, [0, 18]);
eq('偏移 80000 读盘次数', D.inode.access.reads, 3);
eq('1MB 数据块', D.inode.usage.dataBlocks, 2048);
eq('1MB 直接块', D.inode.usage.direct, 10);
eq('1MB 一级块', D.inode.usage.single, 128);
eq('1MB 二级块', D.inode.usage.double, 1910);
eq('1MB 一级索引块', D.inode.usage.singleIndexBlocks, 1);
eq('1MB 二级顶层索引块', D.inode.usage.doubleTopBlocks, 1);
eq('1MB 二级下层索引块', D.inode.usage.doubleL2Blocks, 15);
eq('1MB 装满的二级索引块', D.inode.usage.doubleFullL2, 14);
eq('1MB 最后一个二级索引块项数', D.inode.usage.doubleLastEntries, 118);
eq('1MB 索引块总数', D.inode.usage.indexBlocks, 17);
eq('1MB 总占用块数', D.inode.usage.totalBlocks, 2065);
eq('二级区起点', D.inode.layout.regions.find(r => r.key === 'double').start, 138);

console.log('--- 链接分配 ---');
eq('链接逻辑块', D.linked.logical, 7);
eq('链接块内偏移', D.linked.inner, 486);
eq('链接物理块', D.linked.physical, 37);

console.log('--- 两级索引 ---');
eq('两级每块项数', D.twoLevel.p, 256);
eq('两级最大 MB', D.twoLevel.maxMB, 64);

console.log('--- 模块② 地址变换 ---');
eq('题A 页大小', D.pagingA.pageSize, 2048);
eq('题A 页数', D.pagingA.pageCount, 128);
eq('题A 最大主存', D.pagingA.maxMem, 262144);
eq('题A 页号', D.pagingA.page, 1);
eq('题A 页内偏移', D.pagingA.offset, 752);
eq('题A 物理块', D.pagingA.frame, 3);
eq('题A 物理地址', D.pagingA.pa, 6896);
eq('题A 物理地址十六进制', D.pagingA.paHex, '1AF0');
eq('题B 页号位', D.pagingB.pageBits, 5);
eq('题B 页内位', D.pagingB.offsetBits, 11);
eq('题B 总位数', D.pagingB.totalBits, 16);
eq('题B 页号', D.pagingB.page, 1);
eq('题B 页内偏移', D.pagingB.offset, 1192);
eq('题B 物理块', D.pagingB.frame, 14);
eq('题B 物理地址', D.pagingB.pa, 29864);
eq('题B 物理地址十六进制', D.pagingB.paHex, '74A8');
eq('题B 页号二进制', D.pagingB.pageBin, '00001');
eq('题B 偏移二进制', D.pagingB.offsetBin, '10010101000');
eq('分段段内位', D.seg.offsetBits, 16);
eq('分段每段最大字节', D.seg.maxSegBytes, 65536);
eq('分段最大段数', D.seg.maxSegments, 256);

console.log('--- 模块③ 首次适应 ---');
const S = D.fit.snapshots;
arr('初始空闲', S[0].free, [{ start: 0, size: 512 }]);
arr('作业1后空闲', S[1].free, [{ start: 100, size: 412 }]);
arr('作业2后空闲', S[2].free, [{ start: 160, size: 352 }]);
arr('作业3后空闲', S[3].free, [{ start: 310, size: 202 }]);
arr('作业2释放后空闲', S[4].free, [{ start: 100, size: 60 }, { start: 310, size: 202 }]);
arr('作业4扫描', S[5].scan, [{ start: 100, size: 60, ok: false }, { start: 310, size: 202, ok: true }]);
arr('作业4后空闲', S[5].free, [{ start: 100, size: 60 }, { start: 390, size: 122 }]);
arr('作业1释放后空闲', S[6].free, [{ start: 0, size: 160 }, { start: 390, size: 122 }]);
eq('作业1释放合并次数', S[6].merges.length, 1);
arr('作业1释放合并块', S[6].mergedBlock, { start: 0, size: 160 });
arr('作业5后空闲', S[7].free, [{ start: 70, size: 90 }, { start: 390, size: 122 }]);
arr('最终已分配', S[7].alloc, [
  { name: '作业5', start: 0, size: 70 },
  { name: '作业3', start: 160, size: 150 },
  { name: '作业4', start: 310, size: 80 }
]);
eq('最终已分配 KB', D.fit.allocatedKB, 300);
close('内存利用率', D.fit.utilization, 0.5859375, 1e-12);
eq('利用率百分数一位小数', (D.fit.utilization * 100).toFixed(1), '58.6');

console.log('--- 首次适应对比 ---');
arr('首次适应选择', D.fitCmp.first, { start: 0, size: 100 });
arr('最佳适应选择', D.fitCmp.best, { start: 300, size: 80 });
arr('最坏适应选择', D.fitCmp.worst, { start: 100, size: 200 });

console.log('--- 模块④ TLB ---');
eq('命中时间', D.tlb.hitTime, 55);
eq('未命中时间', D.tlb.missTime, 105);
eq('有效访问时间', D.tlb.eat, 65);
eq('不设快表', D.tlb.noTlb, 100);
eq('试卷公式', D.tlb.exam, 65);
close('临界命中率', D.tlb.breakEven, 0.1, 1e-12);

console.log('--- 自测 ---');
eq('A1 每块项数', D.tests.A1.layout.p, 256);
eq('A1 最大块数', D.tests.A1.layout.totalBlocks, 65802);
eq('A1 最大 KB', D.tests.A1.layout.maxBytes / 1024, 65802);
close('A1 最大 MB', D.tests.A1.layout.maxMB, 64.259765625, 1e-9);
eq('A1 块号', D.tests.A1.byteBlock, 292);
eq('A1 块内偏移', D.tests.A1.blockOffset, 992);
eq('A1 区域', D.tests.A1.access.region.key, 'double');
eq('A1 二级区起点', D.tests.A1.access.region.start, 266);
eq('A1 读盘次数', D.tests.A1.access.reads, 3);
eq('A2 每块项数', D.tests.A2.layout.p, 128);
eq('A2 最大块数', D.tests.A2.layout.totalBlocks, 16645);
eq('B1 页号', D.tests.B1.page, 2);
eq('B1 偏移', D.tests.B1.offset, 952);
eq('B1 物理块', D.tests.B1.frame, 7);
eq('B1 物理地址', D.tests.B1.pa, 8120);
eq('B2 页号', D.tests.B2.page, 2);
eq('B2 偏移', D.tests.B2.offset, 0xb7c);
eq('B2 物理块', D.tests.B2.frame, 9);
eq('B2 物理地址十六进制', D.tests.B2.paHex, '9B7C');
arr('C1 最终空闲', D.tests.C1.finalFree, [
  { start: 0, size: 90 },
  { start: 130, size: 10 },
  { start: 360, size: 40 }
]);
eq('C1 已分配 KB', D.tests.C1.allocatedKB, 260);
close('C1 利用率', D.tests.C1.utilization, 0.65, 1e-12);
eq('D1 命中时间', D.tests.D1.hitTime, 110);
eq('D1 未命中时间', D.tests.D1.missTime, 210);
eq('D1 有效访问时间', D.tests.D1.eat, 120);
eq('D1 不设快表', D.tests.D1.noTlb, 200);

console.log(fail === 0 ? '\n全部通过' : `\n有 ${fail} 项不一致`);
process.exit(fail ? 1 : 0);

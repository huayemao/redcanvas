/**
 * 图层重排算法测试脚本（TDD RED 阶段）
 * 验证 4 种操作：up / down / top / bottom
 * 运行：node test-layer-reorder.mjs
 */

// —— 图层重排核心算法（与 useStudioStore 中实现保持一致）——
export function reorderElements(elements, targetId, direction) {
  const target = elements.find(e => e.id === targetId);
  if (!target) return elements;
  // 背景层不允许重排
  if (target.type === 'background') return elements;

  const bgZ = Math.min(...elements.filter(e => e.type === 'background').map(e => e.zIndex), 0);
  // 非背景元素，按 zIndex 升序（前 = 底层，后 = 顶层）
  const nonBg = elements
    .filter(e => e.type !== 'background')
    .sort((a, b) => a.zIndex - b.zIndex);
  const pos = nonBg.findIndex(e => e.id === targetId);
  if (pos < 0) return elements;

  let updates = {}; // id -> new zIndex

  if (direction === 'up') {
    // 与上一层（更高 zIndex，即 pos+1）交换
    if (pos + 1 >= nonBg.length) return elements; // 已在顶层
    const partner = nonBg[pos + 1];
    updates[target.id]  = partner.zIndex;
    updates[partner.id] = target.zIndex;
  } else if (direction === 'down') {
    // 与下一层（更低 zIndex，即 pos-1）交换
    if (pos - 1 < 0) return elements; // 已在底层（非背景最低）
    const partner = nonBg[pos - 1];
    updates[target.id]  = partner.zIndex;
    updates[partner.id] = target.zIndex;
  } else if (direction === 'top') {
    const maxZ = Math.max(...nonBg.map(e => e.zIndex));
    updates[target.id] = maxZ + 1;
  } else if (direction === 'bottom') {
    // 最低非背景 zIndex，但必须高于背景 bgZ
    const othersMinZ = Math.min(...nonBg.filter(e => e.id !== targetId).map(e => e.zIndex));
    // 目标值 = othersMinZ - 1，但不得 ≤ bgZ
    const newZ = Math.max(othersMinZ - 1, bgZ + 1);
    updates[target.id] = newZ;
  } else {
    return elements;
  }

  return elements.map(e => updates[e.id] !== undefined ? { ...e, zIndex: updates[e.id] } : e);
}

// —— 测试工具 ——
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  ✅ PASS: ${msg}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${msg}`);
  }
}

function makeElements() {
  return [
    { id: 'bg',   type: 'background', zIndex: 0,   content: '背景' },
    { id: 'el-1', type: 'text',       zIndex: 5,   content: '文字A' },
    { id: 'el-2', type: 'image',      zIndex: 10,  content: '图片B' },
    { id: 'el-3', type: 'sticker',    zIndex: 15,  content: '贴纸C' },
  ];
}

function zIndexOf(elements, id) {
  return elements.find(e => e.id === id).zIndex;
}

// =============== 测试用例 ===============

console.log('\n=== TEST 1: up 上移一层 ===');
{
  // el-2 (z=10) 上移一层 → 应与 el-3 (z=15) 交换 zIndex
  const before = makeElements();
  const after = reorderElements(before, 'el-2', 'up');
  assert(zIndexOf(after, 'el-2') > zIndexOf(after, 'el-1'),  'el-2 应高于 el-1');
  assert(zIndexOf(after, 'el-2') === 15,                     'el-2 zIndex 应变成 15');
  assert(zIndexOf(after, 'el-3') === 10,                     'el-3 zIndex 应变成 10');
  assert(zIndexOf(after, 'el-1') === 5,                      'el-1 zIndex 保持 5');
  assert(zIndexOf(after, 'bg')   === 0,                      'bg 保持不变');
}

console.log('\n=== TEST 2: up 上移到顶（已是最高层）—— 不变 ===');
{
  const before = makeElements();
  const after = reorderElements(before, 'el-3', 'up');
  // el-3 已是最高 (z=15)，up 后不应改变其它
  assert(zIndexOf(after, 'el-3') >= zIndexOf(after, 'el-2'), 'el-3 仍在最上层');
  assert(zIndexOf(after, 'bg') === 0,                        'bg 保持不变');
}

console.log('\n=== TEST 3: down 下移一层 ===');
{
  // el-2 (z=10) 下移一层 → 应与 el-1 (z=5) 交换 zIndex
  const before = makeElements();
  const after = reorderElements(before, 'el-2', 'down');
  assert(zIndexOf(after, 'el-2') === 5,                      'el-2 zIndex 应变成 5');
  assert(zIndexOf(after, 'el-1') === 10,                     'el-1 zIndex 应变成 10');
  assert(zIndexOf(after, 'el-3') === 15,                     'el-3 不变');
  assert(zIndexOf(after, 'bg')   === 0,                      'bg 保持不变');
}

console.log('\n=== TEST 4: down 已在最底层（紧挨背景）—— 不能比背景更低 ===');
{
  const before = makeElements();
  const after = reorderElements(before, 'el-1', 'down');
  // el-1 (z=5) 是最低的非背景层，down 后也必须 > bg (z=0)
  assert(zIndexOf(after, 'el-1') > zIndexOf(after, 'bg'),    'el-1 必须高于背景');
  assert(zIndexOf(after, 'bg') === 0,                        'bg 保持 0');
}

console.log('\n=== TEST 5: top 置顶 ===');
{
  // el-1 (z=5) 置顶 → 应变成最高 zIndex
  const before = makeElements();
  const after = reorderElements(before, 'el-1', 'top');
  const allZ = after.map(e => e.zIndex);
  const el1Z = zIndexOf(after, 'el-1');
  const others = after.filter(e => e.id !== 'el-1' && e.type !== 'background').map(e => e.zIndex);
  assert(el1Z > Math.max(...others),                        'el-1 应比所有其它非背景层高');
  assert(zIndexOf(after, 'bg') === 0,                       'bg 保持不变');
}

console.log('\n=== TEST 6: bottom 置底（非背景元素置底）—— 仍须高于背景 ===');
{
  // el-3 (z=15) 置底 → 应低于 el-1、el-2，但高于 bg
  const before = makeElements();
  const after = reorderElements(before, 'el-3', 'bottom');
  const nonBg = after.filter(e => e.type !== 'background');
  const sortedByZ = [...nonBg].sort((a, b) => a.zIndex - b.zIndex);
  assert(sortedByZ[0].id === 'el-3',                         'el-3 应是排序后的第一个（最低的非背景层）');
  assert(sortedByZ[0].zIndex > zIndexOf(after, 'bg'),        'el-3 必须仍高于背景');
}

console.log('\n=== TEST 7: background 元素重排应被忽略 ===');
{
  const before = makeElements();
  const after1 = reorderElements(before, 'bg', 'up');
  const after2 = reorderElements(before, 'bg', 'top');
  assert(zIndexOf(after1, 'bg') === 0,                       'bg up 后不变');
  assert(zIndexOf(after2, 'bg') === 0,                       'bg top 后不变');
  after1.forEach(e => {
    const orig = before.find(b => b.id === e.id);
    assert(e.zIndex === orig.zIndex,                        `${e.id} 的 zIndex 不应因 bg 操作而变`);
  });
}

// =============== 汇总 ===============
console.log(`\n======================`);
console.log(`结果: ${passed} passed, ${failed} failed`);
console.log(`======================\n`);
process.exit(failed > 0 ? 1 : 0);

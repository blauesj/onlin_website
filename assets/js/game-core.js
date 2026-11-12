/* ============================================================
   霓虹连击 NEON COMBO · 纯逻辑核心
   ------------------------------------------------------------
   这个文件不碰 DOM，只放计分 / 倍率 / 难度曲线 / 评级 / 名字清洗，
   浏览器里挂到 window.GameCore，Node 里可以直接 require 做单元测试。
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GameCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CONFIG = {
    duration: 30000,      /* 一局时长（毫秒） */
    countdown: 3,         /* 开始前 3-2-1 */
    baseScore: 10,        /* 每次命中的基础分 */
    goldBonus: 50,        /* 金环分数 */
    goldTimeBonus: 1000,  /* 金环额外时间 */
    goldChance: 0.12,     /* 金环出现概率 */
    comboStep: 5,         /* 每几次连击升一档 */
    maxMultiplier: 5,     /* 倍率上限 */
    maxTargets: 3,        /* 场上同时存在的最多目标数 */
    spawnFrom: 720,       /* 初始生成间隔 */
    spawnTo: 380,         /* 末尾生成间隔（越快越密） */
    lifeFrom: 1750,       /* 初始存活时间 */
    lifeTo: 950,          /* 末尾存活时间 */
    radiusFrom: 46,       /* 初始半径 */
    radiusTo: 27,         /* 末尾半径 */
    maxNameLength: 16,
    maxScore: 20000,      /* 服务端同样使用，作为异常值上限 */
    maxCombo: 400
  };

  var GRADES = [
    { grade: 'S', min: 1200 },
    { grade: 'A', min: 760 },
    { grade: 'B', min: 420 },
    { grade: 'C', min: 180 },
    { grade: 'D', min: 0 }
  ];

  function clamp(n, min, max) {
    if (typeof n !== 'number' || n !== n) return min;
    return Math.min(max, Math.max(min, n));
  }

  /* 名字清洗：去控制字符、压缩空格、按字符截断、拒绝纯符号 */
  function cleanName(raw) {
    if (typeof raw !== 'string') return '';
    var s = raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    if (!/[0-9a-zA-Z\u00c0-\u024f\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(s)) return '';
    return Array.from(s).slice(0, CONFIG.maxNameLength).join('');
  }

  /* 连击 0/1 起步为 ×1，每 comboStep 次升一档 */
  function multiplier(combo) {
    if (!combo || combo < 1) return 1;
    return Math.min(CONFIG.maxMultiplier, 1 + Math.floor(combo / CONFIG.comboStep));
  }

  function scoreFor(combo, isGold) {
    var base = isGold ? CONFIG.goldBonus : CONFIG.baseScore;
    return base * multiplier(combo);
  }

  function progress(elapsed) {
    return clamp(elapsed / CONFIG.duration, 0, 1);
  }

  function lerp(from, to, p) {
    return from + (to - from) * clamp(p, 0, 1);
  }

  function spawnInterval(p) { return lerp(CONFIG.spawnFrom, CONFIG.spawnTo, p); }
  function targetLife(p) { return lerp(CONFIG.lifeFrom, CONFIG.lifeTo, p); }
  function targetRadius(p) { return lerp(CONFIG.radiusFrom, CONFIG.radiusTo, p); }

  function accuracy(hits, misses) {
    var total = hits + misses;
    if (total <= 0) return 0;
    return Math.round((hits / total) * 100);
  }

  function gradeFor(score) {
    for (var i = 0; i < GRADES.length; i++) {
      if (score >= GRADES[i].min) return GRADES[i].grade;
    }
    return 'D';
  }

  function isGoldRoll(roll) {
    return roll < CONFIG.goldChance;
  }

  /* 把两个 0..1 的随机数映射成场地内的百分比坐标，四周留出边距 */
  function pointFromSeed(rx, ry, padRatio) {
    var pad = typeof padRatio === 'number' ? padRatio : 0.14;
    var x = pad + clamp(rx, 0, 1) * (1 - pad * 2);
    var y = pad + clamp(ry, 0, 1) * (1 - pad * 2);
    return {
      x: Math.round(x * 1000) / 10,
      y: Math.round(y * 1000) / 10
    };
  }

  /* 百分比坐标下的距离，避免目标叠在一起 */
  function areTooClose(a, b, minDist) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var d = minDist || 18;
    return Math.sqrt(dx * dx + dy * dy) < d;
  }

  return {
    CONFIG: CONFIG,
    GRADES: GRADES,
    clamp: clamp,
    cleanName: cleanName,
    multiplier: multiplier,
    scoreFor: scoreFor,
    progress: progress,
    lerp: lerp,
    spawnInterval: spawnInterval,
    targetLife: targetLife,
    targetRadius: targetRadius,
    accuracy: accuracy,
    gradeFor: gradeFor,
    isGoldRoll: isGoldRoll,
    pointFromSeed: pointFromSeed,
    areTooClose: areTooClose
  };
});

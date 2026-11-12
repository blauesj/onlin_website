/* ============================================================
   霓虹连击 NEON COMBO · 游戏主逻辑
   依赖：assets/js/i18n.js、assets/js/game-core.js 先加载
   ============================================================ */
(function () {
  'use strict';

  var i18n = window.siteI18n;
  var Core = window.GameCore;
  var CFG = Core.CONFIG;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var KEYS = {
    name: 'neoncombo-name',
    best: 'neoncombo-best',
    sound: 'neoncombo-sound',
    local: 'neoncombo-local-scores',
    scope: 'neoncombo-scope',
    theme: 'yuguang-theme'
  };

  function $(id) { return document.getElementById(id); }

  var nodes = {
    viewStart: $('view-start'),
    viewGame: $('view-game'),
    viewResult: $('view-result'),
    form: $('start-form'),
    name: $('player-name'),
    nameHint: $('name-hint'),
    hudScore: $('hud-score'),
    hudCombo: $('hud-combo'),
    hudTime: $('hud-time'),
    bar: $('timebar-fill'),
    arena: $('arena'),
    arenaTip: $('arena-tip'),
    countdown: $('countdown'),
    countdownNum: $('countdown-num'),
    comboFlash: $('combo-flash'),
    gameBest: $('game-best'),
    quit: $('quit-btn'),
    grade: $('result-grade'),
    score: $('result-score'),
    gradeText: $('result-grade-text'),
    resultCombo: $('result-combo'),
    resultHits: $('result-hits'),
    resultAcc: $('result-accuracy'),
    status: $('result-status'),
    retry: $('retry-btn'),
    boardList: $('board-list'),
    boardEmpty: $('board-empty'),
    boardNote: $('board-note'),
    boardSub: $('board-sub'),
    boardMe: $('board-me'),
    boardMeGlobal: $('board-me-global'),
    boardMeRegion: $('board-me-region'),
    boardMeBest: $('board-me-best'),
    tabs: document.querySelectorAll('.board-tab'),
    refresh: $('refresh-board'),
    sound: $('sound-toggle'),
    theme: $('theme-toggle'),
    lang: $('lang-toggle'),
    year: $('year')
  };

  var state = {
    phase: 'idle',        /* idle | countdown | playing | result */
    name: '',
    score: 0,
    combo: 0,
    bestCombo: 0,
    hits: 0,
    misses: 0,
    remaining: CFG.duration,
    total: CFG.duration,
    endAt: 0,
    difficulty: 0,
    raf: 0,
    spawnTimer: 0,
    countTimer: 0,
    targets: [],
    seq: 0
  };

  var BOARD_LIMIT = 50;

  var lastBoard = [];
  var lastScope = read(KEYS.scope, 'global') === 'region' ? 'region' : 'global';
  var lastCountry = '';
  var me = null;

  /* ---------- 本地存储 ---------- */
  function read(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* 隐私模式忽略 */ }
  }

  function t(key) { return i18n ? i18n.t(i18n.current(), key) : key; }
  function tf(key, vars) { return i18n ? i18n.tf(key, vars) : key; }
  function isEn() { return i18n ? i18n.current() === 'en' : false; }

  function formatScore(n) {
    var value = Number(n) || 0;
    try { return value.toLocaleString(isEn() ? 'en-US' : 'zh-CN'); } catch (e) { return String(value); }
  }

  /* ---------- 音效：WebAudio 合成，不加载任何音频文件 ---------- */
  var Sound = (function () {
    var ctx = null;
    var enabled = true;

    function ensure() {
      if (!enabled) return null;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        try { ctx = new AC(); } catch (e) { return null; }
      }
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* ignore */ } }
      return ctx;
    }

    function blip(freq, dur, type, gain) {
      var c = ensure();
      if (!c) return;
      try {
        var osc = c.createOscillator();
        var g = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, c.currentTime);
        g.gain.linearRampToValueAtTime(gain || 0.07, c.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
        osc.connect(g);
        g.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + dur + 0.03);
      } catch (e) { /* ignore */ }
    }

    return {
      setEnabled: function (v) {
        enabled = !!v;
        if (!enabled && ctx) {
          try { ctx.close(); } catch (e) { /* ignore */ }
          ctx = null;
        }
      },
      hit: function (combo) { blip(400 + Math.min(combo, 24) * 24, 0.09, 'triangle', 0.07); },
      gold: function () {
        blip(700, 0.09, 'square', 0.05);
        setTimeout(function () { blip(1050, 0.14, 'square', 0.045); }, 65);
      },
      miss: function () { blip(140, 0.16, 'sawtooth', 0.05); },
      start: function () { blip(560, 0.1, 'sine', 0.06); },
      tick: function () { blip(780, 0.05, 'sine', 0.03); },
      end: function () {
        [523.25, 659.25, 783.99].forEach(function (f, i) {
          setTimeout(function () { blip(f, 0.3, 'sine', 0.055); }, i * 110);
        });
      }
    };
  })();

  /* ---------- 通用小工具 ---------- */
  function bump(node) {
    if (!node) return;
    node.classList.remove('is-bump');
    void node.offsetWidth;
    node.classList.add('is-bump');
  }

  /* 结算状态行存「状态 + 参数」而不是成品文字：
     切语言时按当前语言重新生成，不会残留旧语言。 */
  var statusState = { kind: 'empty', rank: 0, regionRank: 0, gap: 0, good: false };

  function statusText() {
    var s = statusState;
    if (s.kind === 'newBest') return t('result.newBest');
    if (s.kind === 'saving') return t('status.saving');
    if (s.kind === 'saved') {
      var text = s.rank ? tf('status.saved', { rank: s.rank }) : t('status.savedNoRank');
      if (s.regionRank && s.regionRank !== s.rank) {
        text += tf('status.savedRegion', { rank: s.regionRank });
      }
      if (s.gap > 0) text += ' · ' + tf('result.gap', { n: formatScore(s.gap) });
      return text;
    }
    if (s.kind === 'offline') return t('status.offline');
    if (s.kind === 'failed') return t('status.failed');
    return '';
  }

  function renderStatus() {
    if (!nodes.status) return;
    nodes.status.textContent = statusText();
    nodes.status.classList.toggle('is-good', !!statusState.good);
  }

  function setStatus(next) {
    statusState = next || { kind: 'empty', rank: 0, regionRank: 0, gap: 0, good: false };
    renderStatus();
  }

  function flashHint(msg, isError) {
    if (!nodes.nameHint) return;
    nodes.nameHint.textContent = msg;
    nodes.nameHint.classList.toggle('is-error', !!isError);
    clearTimeout(flashHint.timer);
    flashHint.timer = setTimeout(function () {
      nodes.nameHint.textContent = t('start.tip');
      nodes.nameHint.classList.remove('is-error');
    }, 2400);
  }

  function setView(name) {
    [[nodes.viewStart, 'start'], [nodes.viewGame, 'game'], [nodes.viewResult, 'result']].forEach(function (pair) {
      pair[0].classList.toggle('is-active', pair[1] === name);
    });
  }

  /* ---------- 开始流程 ---------- */
  function resetState() {
    cancelAnimationFrame(state.raf);
    clearTimeout(state.spawnTimer);
    clearTimeout(state.countTimer);
    state.targets.forEach(function (item) { clearTimeout(item.timer); });
    state.targets = [];
    state.phase = 'idle';
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hits = 0;
    state.misses = 0;
    state.remaining = CFG.duration;
    state.total = CFG.duration;
    state.difficulty = 0;
    state.seq = 0;

    Array.prototype.forEach.call(
      nodes.arena.querySelectorAll('.target, .float-score, .miss-ring, .spark'),
      function (node) { node.remove(); }
    );
    nodes.countdown.hidden = true;
    nodes.countdownNum.classList.remove('is-go');
    nodes.comboFlash.hidden = true;
    nodes.arena.classList.remove('is-urgent', 'is-playing', 'is-shaking', 'is-pulse');
    nodes.arenaTip.classList.remove('is-hidden');
    nodes.hudScore.textContent = '0';
    nodes.hudCombo.textContent = '×1';
    nodes.hudCombo.classList.remove('is-hot');
    nodes.hudTime.textContent = (CFG.duration / 1000).toFixed(1);
    nodes.bar.style.width = '100%';
    nodes.status.textContent = '';
    nodes.status.classList.remove('is-good');
  }

  function startGame() {
    var name = Core.cleanName(nodes.name ? nodes.name.value : '');
    if (!name) {
      if (nodes.name) {
        nodes.name.classList.add('is-invalid');
        try { nodes.name.focus(); } catch (e) { /* ignore */ }
      }
      flashHint(t('status.noName'), true);
      Sound.miss();
      return;
    }

    state.name = name;
    if (nodes.name) nodes.name.value = name;
    write(KEYS.name, name);

    resetState();
    setView('game');
    runCountdown();
  }

  function runCountdown() {
    state.phase = 'countdown';
    var n = CFG.countdown;
    nodes.countdown.hidden = false;
    nodes.countdownNum.textContent = String(n);
    bump(nodes.countdownNum);
    Sound.tick();

    function step() {
      n -= 1;
      if (n > 0) {
        nodes.countdownNum.textContent = String(n);
        bump(nodes.countdownNum);
        Sound.tick();
        state.countTimer = setTimeout(step, 700);
      } else if (n === 0) {
        nodes.countdownNum.textContent = 'GO';
        nodes.countdownNum.classList.add('is-go');
        bump(nodes.countdownNum);
        Sound.start();
        state.countTimer = setTimeout(function () {
          nodes.countdown.hidden = true;
          nodes.countdownNum.classList.remove('is-go');
          beginPlay();
        }, 520);
      }
    }
    state.countTimer = setTimeout(step, 700);
  }

  function beginPlay() {
    state.phase = 'playing';
    state.endAt = performance.now() + CFG.duration;
    state.total = CFG.duration;
    state.remaining = CFG.duration;
    nodes.arena.classList.add('is-playing');
    nodes.arenaTip.classList.add('is-hidden');
    updateHud();
    state.raf = requestAnimationFrame(loop);
    state.spawnTimer = setTimeout(spawnTarget, 240);
  }

  /* ---------- 主循环 ---------- */
  function loop(now) {
    if (state.phase !== 'playing') return;
    state.remaining = Math.max(0, state.endAt - now);
    state.difficulty = Core.clamp((state.total - state.remaining) / CFG.duration, 0, 1);
    updateHud();
    if (state.remaining <= 0) {
      endGame();
      return;
    }
    state.raf = requestAnimationFrame(loop);
  }

  function updateHud() {
    if (!nodes.hudScore) return;
    var scoreText = String(state.score);
    if (nodes.hudScore.textContent !== scoreText) nodes.hudScore.textContent = scoreText;

    var m = Core.multiplier(state.combo);
    var comboText = '×' + m;
    if (nodes.hudCombo.textContent !== comboText) {
      nodes.hudCombo.textContent = comboText;
      nodes.hudCombo.classList.toggle('is-hot', m > 1);
    }

    nodes.hudTime.textContent = (state.remaining / 1000).toFixed(1);

    var p = state.total ? Core.clamp(state.remaining / state.total, 0, 1) : 0;
    nodes.bar.style.width = (p * 100).toFixed(2) + '%';
    nodes.arena.classList.toggle('is-urgent', state.remaining <= 5000);
  }

  /* ---------- 目标生成 ---------- */
  function scheduleSpawn(delay) {
    clearTimeout(state.spawnTimer);
    var wait = typeof delay === 'number' ? delay : Core.spawnInterval(state.difficulty);
    state.spawnTimer = setTimeout(spawnTarget, wait);
  }

  function pickPosition() {
    for (var i = 0; i < 14; i++) {
      var pos = Core.pointFromSeed(Math.random(), Math.random(), 0.16);
      var clear = true;
      for (var j = 0; j < state.targets.length; j++) {
        if (Core.areTooClose(pos, state.targets[j].pos, 21)) { clear = false; break; }
      }
      if (clear) return pos;
    }
    return Core.pointFromSeed(Math.random(), Math.random(), 0.16);
  }

  function spawnTarget() {
    if (state.phase !== 'playing') return;

    if (state.targets.length >= CFG.maxTargets) {
      scheduleSpawn(220);
      return;
    }

    var p = state.difficulty;
    var gold = Core.isGoldRoll(Math.random());
    var radius = Core.targetRadius(p) * (gold ? 0.84 : 1);
    var pos = pickPosition();
    var node = document.createElement('div');
    var item = { id: ++state.seq, node: node, pos: pos, gold: gold, timer: 0 };

    node.className = 'target' + (gold ? ' is-gold' : '');
    node.setAttribute('data-id', String(item.id));
    node.setAttribute('aria-hidden', 'true');
    node.style.left = pos.x + '%';
    node.style.top = pos.y + '%';
    node.style.setProperty('--size', (radius * 2).toFixed(1) + 'px');
    node.style.setProperty('--life', Core.targetLife(p) + 'ms');

    nodes.arena.appendChild(node);
    state.targets.push(item);

    item.timer = setTimeout(function () { expireTarget(item); }, Core.targetLife(p));
    scheduleSpawn();
  }

  function dropTarget(item) {
    clearTimeout(item.timer);
    state.targets = state.targets.filter(function (x) { return x.id !== item.id; });
  }

  /* ---------- 命中 / 失误 ---------- */
  function onArenaPointerDown(e) {
    if (state.phase !== 'playing') return;
    var target = e.target && e.target.closest ? e.target.closest('.target') : null;
    if (target) {
      e.preventDefault();
      hitTarget(target);
    } else {
      e.preventDefault();
      missTap(e);
    }
  }

  function hitTarget(node) {
    var id = Number(node.getAttribute('data-id'));
    var item = null;
    for (var i = 0; i < state.targets.length; i++) {
      if (state.targets[i].id === id) { item = state.targets[i]; break; }
    }
    if (!item) return;

    dropTarget(item);
    node.style.pointerEvents = 'none';

    var gold = item.gold;
    var gained = Core.scoreFor(state.combo, gold);

    state.combo += 1;
    state.hits += 1;
    state.score += gained;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;

    if (gold) {
      state.endAt += CFG.goldTimeBonus;
      state.total += CFG.goldTimeBonus;
    }

    spawnFloat(node, '+' + gained, gold);
    spawnSparks(node, gold);
    node.classList.add('is-hit');
    window.setTimeout(function () { node.remove(); }, reduceMotion ? 0 : 260);

    if (gold) Sound.gold(); else Sound.hit(state.combo);

    if (state.combo % CFG.comboStep === 0) {
      showComboFlash(Core.multiplier(state.combo));
      nodes.arena.classList.add('is-pulse');
      window.setTimeout(function () { nodes.arena.classList.remove('is-pulse'); }, 280);
    }

    updateHud();
  }

  function missTap(e) {
    state.combo = 0;
    state.misses += 1;
    var rect = nodes.arena.getBoundingClientRect();
    spawnMissRing(e.clientX - rect.left, e.clientY - rect.top);
    shakeArena();
    Sound.miss();
    updateHud();
  }

  function expireTarget(item) {
    if (state.phase !== 'playing') return;
    var alive = false;
    for (var i = 0; i < state.targets.length; i++) {
      if (state.targets[i].id === item.id) { alive = true; break; }
    }
    if (!alive) return;

    dropTarget(item);
    state.combo = 0;
    state.misses += 1;
    item.node.classList.add('is-missed');
    window.setTimeout(function () { item.node.remove(); }, reduceMotion ? 0 : 200);
    Sound.miss();
    updateHud();
  }

  function shakeArena() {
    if (reduceMotion) return;
    nodes.arena.classList.add('is-shaking');
    window.setTimeout(function () { nodes.arena.classList.remove('is-shaking'); }, 220);
  }

  /* ---------- 视觉反馈 ---------- */
  function spawnFloat(node, text, gold) {
    if (reduceMotion) return;
    var fx = document.createElement('span');
    fx.className = 'float-score' + (gold ? ' is-gold' : '');
    fx.textContent = text;
    fx.style.left = node.style.left;
    fx.style.top = node.style.top;
    fx.addEventListener('animationend', function () { fx.remove(); });
    nodes.arena.appendChild(fx);
  }

  function spawnSparks(node, gold) {
    if (reduceMotion) return;
    for (var i = 0; i < 6; i++) {
      (function (index) {
        var s = document.createElement('i');
        s.className = 'spark' + (gold ? ' is-gold' : '');
        s.style.left = node.style.left;
        s.style.top = node.style.top;
        var angle = (Math.PI * 2 * index) / 6 + Math.random() * 0.6;
        var dist = 24 + Math.random() * 30;
        s.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
        s.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
        s.addEventListener('animationend', function () { s.remove(); });
        nodes.arena.appendChild(s);
      })(i);
    }
  }

  function spawnMissRing(x, y) {
    if (reduceMotion) return;
    var ring = document.createElement('span');
    ring.className = 'miss-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    ring.addEventListener('animationend', function () { ring.remove(); });
    nodes.arena.appendChild(ring);
  }

  function showComboFlash(multiplier) {
    nodes.comboFlash.hidden = false;
    nodes.comboFlash.textContent = '×' + multiplier + ' ' + t('game.multiplier');
    nodes.comboFlash.classList.remove('is-on');
    void nodes.comboFlash.offsetWidth;
    nodes.comboFlash.classList.add('is-on');
  }

  /* ---------- 结算 ---------- */
  function endGame() {
    if (state.phase === 'result') return;
    state.phase = 'result';

    cancelAnimationFrame(state.raf);
    clearTimeout(state.spawnTimer);
    clearTimeout(state.countTimer);
    state.targets.forEach(function (item) {
      clearTimeout(item.timer);
      item.node.remove();
    });
    state.targets = [];

    nodes.countdown.hidden = true;
    nodes.arena.classList.remove('is-urgent', 'is-playing', 'is-shaking', 'is-pulse');
    nodes.arenaTip.classList.remove('is-hidden');

    Sound.end();
    renderResult();
    setView('result');
    submitScore();

    window.setTimeout(function () {
      try { nodes.retry.focus(); } catch (e) { /* ignore */ }
    }, 90);
  }

  function renderResult() {
    var grade = Core.gradeFor(state.score);
    nodes.grade.textContent = grade;
    nodes.grade.setAttribute('data-grade', grade);
    nodes.gradeText.textContent = t('grade.' + grade + '.text');
    nodes.score.textContent = String(state.score);
    nodes.resultCombo.textContent = String(state.bestCombo);
    nodes.resultHits.textContent = String(state.hits);
    nodes.resultAcc.textContent = Core.accuracy(state.hits, state.misses) + '%';

    var best = Number(read(KEYS.best, '0')) || 0;
    var isBest = state.score > best;
    if (isBest) write(KEYS.best, String(state.score));
    nodes.gameBest.textContent = tf('game.bestValue', { n: Math.max(best, state.score) });

    if (isBest && state.score > 0) {
      setStatus({ kind: 'newBest', good: true });
    } else {
      setStatus({ kind: 'empty' });
    }
  }

  /* ---------- 排行榜 ---------- */
  function requestJson(url, options) {
    var opts = options || {};
    return new Promise(function (resolve, reject) {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = window.setTimeout(function () {
        if (controller) { try { controller.abort(); } catch (e) { /* ignore */ } }
        reject(new Error('timeout'));
      }, 6000);

      var config = {
        headers: { 'content-type': 'application/json' },
        signal: controller ? controller.signal : undefined
      };
      if (opts.method) config.method = opts.method;
      if (opts.body) config.body = opts.body;

      fetch(url, config).then(function (res) {
        window.clearTimeout(timer);
        if (!res.ok) { reject(new Error('http_' + res.status)); return; }
        return res.json().then(resolve, reject);
      }).catch(function (err) {
        window.clearTimeout(timer);
        reject(err);
      });
    });
  }

  /* ---------- 地域展示 ---------- */
  function regionName(code) {
    if (!code || code === 'XX') return t('board.unknownRegion');
    try {
      var names = new Intl.DisplayNames([isEn() ? 'en' : 'zh'], { type: 'region' });
      return names.of(code) || code;
    } catch (e) {
      return code;
    }
  }

  /* 当前玩家的名字：优先本局输入，其次上次记住的 */
  function myName() {
    return state.name || read(KEYS.name, '');
  }

  function localBoard() {
    var raw = read(KEYS.local, '[]');
    var list;
    try { list = JSON.parse(raw); } catch (e) { return []; }
    if (!Array.isArray(list)) return [];
    return list.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, BOARD_LIMIT);
  }

  function saveLocalScore(entry) {
    var list;
    try { list = JSON.parse(read(KEYS.local, '[]')); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    list.push(entry);
    list.sort(function (a, b) { return b.score - a.score; });
    write(KEYS.local, JSON.stringify(list.slice(0, 30)));
  }

  /* ---------- 排行榜渲染 ---------- */
  function syncBoardChrome() {
    if (nodes.boardSub) {
      nodes.boardSub.textContent = lastScope === 'region'
        ? tf('board.subRegion', { n: BOARD_LIMIT, region: regionName(lastCountry) })
        : tf('board.sub', { n: BOARD_LIMIT });
    }
    for (var i = 0; i < nodes.tabs.length; i++) {
      var tab = nodes.tabs[i];
      var active = tab.getAttribute('data-scope') === lastScope;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    }
  }

  function renderBoard() {
    var list = (lastBoard || []).slice(0, BOARD_LIMIT);
    var myTag = me && me.tag ? String(me.tag).toUpperCase() : '';
    var mineName = (me && me.name) || myName();

    syncBoardChrome();

    nodes.boardList.innerHTML = '';

    if (!list.length) {
      nodes.boardEmpty.hidden = false;
      return;
    }
    nodes.boardEmpty.hidden = true;

    list.forEach(function (row, index) {
      var tag = row.tag ? String(row.tag).toUpperCase() : '';
      /* 同一网络同一名字才算自己：同名不同网络靠 tag 区分，同网络不同名字不是同一个人 */
      var isMe = mineName && row.name === mineName && (!myTag || !tag || tag === myTag);

      var li = document.createElement('li');
      li.className = 'board-row' + (index === 0 ? ' is-top' : '') + (isMe ? ' is-me' : '');

      var rank = document.createElement('span');
      rank.className = 'board-rank';
      rank.textContent = String(index + 1).padStart(2, '0');

      var name = document.createElement('span');
      name.className = 'board-name';

      var line = document.createElement('span');
      line.className = 'board-name-line';
      line.appendChild(document.createTextNode(row.name || ''));
      if (tag) {
        var tagEl = document.createElement('em');
        tagEl.className = 'board-tag';
        tagEl.textContent = '#' + tag;
        line.appendChild(tagEl);
      }
      if (isMe) {
        var badge = document.createElement('em');
        badge.className = 'board-badge';
        badge.textContent = t('board.you');
        line.appendChild(badge);
      }
      name.appendChild(line);

      /* 地域：同名玩家靠这一行区分 */
      if (row.country) {
        var meta = document.createElement('span');
        meta.className = 'board-meta';
        meta.textContent = regionName(row.country);
        name.appendChild(meta);
      }

      var score = document.createElement('span');
      score.className = 'board-score';
      score.textContent = formatScore(row.score);

      li.appendChild(rank);
      li.appendChild(name);
      li.appendChild(score);
      nodes.boardList.appendChild(li);
    });
  }

  /* ---------- 我的排名 ---------- */
  function renderMe() {
    if (!nodes.boardMe) return;
    var best = me && Number(me.best) > 0 ? Number(me.best) : 0;
    nodes.boardMe.hidden = !best;
    if (!best) return;

    nodes.boardMeGlobal.textContent = me.rank ? '#' + me.rank : '—';
    nodes.boardMeRegion.textContent = me.regionRank ? '#' + me.regionRank : '—';
    nodes.boardMeBest.textContent = formatScore(best);
  }

  function setScope(scope, options) {
    var next = scope === 'region' ? 'region' : 'global';
    if (next === lastScope && !(options && options.force)) return;
    lastScope = next;
    write(KEYS.scope, next);
    loadBoard(options);
  }

  function loadBoard(options) {
    var opts = options || {};
    if (!opts.silent) nodes.boardNote.hidden = true;

    var url = '/api/scores?scope=' + lastScope;
    var nm = myName();
    if (nm) url += '&name=' + encodeURIComponent(nm);

    return requestJson(url).then(function (data) {
      lastBoard = data && data.scores ? data.scores : [];
      lastCountry = (data && data.country) || lastCountry;
      if (data && data.player) me = data.player;
      renderBoard();
      renderMe();
      nodes.boardNote.hidden = true;
    }).catch(function () {
      lastBoard = localBoard();
      lastScope = 'global';
      renderBoard();
      renderMe();
      nodes.boardNote.hidden = false;
      nodes.boardNote.textContent = navigator.onLine === false ? t('board.note.offline') : t('board.note.error');
    });
  }

  function gapAmount(res) {
    if (!res || !res.scores || !res.rank || res.rank <= 1) return 0;
    var above = res.scores[res.rank - 2];
    var best = Number(res.best) || state.score;
    if (!above || Number(above.score) <= best) return 0;
    return Number(above.score) - best;
  }

  function submitScore() {
    if (state.score <= 0) return;
    setStatus({ kind: 'saving', good: false });

    requestJson('/api/scores', {
      method: 'POST',
      body: JSON.stringify({
        name: state.name,
        score: state.score,
        bestCombo: state.bestCombo,
        hits: state.hits,
        misses: state.misses
      })
    }).then(function (res) {
      setStatus({
        kind: 'saved',
        rank: (res && res.rank) || 0,
        regionRank: (res && res.regionRank) || 0,
        gap: gapAmount(res),
        good: true
      });

      me = {
        name: state.name,
        tag: res && res.tag ? res.tag : (me && me.tag) || '',
        best: (res && Number(res.best)) || state.score,
        rank: (res && res.rank) || 0,
        regionRank: (res && res.regionRank) || 0
      };      lastBoard = res && res.scores ? res.scores : lastBoard;
      lastCountry = (res && res.country) || lastCountry;
      lastScope = 'global';
      write(KEYS.scope, lastScope);
      renderBoard();
      renderMe();
    }).catch(function () {
      saveLocalScore({
        name: state.name,
        score: state.score,
        bestCombo: state.bestCombo,
        hits: state.hits,
        misses: state.misses,
        createdAt: new Date().toISOString()
      });
      setStatus({ kind: 'offline', good: false });
      loadBoard({ silent: true });
    });
  }

  /* ---------- 主题 / 音效 / 语言 ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0b14' : '#f7f7fb');
  }

  var soundOn = read(KEYS.sound, '1') !== '0';
  Sound.setEnabled(soundOn);

  function syncSoundButton() {
    if (!nodes.sound) return;
    nodes.sound.setAttribute('aria-pressed', String(soundOn));
    nodes.sound.classList.toggle('is-muted', !soundOn);
    var label = soundOn ? t('a11y.soundOn') : t('a11y.soundOff');
    nodes.sound.setAttribute('aria-label', label);
    nodes.sound.setAttribute('title', label);
  }

  function bindEvents() {
    if (nodes.form) {
      nodes.form.addEventListener('submit', function (e) {
        e.preventDefault();
        startGame();
      });
    }

    if (nodes.name) {
      nodes.name.addEventListener('input', function () {
        nodes.name.classList.remove('is-invalid');
      });
    }

    if (nodes.arena) {
      nodes.arena.addEventListener('pointerdown', onArenaPointerDown, { passive: false });
      nodes.arena.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }

    if (nodes.retry) {
      nodes.retry.addEventListener('click', startGame);
    }

    if (nodes.quit) {
      nodes.quit.addEventListener('click', function () {
        if (state.phase === 'playing' || state.phase === 'countdown') endGame();
      });
    }

    if (nodes.refresh) {
      nodes.refresh.addEventListener('click', function () { loadBoard(); });
    }

    for (var ti = 0; ti < nodes.tabs.length; ti++) {
      nodes.tabs[ti].addEventListener('click', function () {
        setScope(this.getAttribute('data-scope'), { force: true });
      });
    }

    if (nodes.sound) {
      nodes.sound.addEventListener('click', function () {
        soundOn = !soundOn;
        Sound.setEnabled(soundOn);
        write(KEYS.sound, soundOn ? '1' : '0');
        syncSoundButton();
        if (soundOn) Sound.tick();
      });
    }

    if (nodes.theme) {
      nodes.theme.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        write(KEYS.theme, next);
      });
    }

    if (nodes.lang && i18n) {
      nodes.lang.addEventListener('click', function () { i18n.toggle(); });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && (state.phase === 'playing' || state.phase === 'countdown')) {
        endGame();
        return;
      }
      if (state.phase === 'result' && (e.key === 'Enter' || e.key === ' ')) {
        if (document.activeElement === nodes.retry) return;
        e.preventDefault();
        startGame();
      }
    });

    window.addEventListener('site:langchange', function () {
      syncSoundButton();
      nodes.gameBest.textContent = tf('game.bestValue', {
        n: Math.max(Number(read(KEYS.best, '0')) || 0, state.score)
      });
      if (state.phase === 'result') {
        nodes.gradeText.textContent = t('grade.' + nodes.grade.getAttribute('data-grade') + '.text');
      }
      renderStatus();
      renderBoard();
      renderMe();
      if (nodes.boardNote && !nodes.boardNote.hidden) {
        nodes.boardNote.textContent = navigator.onLine === false ? t('board.note.offline') : t('board.note.error');
      }
    });

    window.addEventListener('online', function () { loadBoard({ silent: true }); });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (i18n) i18n.apply(i18n.detect(), false);

    var savedTheme = read(KEYS.theme, '');
    if (savedTheme === 'dark' || savedTheme === 'light') applyTheme(savedTheme);

    var savedName = read(KEYS.name, '');
    if (savedName && nodes.name) nodes.name.value = savedName;

    if (nodes.gameBest) {
      nodes.gameBest.textContent = tf('game.bestValue', { n: Number(read(KEYS.best, '0')) || 0 });
    }

    if (nodes.year) nodes.year.textContent = new Date().getFullYear();

    syncSoundButton();
    syncBoardChrome();
    bindEvents();
    loadBoard();
  }

  init();
})();

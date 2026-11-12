/* ============================================================
   霓虹连击 NEON COMBO · 多语言字典（改文案只需要动这个文件）
   ------------------------------------------------------------
   - 新增语言：在 DICT 里加一份同结构的对象，并把语言码加入 SUPPORTED
   - 新增文案：给 HTML 元素加 data-i18n="key"，再在每种语言里补上同名 key
   - 含标签用 data-i18n-html，属性用 data-i18n-aria / data-i18n-title / data-i18n-ph
   - 带变量的文案用 i18n.tf('key', { n: 12 })，模板里写 {n}
   ============================================================ */
(function () {
  'use strict';

  var DICT = {
    zh: {
      'meta.title': '霓虹连击 NEON COMBO · 30 秒挑战',
      'meta.description': '30 秒连击挑战：点亮、命中、别断。连击越高分越狠，成绩实时上榜。',
      'og.title': '霓虹连击 · 30 秒，手指别停',
      'og.description': '连击越高，分数越狠。看看你能排到第几。',

      'a11y.skip': '跳到游戏',
      'a11y.home': '霓虹连击首页',
      'a11y.sound': '音效开关',
      'a11y.soundOn': '关闭音效',
      'a11y.soundOff': '开启音效',
      'a11y.theme': '切换深浅色主题',
      'nav.lang.switch': 'EN',
      'nav.lang.aria': 'Switch to English',

      'brand.name': '霓虹连击',
      'brand.sub': 'NEON COMBO',

      'start.eyebrow': '30 秒 · 一局接一局',
      'start.title': '点亮，命中，<br><span class="grad-text">别让它灭。</span>',
      'start.lead': '30 秒内点掉所有发光的目标。连续命中会不断叠加倍率，漏掉一个，连击归零。',
      'start.name.label': '你的名字（会显示在排行榜上）',
      'start.name.ph': '输入名字，最多 16 字',
      'start.btn': '开始挑战',
      'start.tip': '不用注册，名字只用来标记成绩。',

      'mini.1.k': '每命中 +10',
      'mini.1.v': '连击每 5 次提升一档倍率，最高 ×5',
      'mini.2.k': '金环 +50',
      'mini.2.v': '命中还额外加 1 秒',
      'mini.3.k': '漏掉就断',
      'mini.3.v': '点空或超时，连击直接清零',

      'hud.score': '得分',
      'hud.combo': '连击',
      'hud.time': '剩余',
      'game.tip': '点击发光的目标',
      'game.best': '本机最高 0',
      'game.bestValue': '本机最高 {n}',
      'game.quit': '结束本局',
      'game.multiplier': '倍率',

      'result.title': '本局结束',
      'result.unit': '分',
      'result.combo': '最高连击',
      'result.hits': '命中',
      'result.accuracy': '命中率',
      'result.retry': '再来一局',
      'result.board': '看排行榜',
      'result.gap': '离前一名还差 {n} 分',
      'result.newBest': '刷新本机最高分',

      'grade.S.text': 'S · 手速怪物',
      'grade.A.text': 'A · 反应不错，还能更快',
      'grade.B.text': 'B · 稳住了，再加点连击',
      'grade.C.text': 'C · 手感正在回来',
      'grade.D.text': 'D · 再来一局就熟了',

      'status.saving': '正在上榜…',
      'status.saved': '已上榜 · 第 {rank} 名',
      'status.savedRegion': ' · 本区第 {rank}',
      'status.savedNoRank': '成绩已保存',
      'status.offline': '排行榜暂时不可用，成绩只存在这台设备。',
      'status.failed': '提交失败，成绩只存在这台设备。',
      'status.noName': '先输入一个名字，再开始。',

      'board.title': '排行榜',
      'board.refresh': '刷新',
      'board.scope': '排行榜范围',
      'board.scope.global': '全球',
      'board.scope.region': '本区',
      'board.sub': '前 {n} 名',
      'board.subRegion': '前 {n} 名 · {region}',
      'board.empty': '还没有成绩，来做第一个上榜的人。',
      'board.you': '你',
      'board.me': '我的排名',
      'board.me.global': '全球',
      'board.me.region': '本区',
      'board.me.best': '最高',
      'board.unknownRegion': '未知地区',
      'board.note.offline': '现在只显示这台设备上的成绩',
      'board.note.error': '暂时没连上，稍后点刷新试试',

      'device.mobile': '手机',
      'device.tablet': '平板',
      'device.desktop': '电脑',

      'rules.title': '怎么玩',
      'rules.1': '输入名字，开始后有 3 秒准备，然后计时 30 秒。',
      'rules.2': '连击每 5 次升一档倍率，最高 ×5；金环额外 +50 分和 1 秒。',
      'rules.3': '结算自动上榜，和所有人比同一套规则。'
    },

    en: {
      'meta.title': 'NEON COMBO · 30-second challenge',
      'meta.description': 'A 30-second combo challenge: light up, hit, keep the streak. The higher the combo, the harder the score.',
      'og.title': 'NEON COMBO · 30 seconds. Keep tapping.',
      'og.description': 'Bigger combo, bigger score. See where you rank.',

      'a11y.skip': 'Skip to the game',
      'a11y.home': 'NEON COMBO home',
      'a11y.sound': 'Sound on or off',
      'a11y.soundOn': 'Turn sound off',
      'a11y.soundOff': 'Turn sound on',
      'a11y.theme': 'Toggle color theme',
      'nav.lang.switch': '中',
      'nav.lang.aria': '切换到中文',

      'brand.name': 'NEON COMBO',
      'brand.sub': '30-SECOND CHALLENGE',

      'start.eyebrow': '30 SECONDS · ONE MORE TRY',
      'start.title': 'Light it up,<br><span class="grad-text">keep it alive.</span>',
      'start.lead': 'Hit every glowing target within 30 seconds. Each streak raises your multiplier — miss one and it resets.',
      'start.name.label': 'Your name (shown on the leaderboard)',
      'start.name.ph': 'Enter a name, 16 characters max',
      'start.btn': 'Start challenge',
      'start.tip': 'No sign-up. The name just labels your score.',

      'mini.1.k': '+10 per hit',
      'mini.1.v': 'Every 5 hits raises the multiplier, up to ×5',
      'mini.2.k': 'Gold ring +50',
      'mini.2.v': 'And it adds one extra second',
      'mini.3.k': 'Miss and it breaks',
      'mini.3.v': 'A stray tap or a timeout resets the streak',

      'hud.score': 'Score',
      'hud.combo': 'Combo',
      'hud.time': 'Time',
      'game.tip': 'Tap the glowing targets',
      'game.best': 'Local best 0',
      'game.bestValue': 'Local best {n}',
      'game.quit': 'End round',
      'game.multiplier': 'multiplier',

      'result.title': 'Round over',
      'result.unit': 'pts',
      'result.combo': 'Best combo',
      'result.hits': 'Hits',
      'result.accuracy': 'Accuracy',
      'result.retry': 'Play again',
      'result.board': 'Leaderboard',
      'result.gap': '{n} points behind the next rank',
      'result.newBest': 'New local best',

      'grade.S.text': 'S · Freakish reflexes',
      'grade.A.text': 'A · Sharp — can you go faster?',
      'grade.B.text': 'B · Solid. Chain a few more.',
      'grade.C.text': 'C · Getting the feel',
      'grade.D.text': 'D · One more round and you got it',

      'status.saving': 'Saving to leaderboard…',
      'status.saved': 'Ranked · #{rank}',
      'status.savedRegion': ' · #{rank} locally',
      'status.savedNoRank': 'Score saved',
      'status.offline': 'Leaderboard unavailable — score kept on this device only.',
      'status.failed': 'Upload failed — score kept on this device only.',
      'status.noName': 'Enter a name to start.',

      'board.title': 'Leaderboard',
      'board.refresh': 'Refresh',
      'board.scope': 'Leaderboard scope',
      'board.scope.global': 'Global',
      'board.scope.region': 'Local',
      'board.sub': 'Top {n}',
      'board.subRegion': 'Top {n} · {region}',
      'board.empty': 'No scores yet — be the first.',
      'board.you': 'you',
      'board.me': 'My rank',
      'board.me.global': 'Global',
      'board.me.region': 'Local',
      'board.me.best': 'Best',
      'board.unknownRegion': 'Unknown region',
      'board.note.offline': 'Showing scores from this device only',
      'board.note.error': 'Cannot load right now — try refresh',

      'device.mobile': 'Phone',
      'device.tablet': 'Tablet',
      'device.desktop': 'Desktop',

      'rules.title': 'How to play',
      'rules.1': 'Enter a name, start, and get 3 seconds to prepare. Then the clock runs for 30.',
      'rules.2': 'Every 5 hits raises the multiplier (max ×5). Gold rings give +50 and one extra second.',
      'rules.3': 'Your score is saved when the round ends, under the same rules for everyone.'
    }
  };

  var STORAGE_KEY = 'yuguang-lang';
  var SUPPORTED = ['zh', 'en'];

  function normalize(value) {
    if (!value) return null;
    var v = String(value).toLowerCase();
    if (v.indexOf('zh') === 0 || v === 'cn') return 'zh';
    if (v.indexOf('en') === 0) return 'en';
    if (SUPPORTED.indexOf(v) !== -1) return v;
    return null;
  }

  function detect() {
    var query = null;
    try { query = new URLSearchParams(window.location.search).get('lang'); } catch (e) { /* file:// 下可能不可用 */ }
    var fromUrl = normalize(query);
    if (fromUrl) return fromUrl;

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 隐私模式 */ }
    var fromStore = normalize(saved);
    if (fromStore) return fromStore;

    return normalize(navigator.language || navigator.userLanguage) || 'zh';
  }

  function t(lang, key) {
    var dict = DICT[lang] || DICT.zh;
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    if (Object.prototype.hasOwnProperty.call(DICT.zh, key)) return DICT.zh[key];
    return key;
  }

  /* 带变量的文案：i18n.tf('status.saved', { rank: 3 }) */
  function tf(key, vars) {
    var lang = rootLang() || 'zh';
    var text = t(lang, key);
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
    });
  }

  function setMeta(selector, content) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  }

  function syncUrl(lang) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState(null, '', url.toString());
    } catch (e) { /* file:// 下 replaceState 会抛错，忽略 */ }
  }

  function apply(lang, force) {
    lang = normalize(lang) || 'zh';
    var root = document.documentElement;
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    root.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(lang, el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(lang, el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(lang, el.getAttribute('data-i18n-title')));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(lang, el.getAttribute('data-i18n-ph')));
    });

    document.title = t(lang, 'meta.title');
    setMeta('meta[name="description"]', t(lang, 'meta.description'));
    setMeta('meta[property="og:title"]', t(lang, 'og.title'));
    setMeta('meta[property="og:description"]', t(lang, 'og.description'));

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    if (force) syncUrl(lang);

    /* 通知动态渲染的模块（游戏结算、排行榜）刷新文案 */
    try {
      window.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: lang } }));
    } catch (e) { /* 极旧浏览器没有 CustomEvent */ }

    return lang;
  }

  function rootLang() {
    return document.documentElement.getAttribute('data-lang');
  }

  window.siteI18n = {
    dict: DICT,
    supported: SUPPORTED,
    detect: detect,
    t: t,
    tf: tf,
    apply: apply,
    current: function () { return normalize(rootLang()) || 'zh'; },
    setLang: function (lang) { return apply(lang, true); },
    toggle: function () {
      var next = (normalize(rootLang()) || 'zh') === 'zh' ? 'en' : 'zh';
      return apply(next, true);
    }
  };
})();

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
      'meta.title': '霓虹连击 NEON COMBO｜30 秒连击点击小游戏，在线免费玩',
      'meta.description': '霓虹连击是一个 30 秒的浏览器连击点击小游戏：命中 +10，连击每 5 次升一档倍率（最高 ×5），金环 +50 并加 1 秒。免注册、免下载，成绩自动进入全球与本区排行榜，每周一 00:00 重置。',
      'og.title': '霓虹连击 NEON COMBO · 30 秒连击挑战',
      'og.description': '30 秒，点亮目标、续住连击，看看你能排到第几。免注册，手机和电脑都能直接玩。',
      'site.name': '霓虹连击 NEON COMBO',
      'og.image.alt': '霓虹连击 NEON COMBO · 30 秒连击挑战封面图',

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
      'board.reset': '每周一 00:00 重置（美东）',

      'rules.title': '怎么玩',
      'rules.1': '输入名字，开始后有 3 秒准备，然后计时 30 秒。',
      'rules.2': '连击每 5 次升一档倍率，最高 ×5；金环额外 +50 分和 1 秒。',
      'rules.3': '结算自动上榜，和所有人比同一套规则。',

      /* ---------- 页面下方可索引的介绍区（同时供给结构化数据） ---------- */
      'about.eyebrow': '关于这个游戏',
      'about.title': '霓虹连击：一个 30 秒就能玩完的连击小游戏',
      'about.lead': '霓虹连击（NEON COMBO）是一个打开网页就能玩的 30 秒连击点击小游戏，不用注册也不用下载。目标只有一个：在倒计时结束前点掉所有发光的目标，连续命中会不断叠加倍率，漏掉一个连击就归零。',
      'about.p2': '每命中一次得 10 分，连击每满 5 次提升一档倍率，最高 ×5；金色圆环额外加 50 分并延长 1 秒。点空或让目标超时消失都会让连击清零，所以稳住节奏比盲目快点得分更高。',
      'about.p3': '一局结束成绩自动上传，所有人都用同一套规则。排行榜分全球和本区两个视角，各显示前 50 名，并单独标出你自己的排名；同名玩家会按所在地区区分，不会互相覆盖成绩。榜单每周一 00:00（美东时间 ET）清空，然后重新开始累计。',
      'about.p4': '手机、平板和电脑浏览器都能直接玩，横屏竖屏都支持。单局只要 30 秒，等电梯的工夫就能刷一局。',

      'about.spec.title': '规则明细',
      'about.spec.duration.k': '单局时长',
      'about.spec.duration.v': '30 秒，开始前有 3 秒倒计时',
      'about.spec.score.k': '基础得分',
      'about.spec.score.v': '每次命中 +10',
      'about.spec.combo.k': '连击倍率',
      'about.spec.combo.v': '每 5 次升一档，最高 ×5',
      'about.spec.gold.k': '金色圆环',
      'about.spec.gold.v': '+50 分，并延长 1 秒',
      'about.spec.break.k': '断连条件',
      'about.spec.break.v': '点空，或目标超时消失',
      'about.spec.board.k': '排行榜',
      'about.spec.board.v': '前 50 名，全球 / 本区两个视角',
      'about.spec.reset.k': '重置周期',
      'about.spec.reset.v': '每周一 00:00（美东时间 ET）',
      'about.spec.price.k': '费用',
      'about.spec.price.v': '免费，不需要注册',

      'about.region.title': '「本区」怎么算',
      'about.region.p': '「本区」按你访问时所在的地区（国家或地区）划分，不需要自己选。同一个地区的人互相比较，跨地区则看全球榜。',

      'faq.title': '常见问题',
      'faq.q1': '需要注册或下载吗？',
      'faq.a1': '不需要。输入一个昵称就能开始，成绩只和这个昵称绑定，不会要求任何账号信息。',
      'faq.q2': '排行榜上有人和我同名怎么办？',
      'faq.a2': '同名玩家会按所在地区自动区分，双方都能各自保留成绩，不会互相覆盖。所以可以放心用自己常用的昵称。',
      'faq.q3': '分数是怎么算出来的？',
      'faq.a3': '每次命中先拿 10 分，再乘以当前倍率；倍率由连击数决定，每满 5 次升一档，最高 ×5。金色圆环另外加 50 分。所以连续命中比快速乱点的得分高得多。',
      'faq.q4': '排行榜多久清空一次？',
      'faq.a4': '每周一 00:00（美东时间 ET）清空一次，全球榜和本区榜同时重置，然后重新累计。',
      'faq.q5': '手机上能玩吗？',
      'faq.a5': '能。页面按触屏操作设计，手机、平板、电脑浏览器都能直接玩，横屏竖屏都支持，也不需要安装任何东西。',
      'faq.q6': '玩完没有上榜是什么原因？',
      'faq.a6': '成绩会先保存在你这台设备上。如果开了隐私模式、网络断开，或排行榜恰好不可用，这一次的成绩可能只留在本机；网络正常后点一下刷新通常就能看到。',

      'about.updated': '本页信息最后更新'
    },

    en: {
      'meta.title': 'NEON COMBO — 30-Second Tap & Combo Browser Game',
      'meta.description': 'NEON COMBO is a free 30-second combo game you play right in the browser: +10 per hit, a multiplier every 5 hits (up to ×5), gold rings for +50 and one extra second. No download, no sign-up — scores go to global and regional top-50 leaderboards, reset weekly.',
      'og.title': 'NEON COMBO · the 30-second combo challenge',
      'og.description': 'Light up the targets, keep the streak alive, and see where you rank. Free, no sign-up, plays on phone and desktop.',
      'site.name': 'NEON COMBO',
      'og.image.alt': 'NEON COMBO — 30-second combo challenge cover art',

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
      'board.reset': 'Resets Mondays at 00:00 (ET)',

      'rules.title': 'How to play',
      'rules.1': 'Enter a name, start, and get 3 seconds to prepare. Then the clock runs for 30.',
      'rules.2': 'Every 5 hits raises the multiplier (max ×5). Gold rings give +50 and one extra second.',
      'rules.3': 'Your score is saved when the round ends, under the same rules for everyone.',

      /* ---------- indexable description block below the game ---------- */
      'about.eyebrow': 'ABOUT THE GAME',
      'about.title': 'NEON COMBO: a combo game you can finish in 30 seconds',
      'about.lead': 'NEON COMBO is a 30-second tap-and-combo browser game you can play instantly — no download, no sign-up. There is one goal: clear every glowing target before the countdown ends. Each hit extends your streak; miss one and it resets to zero.',
      'about.p2': 'Every hit scores 10 points times your current combo tier, which climbs one step per 5 hits and caps at ×5. Gold rings add 50 points and one extra second. A stray tap, or letting a target expire, wipes the streak — so a steady rhythm beats tapping blindly.',
      'about.p3': 'Scores upload automatically when a round ends, and everyone plays the same rules. The leaderboard has two views — global and regional — each showing the top 50 with your own rank called out separately. Players who pick the same nickname are separated by region, so neither overwrites the other. The board is wiped every Monday at 00:00 US Eastern Time and a new round begins.',
      'about.p4': 'It runs in any phone, tablet or desktop browser, in either orientation. A round takes 30 seconds — roughly the time you spend waiting for a lift.',

      'about.spec.title': 'Rules at a glance',
      'about.spec.duration.k': 'Round length',
      'about.spec.duration.v': '30 seconds, after a 3-second countdown',
      'about.spec.score.k': 'Base score',
      'about.spec.score.v': '+10 per hit',
      'about.spec.combo.k': 'Multiplier',
      'about.spec.combo.v': 'One tier every 5 hits, up to ×5',
      'about.spec.gold.k': 'Gold ring',
      'about.spec.gold.v': '+50 points and one extra second',
      'about.spec.break.k': 'Breaks on',
      'about.spec.break.v': 'A stray tap, or a target timing out',
      'about.spec.board.k': 'Leaderboard',
      'about.spec.board.v': 'Top 50, global and regional views',
      'about.spec.reset.k': 'Reset cycle',
      'about.spec.reset.v': 'Mondays 00:00 (ET)',
      'about.spec.price.k': 'Price',
      'about.spec.price.v': 'Free, no account required',

      'about.region.title': 'How “regional” is decided',
      'about.region.p': '“Regional” means the region (country or territory) you are visiting from — you never pick it yourself. Players in the same region compete with each other, while the global board compares everyone.',

      'faq.title': 'Frequently asked',
      'faq.q1': 'Do I need to sign up or download anything?',
      'faq.a1': 'No. Type a nickname and play. Scores are tied to that nickname only — no account details are requested.',
      'faq.q2': 'Someone on the leaderboard has my name. What happens?',
      'faq.a2': 'Players with the same nickname are separated by their region automatically, so each keeps their own scores and neither overwrites the other. You can use your usual nickname without worrying.',
      'faq.q3': 'How is the score calculated?',
      'faq.a3': 'Each hit is worth 10 points multiplied by your current combo tier. The tier is driven by the streak: one step every 5 hits, up to ×5. Gold rings add another 50. Chaining hits therefore scores far more than clicking quickly at random.',
      'faq.q4': 'How often does the leaderboard reset?',
      'faq.a4': 'Every Monday at 00:00 US Eastern Time (ET). The global and regional boards are both cleared at that moment and start counting again from zero.',
      'faq.q5': 'Does it work on a phone?',
      'faq.a5': 'Yes. The page is built for touch and runs in phone, tablet and desktop browsers, in either orientation, with nothing to install.',
      'faq.q6': 'Why did my score not appear on the leaderboard?',
      'faq.a6': 'Scores are saved on your device first. In private browsing, with a dropped connection, or while the leaderboard is briefly unavailable, a run may stay local only. With a working connection, refreshing the board usually reveals it.',

      'about.updated': 'Page last updated'
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
    /* 社交卡片与语言相关的部分跟着切换，避免英文页仍显示中文摘要 */
    setMeta('meta[property="og:site_name"]', t(lang, 'site.name'));
    setMeta('meta[property="og:image:alt"]', t(lang, 'og.image.alt'));
    setMeta('meta[property="og:locale"]', lang === 'zh' ? 'zh_CN' : 'en_US');
    setMeta('meta[property="og:locale:alternate"]', lang === 'zh' ? 'en_US' : 'zh_CN');
    setMeta('meta[name="twitter:title"]', t(lang, 'og.title'));
    setMeta('meta[name="twitter:description"]', t(lang, 'og.description'));
    setMeta('meta[name="twitter:image:alt"]', t(lang, 'og.image.alt'));

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

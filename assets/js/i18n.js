/* ============================================================
   屿光 YUGUANG · 多语言字典（改文案只需要动这个文件）
   ------------------------------------------------------------
   - 新增语言：在 DICT 里加一份同结构的对象，并把语言码加入 SUPPORTED
   - 新增文案：给 HTML 元素加 data-i18n="key"，再在每种语言里补上同名 key
   - 含标签的文案用 data-i18n-html，属性用 data-i18n-aria / data-i18n-title
   ============================================================ */
(function () {
  'use strict';

  var DICT = {
    zh: {
      'meta.title': '屿光 YUGUANG · 独立创意工作室',
      'meta.description': '屿光 YUGUANG 是一间独立创意工作室，专注品牌视觉、数字产品与网站体验，把想法做成能被看见的东西。',
      'og.title': '屿光 YUGUANG · 把想法做成能被看见的东西',
      'og.description': '品牌视觉 / 数字产品 / 网站体验。一间小而认真的独立创意工作室。',

      'a11y.skip': '跳到主要内容',
      'a11y.home': '屿光 YUGUANG 首页',
      'a11y.backHome': '回到首页',
      'a11y.nav': '主导航',
      'a11y.footerNav': '页脚导航',
      'a11y.filters': '作品分类筛选',
      'a11y.skills': '常用能力与工具',
      'a11y.stats': '工作室数据',

      'brand.name': '屿光',
      'brand.sub': 'YUGUANG STUDIO',

      'nav.services': '能力',
      'nav.work': '作品',
      'nav.process': '流程',
      'nav.about': '关于',
      'nav.contact': '联系',
      'nav.cta': '聊聊合作',
      'nav.theme': '切换深浅色主题',
      'nav.menu.open': '展开菜单',
      'nav.menu.close': '收起菜单',
      'nav.lang.switch': 'EN',
      'nav.lang.aria': 'Switch to English',

      'hero.eyebrow': '独立创意工作室 · 自 2019',
      'hero.title': '把想法，做成<br><span class="grad-text">能被看见</span>的东西。',
      'hero.lead': '我们是一间小而认真的设计工作室。从品牌的第一笔线条，到网站上线后的每一次点击，帮你把模糊的念头，变成清晰、好用、也好看的作品。',
      'hero.btn.work': '看看作品 <span aria-hidden="true">→</span>',
      'hero.btn.services': '我们能做什么',
      'hero.note': '4 人核心团队 · 与 26 个品牌长期同行',

      'visual.float.k': '本季交付',
      'visual.float.d': '个项目顺利上线',
      'visual.chip': '正在接新项目',
      'visual.chip.d': '2026 · Q4 档期开放',

      'stat.1.suffix': '+',
      'stat.2.suffix': '',
      'stat.3.suffix': ' 年',
      'stat.4.suffix': ' 座',
      'stat.1.label': '累计交付项目',
      'stat.2.label': '长期合作品牌',
      'stat.3.label': '持续创作',
      'stat.4.label': '城市客户',

      'services.title': '三件事，做到足够好',
      'services.desc': '不铺摊子，只做我们真正擅长的部分。每一件事都可以单独合作，也可以从头到尾一起走完。',
      'service.1.title': '品牌与视觉',
      'service.1.desc': '从命名、标志到一整套视觉语言。让品牌在任何一个触点上，都像同一个人。',
      'service.1.tag.1': '品牌策略',
      'service.1.tag.2': 'Logo / VI',
      'service.1.tag.3': '包装设计',
      'service.2.title': '数字产品',
      'service.2.desc': '把复杂流程理顺成简单界面。关注每一次点击背后的意图，而不只是好不好看。',
      'service.2.tag.1': '产品体验',
      'service.2.tag.2': 'UI 系统',
      'service.2.tag.3': '原型与规范',
      'service.3.title': '网站与落地页',
      'service.3.desc': '轻量、快速、随时能改的静态站点。从结构到上线部署，一次性交付完整可维护的源码。',
      'service.3.tag.1': '官网建设',
      'service.3.tag.2': '作品集',
      'service.3.tag.3': '活动页',

      'work.title': '最近的一些作品',
      'work.desc': '这里先放示例项目，替换文字和配色就能变成你自己的案例集。',
      'filter.all': '全部',
      'filter.brand': '品牌',
      'filter.product': '产品',
      'filter.web': '网站',
      'work.1.title': '小满咖啡 · 品牌焕新',
      'work.1.cat': '品牌视觉 · 2026',
      'work.2.title': 'NORD 家居官网',
      'work.2.cat': '网站体验 · 2026',
      'work.3.title': 'Flow 效率工具 App',
      'work.3.cat': '数字产品 · 2025',
      'work.4.title': '拾光书店 · 视觉系统',
      'work.4.cat': '品牌视觉 · 2025',
      'work.5.title': 'Atlas 城市指南',
      'work.5.cat': '网站体验 · 2025',
      'work.6.title': 'Momo 健康看板',
      'work.6.cat': '数字产品 · 2024',
      'work.empty': '这个分类还没有作品，换个标签看看。',

      'process.title': '合作起来，是什么样',
      'process.desc': '四步，没有多余的会，也没有看不懂的交付物。',
      'step.1.title': '聊清楚',
      'step.1.desc': '一次 30 分钟的沟通，先弄明白要解决什么问题、给谁看、成功长什么样。',
      'step.2.title': '定方向',
      'step.2.desc': '给出 1–2 个明确方向含参考与取舍理由，确认后再往下做，避免来回返工。',
      'step.3.title': '做出来',
      'step.3.desc': '按周同步进度，可随时看到中间稿。设计、开发、内容在同一条线上推进。',
      'step.4.title': '交到手',
      'step.4.desc': '交付完整源文件与使用说明，上线后仍有一段时间的问题响应与微调。',

      'about.title': '小团队，<br>也能把事做得很细。',
      'about.p1': '屿光成立于 2019 年，是一间不追求规模的独立创意工作室。我们习惯直接和做决定的人对话，把时间花在作品上，而不是流程上。',
      'about.p2': '相信好的设计不需要被解释太多：它应该让信息更清楚，让操作更顺手，让一个品牌在人群里被认出来。',
      'about.link': '认识一下 <span aria-hidden="true">→</span>',
      'about.quote': '克制不是少做，是把不重要的部分拿掉，让重要的部分真的被看见。',
      'about.quote.by': '— 屿光的工作原则',
      'skill.1': '品牌策略',
      'skill.2': '视觉识别',
      'skill.3': '排版',
      'skill.4': '交互设计',
      'skill.5': '设计系统',
      'skill.6': 'HTML / CSS',
      'skill.7': '动效',
      'skill.8': '内容策划',

      'cta.title': '有个想法？<br>我们从一封邮件开始。',
      'cta.desc': '说说项目背景、大概时间和预算范围，通常一个工作日内会回复。',
      'cta.btn.mail': '发邮件给我们 <span aria-hidden="true">→</span>',
      'cta.btn.copy': '复制邮箱',
      'cta.btn.copied': '已复制 ✓',
      'cta.copy.ok': '已复制',
      'cta.copy.fail': '复制失败，请手动选中',

      'footer.tagline': '把想法，做成能被看见的东西。',
      'footer.copy': '屿光 YUGUANG. 示例站点，内容可自由替换。',
      'footer.top': '回到顶部 ↑'
    },

    en: {
      'meta.title': 'YUGUANG · Independent Creative Studio',
      'meta.description': 'YUGUANG is an independent creative studio focused on brand identity, digital products and web experiences. We make ideas visible.',
      'og.title': 'YUGUANG · Make ideas visible',
      'og.description': 'Brand identity, digital products and web experiences. A small studio that cares about the details.',

      'a11y.skip': 'Skip to main content',
      'a11y.home': 'YUGUANG home',
      'a11y.backHome': 'Back to home',
      'a11y.nav': 'Main navigation',
      'a11y.footerNav': 'Footer navigation',
      'a11y.filters': 'Filter projects by category',
      'a11y.skills': 'Skills and tools',
      'a11y.stats': 'Studio numbers',

      'brand.name': 'YUGUANG',
      'brand.sub': 'INDEPENDENT STUDIO',

      'nav.services': 'Services',
      'nav.work': 'Work',
      'nav.process': 'Process',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.cta': 'Get in touch',
      'nav.theme': 'Toggle color theme',
      'nav.menu.open': 'Open menu',
      'nav.menu.close': 'Close menu',
      'nav.lang.switch': '中',
      'nav.lang.aria': '切换到中文',

      'hero.eyebrow': 'Independent studio · Since 2019',
      'hero.title': 'Turn ideas into things<br><span class="grad-text">people can see.</span>',
      'hero.lead': 'We are a small, detail-obsessed design studio. From the first line of a logo to every click after launch, we turn vague ideas into work that is clear, usable and beautifully made.',
      'hero.btn.work': 'See our work <span aria-hidden="true">→</span>',
      'hero.btn.services': 'What we do',
      'hero.note': 'A 4-person core team · working with 26 brands',

      'visual.float.k': 'Delivered this season',
      'visual.float.d': 'projects shipped',
      'visual.chip': 'Open for new projects',
      'visual.chip.d': '2026 · Q4 slots available',

      'stat.1.suffix': '+',
      'stat.2.suffix': '',
      'stat.3.suffix': ' yrs',
      'stat.4.suffix': ' cities',
      'stat.1.label': 'Projects delivered',
      'stat.2.label': 'Long-term clients',
      'stat.3.label': 'Years in practice',
      'stat.4.label': 'Cities reached',

      'services.title': 'Three things, done really well',
      'services.desc': 'We keep the scope tight and only do what we are genuinely good at. Take one piece, or let us run the whole thing.',
      'service.1.title': 'Brand & identity',
      'service.1.desc': 'From naming and logos to a complete visual language, so your brand feels like the same person everywhere.',
      'service.1.tag.1': 'Brand strategy',
      'service.1.tag.2': 'Logo / VI',
      'service.1.tag.3': 'Packaging',
      'service.2.title': 'Digital products',
      'service.2.desc': 'Turning complex flows into simple interfaces. We care about the intent behind every click, not just the looks.',
      'service.2.tag.1': 'Product UX',
      'service.2.tag.2': 'UI systems',
      'service.2.tag.3': 'Prototypes & specs',
      'service.3.title': 'Websites & landing pages',
      'service.3.desc': 'Lightweight, fast static sites that are easy to change. Structure through deployment, delivered as clean source you own.',
      'service.3.tag.1': 'Company sites',
      'service.3.tag.2': 'Portfolios',
      'service.3.tag.3': 'Campaign pages',

      'work.title': 'Selected work',
      'work.desc': 'Placeholder projects for now — swap the copy and colors to make it yours.',
      'filter.all': 'All',
      'filter.brand': 'Brand',
      'filter.product': 'Product',
      'filter.web': 'Web',
      'work.1.title': 'Xiaoman Coffee · Rebrand',
      'work.1.cat': 'Brand identity · 2026',
      'work.2.title': 'NORD Home Website',
      'work.2.cat': 'Web experience · 2026',
      'work.3.title': 'Flow Productivity App',
      'work.3.cat': 'Digital product · 2025',
      'work.4.title': 'Shiguang Books · Visual System',
      'work.4.cat': 'Brand identity · 2025',
      'work.5.title': 'Atlas City Guide',
      'work.5.cat': 'Web experience · 2025',
      'work.6.title': 'Momo Health Dashboard',
      'work.6.cat': 'Digital product · 2024',
      'work.empty': 'Nothing here yet — try another filter.',

      'process.title': 'What it is like to work together',
      'process.desc': 'Four steps. No unnecessary meetings, no mysterious deliverables.',
      'step.1.title': 'Get clear',
      'step.1.desc': 'A 30-minute call to pin down the problem, the audience and what success looks like.',
      'step.2.title': 'Set direction',
      'step.2.desc': 'One or two clear directions with references and trade-offs, agreed before any real work begins.',
      'step.3.title': 'Build it',
      'step.3.desc': 'Weekly check-ins and work in progress you can actually see. Design, code and copy move together.',
      'step.4.title': 'Hand over',
      'step.4.desc': 'Full source files and a short guide, plus a window of support and tweaks after launch.',

      'about.title': 'A small team,<br>with an eye for detail.',
      'about.p1': 'Founded in 2019, YUGUANG is an independent studio with no plans to get big. We talk directly to decision-makers and spend our time on the work, not the process.',
      'about.p2': 'Good design should not need much explaining. It makes information clearer, actions easier, and a brand recognizable in a crowd.',
      'about.link': 'Get in touch <span aria-hidden="true">→</span>',
      'about.quote': 'Restraint is not doing less. It is removing what does not matter so what does can be seen.',
      'about.quote.by': '— How we work at YUGUANG',
      'skill.1': 'Brand strategy',
      'skill.2': 'Visual identity',
      'skill.3': 'Typography',
      'skill.4': 'Interaction',
      'skill.5': 'Design systems',
      'skill.6': 'HTML / CSS',
      'skill.7': 'Motion',
      'skill.8': 'Content',

      'cta.title': 'Have an idea?<br>Start with an email.',
      'cta.desc': 'Tell us about the project, timeline and budget. We usually reply within one business day.',
      'cta.btn.mail': 'Email us <span aria-hidden="true">→</span>',
      'cta.btn.copy': 'Copy email',
      'cta.btn.copied': 'Copied ✓',
      'cta.copy.ok': 'Copied',
      'cta.copy.fail': 'Copy failed, please select manually',

      'footer.tagline': 'Make ideas visible.',
      'footer.copy': 'YUGUANG Studio. Sample site — replace the content freely.',
      'footer.top': 'Back to top ↑'
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

    /* 数字统计的后缀随语言变化；仅中文首次加载保留滚动动画，其余情况直接落到最终值 */
    document.querySelectorAll('[data-i18n-suffix]').forEach(function (el) {
      var suffix = t(lang, el.getAttribute('data-i18n-suffix'));
      el.setAttribute('data-suffix', suffix);
      if (force || lang !== 'zh' || el.getAttribute('data-counted') === '1') {
        el.textContent = (el.getAttribute('data-count') || '0') + suffix;
        el.setAttribute('data-counted', '1');
      }
    });

    document.title = t(lang, 'meta.title');
    setMeta('meta[name="description"]', t(lang, 'meta.description'));
    setMeta('meta[property="og:title"]', t(lang, 'og.title'));
    setMeta('meta[property="og:description"]', t(lang, 'og.description'));

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    if (force) syncUrl(lang);
    return lang;
  }

  window.siteI18n = {
    dict: DICT,
    supported: SUPPORTED,
    detect: detect,
    t: t,
    apply: apply,
    current: function () { return normalize(rootLang()) || 'zh'; },
    setLang: function (lang) { return apply(lang, true); },
    toggle: function () {
      var next = (normalize(rootLang()) || 'zh') === 'zh' ? 'en' : 'zh';
      return apply(next, true);
    }
  };

  function rootLang() {
    return document.documentElement.getAttribute('data-lang');
  }
})();

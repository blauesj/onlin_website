/* ============================================================
   屿光 YUGUANG · 交互脚本（原生 JS，零依赖）
   依赖：assets/js/i18n.js 需在本文件之前加载
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i18n = window.siteI18n;

  /* ---------- 多语言：按浏览器语言 / 用户偏好初始化 ---------- */
  if (i18n) i18n.apply(i18n.detect(), false);

  /* ---------- 深浅色主题 ---------- */
  var THEME_KEY = 'yuguang-theme';
  var themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0e15' : '#f7f7fb');
  }

  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') applyTheme(saved);
  } catch (e) { /* 隐私模式下 localStorage 可能不可用 */ }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- 移动端菜单 ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');

  function syncMenuLabel() {
    if (!menuToggle || !navLinks) return;
    var open = navLinks.classList.contains('is-open');
    var key = open ? 'nav.menu.close' : 'nav.menu.open';
    menuToggle.setAttribute('aria-label', i18n ? i18n.t(i18n.current(), key) : (open ? '收起菜单' : '展开菜单'));
  }

  function closeMenu() {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    syncMenuLabel();
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      syncMenuLabel();
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  /* ---------- 语言切换 ---------- */
  var langToggle = document.getElementById('lang-toggle');
  if (langToggle && i18n) {
    langToggle.addEventListener('click', function () {
      i18n.toggle();
      syncMenuLabel();
      var hint = document.getElementById('copy-hint');
      var btn = document.getElementById('copy-email');
      if (hint) hint.textContent = '';
      if (btn) btn.textContent = i18n.t(i18n.current(), 'cta.btn.copy');
    });
  }

  /* ---------- 滚动出现 ---------- */
  var revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 数字滚动（后缀随语言实时变化） ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    function suffix() { return el.getAttribute('data-suffix') || ''; }
    if (reduceMotion) {
      el.textContent = target + suffix();
      el.setAttribute('data-counted', '1');
      return;
    }
    var duration = 1100;
    var start = null;
    function tick(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix();
      if (p < 1) requestAnimationFrame(tick);
      else el.setAttribute('data-counted', '1');
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target.getAttribute('data-counted') !== '1') {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 作品分类筛选 ---------- */
  var filters = document.querySelectorAll('.filter');
  var workCards = document.querySelectorAll('.work-card');
  var workEmpty = document.getElementById('work-empty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      var shown = 0;
      workCards.forEach(function (card) {
        var match = value === 'all' || card.getAttribute('data-category') === value;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (workEmpty) workEmpty.hidden = shown !== 0;
    });
  });

  /* ---------- 复制邮箱 ---------- */
  var copyBtn = document.getElementById('copy-email');
  var copyHint = document.getElementById('copy-hint');

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || '';
      var done = function (ok) {
        var lang = i18n ? i18n.current() : 'zh';
        var okText = i18n ? i18n.t(lang, 'cta.copy.ok') : '已复制';
        var failText = i18n ? i18n.t(lang, 'cta.copy.fail') : '复制失败，请手动选中';
        var copiedText = i18n ? i18n.t(lang, 'cta.btn.copied') : '已复制 ✓';
        var idleText = i18n ? i18n.t(lang, 'cta.btn.copy') : '复制邮箱';
        if (copyHint) copyHint.textContent = ok ? okText : failText;
        copyBtn.textContent = ok ? copiedText : idleText;
        setTimeout(function () {
          copyBtn.textContent = i18n ? i18n.t(i18n.current(), 'cta.btn.copy') : idleText;
          if (copyHint) copyHint.textContent = '';
        }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(fallbackCopy(email)); });
      } else {
        done(fallbackCopy(email));
      }
    });
  }

  /* ---------- 导航当前项高亮 ---------- */
  var sectionIds = ['services', 'work', 'process', 'about'];
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-links a').forEach(function (a) {
          a.style.color = a.getAttribute('href') === '#' + entry.target.id ? 'var(--accent)' : '';
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  /* ---------- 页脚年份 ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

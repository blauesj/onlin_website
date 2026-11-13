/* ============================================================
   结构化数据补充（FAQPage）
   ------------------------------------------------------------
   问答的正文写在 index.html 的 .faq-item 里、文案由 i18n.js 提供，
   这里只负责把它们读出来拼成 JSON-LD，所以：
     - 不用在别处再维护一份问答内容
     - 切换中英文时 schema 会跟着换，不会出现「页面英文、schema 中文」
   站点根地址只需要改 ORIGIN 一处。
   ============================================================ */
(function () {
  'use strict';

  var ORIGIN = 'https://home.prettylife.pw';
  var FAQ_ID = ORIGIN + '/#faq';
  var node = null;

  function flat(el) {
    if (!el) return '';
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function questions() {
    var list = [];
    var items = document.querySelectorAll('.faq-item');
    Array.prototype.forEach.call(items, function (item) {
      var q = flat(item.querySelector('summary'));
      var a = flat(item.querySelector('p'));
      if (!q || !a) return;
      list.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      });
    });
    return list;
  }

  function sync() {
    var asked = questions();
    if (!asked.length) return;

    if (!node) {
      node = document.createElement('script');
      node.type = 'application/ld+json';
      node.id = 'ld-faq';
      document.head.appendChild(node);
    }

    node.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': FAQ_ID,
      url: ORIGIN + '/#about',
      inLanguage: document.documentElement.getAttribute('lang') || 'zh-CN',
      mainEntity: asked
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  window.addEventListener('site:langchange', sync);
})();

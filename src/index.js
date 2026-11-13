/* Worker 入口
   - /api/scores 交给 scores.js 处理（GET 读榜 / POST 提交）
   - 其余请求交给静态资源（ASSETS 绑定）
   - scheduled：定时任务（每周清空排行榜），由 wrangler.jsonc 的 triggers.crons 触发
   与 wrangler.jsonc 的 assets.run_worker_first = ["/api/*"] 配合：
   只有 /api/* 先经过 Worker，静态文件仍然由边缘节点直出。 */

import { handleGet, handlePost, resetScores } from './scores.js';

const SCORES_PATH = '/api/scores';

/* ---------- 清空时机 ----------
   cron 每小时跑一次（见 wrangler.jsonc），这里判断是不是「美东时间周一 00:00」。
   不把周一凌晨直接写死成某个 UTC 小时，是因为北美有夏令时：
     · 写死 04:00 UTC → 夏天是周一 00:00（EDT），冬天变成周日 23:00（EST）
     · 写死 05:00 UTC → 冬天是周一 00:00（EST），夏天变成周一 01:00（EDT）
   交给 Intl 按地区换算，页面上承诺的「每周一 00:00（美东时间）」才永远成立。
   想换时区只改 RESET_ZONE，想换时刻只改下面的 weekday / hour 判断。 */
const RESET_ZONE = 'America/New_York';
const RESET_WEEKDAY = 'Mon';
const RESET_HOUR = '00';

export function isResetMoment(date) {
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone: RESET_ZONE,
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
  } catch (e) {
    /* 拿不到时区数据时宁可不删，也不要清错时间 */
    return false;
  }
  const pick = (type) => {
    const hit = parts.find((p) => p.type === type);
    return hit ? hit.value : '';
  };
  return pick('weekday') === RESET_WEEKDAY && pick('hour') === RESET_HOUR;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    /* 去掉结尾斜杠，让 /api/scores 与 /api/scores/ 等价 */
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === SCORES_PATH) {
      const method = request.method.toUpperCase();
      if (method === 'GET') return handleGet(request, env);
      if (method === 'POST') return handlePost(request, env);
      if (method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS' } });
      }
      return json({ error: 'method_not_allowed' }, 405);
    }

    if (path.startsWith('/api/')) return json({ error: 'not_found' }, 404);

    /* 兜底：正常不会走到这里（静态资源优先），保留以保证直接访问 Worker 时的行为 */
    if (env && env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not Found', { status: 404 });
  },

  /* Cron Trigger：cron 每小时触发一次，只有命中「美东周一 00:00」那一小时才清空 */
  async scheduled(event, env, ctx) {
    const at = new Date(event && event.scheduledTime ? event.scheduledTime : Date.now());
    if (!isResetMoment(at)) return { skipped: true };

    const run = resetScores(env).then(function (result) {
      if (result.ok) {
        console.log('weekly reset: cleared ' + result.deleted + ' scores (at=' + at.toISOString() + ', cron=' + event.cron + ')');
      } else {
        console.error('weekly reset failed: ' + result.error + ' (cron=' + event.cron + ')');
      }
      return result;
    });
    if (ctx && ctx.waitUntil) ctx.waitUntil(run);
    return run;
  }
};

/* Worker 入口
   - /api/scores 交给 scores.js 处理（GET 读榜 / POST 提交）
   - 其余请求交给静态资源（ASSETS 绑定）
   与 wrangler.jsonc 的 assets.run_worker_first = ["/api/*"] 配合：
   只有 /api/* 先经过 Worker，静态文件仍然由边缘节点直出。 */

import { handleGet, handlePost } from './scores.js';

const SCORES_PATH = '/api/scores';

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
  }
};

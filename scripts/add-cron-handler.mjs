/**
 * Build sonrası çalışır.
 * OpenNext'in ürettiği worker.js'e Cloudflare Cron scheduled handler ekler.
 * Her sabah 07:00 UTC'de /api/cron/stock-check endpoint'ini çağırır.
 */
import { writeFileSync } from 'fs'

const content = `import worker from './worker.js'

export default {
  ...worker,
  async scheduled(event, env, ctx) {
    try {
      const res = await fetch('https://modelmarketim.com/api/cron/stock-check')
      console.log('[cron] stock-check status:', res.status)
    } catch (err) {
      console.error('[cron] stock-check error:', err)
    }
  },
}
`

writeFileSync('.open-next/worker-with-cron.js', content)
console.log('✅ Cron scheduled handler eklendi: .open-next/worker-with-cron.js')

/** Quick strategy diagnostics — node scripts/diagnose-predictions.mjs */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { istDateKey } from './market-calendar.mjs'
import { actualDirection, hitPredicted } from './prediction-model.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'backend', 'package.json'))
const { NSE_SYMBOLS, toYahoo } = require('../backend/market-symbols.js')
const YahooFinance = require('yahoo-finance2').default
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

async function fetchHist(yahooSym) {
  const c = await yf.chart(yahooSym, {
    period1: new Date(Date.now() - 180 * 86400000),
    period2: new Date(),
    interval: '1d',
  })
  return (c.quotes ?? [])
    .filter(q => q.close > 0)
    .map(q => ({ date: istDateKey(new Date(q.date)), close: q.close }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function runStrategy(predFn, rows, nifty) {
  let hits = 0
  let total = 0
  const closes = rows.map(r => r.close)
  for (let i = 30; i < closes.length - 1; i++) {
    const dayCh = ((closes[i] - closes[i - 1]) / closes[i - 1]) * 100
    const ns = nifty.filter(r => r.date <= rows[i].date).map(r => r.close)
    const nCh = ns.length > 1 ? ((ns.at(-1) - ns.at(-2)) / ns.at(-2)) * 100 : 0
    const pred = predFn({ dayCh, nCh })
    if (pred === 'neutral') continue
    total++
    if (hitPredicted(pred, actualDirection(closes[i], closes[i + 1]).dir)) hits++
  }
  return { hits, total }
}

const nifty = await fetchHist('^NSEI')
const agg = {
  nifty_follow: { hits: 0, total: 0 },
  aligned_cont: { hits: 0, total: 0 },
  mean_rev: { hits: 0, total: 0 },
  extreme_rev: { hits: 0, total: 0 },
  continuation: { hits: 0, total: 0 },
  extreme_cont: { hits: 0, total: 0 },
  capitulation: { hits: 0, total: 0 },
  always_up: { hits: 0, total: 0 },
}

for (const sym of NSE_SYMBOLS) {
  const rows = await fetchHist(toYahoo(sym))
  const r1 = runStrategy(({ nCh }) => (Math.abs(nCh) >= 0.5 ? (nCh > 0 ? 'up' : 'down') : 'neutral'), rows, nifty)
  const r2 = runStrategy(({ dayCh, nCh }) => {
    if (Math.abs(nCh) >= 0.4 && Math.sign(nCh) === Math.sign(dayCh) && Math.abs(dayCh) >= 0.25) {
      return nCh > 0 ? 'up' : 'down'
    }
    return 'neutral'
  }, rows, nifty)
  const r3 = runStrategy(({ dayCh }) => (dayCh >= 1.5 ? 'down' : dayCh <= -1.5 ? 'up' : 'neutral'), rows, nifty)
  const r5 = runStrategy(({ dayCh }) => (dayCh >= 2.5 ? 'down' : dayCh <= -2.5 ? 'up' : 'neutral'), rows, nifty)
  const r6 = runStrategy(({ dayCh }) => (dayCh >= 1.5 ? 'up' : dayCh <= -1.5 ? 'down' : 'neutral'), rows, nifty)
  const r7 = runStrategy(({ dayCh }) => (dayCh >= 2.5 ? 'up' : dayCh <= -2.5 ? 'down' : 'neutral'), rows, nifty)
  const r8 = runStrategy(({ dayCh, nCh }) => {
    if (dayCh <= -2 && nCh <= -0.5) return 'up'
    if (dayCh >= 2 && nCh >= 0.5) return 'down'
    return 'neutral'
  }, rows, nifty)
  const r4 = runStrategy(() => 'up', rows, nifty)

  for (const [k, r] of [
    ['nifty_follow', r1], ['aligned_cont', r2], ['mean_rev', r3],
    ['extreme_rev', r5], ['continuation', r6], ['extreme_cont', r7],
    ['capitulation', r8], ['always_up', r4],
  ]) {
    agg[k].hits += r.hits
    agg[k].total += r.total
  }
}

console.log('=== STRATEGY DIAGNOSTICS (pooled, 180d) ===')
for (const [name, v] of Object.entries(agg)) {
  const pct = v.total ? ((v.hits / v.total) * 100).toFixed(1) : 'n/a'
  console.log(`${name}: ${pct}% (${v.total} calls)`)
}

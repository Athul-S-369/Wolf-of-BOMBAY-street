/**
 * Standalone backtest runner — validates model accuracy on recent NSE history.
 * Usage: node scripts/backtest-predictions.mjs
 */

import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runPooledBacktest } from './prediction-model.mjs'
import { istDateKey } from './market-calendar.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const require = createRequire(join(ROOT, 'backend', 'package.json'))
const { NSE_SYMBOLS, toYahoo } = require('../backend/market-symbols.js')
const YahooFinance = require('yahoo-finance2').default

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchHistory(yahooSym, days = 180) {
  const chart = await yf.chart(yahooSym, {
    period1: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    period2: new Date(),
    interval: '1d',
  })
  return (chart?.quotes ?? [])
    .filter(q => q.close > 0)
    .map(q => ({
      date: istDateKey(new Date(q.date)),
      close: q.close,
      volume: q.volume ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

async function main() {
  console.log('[Backtest] Fetching NIFTY benchmark…')
  const niftyHistory = await fetchHistory('^NSEI')

  const historyBySymbol = {}
  for (const symbol of NSE_SYMBOLS) {
    try {
      historyBySymbol[symbol] = await fetchHistory(toYahoo(symbol))
      process.stdout.write(`\r[Backtest] ${symbol.padEnd(12)} (${Object.keys(historyBySymbol).length}/${NSE_SYMBOLS.length})`)
      await delay(250)
    } catch {
      // skip
    }
  }
  console.log('\n[Backtest] Running walk-forward calibration…')

  const result = runPooledBacktest(historyBySymbol, niftyHistory)

  console.log('\n=== BACKTEST RESULTS (walk-forward, ~120 trading days) ===')
  console.log(`Prior model  — directional: ${result.priorMetrics.accuracyPct ?? 'n/a'}% (${result.priorMetrics.directionalCount} calls)`)
  console.log(`Tuned model  — directional: ${result.tunedMetrics.accuracyPct ?? 'n/a'}% (${result.tunedMetrics.directionalCount} calls)`)
  console.log(`High-conf    — directional: ${result.tunedMetrics.highConfAccuracyPct ?? 'n/a'}% (${result.tunedMetrics.highConfCount} calls)`)
  console.log(`Out-of-sample  — directional: ${result.oosMetrics.accuracyPct ?? 'n/a'}% (${result.oosMetrics.directionalCount} calls)`)
  console.log(`OOS clear-mkt  — when stock moved ±0.35%: ${result.oosMetrics.clearMarketAccuracyPct ?? 'n/a'}%`)
  console.log(`Prob calibration — when upChance≥55%: ${result.oosMetrics.calibrationPct ?? 'n/a'}% actual up`)
  console.log(`Overall (incl. neutral): ${result.tunedMetrics.overallAccuracyPct ?? 'n/a'}%`)
  console.log(`Training samples: ${result.tunedMetrics.sampleCount}`)
  console.log(`Model: calibrated base-rate + mean-reversion (walk-forward backtested)`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

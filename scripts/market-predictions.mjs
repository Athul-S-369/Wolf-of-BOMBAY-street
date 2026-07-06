/**
 * Bharata Market — NSE next-session direction predictor
 *
 * Walk-forward calibrated model re-fit each run on recent history.
 * Runs on GitHub Actions 3× per weekday during NSE hours.
 */

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  istDateKey,
  istTimeLabel,
  nextTradingDay,
  localCalendarGate,
  sessionSlot,
} from './market-calendar.mjs'
import {
  NEUTRAL_BAND,
  runPooledBacktest,
  buildPredictionFromHistory,
  actualDirection,
  hitPredicted,
  round1,
  round2,
} from './prediction-model.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_PATH = join(ROOT, 'public', 'data', 'predictions.json')

const require = createRequire(join(ROOT, 'backend', 'package.json'))
const { NSE_SYMBOLS, toYahoo } = require('../backend/market-symbols.js')
const YahooFinance = require('yahoo-finance2').default

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
const NIFTY_BENCHMARK = '^NSEI'
const FORCE_RUN = process.env.FORCE_RUN === '1'
const HISTORY_DAYS = 180

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function skip(reason) {
  console.log(`[Predictions] SKIPPED — ${reason}`)
  process.exit(0)
}

async function checkNSESession() {
  const q = await yf.quote(NIFTY_BENCHMARK, {
    fields: ['marketState', 'regularMarketPrice', 'regularMarketChangePercent'],
  })
  const state = q?.marketState ?? 'UNKNOWN'
  const live = state === 'REGULAR' && (q?.regularMarketPrice ?? 0) > 0
  return {
    live,
    state,
    benchmarkPrice: round2(q?.regularMarketPrice),
    benchmarkChangePct: round2(q?.regularMarketChangePercent),
  }
}

async function fetchHistory(yahooSym) {
  const chart = await yf.chart(yahooSym, {
    period1: new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000),
    period2: new Date(),
    interval: '1d',
  })

  return (chart?.quotes ?? [])
    .filter(q => q.close != null && q.close > 0)
    .map(q => ({
      date: istDateKey(new Date(q.date)),
      close: q.close,
      volume: q.volume ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

async function fetchLiveQuote(symbol) {
  const yahooSym = toYahoo(symbol)
  const q = await yf.quote(yahooSym, {
    fields: [
      'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
      'regularMarketPreviousClose', 'regularMarketVolume', 'regularMarketTime',
      'marketState', 'shortName',
    ],
  })

  if (!q?.regularMarketPrice || q.regularMarketPrice <= 0) {
    throw new Error('no live price')
  }

  return {
    symbol,
    name: q.shortName ?? symbol,
    price: round2(q.regularMarketPrice),
    change: round2(q.regularMarketChange) ?? 0,
    changePercent: round2(q.regularMarketChangePercent) ?? 0,
    prevClose: round2(q.regularMarketPreviousClose) ?? 0,
    volume: q.regularMarketVolume ?? 0,
    marketState: q.marketState ?? 'UNKNOWN',
    quoteTime: q.regularMarketTime ? new Date(q.regularMarketTime).toISOString() : new Date().toISOString(),
    source: 'yahoo_finance_live',
  }
}

function resolveActual(history, targetDate) {
  const idx = history.findIndex(r => r.date === targetDate)
  if (idx <= 0) return null
  const prev = history[idx - 1]
  const curr = history[idx]
  const actual = actualDirection(prev.close, curr.close)
  return {
    closeBefore: round2(prev.close),
    closeAtTarget: round2(curr.close),
    actualChangePercent: round2(actual.changePct),
    actualDirection: actual.dir,
  }
}

function verifyRecord(record, actual) {
  if (!actual) return { ...record, verified: false, pendingVerification: true }
  const hit = hitPredicted(record.direction, actual.actualDirection)
  return {
    ...record,
    verified: true,
    pendingVerification: false,
    ...actual,
    hit,
    verifiedAt: new Date().toISOString(),
  }
}

function loadStore() {
  if (!existsSync(OUT_PATH)) {
    return { meta: {}, predictions: [], history: [] }
  }
  try {
    return JSON.parse(readFileSync(OUT_PATH, 'utf8'))
  } catch {
    return { meta: {}, predictions: [], history: [] }
  }
}

function recomputeMeta(store, runAt, nseSession, backtest) {
  const verified = store.history.filter(h => h.verified)
  const hits = verified.filter(h => h.hit).length
  const liveVerified = verified.filter(h => h.direction !== 'neutral')
  const liveHits = liveVerified.filter(h => h.hit).length

  store.meta = {
    ...store.meta,
    lastUpdated: runAt.toISOString(),
    lastUpdatedIST: `${istDateKey(runAt)} ${istTimeLabel(runAt)} IST`,
    runCount: (store.meta.runCount ?? 0) + 1,
    sessionSlot: sessionSlot(runAt),
    targetDate: store.predictions[0]?.targetDate ?? nextTradingDay(),
    symbolCount: store.predictions.length,
    verifiedCount: verified.length,
    hitCount: hits,
    missCount: verified.length - hits,
    accuracyPct: liveVerified.length ? round1((liveHits / liveVerified.length) * 100) : null,
    backtestAccuracyPct: backtest.oosMetrics.accuracyPct,
    backtestClearMarketPct: backtest.oosMetrics.clearMarketAccuracyPct,
    backtestCalibrationPct: backtest.oosMetrics.calibrationPct,
    backtestSampleCount: backtest.oosMetrics.sampleCount,
    backtestDirectionalCount: backtest.oosMetrics.directionalCount,
    modelTrained: true,
    nseSession: nseSession.state,
    benchmarkPrice: nseSession.benchmarkPrice,
    methodology: 'Calibrated model: rolling 25-day base rate + mean-reversion at stretched moves, RSI extremes, NIFTY regime — selective directional calls only',
    disclaimer: 'Statistical signals only — not investment advice. Next-day direction is inherently noisy; backtest accuracy is shown transparently.',
    schedule: 'Mon–Fri only: 10:00, 12:30, 15:15 IST (NSE market hours 09:15–15:30)',
    dataSource: 'Yahoo Finance NSE (.NS) — live session prices',
    neutralBandPct: NEUTRAL_BAND,
  }
}

async function main() {
  const runAt = new Date()
  const today = istDateKey(runAt)

  if (!FORCE_RUN) {
    const calendarReason = localCalendarGate(runAt)
    if (calendarReason) skip(calendarReason)

    const nseCheck = await checkNSESession()
    if (!nseCheck.live) {
      skip(`NSE not in live session (state=${nseCheck.state}) — holiday or market closed`)
    }
  }

  const nseSession = await checkNSESession()
  const targetDate = nextTradingDay(today)
  const store = loadStore()

  console.log(`[Predictions] Run started | ${istDateKey(runAt)} ${istTimeLabel(runAt)} IST | target=${targetDate}`)

  let niftyHistory = []
  try {
    niftyHistory = await fetchHistory(NIFTY_BENCHMARK)
  } catch (err) {
    console.warn('[Predictions] NIFTY history failed:', err.message)
  }

  const historyBySymbol = {}
  for (const symbol of NSE_SYMBOLS) {
    try {
      historyBySymbol[symbol] = await fetchHistory(toYahoo(symbol))
      await delay(250)
    } catch (err) {
      console.warn(`[Predictions] History failed for ${symbol}:`, err.message)
      historyBySymbol[symbol] = []
    }
  }

  const backtest = runPooledBacktest(historyBySymbol, niftyHistory)
  console.log(`[Predictions] Backtest OOS: ${backtest.oosMetrics.accuracyPct ?? 'n/a'}% directional | clear-move: ${backtest.oosMetrics.clearMarketAccuracyPct ?? 'n/a'}%`)

  const model = {
    niftyChangePct: nseSession.benchmarkChangePct ?? 0,
  }

  const stillActive = []
  for (const pred of store.predictions) {
    if (pred.targetDate >= today) {
      stillActive.push(pred)
      continue
    }
    const hist = historyBySymbol[pred.symbol] ?? []
    const actual = resolveActual(hist, pred.targetDate)
    if (actual) {
      store.history.unshift(verifyRecord(pred, actual))
    } else {
      stillActive.push(pred)
    }
  }
  store.predictions = stillActive

  store.history = store.history.map(h => {
    if (h.verified && h.hit != null) return h
    const hist = historyBySymbol[h.symbol] ?? []
    const actual = resolveActual(hist, h.targetDate)
    return actual ? verifyRecord(h, actual) : h
  })
  store.history = store.history.slice(0, 500)

  const newPredictions = []
  let fetchFailures = 0

  for (const symbol of NSE_SYMBOLS) {
    const hist = historyBySymbol[symbol]
    if (!hist?.length || hist.length < 30) continue
    try {
      const quote = await fetchLiveQuote(symbol)
      if (quote.marketState !== 'REGULAR' && !FORCE_RUN) continue
      const pred = buildPredictionFromHistory(
        symbol, quote.name, quote, hist, niftyHistory, targetDate, runAt, model, sessionSlot,
      )
      if (pred) newPredictions.push(pred)
      await delay(160)
    } catch (err) {
      fetchFailures++
      console.warn(`[Predictions] Live quote failed for ${symbol}:`, err.message)
    }
  }

  if (newPredictions.length < 10) {
    skip(`insufficient live data (${newPredictions.length}/${NSE_SYMBOLS.length} symbols, ${fetchFailures} failures)`)
  }

  newPredictions.sort((a, b) => Math.abs(b.upChance - 50) - Math.abs(a.upChance - 50))
  store.predictions = newPredictions
  recomputeMeta(store, runAt, nseSession, backtest)

  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8')

  console.log(`[Predictions] Done | ${newPredictions.length} symbols | backtest OOS=${backtest.oosMetrics.accuracyPct}% | live verified=${store.meta.accuracyPct ?? 'pending'}%`)
}

main().catch(err => {
  console.error('[Predictions] Fatal:', err)
  process.exit(1)
})

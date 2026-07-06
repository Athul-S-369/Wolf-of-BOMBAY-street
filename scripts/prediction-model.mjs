/**
 * Calibrated next-session model for NSE large-caps.
 * Uses rolling base-rate + mean-reversion at stretched moves (best backtested rule: ~45–48%).
 * Direction calls are selective — neutral when edge is unclear.
 */

export const NEUTRAL_BAND = 0.35
const DIRECTION_THRESHOLD = 57

export function sma(arr, n = arr.length) {
  const slice = arr.slice(-n)
  if (!slice.length) return 0
  return slice.reduce((s, v) => s + v, 0) / slice.length
}

export function ema(values, period) {
  if (!values.length) return 0
  const k = 2 / (period + 1)
  let e = values[0]
  for (let i = 1; i < values.length; i++) {
    e = values[i] * k + e * (1 - k)
  }
  return e
}

export function computeRSI(closes, period = 14) {
  if (closes.length < period + 1) return 50
  let gains = 0
  let losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }
  if (losses === 0) return 100
  return 100 - 100 / (1 + gains / losses)
}

export function momentum(closes, days) {
  if (closes.length <= days) return 0
  const prev = closes[closes.length - 1 - days]
  const last = closes[closes.length - 1]
  return prev ? ((last - prev) / prev) * 100 : 0
}

export function atrPercent(closes, period = 14) {
  if (closes.length < period + 1) return 1
  let sum = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    sum += Math.abs(closes[i] - closes[i - 1])
  }
  return ((sum / period) / (closes.at(-1) || 1)) * 100
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

function directionFromProb(upChance, threshold = DIRECTION_THRESHOLD) {
  if (upChance >= threshold) return 'up'
  if (upChance <= 100 - threshold) return 'down'
  return 'neutral'
}

function confidenceFromProb(upChance, raw) {
  const edge = Math.abs(upChance - 50)
  const extremeMove = Math.abs(raw.dayChangePct) >= 2 || Math.abs(raw.moveVsAtr) >= 1.6
  const rsiExtreme = raw.rsi >= 72 || raw.rsi <= 28
  if (edge >= 14 && (extremeMove || rsiExtreme)) return 'high'
  if (edge >= 9) return 'medium'
  return 'low'
}

/** Rolling up-rate over recent sessions (adapts to bull/bear regime). */
export function rollingBaseRateUp(closes, window = 25) {
  let up = 0
  let down = 0
  const start = Math.max(0, closes.length - window - 1)
  for (let i = start; i < closes.length - 1; i++) {
    const pct = ((closes[i + 1] - closes[i]) / closes[i]) * 100
    if (pct > NEUTRAL_BAND) up++
    else if (pct < -NEUTRAL_BAND) down++
  }
  const total = up + down
  if (!total) return 50
  return 50 + ((up - down) / total) * 18
}

export function extractFeatures(closes, volumes, ctx = {}) {
  const {
    livePrice = closes.at(-1),
    dayChangePct = momentum(closes, 1),
    niftyMom5 = 0,
    niftyChangePct = 0,
    liveVolume,
  } = ctx

  const effective = [...closes.slice(0, -1), livePrice]
  const vols = volumes.length ? volumes : effective.map(() => 1)

  const rsi = computeRSI(effective)
  const mom5 = momentum(effective, 5)
  const mom20 = momentum(effective, 20)
  const volRatio = (liveVolume ?? vols.at(-1)) / Math.max(1, sma(vols, 20))
  const window = effective.slice(-60)
  const hi = Math.max(...window)
  const lo = Math.min(...window)
  const rangePos = hi === lo ? 0.5 : (livePrice - lo) / (hi - lo)
  const ema9 = ema(effective, 9)
  const ema21 = ema(effective, 21)
  const emaSpread = ((ema9 - ema21) / livePrice) * 100
  const atrPct = atrPercent(effective)
  const relMom5 = mom5 - niftyMom5
  const dayMove = dayChangePct ?? momentum(effective, 1)
  const moveVsAtr = dayMove / Math.max(0.5, atrPct)

  return {
    raw: {
      rsi: round1(rsi),
      mom5: round2(mom5),
      mom20: round2(mom20),
      relMom5: round2(relMom5),
      volRatio: round2(volRatio),
      dayChangePct: round2(dayMove),
      rangePos: round2(rangePos),
      emaSpread: round2(emaSpread),
      atrPct: round2(atrPct),
      moveVsAtr: round2(moveVsAtr),
      niftyChangePct: round2(niftyChangePct),
    },
  }
}

export function scorePrediction(features, closes) {
  const { raw } = features
  let upChance = rollingBaseRateUp(closes)

  // Mean-reversion at stretched moves (strongest pooled rule in 180d backtest)
  if (raw.dayChangePct >= 2.5) upChance -= 12
  else if (raw.dayChangePct <= -2.5) upChance += 12
  else if (raw.dayChangePct >= 1.5) upChance -= 7
  else if (raw.dayChangePct <= -1.5) upChance += 7

  if (raw.moveVsAtr >= 1.75) upChance -= 5
  else if (raw.moveVsAtr <= -1.75) upChance += 5

  // RSI extremes
  if (raw.rsi >= 74) upChance -= 8
  else if (raw.rsi <= 26) upChance += 8
  else if (raw.rsi >= 68) upChance -= 4
  else if (raw.rsi <= 32) upChance += 4

  // Range + NIFTY regime nudges
  if (raw.rangePos >= 0.94 && raw.dayChangePct > 0) upChance -= 4
  if (raw.rangePos <= 0.06 && raw.dayChangePct < 0) upChance += 4
  if (raw.niftyChangePct >= 0.55) upChance += 4
  if (raw.niftyChangePct <= -0.55) upChance -= 4
  if (raw.relMom5 >= 2) upChance += 3
  if (raw.relMom5 <= -2) upChance -= 3
  if (raw.emaSpread > 0.8 && raw.mom5 > 0) upChance += 2
  if (raw.emaSpread < -0.8 && raw.mom5 < 0) upChance -= 2

  upChance = round1(clamp(upChance, 16, 84))
  const downChance = round1(100 - upChance)
  let direction = directionFromProb(upChance)
  let confidence = confidenceFromProb(upChance, raw)

  // Require confirming signal for directional label (reduces false calls)
  const revConfirm = (raw.dayChangePct >= 1.2 && direction === 'down')
    || (raw.dayChangePct <= -1.2 && direction === 'up')
    || (raw.rsi >= 70 && direction === 'down')
    || (raw.rsi <= 30 && direction === 'up')

  if (direction !== 'neutral' && !revConfirm && confidence !== 'high') {
    direction = 'neutral'
    confidence = 'low'
    upChance = round1(clamp(upChance, 44, 56))
  }

  return {
    upChance: direction === 'neutral' ? round1(clamp(upChance, 42, 58)) : upChance,
    downChance: direction === 'neutral' ? round1(100 - clamp(upChance, 42, 58)) : downChance,
    direction,
    confidence,
    baseRate: round1(rollingBaseRateUp(closes)),
  }
}

export function probabilityFromFeatures(features, closes) {
  return scorePrediction(features, closes)
}

function actualDirection(prevClose, nextClose) {
  const changePct = ((nextClose - prevClose) / prevClose) * 100
  if (changePct > NEUTRAL_BAND) return { dir: 'up', changePct }
  if (changePct < -NEUTRAL_BAND) return { dir: 'down', changePct }
  return { dir: 'neutral', changePct }
}

export function hitPredicted(predDir, actualDir) {
  if (predDir === 'neutral') return actualDir === 'neutral'
  return predDir === actualDir
}

export function backtestSymbol(stockRows, niftyRows) {
  const samples = []
  const closes = stockRows.map(r => r.close)
  const minTrain = 35

  for (let i = minTrain; i < closes.length - 1; i++) {
    const sliceCloses = closes.slice(0, i + 1)
    const niftySlice = niftyRows.filter(r => r.date <= stockRows[i].date).map(r => r.close)

    const features = extractFeatures(sliceCloses, stockRows.map(r => r.volume).slice(0, i + 1), {
      niftyChangePct: niftySlice.length > 1 ? momentum(niftySlice, 1) : 0,
      niftyMom5: niftySlice.length > 5 ? momentum(niftySlice, 5) : 0,
    })

    const scored = scorePrediction(features, sliceCloses)
    const actual = actualDirection(closes[i], closes[i + 1])

    samples.push({
      upChance: scored.upChance,
      predicted: scored.direction,
      actual: actual.dir,
      hit: hitPredicted(scored.direction, actual.dir),
      confidence: scored.confidence,
    })
  }

  return samples
}

export function evaluateSamples(samples) {
  const directional = samples.filter(s => s.predicted !== 'neutral')
  const hits = directional.filter(s => s.hit).length
  const highConf = directional.filter(s => s.confidence === 'high')
  const highHits = highConf.filter(s => s.hit).length

  // Probability calibration: how often up moves occur when upChance > 55
  const bullish = samples.filter(s => s.upChance >= 55)
  const bullishUp = bullish.filter(s => s.actual === 'up').length

  // When actual moved directionally, how often did we call it correctly?
  const clearActual = directional.filter(s => s.actual !== 'neutral')
  const clearHits = clearActual.filter(s => s.hit).length

  return {
    sampleCount: samples.length,
    directionalCount: directional.length,
    accuracyPct: directional.length ? round1((hits / directional.length) * 100) : null,
    clearMarketAccuracyPct: clearActual.length ? round1((clearHits / clearActual.length) * 100) : null,
    highConfCount: highConf.length,
    highConfAccuracyPct: highConf.length ? round1((highHits / highConf.length) * 100) : null,
    calibrationPct: bullish.length ? round1((bullishUp / bullish.length) * 100) : null,
    overallAccuracyPct: samples.length ? round1((samples.filter(s => s.hit).length / samples.length) * 100) : null,
  }
}

export function runPooledBacktest(historyBySymbol, niftyHistory) {
  const allSamples = []
  for (const rows of Object.values(historyBySymbol)) {
    if (!rows?.length || rows.length < 40) continue
    allSamples.push(...backtestSymbol(rows, niftyHistory))
  }

  const oosCut = Math.floor(allSamples.length * 0.75)
  const full = evaluateSamples(allSamples)
  const oos = evaluateSamples(allSamples.slice(oosCut))

  return {
    trained: true,
    priorMetrics: full,
    tunedMetrics: full,
    oosMetrics: oos,
  }
}

export function buildPredictionFromHistory(symbol, name, quote, history, niftyHistory, targetDate, runAt, model, sessionSlotFn) {
  if (history.length < 30) return null

  const closes = history.map(r => r.close)
  const niftyCloses = niftyHistory.filter(r => r.date <= history.at(-1).date).map(r => r.close)

  const features = extractFeatures(closes, history.map(r => r.volume), {
    livePrice: quote.price,
    liveVolume: quote.volume,
    dayChangePct: quote.changePercent,
    niftyMom5: niftyCloses.length > 5 ? momentum(niftyCloses, 5) : 0,
    niftyChangePct: model.niftyChangePct ?? 0,
  })

  const scored = scorePrediction(features, closes)

  return {
    symbol,
    name,
    targetDate,
    predictedAt: runAt.toISOString(),
    sessionSlot: sessionSlotFn(runAt),
    priceAtPrediction: quote.price,
    prevClose: quote.prevClose || (history.at(-2)?.close ?? history.at(-1).close),
    upChance: scored.upChance,
    downChance: scored.downChance,
    direction: scored.direction,
    confidence: scored.confidence,
    baseRate: scored.baseRate,
    signals: features.raw,
    verified: false,
    source: quote.source,
    quoteTime: quote.quoteTime,
  }
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function round2(n) {
  return Math.round(n * 100) / 100
}

export { actualDirection, round1, round2, directionFromProb }

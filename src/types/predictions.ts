export interface PredictionSignals {
  rsi: number
  mom5: number
  mom20?: number
  relMom5?: number
  volRatio: number
  dayChangePct: number
  rangePos: number
  atrPct?: number
  moveVsAtr?: number
  niftyChangePct?: number
  emaSpread?: number
}

export interface StockPrediction {
  symbol: string
  name: string
  targetDate: string
  predictedAt: string
  sessionSlot?: string
  priceAtPrediction: number
  prevClose?: number
  upChance: number
  downChance: number
  direction: 'up' | 'down' | 'neutral'
  confidence: 'low' | 'medium' | 'high'
  baseRate?: number
  signals: PredictionSignals
  verified: boolean
  source: string
  quoteTime?: string
}

export interface PredictionHistory extends StockPrediction {
  verified: true
  closeBefore?: number
  closeAtTarget?: number
  actualChangePercent?: number
  actualDirection?: 'up' | 'down' | 'neutral'
  hit?: boolean
  verifiedAt?: string
}

export interface PredictionsMeta {
  lastUpdated: string | null
  lastUpdatedIST?: string | null
  sessionSlot?: string | null
  targetDate: string | null
  symbolCount: number
  verifiedCount: number
  hitCount: number
  missCount: number
  accuracyPct: number | null
  backtestAccuracyPct?: number | null
  backtestSampleCount?: number | null
  backtestDirectionalCount?: number | null
  backtestClearMarketPct?: number | null
  backtestCalibrationPct?: number | null
  modelTrained?: boolean
  nseSession?: string | null
  benchmarkPrice?: number | null
  methodology: string
  disclaimer: string
  schedule: string
  dataSource: string
}

export interface PredictionsStore {
  meta: PredictionsMeta
  predictions: StockPrediction[]
  history: PredictionHistory[]
}

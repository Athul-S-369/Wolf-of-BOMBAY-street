export interface OHLCV {
  time: number // unix timestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IndexData {
  id: string
  name: string
  value: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  prevClose: number
  volume: number
  advanceDecline: [number, number]
}

export interface SectorPerformance {
  sector: string
  change: number
  marketCap: number
  topGainer: string
  topLoser: string
}

export interface MarketAlert {
  id: string
  type: 'circuit_breaker' | 'block_deal' | 'bulk_deal' | 'insider' | 'news' | 'order_flow' | 'technical'
  severity: 'critical' | 'high' | 'medium' | 'low'
  symbol: string
  message: string
  timestamp: number
  price?: number
  quantity?: number
  value?: number
}

export const INDICES: IndexData[] = [
  {
    id: 'SENSEX', name: 'S&P BSE SENSEX', value: 81456.20, change: 342.80, changePercent: 0.42,
    open: 81113.40, high: 81612.50, low: 80988.30, prevClose: 81113.40,
    volume: 456789012, advanceDecline: [22, 8],
  },
  {
    id: 'NIFTY50', name: 'NIFTY 50', value: 24812.30, change: 98.60, changePercent: 0.40,
    open: 24713.70, high: 24884.50, low: 24668.40, prevClose: 24713.70,
    volume: 678901234, advanceDecline: [32, 18],
  },
  {
    id: 'NIFTYMIDCAP', name: 'NIFTY Midcap 100', value: 57234.80, change: 312.40, changePercent: 0.55,
    open: 56922.40, high: 57410.20, low: 56788.60, prevClose: 56922.40,
    volume: 234567890, advanceDecline: [62, 38],
  },
  {
    id: 'NIFTYSMALLCAP', name: 'NIFTY Smallcap 250', value: 18934.60, change: 142.20, changePercent: 0.76,
    open: 18792.40, high: 19012.80, low: 18721.30, prevClose: 18792.40,
    volume: 123456789, advanceDecline: [158, 92],
  },
  {
    id: 'NIFTYBANK', name: 'NIFTY Bank', value: 53248.40, change: 198.60, changePercent: 0.37,
    open: 53049.80, high: 53412.20, low: 52988.40, prevClose: 53049.80,
    volume: 345678901, advanceDecline: [8, 4],
  },
  {
    id: 'NIFTYIT', name: 'NIFTY IT', value: 39812.60, change: -124.80, changePercent: -0.31,
    open: 39937.40, high: 40012.80, low: 39688.40, prevClose: 39937.40,
    volume: 198765432, advanceDecline: [4, 6],
  },
]

export const SECTOR_PERFORMANCE: SectorPerformance[] = [
  { sector: 'Banking', change: 0.37, marketCap: 4250000, topGainer: 'HDFCBANK', topLoser: 'SBIN' },
  { sector: 'Technology', change: -0.31, marketCap: 2700000, topGainer: 'HCLTECH', topLoser: 'INFY' },
  { sector: 'Energy', change: 0.61, marketCap: 2100000, topGainer: 'TATAPOWER', topLoser: 'ONGC' },
  { sector: 'Automobile', change: 0.94, marketCap: 1800000, topGainer: 'MM', topLoser: 'BAJAJ-AUTO' },
  { sector: 'FMCG', change: 0.12, marketCap: 1400000, topGainer: 'ITC', topLoser: 'HINDUNILVR' },
  { sector: 'Healthcare', change: 0.85, marketCap: 900000, topGainer: 'SUNPHARMA', topLoser: 'DRREDDY' },
  { sector: 'Metals & Mining', change: 1.05, marketCap: 850000, topGainer: 'JSWSTEEL', topLoser: 'TATASTEEL' },
  { sector: 'Infrastructure', change: 0.80, marketCap: 1200000, topGainer: 'LT', topLoser: 'ADANIPORTS' },
  { sector: 'Utilities', change: 0.40, marketCap: 1100000, topGainer: 'TATAPOWER', topLoser: 'ADANIGREEN' },
  { sector: 'Telecom', change: 1.47, marketCap: 1100000, topGainer: 'BHARTIARTL', topLoser: 'JIOFIN' },
  { sector: 'Financial Services', change: 1.14, marketCap: 700000, topGainer: 'BAJFINANCE', topLoser: 'JIOFIN' },
  { sector: 'Conglomerate', change: 0.84, marketCap: 2000000, topGainer: 'ADANIENT', topLoser: 'RELIANCE' },
  { sector: 'Consumer Discretionary', change: 0.37, marketCap: 540000, topGainer: 'TITAN', topLoser: 'ASIANPAINT' },
  { sector: 'Insurance', change: 0.61, marketCap: 150000, topGainer: 'HDFCLIFE', topLoser: 'HDFCLIFE' },
]

export const INITIAL_ALERTS: MarketAlert[] = [
  { id: 'a1', type: 'block_deal', severity: 'high', symbol: 'RELIANCE', message: 'Block deal: 2.4M shares @ ₹2,548 (FII purchase)', timestamp: Date.now() - 120000, price: 2548, quantity: 2400000, value: 611520000 },
  { id: 'a2', type: 'order_flow', severity: 'critical', symbol: 'ADANIGREEN', message: 'Unusual option activity: Large PUT positions expiring this week', timestamp: Date.now() - 300000, price: 1604, quantity: 50000 },
  { id: 'a3', type: 'news', severity: 'high', symbol: 'TCS', message: 'TCS wins $2.5B multi-year cloud deal with European bank', timestamp: Date.now() - 480000 },
  { id: 'a4', type: 'bulk_deal', severity: 'medium', symbol: 'BAJFINANCE', message: 'Bulk deal: LIC purchases 1.8M shares @ ₹7,280', timestamp: Date.now() - 720000, price: 7280, quantity: 1800000, value: 13104000000 },
  { id: 'a5', type: 'insider', severity: 'high', symbol: 'SUNPHARMA', message: 'Promoter buys additional 0.5% stake via open market', timestamp: Date.now() - 960000, price: 1510, quantity: 1200000 },
  { id: 'a6', type: 'technical', severity: 'medium', symbol: 'HDFCBANK', message: 'Breakout above 200-DMA on 3x average volume', timestamp: Date.now() - 1200000, price: 1624 },
  { id: 'a7', type: 'order_flow', severity: 'high', symbol: 'BHARTIARTL', message: '5G spectrum auction: Airtel secures additional 100MHz band', timestamp: Date.now() - 1800000 },
  { id: 'a8', type: 'news', severity: 'critical', symbol: 'TATAMOTORS', message: 'JLR raises FY25 guidance; profitability above expectations', timestamp: Date.now() - 2400000 },
]

export function generateOHLCV(basePrice: number, days: number = 365): OHLCV[] {
  const data: OHLCV[] = []
  let price = basePrice * 0.72
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = days; i >= 0; i--) {
    const time = now - i * dayMs
    const volatility = 0.018
    const drift = 0.0004

    const change = (Math.random() - 0.48) * volatility + drift
    const open = price
    const close = price * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.008)
    const low = Math.min(open, close) * (1 - Math.random() * 0.008)
    const volume = Math.floor(1000000 + Math.random() * 5000000)

    data.push({ time, open, high, low, close, volume })
    price = close
  }
  return data
}

export function generateIntraday(basePrice: number): OHLCV[] {
  const data: OHLCV[] = []
  let price = basePrice * (1 - 0.008)
  const now = Date.now()
  const minuteMs = 60 * 1000

  for (let min = 0; min < 375; min++) {
    const time = now - (375 - min) * minuteMs
    const change = (Math.random() - 0.49) * 0.003
    const open = price
    const close = price * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.002)
    const low = Math.min(open, close) * (1 - Math.random() * 0.002)
    const volume = Math.floor(50000 + Math.random() * 200000)

    data.push({ time, open, high, low, close, volume })
    price = close
  }
  return data
}

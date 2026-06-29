import { create } from 'zustand'
import type { Company } from '../data/companies'
import { COMPANIES } from '../data/companies'
import type { IndexData, MarketAlert } from '../data/marketData'
import { INDICES, INITIAL_ALERTS } from '../data/marketData'
import { marketDataService } from '../services/marketDataService'
import type { QuotesMap, ConnectionStatus } from '../services/marketDataService'

interface PriceUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  direction: 'up' | 'down' | 'flat'
}

interface MarketStore {
  companies: Company[]
  indices: IndexData[]
  alerts: MarketAlert[]
  selectedCompany: Company | null
  priceUpdates: Record<string, PriceUpdate>
  sessionOpenPrices: Record<string, number>
  isMarketOpen: boolean
  marketStatus: 'pre-open' | 'open' | 'closed' | 'post-close' | 'unknown'
  lastUpdateTime: number
  viewMode: 'dashboard' | 'network' | 'company' | 'impact' | 'orders' | 'heatmap'
  impactSourceId: string | null

  // Real-time data state
  dataSource: 'live' | 'simulated' | 'connecting'
  connectionStatus: ConnectionStatus
  liveQuoteCount: number    // how many symbols have live prices

  setSelectedCompany: (company: Company | null) => void
  setViewMode: (mode: MarketStore['viewMode']) => void
  setImpactSource: (id: string | null) => void
  tick: () => void
  applyLiveQuotes: (quotes: QuotesMap, mktStatus: string) => void
  addAlert: (alert: MarketAlert) => void
  clearAlerts: () => void
}

// ── Market Hours (IST fallback) ─────────────────────────────────────────────
function getLocalMarketStatus(): MarketStore['marketStatus'] {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const day = now.getDay()
  if (day === 0 || day === 6) return 'closed'
  const mins = now.getHours() * 60 + now.getMinutes()
  if (mins >= 9 * 60 && mins < 9 * 60 + 15) return 'pre-open'
  if (mins >= 9 * 60 + 15 && mins < 15 * 60 + 30) return 'open'
  if (mins >= 15 * 60 + 30 && mins < 16 * 60) return 'post-close'
  return 'closed'
}

// Map Yahoo Finance marketState → our format
function mapMarketStatus(yf: string): MarketStore['marketStatus'] {
  switch (yf) {
    case 'REGULAR':   return 'open'
    case 'PRE':       return 'pre-open'
    case 'POST':
    case 'POSTPOST':  return 'post-close'
    case 'CLOSED':    return 'closed'
    default:          return getLocalMarketStatus()
  }
}

// ── Ornstein-Uhlenbeck simulation (fallback when backend is unreachable) ────
// κ = 0.00015: pull towards session open each tick (~0.015% reversion)
// Tick σ = daily_vol / sqrt(375) at 1-tick/second equivalent intervals
function ouProcess(price: number, sessionOpen: number, tickSigma: number): number {
  const kappa = 0.00015
  const meanReversion = kappa * (sessionOpen - price)
  const noise = tickSigma * (Math.random() * 2 - 1) * price
  const newPrice = price + meanReversion + noise
  const maxMove = sessionOpen * 0.08   // ±8% intraday cap (mirrors BSE circuit filter)
  return Math.max(sessionOpen - maxMove, Math.min(sessionOpen + maxMove, newPrice))
}

const SECTOR_DAILY_VOL: Record<string, number> = {
  'Banking': 0.016, 'Technology': 0.018, 'Energy': 0.020,
  'Automobile': 0.022, 'FMCG': 0.012, 'Healthcare': 0.018,
  'Metals & Mining': 0.025, 'Infrastructure': 0.020, 'Utilities': 0.014,
  'Telecom': 0.016, 'Financial Services': 0.020, 'Conglomerate': 0.018,
  'Consumer Discretionary': 0.018, 'Insurance': 0.015, 'Media': 0.022,
  'Retail': 0.020, 'Chemicals': 0.018, 'Construction': 0.018,
}

function tickSigmaFor(sector: string): number {
  return (SECTOR_DAILY_VOL[sector] ?? 0.018) / Math.sqrt(375)
}

function simulateVolume(currentVol: number, avgVol: number): number {
  const reversion = 0.001 * (avgVol - currentVol)
  const noise = (Math.random() - 0.5) * 0.02 * currentVol
  return Math.max(avgVol * 0.2, Math.round(currentVol + reversion + noise))
}

// ── Index simulation for NIFTY/SENSEX when market is open ──────────────────
function simulateIndex(idx: IndexData): IndexData {
  const sigma = 0.0006 / Math.sqrt(375)
  const reversion = 0.0001 * (idx.prevClose - idx.value)
  const noise = sigma * (Math.random() * 2 - 1) * idx.value
  const newValue = Math.max(idx.prevClose * 0.92, Math.min(idx.prevClose * 1.08, idx.value + reversion + noise))
  const newChange = newValue - idx.prevClose
  return {
    ...idx,
    value: Math.round(newValue * 100) / 100,
    change: Math.round(newChange * 100) / 100,
    changePercent: Math.round((newChange / idx.prevClose) * 10000) / 100,
  }
}

// ── Alert generator ─────────────────────────────────────────────────────────
function checkForAlerts(companies: Company[], sessionOpens: Record<string, number>): MarketAlert[] {
  const alerts: MarketAlert[] = []
  companies.forEach(c => {
    if (!c.listed) return
    const openPrice = sessionOpens[c.id] ?? c.price
    const dayChangePct = openPrice > 0 ? ((c.price - openPrice) / openPrice) * 100 : 0

    if (Math.abs(dayChangePct) > 4.8 && Math.random() > 0.85) {
      alerts.push({
        id: `cb-${Date.now()}-${c.id}`,
        type: 'circuit_breaker',
        severity: Math.abs(dayChangePct) > 9.5 ? 'critical' : 'high',
        symbol: c.symbol,
        message: `${c.symbol} at circuit limit: ${dayChangePct > 0 ? '+' : ''}${dayChangePct.toFixed(2)}% (BSE/NSE filter)`,
        timestamp: Date.now(),
        price: c.price,
      })
    }
    const avgVol = sessionOpens[`vol_${c.id}`] as unknown as number ?? c.volume
    if (c.volume > avgVol * 3 && Math.random() > 0.9) {
      alerts.push({
        id: `vol-${Date.now()}-${c.id}`,
        type: 'order_flow',
        severity: 'high',
        symbol: c.symbol,
        message: `${c.symbol} volume spike: ${(c.volume / 100000).toFixed(1)}L shares (${((c.volume / avgVol - 1) * 100).toFixed(0)}% above avg)`,
        timestamp: Date.now(),
        price: c.price,
        quantity: c.volume,
      })
    }
  })
  return alerts
}

// ── Initial seed ────────────────────────────────────────────────────────────
const initialSessionOpens: Record<string, number> = {}
COMPANIES.forEach(c => {
  initialSessionOpens[c.id] = c.price
  initialSessionOpens[`vol_${c.id}`] = c.volume as unknown as number
})

// ── Store ────────────────────────────────────────────────────────────────────
export const useMarketStore = create<MarketStore>((set, get) => ({
  companies: COMPANIES.map(c => ({ ...c })),
  indices: INDICES.map(i => ({ ...i })),
  alerts: [...INITIAL_ALERTS],
  selectedCompany: null,
  priceUpdates: {},
  sessionOpenPrices: initialSessionOpens,
  isMarketOpen: true,
  marketStatus: getLocalMarketStatus(),
  lastUpdateTime: Date.now(),
  viewMode: 'dashboard',
  impactSourceId: null,

  dataSource: 'connecting',
  connectionStatus: 'connecting',
  liveQuoteCount: 0,

  setSelectedCompany: (company) => set({ selectedCompany: company, viewMode: company ? 'company' : 'dashboard' }),
  setViewMode: (viewMode) => set({ viewMode }),
  setImpactSource: (id) => set({ impactSourceId: id, viewMode: 'impact' }),

  // Called by the MarketDataService whenever new real-time quotes arrive
  applyLiveQuotes: (quotes: QuotesMap, mktStatus: string) => {
    const state = get()
    const prevCompanies = state.companies

    let liveCount = 0
    const priceUpdates: Record<string, PriceUpdate> = {}

    const updatedCompanies = prevCompanies.map(c => {
      if (!c.listed) return c   // unlisted companies are not in Yahoo Finance

      // Match by symbol or id
      const q = quotes[c.symbol] || quotes[c.id]
      if (!q || q.price <= 0) return c  // no data for this symbol yet

      liveCount++

      const prevPrice = c.price
      const newPrice  = q.price
      const newChange = q.change
      const newChangePct = q.changePercent

      priceUpdates[c.id] = {
        symbol: c.symbol,
        price: newPrice,
        change: newChange,
        changePercent: newChangePct,
        volume: q.volume,
        direction: newPrice > prevPrice ? 'up' : newPrice < prevPrice ? 'down' : 'flat',
      }

      return {
        ...c,
        price: newPrice,
        change: newChange,
        changePercent: newChangePct,
        volume: q.volume,
        // Enrich fundamentals from live data if available (Yahoo provides trailing PE, PB etc.)
        pe: q.pe != null ? q.pe : c.pe,
        pb: q.pb != null ? q.pb : c.pb,
        eps: q.eps != null ? q.eps : c.eps,
        dividendYield: q.dividendYield != null ? q.dividendYield : c.dividendYield,
        weekHigh52: q.weekHigh52 != null ? q.weekHigh52 : c.weekHigh52,
        weekLow52: q.weekLow52 != null ? q.weekLow52 : c.weekLow52,
        marketCap: q.marketCap != null ? Math.round(q.marketCap / 1e7) : c.marketCap, // convert from ₹ to crores
      }
    })

    const resolvedMarketStatus = mapMarketStatus(mktStatus)

    // Generate alerts
    const autoAlerts = Math.random() > 0.97
      ? checkForAlerts(updatedCompanies, state.sessionOpenPrices)
      : []
    const newAlerts = autoAlerts.length > 0
      ? [...autoAlerts, ...state.alerts].slice(0, 50)
      : state.alerts

    set({
      companies: updatedCompanies,
      priceUpdates,
      marketStatus: resolvedMarketStatus,
      isMarketOpen: resolvedMarketStatus === 'open',
      lastUpdateTime: Date.now(),
      liveQuoteCount: liveCount,
      dataSource: liveCount > 0 ? 'live' : 'simulated',
      alerts: newAlerts,
    })
  },

  // OU simulation tick (only runs when backend is unreachable OR market is open for index animation)
  tick: () => {
    const state = get()
    const dataSource = state.dataSource

    // If we have live data, only simulate indices (not individual stocks)
    const marketStatus = getLocalMarketStatus()
    if (marketStatus === 'closed') {
      set({ marketStatus, isMarketOpen: false, lastUpdateTime: Date.now() })
      return
    }

    // Always animate indices
    const updatedIndices = state.indices.map(simulateIndex)

    // Only simulate stock prices if backend is down
    if (dataSource === 'live' || dataSource === 'connecting') {
      set({ indices: updatedIndices, marketStatus, isMarketOpen: marketStatus === 'open', lastUpdateTime: Date.now() })
      return
    }

    // ── Full OU simulation fallback ──────────────────────────────────────
    const prevCompanies = state.companies.map(c => ({ ...c }))

    const updatedCompanies = state.companies.map(c => {
      if (!c.listed || c.price === 0) return c   // skip unlisted
      const sessionOpen = state.sessionOpenPrices[c.id] ?? c.price
      const sigma = tickSigmaFor(c.sector)
      const newPrice = ouProcess(c.price, sessionOpen, sigma)
      const newChange = newPrice - sessionOpen
      const newChangePercent = sessionOpen > 0 ? (newChange / sessionOpen) * 100 : 0
      const avgVol = state.sessionOpenPrices[`vol_${c.id}`] as unknown as number ?? c.volume
      const newVolume = simulateVolume(c.volume, avgVol)

      return {
        ...c,
        price: Math.round(newPrice * 100) / 100,
        change: Math.round(newChange * 100) / 100,
        changePercent: Math.round(newChangePercent * 100) / 100,
        volume: newVolume,
      }
    })

    const priceUpdates: Record<string, PriceUpdate> = {}
    updatedCompanies.forEach((c, i) => {
      const prev = prevCompanies[i]
      priceUpdates[c.id] = {
        symbol: c.symbol,
        price: c.price,
        change: c.change,
        changePercent: c.changePercent,
        volume: c.volume,
        direction: c.price > prev.price ? 'up' : c.price < prev.price ? 'down' : 'flat',
      }
    })

    const autoAlerts = Math.random() > 0.97
      ? checkForAlerts(updatedCompanies, state.sessionOpenPrices)
      : []
    const newAlerts = autoAlerts.length > 0
      ? [...autoAlerts, ...state.alerts].slice(0, 50)
      : state.alerts

    set({
      companies: updatedCompanies,
      indices: updatedIndices,
      priceUpdates,
      marketStatus,
      isMarketOpen: marketStatus === 'open',
      lastUpdateTime: Date.now(),
      dataSource: 'simulated',
      alerts: newAlerts,
    })
  },

  addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts].slice(0, 50) })),
  clearAlerts: () => set({ alerts: [] }),
}))

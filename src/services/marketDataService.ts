// ─────────────────────────────────────────────────────────────────────────────
// Market Data Service
// Connects to the Node.js backend via WebSocket for real-time NSE prices.
// Falls back to polling /api/quotes if WebSocket is unavailable.
// Falls back to OU simulation if backend is unreachable entirely.
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  open: number
  high: number
  low: number
  prevClose: number
  marketState: string  // 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
  marketCap: number | null
  pe: number | null
  pb: number | null
  weekHigh52: number | null
  weekLow52: number | null
  eps: number | null
  dividendYield: number | null
  name: string
  ts: number           // backend fetch timestamp
  source: 'yahoo_finance'
}

export type QuotesMap = Record<string, LiveQuote>

export type ConnectionStatus = 'connecting' | 'live' | 'polling' | 'simulated' | 'error'

type QuotesCallback = (quotes: QuotesMap, marketStatus: string) => void
type StatusCallback = (status: ConnectionStatus) => void

const BACKEND_WS  = 'ws://localhost:3001'
const BACKEND_API = '/api'   // proxied via Vite to localhost:3001

class MarketDataService {
  private ws: WebSocket | null = null
  private wsConnected = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null

  private quotesCallbacks: QuotesCallback[] = []
  private statusCallbacks: StatusCallback[] = []

  private latestQuotes: QuotesMap = {}
  private latestMarketStatus = 'unknown'
  private connectionStatus: ConnectionStatus = 'connecting'

  // ── Public API ──────────────────────────────────────────────────────────

  /** Start attempting to connect to the backend. Call once at app startup. */
  connect() {
    this.updateStatus('connecting')
    this.tryWebSocket()
  }

  /** Get a snapshot of the latest quotes synchronously. */
  getLatestQuotes(): QuotesMap {
    return this.latestQuotes
  }

  /** Get current connection status synchronously. */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /** Subscribe to live quote updates. Returns an unsubscribe function. */
  onQuotes(cb: QuotesCallback): () => void {
    this.quotesCallbacks.push(cb)
    // Immediately emit latest data if we have any
    if (Object.keys(this.latestQuotes).length > 0) {
      cb(this.latestQuotes, this.latestMarketStatus)
    }
    return () => {
      this.quotesCallbacks = this.quotesCallbacks.filter(c => c !== cb)
    }
  }

  /** Subscribe to connection status changes. Returns an unsubscribe function. */
  onStatus(cb: StatusCallback): () => void {
    this.statusCallbacks.push(cb)
    cb(this.connectionStatus) // emit immediately
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(c => c !== cb)
    }
  }

  /** Cleanly disconnect. */
  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.ws?.close()
    this.ws = null
  }

  // ── WebSocket ────────────────────────────────────────────────────────────

  private tryWebSocket() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)

    try {
      this.ws = new WebSocket(BACKEND_WS)
    } catch {
      this.handleWsFail()
      return
    }

    this.ws.onopen = () => {
      console.log('[MarketData] WebSocket connected to backend')
      this.wsConnected = true
      this.stopPolling()
      this.updateStatus('live')
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string)
        if (msg.type === 'init' || msg.type === 'update') {
          this.handleIncomingData(msg.quotes, msg.marketStatus)
        }
      } catch {
        // Malformed frame — ignore
      }
    }

    this.ws.onclose = () => {
      console.warn('[MarketData] WebSocket closed — switching to REST polling')
      this.wsConnected = false
      this.ws = null
      this.startPolling()
      // Try to reconnect after 10 seconds
      this.reconnectTimer = setTimeout(() => this.tryWebSocket(), 10000)
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private handleWsFail() {
    console.warn('[MarketData] WebSocket unavailable — starting REST polling')
    this.startPolling()
    // Retry WebSocket after 15s
    this.reconnectTimer = setTimeout(() => this.tryWebSocket(), 15000)
  }

  // ── REST Polling ─────────────────────────────────────────────────────────

  private startPolling() {
    if (this.pollTimer) return  // already polling
    this.updateStatus('polling')
    this.fetchQuotesREST()      // immediate fetch
    this.pollTimer = setInterval(() => this.fetchQuotesREST(), 5000)
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  private async fetchQuotesREST() {
    try {
      const resp = await fetch(`${BACKEND_API}/quotes`, { signal: AbortSignal.timeout(8000) })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      this.handleIncomingData(data.quotes, data.marketStatus)
      if (!this.wsConnected) this.updateStatus('polling')
    } catch (err) {
      console.error('[MarketData] REST fetch failed:', err)
      this.updateStatus('error')
    }
  }

  // ── Data Processing ──────────────────────────────────────────────────────

  private handleIncomingData(quotes: QuotesMap, marketStatus: string) {
    if (!quotes || Object.keys(quotes).length === 0) return

    this.latestQuotes = quotes
    this.latestMarketStatus = marketStatus

    this.quotesCallbacks.forEach(cb => {
      try { cb(quotes, marketStatus) } catch { /* ignore callback errors */ }
    })
  }

  private updateStatus(status: ConnectionStatus) {
    if (this.connectionStatus === status) return
    this.connectionStatus = status
    this.statusCallbacks.forEach(cb => {
      try { cb(status) } catch { /* ignore */ }
    })
  }

  // ── Health Check ─────────────────────────────────────────────────────────

  async checkBackendHealth(): Promise<boolean> {
    try {
      const resp = await fetch(`${BACKEND_API}/health`, { signal: AbortSignal.timeout(3000) })
      return resp.ok
    } catch {
      return false
    }
  }
}

// Singleton export
export const marketDataService = new MarketDataService()

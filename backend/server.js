'use strict'

const express = require('express')
const cors = require('cors')
const http = require('http')
const { WebSocketServer } = require('ws')
const YahooFinance = require('yahoo-finance2').default
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const app = express()
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
}))
app.use(express.json())

// ─────────────────────────────────────────────────────────────────────────────
// ALL NSE SYMBOLS TO TRACK (Yahoo Finance appends .NS)
// ─────────────────────────────────────────────────────────────────────────────
const NSE_SYMBOLS = [
  // Reliance Ecosystem
  'RELIANCE', 'JIOFIN', 'NETWORK18', 'HATHWAY', 'DEN', 'GTPL', 'RIIL',
  // Tata Group
  'TCS', 'TATAMOTORS', 'TATASTEEL', 'TITAN', 'TATACONSUMER', 'TATAPOWER',
  'TATACOMM', 'TATAELXSI', 'TATACHEM', 'INDHOTEL', 'VOLTAS', 'TATATECH',
  'TRENT', 'TATAINVEST',
  // Adani Group
  'ADANIENT', 'ADANIPORTS', 'ADANIGREEN', 'ATGL', 'ADANIPOWER', 'AWL', 'NDTV',
  // HDFC / Banking
  'HDFCBANK', 'HDFCLIFE', 'HDFCAMC', 'ICICIBANK', 'SBIN', 'AXISBANK',
  'KOTAKBANK', 'INDUSINDBK', 'BANDHANBNK',
  // Bajaj Group
  'BAJFINANCE', 'BAJAJFINSV', 'BAJAJ-AUTO', 'BAJAJHLDNG',
  // IT
  'INFY', 'WIPRO', 'HCLTECH', 'TECHM',
  // Auto
  'MARUTI', 'M&M',
  // Pharma
  'SUNPHARMA', 'DRREDDY',
  // PSU
  'ONGC', 'NTPC', 'POWERGRID', 'COALINDIA',
  // Metals / Infra
  'JSWSTEEL', 'LT',
  // Telecom
  'BHARTIARTL', 'IDEA',
  // FMCG / Consumer
  'ITC', 'HINDUNILVR', 'NESTLEIND', 'BRITANNIA',
  // Paints / Chemicals
  'ASIANPAINT', 'PIDILITIND',
  // Aditya Birla Group
  'ULTRACEMCO', 'GRASIM', 'HINDALCO', 'ABCAPITAL',
  // New Economy
  'JUSTDIAL', 'NYKAA', 'ZOMATO', 'PAYTM', 'DMART',
]

// NSE symbol → Yahoo Finance symbol
const YAHOO_OVERRIDE = {
  'M&M': 'M%26M.NS',
}

function toYahoo(sym) {
  return YAHOO_OVERRIDE[sym] || `${sym}.NS`
}

function fromYahoo(ySymbol) {
  for (const [nse, yfSym] of Object.entries(YAHOO_OVERRIDE)) {
    if (ySymbol === yfSym || ySymbol.replace('%26', '&').replace('.NS', '') === nse) return nse
  }
  return ySymbol.replace('.NS', '')
}

function round2(n) { return n != null ? Math.round(n * 100) / 100 : null }
function round1(n) { return n != null ? Math.round(n * 10) / 10 : null }

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE CACHE
// ─────────────────────────────────────────────────────────────────────────────
let quotes = {}
let marketStatus = 'unknown'
let lastFetch = 0
let fetchError = null
let isFirstFetch = true

const QUOTE_FIELDS = [
  'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
  'regularMarketVolume', 'regularMarketOpen', 'regularMarketDayHigh',
  'regularMarketDayLow', 'regularMarketPreviousClose', 'marketState',
  'marketCap', 'trailingPE', 'priceToBook', 'fiftyTwoWeekHigh',
  'fiftyTwoWeekLow', 'shortName', 'epsTrailingTwelveMonths', 'dividendYield',
]

async function fetchBatch(nseSyms) {
  const yahooSyms = nseSyms.map(toYahoo)

  // yahoo-finance2 v3+: pass array of symbols
  const results = await yf.quote(yahooSyms, { fields: QUOTE_FIELDS })
  const arr = Array.isArray(results) ? results : [results]

  let count = 0
  for (const q of arr) {
    if (!q || !q.symbol) continue
    const sym = fromYahoo(q.symbol)

    quotes[sym] = {
      symbol: sym,
      price:         round2(q.regularMarketPrice) ?? 0,
      change:        round2(q.regularMarketChange) ?? 0,
      changePercent: round2(q.regularMarketChangePercent) ?? 0,
      volume:        q.regularMarketVolume ?? 0,
      open:          round2(q.regularMarketOpen) ?? 0,
      high:          round2(q.regularMarketDayHigh) ?? 0,
      low:           round2(q.regularMarketDayLow) ?? 0,
      prevClose:     round2(q.regularMarketPreviousClose) ?? 0,
      marketState:   q.marketState || 'CLOSED',
      marketCap:     q.marketCap ?? null,
      pe:            round1(q.trailingPE),
      pb:            round2(q.priceToBook),
      weekHigh52:    round2(q.fiftyTwoWeekHigh),
      weekLow52:     round2(q.fiftyTwoWeekLow),
      eps:           round2(q.epsTrailingTwelveMonths),
      // yahoo-finance2 returns dividendYield as a decimal (0.0046 = 0.46%); cap >30 to avoid double-multiply
      dividendYield: q.dividendYield != null
        ? (q.dividendYield > 0.5 ? round2(q.dividendYield) : round2(q.dividendYield * 100))
        : null,
      name:          q.shortName || sym,
      ts:            Date.now(),
      source:        'yahoo_finance',
    }

    const ms = q.marketState
    if      (ms === 'REGULAR')                        marketStatus = 'open'
    else if (ms === 'PRE')                            marketStatus = 'pre-open'
    else if (ms === 'POST' || ms === 'POSTPOST')      marketStatus = 'post-close'
    else if (ms === 'CLOSED')                         marketStatus = 'closed'

    count++
  }

  return count
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function refreshAllQuotes() {
  const chunks = []
  for (let i = 0; i < NSE_SYMBOLS.length; i += 20) chunks.push(NSE_SYMBOLS.slice(i, i + 20))

  let total = 0
  for (const chunk of chunks) {
    try {
      total += await fetchBatch(chunk)
    } catch (err) {
      fetchError = err.message
      console.error('[YF] Chunk error:', err.message)
    }
    await delay(350)   // polite gap between chunks
  }

  if (total > 0) {
    lastFetch = Date.now()
    fetchError = null
    const tag = isFirstFetch ? 'Initial fetch' : 'Refresh'
    console.log(`[YF] ${tag}: ${total}/${NSE_SYMBOLS.length} symbols | market=${marketStatus} | ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`)
    if (isFirstFetch) isFirstFetch = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP & POLLING  (exponential back-off + circuit breaker)
// ─────────────────────────────────────────────────────────────────────────────
let consecutiveFailures = 0
const MAX_FAILURES_BEFORE_BACKOFF = 2
const BASE_BACKOFF_MS   =  2 * 60 * 1000   //  2 min — after first failure
const MAX_BACKOFF_MS    = 15 * 60 * 1000   // 15 min — ceiling

;(async () => {
  console.log('[Bharata] Starting up…')
  await refreshAllQuotes()

  async function poll() {
    const prevCount = Object.keys(quotes).length
    await refreshAllQuotes()
    const newCount = Object.keys(quotes).length

    // Detect fetch failure: count didn't grow and we got errors
    const failed = fetchError !== null

    if (failed) {
      consecutiveFailures++
    } else {
      consecutiveFailures = 0
    }

    // Compute next interval
    const isOpen = marketStatus === 'open' || marketStatus === 'pre-open'
    let nextMs

    if (isOpen) {
      // During market hours: 5s on success, brief back-off on failure
      nextMs = failed ? Math.min(30000 * consecutiveFailures, 5 * 60 * 1000) : 5000
    } else {
      // After market close: no need to poll aggressively
      // Success: 10 min.  Failure: exponential back-off up to 15 min.
      if (failed && consecutiveFailures >= MAX_FAILURES_BEFORE_BACKOFF) {
        nextMs = Math.min(BASE_BACKOFF_MS * Math.pow(2, consecutiveFailures - MAX_FAILURES_BEFORE_BACKOFF), MAX_BACKOFF_MS)
      } else {
        nextMs = 10 * 60 * 1000  // 10 minutes when closed and healthy
      }
    }

    const nextSec = Math.round(nextMs / 1000)
    console.log(`[Poll] Next refresh in ${nextSec}s | failures=${consecutiveFailures} | symbols=${Object.keys(quotes).length}`)
    setTimeout(poll, nextMs)
  }

  // First poll after 10 minutes if market is closed, 5s if open
  const firstDelay = (marketStatus === 'open' || marketStatus === 'pre-open') ? 5000 : 10 * 60 * 1000
  setTimeout(poll, firstDelay)
})()

// ─────────────────────────────────────────────────────────────────────────────
// WEBSOCKET
// ─────────────────────────────────────────────────────────────────────────────
const server = http.createServer(app)
const wss = new WebSocketServer({ server })
const CLIENTS = new Set()

wss.on('connection', (ws) => {
  CLIENTS.add(ws)
  console.log(`[WS] +1 client (total: ${CLIENTS.size})`)
  ws.send(JSON.stringify({ type: 'init', quotes, marketStatus, lastFetch }))

  const pingTimer = setInterval(() => { if (ws.readyState === 1) ws.ping() }, 30000)
  ws.on('close', () => { CLIENTS.delete(ws); clearInterval(pingTimer) })
  ws.on('error', () => { CLIENTS.delete(ws); clearInterval(pingTimer) })
})

// Broadcast to all WebSocket clients every 4 seconds
setInterval(() => {
  if (!CLIENTS.size || !lastFetch) return
  const msg = JSON.stringify({ type: 'update', quotes, marketStatus, lastFetch })
  for (const ws of CLIENTS) { if (ws.readyState === 1) ws.send(msg) }
}, 4000)

// ─────────────────────────────────────────────────────────────────────────────
// HTTP ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    symbolsTracked: Object.keys(quotes).length,
    symbolsRequested: NSE_SYMBOLS.length,
    marketStatus,
    lastFetch: lastFetch ? new Date(lastFetch).toISOString() : null,
    fetchError,
    uptime: Math.floor(process.uptime()),
  })
})

app.get('/api/quotes', (req, res) => res.json({ quotes, marketStatus, lastFetch }))

app.get('/api/quote/:symbol', (req, res) => {
  const q = quotes[req.params.symbol.toUpperCase()]
  if (!q) return res.status(404).json({ error: `${req.params.symbol} not found` })
  res.json(q)
})

app.post('/api/quotes/batch', (req, res) => {
  const { symbols } = req.body
  if (!Array.isArray(symbols)) return res.status(400).json({ error: 'symbols[] required' })
  const result = {}
  symbols.forEach(s => { const q = quotes[s.toUpperCase()]; if (q) result[s.toUpperCase()] = q })
  res.json({ quotes: result, marketStatus, lastFetch })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Bharata Market Intelligence — Backend                    ║
║  yahoo-finance2  |  NSE real-time data  |  WebSocket      ║
║  API:  http://localhost:${PORT}/api/health                   ║
║  WS:   ws://localhost:${PORT}                                ║
╚═══════════════════════════════════════════════════════════╝
  `)
})

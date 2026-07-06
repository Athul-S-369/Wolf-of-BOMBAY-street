import { useEffect, useRef, useState } from 'react'
import { useMarketStore } from './store/marketStore'
import { marketDataService } from './services/marketDataService'
import type { ConnectionStatus } from './services/marketDataService'
import Header from './components/Layout/Header'
import Dashboard from './components/Dashboard/Dashboard'
import CompanyNetwork from './components/Network/CompanyNetwork'
import CompanyProfile from './components/Company/CompanyProfile'
import ImpactAnalyzer from './components/Impact/ImpactAnalyzer'
import OrdersPanel from './components/Orders/OrdersPanel'
import PredictionsPanel from './components/Predictions/PredictionsPanel'
import SectorHeatmap from './components/Dashboard/SectorHeatmap'
import StockTable from './components/Dashboard/StockTable'

// ── Status indicator dot ────────────────────────────────────────────────────
function DataSourceBadge({ status, liveCount }: { status: ConnectionStatus; liveCount: number }) {
  const configs: Record<ConnectionStatus, { color: string; label: string; pulse?: boolean }> = {
    live:       { color: '#00d4aa', label: `LIVE ${liveCount} SYMBOLS`, pulse: true },
    polling:    { color: '#fbbf24', label: `POLLING ${liveCount} SYMBOLS`, pulse: true },
    connecting: { color: '#60a5fa', label: 'CONNECTING…', pulse: true },
    simulated:  { color: '#f97316', label: 'SIMULATED (backend offline)' },
    error:      { color: '#ef4444', label: 'DATA ERROR — CHECK BACKEND' },
  }
  const cfg = configs[status] ?? configs.connecting
  return (
    <span
      className="flex items-center gap-1 font-mono"
      style={{ fontSize: 9, color: cfg.color }}
    >
      <span style={cfg.pulse ? { animation: 'pulse 2s infinite' } : {}}>●</span>
      {cfg.label}
    </span>
  )
}

// ── Bottom status bar ───────────────────────────────────────────────────────
function StatusBar() {
  const { companies, lastUpdateTime, indices, marketStatus, liveQuoteCount, connectionStatus } = useMarketStore()
  const sensex = indices.find(i => i.id === 'SENSEX')
  const nifty = indices.find(i => i.id === 'NIFTY50')
  const listedOnly = companies.filter(c => c.listed)
  const gainers = listedOnly.filter(c => c.changePercent > 0).length
  const losers  = listedOnly.filter(c => c.changePercent < 0).length

  const statusColor = marketStatus === 'open' ? '#00d4aa'
    : marketStatus === 'pre-open' ? '#fbbf24'
    : '#8892b0'

  return (
    <div
      className="flex items-center justify-between px-4 py-1 border-t border-opacity-15 text-[9px] font-mono text-neutral"
      style={{ background: '#030508', borderColor: '#d4af3720' }}
    >
      <div className="flex items-center gap-4">
        <span style={{ color: statusColor }}>
          ● {marketStatus.toUpperCase().replace('-', ' ')}
        </span>
        <span>
          SENSEX:{' '}
          <span className={sensex && sensex.change >= 0 ? 'text-gain' : 'text-loss'}>
            {sensex ? sensex.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'}
          </span>
        </span>
        <span>
          NIFTY:{' '}
          <span className={nifty && nifty.change >= 0 ? 'text-gain' : 'text-loss'}>
            {nifty ? nifty.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'}
          </span>
        </span>
        <span className="text-gain">{gainers}▲</span>
        <span className="text-loss">{losers}▼</span>
        <span>
          IST{' '}
          {new Date(lastUpdateTime).toLocaleTimeString('en-IN', {
            hour12: false,
            timeZone: 'Asia/Kolkata',
          })}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <DataSourceBadge status={connectionStatus} liveCount={liveQuoteCount} />
        {connectionStatus === 'live' || connectionStatus === 'polling' ? (
          <span style={{ color: '#00d4aa', fontSize: 9 }}>
            ✓ Yahoo Finance NSE real-time data
          </span>
        ) : (
          <span style={{ color: '#f97316', fontSize: 9 }}>
            ⚠ Simulated prices (start backend: cd backend; npm start)
          </span>
        )}
        <span style={{ color: '#d4af37' }}>BHARATA MARKET INTELLIGENCE</span>
      </div>
    </div>
  )
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { tick, viewMode, selectedCompany, companies, applyLiveQuotes } = useMarketStore()
  const setConnectionStatus = useMarketStore(s => s.connectionStatus)
  const intervalRef = useRef<number | null>(null)
  const [_connStatus, setConnStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    // Subscribe to real-time quotes from the backend
    const unsubQuotes = marketDataService.onQuotes((quotes, mktStatus) => {
      applyLiveQuotes(quotes, mktStatus)
    })

    const unsubStatus = marketDataService.onStatus((status) => {
      setConnStatus(status)
      useMarketStore.setState({ connectionStatus: status })
    })

    // Start the market data service (connects via WebSocket, falls back to REST)
    marketDataService.connect()

    // OU simulation tick — runs continuously for index animation;
    // also drives stock price simulation when backend is offline
    intervalRef.current = window.setInterval(tick, 1500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      unsubQuotes()
      unsubStatus()
      marketDataService.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#05080f' }}>
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div
          className={`flex-1 overflow-hidden ${selectedCompany ? 'mr-80' : ''}`}
          style={{ transition: 'margin 0.2s' }}
        >
          {viewMode === 'dashboard' && <Dashboard />}
          {viewMode === 'heatmap' && (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <SectorHeatmap />
              <StockTable companies={companies.filter(c => c.listed)} title="ALL LISTED STOCKS" />
            </div>
          )}
          {viewMode === 'network' && (
            <div className="h-full flex flex-col">
              <CompanyNetwork />
            </div>
          )}
          {viewMode === 'impact' && (
            <div className="h-full overflow-hidden">
              <ImpactAnalyzer />
            </div>
          )}
          {viewMode === 'orders' && (
            <div className="h-full overflow-hidden">
              <OrdersPanel />
            </div>
          )}
          {viewMode === 'predictions' && (
            <div className="h-full overflow-hidden">
              <PredictionsPanel />
            </div>
          )}
        </div>

        {/* Company sidebar */}
        {selectedCompany && (
          <div
            className="w-80 border-l overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #0a0f1e 0%, #050810 100%)',
              borderColor: '#d4af3720',
              minWidth: 320,
              maxWidth: 320,
            }}
          >
            <CompanyProfile />
          </div>
        )}
      </div>

      <StatusBar />
    </div>
  )
}

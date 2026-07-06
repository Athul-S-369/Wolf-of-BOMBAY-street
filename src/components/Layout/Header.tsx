import { useEffect, useState } from 'react'
import { Activity, Bell, Search, Target, TrendingUp, Zap } from 'lucide-react'
import { useMarketStore } from '../../store/marketStore'
import { formatIndian, formatPercent } from '../../utils/format'

export default function Header() {
  const { indices, companies, alerts, viewMode, setViewMode, marketStatus } = useMarketStore()
  const [tickerPos, setTickerPos] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof companies>([])
  const [showSearch, setShowSearch] = useState(false)
  const { setSelectedCompany } = useMarketStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPos(p => p - 1)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const q = searchQuery.toLowerCase()
      setSearchResults(
        companies.filter(c =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q)
        ).slice(0, 8)
      )
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [searchQuery, companies])

  const sensex = indices.find(i => i.id === 'SENSEX')
  const nifty = indices.find(i => i.id === 'NIFTY50')
  const unreadAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: Activity },
    { id: 'heatmap', label: 'HEAT MAP', icon: TrendingUp },
    { id: 'network', label: 'NETWORK', icon: Zap },
    { id: 'impact', label: 'IMPACT', icon: TrendingUp },
    { id: 'predictions', label: 'PREDICT', icon: Target },
    { id: 'orders', label: 'ORDERS', icon: Bell },
  ] as const

  return (
    <header className="flex flex-col" style={{ background: 'linear-gradient(180deg, #030508 0%, #070c18 100%)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-gold-800 border-opacity-20">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)' }}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-black font-display font-bold text-sm">₹</span>
              </div>
            </div>
            <div>
              <div className="font-display text-gold-400 font-bold text-base tracking-wider leading-none">BHARATA</div>
              <div className="font-mono text-[9px] text-neutral tracking-widest">MARKET INTELLIGENCE</div>
            </div>
          </div>

          {/* Index quick stats */}
          {sensex && (
            <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded border border-gold-800 border-opacity-20">
              <span className="font-mono text-[10px] text-neutral tracking-wider">SENSEX</span>
              <span className="font-mono text-xs font-bold text-white ml-1">{formatIndian(sensex.value)}</span>
              <span className={`font-mono text-[10px] ml-1 ${sensex.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                {sensex.change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(sensex.changePercent))}
              </span>
            </div>
          )}
          {nifty && (
            <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded border border-gold-800 border-opacity-20">
              <span className="font-mono text-[10px] text-neutral tracking-wider">NIFTY</span>
              <span className="font-mono text-xs font-bold text-white ml-1">{formatIndian(nifty.value)}</span>
              <span className={`font-mono text-[10px] ml-1 ${nifty.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                {nifty.change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(nifty.changePercent))}
              </span>
            </div>
          )}

          {/* Market status indicator */}
          <div className="flex items-center gap-1.5">
            {marketStatus === 'open' ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-gain" style={{ boxShadow: '0 0 6px #00d4aa', animation: 'pulse 2s ease-in-out infinite' }} />
                <span className="font-mono text-[10px] text-gain tracking-widest">SIMULATED LIVE</span>
              </>
            ) : marketStatus === 'pre-open' ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 6px #fbbf24' }} />
                <span className="font-mono text-[10px] text-gold-400 tracking-widest">PRE-OPEN</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-neutral opacity-60" />
                <span className="font-mono text-[10px] text-neutral tracking-widest">{marketStatus === 'post-close' ? 'POST-CLOSE' : 'MKT CLOSED'}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Search + Alerts */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-gold-800 border-opacity-30 bg-surface-400 bg-opacity-50">
              <Search className="w-3 h-3 text-neutral" />
              <input
                type="text"
                placeholder="Search company, symbol..."
                className="bg-transparent outline-none font-mono text-xs text-white placeholder-neutral w-48"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-surface-300 border border-gold-700 border-opacity-30 rounded shadow-2xl z-50">
                {searchResults.map(c => (
                  <button
                    key={c.id}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-200 transition-colors border-b border-surface-200 last:border-0"
                    onClick={() => { setSelectedCompany(c); setSearchQuery(''); setShowSearch(false) }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold-400">{c.symbol}</span>
                      <span className="text-xs text-neutral">{c.name.substring(0, 28)}</span>
                    </div>
                    <span className={`font-mono text-xs ${c.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {c.changePercent >= 0 ? '+' : ''}{c.changePercent.toFixed(2)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="relative p-1.5 rounded border border-gold-700 border-opacity-30 hover:border-gold-500 transition-colors"
            onClick={() => setViewMode('orders')}
          >
            <Bell className="w-4 h-4 text-neutral" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-loss text-white text-[9px] font-bold flex items-center justify-center">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden h-7 flex items-center border-b border-gold-800 border-opacity-10 bg-surface-600">
        <div
          className="flex items-center gap-6 whitespace-nowrap font-mono text-[11px] transition-transform"
          style={{ transform: `translateX(${tickerPos % (companies.length * 140)}px)`, willChange: 'transform' }}
        >
          {[...companies, ...companies].map((c, i) => (
            <span key={`${c.id}-${i}`} className="flex items-center gap-1.5 shrink-0">
              <span className="text-gold-500 font-semibold tracking-wide">{c.symbol}</span>
              <span className="text-white">₹{c.price.toFixed(2)}</span>
              <span className={c.change >= 0 ? 'text-gain' : 'text-loss'}>
                {c.change >= 0 ? '▲' : '▼'} {Math.abs(c.changePercent).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-0 px-6 border-b border-gold-800 border-opacity-20">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setViewMode(item.id)}
            className={`px-5 py-2.5 font-mono text-[11px] tracking-widest transition-all border-b-2 ${
              viewMode === item.id
                ? 'text-gold-400 border-gold-500'
                : 'text-neutral border-transparent hover:text-white hover:border-gold-700'
            }`}
          >
            {item.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-neutral py-2">
          <span>BSE: 5,804 cos</span>
          <span className="text-gold-700">|</span>
          <span>NSE: 2,189 cos</span>
          <span className="text-gold-700">|</span>
          <span className="text-gold-500">Market: 09:15 - 15:30 IST</span>
        </div>
      </nav>
    </header>
  )
}

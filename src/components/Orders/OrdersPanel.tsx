import { useState } from 'react'
import { AlertTriangle, Bell, TrendingUp, Package, UserCheck, Activity } from 'lucide-react'
import { useMarketStore } from '../../store/marketStore'
import type { MarketAlert } from '../../data/marketData'
import { timeAgo } from '../../utils/format'

const ALERT_ICONS = {
  circuit_breaker: AlertTriangle,
  block_deal: Package,
  bulk_deal: Package,
  insider: UserCheck,
  news: Bell,
  order_flow: TrendingUp,
  technical: Activity,
}

const ALERT_COLORS = {
  critical: '#ff4757',
  high: '#ffd700',
  medium: '#4fc3f7',
  low: '#8892b0',
}

const ALERT_LABELS = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

interface LiveOrderEntry {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  exchange: string
  time: number
}

function generateLiveOrders(companies: ReturnType<typeof useMarketStore['getState']>['companies']): LiveOrderEntry[] {
  const orders: LiveOrderEntry[] = []
  const sample = companies.slice(0, 15)
  sample.forEach((c, i) => {
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL'
    const qty = Math.floor(Math.random() * 10000) + 100
    const price = c.price * (1 + (Math.random() - 0.5) * 0.005)
    orders.push({
      id: `ord-${i}`,
      symbol: c.symbol,
      type,
      quantity: qty,
      price: Math.round(price * 100) / 100,
      total: Math.round(price * qty),
      exchange: c.exchange === 'BOTH' ? (Math.random() > 0.5 ? 'BSE' : 'NSE') : c.exchange,
      time: Date.now() - Math.floor(Math.random() * 60000),
    })
  })
  return orders.sort((a, b) => b.time - a.time)
}

export default function OrdersPanel() {
  const { alerts, companies, clearAlerts, setSelectedCompany, setImpactSource } = useMarketStore()
  const [filter, setFilter] = useState<string>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')

  const liveOrders = generateLiveOrders(companies)

  const filtered = alerts.filter(a => {
    if (filter !== 'ALL' && a.type !== filter) return false
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false
    return true
  })

  const AlertRow = ({ alert }: { alert: MarketAlert }) => {
    const Icon = ALERT_ICONS[alert.type] || Bell
    const company = companies.find(c => c.symbol === alert.symbol)
    return (
      <div
        className="flex gap-3 p-3 rounded-lg border border-opacity-20 hover:border-opacity-40 transition-all cursor-pointer mb-2"
        style={{ borderColor: ALERT_COLORS[alert.severity], background: `${ALERT_COLORS[alert.severity]}08` }}
        onClick={() => company && setSelectedCompany(company)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ALERT_COLORS[alert.severity]}20` }}>
          <Icon className="w-4 h-4" style={{ color: ALERT_COLORS[alert.severity] }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider"
              style={{ color: ALERT_COLORS[alert.severity], background: `${ALERT_COLORS[alert.severity]}15` }}
            >
              {ALERT_LABELS[alert.severity]}
            </span>
            <span className="font-mono text-gold-400 text-[11px] font-bold">{alert.symbol}</span>
            <span className="font-mono text-[9px] text-neutral">{alert.type.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="font-mono text-[11px] text-white leading-relaxed">{alert.message}</div>
          {alert.price && (
            <div className="flex gap-3 mt-1">
              {alert.price && <span className="font-mono text-[9px] text-neutral">Price: <span className="text-white">₹{alert.price.toLocaleString()}</span></span>}
              {alert.quantity && <span className="font-mono text-[9px] text-neutral">Qty: <span className="text-white">{alert.quantity.toLocaleString()}</span></span>}
              {alert.value && <span className="font-mono text-[9px] text-neutral">Value: <span className="text-white">₹{(alert.value / 10000000).toFixed(1)}Cr</span></span>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-mono text-[9px] text-neutral">{timeAgo(alert.timestamp)}</span>
          {company && (
            <button
              className="text-[9px] font-mono text-gold-500 hover:text-gold-300"
              onClick={e => { e.stopPropagation(); setImpactSource(company.id) }}
            >
              IMPACT ▶
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gold-400" />
            <span className="section-title">MARKET ALERTS & ORDERS</span>
            <span className="bg-loss text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">{alerts.length}</span>
          </div>
          <button onClick={clearAlerts} className="btn-ghost text-[10px] px-2 py-1">Clear All</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'circuit_breaker', 'block_deal', 'bulk_deal', 'insider', 'news', 'order_flow', 'technical'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2 py-1 rounded font-mono text-[10px] transition-all ${filter === t ? 'bg-gold-600 text-black font-bold' : 'border border-surface-200 text-neutral hover:border-gold-700 hover:text-white'}`}
            >
              {t === 'ALL' ? 'ALL' : t.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {(['ALL', 'critical', 'high', 'medium', 'low'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2 py-1 rounded font-mono text-[10px] transition-all ${severityFilter === s ? 'font-bold' : 'opacity-60'}`}
                style={{ color: s === 'ALL' ? 'white' : ALERT_COLORS[s as keyof typeof ALERT_COLORS], background: severityFilter === s ? `${s === 'ALL' ? 'rgba(255,255,255,0.1)' : ALERT_COLORS[s as keyof typeof ALERT_COLORS] + '20'}` : 'transparent' }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="section-title mb-3">MARKET ALERTS</div>
          {filtered.length === 0 ? (
            <div className="text-center text-neutral font-mono text-sm py-8">No alerts matching filters</div>
          ) : (
            filtered.map(a => <AlertRow key={a.id} alert={a} />)
          )}
        </div>

        {/* Live orders feed */}
        <div className="w-72 border-l border-surface-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-surface-200">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gain" style={{ boxShadow: '0 0 6px #00d4aa', animation: 'pulse 2s ease-in-out infinite' }} />
              <span className="section-title">LIVE ORDER FLOW</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {liveOrders.map(order => (
              <div key={order.id} className="flex items-center gap-2 p-2 border-b border-surface-200 border-opacity-50 hover:bg-surface-200 cursor-pointer text-xs font-mono">
                <span className={`w-8 text-center font-bold px-1 py-0.5 rounded text-[10px] ${order.type === 'BUY' ? 'bg-gain bg-opacity-15 text-gain' : 'bg-loss bg-opacity-15 text-loss'}`}>
                  {order.type}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-[11px]">{order.symbol}</span>
                    <span className="text-[9px] text-neutral">{order.exchange}</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-neutral text-[9px]">{order.quantity.toLocaleString()} @ ₹{order.price.toFixed(2)}</span>
                    <span className="text-neutral text-[9px]">{timeAgo(order.time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

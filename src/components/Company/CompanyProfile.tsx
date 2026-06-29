import { useMemo } from 'react'
import { X, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { useMarketStore } from '../../store/marketStore'
import { CONNECTIONS } from '../../data/connections'
import { formatLargeCrore, formatPercent, formatVolume, getChangeBg } from '../../utils/format'
import { generateIntraday } from '../../data/marketData'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="card border border-gold-700 border-opacity-30 p-2 text-[10px] font-mono">
      <div className="text-neutral">{new Date(d.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="text-white">₹{d.close?.toFixed(2) || payload[0].value?.toFixed(2)}</div>
    </div>
  )
}

export default function CompanyProfile() {
  const { selectedCompany, companies, setSelectedCompany, setImpactSource } = useMarketStore()
  const c = selectedCompany
  if (!c) return null

  const intradayData = useMemo(() => generateIntraday(c.price), [c.id]) // eslint-disable-line

  const connections = CONNECTIONS.filter(conn => conn.source === c.id || conn.target === c.id)
  const connectedIds = new Set(connections.map(conn => conn.source === c.id ? conn.target as string : conn.source as string))
  const connectedCompanies = companies.filter(co => connectedIds.has(co.id))

  const isUp = c.changePercent >= 0

  const statBlocks = [
    { label: 'MARKET CAP', value: formatLargeCrore(c.marketCap) },
    { label: 'P/E RATIO', value: `${c.pe.toFixed(1)}x` },
    { label: 'P/B RATIO', value: `${c.pb.toFixed(1)}x` },
    { label: 'EPS (TTM)', value: `₹${c.eps.toFixed(2)}` },
    { label: 'DIV YIELD', value: `${c.dividendYield.toFixed(2)}%` },
    { label: 'ROE', value: `${c.roe.toFixed(1)}%` },
    { label: 'ROA', value: `${c.roa.toFixed(1)}%` },
    { label: 'D/E RATIO', value: c.debtToEquity.toFixed(2) },
    { label: '52W HIGH', value: `₹${c.weekHigh52.toFixed(2)}` },
    { label: '52W LOW', value: `₹${c.weekLow52.toFixed(2)}` },
    { label: 'REVENUE', value: formatLargeCrore(c.revenue) },
    { label: 'NET PROFIT', value: formatLargeCrore(c.netProfit) },
  ]

  const holdingData = [
    { name: 'Promoter', value: c.promoterHolding, color: '#d4af37' },
    { name: 'FII', value: c.fiHolding, color: '#00d4aa' },
    { name: 'DII', value: c.diHolding, color: '#4fc3f7' },
    { name: 'Public', value: c.publicHolding, color: '#8892b0' },
  ]

  const priceFromLow = ((c.price - c.weekLow52) / (c.weekHigh52 - c.weekLow52)) * 100

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-surface-200" style={{ background: `linear-gradient(135deg, ${c.color}15 0%, transparent 60%)` }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg" style={{ background: c.color }}>
            {c.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl text-white font-semibold">{c.name}</h2>
              <span className="font-mono text-xs text-neutral border border-surface-200 rounded px-1.5 py-0.5">{c.exchange}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-gold-400 text-sm font-bold">{c.symbol}</span>
              <span className="text-neutral text-xs">·</span>
              <span className="text-neutral text-xs">{c.sector}</span>
              <span className="text-neutral text-xs">·</span>
              <span className="text-gold-500 text-xs font-semibold">{c.group} Group</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setImpactSource(c.id)} className="btn-ghost text-xs flex items-center gap-1.5">
            <Zap className="w-3 h-3" />IMPACT
          </button>
          <button onClick={() => setSelectedCompany(null)} className="p-1.5 hover:bg-surface-200 rounded transition-colors">
            <X className="w-4 h-4 text-neutral" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Price block */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono font-bold text-3xl text-white">₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center gap-2 mt-1 ${isUp ? 'text-gain' : 'text-loss'}`}>
              <span className="font-mono text-base font-semibold">{isUp ? '▲' : '▼'} ₹{Math.abs(c.change).toFixed(2)}</span>
              <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${getChangeBg(c.changePercent)}`}>
                {isUp ? '+' : ''}{formatPercent(c.changePercent)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral font-mono">Volume</div>
            <div className="font-mono text-white font-bold">{formatVolume(c.volume)}</div>
            <div className="text-xs text-neutral font-mono mt-1">Employees</div>
            <div className="font-mono text-white">{c.employees.toLocaleString()}</div>
          </div>
        </div>

        {/* 52w range */}
        <div className="card-glow p-3">
          <div className="flex justify-between text-[10px] font-mono text-neutral mb-1.5">
            <span>52W LOW: ₹{c.weekLow52.toFixed(0)}</span>
            <span>52W RANGE</span>
            <span>52W HIGH: ₹{c.weekHigh52.toFixed(0)}</span>
          </div>
          <div className="relative h-2 bg-surface-200 rounded-full">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${priceFromLow}%`, background: isUp ? '#00d4aa' : '#ff4757' }} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 bg-white" style={{ left: `${priceFromLow}%`, borderColor: isUp ? '#00d4aa' : '#ff4757' }} />
          </div>
          <div className="text-center text-[10px] font-mono text-gold-400 mt-1">
            {priceFromLow.toFixed(1)}% from 52W Low
          </div>
        </div>

        {/* Intraday chart */}
        <div className="card-glow p-3">
          <div className="section-title mb-3">TODAY'S MOVEMENT</div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intradayData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`ig-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#00d4aa' : '#ff4757'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isUp ? '#00d4aa' : '#ff4757'} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(136,146,176,0.08)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={c.price - c.change} stroke="rgba(212,175,55,0.3)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="close" stroke={isUp ? '#00d4aa' : '#ff4757'} strokeWidth={1.5} fill={`url(#ig-${c.id})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key stats grid */}
        <div className="card-glow p-3">
          <div className="section-title mb-3">KEY METRICS</div>
          <div className="grid grid-cols-3 gap-2">
            {statBlocks.map(s => (
              <div key={s.label} className="bg-surface-400 bg-opacity-40 rounded p-2">
                <div className="stat-label text-[9px]">{s.label}</div>
                <div className="font-mono text-xs font-bold text-white mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shareholding */}
        <div className="card-glow p-3">
          <div className="section-title mb-3">SHAREHOLDING PATTERN</div>
          <div className="space-y-2">
            {holdingData.map(h => (
              <div key={h.name} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-neutral w-16">{h.name}</span>
                <div className="flex-1 h-4 bg-surface-200 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm transition-all" style={{ width: `${h.value}%`, background: h.color }} />
                </div>
                <span className="font-mono text-[10px] font-bold w-10 text-right" style={{ color: h.color }}>{h.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company info */}
        <div className="card-glow p-3">
          <div className="section-title mb-2">ABOUT</div>
          <p className="text-xs text-neutral leading-relaxed">{c.description}</p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono">
            <div><span className="text-neutral">Founded: </span><span className="text-white">{c.founded}</span></div>
            <div><span className="text-neutral">HQ: </span><span className="text-white">{c.headquarters}</span></div>
            <div><span className="text-neutral">Industry: </span><span className="text-white">{c.industry}</span></div>
            <div><span className="text-neutral">Exchange: </span><span className="text-white">{c.exchange}</span></div>
          </div>
        </div>

        {/* Data integrity check */}
        <div className="card-glow p-3">
          <div className="section-title mb-2">DATA INTEGRITY CHECK</div>
          <div className="space-y-1 text-[10px] font-mono">
            <div className="flex justify-between">
              <span className="text-neutral">EPS × P/E (implied price)</span>
              <span className="text-white">₹{(c.eps * c.pe).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">Actual price</span>
              <span className={Math.abs(c.price - c.eps * c.pe) / c.price < 0.02 ? 'text-gain' : 'text-gold-400'}>
                ₹{c.price.toFixed(2)} {Math.abs(c.price - c.eps * c.pe) / c.price < 0.02 ? '✓ consistent' : '~ approx'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">Shareholding sum</span>
              <span className={Math.abs(c.promoterHolding + c.fiHolding + c.diHolding + c.publicHolding - 100) < 0.5 ? 'text-gain' : 'text-loss'}>
                {(c.promoterHolding + c.fiHolding + c.diHolding + c.publicHolding).toFixed(1)}% {Math.abs(c.promoterHolding + c.fiHolding + c.diHolding + c.publicHolding - 100) < 0.5 ? '✓ = 100%' : '⚠ check'}
              </span>
            </div>
            <div className="pt-1 border-t border-surface-200 text-neutral">
              Fundamentals source: FY24/25 annual reports (NSE filings, BSE Bhav Copy). Prices: Ornstein-Uhlenbeck simulation seeded from mid-2024 levels. Not real-time data.
            </div>
          </div>
        </div>

        {/* Connected companies */}
        {connectedCompanies.length > 0 && (
          <div className="card-glow p-3">
            <div className="section-title mb-3">CONNECTED COMPANIES ({connectedCompanies.length})</div>
            <div className="space-y-1.5">
              {connectedCompanies.map(co => {
                const conn = connections.find(c2 => (c2.source === c.id && c2.target === co.id) || (c2.target === c.id && c2.source === co.id))
                return (
                  <button
                    key={co.id}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-200 transition-colors text-left"
                    onClick={() => setSelectedCompany(co)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: co.color }} />
                      <span className="font-mono text-[11px] text-white font-semibold">{co.symbol}</span>
                      <span className="text-[9px] text-neutral">{co.sector}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {conn && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: '#d4af37', background: 'rgba(212,175,55,0.1)' }}>
                          {conn.type.replace('_', ' ')}
                        </span>
                      )}
                      <span className={`font-mono text-[10px] ${co.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {co.changePercent >= 0 ? '+' : ''}{co.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

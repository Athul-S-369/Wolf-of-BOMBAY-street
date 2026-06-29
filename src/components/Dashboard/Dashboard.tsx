import { useMarketStore } from '../../store/marketStore'
import IndexCard from './IndexCard'
import TopMovers from './TopMovers'
import SectorHeatmap from './SectorHeatmap'
import StockTable from './StockTable'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from 'recharts'
import { useMemo } from 'react'
import { generateOHLCV } from '../../data/marketData'
import { formatLargeCrore } from '../../utils/format'

function MarketBreadth() {
  const { companies } = useMarketStore()
  const listed = companies.filter(c => c.listed && c.price > 0)
  const gainers = listed.filter(c => c.changePercent > 0).length
  const losers = listed.filter(c => c.changePercent < 0).length
  const unchanged = listed.length - gainers - losers
  const total = listed.length || 1

  return (
    <div className="card-glow p-4">
      <div className="section-title mb-3">MARKET BREADTH</div>
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        <div className="bg-gain" style={{ width: `${(gainers / total) * 100}%` }} />
        <div className="bg-neutral bg-opacity-40" style={{ width: `${(unchanged / total) * 100}%` }} />
        <div className="bg-loss" style={{ width: `${(losers / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs font-mono">
        <div className="text-center">
          <div className="text-gain font-bold text-lg">{gainers}</div>
          <div className="text-neutral text-[10px]">Advancing</div>
        </div>
        <div className="text-center">
          <div className="text-neutral font-bold text-lg">{unchanged}</div>
          <div className="text-neutral text-[10px]">Unchanged</div>
        </div>
        <div className="text-center">
          <div className="text-loss font-bold text-lg">{losers}</div>
          <div className="text-neutral text-[10px]">Declining</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-surface-200 grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div>
          <span className="text-neutral">A/D Ratio: </span>
          <span className={gainers >= losers ? 'text-gain' : 'text-loss'}>{(gainers / Math.max(1, losers)).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-neutral">Total MCap: </span>
          <span className="text-white">{formatLargeCrore(companies.reduce((s, c) => s + c.marketCap, 0))}</span>
        </div>
      </div>
    </div>
  )
}

function SensexChart() {
  const data = useMemo(() => {
    const points = generateOHLCV(81000, 30)
    return points.map(p => ({
      time: new Date(p.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: Math.round(p.close),
    }))
  }, [])

  const isUp = data[data.length - 1]?.value > data[0]?.value

  return (
    <div className="card-glow p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">SENSEX — 30 DAYS</span>
        <span className={`font-mono text-xs font-bold ${isUp ? 'text-gain' : 'text-loss'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(((data[data.length - 1]?.value - data[0]?.value) / data[0]?.value) * 100).toFixed(2)}%
        </span>
      </div>
      <div style={{ height: 100 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="sensex-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isUp ? '#00d4aa' : '#ff4757'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isUp ? '#00d4aa' : '#ff4757'} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(136,146,176,0.06)" vertical={false} />
            <XAxis dataKey="time" hide />
            <Tooltip
              contentStyle={{ background: '#0f1b35', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 4 }}
              labelStyle={{ color: '#8892b0', fontSize: 9 }}
              itemStyle={{ color: '#fff', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'SENSEX']}
            />
            <Area type="monotone" dataKey="value" stroke={isUp ? '#00d4aa' : '#ff4757'} strokeWidth={1.5} fill="url(#sensex-grad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { indices, companies } = useMarketStore()
  const majorIndices = indices.slice(0, 4)
  const extraIndices = indices.slice(4)

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Indices row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {majorIndices.map(idx => <IndexCard key={idx.id} index={idx} />)}
      </div>

      {/* Second row: extra indices + breadth + sensex chart */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {extraIndices.map(idx => <IndexCard key={idx.id} index={idx} />)}
        <MarketBreadth />
        <SensexChart />
      </div>

      {/* Top movers */}
      <TopMovers />

      {/* Heatmap */}
      <SectorHeatmap />

      {/* All stocks table — listed companies only */}
      <StockTable companies={companies.filter(c => c.listed && c.price > 0)} title="ALL NSE / BSE TRACKED COMPANIES" />
    </div>
  )
}

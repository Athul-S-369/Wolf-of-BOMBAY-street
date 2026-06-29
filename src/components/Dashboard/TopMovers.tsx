import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { useMarketStore } from '../../store/marketStore'
import { formatPercent } from '../../utils/format'

export default function TopMovers() {
  const { companies, setSelectedCompany } = useMarketStore()

  const listed = companies.filter(c => c.listed && c.price > 0)
  const sorted = [...listed].sort((a, b) => b.changePercent - a.changePercent)
  const gainers = sorted.slice(0, 5)
  const losers = sorted.slice(-5).reverse()
  const active = [...listed].sort((a, b) => b.volume - a.volume).slice(0, 5)

  const Row = ({ c, showVol = false }: { c: typeof companies[0]; showVol?: boolean }) => (
    <button
      className="w-full flex items-center justify-between py-2 px-3 rounded hover:bg-surface-200 transition-colors"
      onClick={() => setSelectedCompany(c)}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-sm" style={{ background: c.color }} />
        <div className="text-left">
          <div className="font-mono text-[11px] text-white font-semibold">{c.symbol}</div>
          <div className="font-mono text-[9px] text-neutral">₹{c.price.toFixed(2)}</div>
        </div>
      </div>
      {showVol ? (
        <div className="font-mono text-[10px] text-gold-400">
          {(c.volume / 1000000).toFixed(1)}M
        </div>
      ) : (
        <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${c.changePercent >= 0 ? 'bg-gain bg-opacity-10 text-gain' : 'bg-loss bg-opacity-10 text-loss'}`}>
          {c.changePercent >= 0 ? '+' : ''}{formatPercent(c.changePercent)}
        </span>
      )}
    </button>
  )

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="card-glow p-3">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-200">
          <TrendingUp className="w-3 h-3 text-gain" />
          <span className="section-title text-gain">TOP GAINERS</span>
        </div>
        {gainers.map(c => <Row key={c.id} c={c} />)}
      </div>
      <div className="card-glow p-3">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-200">
          <TrendingDown className="w-3 h-3 text-loss" />
          <span className="section-title text-loss">TOP LOSERS</span>
        </div>
        {losers.map(c => <Row key={c.id} c={c} />)}
      </div>
      <div className="card-glow p-3">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-200">
          <Zap className="w-3 h-3 text-gold-400" />
          <span className="section-title">MOST ACTIVE</span>
        </div>
        {active.map(c => <Row key={c.id} c={c} showVol />)}
      </div>
    </div>
  )
}

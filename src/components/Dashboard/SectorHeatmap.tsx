import { useMarketStore } from '../../store/marketStore'
import { formatLargeCrore } from '../../utils/format'

export default function SectorHeatmap() {
  const { companies, setSelectedCompany } = useMarketStore()

  const sectorData = Object.entries(
    companies.reduce((acc, c) => {
      if (!acc[c.sector]) acc[c.sector] = { companies: [], totalMcap: 0, change: 0 }
      acc[c.sector].companies.push(c)
      acc[c.sector].totalMcap += c.marketCap
      acc[c.sector].change += c.changePercent
      return acc
    }, {} as Record<string, { companies: typeof companies; totalMcap: number; change: number }>)
  ).map(([sector, data]) => ({
    sector,
    companies: data.companies,
    totalMcap: data.totalMcap,
    avgChange: data.change / data.companies.length,
  })).sort((a, b) => b.totalMcap - a.totalMcap)

  function getHeatColor(change: number): string {
    if (change > 3) return 'rgba(0,212,170,0.7)'
    if (change > 2) return 'rgba(0,212,170,0.55)'
    if (change > 1) return 'rgba(0,212,170,0.38)'
    if (change > 0.5) return 'rgba(0,212,170,0.25)'
    if (change > 0) return 'rgba(0,212,170,0.12)'
    if (change > -0.5) return 'rgba(255,71,87,0.12)'
    if (change > -1) return 'rgba(255,71,87,0.25)'
    if (change > -2) return 'rgba(255,71,87,0.40)'
    if (change > -3) return 'rgba(255,71,87,0.55)'
    return 'rgba(255,71,87,0.75)'
  }

  return (
    <div className="card-glow p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="section-title">SECTOR HEAT MAP</span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded inline-block" style={{ background: 'rgba(0,212,170,0.5)' }} />
            <span className="text-neutral">Gain</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded inline-block" style={{ background: 'rgba(255,71,87,0.5)' }} />
            <span className="text-neutral">Loss</span>
          </span>
        </div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {sectorData.map(s => (
          <div
            key={s.sector}
            className="rounded p-3 border border-opacity-20 cursor-pointer hover:border-opacity-50 transition-all"
            style={{ background: getHeatColor(s.avgChange), borderColor: s.avgChange >= 0 ? '#00d4aa' : '#ff4757' }}
          >
            <div className="text-[10px] font-mono text-white font-semibold tracking-wide truncate">{s.sector.toUpperCase()}</div>
            <div className="flex items-center justify-between mt-1">
              <span className={`font-mono text-xs font-bold ${s.avgChange >= 0 ? 'text-gain' : 'text-loss'}`}>
                {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}%
              </span>
              <span className="text-[9px] text-neutral font-mono">{formatLargeCrore(s.totalMcap)}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {s.companies.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  className="text-[9px] font-mono px-1 py-0.5 rounded font-semibold"
                  style={{ background: 'rgba(0,0,0,0.3)', color: c.changePercent >= 0 ? '#00d4aa' : '#ff4757' }}
                  onClick={e => { e.stopPropagation(); setSelectedCompany(c) }}
                >
                  {c.symbol}
                </button>
              ))}
              {s.companies.length > 4 && (
                <span className="text-[9px] font-mono text-neutral px-1">+{s.companies.length - 4}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

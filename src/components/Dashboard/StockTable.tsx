import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import type { Company } from '../../data/companies'
import { useMarketStore } from '../../store/marketStore'
import { formatLargeCrore, formatVolume, formatPercent, getChangeBg } from '../../utils/format'

type SortKey = 'name' | 'price' | 'changePercent' | 'marketCap' | 'volume' | 'pe'
type SortDir = 'asc' | 'desc'

interface Props {
  companies: Company[]
  limit?: number
  showHeader?: boolean
  title?: string
}

export default function StockTable({ companies, limit, showHeader = true, title }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('marketCap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter, setFilter] = useState('')
  const { setSelectedCompany, priceUpdates } = useMarketStore()

  const sorted = useMemo(() => {
    let list = [...companies]
    if (filter) {
      const q = filter.toLowerCase()
      list = list.filter(c => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      let av = a[sortKey] as number
      let bv = b[sortKey] as number
      if (sortKey === 'name') {
        av = a.name.charCodeAt(0) as unknown as number
        bv = b.name.charCodeAt(0) as unknown as number
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return limit ? list.slice(0, limit) : list
  }, [companies, sortKey, sortDir, filter, limit])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDir === 'desc' ? <ChevronDown className="w-3 h-3 text-gold-400" /> : <ChevronUp className="w-3 h-3 text-gold-400" />
  }

  return (
    <div className="card-glow overflow-hidden">
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <span className="section-title">{title || 'ALL STOCKS'}</span>
          <input
            type="text"
            placeholder="Filter..."
            className="bg-surface-400 border border-surface-200 rounded px-2 py-1 font-mono text-xs text-white placeholder-neutral outline-none w-36"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-surface-200">
              {[
                { key: 'name' as SortKey, label: 'COMPANY', align: 'left' },
                { key: 'price' as SortKey, label: 'PRICE', align: 'right' },
                { key: 'changePercent' as SortKey, label: 'CHG%', align: 'right' },
                { key: 'marketCap' as SortKey, label: 'MCAP', align: 'right' },
                { key: 'volume' as SortKey, label: 'VOLUME', align: 'right' },
                { key: 'pe' as SortKey, label: 'P/E', align: 'right' },
              ].map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-neutral text-[10px] tracking-widest cursor-pointer hover:text-gold-400 transition-colors ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1 justify-end">
                    <SortIcon k={col.key} />
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const update = priceUpdates[c.id]
              const isUp = c.changePercent >= 0
              return (
                <tr
                  key={c.id}
                  className="border-b border-surface-200 border-opacity-50 hover:bg-surface-200 hover:bg-opacity-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCompany(c)}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <div>
                        <div className="text-white font-semibold text-[11px]">{c.symbol}</div>
                        <div className="text-neutral text-[9px] truncate max-w-[140px]">{c.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${update?.direction === 'up' ? 'text-gain' : update?.direction === 'down' ? 'text-loss' : 'text-white'}`}>
                    ₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getChangeBg(c.changePercent)}`}>
                      {isUp ? '+' : ''}{formatPercent(c.changePercent)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-neutral">{formatLargeCrore(c.marketCap)}</td>
                  <td className="px-3 py-2 text-right text-neutral">{formatVolume(c.volume)}</td>
                  <td className="px-3 py-2 text-right text-neutral">{c.pe.toFixed(1)}x</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

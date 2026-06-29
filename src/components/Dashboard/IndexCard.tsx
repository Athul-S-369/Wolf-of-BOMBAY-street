import { TrendingUp, TrendingDown } from 'lucide-react'
import type { IndexData } from '../../data/marketData'
import { formatIndian, formatPercent } from '../../utils/format'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

interface Props { index: IndexData; sparkData?: number[] }

export default function IndexCard({ index, sparkData }: Props) {
  const isUp = index.change >= 0

  const chartData = useMemo(() => {
    if (sparkData) return sparkData.map((v, i) => ({ v, i }))
    // Generate mini spark
    const pts: number[] = []
    let p = index.prevClose
    for (let i = 0; i < 48; i++) {
      p = p * (1 + (Math.random() - 0.5) * 0.004)
      pts.push(p)
    }
    pts[pts.length - 1] = index.value
    return pts.map((v, i) => ({ v, i }))
  }, [index.id]) // eslint-disable-line

  return (
    <div className="card-glow p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 80% 50%, ${isUp ? 'rgba(0,212,170,0.05)' : 'rgba(255,71,87,0.05)'} 0%, transparent 70%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="section-title mb-1">{index.id}</div>
            <div className="text-[10px] text-neutral font-mono">{index.name}</div>
          </div>
          {isUp
            ? <TrendingUp className="w-4 h-4 text-gain" />
            : <TrendingDown className="w-4 h-4 text-loss" />
          }
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono font-bold text-xl text-white leading-none">
              {formatIndian(index.value)}
            </div>
            <div className={`flex items-center gap-1 mt-1 font-mono text-xs ${isUp ? 'text-gain' : 'text-loss'}`}>
              <span>{isUp ? '▲' : '▼'}</span>
              <span>{Math.abs(index.change).toFixed(2)}</span>
              <span className="text-neutral mx-0.5">|</span>
              <span>{isUp ? '+' : ''}{formatPercent(index.changePercent)}</span>
            </div>
          </div>
          <div className="h-10 w-24 opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`grad-${index.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#00d4aa' : '#ff4757'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isUp ? '#00d4aa' : '#ff4757'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={isUp ? '#00d4aa' : '#ff4757'} strokeWidth={1.5} fill={`url(#grad-${index.id})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-surface-200">
          <div>
            <div className="stat-label text-[9px]">High</div>
            <div className="font-mono text-[11px] text-white">{formatIndian(index.high)}</div>
          </div>
          <div>
            <div className="stat-label text-[9px]">Low</div>
            <div className="font-mono text-[11px] text-white">{formatIndian(index.low)}</div>
          </div>
          <div>
            <div className="stat-label text-[9px]">A/D</div>
            <div className="font-mono text-[11px]">
              <span className="text-gain">{index.advanceDecline[0]}</span>
              <span className="text-neutral">/</span>
              <span className="text-loss">{index.advanceDecline[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, Target, TrendingDown, TrendingUp, XCircle } from 'lucide-react'
import type { PredictionsStore, StockPrediction, PredictionHistory } from '../../types/predictions'

function DirectionBadge({ direction, upChance, downChance }: Pick<StockPrediction, 'direction' | 'upChance' | 'downChance'>) {
  const cfg = direction === 'up'
    ? { color: '#00d4aa', Icon: TrendingUp, label: 'BULLISH' }
    : direction === 'down'
      ? { color: '#ef4444', Icon: TrendingDown, label: 'BEARISH' }
      : { color: '#8892b0', Icon: Target, label: 'NEUTRAL' }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: cfg.color }}>
        <cfg.Icon className="w-3 h-3" />
        {cfg.label}
      </span>
      <span className="font-mono text-[9px] text-neutral">
        {upChance}% up / {downChance}% down
      </span>
    </div>
  )
}

function HitBadge({ hit }: { hit?: boolean }) {
  if (hit == null) {
    return (
      <span className="flex items-center gap-1 font-mono text-[10px] text-gold-400">
        <Clock className="w-3 h-3" />
        PENDING
      </span>
    )
  }
  return hit ? (
    <span className="flex items-center gap-1 font-mono text-[10px] text-gain">
      <CheckCircle2 className="w-3 h-3" />
      HIT
    </span>
  ) : (
    <span className="flex items-center gap-1 font-mono text-[10px] text-loss">
      <XCircle className="w-3 h-3" />
      MISS
    </span>
  )
}

function ProbabilityBar({ upChance }: { upChance: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-200">
      <div
        className="h-full transition-all"
        style={{
          width: `${upChance}%`,
          background: upChance >= 55
            ? 'linear-gradient(90deg, #00d4aa, #34d399)'
            : upChance <= 45
              ? 'linear-gradient(90deg, #ef4444, #f87171)'
              : 'linear-gradient(90deg, #8892b0, #a8b0c8)',
        }}
      />
    </div>
  )
}

function PredictionRow({ item, showOutcome }: { item: StockPrediction | PredictionHistory; showOutcome?: boolean }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-surface-200 last:border-0 hover:bg-surface-400/30 px-2 rounded transition-colors">
      <div className="col-span-3">
        <div className="font-mono text-xs font-bold text-gold-400">{item.symbol}</div>
        <div className="text-[10px] text-neutral truncate">{item.name}</div>
      </div>
      <div className="col-span-2 font-mono text-[10px] text-neutral">
        {item.targetDate}
      </div>
      <div className="col-span-3">
        <ProbabilityBar upChance={item.upChance} />
        <div className="mt-1 font-mono text-[9px] text-neutral capitalize">{item.confidence} confidence</div>
      </div>
      <div className="col-span-2">
        <DirectionBadge direction={item.direction} upChance={item.upChance} downChance={item.downChance} />
      </div>
      <div className="col-span-2 text-right">
        {showOutcome ? (
          <div className="space-y-1">
            <HitBadge hit={'hit' in item ? item.hit : undefined} />
            {'actualChangePercent' in item && item.actualChangePercent != null && (
              <div className={`font-mono text-[10px] ${item.actualChangePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                {item.actualChangePercent >= 0 ? '+' : ''}{item.actualChangePercent.toFixed(2)}%
              </div>
            )}
          </div>
        ) : (
          <div className="font-mono text-[10px] text-neutral">
            ₹{item.priceAtPrediction.toLocaleString('en-IN')}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PredictionsPanel() {
  const [data, setData] = useState<PredictionsStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'live' | 'history'>('live')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/data/predictions.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json() as PredictionsStore
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load predictions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const timer = setInterval(load, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [])

  const bullish = useMemo(
    () => (data?.predictions ?? []).filter(p => p.direction === 'up'),
    [data],
  )
  const bearish = useMemo(
    () => (data?.predictions ?? []).filter(p => p.direction === 'down'),
    [data],
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-sm text-neutral">
        Loading prediction engine output…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="card-glow p-6 max-w-lg text-center">
          <div className="section-title mb-2">PREDICTIONS UNAVAILABLE</div>
          <p className="font-mono text-xs text-neutral">
            {error ?? 'No data file found.'} Enable the GitHub Action or run{' '}
            <code className="text-gold-400">npm run predict</code> locally.
          </p>
        </div>
      </div>
    )
  }

  const { meta, predictions, history } = data
  const lastUpdated = meta.lastUpdated
    ? new Date(meta.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : 'Not yet generated'

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="card-glow p-4 xl:col-span-2">
          <div className="section-title mb-1">NEXT-SESSION DIRECTION ENGINE</div>
          <p className="font-mono text-[10px] text-neutral mb-3">
            Mon–Fri only, 3 updates during NSE hours (10:00, 12:30, 15:15 IST).
            Target session: <span className="text-gold-400">{meta.targetDate ?? '—'}</span>
            {meta.sessionSlot ? (
              <span className="text-neutral"> · slot: {meta.sessionSlot}</span>
            ) : null}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-[10px]">
            <div>
              <div className="text-neutral">Last run (IST)</div>
              <div className="text-white mt-0.5">{meta.lastUpdatedIST ?? lastUpdated}</div>
            </div>
            <div>
              <div className="text-neutral">NSE session</div>
              <div className="text-white mt-0.5">{meta.nseSession ?? '—'}</div>
            </div>
            <div>
              <div className="text-neutral">Symbols scored</div>
              <div className="text-white mt-0.5">{meta.symbolCount}</div>
            </div>
            <div>
              <div className="text-neutral">Verified calls</div>
              <div className="text-white mt-0.5">{meta.verifiedCount}</div>
            </div>
            <div>
              <div className="text-neutral">Backtest (OOS)</div>
              <div className={`mt-0.5 font-bold ${(meta.backtestAccuracyPct ?? 0) >= 50 ? 'text-gain' : 'text-gold-400'}`}>
                {meta.backtestAccuracyPct != null ? `${meta.backtestAccuracyPct}%` : '—'}
              </div>
              <div className="text-[9px] text-neutral">{meta.backtestDirectionalCount ?? 0} directional calls</div>
            </div>
            <div>
              <div className="text-neutral">Clear-move hit rate</div>
              <div className={`mt-0.5 font-bold ${(meta.backtestClearMarketPct ?? 0) >= 52 ? 'text-gain' : 'text-neutral'}`}>
                {meta.backtestClearMarketPct != null ? `${meta.backtestClearMarketPct}%` : '—'}
              </div>
              <div className="text-[9px] text-neutral">when stock moved ±0.35%</div>
            </div>
            <div>
              <div className="text-neutral">Live hit rate</div>
              <div className={`mt-0.5 font-bold ${(meta.accuracyPct ?? 0) >= 52 ? 'text-gain' : 'text-neutral'}`}>
                {meta.accuracyPct != null ? `${meta.accuracyPct}%` : 'pending'}
              </div>
            </div>
          </div>
        </div>

        <div className="card-glow p-4">
          <div className="section-title mb-2">BULLISH LEAN</div>
          <div className="text-gain font-display text-3xl font-bold">{bullish.length}</div>
          <div className="font-mono text-[10px] text-neutral mt-1">≥55% up probability</div>
        </div>

        <div className="card-glow p-4">
          <div className="section-title mb-2">BEARISH LEAN</div>
          <div className="text-loss font-display text-3xl font-bold">{bearish.length}</div>
          <div className="font-mono text-[10px] text-neutral mt-1">≥55% down probability</div>
        </div>
      </div>

      <div className="card-glow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('live')}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-widest border rounded ${
                tab === 'live' ? 'text-gold-400 border-gold-500' : 'text-neutral border-surface-200'
              }`}
            >
              LIVE PREDICTIONS
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-widest border rounded ${
                tab === 'history' ? 'text-gold-400 border-gold-500' : 'text-neutral border-surface-200'
              }`}
            >
              VERIFICATION HISTORY
            </button>
          </div>
          <span className="font-mono text-[9px] text-neutral hidden md:block">
            {meta.methodology}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-2 px-2 pb-2 border-b border-surface-200 font-mono text-[9px] text-neutral tracking-wider">
          <div className="col-span-3">SYMBOL</div>
          <div className="col-span-2">TARGET DATE</div>
          <div className="col-span-3">PROBABILITY</div>
          <div className="col-span-2">CALL</div>
          <div className="col-span-2 text-right">{tab === 'history' ? 'OUTCOME' : 'PRICE'}</div>
        </div>

        {tab === 'live' ? (
          predictions.length ? predictions.map(p => (
            <PredictionRow key={`${p.symbol}-${p.predictedAt}`} item={p} />
          )) : (
            <div className="py-8 text-center font-mono text-xs text-neutral">
              No live predictions yet. Push the workflow or run the script locally.
            </div>
          )
        ) : (
          history.length ? history.map(h => (
            <PredictionRow key={`${h.symbol}-${h.targetDate}-${h.predictedAt}`} item={h} showOutcome />
          )) : (
            <div className="py-8 text-center font-mono text-xs text-neutral">
              Verified history will appear after the first target session closes.
            </div>
          )
        )}
      </div>

      <div className="font-mono text-[9px] text-neutral px-1">
        {meta.disclaimer} Source: {meta.dataSource}. Schedule: {meta.schedule}.
      </div>
    </div>
  )
}

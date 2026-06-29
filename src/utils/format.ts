export function formatIndian(value: number, decimals = 2): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(2)}L`
  if (value >= 1000) {
    const parts = value.toFixed(decimals).split('.')
    let [int, dec] = parts
    const lastThree = int.slice(-3)
    const rest = int.slice(0, -3)
    const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree
    return dec ? `${formatted}.${dec}` : formatted
  }
  return value.toFixed(decimals)
}

export function formatLargeCrore(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L Cr`
  if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K Cr`
  return `₹${value.toFixed(0)} Cr`
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function formatVolume(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(2)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export function formatCurrency(value: number): string {
  return `₹${formatIndian(value)}`
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export function getChangeClass(value: number): string {
  if (value > 0) return 'gain-text'
  if (value < 0) return 'loss-text'
  return 'text-neutral'
}

export function getChangeBg(value: number): string {
  if (value > 0) return 'bg-gain bg-opacity-10 text-gain'
  if (value < 0) return 'bg-loss bg-opacity-10 text-loss'
  return 'bg-neutral bg-opacity-10 text-neutral'
}
